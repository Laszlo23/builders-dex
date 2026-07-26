/** Genesis Index — the three highest-signal builders we ship first */
export const GENESIS_PROJECT_IDS = ['p1', 'p3', 'p4'] as const;

export type GenesisProjectId = (typeof GENESIS_PROJECT_IDS)[number];

export function isGenesisProject(id: string): boolean {
  return (GENESIS_PROJECT_IDS as readonly string[]).includes(id);
}

export function sortGenesisFirst<T extends { id: string }>(items: T[]): T[] {
  const rank = new Map(GENESIS_PROJECT_IDS.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id)! : 100;
    const rb = rank.has(b.id) ? rank.get(b.id)! : 100;
    return ra - rb;
  });
}

export const GENESIS_INDEX_COPY = {
  eyebrow: 'Genesis Index',
  title: 'Three builders. Live scores. No filler.',
  lead: 'We ranked the catalog by live Builder Score™ and shipped the top three — AI, bridges, creator infra. Read the citations. Then decide.',
};
