import React, { useState } from 'react';
import { Vote, ShieldCheck, Award, TrendingUp, HelpCircle, ArrowUpRight, Flame, Layers, Lock, Sparkles } from 'lucide-react';
import { Proposal, UserWallet } from '../types';

interface DaoViewProps {
  wallet: UserWallet;
  proposals: Proposal[];
  onVote: (proposalId: string, direction: 'for' | 'against', weight: number) => void;
  onStake: (amount: number) => void;
  stakedBuild: number;
}

export default function DaoView({
  wallet,
  proposals,
  onVote,
  onStake,
  stakedBuild,
}: DaoViewProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) return;

    if (!wallet.connected) {
      alert('Please connect your simulated wallet first.');
      return;
    }

    const buildBalance = wallet.balances['BUILD'] || 0;
    if (amount > buildBalance) {
      alert(`Insufficient $BUILD balance. You have ${buildBalance} but requested to stake ${amount}.`);
      return;
    }

    setIsStaking(true);
    setTimeout(() => {
      onStake(amount);
      setStakeAmount('');
      setIsStaking(false);
      alert(`Successfully staked ${amount.toLocaleString()} $BUILD tokens!\nYour voting weight is now multiplied by 1.5x and you earned +150 reputation XP!`);
    }, 1200);
  };

  const handleCastVote = (proposal: Proposal, direction: 'for' | 'against') => {
    if (!wallet.connected) {
      alert('Please connect your simulated wallet first.');
      return;
    }

    if (proposal.userVoted) {
      alert('You have already cast your governance weight on this proposal.');
      return;
    }

    // Determine weight based on BUILD balance + staked BUILD multiplier
    const buildWeight = wallet.balances['BUILD'] || 0;
    const votingWeight = (buildWeight + stakedBuild * 1.5) || 100; // minimum weight of 100 for trial votes

    onVote(proposal.id, direction, votingWeight);
    alert(`Vote recorded! Casted ${votingWeight.toLocaleString()} voting weight in favor of "${direction === 'for' ? 'FOR' : 'AGAINST'}".\nEarned +100 XP!`);
  };

  // Tokenomics configuration
  const allocation = [
    { name: 'Community Rewards', pct: 40, tokens: '400,000,000', desc: 'Farming, contributor quests, and developer rewards.' },
    { name: 'Ecosystem Growth', pct: 20, tokens: '200,000,000', desc: 'Marketing campaigns, strategic developer grants.' },
    { name: 'Protocol Liquidity', pct: 15, tokens: '150,000,000', desc: 'Locked DEX router pool pairs.' },
    { name: 'Core Founders & Team', pct: 15, tokens: '150,000,000', desc: 'Locked inside 2-year vesting linear smart contracts.' },
    { name: 'DAO Reserve Treasury', pct: 10, tokens: '100,000,000', desc: 'Emergency stabilization resources.' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-white space-y-10">
      
      {/* Title */}
      <div className="border-b border-white/[0.08] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Builders DAO Station</h1>
          <p className="text-slate-400 mt-1 text-sm">Empower community management. Stake $BUILD tokens to unlock high voting power, draft proposals, and allocate treasury funds.</p>
        </div>
        <div className="flex items-center space-x-1.5 rounded-lg bg-accent/10 border border-accent/25 px-3.5 py-1.5 text-xs font-mono text-accent">
          <Vote className="h-4 w-4 animate-bounce" />
          <span>On-Chain Governance Station</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Staking Hub & Proposals */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Staking Card */}
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent/[0.05] p-6 backdrop-blur-xl shadow-[0_0_20px_rgba(200,232,104,0.08)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <span className="rounded-full bg-accent/10 border border-accent/25 px-2.5 py-1 text-[10px] font-mono font-bold text-accent uppercase tracking-wide">
                  Staking Pool Live
                </span>
                <h3 className="text-lg font-bold font-sans">Staking Governance Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Lock your $BUILD tokens inside our governance pool to yield 12.4% APY rewards, receive a 1.5x Voting Weight multiplier, and increase your dynamic Builder Passport Level.
                </p>
                <div className="flex space-x-6 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500">Staked Balance</span>
                    <p className="text-white font-extrabold text-sm mt-0.5">{stakedBuild.toLocaleString()} $BUILD</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Voting Power</span>
                    <p className="text-accent font-extrabold text-sm mt-0.5">{(stakedBuild * 1.5).toLocaleString()} Votes</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStakeSubmit} className="space-y-3 rounded-2xl bg-black/40 border border-white/10 p-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Stake Amount</span>
                    <span>Available: {(wallet.balances['BUILD'] || 0).toLocaleString()} $BUILD</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono font-bold text-accent">$BUILD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isStaking || !stakeAmount}
                  id="stake-build-btn"
                  className="w-full flex items-center justify-center space-x-1 rounded-lg bg-gradient-to-r from-accent to-accent-bright py-2.5 text-xs font-bold text-white shadow-md hover:from-accent-bright hover:to-accent transition-all cursor-pointer"
                >
                  <span>{isStaking ? 'Interacting with pool...' : 'Stake $BUILD'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Active Proposals list */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-sans flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Active Governance Proposals</span>
            </h2>

            <div className="space-y-4">
              {proposals.map((p) => {
                const totalVotes = p.votesFor + p.votesAgainst;
                const forPct = totalVotes > 0 ? (p.votesFor / totalVotes) * 100 : 50;
                return (
                  <div key={p.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                            p.status === 'active'
                              ? 'bg-accent/15 text-accent border border-accent/25'
                              : 'bg-white/[0.06] text-white/80 border border-white/20'
                          }`}>
                            {p.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{p.category} &bull; Created by {p.creator}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-sans mt-1">{p.title}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.description}</p>

                    {/* Progress vote bars */}
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden flex">
                        <div className="h-full bg-accent" style={{ width: `${forPct}%` }} />
                        <div className="h-full bg-white/25" style={{ width: `${100 - forPct}%` }} />
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-slate-500">
                        <span className="text-accent font-bold">FOR: {p.votesFor.toLocaleString()} Votes ({forPct.toFixed(0)}%)</span>
                        <span className="text-steel font-bold">AGAINST: {p.votesAgainst.toLocaleString()} Votes ({(100 - forPct).toFixed(0)}%)</span>
                      </div>
                    </div>

                    {/* Vote CTA buttons */}
                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">Voting Ends: {p.endsAt}</span>
                      
                      {p.userVoted ? (
                        <span className="text-xs font-mono text-slate-500 italic">
                          Weight recorded (Voted {p.userVoted.toUpperCase()})
                        </span>
                      ) : p.status === 'active' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCastVote(p, 'for')}
                            id={`vote-for-btn-${p.id}`}
                            className="rounded border border-accent/30 hover:border-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 text-xs font-mono font-bold text-accent transition-all cursor-pointer"
                          >
                            VOTE FOR
                          </button>
                          <button
                            onClick={() => handleCastVote(p, 'against')}
                            id={`vote-against-btn-${p.id}`}
                            className="rounded border border-white/20 hover:border-white/40 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-1.5 text-xs font-mono font-bold text-steel transition-all cursor-pointer"
                          >
                            VOTE AGAINST
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          CONCLUDED
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Tokenomics Allocation */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-base font-bold font-sans flex items-center space-x-2 border-b border-white/[0.04] pb-3 mb-2">
              <Award className="h-5 w-5 text-accent" />
              <span>BUILD Tokenomics allocation</span>
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Supply</span>
                <p className="text-2xl font-extrabold text-white font-sans mt-0.5">1,000,000,000 $BUILD</p>
              </div>

              <div className="space-y-3.5 pt-2">
                {allocation.map((alloc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-semibold">
                      <span className="text-slate-300">{alloc.name}</span>
                      <span className="text-accent">{alloc.pct}% ({alloc.tokens})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">{alloc.desc}</p>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-accent-bright rounded-full"
                        style={{ width: `${alloc.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
