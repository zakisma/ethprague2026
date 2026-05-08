# Sourcify BigQuery Dataset — Table and Column Dictionary

Project / dataset:

```text
whaleteam-495709.sourcify_dataset
```

This document describes the Sourcify linked BigQuery dataset visible in our project. It explains what each table stores, what each column means, and how the tables connect to each other.

The goal is to give Data Scientist and AI/ML Engineer a clear view of what data is available before deciding which features, models, or agent workflows to build.

---

## 1. Dataset overview

Available tables:

```text
public_code
public_compiled_contracts
public_compiled_contracts_signatures
public_compiled_contracts_sources
public_contract_deployments
public_contracts
public_signatures
public_sources
public_sourcify_matches
public_verified_contracts
```

High-level meaning:

| Table | Main purpose |
|---|---|
| `public_contract_deployments` | On-chain deployment records: chain, contract address, deployer wallet, tx hash, block number. |
| `public_verified_contracts` | Verification records: links a deployed contract to a compiled contract and stores match quality. |
| `public_compiled_contracts` | Compiler metadata and compilation output: compiler, version, ABI, storage layout, code artifacts. |
| `public_compiled_contracts_sources` | Mapping between a compiled contract and its source files. |
| `public_sources` | Actual source code files. |
| `public_contracts` | Contract bytecode identity: creation/runtime code hashes. |
| `public_code` | Raw bytecode by code hash. |
| `public_signatures` | Human-readable function/event/error signatures and their hashes. |
| `public_compiled_contracts_signatures` | Mapping between compiled contracts and signatures. |
| `public_sourcify_matches` | Sourcify match records with creation/runtime match status. |

---

## 2. Important conventions

### 2.1 `BYTES` values

Many address/hash fields are stored as `BYTES` in BigQuery.

In query output, BigQuery may display raw `BYTES` as base64-like strings, for example:

```text
0gu2uzLdH9uJWRQBKtCNweS71m3y51oCwcqX2ITfcO0=
```

For addresses and transaction hashes, convert them to hex strings:

```sql
LOWER(CONCAT('0x', TO_HEX(address))) AS address
LOWER(CONCAT('0x', TO_HEX(deployer))) AS deployer
LOWER(CONCAT('0x', TO_HEX(transaction_hash))) AS transaction_hash
```

For general hashes, use:

```sql
TO_HEX(code_hash) AS code_hash_hex
TO_HEX(source_hash) AS source_hash_hex
TO_HEX(signature_hash_32) AS signature_hash_32
```

### 2.2 `created_at` and `updated_at`

`created_at` and `updated_at` usually describe when the row was created or updated in the Sourcify database, not necessarily the exact on-chain timestamp.

For on-chain timing, use:

```text
chain_id
block_number
transaction_hash
transaction_index
```

### 2.3 `datastream_metadata`

Most tables contain `datastream_metadata`.

This is replication / ingestion metadata from the data stream, not core business data.

Typical structure:

```text
STRUCT<
  uuid STRING,
  source_timestamp INT64,
  change_sequence_number STRING,
  change_type STRING,
  sort_keys ARRAY<STRING>
>
```

In `public_sourcify_matches`, it is smaller:

```text
STRUCT<uuid STRING, source_timestamp INT64>
```

For the MVP, we normally do not use this field.

### 2.4 Nullable columns

All visible columns are nullable in the live BigQuery schema. Any pipeline should handle `NULL` values.

---

## 3. Main table relationships

### 3.1 Wallet / deployer to verified contract metadata

Main chain:

```text
public_contract_deployments.deployer
    ↓
public_contract_deployments.id
    ↓
public_verified_contracts.deployment_id
    ↓
public_verified_contracts.compilation_id
    ↓
public_compiled_contracts.id
```

This allows us to answer:

```text
Given a developer wallet, which verified contracts did it deploy, on which chains, and with what compiler/source metadata?
```

SQL pattern:

```sql
FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
JOIN `whaleteam-495709.sourcify_dataset.public_verified_contracts` vc
  ON vc.deployment_id = cd.id
JOIN `whaleteam-495709.sourcify_dataset.public_compiled_contracts` cc
  ON vc.compilation_id = cc.id
```

### 3.2 Compilation to source code

```text
public_compiled_contracts.id
    ↓
public_compiled_contracts_sources.compilation_id
    ↓
public_compiled_contracts_sources.source_hash
    ↓
public_sources.source_hash
```

