import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { janusOrchestrator } from "../lib/janus/logic.ts";

export const janusTools: ToolModule = {
  name: "janus",
  register(server, ctx) {
    defineTool(server, ctx, "janus_route", "Determine whether a query should be handled by Sol (Analytical), Nox (Symbolic), or both (Split).", 
      { query: z.string().min(1) }, 
      ({ query }) => ({
        route: janusOrchestrator.route(query),
        system_prompt: janusOrchestrator.getSystemPrompt(janusOrchestrator.route(query))
      })
    );
    
    defineTool(server, ctx, "janus_label_sol", "Map confidence and source availability to an epistemic label.", 
      { confidence: z.number().min(0).max(1), has_source: z.boolean() }, 
      ({ confidence, has_source }) => ({
        label: janusOrchestrator.getSolLabel(confidence, has_source)
      })
    );

    defineTool(server, ctx, "janus_update_state", "Update the internal state of the Janus orchestration layer (confidence, sycophancy events, nox intensity, bridge health).", 
      { 
        confidence: z.number().min(0).max(1).optional(), 
        sycophancy_events: z.number().int().min(0).optional(), 
        nox_intensity: z.number().min(0).max(1).optional(),
        bridge_health: z.enum(["Stable", "Degraded", "Contaminated"]).optional()
      }, 
      ({ confidence, sycophancy_events, nox_intensity, bridge_health }) => {
        janusOrchestrator.updateState({
          confidence,
          sycophancyEvents: sycophancy_events,
          noxIntensity: nox_intensity,
          bridgeHealth: bridge_health
        });
        return { status: "State updated" };
      }
    );
    
    defineTool(server, ctx, "janus_qualia", "Inspect the internal state of the Janus orchestration layer.", 
      { command: z.string().min(1) }, 
      ({ command }) => ({
        report: janusOrchestrator.handleQualia(command)
      })
    );
  },
};
