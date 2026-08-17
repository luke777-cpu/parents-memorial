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

function renderLoginGate(message) {
  document.getElementById('app').innerHTML = `
    <div class="gate">
      <h1 class="serif" style="font-size:20px; margin-bottom:8px;">${SITE_TITLE}</h1>
      <p style="color:var(--text-soft); font-size:14px;">가족만 볼 수 있는 공간입니다.</p>
      <input id="email-input" type="email" placeholder="이메일 주소" />
      <button class="btn" id="send-code-btn">인증 코드 받기</button>
      <p class="msg" id="gate-msg">${message || ''}</p>

      <div id="code-block" style="display:none; margin-top:20px;">
        <input id="code-input" type="text" inputmode="numeric" maxlength="10" placeholder="인증 코드 입력" />
        <button class="btn" id="verify-code-btn" style="margin-top:8px;">인증하기</button>
      </div>
    </div>
  `;

  let pendingEmail = '';

  document.getElementById('send-code-btn').addEventListener('click', async () => {
    const email = document.getElementById('email-input').value.trim();
    if (!email) return;
    pendingEmail = email;
    const { error } = await supabaseClient.auth.signInWithOtp({ email });
    if (error) {
      document.getElementById('gate-msg').textContent = '오류가 발생했습니다. 다시 시도해주세요.';
      return;
    }
    document.getElementById('gate-msg').textContent = '이메일로 인증 코드를 보냈습니다. 코드를 입력해주세요.';
    document.getElementById('code-block').style.display = 'block';
    document.getElementById('email-input').disabled = true;
    document.getElementById('send-code-btn').disabled = true;
  });

  document.getElementById('verify-code-btn').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value.trim();
    if (!code || !pendingEmail) return;
    const { error } = await supabaseClient.auth.verifyOtp({
      email: pendingEmail,
      token: code,
      type: 'email'
    });
    if (error) {
      document.getElementById('gate-msg').textContent = '코드가 올바르지 않거나 만료되었습니다. 다시 시도해주세요.';
      return;
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
