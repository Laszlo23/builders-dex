export type LegalDoc = {
  id: 'terms' | 'privacy' | 'imprint' | 'contact' | 'faq' | 'mission' | 'story' | 'guide';
  title: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const LEGAL_DOCS: Record<LegalDoc['id'], LegalDoc> = {
  terms: {
    id: 'terms',
    title: 'Terms of Use',
    updated: '2026-07-20',
    sections: [
      {
        heading: '1. Service',
        paragraphs: [
          'Builders DEX provides reputation infrastructure and curated trading interfaces. Access may require a self-custodial wallet. You are responsible for your keys, transactions, and tax obligations.',
          'Listings, scores, DNA™, and Proof of Building™ are informational quality signals — not investment advice, endorsements, or guarantees of performance.',
        ],
      },
      {
        heading: '2. Curation & launchpad',
        paragraphs: [
          'Submitting a project for review does not guarantee listing or trading. Approval is earned through verification. Rejected projects may be shown for transparency.',
        ],
      },
      {
        heading: '3. Risks',
        paragraphs: [
          'Digital assets are volatile. Smart contracts, bridges, and third-party routers (including Jupiter) may fail. Use at your own risk.',
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'Data we process',
        paragraphs: [
          'Wallet addresses you connect, profile fields you edit (name, bio, social links), and project submissions you send for review.',
          'We do not custody your private keys. On-chain activity is public by nature.',
        ],
      },
      {
        heading: 'Cookies & analytics',
        paragraphs: [
          'Essential cookies may be used for session UX. Optional analytics, if enabled, are used to improve product quality.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Privacy requests: contact@buildersdex.app'],
      },
    ],
  },
  imprint: {
    id: 'imprint',
    title: 'Imprint',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'Operator',
        paragraphs: [
          'Builders DEX — operated in association with Building Culture.',
          'Vienna · Austria · Worldwide',
        ],
      },
      {
        heading: 'Team',
        paragraphs: [
          'Product: Laszlo Bihary · Real estate: Reinhard Stix · Accounting: Roman Horvath',
          'Team page: https://app.buildingcultureid.space/team',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'Reach us',
        paragraphs: [
          'Product help: open Support in the app (Support Agent) or Feedback for bugs and ideas.',
          'General: hello@buildersdex.app',
          'Listings & launchpad: apply@buildersdex.app',
          'Press: press@buildersdex.app',
          'Vienna · Austria · Worldwide',
        ],
      },
    ],
  },
  faq: {
    id: 'faq',
    title: 'FAQ',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'Why not just use Jupiter?',
        paragraphs: [
          'Because every project on Builders DEX has a verified reputation history. Jupiter routes swaps; we route trust. Trade is the last step.',
        ],
      },
      {
        heading: 'How do I get listed?',
        paragraphs: [
          'Submit via Passport™ or Launchpad with hackathon-grade detail. We verify Proof of Building™ before curation.',
        ],
      },
      {
        heading: 'What is Builder Passport™?',
        paragraphs: [
          'A portable reputation record for founders and scouts — projects, trust, OSS, and linked socials.',
        ],
      },
    ],
  },
  mission: {
    id: 'mission',
    title: 'Mission',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'What we build',
        paragraphs: [
          'The place where Web3 discovers who deserves to win: Proof of Building™ → Scout Network → Reputation Market → Curated Trading.',
          'Every scam hurts the whole crypto ecosystem. We start with Talent Protocol and Farcaster / Neynar score, then repos and reputation — before any listing.',
          'Full story: Vision, Roadmap, and Manifest pages in the app.',
        ],
      },
    ],
  },
  story: {
    id: 'story',
    title: 'Our story',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'From Building Culture',
        paragraphs: [
          'Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation and unlock access together.',
          'Builders DEX extends that proof-first culture into curated Solana trading — shipping what communities can actually use.',
        ],
      },
    ],
  },
  guide: {
    id: 'guide',
    title: 'Site guide',
    updated: '2026-07-20',
    sections: [
      {
        heading: 'Where to go',
        paragraphs: [
          'Trade — curated swaps. Explore — Builder Stories. Terminal™ — Radar, Scouts, Arena. Launchpad — raises & applications. Passport™ — your editable reputation. Blog — essays & SEO research.',
          'Why we build: Vision, Roadmap, Manifest. Legal: Terms, Privacy, Imprint, Contact. Community: Mission, Story, Team, FAQ.',
        ],
      },
    ],
  },
};