This allows us to get the actual Solidity/Vyper source files used for a verified contract.

### 3.3 Contract deployment to bytecode

```text
public_contract_deployments.contract_id
    ↓
public_contracts.id
    ↓
public_contracts.creation_code_hash / runtime_code_hash
    ↓
public_code.code_hash
```

This allows bytecode-level analysis.

### 3.4 Compilation to signatures

```text
public_compiled_contracts.id
    ↓
public_compiled_contracts_signatures.compilation_id
    ↓
public_compiled_contracts_signatures.signature_hash_32
    ↓
public_signatures.signature_hash_32
```

This allows us to list function/event/error signatures for a compiled contract.

### 3.5 Verified contracts to Sourcify matches

```text
public_verified_contracts.id
    ↓
public_sourcify_matches.verified_contract_id
```

This gives extra match status records.

---

# 4. Table: `public_contract_deployments`

## What it stores

This table stores on-chain deployment records.

Each row means:

```text
A contract was deployed on a specific chain, at a specific address, by a specific deployer wallet, in a specific transaction/block.
```

This is the most important table for connecting a developer wallet to deployed contracts.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `STRING` | Unique deployment record ID. Used as join key with `public_verified_contracts.deployment_id`. |
| `chain_id` | `INT64` | EVM chain ID where the contract was deployed. Example: `1` = Ethereum mainnet, `8453` = Base, `11155111` = Sepolia. |
| `address` | `BYTES` | Contract address. Convert using `LOWER(CONCAT('0x', TO_HEX(address)))`. |
| `transaction_hash` | `BYTES` | Transaction hash of the deployment transaction. Convert using `LOWER(CONCAT('0x', TO_HEX(transaction_hash)))`. |
| `block_number` | `STRING` | Block number where the deployment transaction happened. Stored as string in this BigQuery schema. |
| `transaction_index` | `STRING` | Position of the deployment transaction inside the block. Stored as string. |
| `deployer` | `BYTES` | Wallet address that deployed the contract. This is the key field for wallet analysis. Convert using `LOWER(CONCAT('0x', TO_HEX(deployer)))`. |
| `contract_id` | `STRING` | Foreign key to `public_contracts.id`. Connects deployment to bytecode identity. |
| `created_at` | `TIMESTAMP` | When this deployment record was created in Sourcify DB. |
| `updated_at` | `TIMESTAMP` | When this deployment record was last updated in Sourcify DB. |
| `created_by` | `STRING` | Source/system that created the row. In samples often `sourcify`. |
| `updated_by` | `STRING` | Source/system that updated the row. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed for product features. |

## Example use

Find contracts deployed by a wallet:

```sql
DECLARE wallet STRING DEFAULT '0x3ea56dea75abed066bb679e61469fd1f37102139';

SELECT
  chain_id,
  LOWER(CONCAT('0x', TO_HEX(address))) AS contract_address,
  LOWER(CONCAT('0x', TO_HEX(deployer))) AS deployer,
  LOWER(CONCAT('0x', TO_HEX(transaction_hash))) AS transaction_hash,
  block_number,
  transaction_index
FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments`
WHERE deployer = FROM_HEX(REGEXP_REPLACE(LOWER(wallet), r'^0x', ''));
```

---

# 5. Table: `public_verified_contracts`

## What it stores

This table stores Sourcify verification records.

Each row links:

```text
a deployed contract → a compiled contract
```

The table also stores whether creation/runtime bytecode and metadata matched.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `INT64` | Unique verified contract ID. Used by `public_sourcify_matches.verified_contract_id`. |
| `created_at` | `TIMESTAMP` | When this verification record was created. |
| `updated_at` | `TIMESTAMP` | When this verification record was updated. |
| `created_by` | `STRING` | Source/system that created the record. |
| `updated_by` | `STRING` | Source/system that updated the record. |
| `deployment_id` | `STRING` | Foreign key to `public_contract_deployments.id`. Identifies the deployed contract. |
| `compilation_id` | `STRING` | Foreign key to `public_compiled_contracts.id`. Identifies the compiled contract output used for verification. |
| `creation_match` | `BOOL` | Whether the creation bytecode matched. |
| `creation_values` | `JSON` | JSON values inserted/replaced during creation bytecode matching. Examples: constructor arguments, libraries, CBOR auxdata. |
| `creation_transformations` | `JSON` | JSON transformation rules needed to match creation bytecode. Examples: insert constructor args, replace CBOR auxdata. |
| `runtime_match` | `BOOL` | Whether the runtime bytecode matched. Usually more important than creation match for deployed behavior. |
| `runtime_values` | `JSON` | JSON values used during runtime bytecode matching. Examples: immutables, libraries, CBOR auxdata, call protection. |
| `runtime_transformations` | `JSON` | JSON transformation rules needed to match runtime bytecode. |
| `runtime_metadata_match` | `BOOL` | Whether runtime metadata matched. Useful as verification quality signal. |
| `creation_metadata_match` | `BOOL` | Whether creation metadata matched. Useful as verification quality signal. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed for product features. |

## Notes

`creation_values`, `runtime_values`, `creation_transformations`, and `runtime_transformations` are advanced verification evidence. They explain how Sourcify matched compiled bytecode to on-chain bytecode.

Example transformation reasons seen in the data:

```text
constructorArguments
cborAuxdata
immutable
library
callProtection
```

## Example use

Get verification quality:

```sql
SELECT
  id,
  deployment_id,
  compilation_id,
  creation_match,
  runtime_match,
  creation_metadata_match,
  runtime_metadata_match,
  created_at
