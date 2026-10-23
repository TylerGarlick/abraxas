import { defineTool } from "./helpers";
import { auditLedgerAgainstConstitution } from "../lib/constitution_enforcement/logic";
import { z } from "zod";

export const constitutionEnforcementTools = {
  name: "constitution_enforcement",
  register: (server: any, ctx: any) => {
    defineTool(
      server,
      ctx,
      "audit_constitution_adherence",
      "Scan the epistemic ledger for violations of the Abraxas Constitution and log any gaps found.",
      {},
      async () => {
        return auditLedgerAgainstConstitution(ctx);
      },
      { readOnly: false }
    );
  },
};
