# Executable Traceability Matrix

This matrix is now verified by code instead of being a static claim.

## Real Test File

- `Cook-Testing/2-Black-Box-Testing/traceability-matrix.tests.js`

## What It Checks

- every mapped requirement points to an actual automated test ID
- the automated registry has no duplicate IDs

## Current Executable Mapping

| Requirement | Automated Tests |
|---|---|
| `REQ-AUTH-001` | `TC-BB-001`, `DT-BB-004`, `DT-BB-005` |
| `REQ-AUTH-002` | `TC-BB-004` |
| `REQ-AUTH-003` | `TC-BB-003`, `ST-BB-001` |
| `REQ-AUTH-004` | `ST-BB-003` |
| `REQ-AUTH-005` | `ST-BB-004` |
| `REQ-CHAL-001` | `TC-BB-005`, `DT-BB-001` |
| `REQ-CHAL-002` | `TC-BB-006`, `DT-BB-003` |
| `REQ-CHAL-003` | `ST-BB-007`, `EP-BB-002` |
| `REQ-COMM-001` | `TC-BB-007`, `EP-BB-008` |
| `REQ-COMM-003` | `TC-BB-008`, `EP-BB-009` |
| `REQ-COMM-004` | `TC-BB-009`, `DT-BB-007` |
| `REQ-COMM-005` | `TC-BB-009`, `DT-BB-007` |
| `REQ-COMM-006` | `DT-BB-008` |
| `REQ-COMM-007` | `DT-BB-006`, `EP-BB-010` |
| `REQ-COMM-008` | `EP-BB-010` |
| `REQ-COMM-009` | `TC-BB-010` |
| `REQ-COMM-013` | `TC-BB-007` |
| `REQ-PROF-002` | `TC-BB-011` |

## Example

```js
it("TM-BB-001", "Every mapped requirement points to registered executable tests", async (h) => {
  const allIds = new Set(h.getRegisteredTests().map(test => test.id));
  const missing = requirementMap.filter(row => row.testIds.some(id => !allIds.has(id)));
  h.equal(missing.length, 0, "All traceability references should resolve to real automated tests");
});
```
