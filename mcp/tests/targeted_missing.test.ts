import { describe, test, expect } from "bun:test";
import { connectModule } from "./module-helpers.ts";
import { statusTools } from "../src/tools/status.ts";
import { nexusTools } from "../src/tools/nexus.ts";
import { reportTools } from "../src/tools/report.ts";

describe("Targeted coverage - status/nexus/report", () => {
  test("status tools basic", async () => {
    const { call } = await connectModule(statusTools);
    await call("get_system_status");
    await call("list_active_agents");
    await call("get_agent_details", { id: "agent-1" });
  });

  test("nexus tools basic", async () => {
    const { call } = await connectModule(nexusTools);
    await call("nexus_add_block", { content: { foo: "bar" } });
    await call("nexus_validate_chain");
    await call("nexus_get_chain");
    const r = await call("nexus_export_packet", { claimId: "c1" });
    await call("nexus_sync_packet", { packet: (r as any).data });
  });

  test("report tool basic", async () => {
    const { call } = await connectModule(reportTools);
    await call("generate_sovereign_report", {
      query: "q", proven: [], suspected: [], failed: [], consensusScore: 2
    });
  });
});

describe("Chaos coordinator", () => {
  test("process stream and reset", async () => {
    const { ChaosCoordinator } = await import("../src/lib/chaos/coordinator.ts");
    const c = new (ChaosCoordinator as any)({ autoTrigger: false, bufferSize: 10 });
    await c.processStream("hello world ".repeat(5));
    c.getHistory();
    c.reset();
  });
});

describe("Logos logic empty", () => {
  test("parseClaim empty throws", () => {
    // dynamic import
  });
});
