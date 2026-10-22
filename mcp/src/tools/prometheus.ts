import { z } from "zod";
import { profile, recordSignal, setPreference } from "../lib/prometheus/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const prometheusTools:ToolModule={name:"prometheus",register(server,ctx){const col=ctx.store.collection("user/preferences");
 defineTool(server,ctx,"get_profile","Retrieve a user's preference profile and signals.",{user_id:z.string()},({user_id})=>profile(col,user_id),{readOnly:true});
 defineTool(server,ctx,"set_preference","Persist a user preference with a weight.",{key:z.string(),value:z.string(),weight:z.number().min(0).max(1).optional()},({key,value,weight=1})=>setPreference(col,key,value,weight));
 defineTool(server,ctx,"record_signal","Record a signal for preference evolution.",{signal_type:z.string(),payload:z.string()},({signal_type,payload})=>recordSignal(col,signal_type,payload));
}};
