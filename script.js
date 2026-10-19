'use strict';



/* ---------- Dữ liệu ---------- */
const state = {
  coins: 100000,
  tab: 'daily',
  // passLevel: 0,
  // passXp: 162,     // 162/200 = 81%
  // passNeed: 200,
};

let ownedStars = [];  

// add
const quests = {
  daily: [
    { id: 'd1', title: 'Score 100 goals', progress: 55, target: 100, reward: 500, claimed: false },
  ],
  weekly: [
    { id: 'w1', title: 'Win 5 matches', progress: 2, target: 5, reward:600, claimed: false },
  ],
  season: [
    { id: 's1', title: 'Score a hattrick with ST', progress: 0, target: 3, reward: 500, claimed: false },
  ],
};
// add
const stars = [
  { id: 'bale', name: 'Bale', price: 15000, img: 'src/bale.png' },
  { id: 'mbappe', name: 'Mbappe', price: 12000, img: 'src/mbappe.png' },
//   { id: 'maradona', name: 'Maradona', price: 9000, img: '.png' },
  { id: 'courtois', name: 'Courtois', price: 11000, img: 'src/courtois.png' },

];

// const XP_PER_CLAIM = 40;

function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
    return document.querySelectorAll(selector);

  // add
}
// thêm dấu phẩy -> 1500 = 1,500
function fmt(n) {
  return n.toLocaleString('en-US');
}

/* ---------- Toast  ---------- */
let toastTimer;
function toast(message) {
  const el = $('#toast');
  // add
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 2200);
}

/* ---------- Số dư coin ---------- */
function renderCoins() {
  const coinEls = $all('.js-coins');
  for (let i = 0; i < coinEls.length; i++) {
    // add: hiển thị state.coins (đã định dạng bằng fmt)
    coinEls[i].textContent = fmt(state.coins);
  }
}

/* ---------- Chuyển trang (Home / Quests / Star signings) ---------- */
function showPage(name) {
  const pages = $all('.page');
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    // add: so sánh id (xemhtml) của trang này với "page-" + name, để biết có phải trang cần hiện không
    if (p.id === "page-" + name ) {
      p.hidden = false;
    } else {
      p.hidden = true;
    }
  }

  const menuButtons = $all('.menu__item');
  for (let i = 0; i < menuButtons.length; i++) {
    const btn = menuButtons[i];
    if (btn.dataset.page === name) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.classList.remove('is-active');
      btn.removeAttribute('aria-current');
    }
  }
}

function setupMenu() {
  const menuButtons = $all('.menu__item');
  // add: thêm câu lệnh tính chiều dài cảu menu items
  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].addEventListener('click', function () {
      showPage(this.dataset.page);
    });
  }
}

/* ---------- Quests ---------- */
function questStatus(q) {
  if (q.claimed) {
    return 'done';
  }
  if (q.progress==q.target){
    return 'ready';
  }
  else{
    return'progress';
  }
  // add: nếu q.progress đã đạt tới q.target thì trả về 'ready', ngược lại thì 'progress'
}

// function renderPass() {
//   $('#pass-level').textContent = state.passLevel;

//   let percent = (state.passXp / state.passNeed) * 100;
//   if (percent > 100) {
//     percent = 100;
//   }
//   $('#pass-fill').style.width = percent + '%';
// }

function renderQuests() {
  const list = quests[state.tab];
  let html = '';

  for (let i = 0; i < list.length; i++) {
    const q = list[i];
    const status = questStatus(q);

    let percent = (q.progress / q.target) * 100;
    if (percent > 100) {
      percent = 100;
    }

    let label = 'In progress';
    if (status === 'ready') {
      label = 'Claim';
    }
    if (status === 'done') {
      label = 'Claimed';
    }

    let extraClass = '';
    if (status === 'done') {
      extraClass = ' is-done';
    }

    let disabledAttr = 'disabled';
    if (status === 'ready') {
      disabledAttr = '';
    }

    html += `
      <div class="card">
        <div class="card__head">
          <span>${q.title}&nbsp;&nbsp;-&nbsp;&nbsp;${q.progress}/${q.target}</span>
          <span class="reward"><img class="coin" src="https://cdn-icons-png.flaticon.com/128/9382/9382189.png" alt="">${fmt(q.reward)}</span>
        </div>
        <div class="progress"><div class="progress__fill" style="width:${percent}%"></div></div>
        <button class="btn-pill${extraClass}" data-claim="${q.id}" ${disabledAttr}>
          ${label}
        </button>
      </div>`;
  }

  $('#quest-list').innerHTML = html;
  setupClaimButtons();   // gắn lại sự kiện vì nút vừa được tạo mới
}

