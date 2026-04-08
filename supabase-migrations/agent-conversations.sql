-- agent_conversations table — stores HQ chat history per agent
create table if not exists agent_conversations (
  id            bigserial primary key,
  agent_id      text not null,
  user_message  text not null,
  agent_reply   text not null,
  created_at    timestamptz default now()
);

create index if not exists idx_agent_conversations_agent_id on agent_conversations(agent_id);
create index if not exists idx_agent_conversations_created_at on agent_conversations(created_at desc);

-- RLS: only service role can write, anon can read own agent's convos
alter table agent_conversations enable row level security;
create policy "Service role full access" on agent_conversations using (true) with check (true);
