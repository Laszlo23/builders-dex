import React, { useMemo, useState } from 'react';
import {
  BUILDER_GRAPH,
  GraphNode,
  GraphNodeKind,
} from '../data/builderPlatform';
import { ArrowDown, Network } from 'lucide-react';

const TYPE_LABEL: Record<GraphNodeKind, string> = {
  builder: 'Builder',
  project: 'Project',
  contributor: 'Contributor',
  auditor: 'Auditor',
  investor: 'Investor',
  opensource: 'Open Source',
  protocol: 'Protocol using it',
};

const LAYERS: GraphNodeKind[] = [
  'builder',
  'project',
  'contributor',
  'auditor',
  'investor',
  'opensource',
  'protocol',
];

type Props = {
  onOpenProject?: (projectId: string) => void;
  onOpenBuilder?: (builderId: string) => void;
};

export default function BuilderGraphExplorer({ onOpenProject, onOpenBuilder }: Props) {
  const [selected, setSelected] = useState<string>('b_alex');
  const { nodes, edges } = BUILDER_GRAPH;

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selected) ?? nodes[0],
    [nodes, selected],
  );

  const related = useMemo(() => {
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.from === selected) ids.add(e.to);
      if (e.to === selected) ids.add(e.from);
    }
    return nodes.filter((n) => ids.has(n.id));
  }, [edges, nodes, selected]);

  const byLayer = useMemo(() => {
    const m = new Map<GraphNodeKind, GraphNode[]>();
    for (const t of LAYERS) m.set(t, []);
    for (const n of nodes) m.get(n.kind)?.push(n);
    return m;
  }, [nodes]);

  function activate(n: GraphNode) {
    setSelected(n.id);
  }

  function openSelected() {
    if (selectedNode.kind === 'project' && selectedNode.projectId && onOpenProject) {
      onOpenProject(selectedNode.projectId);
    }
    if (selectedNode.kind === 'builder' && selectedNode.builderId && onOpenBuilder) {
      onOpenBuilder(selectedNode.builderId);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <Network className="h-3.5 w-3.5" />
          Builder Graph™
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold md:text-3xl">
          A living knowledge graph
        </h1>
        <p className="mt-2 text-sm text-steel">
          Click any node. Explore builders → projects → contributors → auditors →
          investors → open source → protocols.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-white/10 bg-surface p-4 md:p-6">
          <div className="space-y-3">
            {LAYERS.map((layer, i) => {
              const layerNodes = byLayer.get(layer) ?? [];
              if (layerNodes.length === 0) return null;
              return (
                <div key={layer}>
                  {i > 0 && (
                    <div className="mb-2 flex justify-center text-accent/50">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-steel">
                    {TYPE_LABEL[layer]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {layerNodes.map((n) => {
                      const isSel = n.id === selected;
                      const isRel = related.some((r) => r.id === n.id);
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => activate(n)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isSel
                              ? 'border-accent bg-accent text-ink'
                              : isRel
                                ? 'border-accent/40 bg-accent/15 text-accent'
                                : 'border-white/12 bg-ink/50 text-white/80 hover:border-white/25'
                          }`}
                        >
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-accent/25 bg-accent/10 p-5">
          <p className="font-mono text-[10px] uppercase text-accent">
            {TYPE_LABEL[selectedNode.kind]}
          </p>
          <h2 className="font-display mt-1 text-xl font-bold">{selectedNode.label}</h2>
          {selectedNode.meta && (
            <p className="mt-1 text-xs text-steel">{selectedNode.meta}</p>
          )}
          <p className="mt-3 font-mono text-[10px] uppercase text-steel">Connected to</p>
          <ul className="mt-2 space-y-1.5">
            {related.length === 0 && (
              <li className="text-sm text-steel">No edges yet — keep exploring.</li>
            )}
            {related.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => activate(r)}
                  className="w-full rounded-xl border border-white/10 bg-ink/40 px-3 py-2 text-left text-sm hover:border-accent/30"
                >
                  <span className="font-mono text-[9px] uppercase text-steel">
                    {TYPE_LABEL[r.kind]}
                  </span>
                  <span className="mt-0.5 block font-semibold">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
          {((selectedNode.kind === 'project' && selectedNode.projectId && onOpenProject) ||
            (selectedNode.kind === 'builder' && selectedNode.builderId && onOpenBuilder)) && (
            <button
              type="button"
              onClick={openSelected}
              className="mt-4 w-full rounded-full bg-accent py-2.5 text-sm font-bold text-ink hover:bg-accent-bright"
            >
              {selectedNode.kind === 'project' ? 'Open project' : 'Open Builder 100'}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
