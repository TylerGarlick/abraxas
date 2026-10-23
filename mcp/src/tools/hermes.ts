import { z } from "zod";
import { addPosition, consensus, weightRecord } from "../lib/hermes/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const hermesTools:ToolModule={name:"hermes",register(server,ctx){const col=ctx.store.collection("epistemic/consensus");
 defineTool(server,ctx,"add_agent_position","Track an agent's weighted position on a claim.",{agent_id:z.string(),claim:z.string(),weight:z.number().min(0).max(1)},({agent_id,claim,weight})=>addPosition(col,agent_id,claim,weight));
 defineTool(server,ctx,"compute_consensus","Compute weighted agreement for a claim id.",{claim_id:z.string()},({claim_id})=>consensus(col,claim_id),{readOnly:true});
 defineTool(server,ctx,"weight_record","Record an agent's observed accuracy.",{agent_id:z.string(),accuracy:z.number().min(0).max(1)},({agent_id,accuracy})=>weightRecord(col,agent_id,accuracy));
}};
