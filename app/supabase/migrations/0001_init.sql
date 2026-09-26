-- NoteHive · Release 1 schema (PRD section 9)
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Enums -------------------------------------------------------------------
create type member_role as enum ('owner', 'member');
create type note_visibility as enum ('private', 'group');
create type organise_status as enum ('pending', 'done', 'failed');
create type coverage as enum ('full', 'partial', 'none');
create type chunk_source as enum ('library', 'note');
create type chunk_visibility as enum ('public', 'private', 'group');

-- Tables ------------------------------------------------------------------
create table categories (
  name text primary key,
  sort_order integer not null default 0
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 50),
  topic text check (topic is null or char_length(topic) <= 60),
  description text check (description is null or char_length(description) <= 280),
  join_code char(6) not null unique,
  is_default boolean not null default false,
  created_by uuid references profiles on delete set null,
  created_at timestamptz not null default now()
);
create unique index groups_one_default on groups (is_default) where is_default;

create table group_members (
  group_id uuid not null references groups on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  role member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user on group_members (user_id);

create table answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  question text not null check (char_length(question) between 3 and 500),
  scope_group_id uuid references groups on delete set null,
  summary text not null,
  key_points jsonb not null default '[]',
  sources jsonb not null default '[]',
  coverage coverage not null,
  model text,
  latency_ms integer,
  created_at timestamptz not null default now()
);
create index answers_user_created on answers (user_id, created_at desc);

-- Generated columns only accept immutable expressions, and array_to_string() is only stable.
-- This wrapper is safe to mark immutable: its output depends only on its inputs.
create or replace function notes_search_tsv(p_title text, p_body text, p_tags text[]) returns tsvector
language sql immutable parallel safe as $$
  select to_tsvector('english'::regconfig, coalesce(p_title, '') || ' ' || p_body || ' ' || coalesce(array_to_string(p_tags, ' '), ''));
$$;

create table notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  group_id uuid references groups on delete set null,
  visibility note_visibility not null,
  title text check (title is null or char_length(title) <= 120),
  body text not null check (char_length(body) between 1 and 10000),
  category text references categories (name),
  tags text[] not null default '{}' check (cardinality(tags) <= 4),
  answer_id uuid references answers on delete set null,
  meta_locked boolean not null default false,
  organise_status organise_status not null default 'pending',
  search_tsv tsvector generated always as (notes_search_tsv(title, body, tags)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_visibility_group check ((visibility = 'group') = (group_id is not null))
);
create index notes_owner on notes (owner_id);
create index notes_group on notes (group_id);
create index notes_updated on notes (updated_at desc);
create index notes_search on notes using gin (search_tsv);

create table kb_sources (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  title text not null,
  content_hash text not null,
  last_ingested_at timestamptz
);

create table kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source chunk_source not null,
  kb_source_id uuid references kb_sources on delete cascade,
  note_id uuid references notes on delete cascade,
  owner_id uuid,
  group_id uuid,
  visibility chunk_visibility not null,
  title text,
  category text,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);
create index kb_chunks_embedding on kb_chunks using hnsw (embedding vector_cosine_ops);
create index kb_chunks_note on kb_chunks (note_id);
create index kb_chunks_vis_group on kb_chunks (visibility, group_id);

-- Functions ---------------------------------------------------------------
create or replace function is_group_member(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = auth.uid());
$$;

create or replace function gen_join_code() returns char(6)
language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no O, I, 0, 1
  code text := '';
begin
  for i in 1..6 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end $$;

create or replace function create_group(p_name text, p_topic text default null, p_description text default null)
returns table (group_id uuid, join_code char(6))
language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
  code char(6);
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  loop
    code := gen_join_code();
    begin
      insert into groups (name, topic, description, join_code, created_by)
      values (p_name, nullif(p_topic, ''), nullif(p_description, ''), code, auth.uid())
      returning id into gid;
      exit;
    exception when unique_violation then
      -- code collision: try again
    end;
  end loop;
  insert into group_members (group_id, user_id, role) values (gid, auth.uid(), 'owner');
  return query select gid, code;
end $$;

