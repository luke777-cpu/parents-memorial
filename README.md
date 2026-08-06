# 두 분을 기억하며 — 설정 방법

## 1. Supabase 신규 프로젝트 생성
1. supabase.com/dashboard 에서 **새 프로젝트** 생성 (토토의 집과는 완전히 다른 프로젝트)
2. SQL 편집기에서 `schema.sql` 내용을 그대로 실행
   - 맨 아래 본인 이메일 부분(`YOUR-EMAIL@example.com`)을 실제 이메일로 바꾼 뒤 실행
   - 이후 가족들 이메일은 `family_members` 테이블에 직접 추가하면 됨
3. Storage 탭에서 `photos` 라는 버킷을 새로 만들고 **Public**으로 설정

## 2. config.js 수정
Project Settings → API 에서 URL과 anon key를 복사해서 `config.js`에 붙여넣기

## 3. GitHub Pages 배포
1. `luke777-cpu/parents-memorial` 신규 저장소 생성
2. 이 폴더 전체를 push
3. Settings → Pages 에서 배포 활성화 (main 브랜치, / root)

## 4. 로그인 확인
- 배포된 주소로 접속 → 이메일 입력 → 매직링크 로그인
- family_members에 등록 안 된 이메일은 자동으로 차단됨

## 5. 홈 화면 사진
`assets/parents.jpg` 파일을 부모님 사진으로 교체하면 홈 화면에 표시됩니다 (없어도 정상 작동).
