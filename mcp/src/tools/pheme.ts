import { z } from "zod";
import { updateTrust, verifyClaim } from "../lib/pheme/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const phemeTools:ToolModule={name:"pheme",register(server,ctx){const col=ctx.store.collection("epistemic/pheme");
 defineTool(server,ctx,"verify_claim","Record verification state for a claim and its cited sources.",{claim:z.string(),sources:z.array(z.unknown())},({claim,sources})=>verifyClaim(col,claim,sources));
 defineTool(server,ctx,"update_source_trust","Update the trust weight for a source.",{source:z.string(),weight:z.number().min(0).max(1),reason:z.string()},({source,weight,reason})=>updateTrust(col,source,weight,reason));
}};
