/** Team integrated from Building Culture — https://app.buildingcultureid.space/team */

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  summary: string;
  bio: string;
  location?: string;
  links: { label: string; href: string }[];
  accent?: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'laszlo',
    name: 'Laszlo Bihary',
    role: 'Co-founder & product',
    summary: 'Driving protocol integration and investor-facing product on Base.',
    bio: 'In IT since 1996 — from creative direction and SEO at 8Limes to decentralized products at 4fans. Vienna-based; publishes essays as Leonardo.based on Paragraph and ships proof-first culture on Base so communities can actually use what we build.',
    location: 'Vienna · Austria',
    links: [
      { label: 'Paragraph', href: 'https://paragraph.xyz/@leonardo.based' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/' },
      { label: 'X', href: 'https://x.com/' },
      { label: 'TikTok @nftdad33', href: 'https://www.tiktok.com/@nftdad33' },
    ],
  },
  {
    id: 'reinhard',
    name: 'Reinhard Stix',
    role: 'Co-founder & real estate',
    summary:
      'Real estate development across Vienna and Austrian holiday regions since 1997.',
    bio: 'Since 2013, his own company has implemented projects with total investment costs of €1.3 billion — new construction, comprehensive renovations, and conversions. Primarily residential, plus offices, retail, and data centers.',
    location: 'Vienna · Austria',
    links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/' }],
  },
  {
    id: 'roman',
    name: 'Roman Horvath',
    role: 'Accountant',
    summary: 'Financial reporting and compliance-oriented bookkeeping for the venture.',
    bio: 'Keeps Building Culture and Builders DEX ventures audit-ready — reporting, compliance, and clean books so operators can ship with trust.',
    location: 'Vienna · Austria',
    links: [],
  },
];

export const TEAM_INTRO = {
  eyebrow: 'People',
  title: 'The team building Builders DEX',
  subtitle:
    'Operators across product, physical assets, and reporting — focused on shipping reputation infrastructure communities can actually use. Integrated with Building Culture.',
  sourceUrl: 'https://app.buildingcultureid.space/team',
};
