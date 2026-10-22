import { z } from "zod";
import { logDream, updateShadow, witnessSymbol } from "../lib/oneironautics/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const oneironauticsTools:ToolModule={name:"oneironautics",register(server,ctx){const col=ctx.store.collection("oneironautics/records");
 defineTool(server,ctx,"log_dream","Store a dream entry with optional tags.",{dream_text:z.string(),tags:z.array(z.string()).optional()},({dream_text,tags})=>logDream(col,dream_text,tags));
 defineTool(server,ctx,"witness_symbol","Record a symbol's valence and manifestation.",{symbol:z.string(),valence:z.string(),manifestation:z.string()},({symbol,valence,manifestation})=>witnessSymbol(col,symbol,valence,manifestation));
 defineTool(server,ctx,"update_shadow_ledger","Record an integrated shadow insight.",{quality:z.string(),insight:z.string()},({quality,insight})=>updateShadow(col,quality,insight));
}};
