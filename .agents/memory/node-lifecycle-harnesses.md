---
name: Node lifecycle harnesses
description: Node test-runner quirks relevant to subprocess cleanup regressions.
---

When spawning an independent Node test runner from inside a test, remove inherited
`NODE_TEST_CONTEXT`. Use no test isolation for a timeout-guarded child that owns
resource handles, so killing it cannot leave a separate test worker running.

**Why:** Node 24 treats an inherited worker context as a recursive runner and can
exit successfully without executing the target file. Default process isolation
also places handles in a grandchild rather than the timeout-controlled process.

**How to apply:** Lifecycle checks must verify actual resource start/close evidence
as well as exit status; do not accept a nonzero exit alone as proof of cleanup.

Node's TAP reporter may display only the top-level AggregateError message, not
its nested errors.

**Why:** Cleanup failures were present in the error object but absent from command
output, obscuring which resources failed.

**How to apply:** Keep underlying errors and include useful summaries in the
aggregate message when command-line diagnostics must identify each failed close.
