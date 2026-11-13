/* =========================================================
   Jazz Cafe 주문 키오스크 — 동작

   각 STEP의 빈칸을 채워 기능을 완성한 코드입니다.
   기존 STEP 번호와 설명은 유지했습니다.
   ========================================================= */


/* ---------------------------------------------------------
   1. 요소 선택
   --------------------------------------------------------- */

const tabsBox = document.querySelector('.tabs');
const menuGrid = document.querySelector('.menu-grid');
const cartList = document.querySelector('.cart-list');
const emptyMsg = document.querySelector('.empty-msg');
const totalPriceText = document.querySelector('.total-price');
const totalCountText = document.querySelector('.total-count');
const clearBtn = document.querySelector('.clear-btn');
const orderBtn = document.querySelector('.order-btn');

const modal = document.querySelector('.modal');
const modalPlace = document.querySelector('.modal-place');
const modalNumber = document.querySelector('.modal-number');
const receipt = document.querySelector('.receipt');
const modalTotal = document.querySelector('.modal-total');
const modalClose = document.querySelector('.modal-close');

// 매장 / 포장 버튼
const placeBtns = document.querySelectorAll('.place-btn');


/* ---------------------------------------------------------
   2. 데이터
   --------------------------------------------------------- */

// ★ STEP 2. 카테고리 배열
const categories = ['커피', '논커피', '디저트'];

// ★ STEP 2. 메뉴판 배열
const menus = [
    { id: 1, name: '아메리카노', price: 3000, category: '커피', icon: '☕' },
    { id: 2, name: '카페라떼', price: 3500, category: '커피', icon: '🥛' },
    { id: 3, name: '바닐라라떼', price: 4000, category: '커피', icon: '🍦' },
    { id: 4, name: '카푸치노', price: 4500, category: '커피', icon: '☁️' },
    { id: 5, name: '콜드브루', price: 5000, category: '커피', icon: '🧊' },

    { id: 6, name: '초코라떼', price: 4000, category: '논커피', icon: '🍫' },
    { id: 7, name: '녹차라떼', price: 4500, category: '논커피', icon: '🍵' },
    { id: 8, name: '딸기스무디', price: 5000, category: '논커피', icon: '🍓' },
    { id: 9, name: '자몽에이드', price: 5500, category: '논커피', icon: '🍊' },

    { id: 10, name: '치즈케이크', price: 6000, category: '디저트', icon: '🧀' },
    { id: 11, name: '크루아상', price: 6500, category: '디저트', icon: '🥐' },
    { id: 12, name: '초코쿠키', price: 3000, category: '디저트', icon: '🍪' },
    { id: 13, name: '벨기에 와플', price: 4000, category: '디저트', icon: '🧇' }
];

// ★ STEP 2. 현재 선택된 카테고리
let currCategory = '커피';

// ★ STEP 4. 장바구니
// { id: 메뉴번호, qty: 수량 } 객체를 저장한다.
let cart = [];

// ★ STEP 8. 매장 / 포장
let Place = '매장';

// ★ STEP 9. 다음 주문번호
let orderNo = 1;


/* ---------------------------------------------------------
   3. 도움 함수
   --------------------------------------------------------- */

// ★ STEP 2. 금액 표시
function won(number) {
    return number.toLocaleString('ko-KR') + '원';
}

// ★ STEP 2. 메뉴 찾기
function findMenu(id) {
    return menus.find(menu => menu.id === id);
}

// ★ STEP 6. getTotalPrice() 함수 — 총 결제금액
function getTotalPrice() {
    let total = 0;

    cart.forEach(item => {
        const menu = findMenu(item.id);
        total += menu.price * item.qty;
    });

    return total;
}

// ★ STEP 6. getTotalCount() 함수 — 총 개수
function getTotalCount() {
    let count = 0;

    cart.forEach(item => {
        count += item.qty;
    });

    return count;
}


/* ---------------------------------------------------------
   3-2. 저장하기 / 불러오기 — STEP 10
   --------------------------------------------------------- */
