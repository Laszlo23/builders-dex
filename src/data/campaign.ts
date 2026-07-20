export type CampaignChannel =
  | 'X / Twitter'
  | 'LinkedIn'
  | 'Farcaster'
  | 'Instagram'
  | 'Telegram';

export type CampaignHook =
  | 'Hook'
  | 'Proof'
  | 'Contrast'
  | 'Product'
  | 'Social proof'
  | 'CTA';

export type CampaignPost = {
  id: string;
  week: number;
  hook: CampaignHook;
  channel: CampaignChannel;
  title: string;
  angle: string;
  copy: string;
  hashtags: string;
  asset: string;
};

export type CampaignAsset = {
  id: string;
  label: string;
  path: string;
  ratio: string;
  use: string;
};

export const CAMPAIGN_TAGLINE = 'The place where Web3 discovers who deserves to win.';

export const CAMPAIGN_PILLARS = [
  {
    id: 'reputation',
    title: 'Reputation first',
    body: 'Proof of Building™ before liquidity. Trust is the product.',
  },
  {
    id: 'index',
    title: 'Builders Index™',
    body: 'A living quality signal for Solana innovation — not another ticker feed.',
  },
  {
    id: 'trade',
    title: 'Trade last',
    body: 'Discovery → DNA™ → Passport™ → then curated swap.',
  },
] as const;

/** Visual kit — pair a different creative with each post angle */
export const CAMPAIGN_ASSETS: CampaignAsset[] = [
  {
    id: 'hook-wide',
    label: 'Wide banner',
    path: '/campaign/hook-wide.jpg',
    ratio: '16:9',
    use: 'X header · LinkedIn · blog',
  },
  {
    id: 'hook-reputation',
    label: 'Reputation square',
    path: '/campaign/hook-reputation.jpg',
    ratio: '1:1',
    use: 'Feed · quote cards',
  },
  {
    id: 'hook-stories',
    label: 'Stories not tickers',
    path: '/campaign/hook-stories.jpg',
    ratio: '1:1',
    use: 'X · Farcaster · LinkedIn',
  },
  {
    id: 'hook-trade-last',
    label: 'Trade is last',
    path: '/campaign/hook-trade-last.jpg',
    ratio: '1:1',
    use: 'Contrast hooks',
  },
  {
    id: 'hook-standard',
    label: 'THE STANDARD story',
    path: '/campaign/hook-standard.jpg',
    ratio: '9:16',
    use: 'Reels · Stories · Shorts',
  },
  {
    id: 'hook-builder100',
    label: 'Builder 100 story',
    path: '/campaign/hook-builder100.jpg',
    ratio: '9:16',
    use: 'IG / TikTok stories',
  },
  {
    id: 'og-wide',
    label: 'Legacy wide',
    path: '/campaign/og-wide.jpg',
    ratio: '16:9',
    use: 'Alt A/B test',
  },
  {
    id: 'square',
    label: 'Legacy square',
    path: '/campaign/square.jpg',
    ratio: '1:1',
    use: 'Alt A/B test',
  },
  {
    id: 'story',
    label: 'Legacy story',
    path: '/campaign/story.jpg',
    ratio: '9:16',
    use: 'Alt A/B test',
  },
];

/**
 * Full hooking series — different creatives + angles so people who skip
 * post 1 can still convert on post 2–12.
 */
