let currentMember = null;

requireFamilyAuth(async (member) => {
  currentMember = member;
  renderShell();
  await loadMemories();
});

function renderShell() {
  document.getElementById('app').innerHTML = `
    ${navHtml('memories.html')}
    <div class="wrap">
      <h1 class="serif" style="margin-top:40px; font-size:22px;">추모의 글</h1>
      <div class="form-block card">
        <input id="mm-title" type="text" placeholder="제목">
        <textarea id="mm-body" placeholder="마음을 담아 적어주세요"></textarea>
        <button class="btn" id="mm-submit" style="margin-top:8px;">글 남기기</button>
      </div>
      <div id="mm-list"></div>
    </div>
  `;
  document.getElementById('mm-submit').addEventListener('click', addMemory);
}

async function loadMemories() {
  const { data, error } = await supabaseClient
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });

  const list = document.getElementById('mm-list');
  if (error) {
    list.innerHTML = '<p class="empty">오류: ' + escapeHtml(error.message) + '</p>';
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty">아직 남겨진 글이 없습니다.</p>';
    return;
  }

  list.innerHTML = data.map(m => `
    <div class="post card" style="margin-bottom:14px;">
      <div class="tl-title">${escapeHtml(m.title)}</div>
      <div class="tl-body" style="white-space:pre-wrap;">${escapeHtml(m.body)}</div>
      <div class="meta">${escapeHtml(m.author_name)} · ${new Date(m.created_at).toLocaleDateString('ko-KR')}</div>
    </div>
  `).join('');
}

async function addMemory() {
  const title = document.getElementById('mm-title').value.trim();
  const body = document.getElementById('mm-body').value.trim();
  if (!title || !body) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  const { error } = await supabaseClient.from('memories').insert({
    author_email: currentMember.email,
    author_name: currentMember.name,
    title, body
  });
  if (error) {
    alert('저장 중 오류가 발생했습니다.');
    return;
  }
  document.getElementById('mm-title').value = '';
  document.getElementById('mm-body').value = '';
  await loadMemories();
}
