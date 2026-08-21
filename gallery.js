let currentMember = null;
let openAlbum = null;

requireFamilyAuth(async (member) => {
  currentMember = member;
  await renderAlbumList();
});

async function renderAlbumList() {
  openAlbum = null;
  const { data: albums } = await supabaseClient.from('albums').select('*').order('created_at');
  const { data: photos } = await supabaseClient.from('photos').select('album_id, url');

  const coverFor = (albumId) => {
    const p = (photos || []).find(p => p.album_id === albumId);
    return p ? p.url : null;
  };

  document.getElementById('app').innerHTML = `
    ${navHtml('gallery.html')}
    <div class="wrap">
      <h1 class="serif" style="margin-top:40px; font-size:22px;">사진첩</h1>
      <div class="album-grid">
        ${(albums || []).map(a => {
          const cover = coverFor(a.id);
          return `
          <div class="album-card" onclick="openAlbumView('${a.id}', '${escapeHtml(a.name)}')">
            ${cover ? `<img src="${cover}">` : ''}
            <div class="label">${escapeHtml(a.name)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

async function openAlbumView(albumId, albumName) {
  openAlbum = albumId;
  const { data: photos } = await supabaseClient
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false });

  document.getElementById('app').innerHTML = `
    ${navHtml('gallery.html')}
    <div class="wrap">
      <p style="margin-top:40px;"><a href="#" onclick="renderAlbumList(); return false;" style="color:var(--text-soft); font-size:14px;">← 사진첩</a></p>
      <h1 class="serif" style="font-size:22px;">${albumName}</h1>
      <div class="form-block card">
        <p class="form-head">사진 올리기</p>
        <div id="gl-photo-picker"></div>
        <input id="gl-caption" type="text" placeholder="사진 설명 (선택)" style="margin-top:10px;">
        <div class="form-foot"><button class="btn" id="gl-submit">사진 추가</button></div>
      </div>
      <div id="gl-grid" class="photo-grid">
        ${(photos && photos.length)
          ? photos.map((p, i) => `<img src="${p.url}" title="${escapeHtml(p.caption || '')}" onclick="openLightbox(${i})">`).join('')
          : '<p class="empty">아직 이 앨범에 사진이 없습니다.</p>'}
      </div>
    </div>
  `;
  window._lbPhotos = photos || [];
  createPhotoPicker('gl-photo-picker', [], 2);
  document.getElementById('gl-submit').addEventListener('click', () => addPhoto(albumId, albumName));
}

let _lbIndex = 0;
function openLightbox(index) {
  _lbIndex = index;
  renderLightbox();
}
function renderLightbox() {
  const photos = window._lbPhotos || [];
  if (!photos.length) return;
  const p = photos[_lbIndex];
  let el = document.getElementById('lb-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lb-overlay';
    el.className = 'lightbox-overlay';
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <button class="lb-close" onclick="closeLightbox()">&times;</button>
    ${photos.length > 1 ? '<button class="lb-nav lb-prev" onclick="lbMove(-1)">&#8249;</button>' : ''}
    <img src="${p.url}">
    ${photos.length > 1 ? '<button class="lb-nav lb-next" onclick="lbMove(1)">&#8250;</button>' : ''}
    ${p.caption ? `<div class="lb-caption">${escapeHtml(p.caption)}</div>` : ''}
  `;
  el.onclick = (e) => { if (e.target === el) closeLightbox(); };
}
function lbMove(dir) {
  const photos = window._lbPhotos || [];
  _lbIndex = (_lbIndex + dir + photos.length) % photos.length;
  renderLightbox();
}
function closeLightbox() {
  const el = document.getElementById('lb-overlay');
  if (el) el.remove();
}
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lb-overlay')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbMove(-1);
  if (e.key === 'ArrowRight') lbMove(1);
});

async function addPhoto(albumId, albumName) {
  const caption = document.getElementById('gl-caption').value.trim();
  let urls;
  try {
    urls = await resolvePhotoPicker('gl-photo-picker', 'gallery');
  } catch (e) {
    alert('사진 업로드 오류: ' + (e && e.message ? e.message : JSON.stringify(e)));
    return;
  }
  if (!urls.length) {
    alert('사진을 선택해주세요.');
    return;
  }
  const rows = urls.map(url => ({
    album_id: albumId,
    author_email: currentMember.email,
    url, caption
  }));
  const { error } = await supabaseClient.from('photos').insert(rows);
  if (error) {
    alert('업로드 오류: ' + error.message + (error.details ? ' / ' + error.details : ''));
    return;
  }
  await openAlbumView(albumId, albumName);
}
