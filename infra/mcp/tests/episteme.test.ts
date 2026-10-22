import { expect, test } from "bun:test";
import { auditSessionLogs, traceClaim } from "../src/lib/episteme/index.ts";
test("Episteme traces provenance and flags unsupported certainty", () => {
  expect(traceClaim("moon", [{ claim: "moon rocks", kind: "retrieved" }]).status).toBe("traced");
  expect(auditSessionLogs("This is certainly true").findings).toBe(1);
});