// function addXp(amount) {
//   state.passXp += amount;
//   if (state.passXp >= state.passNeed) {
//     state.passXp -= state.passNeed;
//     state.passLevel += 1;
//   }
//   renderPass();
// }

function setupTabs() {
  const tabButtons = $all('.tab');
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener('click', function () {
      state.tab = this.dataset.tab;

      for (let j = 0; j < tabButtons.length; j++) {
        if (tabButtons[j] === this) {
          tabButtons[j].classList.add('is-active');
        } else {
          tabButtons[j].classList.remove('is-active');
        }
      }
      renderQuests();
    });
  }
}

function findQuestById(id) {
  const list = quests[state.tab];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

function setupClaimButtons() {
  const claimButtons = $all('[data-claim]');
  for (let i = 0; i < claimButtons.length; i++) {
    claimButtons[i].addEventListener('click', function () {
      if (this.disabled) {
        return;
      }

      const quest = findQuestById(this.dataset.claim);
      if (quest === null || quest.claimed) {
        return;
      }

      quest.claimed = true;
      // add: cộng thêm quest.reward vào state.coins -> cộng thêm coin sau khi hoàn thành quest
      state.coins += quest.reward;
      // addXp(XP_PER_CLAIM);
      renderCoins();
      renderQuests();
      toast('+' + fmt(quest.reward) + ' coins');
    });
  }
}

/* ---------- Star signings ---------- */
function isOwned(id) {
  for (let i = 0; i < ownedStars.length; i++) {
    if (ownedStars[i] === id) {
      return true;
    }
  }
  return false;
}

function findStarById(id) {
  for (let i = 0; i < stars.length; i++) {
    if (stars[i].id === id) {
      return stars[i];
    }
  }
  return null;
}

function renderSignings() {
  let html = '';

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const owned = isOwned(s.id);

    let extraClass = '';
    let disabledAttr = '';
    let label = 'Sign star';
    if (owned) {
      extraClass = ' is-done';
      disabledAttr = 'disabled';
      label = 'Signed';
    }

    html += `
      <div class="sign-card">
        <img src="${s.img}" alt="${s.name} player card">
        <div class="price"><img class="coin" src="https://cdn-icons-png.flaticon.com/128/9382/9382189.png" alt="">${fmt(s.price)}</div>
        <button class="btn-pill${extraClass}" data-sign="${s.id}" ${disabledAttr}>
          ${label}
        </button>
      </div>`;
  }

  $('#signing-grid').innerHTML = html;
  setupSignButtons();   // gắn lại sự kiện vì nút vừa được tạo mới
}

function setupSignButtons() {
  const signButtons = $all('[data-sign]');
  for (let i = 0; i < signButtons.length; i++) {
    signButtons[i].addEventListener('click', function () {
      const star = findStarById(this.dataset.sign);
      if (star === null || isOwned(star.id)) {
        return;
      }

      if (state.coins < star.price) {
        toast('Need ' + fmt(star.price - state.coins) + ' more coins');
        return;
      }

      state.coins -= star.price;
      ownedStars.push(star.id);
      renderCoins();
      renderSignings();
      toast(star.name + ' signed!');
    });
  }
}
const MAX_ANGLE = 20;


function tiltCards(angleX, angleY) {
  const transformValue = `rotateX(${angleY}deg) rotateY(${angleX}deg)`;


  const signImgs = $all('.sign-card > img');
  for (let i = 0; i < signImgs.length; i++) {
    signImgs[i].style.transform = transformValue;
  }
}


function setupTilt() {
  document.addEventListener('mousemove', function (e) {
    const dx = e.pageX - window.innerWidth / 2;
    const dy = e.pageY - window.innerHeight / 2;


    const angleX = MAX_ANGLE * dx / (window.innerWidth / 2);
    const angleY = MAX_ANGLE * dy / (window.innerHeight / 2);


    tiltCards(angleX, angleY);
  });


  document.addEventListener('mouseleave', function () {
    tiltCards(0, 0);
  });
}
/* ---------- Khởi động trang ---------- */
setupMenu();
setupTabs();
setupTilt();
renderCoins();
// renderPass();
renderQuests();
renderSignings();
showPage('home');
// add
// Call functions that attaches a click listener to each sidebar menu button, each quest tab
// writes the current coin
// builds the quest cards for the current tab from the quests data and the player cards from the stars data 
// show default page


