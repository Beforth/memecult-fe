export const DEFAULT_NAV_ITEMS = [
  { label: 'Home', path: '/', external: false },
  { label: 'About', path: '/about', external: false },
  { label: 'Roadmap', path: '/roadmap', external: false },
  {
    label: 'Featured',
    path: '',
    external: false,
    children: [
      { label: 'Meme Lab', path: '/editor', external: false },
      { label: 'Futardio Card', path: '/futardio-card', external: false },
    ],
  },
];

function normalizeNavLink(item) {
  return {
    label: String(item?.label || '').trim(),
    path: String(item?.path || '#').trim() || '#',
    external: Boolean(item?.external),
  };
}

export function cloneNavItemsForEditor(input) {
  const source = Array.isArray(input) && input.length ? input : DEFAULT_NAV_ITEMS;
  return source.map((item) => ({
    label: String(item?.label || ''),
    path: String(item?.path || ''),
    external: Boolean(item?.external),
    children: Array.isArray(item?.children)
      ? item.children.map((child) => ({
          label: String(child?.label || ''),
          path: String(child?.path || ''),
          external: Boolean(child?.external),
        }))
      : [],
  }));
}

export function normalizeNavItems(input) {
  let value = input;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      value = [];
    }
  }
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const link = normalizeNavLink(item);
      const children = Array.isArray(item?.children)
        ? item.children.map(normalizeNavLink).filter((child) => child.label)
        : [];
      return { ...link, children };
    })
    .filter((item) => item.label);
}
