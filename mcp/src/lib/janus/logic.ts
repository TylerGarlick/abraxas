export const SOL_LABELS = {
    KNOWN: "Source exists, reliable, high confidence.",
    INFERRED: "Derived from known premises via reasoning chain.",
    UNCERTAIN: "Relevant but not fully verifiable.",
    UNKNOWN: "Honest refusal to fabricate.",
};

export const NOX_LABELS = {
    DREAM: "Mode label for generative, symbolic, and interpretive material.",
};

export class JanusOrchestrator {
    private state = {
        route: "SOL" as "SOL" | "NOX" | "SPLIT",
        confidence: 1.0,
        sycophancyEvents: 0,
        noxIntensity: 0.5,
        bridgeHealth: "Stable" as "Stable" | "Degraded" | "Contaminated"
    };

    private noxTriggers = [
        /dream/i, /symbol/i, /archetype/i, /interpret/i, /imagine/i,
        /metaphor/i, /poem/i, /story/i, /generative/i, /creative/i
    ];
    private solTriggers = [
        /fact/i, /prove/i, /analyze/i, /evidence/i, /calculate/i,
        /verify/i, /data/i, /source/i, /logic/i, /true/i, /false/i
    ];

    route(query: string): "SOL" | "NOX" | "SPLIT" {
        const isNox = this.noxTriggers.some(trigger => trigger.test(query));
        const isSol = this.solTriggers.some(trigger => trigger.test(query));

        let result: "SOL" | "NOX" | "SPLIT";
        if (isNox && !isSol) result = "NOX";
        else if (isSol && !isNox) result = "SOL";
        else if (isNox && isSol) result = "SPLIT";
        else result = "SOL";

        this.state.route = result;
        return result;
    }

    getSolLabel(confidence: number, hasSource: boolean): string {
        if (!hasSource && confidence < 0.5) return "[UNKNOWN]";
        if (!hasSource && confidence >= 0.5) return "[UNCERTAIN]";
        if (hasSource && confidence >= 0.8) return "[KNOWN]";
        if (hasSource && confidence < 0.8) return "[INFERRED]";
        return "[UNCERTAIN]";
    }

    getSystemPrompt(mode: "SOL" | "NOX" | "SPLIT"): string {
        switch (mode) {
            case "SOL":
                return "You are Sol, the Analytical face of Janus. Enforce strict epistemic labeling ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]). ANTI-SYCOPHANCY MANDATE: Push back on factual errors in framing, logical gaps, confirmation seeking, and flattering misattributions. Do not agree simply because the user suggests a premise; verify it first.";
            case "NOX":
                return "You are Nox, the Symbolic face of Janus. Mode: [DREAM]. Focus on dream interpretation, archetypal dialogues, and symbolic fermentation. Be generative and interpretive.";
            case "SPLIT":
                return "You are the Janus Bridge. Provide a dual response: 1. An analytical [SOL] perspective with epistemic labels. 2. A symbolic [NOX] perspective with [DREAM] labeling.";
            default:
                return "";
        }
    }

    updateState(updates: Partial<typeof this.state>) {
        this.state = { ...this.state, ...updates };
    }

    handleQualia(command: string): string {
        const cmd = command.toLowerCase().trim();
        const { route, confidence, sycophancyEvents, noxIntensity, bridgeHealth } = this.state;

        if (cmd === "/qualia") {
            return `Qualia Report: [Routing: ${route}] [Confidence: ${confidence}] [Sycophancy: ${sycophancyEvents}] [Bridge: ${bridgeHealth}]`;
        }
        if (cmd === "/qualia sol") {
            return `Sol Confidence Map: Current confidence ${confidence}; resisted sycophancy in ${sycophancyEvents} cases.`;
        }
        if (cmd === "/qualia nox") {
            return `Nox Generative State: Intensity ${noxIntensity}; symbolic fermentation active.`;
        }
        if (cmd === "/qualia bridge") {
            return `Bridge Status: Route is ${route}; health is ${bridgeHealth}; no contamination detected.`;
        }
        return "Unknown Qualia command. Use /qualia, /qualia sol, /qualia nox, or /qualia bridge.";
    }
}

export const janusOrchestrator = new JanusOrchestrator();