FROM `whaleteam-495709.sourcify_dataset.public_verified_contracts`
LIMIT 20;
```

---

# 6. Table: `public_compiled_contracts`

## What it stores

This table stores compiler-level and compilation-level metadata.

Each row represents one compiled contract target.

This is the main table for:

```text
compiler/version/language
contract name
ABI
devdoc/userdoc
storage layout
source list
creation/runtime bytecode artifacts
```

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `STRING` | Unique compilation ID. Join key from `public_verified_contracts.compilation_id`. |
| `created_at` | `TIMESTAMP` | When this compilation record was created in Sourcify DB. |
| `updated_at` | `TIMESTAMP` | When this compilation record was updated. |
| `created_by` | `STRING` | Source/system that created the record. |
| `updated_by` | `STRING` | Source/system that updated the record. |
| `compiler` | `STRING` | Compiler name. Example: `solc`. |
| `version` | `STRING` | Compiler version. Example: `0.8.33+commit.64118f21`. |
| `language` | `STRING` | Source language. Example: `solidity`. |
| `name` | `STRING` | Contract name. Example: `ERC20`, `OreSvgGenerator`, `UoreLens`. |
| `fully_qualified_name` | `STRING` | Full contract identifier including source path and contract name. Example: `src/token/UoreLens.sol:UoreLens`. |
| `compiler_settings` | `JSON` | Compiler input settings. Can include `evmVersion`, optimizer settings, remappings, metadata config, `viaIR`, libraries. |
| `compilation_artifacts` | `JSON` | Compilation output artifacts. Can include ABI, docs, source IDs, storage layout, transient storage layout. |
| `creation_code_hash` | `BYTES` | Hash of creation bytecode. Can connect to `public_code.code_hash`. |
| `creation_code_artifacts` | `JSON` | Artifacts for creation bytecode, such as `sourceMap`, `linkReferences`, `cborAuxdata`. |
| `runtime_code_hash` | `BYTES` | Hash of runtime bytecode. Can connect to `public_code.code_hash`. |
| `runtime_code_artifacts` | `JSON` | Artifacts for runtime bytecode, such as `sourceMap`, `linkReferences`, `immutableReferences`, `cborAuxdata`. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed for product features. |
| `additional_input` | `JSON` | Additional compiler input if present. Often `NULL` in samples. |

## Important JSON fields

### `compiler_settings`

Observed examples contain:

```json
{
  "evmVersion": "cancun",
  "metadata": {"bytecodeHash": "ipfs"},
  "optimizer": {"enabled": true, "runs": 50},
  "remappings": [...],
  "viaIR": true
}
```

Useful fields:

| JSON path | Meaning |
|---|---|
| `$.evmVersion` | EVM version used for compilation. |
| `$.optimizer.enabled` | Whether optimizer was enabled. |
| `$.optimizer.runs` | Optimizer runs. |
| `$.metadata.bytecodeHash` | Metadata bytecode hash type, e.g. `ipfs`. |
| `$.remappings` | Import/library remappings. |
| `$.viaIR` | Whether Solidity viaIR pipeline was used. |

### `compilation_artifacts`

Observed examples contain:

```json
{
  "abi": [...],
  "devdoc": {...},
  "sources": {...},
  "storageLayout": {...},
  "transientStorageLayout": {...},
  "userdoc": {...}
}
```

Useful fields:

| JSON path | Meaning |
|---|---|
| `$.abi` | Contract ABI: functions, events, errors, constructors. |
| `$.devdoc` | Developer documentation emitted by compiler. |
| `$.userdoc` | User documentation emitted by compiler. |
| `$.sources` | Source file IDs used in compilation. |
| `$.storageLayout` | Storage variables, slots, offsets, types. Useful for upgradeability/storage risk analysis. |
| `$.transientStorageLayout` | Transient storage layout, available in newer Solidity versions. |

### `creation_code_artifacts` and `runtime_code_artifacts`

Observed fields:

```json
{
  "sourceMap": "...",
  "linkReferences": {},
  "cborAuxdata": {...},
  "immutableReferences": {...}
}
```

`immutableReferences` is runtime-specific.

Useful for advanced bytecode/source mapping, but not required for basic MVP features.

## Example use

Check availability of ABI and storage layout:

```sql
SELECT
  id,
  compiler,
  version,
  language,
  name,
  fully_qualified_name,
  JSON_QUERY(compilation_artifacts, '$.abi') IS NOT NULL AS has_abi,
  JSON_QUERY(compilation_artifacts, '$.storageLayout') IS NOT NULL AS has_storage_layout,
  JSON_QUERY(compilation_artifacts, '$.devdoc') IS NOT NULL AS has_devdoc,
  JSON_QUERY(compilation_artifacts, '$.userdoc') IS NOT NULL AS has_userdoc
