export type TreeNode = {
  id: string;
  parent_id: string | null;
  name: string;
  icon: string;
  color: string;
  position_x: number;
  position_y: number;
  sort_order: number;
  created_at: string;
};

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export type Todo = {
  id: string;
  node_id: string;
  title: string;
  done: boolean;
  priority: Priority;
  due_date: string | null;
  sort_order: number;
  created_at: string;
};

export type Note = {
  id: string;
  node_id: string;
  content: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  node_id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type PipelineStage = 'lead' | 'active' | 'closed' | 'lost';

export type PipelineItem = {
  id: string;
  node_id: string;
  title: string;
  stage: PipelineStage;
  contact: string | null;
  value: number | null;
  notes: string | null;
  sort_order: number;
  updated_at: string;
};

export type NodeWithCounts = TreeNode & {
  todo_count?: number;
  urgent_count?: number;
};
