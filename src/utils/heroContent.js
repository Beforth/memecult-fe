import { normalizeMediaUrl } from './siteMedia';

export const DEFAULT_HERO_CONTENT = {
  title_prefix: 'The first ever',
  title_cursive: 'futarchy',
  title_suffix: 'governed\nmeme coin',
  enter_label: 'Enter the cult',
  enter_path: '/editor',
  desc_1: 'Futardio Cult is a community-driven meme coin, built on futarchy principles.',
  desc_2: 'Unruggable by the Holly book of metaDAO.',

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
    title_prefix: raw?.title_prefix || DEFAULT_HERO_CONTENT.title_prefix,
    title_cursive: raw?.title_cursive || DEFAULT_HERO_CONTENT.title_cursive,
    title_suffix: raw?.title_suffix || DEFAULT_HERO_CONTENT.title_suffix,
    enter_label: raw?.enter_label || DEFAULT_HERO_CONTENT.enter_label,
    enter_path: raw?.enter_path || DEFAULT_HERO_CONTENT.enter_path,
    desc_1: raw?.desc_1 || DEFAULT_HERO_CONTENT.desc_1,
    desc_2: raw?.desc_2 || DEFAULT_HERO_CONTENT.desc_2,

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