FROM `whaleteam-495709.sourcify_dataset.public_compiled_contracts`
LIMIT 20;
```

---

# 7. Table: `public_compiled_contracts_sources`

## What it stores

This table maps a compiled contract to the source files used during compilation.

One compilation can have many source files.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `STRING` | Unique row ID for the mapping record. |
| `compilation_id` | `STRING` | Foreign key to `public_compiled_contracts.id`. |
| `source_hash` | `BYTES` | Foreign key to `public_sources.source_hash`. Displayed as base64 if not converted. |
| `path` | `STRING` | Source path inside the project or dependency tree. Example: `@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol`. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |
| `created_at` | `TIMESTAMP` | When this mapping was created. |

## Example paths from sample data

```text
@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol
@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol
@openzeppelin/contracts/interfaces/IERC165.sol
```

## Example use

Find source files for one compilation:

```sql
DECLARE compilation STRING DEFAULT '8729a501-8e65-4a60-8a5b-ace78ad52ff8';

SELECT
  compilation_id,
  TO_HEX(source_hash) AS source_hash_hex,
  path,
  created_at
FROM `whaleteam-495709.sourcify_dataset.public_compiled_contracts_sources`
WHERE compilation_id = compilation
ORDER BY path;
```

---

# 8. Table: `public_sources`

## What it stores

This table stores actual source code files.

Each row is one source file content identified by source hash.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `source_hash` | `BYTES` | Source file hash. Join key from `public_compiled_contracts_sources.source_hash`. |
| `source_hash_keccak` | `BYTES` | Keccak hash of the source file. Useful as integrity/evidence field. |
| `content` | `STRING` | Actual source code text. Main field for source-level analysis. |
| `created_at` | `TIMESTAMP` | When this source file was added to Sourcify DB. |
| `updated_at` | `TIMESTAMP` | When this source file was updated. |
| `created_by` | `STRING` | Source/system that created the record. Often `sourcify`. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |
| `updated_by` | `STRING` | Source/system that updated the record. |

## What `content` contains

Examples from sample data:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Liaotian is ERC721, Ownable {
    ...
}
```

This can be used to detect technical patterns:

```text
Ownable
onlyOwner
withdraw
mint
burn
pause
blacklist
upgradeTo
delegatecall
selfdestruct
tx.origin
proxy
implementation
admin
```

## Important performance note

`public_sources` can be large. Do not scan it directly without filtering.

Recommended path:

```text
wallet → deployments → verified contracts → compilation_id → source_hash → sources
```

## Example use

Get source files for a specific compilation:

