-- Supabase SQL 편집기에 그대로 붙여넣어 실행하세요.
-- (신규 프로젝트에서 1회만 실행)

create table family_members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text default 'member',
  created_at timestamptz default now()
);

create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  year int not null,
  title text not null,
  body text,
  photo_url text,
  created_at timestamptz default now()
);

create table albums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references albums(id) on delete cascade,
  author_email text not null,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

create table memories (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_name text not null,
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

create table guestbook (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 기본 앨범 몇 개 미리 생성 (원하는 대로 수정)
insert into albums (name) values ('여행'), ('명절'), ('생신'), ('일상');

-- 가족 화이트리스트 (본인 이메일부터 등록, 나머지는 나중에 추가)
insert into family_members (email, name, role) values
  ('YOUR-EMAIL@example.com', '본인', 'admin');

-- RLS 활성화
alter table family_members enable row level security;
alter table timeline_events enable row level security;
alter table albums enable row level security;
alter table photos enable row level security;
alter table memories enable row level security;
alter table guestbook enable row level security;

-- 가족만 조회 가능
create policy "family can read family_members" on family_members
  for select using (auth.email() in (select email from family_members));

create policy "family can read timeline" on timeline_events
  for select using (auth.email() in (select email from family_members));
create policy "family can insert timeline" on timeline_events
  for insert with check (auth.email() in (select email from family_members));
create policy "author can delete own timeline" on timeline_events
  for delete using (auth.email() = author_email);

create policy "family can read albums" on albums
  for select using (auth.email() in (select email from family_members));

create policy "family can read photos" on photos
  for select using (auth.email() in (select email from family_members));
create policy "family can insert photos" on photos
  for insert with check (auth.email() in (select email from family_members));
create policy "author can delete own photos" on photos
  for delete using (auth.email() = author_email);

create policy "family can read memories" on memories
  for select using (auth.email() in (select email from family_members));
create policy "family can insert memories" on memories
  for insert with check (auth.email() in (select email from family_members));
create policy "author can delete own memories" on memories
  for delete using (auth.email() = author_email);

create policy "family can read guestbook" on guestbook
  for select using (auth.email() in (select email from family_members));
create policy "family can insert guestbook" on guestbook
  for insert with check (auth.email() in (select email from family_members));
create policy "author can delete own guestbook" on guestbook
  for delete using (auth.email() = author_email);

-- 사진 업로드용 스토리지 버킷은 Supabase 대시보드 Storage 탭에서
-- "photos" 라는 이름으로 하나 만들고 Public으로 설정하세요.
