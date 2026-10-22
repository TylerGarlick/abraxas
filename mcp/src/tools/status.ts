import { z } from "zod";
import { getAgentDetails, getSystemStatus, listActiveAgents } from "../lib/status/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const statusTools:ToolModule={name:"status",register(server,ctx){const url=process.env.ABRAXAS_DASHBOARD_URL;defineTool(server,ctx,"get_system_status","Get CPU/memory usage and gateway health.",{},()=>getSystemStatus(url),{readOnly:true});defineTool(server,ctx,"list_active_agents","List active dashboard agents.",{},()=>listActiveAgents(url),{readOnly:true});defineTool(server,ctx,"get_agent_details","Get dashboard metrics for an agent.",{id:z.string()},a=>getAgentDetails(url,a.id),{readOnly:true});}};
