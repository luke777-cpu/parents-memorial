// 모든 페이지 공통: 로그인 여부 + 가족 화이트리스트 확인 후 콜백 실행
async function requireFamilyAuth(onReady) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    renderLoginGate();
    return;
  }

  const email = session.user.email;
  const { data: member, error } = await supabaseClient
    .from('family_members')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    renderLoginGate('명단 조회 오류: ' + error.message + ' [' + email + ']');
    return;
  }

  if (!member) {
    renderLoginGate('가족 명단에 없는 이메일입니다: ' + email);
    await supabaseClient.auth.signOut();
    return;
  }

  onReady(member);
}

const FAMILY_ACCOUNTS = [
  { label: '큰누나',   email: 'keunnuna@bumo.family' },
  { label: '둘째 누나', email: 'duljjae@bumo.family' },
  { label: '막내 누나', email: 'maknae@bumo.family' },
  { label: '남동생',   email: 'namdongsaeng@bumo.family' },
  { label: '본인',     email: 'bonin@bumo.family' },
];

function renderLoginGate(message) {
  const options = FAMILY_ACCOUNTS.map((a, i) => `<option value="${i}">${a.label}</option>`).join('');
  document.getElementById('app').innerHTML = `
    <div class="gate">
      <h1 class="serif" style="font-size:20px; margin-bottom:8px;">${SITE_TITLE}</h1>
      <p style="color:var(--text-soft); font-size:14px;">가족만 볼 수 있는 공간입니다.</p>
      <select id="name-select" style="width:100%; padding:12px 14px; border:1px solid var(--line); border-radius:8px; background:var(--card); font-size:16px; margin:20px 0 10px;">
        <option value="" disabled selected>이름을 선택하세요</option>
        ${options}
      </select>
      <input id="pw-input" type="password" placeholder="비밀번호" style="font-size:16px;" />
      <button class="btn" id="login-btn">들어가기</button>
      <p class="msg" id="gate-msg">${message || ''}</p>
    </div>
  `;
  document.getElementById('login-btn').addEventListener('click', async () => {
    const idx = document.getElementById('name-select').value;
    const pw = document.getElementById('pw-input').value;
    const msgEl = document.getElementById('gate-msg');
    if (idx === '' || !pw) { msgEl.textContent = '이름과 비밀번호를 입력해주세요.'; return; }
    const acc = FAMILY_ACCOUNTS[Number(idx)];

    let { error } = await supabaseClient.auth.signInWithPassword({ email: acc.email, password: pw });
    if (error) {
      if ((error.message || '').toLowerCase().includes('invalid login credentials')) {
        // 첫 로그인이면 계정 자동 생성
        const { data: su, error: e2 } = await supabaseClient.auth.signUp({ email: acc.email, password: pw });
        if (e2) { msgEl.textContent = '비밀번호가 올바르지 않습니다.'; return; }
        if (!su || !su.session) { msgEl.textContent = '관리자 설정이 필요합니다 (이메일 확인 끄기).'; return; }
      } else {
        msgEl.textContent = '로그인 실패: ' + error.message;
        return;
      }
    }
    window.location.reload();
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// 사진을 WebP로 압축 후 Storage 업로드, public URL 반환
async function uploadPhoto(file, pathPrefix) {
  const compressed = await compressToWebP(file);
  const fileName = `${pathPrefix}/${Date.now()}.webp`;
  const { error } = await supabaseClient.storage.from('photos').upload(fileName, compressed, {
    contentType: 'image/webp'
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
  return data.publicUrl;
}

function compressToWebP(file, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob), 'image/webp', quality);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 사진 선택 위젯 (최대 2장, 썸네일 미리보기 + 개별 삭제) ──
window._photoPickers = window._photoPickers || {};

function createPhotoPicker(containerId, initialUrls, maxCount) {
  window._photoPickers[containerId] = {
    kept: (initialUrls || []).slice(0, maxCount || 2),
    files: [],
    max: maxCount || 2
  };
  renderPhotoPicker(containerId);
}

function renderPhotoPicker(containerId) {
  const picker = window._photoPickers[containerId];
  const el = document.getElementById(containerId);
  if (!picker || !el) return;
  const total = picker.kept.length + picker.files.length;
  let html = '<div class="photo-picker">';
  picker.kept.forEach((url, i) => {
    html += `<div class="photo-thumb"><img src="${url}"><button type="button" onclick="removePickerKept('${containerId}',${i})">&times;</button></div>`;
  });
  picker.files.forEach((file, i) => {
    html += `<div class="photo-thumb"><img src="${URL.createObjectURL(file)}"><button type="button" onclick="removePickerNew('${containerId}',${i})">&times;</button></div>`;
  });
  if (total < picker.max) {
    html += `<label class="photo-add-btn" for="${containerId}-file">+ 사진</label><input type="file" id="${containerId}-file" accept="image/*" style="display:none">`;
  }
  html += '</div>';
  el.innerHTML = html;
  const fileInput = document.getElementById(containerId + '-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) {
        window._photoPickers[containerId].files.push(f);
        renderPhotoPicker(containerId);
      }
      fileInput.value = '';
    });
  }
}

function removePickerKept(containerId, i) {
  window._photoPickers[containerId].kept.splice(i, 1);
  renderPhotoPicker(containerId);
}
function removePickerNew(containerId, i) {
  window._photoPickers[containerId].files.splice(i, 1);
  renderPhotoPicker(containerId);
}

// 위젯 상태를 실제 업로드까지 마치고 최종 URL 배열로 반환
async function resolvePhotoPicker(containerId, pathPrefix) {
  const picker = window._photoPickers[containerId];
  if (!picker) return [];
  const uploaded = [];
  for (const file of picker.files) {
    uploaded.push(await uploadPhoto(file, pathPrefix));
  }
  return [...picker.kept, ...uploaded];
}

function navHtml(active) {
  const items = [
    ['index.html', '홈'],
    ['timeline.html', '타임라인'],
    ['gallery.html', '사진첩'],
    ['memories.html', '추모의 글'],
    ['guestbook.html', '방명록'],
  ];
  const links = items.map(([href, label]) =>
    `<a href="${href}" class="${active === href ? 'active' : ''}">${label}</a>`
  ).join('');
  return `
    <div class="topnav">
      <div class="topnav-inner">
        <span class="brand">${SITE_TITLE}</span>
        <nav>${links}</nav>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
