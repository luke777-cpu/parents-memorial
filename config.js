// ⚠️ 이 사이트 전용 Supabase 프로젝트 정보를 넣으세요.
// (토토의 집과는 완전히 다른 프로젝트여야 합니다 — supabase.com/dashboard 에서 새 프로젝트 생성)
const SUPABASE_URL = 'https://dbislfyxpztkqpgswpok.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qjCxbQ0W44jxKTuEYKDcJA_5hZR16vF';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 사이트 이름 등 공통 상수
const SITE_TITLE = '두 분을 기억하며';
