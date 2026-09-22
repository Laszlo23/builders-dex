export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  readingMinutes: number;
  body: string[];
  coverImage: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'build-bankr-hood',
    title: '$BUILD is a Bankr Doppler mint on Hood — address live, lock not',
    excerpt:
      'The Builders DEX token on Robinhood Chain 4663 is 0x7bf8…aba3, launched via Bankr. We publish the receipt. We do not swap it, invent a pair, or promise an APR.',
    date: '2026-09-22',
    author: 'Builders DEX',
    tags: ['$BUILD', 'Robinhood Chain', 'Bankr', 'NFA'],
    readingMinutes: 3,
    coverImage: '/og/route-build.webp',
    body: [
      '$BUILD now has a published address on Robinhood Chain 4663: 0x7bf8a47DAf2c0032fE6FcDAB4dd2DF37b5Eeaba3. Blockscout names it Build / BUILD, 18 decimals, DopplerERC20V1 clone. That is the Bankr rail — not a Pools.trade Crowd Launch, not a wrap of the CCFF00 Square, not a Solana mint.',
      'What we ship on /build: the checksum, the deploy tx, outbound Bankr trade + token pages, Blockscout, DexScreener, and add-to-wallet. What we do not ship: an in-app Bankr or x402 router, a fake BUILD/USDG book, an APR, or DAO stake that moves this token. DexScreener has no pair yet. LP lock is unpublished.',
      'The Square loop overlay (activation registry, stall vault, fee splitter) is already on 4663. Fee dust stays 0 until volume hits the splitter. Parked Squares are not a buy-gate for $BUILD. DAO $BUILD remains a labeled simulation. NFA. Not affiliated with Bankr or Robinhood Markets.',
    ],
  },
  {
    slug: 'ccff00-square-loop',
    title: 'Activate, park, stall: the CCFF00 Square loop (and why it is not an APR farm)',
    excerpt:
      '$BUILD on Robinhood Chain is not live until an address and LP lock are published. Until then the Square loop is a preview: lights on, park on the street, take a stall on Aura Share — fee dust, not promised yield.',
    date: '2026-09-20',
    author: 'Builders DEX',
    tags: ['CCFF00', 'Robinhood Chain', '$BUILD', 'Earn'],
    readingMinutes: 6,
    coverImage: '/og/blog-ccff00-square-loop.webp',
    body: [
      'Builders DEX will launch a token on Robinhood Chain. That token is $BUILD, not HoodStreet’s $CCFF00. $CCFF00 stays inside identical Squares until HoodStreet enables trading. We do not wrap the NFT and we do not invent a mint address.',
      'The game piece is the Square you already have. Dormant is unlit. Activate turns the lights on — identity, not a token-buy gate. Park puts the Square on the street. From there you either hold a BUILD/USDG LP NFT in the token-bound account when $BUILD is live, or you take a stall on an inspected catalog launch.',
      'Classic liquidity mining with fat APRs does not survive. Mercenary LPs farm, dump, and leave. Safe LM is the boring kind: a locked Uniswap v4 position whose only return is swap fees, sitting in the Square wallet. If volume is zero, fees this week are zero. That is the product, not a bug.',
      'The first stall is Aura Share on Hood — the inspected raise you can already buy as the Square. Park, take the stall, then the TBA pays ETH and holds the certificate. Allocation and the share NFT live in the NFT. Transfer the Square, the stall receipts move with it.',
      'Launch door, when we actually launch: Pools.trade Crowd Launch so LP locks on Uniswap v4, pair BUILD/USDG (or WETH if the pad forces ETH). Clanker is the backup if we want the creator-fee remainder piped into parked Squares. We will not use a 900-deploys-an-hour mill, a bundler, or a volume bot.',
      'Until the activation registry, stall vault, fee splitter, and $BUILD address are published on /build, Earn and HoodStreet show the loop as a preview. DAO $BUILD stake stays a labeled simulation. Do not treat localStorage as on-chain assets.',
    ],
  },
  {
    slug: 'how-to-read-builder-score',
    title: 'How to read Builder Score™ without treating it like a vibe',
    excerpt:
      'Builder Score™ cites public GitHub. Here is what each axis means, what it does not claim, and how first-time visitors should use it before they ever tap Trade.',
    date: '2026-09-18',
    author: 'Builders DEX Research',
    tags: ['Builder Score', 'Guide', 'SEO'],
    readingMinutes: 7,
    coverImage: '/og/blog-how-to-read-builder-score.webp',
    body: [
      'First-time visitors often ask whether Builder Score™ is a price prediction. It is not. It is a cited quality signal: development, community, and shipping evidence we can point at — usually a public GitHub repository — before anyone is invited to swap.',
      'On Builders DEX, a catalog card is a story with receipts. Open Explore, pick a project, and you will see an overall score plus the axes underneath. When the live score API is up, those numbers refresh from the same repo citation. When it is down, the catalog still shows the last cited snapshot — we do not invent a replacement rank.',
      'Read the overall number as a filter, not a trophy. A high score means the public record of building is strong relative to our bar. A lower score can still be an honest early project. Rejected or reviewed rows stay visible so the funnel is not a highlight reel.',
      'Then read the “why selected” line and the builder story. Those sentences are the human layer: who ships, what problem, why this repo. If the story and the score disagree, trust the repo. That is the whole product thesis.',
      'Do not confuse Builder Score™ with Talent Protocol, Neynar, or Passport™ XP. Talent and Farcaster help us screen identity. Passport stores your own reputation on this site. Score is about the project’s public building record. Mixing them is how people get scammed by dashboards.',
      'Trade remains the last step. If a token is not allowlisted, the swap button will not pretend it is. That is not a bug — it is the reputation pipeline working. Use Terminal™ Radar and Scouts if you want to follow work that is still under review.',
      'If you are allocating time, not capital: open the project story, click through to GitHub, and decide whether you would hire that team. If you would not hire them, you should not chase their ticker here either.',
    ],
  },
  {
    slug: 'trade-is-the-last-step',
    title: 'Why Builders DEX makes you earn the swap button',
    excerpt:
      'Jupiter routes liquidity. We route trust. This is the first-timer map of Discover → Terminal → Passport → Trade — and why empty liquidity pages are not the product.',
    date: '2026-09-16',
    author: 'Laszlo Bihary',
    tags: ['Trading', 'Reputation', 'Product'],
    readingMinutes: 6,
    coverImage: '/og/blog-trade-is-the-last-step.webp',
    body: [
      'Most “DEX” landing pages shove a swap widget in your face. Builders DEX does the opposite on purpose: Your First Discovery, then Terminal™, then a curated book. Trade is the last step because liquidity without reputation is how the rest of crypto keeps getting hurt.',
      'Start on the homepage. First Discovery is a guided look at a real catalog story — not a random meme coin. If you skip it, open Explore and search by name or ticker (the same ?q= search engines use). You are reading startup profiles: founded year, journey, why selected, live score citations.',
      'Terminal™ is the morning habit: Radar, Scouts, Arena. It is where you watch work enter the network before it is famous. You do not need a wallet to read it. Connect a wallet when you want Passport™ XP, scout credit, or an allowlisted swap.',
      'Earn, Investor Mode, and DAO look like DeFi screens because they preview how conviction, filters, and governance will feel. They are labeled as simulations where they are not on-chain. Growth tasks and the daily spin on Earn already save on your profile. Do not stake thinking a vault is live.',
      'When a mint is actually tradeable, Swap uses the Jupiter-style router on Solana allowlists. HoodStreet, CCFF00, and Cubes live on Robinhood Chain (4663) — a different lane, honest hop, NFA. We do not wrap Hood assets onto Solana to fake a single-chain story.',
      'Share kit memes exist so you can post Proof of Building™ with a scout referral already in the X compose window. That is distribution, not a shortcut around verification. If a friend arrives on your link, they still have to read the story.',
      'If you only remember one sentence: we would rather show a locked trade button than list a zero. Open the Site guide in the footer whenever a room feels new — every Product, Community, and Legal link lands on real copy or a clearly marked work-in-progress.',
    ],
  },
  {
    slug: 'hoodstreet-on-robinhood-chain',
    title: 'HoodStreet, CCFF00 Squares, and chain 4663 for first-timers',
    excerpt:
      'Wall Street reimagined onchain — without pretending we are Robinhood Markets. How HoodStreet, My Neon wallets, and Cubes mint windows actually work from Builders DEX.',
    date: '2026-09-14',
    author: 'Builders DEX',
    tags: ['HoodStreet', 'Robinhood Chain', 'CCFF00'],
    readingMinutes: 6,
    coverImage: '/og/blog-hoodstreet-on-robinhood-chain.webp',
    body: [
      'HoodStreet is the Hood lane we actually participate in: CCFF00 founding Squares, My Neon token-bound wallets, and the Cubes ETH mint we list. It runs on Robinhood Chain id 4663. We are not affiliated with Robinhood Markets. DYOR — freeze, merkle, and phase data live on-chain, not in our slogans.',
      'First-timers should open On Hood, then HoodStreet. The street UI is the product: storefronts, LED stats, Cube energy. CCFF00 Wallet is where a Square’s ERC-6551 account becomes usable for Hood buys. Cubes Live reads mint windows from on-chain phases() — outbound Square Apes mint only. We are not the minter.',
      'Arrival from Solana still needs ETH on 4663 first. That is why the honest hop exists. Gas-first. No theater bridge that hides the fact you are changing chains. Solana keeps Passport. Base keeps canonical AURA. Hood keeps neon.',
      'CCFF00 is Proof of Neon: one color, fully onchain SVG, ten thousand identical Squares conceptually — membership as a wallet, not a PFP costume. If a Square holds $CCFF00, My Neon is the UI for what that NFT owns. Do not treat that as financial advice.',
      'Inside Builders DEX the Hood project sits in the catalog with a real builder story and a live Cubes contract citation where we have one. Builder Score™ still will not fake GitHub for a repo we cannot cite. Empty GitHub on HoodStreet is honesty, not a missing widget.',
      'If you came for AURA: $AURA Live is the Base board (Uni v3 AURA/USDC). Hood share certificates are a separate raise surface. Read the raise page before you send ETH. Inspection-gated shares are not the same as a Cubes mint.',
      'Share the HoodStreet page when the neon is the story. Share a Builder Story when the repo is the story. Different lanes, same standard: proof before the tap.',
    ],
  },
  {
    slug: 'reputation-layer-of-web3',
    title: 'Why Builders DEX is the reputation layer of Web3',
    excerpt:
      'Jupiter routes liquidity. We route trust. Every tradeable project carries a verified reputation history.',
    date: '2026-07-18',
    author: 'Laszlo Bihary',
    tags: ['Vision', 'Reputation'],
    readingMinutes: 5,
    coverImage: '/og/blog-reputation-layer-of-web3.webp',
    body: [
      'Crypto has endless promises. Builders DEX measures reality — commits, deploys, users, and open-source signal — before a token becomes tradeable.',
      'The killer answer to “why not just use Jupiter?” is simple: every project here has a verified reputation history. Trading is the final step in a trust pipeline.',
      'Proof of Building™, Builder DNA™, Passport™, Scouts, and Genesis Radar™ form an operating system for discovery. Liquidity follows reputation — not the other way around.',
    ],
  },
  {
    slug: 'proof-of-building',
    title: 'Proof of Building™: measuring actions, not opinions',
    excerpt:
      'GitHub commits, live products, active users, community growth, OSS, and revenue — verified on a clock.',
    date: '2026-07-12',
    author: 'Builders DEX Research',
    tags: ['Proof', 'Standard'],
    readingMinutes: 4,
    coverImage: '/og/blog-proof-of-building.webp',
    body: [
      'Ratings without evidence are vibes. Proof of Building™ checks whether a team shipped.',
      'We verify: GitHub activity, product deployment, user signal, community growth, open-source contribution, and revenue where applicable.',
      'Last-verified timestamps keep the standard honest. If the proof goes cold, so does the listing priority.',
    ],
  },
  {
    slug: 'builder-scouts-and-genesis-radar',
    title: 'Builder Scouts™ and Genesis Radar™ — find it before it is famous',
    excerpt:
      'Turn users into researchers. Early discovery is the emotional hook of a reputation exchange.',
    date: '2026-07-05',
    author: 'Builders DEX',
    tags: ['Scouts', 'Discovery'],
    readingMinutes: 4,
    coverImage: '/og/blog-builder-scouts-and-genesis-radar.webp',
    body: [
      'People do not want another exchange. They want to say: I found it before everyone else.',
      'Builder Scouts™ earn XP and reputation by submitting structured analysis. Genesis Radar™ surfaces projects entering the Builder Network while they are still under review.',
      'That loop makes the community the discovery engine — LinkedIn + Bloomberg + App Store ranking energy for Web3 builders.',
    ],
  },
  {
    slug: 'building-culture-meets-builders-dex',
    title: 'Building Culture × Builders DEX',
    excerpt:
      'Proof-first culture from Vienna — reputation, credentials, and access that communities can actually use.',
    date: '2026-06-28',
    author: 'Leonardo.based',
    tags: ['Culture', 'Team'],
    readingMinutes: 3,
    coverImage: '/og/blog-building-culture-meets-builders-dex.webp',
    body: [
      'Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation and unlock access together.',
      'Builders DEX brings that same proof-first mindset to Solana trading: curation as achievement, passport as primitive, launchpad as help for every builder willing to be verified.',
      'Follow the team story and essays — then come back to the Terminal™.',
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