export const CAMPAIGN_POSTS: CampaignPost[] = [
  {
    id: 'w1-x-hook',
    week: 1,
    hook: 'Hook',
    channel: 'X / Twitter',
    title: 'Reputation layer',
    angle: 'Category creation — not “another DEX”',
    copy: `Web3 doesn't need another DEX.

It needs a reputation layer.

Builders DEX = Proof of Building™ → discovery → curated trade.

The place where tomorrow's protocols earn trust first.`,
    hashtags: '#BuildersDEX #Solana #Web3',
    asset: '/campaign/hook-reputation.jpg',
  },
  {
    id: 'w1-x-contrast',
    week: 1,
    hook: 'Contrast',
    channel: 'X / Twitter',
    title: 'Trade is the last step',
    angle: 'Flip the usual DEX narrative',
    copy: `Most platforms: dump liquidity, pray for attention.

Builders DEX: verify the builder, then open the book.

TRADE IS THE LAST STEP.`,
    hashtags: '#ProofOfBuilding #BuildersDEX',
    asset: '/campaign/hook-trade-last.jpg',
  },
  {
    id: 'w1-ig-standard',
    week: 1,
    hook: 'Proof',
    channel: 'Instagram',
    title: 'THE STANDARD',
    angle: 'Exclusivity funnel — scarcity as signal',
    copy: `THE STANDARD

4,892 analyzed
127 earned recognition
23 entered the network
2 approved for trading

We don't list everything.
We decide which builders matter.

buildersdex.app`,
    hashtags: '#TheStandard #SolanaBuilders #BuildersDEX',
    asset: '/campaign/hook-standard.jpg',
  },
  {
    id: 'w2-li-infra',
    week: 2,
    hook: 'Product',
    channel: 'LinkedIn',
    title: 'Infrastructure, not hype',
    angle: 'Professional / founder audience',
    copy: `If capital follows conviction, conviction needs proof.

Builders DEX is building the reputation infrastructure of Web3:

• Builders Index™ — living quality of Solana innovation
• Builder Score™ — multi-axis signal (dev, community, innovation)
• Builder DNA™ + Passport™ — identity that compounds
• Builder Intelligence™ — research before you allocate

Not another venue. A standard.`,
    hashtags: '#Web3Infrastructure #Solana #Founders',
    asset: '/campaign/hook-wide.jpg',
  },
  {
    id: 'w2-x-stories',
    week: 2,
    hook: 'Contrast',
    channel: 'X / Twitter',
    title: 'Stories, not tickers',
    angle: 'UX / discovery differentiation',
    copy: `Stop scrolling ticker cards.

Read Builder Stories —
founded year · journey · why selected · Builder Score™

Startup profiles for Solana's next protocols.`,
    hashtags: '#BuilderStories #BuildersDEX',
    asset: '/campaign/hook-stories.jpg',
  },
  {
    id: 'w2-fc-short',
    week: 2,
    hook: 'Hook',
    channel: 'Farcaster',
    title: 'Cast: proof first',
    angle: 'Short native cast — different voice',
    copy: `gm

hot take: liquidity without reputation is noise.

Builders DEX ships Proof of Building™ before the swap UI.

trade is the last step.`,
    hashtags: 'buildersdex solana',
    asset: '/campaign/hook-trade-last.jpg',
  },
  {
    id: 'w3-ig-b100',
    week: 3,
    hook: 'Social proof',
    channel: 'Instagram',
    title: 'The Builder 100',
    angle: 'Hall of Fame / FOMO climb',
    copy: `THE BUILDER 100

Climb the wall.
Earn recognition.
Shape Solana.

Hall of Fame lives on Builders DEX.

buildersdex.app`,
    hashtags: '#Builder100 #Solana #BuildersDEX',
    asset: '/campaign/hook-builder100.jpg',
  },
  {
    id: 'w3-x-index',
    week: 3,
    hook: 'Product',
    channel: 'X / Twitter',
    title: 'Builders Index™',
    angle: 'Market terminal metaphor',
    copy: `Builders Index™ — Solana Innovation Market

Health 92.4
Top 2.6% quality threshold
4,892 tracked · 127 approved

A quality index for builders — not a meme board.`,
    hashtags: '#BuildersIndex #Solana',
    asset: '/campaign/hook-wide.jpg',
  },
  {
    id: 'w3-tg-brief',
    week: 3,
    hook: 'CTA',
    channel: 'Telegram',
    title: 'Community brief',
    angle: 'Invite + one clear action',
    copy: `Builders DEX community brief

We're the reputation layer of Web3.
This week: share one Builder Story you respect — not a chart.

→ Explore curated projects
→ Open the Builder Terminal™
→ Grab the share kit (new creatives every angle)

buildersdex.app`,
    hashtags: '#BuildersDEX',
    asset: '/campaign/hook-reputation.jpg',
  },
  {
    id: 'w4-li-passport',
    week: 4,
    hook: 'Product',
    channel: 'LinkedIn',
    title: 'Passport™',
    angle: 'Identity / career for builders',
    copy: `Your GitHub is not your reputation graph.

Builder Passport™ on Builders DEX compounds:
scout XP · discoveries · contributions · trust signals

Founders get a profile that travels with the product.
Researchers get credit for finding what matters early.`,
    hashtags: '#BuilderPassport #Web3Careers',
    asset: '/campaign/hook-stories.jpg',
  },
  {
    id: 'w4-x-ab',
    week: 4,
    hook: 'Hook',
    channel: 'X / Twitter',
    title: 'A/B: one-liner',
    angle: 'If they skipped long posts — try punchy',
    copy: `Jupiter finds routes.
Builders DEX finds who deserves the route.

Reputation layer of Web3.`,
    hashtags: '#BuildersDEX #Solana',
    asset: '/campaign/hook-reputation.jpg',
  },
  {
    id: 'w4-ig-cta',
    week: 4,
    hook: 'CTA',
    channel: 'Instagram',
    title: 'Open the kit',
    angle: 'Drive to campaign kit / site',
    copy: `Missed the first post? This one's for you.

Different angle. Same standard.

Download the share kit —
9 creatives · 12 ready posts · every channel.

buildersdex.app → Share kit`,
    hashtags: '#BuildersDEX #ShareTheStandard',
    asset: '/campaign/hook-standard.jpg',
  },
];

