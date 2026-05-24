/** Accent colors along the timeline (blue → orange → red). */
export const ROADMAP_ACCENTS = ['blue', 'blue', 'red', 'red', 'red', 'red'];

export const DEFAULT_ROADMAP_PHASES = [
  {
    phase: 'PHASE 1',
    period: 'Q2 2024',
    title: 'LAUNCH & FOUNDATION',
    description:
      'Token launch, community building, and core infrastructure. Establishing MemeCult as the premier meme ecosystem.',
    status: 'planned',
    priority: 0,
  },
  {
    phase: 'PHASE 2',
    period: 'Q3 2024',
    title: 'GROWTH & ENGAGEMENT',
    description:
      'Expand community tools, partnerships, and viral campaigns. Scale the cult across platforms.',
    status: 'planned',
    priority: 1,
  },
  {
    phase: 'PHASE 3',
    period: 'Q4 2024',
    title: 'UTILITY & ECOSYSTEM',
    description:
      'Meme Lab upgrades, staking, governance, and cross-chain integrations. Real utility for holders.',
    status: 'active',
    priority: 2,
  },
  {
    phase: 'PHASE 4',
    period: '2025+',
    title: 'DOMINATION & LEGACY',
    description:
      'Market leadership, major exchange listings, and institutional partnerships. MemeCult becomes a household name.',
    status: 'planned',
    priority: 3,
  },
  {
    phase: 'PHASE 5',
    period: '2025+',
    title: 'MEMECULT WORLD',
    description:
      'Metaverse experiences, NFT collections, and immersive cult events. The digital realm expands.',
    status: 'planned',
    priority: 4,
  },
  {
    phase: 'PHASE 6',
    period: '2026+',
    title: 'INFINITE CULTURE',
    description:
      'Perpetual meme generation, AI-powered tools, and a self-sustaining cultural movement. The cult never dies.',
    status: 'planned',
    priority: 5,
  },
];

export function accentForIndex(index) {
  return ROADMAP_ACCENTS[Math.min(index, ROADMAP_ACCENTS.length - 1)] || 'blue';
}

export function normalizeRoadmapItem(item, index) {
  const phaseNum = index + 1;
  return {
    id: item.id ?? `default-${index}`,
    phase: (item.phase || '').trim() || `PHASE ${phaseNum}`,
    period: (item.period || '').trim(),
    title: item.title || 'Untitled',
    description: item.description || '',
    image: item.image || '',
    status: item.status || 'planned',
    accent: accentForIndex(index),
    side: index % 2 === 0 ? 'left' : 'right',
  };
}

export function resolveRoadmapPhases(apiRows) {
  const active = (Array.isArray(apiRows) ? apiRows : []).filter((row) => row.is_active !== false);
  const source = active.length ? active : DEFAULT_ROADMAP_PHASES;
  return source.map((item, index) => normalizeRoadmapItem(item, index));
}