create or replace function join_group_by_id(p_group_id uuid)
returns table (group_id uuid, name text, already_member boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_already boolean;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
  select exists (select 1 from group_members gm where gm.group_id = p_group_id and gm.user_id = auth.uid()) into v_already;
  if not v_already then
    insert into group_members (group_id, user_id, role) values (p_group_id, auth.uid(), 'member');
  end if;
  select g.name into v_name from groups g where g.id = p_group_id;
  return query select p_group_id, v_name, v_already;
end $$;

create or replace function join_group(p_code text)
returns table (group_id uuid, name text, already_member boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_group groups;
  v_already boolean;
begin
  select * into v_group from groups where join_code = upper(p_code);
  if v_group.id is null then raise exception 'INVALID_CODE'; end if;
  select exists (
    select 1 from group_members gm where gm.group_id = v_group.id and gm.user_id = auth.uid()
  ) into v_already;
  if not v_already then
    insert into group_members (group_id, user_id, role) values (v_group.id, auth.uid(), 'member');
  end if;
  return query select v_group.id, v_group.name, v_already;
end $$;

create or replace function my_groups()
returns table (group_id uuid, name text, role member_role, is_default boolean, member_count bigint, join_code char(6))
language sql stable security definer set search_path = public as $$
  select g.id, g.name, gm.role, g.is_default,
         (select count(*) from group_members x where x.group_id = g.id),
         g.join_code
  from group_members gm join groups g on g.id = gm.group_id
  where gm.user_id = auth.uid()
  order by g.is_default desc, g.name;
$$;

-- "Written under: <question>" is visible to anyone who can read the note;
-- the linked answer itself stays private to its owner (FR-NOTE-09).
create or replace function note_answer_question(p_note_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select a.question from notes n join answers a on a.id = n.answer_id
  where n.id = p_note_id and (n.owner_id = auth.uid() or n.visibility = 'group');
$$;

-- Service-only retrieval that applies the section 6 read rules.
create or replace function match_chunks_for_user(
  query_embedding vector(1536), p_user_id uuid, p_scope_group_id uuid, k integer default 8, min_similarity float default 0.30
) returns table (
  chunk_id uuid, source chunk_source, title text, content text, similarity float,
  url text, note_id uuid, author_name text, group_id uuid, group_name text
)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select c.*, 1 - (c.embedding <=> query_embedding) as sim,
           row_number() over (partition by coalesce(c.kb_source_id, c.note_id) order by c.embedding <=> query_embedding) as per_source
    from kb_chunks c
    where (
      c.visibility = 'public'
      or (p_scope_group_id is null and c.visibility = 'group')
      or (p_scope_group_id is not null and c.visibility = 'group' and c.group_id = p_scope_group_id)
      or (p_scope_group_id is null and c.visibility = 'private' and c.owner_id = p_user_id)
    )
  )
  select r.id, r.source, r.title, r.content, r.sim, s.url, r.note_id, p.display_name, r.group_id, g.name
  from ranked r
  left join kb_sources s on s.id = r.kb_source_id
  left join profiles p on p.id = r.owner_id
  left join groups g on g.id = r.group_id
  where r.sim >= min_similarity and r.per_source <= 3
  order by r.sim desc
  limit k;
$$;
revoke execute on function match_chunks_for_user from public, anon, authenticated;

-- Triggers ----------------------------------------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
begin
  -- Google full name, else the email prefix (FR-AUTH-02), fitted to the 2–40 character rule.
  v_name := left(trim(coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  )), 40);
  if char_length(v_name) < 2 then v_name := rpad(coalesce(v_name, ''), 2, '_'); end if;

  insert into profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    initcap(v_name),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into group_members (group_id, user_id)
  select id, new.id from groups where is_default;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function notes_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  -- A user editing meta through the client locks it; the organise workflow uses the service role.
  if auth.role() = 'authenticated' and (
    new.title is distinct from old.title or new.category is distinct from old.category or new.tags is distinct from old.tags
  ) then
    new.meta_locked := true;
  end if;
  return new;
end $$;
create trigger notes_before_update before update on notes
  for each row execute function notes_touch();

create or replace function notes_sync_chunks() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update kb_chunks
  set visibility = new.visibility::text::chunk_visibility, group_id = new.group_id
  where note_id = new.id;
  return new;
end $$;
create trigger notes_after_visibility after update of visibility, group_id on notes
  for each row execute function notes_sync_chunks();

-- Row-Level Security (section 9.3) ----------------------------------------
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table notes enable row level security;
alter table answers enable row level security;
alter table kb_sources enable row level security;
alter table kb_chunks enable row level security;
alter table categories enable row level security;

create policy profiles_read on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated using (id = auth.uid());

create policy groups_read on groups for select to authenticated using (true);
-- join_code is only exposed through my_groups()
revoke select (join_code) on groups from authenticated, anon;

create policy members_read on group_members for select to authenticated using (true);

create policy notes_read on notes for select to authenticated
  using (owner_id = auth.uid() or visibility = 'group');
create policy notes_insert on notes for insert to authenticated
  with check (owner_id = auth.uid() and (visibility = 'private' or is_group_member(group_id)));
create policy notes_update on notes for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and (visibility = 'private' or is_group_member(group_id)));
create policy notes_delete on notes for delete to authenticated using (owner_id = auth.uid());

create policy answers_read on answers for select to authenticated using (user_id = auth.uid());
create policy answers_delete on answers for delete to authenticated using (user_id = auth.uid());

create policy categories_read on categories for select to authenticated using (true);
-- kb_sources, kb_chunks: no policies → service role only.
