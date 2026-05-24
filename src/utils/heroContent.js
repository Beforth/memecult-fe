import { normalizeMediaUrl } from './siteMedia';

export const DEFAULT_HERO_CONTENT = {
  cards_heading: 'A glimpse of our generated cards',
  cards_subheading: 'We turn ideas into assets.',
  explore_label: 'Explore Features',
  explore_path: '/editor',
  cards: [
    {
      title: 'Vision',
      gradient: 'linear-gradient(160deg, #2b1055 0%, #7597de 55%, #c471ed 100%)',
      image: '',
    },
    {
      title: 'Innovation',
      gradient: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      image: '',
    },
    {
      title: 'Community',
      gradient: 'linear-gradient(160deg, #1a0a00 0%, #4a1c00 45%, #ff6b35 100%)',
      image: '',
    },
  ],
  headline_prefix: 'Building the future of',
  headline_accent: 'decentralized communities',
  description:
    'MemeCult is a next-generation ecosystem where creators, communities, and culture collide. Forge memes, grow your cult, and shape the internet one viral moment at a time.',
};

export function resolveHeroContent(config) {
  const raw = config?.hero_content;
  const cards = Array.isArray(raw?.cards) && raw.cards.length
    ? raw.cards.map((card, index) => ({
        title: card?.title || DEFAULT_HERO_CONTENT.cards[index]?.title || `Card ${index + 1}`,
        gradient: card?.gradient || DEFAULT_HERO_CONTENT.cards[index]?.gradient || '',
        image: normalizeMediaUrl(card?.image || ''),
      }))
    : DEFAULT_HERO_CONTENT.cards.map((card) => ({ ...card, image: '' }));

  return {
    cards_heading: raw?.cards_heading || DEFAULT_HERO_CONTENT.cards_heading,
    cards_subheading: raw?.cards_subheading || DEFAULT_HERO_CONTENT.cards_subheading,
    explore_label: raw?.explore_label || DEFAULT_HERO_CONTENT.explore_label,
    explore_path: raw?.explore_path || DEFAULT_HERO_CONTENT.explore_path,
    cards,
    headline_prefix: raw?.headline_prefix || DEFAULT_HERO_CONTENT.headline_prefix,
    headline_accent: raw?.headline_accent || DEFAULT_HERO_CONTENT.headline_accent,
    description: raw?.description || DEFAULT_HERO_CONTENT.description,
  };
}

export function cardArtStyle(card) {
  if (card?.image) {
    return {
      backgroundImage: `url(${card.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: card?.gradient || 'rgba(40, 60, 120, 0.5)' };
}