/** Unruggable meme drop — funny, shareable, DYOR-done energy */
export const MEME_CAMPAIGN_ASSETS: CampaignAsset[] = [
  {
    id: 'meme-banner',
    label: 'Unruggable banner',
    path: '/campaign/meme-banner-wide.jpg',
    ratio: '16:9',
    use: 'X header · LinkedIn · Telegram',
  },
  {
    id: 'meme-unruggable',
    label: 'UNRUGGABLE.',
    path: '/campaign/meme-unruggable.jpg',
    ratio: '1:1',
    use: 'Feed · quote meme',
  },
  {
    id: 'meme-zero',
    label: 'NO MORE ZERO.',
    path: '/campaign/meme-no-more-zero.jpg',
    ratio: '1:1',
    use: 'X · Farcaster',
  },
  {
    id: 'meme-dyor',
    label: 'I outsourced my DYOR',
    path: '/campaign/meme-outsourced-dyor.jpg',
    ratio: '1:1',
    use: 'Feed · Relatable',
  },
  {
    id: 'meme-rug-season',
    label: 'Rug season is over',
    path: '/campaign/meme-rug-season-over.jpg',
    ratio: '9:16',
    use: 'Stories · Reels · Shorts',
  },
  {
    id: 'meme-touch-grass',
    label: 'Touch grass / we touched the repo',
    path: '/campaign/meme-touch-grass.jpg',
    ratio: '1:1',
    use: 'X · IG · Farcaster',
  },
];

export const MEME_CAMPAIGN_POSTS: CampaignPost[] = [
  {
    id: 'meme-unruggable',
    week: 5,
    hook: 'Hook',
    channel: 'X / Twitter',
    title: 'UNRUGGABLE.',
    angle: 'Vault energy — trust before trade',
    copy: `UNRUGGABLE.

We already DYOR'd it.

Proof of Building™ → then you get to trade.

No vibes. No anonymous team. No zero tomorrow.

buildersdex.app`,
    hashtags: '#Unruggable #BuildersDEX #Solana',
    asset: '/campaign/meme-unruggable.jpg',
  },
  {
    id: 'meme-no-zero',
    week: 5,
    hook: 'Contrast',
    channel: 'X / Twitter',
    title: 'NO MORE ZERO.',
    angle: 'Anti-rug / anti-zero-coin punchline',
    copy: `NO MORE ZERO.

Charts lie.
Commits don't.

If it can't show Proof of Building™, it doesn't get the trade button.

That's the whole product.`,
    hashtags: '#NoMoreZero #BuildersDEX',
    asset: '/campaign/meme-no-more-zero.jpg',
  },
  {
    id: 'meme-outsourced',
    week: 5,
    hook: 'Social proof',
    channel: 'Farcaster',
    title: 'I outsourced my DYOR',
    angle: 'Relatable meme — team did the homework',
    copy: `I outsourced my DYOR.

To the Builders DEX team.

GitHub · product · users · community · OSS
checked before liquidity.

Touch grass.
We touched the repo.

buildersdex.app`,
    hashtags: '#DYOR #BuildersDEX #Farcaster',
    asset: '/campaign/meme-outsourced-dyor.jpg',
  },
  {
    id: 'meme-rug-over',
    week: 5,
    hook: 'Hook',
    channel: 'Instagram',
    title: 'Rug season is over',
    angle: 'Story / Reel vertical',
    copy: `RUG SEASON IS OVER.

THIS ONE SHIPS.

Featured on Builders DEX =
someone already did the boring work for you.

Swipe up your trust issues.
Trade last.`,
    hashtags: '#RugSeasonIsOver #BuildersDEX',
    asset: '/campaign/meme-rug-season-over.jpg',
  },
  {
    id: 'meme-touch-grass',
    week: 5,
    hook: 'CTA',
    channel: 'Telegram',
    title: 'Touch grass',
    angle: 'Funny closer + invite',
    copy: `TOUCH GRASS.
WE TOUCHED THE REPO.

Builder Score™ isn't a vibe check —
it's commits, deploys, and real users.

Drop a builder you trust.
We'll tell you if the proof holds.

buildersdex.app`,
    hashtags: '#TouchGrass #BuildersDEX',
    asset: '/campaign/meme-touch-grass.jpg',
  },
  {
    id: 'meme-banner-x',
    week: 5,
    hook: 'Product',
    channel: 'LinkedIn',
    title: 'Unruggable energy',
    angle: 'Professional framing of the meme drop',
    copy: `Unruggable energy.

Builders DEX exists so founders and allocators stop guessing.

We verify building before anyone asks you to buy the token.

Reputation first. Trade last.

That's how you stop losing to noise.`,
    hashtags: '#Web3 #Reputation #BuildersDEX',
    asset: '/campaign/meme-banner-wide.jpg',
  },
];

export const CAMPAIGN_SCHEDULE_NOTE =
  'Post 2–3× per week. Rotate hook → proof → contrast → CTA. Week 5 = Unruggable meme drop — funny doors into the same standard.';
