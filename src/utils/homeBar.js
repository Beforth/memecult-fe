export const DEFAULT_HOME_BAR = {
  ticker: {
    title: 'Ticker',
    symbol: '$MEMECULT',
    contract_address: '0x7a3f...cult',
  },
  columns: [
    {
      title: 'Social Media',
      links: [
        { label: 'Twitter', path: 'https://twitter.com', external: true, highlight: false },
        { label: 'Telegram', path: 'https://telegram.org', external: true, highlight: false },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '/roadmap', external: false, highlight: false },
        { label: 'Whitepaper', path: '/privacy', external: false, highlight: false },
      ],
    },
    {
      title: 'Contact Us',
      links: [
        { label: 'hello@memecult.lol', path: 'mailto:hello@memecult.lol', external: true, highlight: false },
        { label: 'Join the community', path: '/login', external: false, highlight: true },
      ],
    },
  ],
};

function normalizeLink(link) {
  const path = String(link?.path || '#').trim() || '#';
  const external =
    Boolean(link?.external) || path.startsWith('http') || path.startsWith('mailto:');
  return {
    label: String(link?.label || '').trim(),
    path,
    external,
    highlight: Boolean(link?.highlight),
  };
}

export function cloneHomeBarForEditor(input) {
  const source =
    input && typeof input === 'object' && (input.ticker || input.columns?.length)
      ? input
      : DEFAULT_HOME_BAR;
  return {
    ticker: {
      title: source.ticker?.title || DEFAULT_HOME_BAR.ticker.title,
      symbol: source.ticker?.symbol || DEFAULT_HOME_BAR.ticker.symbol,
      contract_address: source.ticker?.contract_address || DEFAULT_HOME_BAR.ticker.contract_address,
    },
    columns: Array.isArray(source.columns)
      ? source.columns.map((col) => ({
          title: col?.title || '',
          links: Array.isArray(col?.links) ? col.links.map((link) => normalizeLink(link)) : [],
        }))
      : DEFAULT_HOME_BAR.columns.map((col) => ({
          title: col.title,
          links: col.links.map((link) => ({ ...link })),
        })),
  };
}

export function resolveHomeBar(config) {
  return cloneHomeBarForEditor(config?.home_bar);
}

export function isExternalPath(path) {
  return /^https?:\/\//i.test(path) || path.startsWith('mailto:');
}