```sql
DECLARE compilation STRING DEFAULT '8729a501-8e65-4a60-8a5b-ace78ad52ff8';

SELECT
  ccs.path,
  TO_HEX(s.source_hash) AS source_hash_hex,
  TO_HEX(s.source_hash_keccak) AS source_hash_keccak_hex,
  SUBSTR(s.content, 1, 1000) AS content_preview,
  s.created_at
FROM `whaleteam-495709.sourcify_dataset.public_compiled_contracts_sources` ccs
JOIN `whaleteam-495709.sourcify_dataset.public_sources` s
  ON s.source_hash = ccs.source_hash
WHERE ccs.compilation_id = compilation
ORDER BY ccs.path;
```

---

# 9. Table: `public_contracts`

## What it stores

This table stores bytecode identity for a contract.

It connects a deployment record to creation/runtime bytecode hashes.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `STRING` | Unique contract bytecode identity ID. Join key from `public_contract_deployments.contract_id`. |
| `creation_code_hash` | `BYTES` | Hash of creation bytecode. Joinable to `public_code.code_hash`. |
| `runtime_code_hash` | `BYTES` | Hash of runtime bytecode. Joinable to `public_code.code_hash`. |
| `created_at` | `TIMESTAMP` | When this contract record was created. |
| `updated_at` | `TIMESTAMP` | When this contract record was updated. |
| `created_by` | `STRING` | Source/system that created the record. |
| `updated_by` | `STRING` | Source/system that updated the record. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |

## Difference from `public_contract_deployments`

`public_contract_deployments` is about:

```text
where and by whom a contract was deployed
```

`public_contracts` is about:

```text
what bytecode identity the deployed contract has
```

Multiple deployments may point to the same `contract_id` if the same bytecode was deployed multiple times.

## Example use

Find runtime bytecode hash for a deployment:

```sql
SELECT
  cd.id AS deployment_id,
  cd.chain_id,
  LOWER(CONCAT('0x', TO_HEX(cd.address))) AS contract_address,
  c.id AS contract_id,
  TO_HEX(c.creation_code_hash) AS creation_code_hash,
  TO_HEX(c.runtime_code_hash) AS runtime_code_hash
FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
JOIN `whaleteam-495709.sourcify_dataset.public_contracts` c
  ON cd.contract_id = c.id
LIMIT 20;
```

---

# 10. Table: `public_code`

## What it stores

This table stores raw bytecode by code hash.

It is used for advanced bytecode-level analysis.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `code_hash` | `BYTES` | Hash of the bytecode. Join key from `public_contracts.creation_code_hash`, `public_contracts.runtime_code_hash`, `public_compiled_contracts.creation_code_hash`, or `public_compiled_contracts.runtime_code_hash`. |
| `code` | `BYTES` | Raw bytecode. Convert to hex with `TO_HEX(code)` if needed. |
| `code_hash_keccak` | `BYTES` | Keccak hash of the bytecode. Useful for EVM-style bytecode identity. |
| `created_at` | `TIMESTAMP` | When this bytecode row was created. |
| `updated_at` | `TIMESTAMP` | When this bytecode row was updated. |
| `created_by` | `STRING` | Source/system that created the record. |
| `updated_by` | `STRING` | Source/system that updated the record. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |

## Example values

Sample data contains bytecode sizes like:

```text
1207 bytes
4133 bytes
13674 bytes
17804 bytes
18092 bytes
```

The bytecode preview starts with typical EVM bytecode:

```text
6080604052...
```

## Example use

Get bytecode preview and size:

```sql
SELECT
  TO_HEX(code_hash) AS code_hash,
  TO_HEX(code_hash_keccak) AS code_hash_keccak,
  BYTE_LENGTH(code) AS code_size_bytes,
  SUBSTR(TO_HEX(code), 1, 100) AS code_preview_hex,
  created_at
FROM `whaleteam-495709.sourcify_dataset.public_code`
LIMIT 20;
```

---

# 11. Table: `public_signatures`

## What it stores

This table stores human-readable signatures and their hashes.

Signatures can represent:

```text
functions
events
errors
```

Examples:

```text
transfer(address,uint256)
approve(address,uint256)
withdraw()
adminCancelDuel(uint256)
DocumentoRegistrado(string,bytes32,uint256,string,address)
```

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `signature_hash_32` | `BYTES` | 32-byte hash of the signature. Join key from `public_compiled_contracts_signatures.signature_hash_32`. |
| `signature_hash_4` | `BYTES` | 4-byte selector where available. In sample rows this was often `NULL`. |
| `signature` | `STRING` | Human-readable signature text. Example: `adminCancelDuel(uint256)`. |
| `created_at` | `TIMESTAMP` | When the signature was added. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |

