import {
  ANALYST_SYSTEM,
  executeAnalystTool,
  type ToolCitation,
} from './tools';

type ChatMessage = { role: 'user' | 'model'; content: string };

type ScoreFetcher = (projectId: string) => Promise<{
  score: { overall: number; [k: string]: number };
  citations: { id: string; label: string; detail: string; status: string }[];
  computedAt: string;
  version: string;
} | null>;

type GenerateFn = (opts: {
  contents: unknown;
  config?: Record<string, unknown>;
}) => Promise<{ text?: string }>;

const PROJECT_ID_RE = /\b(p\d+)\b/gi;

function extractProjectIds(text: string): string[] {
  const ids = new Set<string>();
  for (const m of text.matchAll(PROJECT_ID_RE)) {
    ids.add(m[1].toLowerCase());
  }
  // common names → ids
  const lower = text.toLowerCase();
  if (lower.includes('llama')) ids.add('p1');
  if (lower.includes('aave')) ids.add('p2');
  if (lower.includes('wormhole')) ids.add('p3');
  if (lower.includes('metaplex')) ids.add('p4');
  return [...ids].slice(0, 6);
}

function wantsRadar(q: string): boolean {
  return /radar|today|mover|pulse|morning|digest/i.test(q);
}

function wantsScout(q: string): boolean {
  return /scout|leaderboard|early call|thesis/i.test(q);
}

function wantsTrending(q: string): boolean {
  return /telegram|trending|vote|community clear/i.test(q);
}

function wantsMethodology(q: string): boolean {
  return /methodolog|weight|how.*score|dimension/i.test(q);
}

function categoryHint(q: string): string {
  if (/\bai\b|llm|agent/i.test(q)) return 'AI';
  if (/depin/i.test(q)) return 'DePIN';
  if (/defi|lend|aave/i.test(q)) return 'DeFi';
  if (/infra|bridge|wormhole/i.test(q)) return 'Infrastructure';
  if (/creator|metaplex|nft/i.test(q)) return 'Creator';
  return '';
}

/**
 * Server-side tool gather → single cited generation.
 * Avoids Gemini multi-turn thought_signature breakage while still being tool-using.
 */
export async function runToolUsingAnalyst(input: {
  messages: ChatMessage[];
  generate: GenerateFn;
  buildLiveScore: ScoreFetcher;
}): Promise<{
  text: string;
  toolsUsed: ToolCitation[];
  toolRounds: number;
}> {
  const lastUser =
    [...input.messages].reverse().find((m) => m.role === 'user')?.content || '';
  const toolsUsed: ToolCitation[] = [];
  const toolPayloads: { tool: string; data: unknown }[] = [];

  const run = async (name: string, args: Record<string, unknown>) => {
    const result = await executeAnalystTool(name, args, {
      buildLiveScore: input.buildLiveScore,
    });
    if (result.citation) toolsUsed.push(result.citation);
    toolPayloads.push({ tool: name, data: result.data });
    return result;
  };

  // Always load catalog (filtered when possible)
  const category = categoryHint(lastUser);
  const status = /reject/i.test(lastUser)
    ? 'rejected'
    : /review|pending|under evaluation/i.test(lastUser)
      ? 'reviewed'
      : /curated|genesis/i.test(lastUser)
        ? 'curated'
        : 'any';
  await run('list_catalog', {
    category,
    status,
    query: category ? '' : lastUser.slice(0, 80),
  });

  const projectIds = extractProjectIds(lastUser);
  // If AI asked without ids, score top AI/catalog matches from first tool
  const catalog = toolPayloads[0]?.data as
    | { projects?: { projectId: string }[] }
    | undefined;
  const scoreIds = [
    ...projectIds,
    ...(catalog?.projects || []).map((p) => p.projectId),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4);

  for (const projectId of scoreIds) {
    await run('get_builder_score', { projectId });
  }

  if (wantsRadar(lastUser) || scoreIds.length === 0) {
    await run('get_daily_radar', {});
  }
  if (wantsScout(lastUser)) {
    await run('list_scout_calls', { mode: 'recent', limit: 8 });
    await run('list_scout_calls', { mode: 'leaderboard', limit: 8 });
  }
  if (wantsTrending(lastUser)) {
    await run('list_telegram_trending', { limit: 8 });
  }
  if (wantsMethodology(lastUser)) {
    await run('get_score_methodology', {});
  }

  const contextBlock = JSON.stringify(
    {
      note: 'Live tool results — cite these only. Do not invent projects or scores.',
      tools: toolPayloads,
    },
    null,
    2,
  ).slice(0, 28_000);

  const contents = [
    ...input.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [
        {
          text: `TOOL_RESULTS (authoritative):\n${contextBlock}\n\nAnswer the latest user question using only these results. Include a short Sources line listing tool labels.`,
        },
      ],
    },
  ];

  const response = await input.generate({
    contents,
    config: {
      systemInstruction: ANALYST_SYSTEM,
      temperature: 0.35,
    },
  });

  const text = (response.text || '').trim();
  if (!text) throw new Error('Empty analyst response');
  return { text, toolsUsed, toolRounds: 1 };
}
