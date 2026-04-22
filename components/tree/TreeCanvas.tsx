'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import CustomNode from './CustomNode';
import AddNodeModal from './AddNodeModal';
import NodePanel from '@/components/panel/NodePanel';
import { layoutTree } from '@/lib/tree-layout';
import type { TreeNode } from '@/lib/types';

const nodeTypes: NodeTypes = { custom: CustomNode };

export default function TreeCanvas() {
  const [rawNodes, setRawNodes] = useState<TreeNode[]>([]);
  const [countsByNode, setCountsByNode] = useState<Record<string, { todo: number; urgent: number }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [nRes, tRes] = await Promise.all([fetch('/api/nodes'), fetch('/api/todos')]);
    const n: TreeNode[] = await nRes.json();
    const todos: { node_id: string; done: boolean; priority: string; due_date: string | null }[] = await tRes.json();
    const counts: Record<string, { todo: number; urgent: number }> = {};
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const soonStr = soon.toISOString().slice(0, 10);
    todos.forEach((t) => {
      if (t.done) return;
      counts[t.node_id] ||= { todo: 0, urgent: 0 };
      counts[t.node_id].todo++;
      if (t.priority === 'urgent' || (t.due_date && t.due_date <= soonStr)) counts[t.node_id].urgent++;
    });
    setCountsByNode(counts);
    setRawNodes(n);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addChild = useCallback((parentId: string) => setAddParentId(parentId), []);
  const selectNode = useCallback((id: string) => setSelectedId(id), []);

  const rebuild = useCallback(() => {
    const rfNodes = rawNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        name: n.name,
        icon: n.icon,
        color: n.color,
        isRoot: !n.parent_id,
        todoCount: countsByNode[n.id]?.todo,
        urgentCount: countsByNode[n.id]?.urgent,
        onAddChild: addChild,
        onSelect: selectNode,
      },
    }));
    const rfEdges = rawNodes
      .filter((n) => n.parent_id)
      .map((n) => ({
        id: `e-${n.parent_id}-${n.id}`,
        source: n.parent_id!,
        target: n.id,
        type: 'smoothstep',
        animated: false,
      }));
    setNodes(layoutTree(rfNodes, rfEdges, 'TB'));
    setEdges(rfEdges);
  }, [rawNodes, countsByNode, addChild, selectNode, setNodes, setEdges]);

  useEffect(() => {
    rebuild();
  }, [rebuild]);

  async function handleCreate(data: { name: string; icon: string; color: string }) {
    const res = await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, parent_id: addParentId }),
    });
    const created: TreeNode = await res.json();
    setRawNodes((prev) => [...prev, created]);
    setSelectedId(created.id);
  }

  const selectedNode = useMemo(() => rawNodes.find((n) => n.id === selectedId) ?? null, [rawNodes, selectedId]);
  const parentOfAdd = rawNodes.find((n) => n.id === addParentId);

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white/50">Cargando árbol...</div>}
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff20" />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => (n.data as { color?: string }).color || '#06D6A0'}
            maskColor="rgba(10,15,30,0.75)"
            className="!bg-white/5 !border !border-white/10 !rounded-xl hidden sm:block"
          />
        </ReactFlow>
      </ReactFlowProvider>

      {addParentId && parentOfAdd && (
        <AddNodeModal
          parentName={parentOfAdd.name}
          onClose={() => setAddParentId(null)}
          onCreate={handleCreate}
        />
      )}

      {selectedNode && (
        <NodePanel
          node={selectedNode}
          allNodes={rawNodes}
          onClose={() => setSelectedId(null)}
          onDeleted={(id) => {
            setRawNodes((prev) => prev.filter((n) => n.id !== id && n.parent_id !== id));
            setSelectedId(null);
            fetchAll();
          }}
          onTodoChange={fetchAll}
        />
      )}
    </div>
  );
}