## Important note

Use `signature_hash_32` for joining with `public_compiled_contracts_signatures`.

`signature_hash_4` can be `NULL`, so do not rely on it as the only key.

## Example use

Search for suspicious function signatures:

```sql
SELECT
  TO_HEX(signature_hash_32) AS signature_hash_32,
  TO_HEX(signature_hash_4) AS signature_hash_4,
  signature,
  created_at
FROM `whaleteam-495709.sourcify_dataset.public_signatures`
WHERE LOWER(signature) LIKE '%withdraw%'
   OR LOWER(signature) LIKE '%blacklist%'
   OR LOWER(signature) LIKE '%upgrade%'
   OR LOWER(signature) LIKE '%admin%'
LIMIT 100;
```

---

# 12. Table: `public_compiled_contracts_signatures`

## What it stores

This table maps compiled contracts to signatures.

Each row means:

```text
This compiled contract contains this function/event/error signature.
```

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `STRING` | Unique row ID. |
| `compilation_id` | `STRING` | Foreign key to `public_compiled_contracts.id`. |
| `signature_hash_32` | `BYTES` | Foreign key to `public_signatures.signature_hash_32`. |
| `signature_type` | `STRING` | Signature category. Observed values include `function` and `error`; events may also appear depending on data. |
| `created_at` | `TIMESTAMP` | When this mapping was created. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Usually not needed. |

## Important live-schema correction

There is no `signature_type_enum` column in this linked BigQuery dataset.

Use only:

```text
signature_type
```

## Example use

List function signatures for a compiled contract:

```sql
DECLARE compilation STRING DEFAULT 'bdfac96c-6f29-4aff-be9c-06ac0983857d';

SELECT
  ccs.compilation_id,
  ccs.signature_type,
  sig.signature,
  TO_HEX(sig.signature_hash_32) AS signature_hash_32,
  TO_HEX(sig.signature_hash_4) AS signature_hash_4
FROM `whaleteam-495709.sourcify_dataset.public_compiled_contracts_signatures` ccs
JOIN `whaleteam-495709.sourcify_dataset.public_signatures` sig
  ON sig.signature_hash_32 = ccs.signature_hash_32
WHERE ccs.compilation_id = compilation
ORDER BY ccs.signature_type, sig.signature;
```

---

# 13. Table: `public_sourcify_matches`

## What it stores

This table stores Sourcify match records.

It is related to `public_verified_contracts`, but its match fields are string-based and describe match status such as `partial`.

## Columns

| Column | Type | Meaning |
|---|---:|---|
| `id` | `INT64` | Unique match record ID. |
| `verified_contract_id` | `INT64` | Foreign key to `public_verified_contracts.id`. |
| `creation_match` | `STRING` | Creation bytecode match status. Sample value: `partial`. Can be `NULL`. |
| `runtime_match` | `STRING` | Runtime bytecode match status. Sample value: `partial`. Can be `NULL`. |
| `created_at` | `TIMESTAMP` | When the match record was created. |
| `metadata` | `JSON` | Additional match metadata. In samples this was usually `NULL`. |
| `updated_at` | `TIMESTAMP` | When the match record was updated. |
| `datastream_metadata` | `STRUCT` | Replication metadata. Smaller structure than most tables: `STRUCT<uuid STRING, source_timestamp INT64>`. |

## Difference from `public_verified_contracts`

`public_verified_contracts` has boolean fields:

```text
creation_match BOOL
runtime_match BOOL
creation_metadata_match BOOL
runtime_metadata_match BOOL
```

`public_sourcify_matches` has string status fields:

```text
creation_match STRING
runtime_match STRING
```

Sample values:

```text
partial
NULL
```

For MVP, `public_verified_contracts` is usually simpler and more directly useful. `public_sourcify_matches` can be used for extra match status/history.

## Example use

```sql
SELECT
  id,
  verified_contract_id,
  creation_match,
  runtime_match,
  created_at,
  updated_at,
  metadata
FROM `whaleteam-495709.sourcify_dataset.public_sourcify_matches`
LIMIT 20;
```

---

# 14. Practical data available for Data Scientist and AI/ML Engineer

This section does not decide final features. It lists what data is available.

## 14.1 Wallet / developer deployment history

Source tables:

```text
public_contract_deployments
public_verified_contracts
public_compiled_contracts
```

Available data:

