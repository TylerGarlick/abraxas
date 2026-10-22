import { z } from "zod";
import { generateCivitaiImage, generateHfImage } from "../lib/creative/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const creativeTools:ToolModule={name:"creative",register(server,ctx){
 defineTool(server,ctx,"generate_image","Generate an image using the Hugging Face inference API. Requires HF_TOKEN.",{prompt:z.string(),model:z.string().optional(),width:z.number().int().min(64).max(2048).optional(),height:z.number().int().min(64).max(2048).optional()},({prompt,model,width,height})=>generateHfImage({prompt,model,width,height},process.env.HF_TOKEN??""));
 defineTool(server,ctx,"generate_civitai_image","Generate an image through Civitai's orchestration API. Requires CIVITAI_API_KEY.",{prompt:z.string(),model:z.string().optional(),width:z.number().int().min(64).max(2048).optional(),height:z.number().int().min(64).max(2048).optional(),steps:z.number().int().min(1).max(100).optional()},({prompt,model,width,height,steps})=>generateCivitaiImage({prompt,model,width,height,steps},process.env.CIVITAI_API_KEY??""));
}};
