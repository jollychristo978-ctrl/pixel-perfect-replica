alter table public.profiles
  add column voice_twin_id text,
  add column voice_twin_consented_at timestamptz,
  add column voice_verified boolean not null default false;

create table public.practice_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  topic text not null,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.practice_topics to authenticated;
grant all on public.practice_topics to service_role;
alter table public.practice_topics enable row level security;
create policy "topics_owner_select" on public.practice_topics for select to authenticated using (user_id = auth.uid());
create policy "topics_owner_insert" on public.practice_topics for insert to authenticated with check (user_id = auth.uid());
create policy "topics_owner_delete" on public.practice_topics for delete to authenticated using (user_id = auth.uid());

create or replace function public.consent_voice_twin(p_voice_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into p from public.profiles where id = auth.uid();
  if not found then raise exception 'Complete your profile first'; end if;
  if p.age_group <> '18+' then raise exception 'Voice Twin is only for adults'; end if;
  if not p.voice_verified then raise exception 'A coordinator must verify you first'; end if;
  if p_voice_id is null or length(trim(p_voice_id)) < 5 or length(p_voice_id) > 80 then raise exception 'Invalid voice ID'; end if;
  update public.profiles
  set voice_twin_id = trim(p_voice_id), voice_twin_consented_at = now()
  where id = auth.uid();
end;
$$;

create or replace function public.delete_voice_twin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  update public.profiles
  set voice_twin_id = null, voice_twin_consented_at = null
  where id = auth.uid();
end;
$$;

create or replace function public.set_voice_verified(p_user_id uuid, p_verified boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if not (public.has_role(auth.uid(), 'coordinator') or public.has_role(auth.uid(), 'admin')) then
    raise exception 'Staff access required';
  end if;
  update public.profiles set voice_verified = p_verified where id = p_user_id;
  if not p_verified then
    update public.profiles set voice_twin_id = null, voice_twin_consented_at = null where id = p_user_id;
  end if;
end;
$$;