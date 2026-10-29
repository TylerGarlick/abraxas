// @ts-nocheck
import { z } from "zod";
import { exportPef, updateClaimStatus } from "../lib/core/index.ts";
import { logGap, resolveConsensus } from "../lib/cvp/logic.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const cvpTools: ToolModule = {
	name: "cvp",
	register(server, ctx) {
		const gaps = ctx.store.collection("reasoning/cvp/gaps");
		defineTool(
			server,
			ctx,
			"resolve_consensus",
			"Apply an N-of-M rule to independent result paths.",
			{
				paths: z.array(z.unknown()),
				threshold: z.number().int().min(1).default(3),
			},
			({ paths, threshold }) => resolveConsensus(paths, threshold),
			{ readOnly: true },
		);
		defineTool(
			server,
			ctx,
			"verify_claim_multimodal",
			"Cross-verify a claim using multiple models/architectures; on consensus (N-of-M + diversity) anchors the CMV seal to the claim record and updates its status when claim_id is provided.",
			{
				claim: z.string(),
				claim_id: z.string().optional(),
				paths: z.array(
					z.object({
						result: z.any(),
						architecture: z.string(),
						provider: z.string(),
						confidence: z.number().min(0).max(1).default(0.5),
					}),
				),
				threshold: z.number().int().min(1).default(2),
			},
			async ({ claim, claim_id, paths, threshold }) => {
				const consensus = resolveConsensus(paths, threshold);
				if (consensus.success && claim_id) {
					try {
						await updateClaimStatus(
							ctx.store,
							claim_id,
							"VERIFIED_MULTIMODAL",
							`CMV_SEAL architecture_diversity=${consensus.seal?.architecture_diversity} family_diversity=${consensus.seal?.family_diversity}`,
							"cvp",
						);
					} catch (err) {
						return {
							claim,
							claim_id,
							...consensus,
							claim_status: "VERIFIED_MULTIMODAL_ERROR",
							claim_status_error: String(err),
						};
					}
					// Anchor the CMV seal into the content-addressed Truth-Net,
					// recording per-model verdict provenance alongside the seal.
					let truth_net_hash: string | undefined;
					try {
						const pef = await exportPef(ctx.store, claim_id);
						truth_net_hash = pef.integrity.hash;
						await ctx.store.collection("epistemic/truth-net").upsert({
							_id: truth_net_hash,
							pef,
							cmv_seal: consensus.seal,
							paths: paths.map((p) => ({
								provider: p.provider,
								architecture: p.architecture,
								result: p.result,
								confidence: p.confidence,
							})),
							anchoredAt: new Date().toISOString(),
						});
					} catch (err) {
						// Don't fail the verification just because anchoring failed;
						// surface it in the response for follow-up.
						return {
							claim,
							claim_id,
							...consensus,
							claim_status: "VERIFIED_MULTIMODAL",
							truth_net_error: String(err),
						};
					}
					return {
						claim,
						claim_id,
						...consensus,
						claim_status: "VERIFIED_MULTIMODAL",
						truth_net_hash,
					};
				}
				if (!consensus.success) {
					await logGap(
						`Multimodal verification failed for claim: ${claim}`,
						"medium",
						gaps,
					);
				}
				return { claim, claim_id, ...consensus };
			},
		);
		defineTool(
			server,
			ctx,
			"log_sovereign_gap",
			"Persist a divergence between an output and a constitutional constraint.",
			{ gap_description: z.string(), severity: z.string() },
			({ gap_description, severity }) =>
				logGap(gap_description, severity, gaps),
		);
	},
};
