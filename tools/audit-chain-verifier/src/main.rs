use serde_json::{Map, Value};
use sha2::{Digest, Sha256};
use std::{env, fs, process};

const GENESIS_HASH: &str = "0000000000000000000000000000000000000000000000000000000000000000";

fn canonicalize(value: &Value) -> Value {
    match value {
        Value::Array(items) => Value::Array(items.iter().map(canonicalize).collect()),
        Value::Object(object) => {
            let mut ordered = Map::new();
            let mut keys: Vec<_> = object.keys().collect();
            keys.sort();
            for key in keys {
                ordered.insert(key.clone(), canonicalize(&object[key]));
            }
            Value::Object(ordered)
        }
        _ => value.clone(),
    }
}

fn hash_payload(payload: &Value) -> String {
    let encoded = serde_json::to_string(&canonicalize(payload)).expect("canonical JSON must serialize");
    format!("{:x}", Sha256::digest(encoded.as_bytes()))
}

fn verify(events: &[Value]) -> Result<(), String> {
    for (index, event) in events.iter().enumerate() {
        let object = event.as_object().ok_or_else(|| format!("Event {index} must be an object."))?;
        let actual_hash = object.get("hash").and_then(Value::as_str).ok_or_else(|| format!("Event {index} has no hash."))?;
        let previous_hash = object.get("previousHash").and_then(Value::as_str).ok_or_else(|| format!("Event {index} has no previousHash."))?;
        let expected_previous = if index == 0 { GENESIS_HASH } else { events[index - 1].get("hash").and_then(Value::as_str).ok_or_else(|| format!("Event {} has no hash.", index - 1))? };
        if previous_hash != expected_previous {
            return Err(format!("Event {index} points to the wrong previous hash."));
        }
        let mut payload = object.clone();
        payload.remove("hash");
        if actual_hash != hash_payload(&Value::Object(payload)) {
            return Err(format!("Event {index} hash does not match its canonical payload."));
        }
    }
    Ok(())
}

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: agentic-trust-audit-verifier <audit-events.json>");
        process::exit(2);
    });
    let input = fs::read_to_string(&path).unwrap_or_else(|error| {
        eprintln!("Could not read {path}: {error}");
        process::exit(2);
    });
    let events: Vec<Value> = serde_json::from_str(&input).unwrap_or_else(|error| {
        eprintln!("{path} is not a JSON event array: {error}");
        process::exit(2);
    });
    match verify(&events) {
        Ok(()) => println!("Integrity verified: {} event(s).", events.len()),
        Err(error) => {
            eprintln!("Integrity verification failed: {error}");
            process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(previous_hash: &str) -> Value {
        let mut value = serde_json::json!({
            "id": "event-1",
            "kind": "authorization",
            "timestamp": "2026-08-14T00:00:00.000Z",
            "request": { "agentId": "demo", "action": "read", "resource": "knowledge-base" },
            "decision": { "effect": "allow", "reason": "Allowed" },
            "previousHash": previous_hash,
        });
        let hash = hash_payload(&value);
        value.as_object_mut().unwrap().insert("hash".into(), Value::String(hash));
        value
    }

    #[test]
    fn validates_a_canonical_chain() {
        let first = event(GENESIS_HASH);
        let second = event(first["hash"].as_str().unwrap());
        assert!(verify(&[first, second]).is_ok());
    }

    #[test]
    fn rejects_a_tampered_payload() {
        let mut first = event(GENESIS_HASH);
        first["decision"]["reason"] = Value::String("Tampered".into());
        assert!(verify(&[first]).is_err());
    }
}
