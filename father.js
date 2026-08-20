requireFamilyAuth((member) => {
  document.getElementById('app').innerHTML = `
    ${navHtml('father.html')}
    <main class="wrap father-page">

      <a href="index.html" class="father-back">← 홈으로</a>

      <section class="father-hero">
        <div class="father-hero-photo">
          ${photo('father-factory.webp', '대한제유 부산공장 앞에 서 있는 아버지')}
        </div>
        <div class="father-hero-text">
          <p class="father-kicker">1927 — 한 사람의 삶, 한 시대의 기록</p>
          <h1 class="serif">아버지의 시간</h1>
          <p class="father-lead">아버지에게 직접 들은 이야기는 많지 않다.
지금 남아 있는 이야기의 골격은 주로 어머니가 들려준 기억과 몇 장의 오래된 사진이다.
그 조각들을 하나씩 이어 아버지가 지나온 시간을 기록해 본다.</p>
        </div>
      </section>

      <div class="timeline father-timeline">

        <div class="tl-item">
          <div class="tl-year">1927</div>
          <div class="tl-title">출생</div>
          <div class="tl-body">아버지는 1927년에 태어났다. 일제강점기의 한가운데였다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year">1930년대</div>
          <div class="tl-title">일본에서의 어린 시절</div>
          <div class="tl-body">할아버지는 원래 산청군 삼장면 대원사와 관련된 일을 하셨다고 가족에게 전해진다. 이후 많은 조선인들이 일자리를 찾아 일본으로 건너가던 시기에 할아버지도 일본으로 갔다. 일본에서 조선인 노동자들을 상대로 식당 일을 했고, 그곳에서 아버지와 남동생을 키웠다. 아버지는 어린 시절 어머니를 일찍 여의었다. 다행히 아버지는 일본에서 국민학교를 다닐 수 있었다. 아버지는 훗날 자신이 어린 시절을 보낸 곳을 사세보라고 이야기했다. 노년에는 그곳을 다시 한번 가보고 싶어 했지만 결국 함께 가지 못했다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year">1945</div>
          <div class="tl-title">해방과 귀국</div>
          <div class="tl-body">해방 당시 아버지는 세는나이로 약 19세였다. 일본에 계속 남은 친척들도 있었지만 아버지는 한국으로 돌아왔다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year">1946 이후</div>
          <div class="tl-title">국방경비대와 군 생활</div>
          <div class="tl-body">가족에게 전해지는 이야기로 아버지는 국방경비대 제5연대 소속이었다. 이후 하사관으로 복무했다.</div>
          <div class="father-photo-row">
            ${photo('military-01.webp', '군복을 입은 단체사진')}
            ${photo('military-horse.webp', '말과 함께 찍은 군복 사진', true)}
          </div>
        </div>

        <div class="tl-item">
          <div class="tl-year">1950 – 1953</div>
          <div class="tl-title">6·25전쟁</div>
          <div class="tl-body">아버지는 하사관으로 6·25전쟁에 참전했다. 20대 초반의 젊은 나이에 전쟁을 겪었다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year">전쟁 전후</div>
          <div class="tl-title">미군 군무원</div>
          <div class="tl-body">아버지는 미군 관련 군무원으로 일한 시기가 있었다. 가족에게 전해지는 이야기로는 시험에서 1등을 했다고 한다. 그러나 전쟁 중 호적 및 신분서류 문제로 정식 군무원이 될 기회를 놓쳤다고 전해진다.
          <span class="father-note">※ 이 내용은 확정된 행정기록이 아니라 가족에게 전해지는 이야기입니다.</span></div>
          ${photo('nagasaki.webp', '미군 군무원으로 일하던 시절의 사진. 뒤편에 ‘NAGASAKI DETACHMENT’라는 글자가 남아 있다.', false, true)}
        </div>

        <div class="tl-item">
          <div class="tl-year">1953 – 1954년경</div>
          <div class="tl-title">부모님의 만남</div>
          <div class="tl-body">아버지가 군대 선배의 결혼식에 들러리로 따라갔다. 그 결혼식의 신부가 어머니의 사촌언니였다. 그 인연으로 어머니를 소개받았고 결국 두 분은 결혼했다. 어머니는 1933년생. 큰딸이 1955년생이므로 결혼 시기는 1953~1954년 무렵으로 추정한다.</div>
          ${photo('wedding.webp', '부모님의 전통혼례 사진', false, true)}
        </div>

      </div>

      <section class="father-section-highlight">
        <p class="father-sub">기억 속의 첫집</p>
        <h2 class="serif">범일동 700번지</h2>
        <p class="tl-body">아버지가 대한제유에 근무하게 된 것은 할아버지의 인연 때문이었다. 당시 할아버지는 대한제유에서 수위 겸 관리인으로 일했다. 그 소개로 아버지도 대한제유에서 일하게 되었다. 할아버지는 재혼한 상태였으며 새 할머니, 삼촌과 고모들이 함께 살고 있었다.</p>
        <p class="tl-body">우리 가족은 대한제유 사옥의 2층에서 생활했던 것으로 기억한다. 기억 속의 집은 일본식 2층 건물이었다. 2층 방은 어린아이의 눈에도 아주 넓었다. 겨울이면 난로를 피웠지만 추웠고, 뜨거운 물을 넣은 유단포를 이불 속에 넣고 잤다. 누나는 유단포 때문에 발에 화상을 입었다. 내가 홍역에 걸렸을 때 어머니가 토끼탕을 끓여주었던 기억도 이 집에 남아 있다.</p>
        <div class="father-photo-row">
          ${photo('father-factory.webp', '대한제유 부산공장 앞에 서 있는 아버지')}
          ${photo('factory-sketch.webp', '제유공장 풍경 복원 스케치')}
        </div>
        <p class="father-note">※ 역사자료를 바탕으로 색을 입힌 참고 이미지이며 실제 당시 색상을 정확히 재현한 것은 아닙니다.</p>
      </section>

      <div class="timeline father-timeline">

        <div class="tl-item">
          <div class="tl-year"></div>
          <div class="tl-title">대한제유 폐업</div>
          <div class="tl-body">대한제유가 문을 닫으면서 가족은 사옥을 떠났다. 자성대 근처의 전셋집으로 이사했다. 아버지는 이후 상당 기간 안정된 직업을 갖지 못했다. 작은 신문사 기자 등 여러 일을 했고 일본 제품이나 미국 물품을 거래하는 일에도 관여했지만 안정적인 경제생활로 이어지지 못했다. 당시는 한국 전체가 일자리와 생계가 어려웠던 시기였고 우리 가족 역시 그 과정에서 자유롭지 못했다.</div>
        </div>

      </div>

      <blockquote class="father-mother-note">
        <p class="father-sub" style="margin-bottom:10px;">그 시간을 버틴 사람</p>
        아버지가 오랫동안 안정된 경제활동을 하지 못하는 동안 어머니는 자식들을 키우고 가정을 꾸리느라 큰 고생을 했다. 아버지의 삶을 기록하면서 이 시절 어머니의 역할 역시 함께 기록되어야 한다.
      </blockquote>

      <div class="timeline father-timeline">

        <div class="tl-item">
          <div class="tl-year">1970년대</div>
          <div class="tl-title">다시 찾은 직장</div>
          <div class="tl-body">1970년대 초중반 무렵 어머니가 지인에게 부탁해 아버지는 시장 경비원으로 취직했다. 그곳에서 정년퇴직할 때까지 일했다. 젊은 시절 여러 직업을 전전했던 아버지에게는 오랜만에 얻은 안정된 자리였다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year">퇴직 후</div>
          <div class="tl-title">가이드</div>
          <div class="tl-body">정년퇴직 후에도 아버지는 새로운 일을 배우려고 했다. 젊은 사람들도 어렵다는 가이드 시험에 합격했다. 이후 간간이 가이드 일을 했다.</div>
          ${photo('guide.webp', '전통 건축물 앞, 양복을 입은 가이드 시절의 아버지', false, true)}
        </div>

        <div class="tl-item">
          <div class="tl-year">노년</div>
          <div class="tl-title"></div>
          <div class="tl-body">아버지는 노년에 치매가 발병했다. 어린 시절을 보낸 일본 사세보를 다시 한번 보고 싶어 했지만 결국 함께 가지 못했다.</div>
        </div>

        <div class="tl-item">
          <div class="tl-year"></div>
          <div class="tl-title">대전현충원</div>
          <div class="tl-body">아버지는 하사관으로 6·25전쟁에 참전했다. 현재 대전현충원에 어머니와 함께 합장되어 있다.</div>
          ${photo('cemetery.webp', '대전현충원 묘역', false, true)}
          <p class="father-note" style="text-align:center; margin-top:14px;">식민지와 해방, 전쟁과 가난, 실직과 재기를 지나온 두 사람의 긴 시간이 이제 한 자리에 함께 남아 있다.</p>
        </div>

      </div>

      <section class="father-closing">
        <p class="serif">어린 시절 나는 아버지를 조금 무서워했다.
말이 적고 무뚝뚝한 분이었다.

그러나 이제 그 삶을 하나씩 이어보니
내가 알지 못했던 한 시대의 무게가
그 침묵 속에 있었음을 조금은 알 것 같다.</p>
        <p class="father-closing-tag">우리 가족의 기억</p>
      </section>

      <a href="index.html" class="father-back father-back-bottom">← 홈으로</a>

    </main>
  `;
});

function photo(filename, alt, small, wide) {
  const cls = ['father-photo'];
  if (small) cls.push('father-photo-small');
  if (wide) cls.push('father-photo-wide');
  return `
    <figure class="${cls.join(' ')}">
      <img src="assets/father/${filename}" alt="${alt.replace(/"/g, '&quot;')}"
           onerror="this.closest('.father-photo').classList.add('ph-missing')">
      <figcaption class="tl-photo-caption">${alt}</figcaption>
    </figure>
  `;
}
