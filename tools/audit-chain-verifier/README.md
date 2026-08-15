# Rust Audit-Chain Verifier

This optional companion verifies an exported JSON array of Agentic Trust Layer audit events without running the Node.js service. It recomputes the canonical SHA-256 hash for every event and checks each `previousHash` link back to the genesis hash.

It verifies unencrypted JSON audit-event exports. It does not decrypt the encrypted audit-store file and it does not replace managed evidence retention, key management, or independent audit procedures.

## Run

Install a current stable Rust toolchain, then run:

```sh
cargo run -- path/to/audit-events.json
```

Run the verifier tests with:

```sh
cargo test
```
