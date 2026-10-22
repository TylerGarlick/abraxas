import { z } from "zod";
import { getSecret, listSecrets, recordSecretAudit } from "../lib/secrets/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";

/** Secret inspection. Values are always masked and every read is audited in `secrets/audit`. */
export const secretsTools: ToolModule = {
  name: "secrets",
  register(server, ctx) {
    defineTool(server, ctx, "secrets_list",
      "List secret-like variable names (environment and workspace .env) with masked values.",
      {}, async () => {
        const secrets = await listSecrets(ctx.config.rootDir);
        await recordSecretAudit(ctx.store, "*", "list");
        return secrets;
      }, { readOnly: true });

    defineTool(server, ctx, "secrets_get",
      "Check whether a secret exists and return its masked value and source. Never returns the full value.",
      { name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/) },
      async ({ name }) => {
        const secret = await getSecret(ctx.config.rootDir, name);
        await recordSecretAudit(ctx.store, name, "read");
        return secret;
      }, { readOnly: true });
  },
};