```text
deployer wallet
contract address
chain_id
transaction_hash
block_number
transaction_index
verified_at
compiler
compiler version
language
contract name
fully qualified contract name
```

Possible derived facts:

```text
number of verified contracts per wallet
number of chains used
number of contract names
number of compiler versions
first/last verified contract date
repeated bytecode / repeated deployments
```

## 14.2 Verification quality

Source table:

```text
public_verified_contracts
```

Available data:

```text
creation_match
runtime_match
creation_metadata_match
runtime_metadata_match
creation transformations
runtime transformations
creation values
runtime values
```

Possible derived facts:

```text
runtime match ratio
creation match ratio
metadata match ratio
contracts with constructor arguments
contracts with immutable values
contracts with library substitutions
contracts with CBOR auxdata transformations
```

## 14.3 Compiler and artifact metadata

Source table:

```text
public_compiled_contracts
```

Available data:

```text
compiler
version
language
contract name
fully qualified name
compiler settings
ABI
userdoc
devdoc
source IDs
storage layout
transient storage layout
creation/runtime code hashes
creation/runtime source maps
link references
immutable references
CBOR auxdata
```

Possible derived facts:

```text
optimizer enabled / disabled
optimizer runs
viaIR usage
EVM version
ABI availability
storage layout availability
documentation availability
number of public/external ABI functions
function names from ABI
storage variable count
```

## 14.4 Source code

Source tables:

```text
public_compiled_contracts_sources
public_sources
```

Available data:

```text
source file paths
actual source code content
source hashes
source created/updated timestamps
```

Possible derived facts:

```text
imports used
OpenZeppelin usage
Ownable usage
onlyOwner usage
upgradeable contracts
proxy-related code
withdraw/mint/burn/pause/blacklist functions
delegatecall/selfdestruct/tx.origin usage
project size by number of source files
```

## 14.5 Bytecode

Source tables:

```text
public_contracts
public_code
```

Available data:

```text
creation bytecode hash
runtime bytecode hash
raw creation/runtime bytecode
bytecode size
keccak bytecode hash
```

Possible derived facts:

```text
clone detection by runtime_code_hash
same bytecode deployed across many chains
bytecode size
minimal proxy patterns
advanced bytecode-level similarity
```

## 14.6 Signatures

Source tables:

```text
public_compiled_contracts_signatures
public_signatures
```

Available data:

```text
function signatures
event signatures
error signatures
signature type
signature hashes
```

Possible derived facts:

```text
has withdraw-like function
has admin-like function
has upgrade-like function
has blacklist-like function
number of functions/events/errors
contract interface complexity
```

---

# 15. Main queries for project usage

## 15.1 Contract evidence by developer wallet

```sql
DECLARE wallet STRING DEFAULT '0x3ea56dea75abed066bb679e61469fd1f37102139';

SELECT
  vc.id AS verified_contract_id,
  vc.created_at AS verified_at,

  cd.id AS deployment_id,
  cd.chain_id,
  LOWER(CONCAT('0x', TO_HEX(cd.address))) AS contract_address,
  LOWER(CONCAT('0x', TO_HEX(cd.deployer))) AS deployer,
  LOWER(CONCAT('0x', TO_HEX(cd.transaction_hash))) AS transaction_hash,
  cd.block_number,
  cd.transaction_index,

  cc.id AS compilation_id,
  cc.compiler,
  cc.version AS compiler_version,
  cc.language,
  cc.name AS contract_name,
  cc.fully_qualified_name,

  vc.creation_match,
  vc.runtime_match,
  vc.creation_metadata_match,
  vc.runtime_metadata_match,

  JSON_QUERY(cc.compilation_artifacts, '$.abi') IS NOT NULL AS abi_available,
  JSON_QUERY(cc.compilation_artifacts, '$.storageLayout') IS NOT NULL AS storage_layout_available,
  JSON_QUERY(cc.compilation_artifacts, '$.devdoc') IS NOT NULL AS devdoc_available,
  JSON_QUERY(cc.compilation_artifacts, '$.userdoc') IS NOT NULL AS userdoc_available

FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
JOIN `whaleteam-495709.sourcify_dataset.public_verified_contracts` vc
  ON vc.deployment_id = cd.id
JOIN `whaleteam-495709.sourcify_dataset.public_compiled_contracts` cc
  ON vc.compilation_id = cc.id
WHERE cd.deployer = FROM_HEX(REGEXP_REPLACE(LOWER(wallet), r'^0x', ''))
ORDER BY vc.created_at DESC;
```

