export type FeedbackCategory =
  | 'product'
  | 'trade'
  | 'earn'
  | 'passport'
  | 'bug'
  | 'idea'
  | 'other';

export const FEEDBACK_CATEGORIES: { id: FeedbackCategory; label: string; hint: string }[] = [
  { id: 'product', label: 'Product', hint: 'UX, flows, clarity' },
  { id: 'trade', label: 'Trade', hint: 'Swap, tokens, fees' },
  { id: 'earn', label: 'Earn', hint: 'Tasks, LP, wheel' },
  { id: 'passport', label: 'Passport', hint: 'Profile, scores' },
  { id: 'bug', label: 'Bug', hint: 'Something broke' },
  { id: 'idea', label: 'Idea', hint: 'What should exist' },
  { id: 'other', label: 'Other', hint: 'Anything else' },
];

export const SUPPORT_PRESETS = [
  {
    title: 'How do I trade?',
    prompt: 'How do I swap a curated token on Builders DEX? Walk me through connect wallet → pick pair → confirm.',
  },
  {
    title: 'Builder Score?',
    prompt: 'What is Builder Score™ and how should I read it before trading or supporting a project?',
  },
  {
    title: 'Earn / XP stuck',
    prompt: 'My Earn task or XP looks stuck. What should I check, and how do growth tasks complete?',
  },
  {
    title: 'Listing / launch',
    prompt: 'How does a builder get listed or enter the accelerator? What does THE STANDARD funnel mean?',
  },
];

/** Honest revenue levers — shown lightly in Support for transparency */
export const MONETIZATION_LEVERS = [
  {
    title: 'Trade fees',
    detail: 'Small referral / platform fee on Jupiter-routed swaps of curated mints.',
  },
  {
    title: 'Accelerator seats',
    detail: 'Paid review + launch support for teams that pass quality gates (not pay-to-list spam).',
  },
  {
    title: 'Builder API',
    detail: 'Metered access for funds, scouts, and tools that need Score / genome / passport data.',
  },
  {
    title: 'Premium network',
    detail: 'Optional Passport Pro, Council access, or deal-flow alerts for serious capital allocators.',
  },
];
