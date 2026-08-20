let currentMember = null;
let _memoriesCache = [];

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
        <input id="mm-photo" type="file" accept="image/*" style="margin-top:8px;">
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
  _memoriesCache = data || [];
  if (!_memoriesCache.length) {
    list.innerHTML = '<p class="empty">아직 남겨진 글이 없습니다.</p>';
    return;
  }

  list.innerHTML = _memoriesCache.map(m => renderMemoryCard(m)).join('');
}

function renderMemoryCard(m) {
  const canEdit = currentMember && currentMember.email === m.author_email;
  const editedLabel = (m.updated_at && m.updated_at !== m.created_at) ? ' (수정됨)' : '';
  return `
    <div class="post card" id="mm-card-${m.id}" style="margin-bottom:14px;">
      <div class="tl-title">${escapeHtml(m.title)}</div>
      ${m.image_url ? `<img src="${m.image_url}" style="max-width:100%;border-radius:8px;margin:10px 0;">` : ''}
      <div class="tl-body" style="white-space:pre-wrap;">${escapeHtml(m.body)}</div>
      <div class="meta">${escapeHtml(m.author_name)} · ${new Date(m.created_at).toLocaleDateString('ko-KR')}${editedLabel}</div>
      ${canEdit ? `<div class="post-actions" style="margin-top:8px;"><button class="btn-link" onclick="startEditMemory('${m.id}')">수정</button></div>` : ''}
    </div>
  `;
}

function startEditMemory(id) {
  const m = _memoriesCache.find(x => x.id === id);
  if (!m) return;
  const card = document.getElementById('mm-card-' + id);
  card.innerHTML = `
    <input id="mm-edit-title-${id}" type="text" value="${escapeHtml(m.title)}" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px;">
    ${m.image_url ? `<img src="${m.image_url}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
    <textarea id="mm-edit-body-${id}" style="width:100%;min-height:100px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;">${escapeHtml(m.body)}</textarea>
    <input id="mm-edit-photo-${id}" type="file" accept="image/*" style="margin-top:8px;">
    <div style="margin-top:10px;">
      <button class="btn" style="width:auto;padding:10px 18px;" onclick="saveEditMemory('${id}')">저장</button>
      <button class="btn-link" style="margin-left:10px;" onclick="loadMemories()">취소</button>
    </div>
  `;
}

async function saveEditMemory(id) {
  const title = document.getElementById('mm-edit-title-' + id).value.trim();
  const body = document.getElementById('mm-edit-body-' + id).value.trim();
  const fileInput = document.getElementById('mm-edit-photo-' + id);
  if (!title || !body) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  const update = { title, body, updated_at: new Date().toISOString() };
  if (fileInput.files[0]) {
    try {
      update.image_url = await uploadPhoto(fileInput.files[0], 'memories');
    } catch (e) {
      alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
      return;
    }
  }
  const { error } = await supabaseClient.from('memories').update(update).eq('id', id);
  if (error) {
    alert('수정 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  await loadMemories();
}

async function addMemory() {
  const title = document.getElementById('mm-title').value.trim();
  const body = document.getElementById('mm-body').value.trim();
  const fileInput = document.getElementById('mm-photo');
  if (!title || !body) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  let image_url = null;
  if (fileInput.files[0]) {
    try {
      image_url = await uploadPhoto(fileInput.files[0], 'memories');
    } catch (e) {
      alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
      return;
    }
  }
  const { error } = await supabaseClient.from('memories').insert({
    author_email: currentMember.email,
    author_name: currentMember.name,
    title, body, image_url
  });
  if (error) {
    alert('저장 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  document.getElementById('mm-title').value = '';
  document.getElementById('mm-body').value = '';
  document.getElementById('mm-photo').value = '';
  await loadMemories();
}
