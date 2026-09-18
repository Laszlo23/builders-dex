import React, { Suspense, useEffect, useState, startTransition } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Navbar from './components/Navbar';
import Seo from './components/Seo';
import SiteFooter from './components/SiteFooter';
import FirstDiscoveryModal from './components/FirstDiscoveryModal';
import ChatDrawer, { ChatFab } from './components/ChatDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useWalletDisplayName } from './hooks/useWalletDisplayName';
import { lazyWithRetry } from './lib/lazyWithRetry';

const LandingView = lazyWithRetry(() => import('./components/LandingView'));
const ExploreView = lazyWithRetry(() => import('./components/ExploreView'));
const ProjectDetailView = lazyWithRetry(() => import('./components/ProjectDetailView'));
const SwapView = lazyWithRetry(() => import('./components/SwapView'));
const LaunchView = lazyWithRetry(() => import('./components/LaunchView'));
const LaunchpadView = lazyWithRetry(() => import('./components/LaunchpadView'));
const LaunchRaiseView = lazyWithRetry(() => import('./components/LaunchRaiseView'));
const BuildersView = lazyWithRetry(() => import('./components/BuildersView'));
const DaoView = lazyWithRetry(() => import('./components/DaoView'));
const AiView = lazyWithRetry(() => import('./components/AiView'));
const ProfileView = lazyWithRetry(() => import('./components/ProfileView'));
const ShareCampaignView = lazyWithRetry(() => import('./components/ShareCampaignView'));
const EarnView = lazyWithRetry(() => import('./components/EarnView'));
const TerminalView = lazyWithRetry(() => import('./components/TerminalView'));
const TeamView = lazyWithRetry(() => import('./components/TeamView'));
const BlogView = lazyWithRetry(() => import('./components/BlogView'));
const LegalView = lazyWithRetry(() => import('./components/LegalView'));
const FeedbackSupportView = lazyWithRetry(() => import('./components/FeedbackSupportView'));
const VisionRoadmapManifestView = lazyWithRetry(() => import('./components/VisionRoadmapManifestView'));
const InvestorModeView = lazyWithRetry(() => import('./components/InvestorModeView'));
const BuilderGraphExplorer = lazyWithRetry(() => import('./components/BuilderGraphExplorer'));
const BuilderStoriesView = lazyWithRetry(() => import('./components/BuilderStoriesView'));
const TelegramBotView = lazyWithRetry(() => import('./components/TelegramBotView'));
const TelegramVoteMiniApp = lazyWithRetry(() => import('./components/TelegramVoteMiniApp'));
const ReviewDeskView = lazyWithRetry(() => import('./components/ReviewDeskView'));
const AuraLiveView = lazyWithRetry(() => import('./components/AuraLiveView'));
const HoodGuideView = lazyWithRetry(() => import('./components/HoodGuideView'));
const CubesLiveView = lazyWithRetry(() => import('./components/CubesLiveView'));
const HoodShareView = lazyWithRetry(() => import('./components/HoodShareView'));

import { INITIAL_PROJECTS, INITIAL_BUILDERS, INITIAL_PROPOSALS, ALL_QUESTS } from './data/projects';
import { LIVE_AURA_RAISE_SEED, isLiveAuraRaiseId } from './data/liveShareRaise';
import { HOOD_SHARE_ID, HOOD_SHARE_PROJECT_ID, isHoodShareId } from './data/hoodShare';
import { GrowthTask, PendingUnstake, createUnstakeRequest } from './data/earn';
import { canSpin } from './data/growthWheel';
import { ARENA_MATCH, INITIAL_SCOUT_MISSIONS } from './data/reputation';
import { INITIAL_CONVICTIONS } from './data/builderEconomy';
import { LEGAL_DOCS } from './data/legal';
import {
  SOCIAL_GO_THEN_CLAIM,
  applyCompletedQuests,
  applyCompletedTasks,
  loadEarnProgress,
  mergeProgressSnapshots,
  saveEarnProgress,
} from './lib/earnProgress';
import {
  fetchReputation,
} from './lib/reputation/client';
import { upvoteMessage } from './lib/reputation/messages';
import { submitScoutCall } from './lib/scout/client';
import { claimDailyShareReward } from './lib/dailyShareRewards';
import type { ShareActionResult } from './components/ShareCampaignView';
import bs58 from 'bs58';
import {
  Project,
  Builder,
  Proposal,
  Quest,
  SwapTransaction,
  UserWallet,
  PassportStats,
  ScoutMission,
  UserProfile,
} from './types';
import { getPassportLevel } from './lib/builderScore';
import { useTradeableTokens, isMintTradeable } from './hooks/useTradeableTokens';
import {
  safeNavigate,
  getPathFromUrl,
  getProjectIdFromUrl,
  getRaiseIdFromUrl,
  getBlogSlugFromUrl,
  type NavState,
} from './lib/routes';

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
    </div>
  );
}

