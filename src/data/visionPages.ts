/** Vision, Roadmap, Manifest — why Builders DEX exists */

export type WhyPageId = 'vision' | 'roadmap' | 'manifesto';

export const LISTING_CRITERIA = [
  {
    step: '01',
    title: 'Talent Protocol',
    detail:
      'First filter: verifiable builder identity and talent signals — not anonymous ticker accounts.',
  },
  {
    step: '02',
    title: 'Farcaster · Neynar score',
    detail:
      'Social reputation that compounds in public. Neynar score is an early gate before we waste time on vapor.',
  },
  {
    step: '03',
    title: 'Repository & shipping',
    detail:
      'Open commits, releases, and real product progress. If the repo is dead, the listing is dead.',
  },
  {
    step: '04',
    title: 'Reputation before trade',
    detail:
      'Only after identity, social score, and proof of building do we consider curated listing and liquidity.',
  },
] as const;

export const VISION = {
  eyebrow: 'Vision',
  title: 'Scams hurt everyone. We refuse to normalize that.',
  lead: 'Every rug, fake team, and paid shill does not just steal from one wallet — it poisons trust for the entire crypto ecosystem. Builders DEX exists to reverse that.',
  sections: [
    {
      heading: 'The problem we refuse to ignore',
      body: [
        'When a scam wins attention, capital, and mindshare, honest builders pay the price: harder fundraising, colder users, and a culture that rewards noise over work.',
        'We will not build another casino that lists first and asks questions never. Trading is the last step — after proof.',
      ],
    },
    {
      heading: 'Why we started — for ourselves',
      body: [
        'We needed a filter we would trust with our own money and our own time: who is real, who ships, who has a scoreable reputation outside a Telegram group.',
        'Talent Protocol and Farcaster (via Neynar score) are the first criteria. Then we read the repo. Then we weigh reputation. Only then does a token get near a listing.',
      ],
    },
    {
      heading: 'Why we share it with everyone',
      body: [
        'If a standard protects us, it should protect you. Knowledge that separates builders from scammers should not stay private.',
        'Builders DEX is that shared layer: identity → social score → code → reputation → curated trade. Build > Hype — for us, and for anyone who wants the ecosystem to heal.',
      ],
    },
  ],
} as const;

export const ROADMAP = {
  eyebrow: 'Roadmap',
  title: 'From personal filter to public standard.',
  lead: 'We ship the gates we actually use — then open them as infrastructure others can rely on.',
  phases: [
    {
      id: 'now',
      label: 'Now',
      title: 'Proof gates live',
      items: [
        'Talent Protocol + Neynar / Farcaster as first listing criteria',
        'Repo & shipping review before any curated mint',
        'Builder Score™, Passport™, and curated Solana swaps',
        'Feedback + Support Agent so the standard stays honest',
      ],
    },
    {
      id: 'next',
      label: 'Next',
      title: 'Make the filter portable',
      items: [
        'Deeper Talent Protocol + Neynar integrations on Passport™',
        'Automated repo health signals beside human review',
        'Builder API for funds and scouts who refuse pay-to-rank lists',
        'Accelerator seats only for teams that already clear the gates',
      ],
    },
    {
      id: 'later',
      label: 'Later',
      title: 'The network effect of trust',
      items: [
        'Cross-ecosystem reputation that travels with the builder',
        'Council and scout networks that raise the bar together',
        'Default: no listing without identity, score, repo, and reputation',
        'A culture where scams starve — because attention goes to proof',
      ],
    },
  ],
} as const;

export const MANIFEST_PAGE = {
  eyebrow: 'Manifest',
  title: 'We build this so crypto can trust builders again.',
  lead: 'Not a slogan deck. A working agreement: every scam hurts the whole ecosystem — so we filter for people who ship, then we share that knowledge.',
  tenets: [
    {
      title: 'Scams are systemic damage',
      body: 'A rug is not “someone else’s problem.” It burns trust for every honest protocol that comes after.',
    },
    {
      title: 'We start with ourselves',
      body: 'We built the filter we needed: Talent Protocol, Farcaster / Neynar score, then repo, then reputation — before we risk capital or attention.',
    },
    {
      title: 'Knowledge should be public',
      body: 'If we know how to separate builders from noise, locking it away helps no one. The standard is open so the ecosystem can heal together.',
    },
    {
      title: 'Identity before ticker',
      body: 'Talent Protocol first. Real people with verifiable talent signals — not anonymous launch accounts.',
    },
    {
      title: 'Social score is a gate, not a meme',
      body: 'Neynar score on Farcaster is an early signal of accountable presence. Weak score, weak case.',
    },
    {
      title: 'Repo tells the truth',
      body: 'Commits, releases, and product progress beat whitepapers. Dead repos do not get listed.',
    },
    {
      title: 'Reputation before liquidity',
      body: 'Trading is earned. Listing without reputation is how ecosystems get looted.',
    },
    {
      title: 'Build > Hype',
      body: 'We reward people who ship. Every listing should be deserved. Welcome to the proof economy.',
    },
  ],
  closing:
    'We do this first for ourselves. We publish it for everyone. Because the alternative is watching scams keep winning — and that is not a future we will fund.',
} as const;
