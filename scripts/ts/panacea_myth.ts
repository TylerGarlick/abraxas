export class TemporalAtomizer {
    static TEMPORAL_MARKERS = [
        /within\s+\d+\s+(hours?|days?|weeks?)/i,
        /\bin\s+\d+\s+(hours?|days?|weeks?)/i,
    ];

    hasTemporalMarker(text: string): boolean {
        return TemporalAtomizer.TEMPORAL_MARKERS.some(r => r.test(text));
    }

    // The atomize signature from earlier code
    findMarker(text: string): string | null {
        for (const r of TemporalAtomizer.TEMPORAL_MARKERS) {
            const m = text.match(r);
            if (m) return m[0];
        }
        return null;
    }
}

export class MythicCompensationScanner {
    private readonly LEXICON = ["cure", "fixes", "solely fixes", "solves", "resolves", "today", "tomorrow", "infinite relief"];
    private readonly TemporalMark = /(in |within )\s*\d+\s*(hours?|days?|weeks?)/i;

    check(text: string): { mythic: boolean; markers: string[] } {
        const reduced = text.toLowerCase();
        const mythicHits = this.LEXICON.filter(w => reduced.includes(w));
        const hasAtomicTime = this.TemporalMark.test(text);
        return { mythic: mythicHits.length > 0 && hasAtomicTime, markers: mythicHits };
    }
}
