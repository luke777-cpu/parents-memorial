let currentMember = null;

requireFamilyAuth(async (member) => {
  currentMember = member;
  renderShell();
  await loadTimeline();
});

function renderShell() {
  document.getElementById('app').innerHTML = `
    ${navHtml('timeline.html')}
    <div class="wrap">
      <h1 class="serif" style="margin-top:40px; font-size:22px;">생애 타임라인</h1>
      <div class="form-block card">
        <input id="tl-year" type="number" placeholder="연도 (예: 1990)">
        <input id="tl-title" type="text" placeholder="제목">
        <textarea id="tl-body" placeholder="이야기를 적어주세요"></textarea>
        <input id="tl-photo" type="file" accept="image/*">
        <div class="form-foot"><button class="btn" id="tl-submit">기록 추가</button></div>
      </div>
      <div id="tl-list" class="timeline"></div>
    </div>
  `;
  document.getElementById('tl-submit').addEventListener('click', addEvent);
}

async function loadTimeline() {
  const { data, error } = await supabaseClient
    .from('timeline_events')
    .select('*')
    .order('year', { ascending: true });

  const list = document.getElementById('tl-list');
  if (error) {
    list.innerHTML = '<p class="empty">오류: ' + escapeHtml(error.message) + '</p>';
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty">아직 기록이 없습니다. 첫 기록을 남겨보세요.</p>';
    return;
  }

  list.innerHTML = data.map(ev => `
    <div class="tl-item">
      <div class="tl-year">${ev.year}</div>
      <div class="tl-title">${escapeHtml(ev.title)}</div>
      ${ev.body ? `<div class="tl-body">${escapeHtml(ev.body)}</div>` : ''}
      ${ev.photo_url ? `<img class="tl-photo" src="${ev.photo_url}">` : ''}
    </div>
  `).join('');
}

async function addEvent() {
  const year = parseInt(document.getElementById('tl-year').value, 10);
  const title = document.getElementById('tl-title').value.trim();
  const body = document.getElementById('tl-body').value.trim();
  const fileInput = document.getElementById('tl-photo');

  if (!year || !title) {
    alert('연도와 제목은 필수입니다.');
    return;
  }

  let photo_url = null;
  if (fileInput.files[0]) {
    photo_url = await uploadPhoto(fileInput.files[0], 'timeline');
  }

  const { error } = await supabaseClient.from('timeline_events').insert({
    author_email: currentMember.email,
    year, title, body, photo_url
  });

  if (error) {
    alert('저장 중 오류가 발생했습니다.');
    return;
  }

  document.getElementById('tl-year').value = '';
  document.getElementById('tl-title').value = '';
  document.getElementById('tl-body').value = '';
  fileInput.value = '';
  await loadTimeline();
}
