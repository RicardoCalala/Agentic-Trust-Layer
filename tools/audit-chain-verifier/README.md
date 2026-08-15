# Rust Audit-Chain Verifier

This optional companion verifies an exported JSON array of Agentic Trust Layer audit events without running the Node.js service. It recomputes the canonical SHA-256 hash for every event and checks each `previousHash` link back to the genesis hash.

It requires the terminal event hash from an **independent trusted checkpoint** (for example, a KMS-backed signed manifest retained outside the export). A self-consistent hash chain alone can detect accidental modification, but it cannot prove that an attacker did not replace or truncate the entire export. The CLI rejects empty exports and limits input to 16 MiB, 100,000 events, and 256 KiB per event.

It verifies unencrypted JSON audit-event exports. It does not decrypt the encrypted audit-store file and it does not replace managed evidence retention, key management, digital signatures, or independent audit procedures.

## Run

Install a current stable Rust toolchain, then run:

```sh
cargo run -- path/to/audit-events.json --expected-terminal-hash <trusted-terminal-sha256>
```

Run the verifier tests with:

```sh
cargo test
```
