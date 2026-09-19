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
    updated: '2026-09-19',
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
          'Digital assets are volatile. Smart contracts, bridges, and third-party routers (including Jupiter) may fail. Use at your own risk. HoodStreet, CCFF00, Cubes, and Robinhood Chain surfaces are unaffiliated with Robinhood Markets. NFA.',
        ],
      },
      {
        heading: '4. Simulations',
        paragraphs: [
          'Earn stake/LP, Investor Mode fund rails, and DAO votes are labeled as simulations or work-in-progress unless a page states a live contract. Do not treat preview balances as on-chain assets.',
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updated: '2026-09-19',
    sections: [
      {
        heading: 'Data we process',
        paragraphs: [
          'Wallet addresses you connect, profile fields you edit (name, bio, social links), and project submissions you send for review. Scout referral codes in the URL (?ref=) may be stored locally so shares stay attributed on this device.',
          'We do not custody your private keys. On-chain activity is public by nature.',
        ],
      },
      {
        heading: 'Cookies & analytics',
        paragraphs: [
          'Essential cookies and localStorage may be used for session UX, first discovery, Earn tasks, and referral. Optional analytics, if enabled, are used to improve product quality.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Privacy requests: contact@buildingcultureid.space'],
      },
    ],
  },
  imprint: {
    id: 'imprint',
    title: 'Imprint',
    updated: '2026-09-19',
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
    updated: '2026-09-19',
    sections: [
      {
        heading: 'Reach us',
        paragraphs: [
          'Product help: open Support in the app (Support Agent) or Feedback for bugs and ideas.',
          'General: hello@buildingcultureid.space',
          'Listings & launchpad: apply@buildingcultureid.space',
          'Press: press@buildingcultureid.space',
          'Vienna · Austria · Worldwide',
        ],
      },
    ],
  },
  faq: {
    id: 'faq',
    title: 'FAQ',
    updated: '2026-09-19',
    sections: [
      {
        heading: 'I just landed. What do I click?',
        paragraphs: [
          'Use Your First Discovery on the homepage, then Terminal™, then the Site guide. Trade is last. You do not need a wallet to read Builder Stories, Radar, or the blog.',
        ],
      },
      {
        heading: 'Why not just use Jupiter?',
        paragraphs: [
          'Because every project on Builders DEX has a verified reputation history. Jupiter routes swaps; we route trust. Trade is the last step — and many catalog names are not allowlisted yet on purpose.',
        ],
      },
      {
        heading: 'Do I need a wallet?',
        paragraphs: [
          'No for reading. Yes for Passport mint, allowlisted Solana swaps, Hood ETH actions, and saving some Earn progress across devices. Guest Researcher still works for a local profile.',
        ],
      },
      {
        heading: 'What is Builder Score™?',
        paragraphs: [
          'A GitHub-cited quality signal for catalog projects — not a price target and not Talent Protocol. Live numbers overlay the catalog when the score API is up; otherwise you see the last cited snapshot. We do not invent ranks.',
        ],
      },
      {
        heading: 'How do I get listed?',
        paragraphs: [
          'Submit via Passport™ or Apply / Accelerator with hackathon-grade detail: demo, repo, socials, Proof of Building™. Review does not guarantee a trade button.',
        ],
      },
      {
        heading: 'What is Builder Passport™?',
        paragraphs: [
          'A portable reputation record for founders and scouts — projects, trust, OSS, and linked socials. Mint is optional and network-gated. You can edit a local profile first.',
        ],
      },
      {
        heading: 'HoodStreet vs Trade — which chain am I on?',
        paragraphs: [
          'Trade is curated Solana. HoodStreet, CCFF00 Wallet, and Cubes Live are Robinhood Chain (4663). $AURA Live is Base. The honest hop page explains gas-first arrival. Not affiliated with Robinhood Markets. NFA.',
        ],
      },
      {
        heading: 'Are Earn, Investor Mode, and DAO live on-chain?',
        paragraphs: [
          'Stake/LP, fund rails, and DAO votes are simulations until a page names a live contract. Growth tasks and the daily spin on Earn already save on this profile. Investor Mode filters real catalog scores. Builder Stories are catalog briefs until we publish recorded episodes.',
        ],
      },
      {
        heading: 'How do scout referrals work?',
        paragraphs: [
          'Share kit and meme posts open X with your scout link already in the compose URL (?ref=). We store inbound refs locally. That credits discovery — it does not bypass verification.',
        ],
      },
    ],
  },
  mission: {
    id: 'mission',
    title: 'Mission',
    updated: '2026-09-19',
    sections: [
      {
        heading: 'What we build',
        paragraphs: [
          'The place where Web3 discovers who deserves to win: Proof of Building™ → Scout Network → Reputation Market → Curated Trading.',
          'Every scam hurts the whole crypto ecosystem. We start with Talent Protocol and Farcaster / Neynar score, then repos and reputation — before any listing.',
          'Solana is the reputation and swap lane. Base is canonical AURA. Robinhood Chain is HoodStreet neon we actually use — not a banner farm. Full story: Vision, Roadmap, and Manifest in the footer.',
        ],
      },
      {
        heading: 'What we will not do',
        paragraphs: [
          'We will not invent builder metrics, hide rejected projects, or dress a simulation as a live vault. Unfinished rooms stay visible with a still-working-on-this label.',
        ],
      },
    ],
  },
  story: {
    id: 'story',
    title: 'Our story',
    updated: '2026-09-19',
    sections: [
      {
        heading: 'From Building Culture',
        paragraphs: [
          'Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation and unlock access together. Vienna roots. Worldwide use.',
          'Builders DEX extends that proof-first culture into a discovery OS: catalog stories, Terminal™, Passport™, then curated Solana trading — plus an honest Hood lane for CCFF00 and Cubes.',
          'We ship what communities can actually use. Team: Laszlo Bihary (product), Reinhard Stix, Roman Horvath. Read Vision if you want the why; read the blog if you want the how.',
        ],
      },
    ],
  },
  guide: {
    id: 'guide',
    title: 'Site guide',
    updated: '2026-09-19',
    sections: [
      {
        heading: 'Start here (no wallet)',
        paragraphs: [
          '1) Homepage → Your First Discovery. 2) Terminal™ for Radar and Scouts. 3) Explore to search stories (add ?q=name in the URL). 4) Blog for longer essays. 5) Site guide — you are here.',
        ],
      },
      {
        heading: 'Product rooms',
        paragraphs: [
          'Trade — curated Solana swaps after allowlist. Explore — Builder Stories. Terminal™ — morning intelligence. Builder Graph™ — who is connected to what. Builder Stories — catalog founder briefs (recorded Netflix episodes still filming). Investor Mode — thesis filters on live scores; fund rails not live. Accelerator / Apply — inspection-gated raises and applications. $AURA Live — Base token board. On Hood — honest hop to 4663. HoodStreet — neon street. CCFF00 Wallet — Square TBA. Cubes Live — on-chain mint phases. Earn — tasks live; stake/LP simulated. Passport™ — reputation profile.',
        ],
      },
      {
        heading: 'Community & legal',
        paragraphs: [
          'Vision, Roadmap, Manifest — why we filter. Mission, Story, Team, FAQ, Feedback, Support. Share kit — one-tap X memes with scout referral. Blog — SEO essays. Terms, Privacy, Imprint, Contact.',
        ],
      },
      {
        heading: 'If a button looks unfinished',
        paragraphs: [
          'You should land on copy that says we are still working on it — never a silent homepage. Unknown URLs do the same. Live catalog, GitHub-cited scores, and trade stay available while we finish the room.',
        ],
      },
    ],
  },
};