## 15.2 Wallet aggregate profile

```sql
DECLARE wallet STRING DEFAULT '0x3ea56dea75abed066bb679e61469fd1f37102139';

SELECT
  COUNT(*) AS verified_contracts_count,
  COUNT(DISTINCT cd.chain_id) AS chains_count,
  COUNT(DISTINCT cc.name) AS contract_names_count,
  COUNT(DISTINCT cc.version) AS compiler_versions_count,
  MIN(vc.created_at) AS first_verified_at,
  MAX(vc.created_at) AS last_verified_at
FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
JOIN `whaleteam-495709.sourcify_dataset.public_verified_contracts` vc
  ON vc.deployment_id = cd.id
JOIN `whaleteam-495709.sourcify_dataset.public_compiled_contracts` cc
  ON vc.compilation_id = cc.id
WHERE cd.deployer = FROM_HEX(REGEXP_REPLACE(LOWER(wallet), r'^0x', ''));
```

## 15.3 Source files for a wallet

```sql
DECLARE wallet STRING DEFAULT '0x3ea56dea75abed066bb679e61469fd1f37102139';

WITH wallet_compilations AS (
  SELECT DISTINCT
    vc.compilation_id
  FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
  JOIN `whaleteam-495709.sourcify_dataset.public_verified_contracts` vc
    ON vc.deployment_id = cd.id
  WHERE cd.deployer = FROM_HEX(REGEXP_REPLACE(LOWER(wallet), r'^0x', ''))
)
SELECT
  wc.compilation_id,
  ccs.path,
  TO_HEX(s.source_hash) AS source_hash,
  SUBSTR(s.content, 1, 1000) AS content_preview
FROM wallet_compilations wc
JOIN `whaleteam-495709.sourcify_dataset.public_compiled_contracts_sources` ccs
  ON ccs.compilation_id = wc.compilation_id
JOIN `whaleteam-495709.sourcify_dataset.public_sources` s
  ON s.source_hash = ccs.source_hash
ORDER BY wc.compilation_id, ccs.path;
```

## 15.4 Signatures for a wallet

```sql
DECLARE wallet STRING DEFAULT '0x3ea56dea75abed066bb679e61469fd1f37102139';

WITH wallet_compilations AS (
  SELECT DISTINCT
    vc.compilation_id
  FROM `whaleteam-495709.sourcify_dataset.public_contract_deployments` cd
  JOIN `whaleteam-495709.sourcify_dataset.public_verified_contracts` vc
    ON vc.deployment_id = cd.id
  WHERE cd.deployer = FROM_HEX(REGEXP_REPLACE(LOWER(wallet), r'^0x', ''))
)
SELECT
  wc.compilation_id,
  ccsig.signature_type,
  sig.signature,
  TO_HEX(sig.signature_hash_32) AS signature_hash_32,
  TO_HEX(sig.signature_hash_4) AS signature_hash_4
FROM wallet_compilations wc
JOIN `whaleteam-495709.sourcify_dataset.public_compiled_contracts_signatures` ccsig
  ON ccsig.compilation_id = wc.compilation_id
JOIN `whaleteam-495709.sourcify_dataset.public_signatures` sig
  ON sig.signature_hash_32 = ccsig.signature_hash_32
ORDER BY wc.compilation_id, ccsig.signature_type, sig.signature;
```

---

# 16. Short summary for the team

Sourcify BigQuery gives us verified smart contract data.

The most important data path is:

```text
wallet address
  → public_contract_deployments.deployer
  → deployed contract address / chain / tx / block
  → public_verified_contracts
  → verification quality
  → public_compiled_contracts
  → compiler, ABI, docs, storage layout, source metadata
  → public_sources / public_signatures / public_code
  → source-level, signature-level, and bytecode-level signals
```

This means Data Scientist and AI/ML Engineer have access to:

```text
1. Developer wallet deployment history
2. Verified contract history
3. Contract names and compiler versions
4. Verification quality flags
5. ABI and function/event/error signatures
6. Source code
7. Storage layout
8. Bytecode hashes and raw bytecode
9. Deployment chain, block, tx hash, deployer address
```

The dataset does not directly decide whether a developer is trustworthy. It provides raw evidence and structured signals that can be transformed into features, risk scores, explanations, and AI-agent decisions.

