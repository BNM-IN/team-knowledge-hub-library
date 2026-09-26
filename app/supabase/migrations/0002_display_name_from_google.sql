-- Fix: Google sign-in was showing the email's local part ("sudd1593") as the
-- display name instead of the Google account's real name ("Siddharth Sharma").
-- handle_new_user() only ever used split_part(email, '@', 1) and never looked
-- at raw_user_meta_data->>'full_name' on the live project (0001_init.sql on
-- disk already had the coalesce, but the deployed function predated it).
--
-- Run this once against the live "BNM-IN's Project" (lqnglddszofistuzkgfc) in
-- the Supabase SQL Editor: https://supabase.com/dashboard/project/lqnglddszofistuzkgfc/sql/new
-- It (1) replaces the trigger function so every future sign-up gets the fix,
-- and (2) backfills existing profiles whose display_name still exactly
-- matches their email's local part (i.e. was never manually customized) —
-- an already-personalized name like a member who renamed themselves in
-- Profile settings is left untouched.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_default_group uuid;
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );
  insert into profiles (id, email, display_name, avatar_url)
  values (new.id, new.email, initcap(v_name), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  select id into v_default_group from groups where is_default limit 1;
  if v_default_group is not null then
    insert into group_members (group_id, user_id, role)
    values (v_default_group, new.id, 'member')
    on conflict do nothing;
  end if;

  return new;
end $$;

update profiles p
set display_name = initcap(coalesce(
      nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(u.raw_user_meta_data->>'name'), ''),
      split_part(u.email, '@', 1)
    )),
    avatar_url = coalesce(p.avatar_url, u.raw_user_meta_data->>'avatar_url')
from auth.users u
where u.id = p.id
  and p.display_name = split_part(u.email, '@', 1);
