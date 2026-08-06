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
        <input id="gl-photo" type="file" accept="image/*">
        <input id="gl-caption" type="text" placeholder="사진 설명 (선택)">
        <button class="btn" id="gl-submit" style="margin-top:8px;">사진 추가</button>
      </div>
      <div id="gl-grid" class="photo-grid">
        ${(photos && photos.length)
          ? photos.map(p => `<img src="${p.url}" title="${escapeHtml(p.caption || '')}">`).join('')
          : '<p class="empty">아직 이 앨범에 사진이 없습니다.</p>'}
      </div>
    </div>
  `;
  document.getElementById('gl-submit').addEventListener('click', () => addPhoto(albumId, albumName));
}

async function addPhoto(albumId, albumName) {
  const fileInput = document.getElementById('gl-photo');
  const caption = document.getElementById('gl-caption').value.trim();
  if (!fileInput.files[0]) {
    alert('사진을 선택해주세요.');
    return;
  }
  const url = await uploadPhoto(fileInput.files[0], 'gallery');
  const { error } = await supabaseClient.from('photos').insert({
    album_id: albumId,
    author_email: currentMember.email,
    url, caption
  });
  if (error) {
    alert('업로드 중 오류가 발생했습니다.');
    return;
  }
  await openAlbumView(albumId, albumName);
}
