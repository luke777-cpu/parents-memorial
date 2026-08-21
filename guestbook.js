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
        <p class="form-head">한마디 남기기</p>
        <textarea id="gb-message" placeholder="짧은 인사를 남겨주세요"></textarea>
        <div id="gb-photo-picker"></div>
        <div class="form-foot">
          <button class="btn" id="gb-submit">남기기</button>
        </div>
      </div>
      <div id="gb-list"></div>
    </div>
  `;
  createPhotoPicker('gb-photo-picker', []);
  document.getElementById('gb-submit').addEventListener('click', addEntry);
}

function guestbookImages(g) {
  if (g.images && Array.isArray(g.images) && g.images.length) return g.images;
  if (g.image_url) return [g.image_url];
  return [];
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
  const imgs = guestbookImages(g);
  return `
    <div class="post card" id="gb-card-${g.id}" style="margin-bottom:12px;">
      ${imgs.length ? `<div class="post-images">${imgs.map(u => `<img src="${u}">`).join('')}</div>` : ''}
      <div class="tl-body">${escapeHtml(g.message)}</div>
      <div class="post-foot">
        <div class="meta">${escapeHtml(g.author_name)} · ${new Date(g.created_at).toLocaleDateString('ko-KR')}${editedLabel}</div>
        ${canEdit ? `<div class="post-actions"><button class="btn-text" onclick="startEditGuestbook('${g.id}')">수정</button><button class="btn-text danger" onclick="deleteGuestbook('${g.id}')">삭제</button></div>` : ''}
      </div>
    </div>
  `;
}

async function deleteGuestbook(id) {
  if (!confirm('이 글을 삭제할까요? 되돌릴 수 없습니다.')) return;
  const { error } = await supabaseClient.from('guestbook').delete().eq('id', id);
  if (error) {
    alert('삭제 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  await loadGuestbook();
}

function startEditGuestbook(id) {
  const g = _guestbookCache.find(x => x.id === id);
  if (!g) return;
  const pickerId = 'gb-edit-photo-picker-' + id;
  const card = document.getElementById('gb-card-' + id);
  card.classList.add('form-block');
  card.innerHTML = `
    <p class="form-head">글 수정</p>
    <textarea id="gb-edit-message-${id}">${escapeHtml(g.message)}</textarea>
    <div id="${pickerId}"></div>
    <div class="form-foot">
      <button class="btn-quiet" onclick="loadGuestbook()">취소</button>
      <button class="btn" onclick="saveEditGuestbook('${id}')">저장</button>
    </div>
  `;
  createPhotoPicker(pickerId, guestbookImages(g));
}

async function saveEditGuestbook(id) {
  const message = document.getElementById('gb-edit-message-' + id).value.trim();
  if (!message) return;
  let images;
  try {
    images = await resolvePhotoPicker('gb-edit-photo-picker-' + id, 'guestbook');
  } catch (e) {
    alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
    return;
  }
  const update = {
    message,
    images,
    image_url: images[0] || null,
    updated_at: new Date().toISOString()
  };
  const { error } = await supabaseClient.from('guestbook').update(update).eq('id', id);
  if (error) {
    alert('수정 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  await loadGuestbook();
}

async function addEntry() {
  const message = document.getElementById('gb-message').value.trim();
  if (!message) return;
  let images;
  try {
    images = await resolvePhotoPicker('gb-photo-picker', 'guestbook');
  } catch (e) {
    alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
    return;
  }
  const { error } = await supabaseClient.from('guestbook').insert({
    author_email: currentMember.email,
    author_name: currentMember.name,
    message,
    images,
    image_url: images[0] || null
  });
  if (error) {
    alert('저장 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  document.getElementById('gb-message').value = '';
  await loadGuestbook();
}