// ★ STEP 10. 저장 이름표 상수 STORAGE_KEY
// 예: 'cafe-kiosk-v1'
const STORAGE_KEY = 'cafe-kiosk-v1'; // 저장할 때 쓰는 이름표

// ★ STEP 10. saveState() 함수


function saveState() {
 const state = { cart: cart, place: place, orderNo: orderNo }; // 세 값을 객체 하나로 묶는다.
 localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ★ STEP 10. loadState() 함수
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY); // 저장된 게 없으면 null
    if (saved === null) {
        return;                                     // 처음 실행: 기본값 그대로
    }
    try {
        const state = JSON.parse(saved); // 글자 → 객체

        if (Array.isArray(state.cart)) {
            // 지금 메뉴판에 없는 메뉴이거나 수량이 이상한 항목은 걸러 낸다.
            cart = state.cart.filter((item) => {
                return findMenu(item.id) !== undefined && item.qty > 0;
            });
        }
        if (state.place === '매장' || state.place === '포장') {
            place = state.place;
        }
        if (Number.isInteger(state.orderNo) && state.orderNo > 0) {
            orderNo = state.orderNo;
        }
    } catch (error) {
        // 저장된 글자가 깨져 있어도 멈추지 않고 기본값으로 시작한다.
    }
}


/* ---------------------------------------------------------
   4. 장바구니 데이터를 바꾸고 화면을 다시 그리는 함수
   --------------------------------------------------------- */

// ★ STEP 4. 메뉴 담기
function addToCart(id) {
    const found = cart.find(item => item.id === id);

    if (found) {
        found.qty++;
    } else {
        cart.push({ id: id, qty: 1 });
    }

    saveState();
    renderCart();
}

// ★ STEP 5. 수량 늘리기 / 줄이기
function changeQty(id, change) {
    const found = cart.find(item => item.id === id);

    // 해당 항목이 없다면 종료한다.
    if (!found) {
        return;
    }

    found.qty += change;

    // 수량이 0개 이하가 되면 삭제한다.
    if (found.qty <= 0) {
        removeFromCart(id);
        return;
    }

    saveState();
    renderCart();
}

// ★ STEP 5. 메뉴 한 종류 삭제
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);

    saveState();
    renderCart();
}


/* ---------------------------------------------------------
   5. 화면 그리기 함수
   --------------------------------------------------------- */

// ★ STEP 3. 카테고리 탭 그리기
function renderTabs() {
    tabsBox.innerHTML = '';

    categories.forEach(category => {
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.classList.add('tab-btn');

        if (category === currCategory) {
            btn.classList.add('active');
        }

        btn.textContent = category;

        btn.addEventListener('click', () => {
            currCategory = category;

            renderTabs();
            renderMenu();
        });

        tabsBox.appendChild(btn);
    });
}

// ★ STEP 2. 메뉴 카드 그리기
function renderMenu() {
    menuGrid.innerHTML = '';

    const shown = menus.filter(
        menu => menu.category === currCategory
    );

    shown.forEach(menu => {
        const card = document.createElement('button');

        card.type = 'button';
        card.classList.add('menu-card');

        const icon = document.createElement('span');

        icon.classList.add('menu-icon');
        icon.textContent = menu.icon;

        const name = document.createElement('span');

        name.classList.add('menu-name');
        name.textContent = menu.name;

        const price = document.createElement('span');

        price.classList.add('menu-price');
        price.textContent = won(menu.price);

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(price);

        card.addEventListener('click', () => {
            addToCart(menu.id);
        });

        menuGrid.appendChild(card);
    });
}

// ★ STEP 8. renderPlace() 함수 — 매장 / 포장 버튼 모양 맞추기
function renderPlace() {
    placeBtns.forEach(btn => {
        const value = btn.dataset.place || btn.textContent.trim();

        btn.classList.toggle('active', value === Place);
    });
}

