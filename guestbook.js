let currentMember = null;

requireFamilyAuth(async (member) => {
  currentMember = member;
  renderShell();
  await loadGuestbook();
});

function renderShell() {
  document.getElementById('app').innerHTML = `
    ${navHtml('guestbook.html')}
    <div class="wrap">
      <h1 class="serif" style="margin-top:40px; font-size:22px;">방명록</h1>
      <div class="form-block card">
        <textarea id="gb-message" placeholder="짧은 인사를 남겨주세요"></textarea>
        <button class="btn" id="gb-submit" style="margin-top:8px;">남기기</button>
      </div>
      <div id="gb-list"></div>
    </div>
  `;
  document.getElementById('gb-submit').addEventListener('click', addEntry);
}

async function loadGuestbook() {
  const { data, error } = await supabaseClient
    .from('guestbook')
    .select('*')
    .order('created_at', { ascending: false });

  const list = document.getElementById('gb-list');
  if (error || !data || data.length === 0) {
    list.innerHTML = '<p class="empty">아직 방명록이 없습니다.</p>';
    return;
  }

  list.innerHTML = data.map(g => `
    <div class="post card" style="margin-bottom:12px;">
      <div class="tl-body">${escapeHtml(g.message)}</div>
      <div class="meta">${escapeHtml(g.author_name)} · ${new Date(g.created_at).toLocaleDateString('ko-KR')}</div>
    </div>
  `).join('');
}

async function addEntry() {
  const message = document.getElementById('gb-message').value.trim();
  if (!message) return;
  const { error } = await supabaseClient.from('guestbook').insert({
    author_email: currentMember.email,
    author_name: currentMember.name,
    message
  });
  if (error) {
    alert('저장 중 오류가 발생했습니다.');
    return;
  }
  document.getElementById('gb-message').value = '';
  await loadGuestbook();
}
