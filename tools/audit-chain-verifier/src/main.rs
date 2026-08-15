use serde_json::{Map, Value};
use sha2::{Digest, Sha256};
use std::{env, fs, process};

const GENESIS_HASH: &str = "0000000000000000000000000000000000000000000000000000000000000000";
const MAX_INPUT_BYTES: u64 = 16 * 1024 * 1024;
const MAX_EVENTS: usize = 100_000;
const MAX_EVENT_BYTES: usize = 256 * 1024;

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

fn verify(events: &[Value], expected_terminal_hash: &str) -> Result<(), String> {
    if events.is_empty() {
        return Err("Evidence export must contain at least one event.".into());
    }
    if events.len() > MAX_EVENTS {
        return Err(format!("Evidence export exceeds the {MAX_EVENTS} event limit."));
    }
    for (index, event) in events.iter().enumerate() {
        if serde_json::to_vec(event).map_err(|_| format!("Event {index} cannot be serialized."))?.len() > MAX_EVENT_BYTES {
            return Err(format!("Event {index} exceeds the {MAX_EVENT_BYTES} byte limit."));
        }
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
    let terminal_hash = events.last().and_then(|event| event.get("hash")).and_then(Value::as_str).ok_or_else(|| "Last event has no hash.".to_string())?;
    if terminal_hash != expected_terminal_hash {
        return Err("Evidence export does not match the externally supplied terminal hash.".into());
    }
    Ok(())
}

fn main() {
    let mut args = env::args().skip(1);
    let path = args.next().unwrap_or_else(|| {
        eprintln!("Usage: agentic-trust-audit-verifier <audit-events.json> --expected-terminal-hash <sha256>");
        process::exit(2);
    });
    let flag = args.next();
    let expected_terminal_hash = args.next();
    if flag.as_deref() != Some("--expected-terminal-hash") || expected_terminal_hash.as_deref().map_or(true, |hash| hash.len() != 64 || !hash.bytes().all(|byte| byte.is_ascii_hexdigit())) || args.next().is_some() {
        eprintln!("Provide a 64-character terminal hash obtained from an independent trusted checkpoint.");
        process::exit(2);
    }
    let metadata = fs::metadata(&path).unwrap_or_else(|error| { eprintln!("Could not inspect {path}: {error}"); process::exit(2); });
    if metadata.len() > MAX_INPUT_BYTES { eprintln!("{path} exceeds the {MAX_INPUT_BYTES} byte limit."); process::exit(2); }
    let input = fs::read_to_string(&path).unwrap_or_else(|error| {
        eprintln!("Could not read {path}: {error}");
        process::exit(2);
    });
    let events: Vec<Value> = serde_json::from_str(&input).unwrap_or_else(|error| {
        eprintln!("{path} is not a JSON event array: {error}");
        process::exit(2);
    });
    match verify(&events, expected_terminal_hash.as_deref().unwrap()) {
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
        assert!(verify(&[first.clone(), second.clone()], second["hash"].as_str().unwrap()).is_ok());
    }

    #[test]
    fn rejects_a_tampered_payload() {
        let mut first = event(GENESIS_HASH);
        first["decision"]["reason"] = Value::String("Tampered".into());
        assert!(verify(&[first], "0".repeat(64).as_str()).is_err());
    }
}
