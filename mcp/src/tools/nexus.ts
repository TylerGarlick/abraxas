import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { SovereignNexus } from "../lib/core/nexus.ts";

const nexus = new SovereignNexus("Genesis Block: Sovereign Brain Activation");

export const nexusTools: ToolModule = {
  name: "nexus",
  register(server, ctx) {
    defineTool(
      server,
      ctx,
      "nexus_add_block",
      "Add a cognitive block to the Sovereign-Nexus ledger.",
      { content: z.any() },
      ({ content }) => {
        const block = nexus.addBlock(content);
        return { status: "block_added", block };
      }
    );

    defineTool(
      server,
      ctx,
      "nexus_validate_chain",
      "Validate the integrity of the Sovereign-Nexus cognitive ledger.",
      {},
      () => {
        const result = nexus.validateChain();
        return result;
      },
      { readOnly: true }
    );

    defineTool(
      server,
      ctx,
      "nexus_get_chain",
      "Retrieve the full Sovereign-Nexus cognitive ledger.",
      {},
      () => {
        return { chain: nexus.getChain() };
      },
      { readOnly: true }
    );
  },
};