const EMPTY_PROFILE: UserProfile = {
  displayName: '',
  bio: 'Builder & researcher on Builders DEX.',
  avatarUrl: '',
  socials: {
    x: '',
    farcaster: '',
    linkedin: '',
    github: '',
    discord: '',
    telegram: '',
    tiktok: '',
    paragraph: '',
    website: '',
    email: '',
  },
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function App() {
  const { publicKey, connected, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { tokens: tradeableTokens, mintSet: tradeableMintSet } = useTradeableTokens();

  const [currentPath, setCurrentPathRaw] = useState<string>(() => getPathFromUrl());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const fromUrl = getProjectIdFromUrl();
    if (getPathFromUrl() === 'raise') {
      return isHoodShareId(fromUrl) || isLiveAuraRaiseId(fromUrl) || !fromUrl
        ? HOOD_SHARE_PROJECT_ID
        : fromUrl;
    }
    return fromUrl || 'p1';
  });
  const [blogSlug, setBlogSlug] = useState<string | null>(() => getBlogSlugFromUrl());
  const [selectedRaiseId, setSelectedRaiseId] = useState<string | null>(() => {
    if (getPathFromUrl() === 'raise') {
      return getRaiseIdFromUrl() || HOOD_SHARE_ID;
    }
    return getRaiseIdFromUrl();
  });
  const setCurrentPath = (path: string, state?: NavState) => {
    startTransition(() => {
      safeNavigate(path, setCurrentPathRaw, 'landing', state);
    });
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      try {
        tg.ready();
        tg.expand();
      } catch {
        /* ignore */
      }
      const initialPath = getPathFromUrl();
      if (initialPath === 'tg-vote') setCurrentPath('tg-vote');
    }
    const onHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (hash === 'tg-vote') {
        const path = getPathFromUrl();
        setCurrentPathRaw(path);
      }
    };
    const onPopState = () => {
      const path = getPathFromUrl();
      setCurrentPathRaw(path);
      const projectId = getProjectIdFromUrl();
      if (path === 'raise') {
        const raiseId = getRaiseIdFromUrl() || HOOD_SHARE_ID;
        setSelectedRaiseId(raiseId);
        setSelectedProjectId(
          isHoodShareId(raiseId) || isHoodShareId(projectId) || isLiveAuraRaiseId(raiseId)
            ? HOOD_SHARE_PROJECT_ID
            : projectId || HOOD_SHARE_PROJECT_ID,
        );
      } else {
        if (projectId) setSelectedProjectId(projectId);
        setSelectedRaiseId(null);
      }
      setBlogSlug(path === 'blog' ? getBlogSlugFromUrl() : null);
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once only
  }, []);
  const [swapOutputMint, setSwapOutputMint] = useState<string | null>(null);
  const [intelPrompt, setIntelPrompt] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{ message: string } | null>(null);

  useEffect(() => {
    window.alert = (message: string) => {
      setCustomAlert({ message });
    };
  }, []);

  const walletKey = publicKey?.toBase58() ?? null;
  const boot = loadEarnProgress(null);

  const [simBalances, setSimBalances] = useState<Record<string, number>>(
    () => boot.simBalances,
  );

  const wallet: UserWallet = {
    connected,
    address: publicKey ? truncateAddress(publicKey.toBase58()) : '',
    balances: simBalances,
    selectedChain: 'Solana',
  };

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [builders] = useState<Builder[]>(INITIAL_BUILDERS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [quests, setQuests] = useState<Quest[]>(() =>
    applyCompletedQuests(ALL_QUESTS, boot.completedQuestIds),
  );
  const [stakedBuild, setStakedBuild] = useState<number>(() => boot.stakedBuild);
  const [pendingUnstake, setPendingUnstake] = useState<PendingUnstake | null>(
    () => boot.pendingUnstake,
  );
  const [lpDeposits, setLpDeposits] = useState<Record<string, number>>(
    () => boot.lpDeposits,
  );
  const [growthTasks, setGrowthTasks] = useState<GrowthTask[]>(() =>
    applyCompletedTasks(boot.completedTaskIds),
  );
  const [startedTaskIds, setStartedTaskIds] = useState<string[]>(
    () => boot.startedTaskIds,
  );
  const [builderXp, setBuilderXp] = useState<number>(() => boot.builderXp);
  const [contributionsCount, setContributionsCount] = useState<number>(
    () => boot.contributionsCount,
  );
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(
    () => new Set(boot.discoveredIds),
  );
  const [passport, setPassport] = useState<PassportStats>(() => boot.passport);
  const [scoutMissions, setScoutMissions] = useState<ScoutMission[]>(() =>
    INITIAL_SCOUT_MISSIONS.map((m) =>
      boot.completedScoutIds.includes(m.id)
        ? { ...m, completed: true }
        : m,
    ),
  );
  const [arenaVotes, setArenaVotes] = useState<{
    a: number;
    b: number;
    userSide?: 'a' | 'b';
  }>(() => ({
    a: ARENA_MATCH.a.votes,
    b: ARENA_MATCH.b.votes,
    userSide: boot.arenaUserSide ?? undefined,
  }));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem('bdx_user_profile');
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        return {
          ...EMPTY_PROFILE,
          ...parsed,
          socials: { ...EMPTY_PROFILE.socials, ...parsed.socials },
        };
      }
    } catch {
      /* ignore */
    }
    return EMPTY_PROFILE;
  });
  const [myProjectIds, setMyProjectIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bdx_my_projects');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [convictions] = useState(INITIAL_CONVICTIONS);
  const [firstDiscoveryOpen, setFirstDiscoveryOpen] = useState(false);
  const [hasCompletedFirstDiscovery, setHasCompletedFirstDiscovery] = useState(
    () => boot.hasCompletedFirstDiscovery,
  );
  const [earnReady, setEarnReady] = useState(false);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [ledgerSynced, setLedgerSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/catalog')
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => {
        if (cancelled || !Array.isArray(data.projects) || data.projects.length === 0) return;
        setProjects(data.projects);
      })
      .catch(() => {
        /* keep seed catalog */
      });
    return () => {
      cancelled = true;
    };
  }, [currentPath]);

  useEffect(() => {
    try {
      localStorage.setItem('bdx_my_projects', JSON.stringify(myProjectIds));
    } catch {
      /* ignore */
    }
  }, [myProjectIds]);

  // Scroll to top on navigation
  useEffect(() => {
    // Use auto for broader browser support (Safari compatibility)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Also reset document scroll position for browsers that need it
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPath, selectedProjectId]);

  const applyEarnSnapshot = (snap: ReturnType<typeof loadEarnProgress>) => {
    setSimBalances(snap.simBalances);
    setStakedBuild(snap.stakedBuild);
    setPendingUnstake(snap.pendingUnstake);
    setLpDeposits(snap.lpDeposits);
    setGrowthTasks(applyCompletedTasks(snap.completedTaskIds));
    setStartedTaskIds(snap.startedTaskIds);
    setBuilderXp(snap.builderXp);
    setContributionsCount(snap.contributionsCount);
    setDiscoveredIds(new Set(snap.discoveredIds));
    setPassport(snap.passport);
    setQuests(applyCompletedQuests(ALL_QUESTS, snap.completedQuestIds));
    setScoutMissions(
      INITIAL_SCOUT_MISSIONS.map((m) =>
        snap.completedScoutIds.includes(m.id) ? { ...m, completed: true } : m,
      ),
    );
    setArenaVotes({
      a: ARENA_MATCH.a.votes,
      b: ARENA_MATCH.b.votes,
      userSide: snap.arenaUserSide ?? undefined,
    });
    setHasCompletedFirstDiscovery(snap.hasCompletedFirstDiscovery);
  };

  /** Hydrate local progress, then merge shared ledger when wallet is connected */
  useEffect(() => {
    let cancelled = false;
    setEarnReady(false);
    setLedgerSynced(false);
    const local = loadEarnProgress(walletKey);
    applyEarnSnapshot(local);
    setHydratedKey(walletKey ?? 'device');
    setEarnReady(true);

    if (!walletKey) return;

    void (async () => {
      try {
        const remote = await fetchReputation(walletKey);
        if (cancelled || !remote?.progress) {
          setLedgerSynced(true);
          return;
        }
        const merged = mergeProgressSnapshots(local, remote.progress);
        if (cancelled) return;
        applyEarnSnapshot(merged);
        saveEarnProgress(walletKey, merged);
        if (remote.displayName) {
          setUserProfile((p) =>
            p.displayName ? p : { ...p, displayName: remote.displayName },
          );
        }
      } catch {
        /* offline / empty ledger */
      } finally {
        if (!cancelled) setLedgerSynced(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity switch only
  }, [walletKey]);

  /** Persist Earn progress (wallet or device) — local only.
   *  Do NOT auto-call wallet signMessage here: that spam made Phantom/Solflare
   *  look stuck in an endless "connecting" / approve loop. Server sync happens
   *  on explicit signed actions (Scout, upvote) or a future "Publish Passport". */
  useEffect(() => {
    if (!earnReady) return;
    if (hydratedKey !== (walletKey ?? 'device')) return;
    saveEarnProgress(walletKey, {
      version: 1,
      builderXp,
      contributionsCount,
      completedTaskIds: growthTasks.filter((t) => t.completed).map((t) => t.id),
      startedTaskIds,
      discoveredIds: Array.from(discoveredIds),
      stakedBuild,
      lpDeposits,
      pendingUnstake,
      simBalances,
      passport,
      completedQuestIds: quests.filter((q) => q.completed).map((q) => q.id),
      completedScoutIds: scoutMissions.filter((m) => m.completed).map((m) => m.id),
      arenaUserSide: arenaVotes.userSide ?? null,
      hasCompletedFirstDiscovery,
      updatedAt: Date.now(),
    });
  }, [
    earnReady,
    hydratedKey,
    walletKey,
    builderXp,
    contributionsCount,
    growthTasks,
    startedTaskIds,
    discoveredIds,
    stakedBuild,
    lpDeposits,
    pendingUnstake,
    simBalances,
    passport,
    quests,
    scoutMissions,
    arenaVotes.userSide,
    hasCompletedFirstDiscovery,
  ]);

  useEffect(() => {
    if (hasCompletedFirstDiscovery) return;
    const t = window.setTimeout(() => setFirstDiscoveryOpen(true), 1400);
    return () => window.clearTimeout(t);
  }, [hasCompletedFirstDiscovery]);

  useEffect(() => {
    try {
      localStorage.setItem('bdx_user_profile', JSON.stringify(userProfile));
    } catch {
      /* ignore */
    }
  }, [userProfile]);

  const [chatOpen, setChatOpen] = useState(false);
  const walletDisplay = useWalletDisplayName(userProfile.displayName);

  /** Daily spin task re-opens when the 24h cooldown clears */
  useEffect(() => {
    const sync = () => {
      if (!canSpin()) return;
      setGrowthTasks((prev) =>
        prev.map((t) =>
          t.id === 't_daily_spin' && t.completed ? { ...t, completed: false } : t
        )
      );
    };
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const builderLevelName = getPassportLevel(builderXp);

  const handleAddXp = (amount: number) => {
    if (amount <= 0) return;
    setBuilderXp((prev) => prev + amount);
    setPassport((p) => ({
      ...p,
      builderReputation: Math.min(100, p.builderReputation + Math.round(amount / 50)),
    }));
  };

  const handleStartGrowthTask = (taskId: string) => {
    setStartedTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
  };

  const connectWallet = () => setVisible(true);

  const navigateToStory = (projectId: string) => {
    setFirstDiscoveryOpen(false);
    setSelectedProjectId(projectId);
    setCurrentPath('project-detail', { projectId });
  };

  const setBlogSlugAndUrl = (slug: string | null) => {
    setBlogSlug(slug);
    setCurrentPath('blog', { blogSlug: slug });
  };

  const navigateToTrade = (mint?: string) => {
    if (mint) {
      if (!isMintTradeable(mint, tradeableMintSet)) {
        alert('This coin is not enabled for trading. Set TRADEABLE_<SYMBOL>=true in .env.');
        return;
      }
      setSwapOutputMint(mint);
    } else {
      setSwapOutputMint(null);
    }
    setCurrentPath('swap');
  };

  const handleDiscover = (projectId: string) => {
    setDiscoveredIds((prev) => {
      if (prev.has(projectId)) return prev;
      const next = new Set(prev);
      next.add(projectId);
      return next;
    });
  };

  const completeFirstDiscovery = (projectId: string) => {
    handleDiscover(projectId);
    handleCompleteGrowthTask('t_first_discovery');
    setSelectedProjectId(projectId);
    setCurrentPath('project-detail', { projectId });
    setFirstDiscoveryOpen(false);
    setHasCompletedFirstDiscovery(true);
    try {
      localStorage.setItem('bdx_first_discovery', '1');
    } catch {
      /* ignore */
    }
  };

  const handleCompleteQuest = (questId: string) => {
    let xpGain = 0;
    let didComplete = false;
    setQuests((prev) => {
      const q = prev.find((item) => item.id === questId);
      if (!q || q.completed) return prev;
      didComplete = true;
      xpGain = q.xp;
      return prev.map((item) =>
        item.id === questId ? { ...item, completed: true } : item,
      );
    });
    if (!didComplete) return;
    handleAddXp(xpGain);
    setContributionsCount((c) => c + 1);
    setPassport((p) => ({
      ...p,
      researchQuestsCompleted: p.researchQuestsCompleted + 1,
    }));
  };

  const handleCompleteGrowthTask = (taskId: string) => {
    if (
      SOCIAL_GO_THEN_CLAIM.has(taskId) &&
      !startedTaskIds.includes(taskId)
    ) {
      alert('Tap Go first to open the link, then come back and Claim.');
      return;
    }
    let xpGain = 0;
    let didComplete = false;
    setGrowthTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task || task.completed) return prev;
      didComplete = true;
      xpGain = task.xp;
      return prev.map((t) =>
        t.id === taskId ? { ...t, completed: true } : t,
      );
    });
    if (!didComplete) return;
    if (xpGain > 0) handleAddXp(xpGain);
    setContributionsCount((c) => c + 1);
  };

  useEffect(() => {
    if (currentPath !== 'project-detail') return;
    if (discoveredIds.has(selectedProjectId)) return;
    setDiscoveredIds((prev) => {
      const next = new Set(prev).add(selectedProjectId);
      if (next.size >= 5) {
        // Discovery Quest — review 5 builders
        queueMicrotask(() => {
          handleCompleteQuest('g_q5');
          handleCompleteGrowthTask('t_review_5');
        });
      }
      return next;
    });
    setPassport((p) => ({
      ...p,
      projectsDiscovered: p.projectsDiscovered + 1,
      builderReputation: Math.min(100, p.builderReputation + 1),
      communityTrust: Math.min(100, p.communityTrust + 1),
      previousContributions: p.previousContributions + 1,
    }));
    setBuilderXp((prev) => prev + 25);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- discovery side-effect
  }, [currentPath, selectedProjectId, discoveredIds]);

  useEffect(() => {
    // Terminal visit counts as checking Build Feed™ / Convictions (member growth)
    if (currentPath === 'terminal') {
      handleCompleteGrowthTask('t_build_feed');
      handleCompleteGrowthTask('t_conviction');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const handleCampaignShare = (channel?: string): ShareActionResult => {
    handleCompleteGrowthTask('t_share');
    if (channel === 'X / Twitter') {
      handleCompleteGrowthTask('t_share_x');
    }
    const reward = claimDailyShareReward();
    if (reward.awarded && reward.xp > 0) {
      handleAddXp(reward.xp);
    }
    return {
      xp: reward.xp,
      remaining: reward.remaining,
      capped: reward.capped,
    };
  };

  const handleUpvoteProject = (projectId: string) => {
    let didUpvote = false;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        didUpvote = true;
        return { ...p, upvotes: p.upvotes + 1 };
      }),
    );
    if (!didUpvote) return;
    handleAddXp(50);
    setPassport((pass) => ({
      ...pass,
      communitiesSupported: pass.communitiesSupported + 1,
    }));
    handleCompleteQuest('g_q3');
    handleCompleteGrowthTask('t_upvote');
    if (walletKey && signMessage) {
      void (async () => {
        try {
          const updatedAt = Date.now();
          const sig = await signMessage(
            new TextEncoder().encode(
              upvoteMessage({ wallet: walletKey, projectId, updatedAt }),
            ),
          );
          await fetch('/api/reputation/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: walletKey,
              projectId,
              updatedAt,
              signature: bs58.encode(sig),
            }),
          });
        } catch {
          /* local upvote still counts; ledger requires signature */
        }
      })();
    }
  };

  const handleFundProject = (amount: number, receivedAmt: number) => {
    const selectedProj = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProj) return;
    const nativeTicker =
      selectedProj.chain === 'Solana' ? 'SOL' : selectedProj.chain === 'Polygon' ? 'POL' : 'ETH';

    setSimBalances((prev) => ({
      ...prev,
      [nativeTicker]: (prev[nativeTicker] || 0) - amount,
      [selectedProj.ticker]: (prev[selectedProj.ticker] || 0) + receivedAmt,
    }));

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId
          ? {
              ...p,
              raised:
                p.raised +
                amount * (nativeTicker === 'ETH' ? 3400 : nativeTicker === 'SOL' ? 165 : 0.65),
            }
          : p
      )
    );

    handleAddXp(250);
    setPassport((p) => ({ ...p, communitiesSupported: p.communitiesSupported + 1 }));
    setContributionsCount((c) => c + 1);
  };

  const handleAddComment = (commentText: string) => {
    const newComment = {
      id: `comm_${Date.now()}`,
      author: 'You',
      wallet: wallet.address || 'Anon',
      text: commentText,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      avatarUrl: undefined,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId ? { ...p, comments: [newComment, ...p.comments] } : p
      )
    );

    handleAddXp(100);
    setPassport((p) => ({ ...p, communitiesSupported: p.communitiesSupported + 1 }));
    setContributionsCount((c) => c + 1);
    handleCompleteQuest('g_q3');
  };

  const handleProvideLiquidity = (poolId: string, amount: number) => {
    setLpDeposits((prev) => ({
      ...prev,
      [poolId]: (prev[poolId] || 0) + amount,
    }));
    handleAddXp(100);
    setContributionsCount((c) => c + 1);
    handleCompleteGrowthTask('t_lp');
  };

  const handleSwapComplete = (tx: SwapTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
    handleAddXp(150);
    setContributionsCount((c) => c + 1);
    handleCompleteQuest('g_q1');
    handleCompleteGrowthTask('t_trade');
  };

  const handleStakeBuild = (amount: number) => {
    setSimBalances((prev) => ({ ...prev, BUILD: (prev.BUILD || 0) - amount }));
    setStakedBuild((prev) => prev + amount);
    handleAddXp(150);
    setContributionsCount((c) => c + 1);
    handleCompleteGrowthTask('t_stake');
  };

  const handleRequestUnstake = (amount: number) => {
    if (amount <= 0 || amount > stakedBuild) return;
    if (pendingUnstake) {
      alert('You already have an unstake in cooldown. Claim or wait it out first.');
      return;
    }
    setStakedBuild((prev) => prev - amount);
    setPendingUnstake(createUnstakeRequest(amount));
  };

  const handleClaimUnstake = () => {
    if (!pendingUnstake) return;
    if (Date.now() < pendingUnstake.unlockAt) {
      alert('Cooldown not finished yet.');
      return;
    }
    const amt = pendingUnstake.amount;
    setSimBalances((prev) => ({ ...prev, BUILD: (prev.BUILD || 0) + amt }));
    setPendingUnstake(null);
  };

  const handleCastVote = (proposalId: string, direction: 'for' | 'against', weight: number) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesFor: direction === 'for' ? p.votesFor + weight : p.votesFor,
            votesAgainst: direction === 'against' ? p.votesAgainst + weight : p.votesAgainst,
            userVoted: direction,
          };
        }
        return p;
      })
    );
    handleAddXp(100);
    setContributionsCount((c) => c + 1);
  };

  const handleLaunchProject = (projectId: string) => {
    setMyProjectIds((prev) => [projectId, ...prev.filter((id) => id !== projectId)]);
    setSelectedProjectId(projectId);
    handleAddXp(300);
    setContributionsCount((c) => c + 1);
    setPassport((p) => ({
      ...p,
      projectsCreated: p.projectsCreated + 1,
      previousContributions: p.previousContributions + 1,
    }));
    handleCompleteQuest('g_q2');
    void fetch('/api/catalog')
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => {
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        /* keep current catalog */
      });
  };

  const openIntelligence = (prompt?: string) => {
    if (prompt) setIntelPrompt(prompt);
    setCurrentPath('ai');
  };

  const handleCompleteScout = async (
    missionId: string,
    analysis: string,
    meta: { projectId: string; evidenceUrl?: string },
  ): Promise<{ ok: boolean; error?: string; already?: boolean }> => {
    if (!walletKey) {
      return { ok: false, error: 'Connect a wallet to publish your Scout call' };
    }

    const mission = scoutMissions.find((m) => m.id === missionId);
    if (!mission || mission.completed) {
      return { ok: false, error: 'Mission already completed' };
    }

    if (!signMessage) {
      return { ok: false, error: 'Your wallet must support message signing' };
    }

    const result = await submitScoutCall({
      wallet: walletKey,
      missionId,
      projectId: meta.projectId,
      analysis,
      evidenceUrl: meta.evidenceUrl,
      signMessage: (msg) => signMessage(msg),
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    if (!result.already) {
      const rewardXp = result.rewardXp || mission.rewardXp;
      setScoutMissions((prev) =>
        prev.map((item) =>
          item.id === missionId
            ? {
                ...item,
                completed: true,
                analysis,
                projectId: meta.projectId,
                evidenceUrl: meta.evidenceUrl,
                submittedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      handleAddXp(rewardXp);
      handleCompleteGrowthTask('t_scout_mission');
      setPassport((p) => ({
        ...p,
        scoutXp: (p.scoutXp || 0) + rewardXp,
        earlyCalls: (p.earlyCalls || 0) + (result.earlyCall ? 1 : 0),
        // researchAccuracy comes from scored 30/90d outcomes on the ledger — not inflated here
        projectsDiscovered: p.projectsDiscovered + 1,
        builderReputation: Math.min(100, p.builderReputation + 3),
        communityTrust: Math.min(100, p.communityTrust + 2),
        researchQuestsCompleted: p.researchQuestsCompleted + 1,
      }));
      setContributionsCount((c) => c + 1);
    } else {
      setScoutMissions((prev) =>
        prev.map((item) =>
          item.id === missionId
            ? { ...item, completed: true, analysis, projectId: meta.projectId }
            : item,
        ),
      );
    }

    return { ok: true, already: result.already };
  };

  const handleVoteArena = (side: 'a' | 'b') => {
    let awarded = false;
    setArenaVotes((prev) => {
      if (prev.userSide) return prev;
      awarded = true;
      return {
        ...prev,
        [side]: prev[side] + 1,
        userSide: side,
      };
    });
    if (!awarded) return;
    handleAddXp(50);
    setPassport((p) => ({
      ...p,
      communitiesSupported: p.communitiesSupported + 1,
    }));
  };

  const renderView = () => {
    switch (currentPath) {
      case 'landing':
        return (
          <LandingView
            setCurrentPath={setCurrentPath}
            projects={projects}
            builders={builders}
            setSelectedProjectId={setSelectedProjectId}
            onTrade={navigateToTrade}
            onOpenStory={navigateToStory}
            tradeableMintSet={tradeableMintSet}
            tradeableTokens={tradeableTokens}
            onStartFirstDiscovery={() => setFirstDiscoveryOpen(true)}
            highlightWallet={walletKey}
          />
        );
      case 'explore':
        return (
          <ExploreView
            projects={projects}
            onUpvote={handleUpvoteProject}
            setSelectedProjectId={setSelectedProjectId}
            setCurrentPath={setCurrentPath}
            onTrade={navigateToTrade}
            onOpenStory={navigateToStory}
            onDiscover={handleDiscover}
            tradeableMintSet={tradeableMintSet}
            onShareReward={handleCampaignShare}
          />
        );
      case 'project-detail': {
        const activeProj = projects.find((p) => p.id === selectedProjectId) || projects[0];
        return (
          <ProjectDetailView
            project={activeProj}
            wallet={wallet}
            onFund={handleFundProject}
            onOpenRaise={() => {
              setSelectedProjectId(HOOD_SHARE_PROJECT_ID);
              setSelectedRaiseId(HOOD_SHARE_ID);
              setCurrentPath('raise', {
                projectId: HOOD_SHARE_PROJECT_ID,
                raiseId: HOOD_SHARE_ID,
              });
            }}
            onAddComment={handleAddComment}
            onBack={() => setCurrentPath('explore')}
            onTrade={navigateToTrade}
            onAskIntelligence={openIntelligence}
            tradeableMintSet={tradeableMintSet}
            builders={builders}
            setCurrentPath={setCurrentPath}
            onShareReward={handleCampaignShare}
          />
        );
      }
      case 'swap':
        return (
          <SwapView
            key={swapOutputMint || 'default-swap'}
            transactions={transactions}
            onSwapComplete={handleSwapComplete}
            onTradeShared={() => {
              handleCampaignShare('X / Twitter');
            }}
            initialOutputMint={swapOutputMint}
          />
        );
      case 'apply':
      case 'launch':
        return (
          <LaunchView
            wallet={wallet}
            onLaunch={handleLaunchProject}
            connectWallet={connectWallet}
            setCurrentPath={setCurrentPath}
            walletAddress={walletKey || undefined}
          />
        );
      case 'launchpad':
        return (
          <LaunchpadView
            projects={projects}
            setSelectedProjectId={setSelectedProjectId}
            setSelectedRaiseId={setSelectedRaiseId}
            setCurrentPath={setCurrentPath}
            onTrade={navigateToTrade}
            onSupport={() => {
              setSelectedProjectId(HOOD_SHARE_PROJECT_ID);
              setSelectedRaiseId(HOOD_SHARE_ID);
              setCurrentPath('raise', {
                projectId: HOOD_SHARE_PROJECT_ID,
                raiseId: HOOD_SHARE_ID,
              });
            }}
            tradeableMintSet={tradeableMintSet}
          />
        );
      case 'raise':
        if (isHoodShareId(selectedRaiseId) || !selectedRaiseId) {
          return (
            <HoodShareView
              project={
                projects.find((p) => p.id === selectedProjectId) ||
                projects.find((p) => p.id === HOOD_SHARE_PROJECT_ID)
              }
              onBack={() => setCurrentPath('launchpad')}
              setCurrentPath={setCurrentPath}
            />
          );
        }
        return (
          <LaunchRaiseView
            raiseId={selectedRaiseId || LIVE_AURA_RAISE_SEED.id}
            project={
              projects.find((p) => p.id === selectedProjectId) ||
              projects.find((p) => p.id === LIVE_AURA_RAISE_SEED.projectId)
            }
            wallet={wallet}
            connectWallet={connectWallet}
            onBack={() => setCurrentPath('launchpad')}
            setCurrentPath={setCurrentPath}
          />
        );
      case 'team':
        return <TeamView setCurrentPath={setCurrentPath} />;
      case 'blog':
        return (
          <BlogView
            setCurrentPath={setCurrentPath}
            blogSlug={blogSlug}
            setBlogSlug={setBlogSlugAndUrl}
          />
        );
      case 'feedback':
        return (
          <FeedbackSupportView initialTab="feedback" setCurrentPath={setCurrentPath} />
        );
      case 'support':
        return (
          <FeedbackSupportView initialTab="support" setCurrentPath={setCurrentPath} />
        );
      case 'telegram-bot':
        return <TelegramBotView setCurrentPath={setCurrentPath} />;
      case 'tg-vote':
        return <TelegramVoteMiniApp />;
      case 'vision':
      case 'roadmap':
      case 'manifesto':
        return (
          <VisionRoadmapManifestView
            page={currentPath as 'vision' | 'roadmap' | 'manifesto'}
            setCurrentPath={setCurrentPath}
          />
        );
      case 'terms':
      case 'privacy':
      case 'imprint':
      case 'contact':
      case 'faq':
      case 'mission':
      case 'story':
      case 'guide':
        return (
          <LegalView
            docId={currentPath as keyof typeof LEGAL_DOCS}
            setCurrentPath={setCurrentPath}
          />
        );
      case 'builders':
        return (
          <BuildersView
            builders={builders}
            projects={projects}
            quests={quests}
            onCompleteQuest={handleCompleteQuest}
            onFollowBuilder={() => {
              handleAddXp(50);
              setPassport((p) => ({
                ...p,
                communitiesSupported: p.communitiesSupported + 1,
              }));
            }}
            setSelectedProjectId={setSelectedProjectId}
            setCurrentPath={setCurrentPath}
          />
        );
      case 'dao':
        return (
          <DaoView
            wallet={wallet}
            proposals={proposals}
            onVote={handleCastVote}
            onStake={handleStakeBuild}
            stakedBuild={stakedBuild}
          />
        );
      case 'earn':
        return (
          <EarnView
            wallet={wallet}
            stakedBuild={stakedBuild}
            onStake={handleStakeBuild}
            onRequestUnstake={handleRequestUnstake}
            onClaimUnstake={handleClaimUnstake}
            pendingUnstake={pendingUnstake}
            onProvideLiquidity={handleProvideLiquidity}
            lpDeposits={lpDeposits}
            tasks={growthTasks}
            startedTaskIds={startedTaskIds}
            onStartTask={handleStartGrowthTask}
            onCompleteTask={handleCompleteGrowthTask}
            onDailySpin={(prize) => {
              handleAddXp(prize.xp);
              setContributionsCount((c) => c + 1);
              setPassport((p) => ({
                ...p,
                previousContributions: p.previousContributions + 1,
                communityTrust: Math.min(100, p.communityTrust + 1),
              }));
              setGrowthTasks((prev) =>
                prev.map((t) =>
                  t.id === 't_daily_spin' ? { ...t, completed: true } : t
                )
              );
            }}
            isStaker={stakedBuild > 0 || Boolean(pendingUnstake)}
            setCurrentPath={setCurrentPath}
            builderXp={builderXp}
          />
        );
      case 'terminal':
        return (
          <TerminalView
            projects={projects}
            scoutMissions={scoutMissions}
            onCompleteScout={handleCompleteScout}
            onVoteArena={handleVoteArena}
            arenaVotes={arenaVotes}
            setSelectedProjectId={setSelectedProjectId}
            setCurrentPath={setCurrentPath}
            scoutXp={passport.scoutXp || 0}
            watchlistUpdates={
              discoveredIds.size > 0 ? discoveredIds.size : 3
            }
            walletAddress={walletKey}
            onConnectWallet={connectWallet}
            userScout={{
              id: 'you',
              name: userProfile.displayName || 'You',
              title:
                (passport.scoutXp || 0) >= 1500
                  ? 'Genesis Scout'
                  : (passport.scoutXp || 0) >= 500
                    ? 'Core Scout'
                    : 'Field Scout',
              projectsDiscovered: passport.projectsDiscovered,
              earlyCalls: passport.earlyCalls || 0,
              researchAccuracy: passport.researchAccuracy || 0,
              scoutReputation: Math.min(
                100,
                Math.round((passport.scoutXp || 0) / 20 + passport.builderReputation / 2)
              ),
            }}
            convictions={convictions}
          />
        );
      case 'ai':
        return (
          <AiView
            onAddXp={handleAddXp}
            onIntelUsed={() => {
              handleCompleteQuest('g_q4');
              handleCompleteGrowthTask('t_intel');
            }}
            initialPrompt={intelPrompt}
            onPromptConsumed={() => setIntelPrompt(null)}
            onOpenTerminal={() => setCurrentPath('terminal')}
          />
        );
      case 'profile':
        return (
          <ProfileView
            wallet={wallet}
            builderXp={builderXp}
            builderLevelName={builderLevelName}
            contributionsCount={contributionsCount}
            passport={passport}
            profile={userProfile}
            onSaveProfile={(profile) => {
              setUserProfile(profile);
              if (profile.socials?.x || profile.socials?.farcaster) {
                handleCompleteGrowthTask('t_passport');
              }
            }}
            myProjects={projects.filter((p) => myProjectIds.includes(p.id))}
            onSubmitProject={handleLaunchProject}
            quests={quests}
            transactions={transactions}
            onOpenIntelligence={() => openIntelligence()}
            onOpenTerminal={() => setCurrentPath('terminal')}
            onOpenLaunchpad={() => setCurrentPath('launchpad')}
            setSelectedProjectId={setSelectedProjectId}
            setCurrentPath={setCurrentPath}
            connectWallet={connectWallet}
            walletAddress={walletKey || undefined}
          />
        );
      case 'campaign':
        return <ShareCampaignView onShareAction={handleCampaignShare} />;
      case 'investor':
        return (
          <InvestorModeView
            projects={projects}
            onOpenStory={navigateToStory}
            setCurrentPath={setCurrentPath}
          />
        );
      case 'builder-graph':
        return (
          <BuilderGraphExplorer
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setCurrentPath('project-detail');
            }}
            onOpenBuilder={() => setCurrentPath('builders')}
          />
        );
      case 'builder-stories':
        return (
          <BuilderStoriesView
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setCurrentPath('project-detail');
            }}
          />
        );
      case 'review':
        return <ReviewDeskView />;
      case 'aura':
        return <AuraLiveView setCurrentPath={setCurrentPath} />;
      case 'hood':
        return <HoodGuideView setCurrentPath={setCurrentPath} />;
      case 'cubes':
        return <CubesLiveView setCurrentPath={setCurrentPath} />;
      default:
        return (
          <LandingView
            setCurrentPath={setCurrentPath}
            projects={projects}
            builders={builders}
            setSelectedProjectId={setSelectedProjectId}
            onTrade={navigateToTrade}
            onOpenStory={navigateToStory}
            tradeableMintSet={tradeableMintSet}
            tradeableTokens={tradeableTokens}
            onStartFirstDiscovery={() => setFirstDiscoveryOpen(true)}
            highlightWallet={walletKey}
          />
        );
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const tradeableCount = tradeableTokens.length;

  // Telegram Mini App: vote-only chrome (no DEX nav / wallet / chat)
  if (currentPath === 'tg-vote') {
    return (
      <div className="min-h-[100dvh] bg-[#0b0f14] font-sans text-white">
        <Seo path="tg-vote" />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <TelegramVoteMiniApp />
          </Suspense>
        </ErrorBoundary>
        {customAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-sm space-y-4 rounded-3xl border border-accent/30 bg-surface/80 p-6 text-center">
              <p className="whitespace-pre-line text-xs text-steel">{customAlert.message}</p>
              <button
                type="button"
                onClick={() => setCustomAlert(null)}
                className="w-full rounded-xl bg-accent py-2.5 text-xs font-bold text-ink"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ink font-sans text-white selection:bg-accent selection:text-ink">
      <Seo
        path={currentPath}
        project={currentPath === 'project-detail' ? activeProject : undefined}
        projectName={activeProject?.name}
        blogSlug={blogSlug}
      />
      {import.meta.env.VITE_SHOW_DEV_RIBBON === 'true' && (
        <div className="dev-ribbon" aria-hidden="true">
          <span>Still in development</span>
        </div>
      )}
      <div>
        <Navbar
          currentPath={currentPath}
          setCurrentPath={(path) => {
            if (path !== 'blog') setBlogSlug(null);
            setCurrentPath(path);
          }}
          builderXp={builderXp}
          builderLevelName={builderLevelName}
          walletLabel={connected ? walletDisplay.label : undefined}
          walletDomain={walletDisplay.domain}
        />
        <main className="pt-2 pb-28 lg:pb-16">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>{renderView()}</Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <SiteFooter
        setCurrentPath={(path) => {
          if (path !== 'blog') setBlogSlug(null);
          setCurrentPath(path);
        }}
        tradeableCount={tradeableCount}
      />

      <ChatFab onClick={() => setChatOpen(true)} />
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        displayName={connected ? walletDisplay.label : 'Guest'}
      />

      <FirstDiscoveryModal
        open={firstDiscoveryOpen}
        onClose={() => {
          setFirstDiscoveryOpen(false);
          setHasCompletedFirstDiscovery(true);
          try {
            localStorage.setItem('bdx_first_discovery', '1');
          } catch {
            /* ignore */
          }
        }}
        projects={projects}
        onPick={completeFirstDiscovery}
      />

      {customAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm space-y-4 rounded-3xl border border-accent/30 bg-surface/80 p-6 text-center shadow-[0_0_50px_rgba(200, 232, 104,0.12)] backdrop-blur-2xl">
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-accent">
              Notification
            </h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-steel">
              {customAlert.message}
            </p>
            <button
              type="button"
              onClick={() => setCustomAlert(null)}
              className="w-full rounded-xl bg-accent py-2.5 text-xs font-bold text-ink hover:bg-accent-bright"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
