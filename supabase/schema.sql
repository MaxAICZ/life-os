-- =========================================================
-- Life OS Schema
-- Copy/paste this into Supabase SQL Editor and run.
-- =========================================================

-- Drop existing (safe re-run)
drop table if exists pipeline_items cascade;
drop table if exists documents cascade;
drop table if exists notes cascade;
drop table if exists todos cascade;
drop table if exists nodes cascade;

-- Nodes (the tree)
create table nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references nodes(id) on delete cascade,
  name text not null,
  icon text default '📁',
  color text default '#06D6A0',
  position_x float default 0,
  position_y float default 0,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index nodes_parent_idx on nodes(parent_id);

-- To-dos
create table todos (
  id uuid primary key default gen_random_uuid(),
  node_id uuid references nodes(id) on delete cascade not null,
  title text not null,
  done boolean default false,
  priority text default 'normal' check (priority in ('urgent','high','normal','low')),
  due_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index todos_node_idx on todos(node_id);
create index todos_priority_idx on todos(priority) where done = false;
create index todos_due_idx on todos(due_date) where done = false;

-- Notes (one row per node, upsert pattern)
create table notes (
  id uuid primary key default gen_random_uuid(),
  node_id uuid references nodes(id) on delete cascade not null unique,
  content text default '',
  updated_at timestamptz default now()
);

create index notes_node_idx on notes(node_id);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  node_id uuid references nodes(id) on delete cascade not null,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz default now()
);

create index documents_node_idx on documents(node_id);

-- Pipeline
create table pipeline_items (
  id uuid primary key default gen_random_uuid(),
  node_id uuid references nodes(id) on delete cascade not null,
  title text not null,
  stage text default 'lead' check (stage in ('lead','active','closed','lost')),
  contact text,
  value numeric,
  notes text,
  sort_order int default 0,
  updated_at timestamptz default now()
);

create index pipeline_node_idx on pipeline_items(node_id);

-- =========================================================
-- Seed initial hierarchy
-- =========================================================
do $$
declare
  root_id uuid;
  cz_id uuid;
  dvote_id uuid;
  janina_id uuid;
  finances_id uuid;
  bls_id uuid;
  personal_id uuid;
  finances_bls_id uuid;
begin
  insert into nodes (name, icon, color) values ('Izaak', '🧠', '#06D6A0') returning id into root_id;

  insert into nodes (parent_id, name, icon, color) values (root_id, 'Concept Zero', '🏢', '#06D6A0') returning id into cz_id;
  insert into nodes (parent_id, name, icon) values (cz_id, 'Clients', '👥');
  insert into nodes (parent_id, name, icon) values (cz_id, 'Pipeline', '📈');
  insert into nodes (parent_id, name, icon) values (cz_id, 'Documents', '📄');

  insert into nodes (parent_id, name, icon, color) values (root_id, 'D''Vote', '💝', '#ff6b9d') returning id into dvote_id;
  insert into nodes (parent_id, name, icon) values (dvote_id, 'To-dos', '✅');
  insert into nodes (parent_id, name, icon) values (dvote_id, 'Notes', '📝');

  insert into nodes (parent_id, name, icon, color) values (root_id, 'Janina', '💍', '#f59e0b') returning id into janina_id;
  insert into nodes (parent_id, name, icon) values (janina_id, 'Casa', '🏠');
  insert into nodes (parent_id, name, icon) values (janina_id, 'CoCreation Club', '✨');
  insert into nodes (parent_id, name, icon) values (janina_id, 'Requests', '💬');

  insert into nodes (parent_id, name, icon, color) values (root_id, 'Finances', '💰', '#22c55e') returning id into finances_id;
  insert into nodes (parent_id, name, icon) values (finances_id, 'BofA', '🏦');
  insert into nodes (parent_id, name, icon) values (finances_id, 'BLS', '🌐') returning id into finances_bls_id;

  insert into nodes (parent_id, name, icon, color) values (root_id, 'BLS', '🌐', '#3b82f6') returning id into bls_id;
  insert into nodes (parent_id, name, icon) values (bls_id, 'Fundalo', '🇻🇪');
  insert into nodes (parent_id, name, icon) values (bls_id, 'LS Remittances', '💸');

  insert into nodes (parent_id, name, icon, color) values (root_id, 'Personal', '🌱', '#a855f7') returning id into personal_id;
  insert into nodes (parent_id, name, icon) values (personal_id, 'Health', '💪');
  insert into nodes (parent_id, name, icon) values (personal_id, 'Goals', '🎯');
end $$;

-- =========================================================
-- Storage bucket for documents
-- Run this AFTER creating the bucket "documents" in Supabase UI
-- (Storage > New bucket > documents > private)
-- =========================================================
-- Policies needed (apply via dashboard):
-- Storage > documents > Policies:
--   allow authenticated users to SELECT, INSERT, UPDATE, DELETE
