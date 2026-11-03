export interface TeamRole {
    name: string;
    skills: string[];
}

export function parseTeamMatrix(markdown: string): TeamRole[] {
    const roles: TeamRole[] = [];
    const byKey = new Map<string, TeamRole>();

    const looseKey = (name: string) => name.split(/[-/]/)[0].trim().toLowerCase();
    const pushUnique = (name: string, skills: string[] = []) => {
        const key = looseKey(name);
        if (!byKey.has(key)) {
            const role = { name, skills: [...skills] };
            byKey.set(key, role);
            roles.push(role);
        } else {
            byKey.get(key)!.skills.push(...skills);
        }
    };

    for (const rawLine of markdown.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line.startsWith('- ')) continue;

        const perColon = line.match(/^\- \*\*([^*]+)\*\*\s*[:—-]\s*(.*)$/);
        if (perColon) {
            const name = perColon[1].trim();
            const desc = perColon[2].trim();
            const possibleSkills = desc.split(/[,\s]+/).filter((s) => /^[a-z][a-z0-9-]*$/i.test(s) && (s.includes('-') || s.includes('/')));
            pushUnique(name, possibleSkills);
            continue;
        }

        const arrow = line.match(/^\- \*\*([^*]+)\*\*\s*->\s*(.*)$/);
        if (arrow) {
            const name = arrow[1].trim();
            const skillString = arrow[2].replace(/`/g, '');
            const skills = skillString.split(/[,;.]/).map((s) => s.trim()).filter(Boolean);
            pushUnique(name, skills);
            continue;
        }

        const perArrow = line.match(/^\-\s*([^*]+?)\s*->\s*(.*)$/);
        if (perArrow) {
            const name = perArrow[1].replace(/\*\*/g, '').trim();
            const skillString = perArrow[2].replace(/`/g, '');
            const skills = skillString.split(/[,;.]/).map((s) => s.trim()).filter(Boolean);
            pushUnique(name, skills);
        }
    }

    return roles;
}
