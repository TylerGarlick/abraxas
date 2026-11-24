import { describe, expect, test } from "bun:test";
import { connectModule } from "./module-helpers.ts";
import { pefLedgerTools } from "../src/tools/pef-ledger.ts";

describe("pef-ledger tools", () => {
  test("exported tool registration", async () => {
    const { call } = await connectModule(pefLedgerTools);
    const list = (await call("pef_ledger_list", {})).data;
    expect(list).toBeTruthy();
    expect(list.readable).toBe(true);
    const imp = (await call("pef_ledger_import", { ndjson: "" })).data;
    expect(imp).toBeTruthy();
  });
});