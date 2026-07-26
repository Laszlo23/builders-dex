export type TokenStatus = 'candidate' | 'voting' | 'trending' | 'closed';

export type TokenProfile = {
  id: number;
  chat_id: number;
  ticker: string;
  name: string;
  chain: string;
  mint: string | null;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  twitter: string | null;
  telegram_url: string | null;
  discord: string | null;
  big_buy_usd: number;
  serving_bot_key: string;
  created_by_user_id: number;
  status: TokenStatus;
  vote_count: number;
  created_at: string;
  trending_at: string | null;
};

export type TrendingTokenRow = TokenProfile & {
  chat_title: string;
};

export type ChatRow = {
  chat_id: number;
  title: string;
  created_at: string;
  serving_bot_key: string;
};

export type TokenProfileInput = {
  chatId: number;
  chatTitle: string;
  ticker: string;
  name: string;
  chain: string;
  mint: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  website?: string | null;
  twitter?: string | null;
  telegramUrl?: string | null;
  discord?: string | null;
  bigBuyUsd?: number;
  servingBotKey?: string;
  createdByUserId: number;
};
