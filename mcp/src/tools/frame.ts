import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";

export const frameTools: ToolModule = {
	name: "frame",
	register(server, ctx) {
		const frames = ctx.store.collection("epistemic/frames");
		defineTool(
			server,
			ctx,
			"frame_set",
			"Set or merge a session frame (persisted).",
			{ content: z.string(), name: z.string().optional() },
			async ({ content, name }) => {
				const frameName = name || "_current";
				await frames.insert({ name: frameName, content, timestamp: new Date().toISOString() });
				return { name: frameName, status: "set", content };
			},
		);
		defineTool(
			server,
			ctx,
			"frame_get",
			"Get the latest session frame (or named frame).",
			{ name: z.string().optional() },
			async ({ name }) => {
				const target = name || "_current";
				const found = await frames.find({ name: target });
				const last = Array.isArray(found) ? found[found.length - 1] : undefined;
				return last ?? { name: target, status: "no frame saved", content: "" };
			},
			{ readOnly: true },
		);
		defineTool(
			server,
			ctx,
			"frame_merge",
			"Merge content into the latest session frame.",
			{ content: z.string(), name: z.string().optional() },
			async ({ content, name }) => {
				const target = name || "_current";
				const found = await frames.find({ name: target });
				const last = Array.isArray(found) ? found[found.length - 1] : undefined;
				const base = last?.content ?? "";
				const merged = base ? `${base}\n${content}` : content;
				await frames.insert({ name: target, content: merged, timestamp: new Date().toISOString() });
				return { name: target, status: "merged", content: merged };
			},
		);
		defineTool(
			server,
			ctx,
			"frame_clear",
			"Clear a named or current session frame.",
			{ name: z.string().optional() },
			async ({ name }) => {
				const target = name || "_current";
				const found = await frames.find({ name: target });
				if (Array.isArray(found)) {
					for (const item of found) {
						if (item?._id) await frames.remove(item._id);
					}
				}
				return { name: target, status: "cleared" };
			},
		);
		defineTool(
			server,
			ctx,
			"frame_list",
			"List available session frame names.",
			{},
			async () => {
				const docs = await frames.find({});
				const names = new Set((Array.isArray(docs) ? docs : []).map((d) => d?.name).filter(Boolean));
				return { frames: [...names] };
			},
			{ readOnly: true },
		);
	},
};