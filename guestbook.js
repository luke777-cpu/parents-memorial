let currentMember = null;
let _guestbookCache = [];

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
        <input id="gb-photo" type="file" accept="image/*" style="margin-top:8px;">
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
  if (error) {
    list.innerHTML = '<p class="empty">오류: ' + escapeHtml(error.message) + '</p>';
    return;
  }
  _guestbookCache = data || [];
  if (!_guestbookCache.length) {
    list.innerHTML = '<p class="empty">아직 방명록이 없습니다.</p>';
    return;
  }
  list.innerHTML = _guestbookCache.map(g => renderGuestbookCard(g)).join('');
}

function renderGuestbookCard(g) {
  const canEdit = currentMember && currentMember.email === g.author_email;
  const editedLabel = (g.updated_at && g.updated_at !== g.created_at) ? ' (수정됨)' : '';
  return `
    <div class="post card" id="gb-card-${g.id}" style="margin-bottom:12px;">
      ${g.image_url ? `<img src="${g.image_url}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
      <div class="tl-body">${escapeHtml(g.message)}</div>
      <div class="meta">${escapeHtml(g.author_name)} · ${new Date(g.created_at).toLocaleDateString('ko-KR')}${editedLabel}</div>
      ${canEdit ? `<div class="post-actions" style="margin-top:8px;"><button class="btn-link" onclick="startEditGuestbook('${g.id}')">수정</button></div>` : ''}
    </div>
  `;
}

function startEditGuestbook(id) {
  const g = _guestbookCache.find(x => x.id === id);
  if (!g) return;
  const card = document.getElementById('gb-card-' + id);
  card.innerHTML = `
    ${g.image_url ? `<img src="${g.image_url}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
    <textarea id="gb-edit-message-${id}" style="width:100%;min-height:80px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;">${escapeHtml(g.message)}</textarea>
    <input id="gb-edit-photo-${id}" type="file" accept="image/*" style="margin-top:8px;">
    <div style="margin-top:10px;">
      <button class="btn" style="width:auto;padding:10px 18px;" onclick="saveEditGuestbook('${id}')">저장</button>
      <button class="btn-link" style="margin-left:10px;" onclick="loadGuestbook()">취소</button>
    </div>
  `;
}

async function saveEditGuestbook(id) {
  const message = document.getElementById('gb-edit-message-' + id).value.trim();
  const fileInput = document.getElementById('gb-edit-photo-' + id);
  if (!message) return;
  const update = { message, updated_at: new Date().toISOString() };
  if (fileInput.files[0]) {
    try {
      update.image_url = await uploadPhoto(fileInput.files[0], 'guestbook');
    } catch (e) {
      alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
      return;
    }
  }
  const { error } = await supabaseClient.from('guestbook').update(update).eq('id', id);
  if (error) {
    alert('수정 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  await loadGuestbook();
}

async function addEntry() {
  const message = document.getElementById('gb-message').value.trim();
  const fileInput = document.getElementById('gb-photo');
  if (!message) return;
  let image_url = null;
  if (fileInput.files[0]) {
    try {
      image_url = await uploadPhoto(fileInput.files[0], 'guestbook');
    } catch (e) {
      alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
      return;
    }
  }
  const { error } = await supabaseClient.from('guestbook').insert({
    author_email: currentMember.email,
    author_name: currentMember.name,
    message, image_url
  });
  if (error) {
    alert('저장 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  document.getElementById('gb-message').value = '';
  document.getElementById('gb-photo').value = '';
  await loadGuestbook();
}
