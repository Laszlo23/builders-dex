export type WalletHostFamily = 'solana' | 'evm' | 'both' | 'unknown';

export type WalletHost = {
  id: string;
  name: string;
  family: WalletHostFamily;
  inApp: boolean;
  hasSolana: boolean;
  hasEvm: boolean;
  solanaNames: string[];
};

type EthFlag = {
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isRainbow?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
  isOkxUI?: boolean;
  isBitKeep?: boolean;
  isTokenPocket?: boolean;
  isImToken?: boolean;
  isBraveWallet?: boolean;
  isPhantom?: boolean;
  isRobinhood?: boolean;
};

type SolFlag = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
};

type HostWindow = Window & {
  ethereum?: EthFlag;
  solana?: SolFlag;
  phantom?: { solana?: SolFlag; ethereum?: EthFlag };
  solflare?: unknown;
  backpack?: unknown;
  okxwallet?: unknown;
};

function win(): HostWindow | null {
  if (typeof window === 'undefined') return null;
  return window as HostWindow;
}

function ua(): string {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

const UA_RULES: Array<{
  id: string;
  name: string;
  test: RegExp;
  family: WalletHostFamily;
  solanaNames: string[];
}> = [
  { id: 'phantom', name: 'Phantom', test: /Phantom/i, family: 'both', solanaNames: ['Phantom'] },
  { id: 'solflare', name: 'Solflare', test: /Solflare/i, family: 'solana', solanaNames: ['Solflare'] },
  { id: 'backpack', name: 'Backpack', test: /Backpack/i, family: 'solana', solanaNames: ['Backpack'] },
  { id: 'metamask', name: 'MetaMask', test: /MetaMask/i, family: 'evm', solanaNames: [] },
  { id: 'trust', name: 'Trust Wallet', test: /TrustWallet|Trust\//i, family: 'both', solanaNames: ['Trust'] },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    test: /CoinbaseWallet|CBWallet/i,
    family: 'evm',
    solanaNames: ['Coinbase'],
  },
  { id: 'rainbow', name: 'Rainbow', test: /Rainbow/i, family: 'evm', solanaNames: [] },
  { id: 'rabby', name: 'Rabby', test: /Rabby/i, family: 'evm', solanaNames: [] },
  { id: 'okx', name: 'OKX Wallet', test: /OKApp|OKX/i, family: 'both', solanaNames: ['OKX'] },
  { id: 'bitget', name: 'Bitget', test: /BitKeep|Bitget/i, family: 'evm', solanaNames: [] },
  { id: 'tokenpocket', name: 'TokenPocket', test: /TokenPocket/i, family: 'evm', solanaNames: [] },
  { id: 'imtoken', name: 'imToken', test: /imToken/i, family: 'evm', solanaNames: [] },
  { id: 'robinhood', name: 'Robinhood', test: /Robinhood/i, family: 'evm', solanaNames: [] },
];

function injectedSolana(w: HostWindow): boolean {
  return Boolean(w.solana || w.phantom?.solana || w.solflare || w.backpack);
}

function injectedEvm(w: HostWindow): boolean {
  return Boolean(w.ethereum || w.phantom?.ethereum || w.okxwallet);
}

export function detectWalletHost(): WalletHost {
  const w = win();
  const agent = ua();
  const uaHit = UA_RULES.find((rule) => rule.test.test(agent));
  const hasSolana = w ? injectedSolana(w) : false;
  const hasEvm = w ? injectedEvm(w) : false;

  if (uaHit) {
    return {
      id: uaHit.id,
      name: uaHit.name,
      family: uaHit.family === 'both' ? (hasSolana && hasEvm ? 'both' : hasSolana ? 'solana' : hasEvm ? 'evm' : uaHit.family) : uaHit.family,
      inApp: true,
      hasSolana: hasSolana || uaHit.family === 'solana' || uaHit.family === 'both',
      hasEvm: hasEvm || uaHit.family === 'evm' || uaHit.family === 'both',
      solanaNames: uaHit.solanaNames,
    };
  }

  const eth = w?.ethereum;
  if (w?.phantom?.solana || w?.solana?.isPhantom) {
    return {
      id: 'phantom',
      name: 'Phantom',
      family: hasEvm ? 'both' : 'solana',
      inApp: false,
      hasSolana: true,
      hasEvm,
      solanaNames: ['Phantom'],
    };
  }
  if (w?.solflare || w?.solana?.isSolflare) {
    return {
      id: 'solflare',
      name: 'Solflare',
      family: 'solana',
      inApp: false,
      hasSolana: true,
      hasEvm,
      solanaNames: ['Solflare'],
    };
  }
  if (eth?.isRabby) {
    return {
      id: 'rabby',
      name: 'Rabby',
      family: 'evm',
      inApp: false,
      hasSolana,
      hasEvm: true,
      solanaNames: [],
    };
  }
  if (eth?.isRainbow) {
    return {
      id: 'rainbow',
      name: 'Rainbow',
      family: 'evm',
      inApp: false,
      hasSolana,
      hasEvm: true,
      solanaNames: [],
    };
  }
  if (eth?.isCoinbaseWallet) {
    return {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      family: 'evm',
      inApp: false,
      hasSolana,
      hasEvm: true,
      solanaNames: ['Coinbase'],
    };
  }
  if (eth?.isTrust) {
    return {
      id: 'trust',
      name: 'Trust Wallet',
      family: hasSolana ? 'both' : 'evm',
      inApp: false,
      hasSolana,
      hasEvm: true,
      solanaNames: ['Trust'],
    };
  }
  if (eth?.isMetaMask && !eth.isBraveWallet) {
    return {
      id: 'metamask',
      name: 'MetaMask',
      family: 'evm',
      inApp: false,
      hasSolana,
      hasEvm: true,
      solanaNames: [],
    };
  }

  if (hasSolana && hasEvm) {
    return {
      id: 'injected',
      name: 'Wallet',
      family: 'both',
      inApp: false,
      hasSolana: true,
      hasEvm: true,
      solanaNames: [],
    };
  }
  if (hasSolana) {
    return {
      id: 'solana',
      name: 'Solana wallet',
      family: 'solana',
      inApp: false,
      hasSolana: true,
      hasEvm: false,
      solanaNames: [],
    };
  }
  if (hasEvm) {
    return {
      id: 'evm',
      name: 'EVM wallet',
      family: 'evm',
      inApp: false,
      hasSolana: false,
      hasEvm: true,
      solanaNames: [],
    };
  }

  return {
    id: 'browser',
    name: 'Browser',
    family: 'unknown',
    inApp: false,
    hasSolana: false,
    hasEvm: false,
    solanaNames: [],
  };
}

export type WalletDeepLink = {
  id: string;
  name: string;
  href: string;
  family: WalletHostFamily;
};

export function walletDeepLinks(pageUrl?: string): WalletDeepLink[] {
  const href =
    pageUrl ||
    (typeof window !== 'undefined' ? window.location.href : 'https://dex.buildingcultureid.space/');
  const encoded = encodeURIComponent(href);
  let hostPath = href.replace(/^https?:\/\//, '');
  try {
    const u = new URL(href);
    hostPath = `${u.host}${u.pathname}${u.search}`;
  } catch {
    /* keep stripped href */
  }

  return [
    {
      id: 'phantom',
      name: 'Phantom',
      family: 'solana',
      href: `https://phantom.app/ul/browse/${encoded}?ref=https://phantom.app`,
    },
    {
      id: 'solflare',
      name: 'Solflare',
      family: 'solana',
      href: `https://solflare.com/ul/v1/browse/${encoded}?ref=${encodeURIComponent('https://dex.buildingcultureid.space')}`,
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      family: 'evm',
      href: `https://metamask.app.link/dapp/${hostPath}`,
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      family: 'evm',
      href: `https://rnbwapp.com/dapp?url=${encoded}`,
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      family: 'evm',
      href: `https://go.cb-w.com/dapp?cb_url=${encoded}`,
    },
    {
      id: 'trust',
      name: 'Trust',
      family: 'both',
      href: `https://link.trustwallet.com/open_url?coin_id=501&url=${encoded}`,
    },
  ];
}

export function connectLabel(host: WalletHost, connected: boolean): string {
  if (connected) return 'Connected';
  if (host.inApp || host.hasSolana || host.hasEvm) return `Continue in ${host.name}`;
  return 'Connect';
}