// ★ STEP 4. 주문 내역 그리기
function renderCart() {
    cartList.innerHTML = '';

    cart.forEach(item => {
        const menu = findMenu(item.id);

        const li = document.createElement('li');

        li.classList.add('cart-item');

        // 첫째 줄: 이름 / 금액
        const name = document.createElement('span');

        name.classList.add('cart-name');
        name.textContent = menu.icon + ' ' + menu.name;

        const sum = document.createElement('span');

        sum.classList.add('cart-sum');
        sum.textContent = won(menu.price * item.qty);

        // 둘째 줄: 수량 조절 / 삭제
        const qtyBox = document.createElement('div');

        // CSS의 .cart-qty-box와 같은 이름을 사용한다.
        qtyBox.classList.add('cart-qty-box');

        const minus = document.createElement('button');

        minus.type = 'button';
        minus.classList.add('qty-btn');
        minus.textContent = ' - ';

        minus.addEventListener('click', () => {
            changeQty(item.id, -1);
        });

        const qty = document.createElement('span');

        qty.classList.add('qty-num');
        qty.textContent = item.qty;

        const plus = document.createElement('button');

        plus.type = 'button';
        plus.classList.add('qty-btn');
        plus.textContent = ' + ';

        plus.addEventListener('click', () => {
            changeQty(item.id, 1);
        });

        qtyBox.appendChild(minus);
        qtyBox.appendChild(qty);
        qtyBox.appendChild(plus);

        const remove = document.createElement('button');

        remove.type = 'button';
        remove.classList.add('remove-btn');
        remove.textContent = '삭제';

        remove.addEventListener('click', () => {
            removeFromCart(item.id);
        });

        li.appendChild(name);
        li.appendChild(sum);
        li.appendChild(qtyBox);
        li.appendChild(remove);

        cartList.appendChild(li);
    });

    // ★ STEP 6. 목록을 그린 다음, 합계를 화면에 표시한다.

    totalPriceText.textContent = won(getTotalPrice());
    totalCountText.textContent = ' 총 ' + getTotalCount();

    // ★ STEP 7. 비어 있을 때의 처리
    if (cart.length === 0) {
        emptyMsg.classList.add('show');
    } else {
        emptyMsg.classList.remove('show');
    }

    clearBtn.disabled = cart.length === 0;
    orderBtn.disabled = cart.length === 0;
}


/* ---------------------------------------------------------
   6. 이벤트
   --------------------------------------------------------- */

// ★ STEP 7. 전체 취소 버튼 클릭
clearBtn.addEventListener('click', () => {
    cart = [];

    saveState();
    renderCart();
});

// ★ STEP 8. 매장 / 포장 버튼 클릭
placeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.place || btn.textContent.trim();

        if (value !== '매장' && value !== '포장') {
            return;
        }

        Place = value;

        saveState();
        renderPlace();
    });
});

// ★ STEP 9. 주문하기 버튼 클릭
orderBtn.addEventListener('click', () => {
   if (cart.length === 0) {
      return;
   }

   modalPlace.textContent = Place === '매장' ? '🪑 매장에서 드십니다' : '🛍️ 포장 주문입니다';
   modalNumber.textContent = String(orderNo).padStart(3, '0'); // 1 -> "001"

   receipt.innerHTML = '';
   cart.forEach(item => {
      const menu = findMenu(item.id);
      const li = document.createElement('li');

      const left = document.createElement('span');
      left.textContent = menu.name + ' x ' + item.qty;

      const right = document.createElement('span');
      right.textContent = won(menu.price * item.qty);

      li.appendChild(left);
      li.appendChild(right);

      receipt.appendChild(li);
   });

   modalTotal.textContent = '총 결제금액' + won(getTotalPrice());

   modal.classList.add('show');

   orderNo++; // 다음 손님은 다음 번호
   cart = []; // 장바구니 비우기
   saveState();
   renderCart();
   
});

// ★ STEP 9. 주문 완료 창 닫기
function closeModal() {
    modal.classList.remove('show');
}

modalClose.addEventListener('click', closeModal);

modalClose.addEventListener('click', (event) => {
   if (event.target === modal) { // 흰 상자가 아니라 어두운 배경을 눌렀을 때만
       closeModal();
   }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});


/* ---------------------------------------------------------
   7. 처음 화면 그리기
   --------------------------------------------------------- */

loadState();
renderTabs();
renderMenu();
renderPlace();
renderCart();