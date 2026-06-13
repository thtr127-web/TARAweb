/* ============================================================
   PHẦN 1: GIỎ HÀNG
   - Dữ liệu giỏ hàng được lưu trong localStorage
     để giữ nguyên khi chuyển trang
   ============================================================ */

var CART_KEY = 'tara_cart'; // Tên key lưu trong localStorage

/* Lấy dữ liệu giỏ hàng từ localStorage */
function getCart() {
  var data = localStorage.getItem(CART_KEY);
  if (data) {
    return JSON.parse(data); // Chuyển chuỗi JSON thành mảng
  }
  return []; // Nếu chưa có gì thì trả về mảng rỗng
}

/* Lưu dữ liệu giỏ hàng vào localStorage */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Chuyển mảng thành chuỗi JSON rồi lưu
}

/* Đếm tổng số lượng sản phẩm trong giỏ */
function getTotalQty() {
  var cart = getCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total = total + cart[i].qty;
  }
  return total;
}

/* Cập nhật số hiển thị trên icon giỏ hàng (badge) */
function updateAllBadges() {
  var total = getTotalQty();
  var badges = document.querySelectorAll('.cart-badge');
  for (var i = 0; i < badges.length; i++) {
    badges[i].textContent = total;
  }
}

/* Thêm sản phẩm vào giỏ hàng */
function addToCart(name, price, img) {
  var cart = getCart();

  // Tìm xem sản phẩm này đã có trong giỏ chưa
  var foundIndex = -1;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex > -1) {
    // Sản phẩm đã có → tăng số lượng thêm 1
    cart[foundIndex].qty = cart[foundIndex].qty + 1;
  } else {
    // Sản phẩm chưa có → thêm mới vào giỏ
    var newItem = {
      name: name,
      price: Number(price),
      img: img,
      qty: 1
    };
    cart.push(newItem);
  }

  saveCart(cart);
  updateAllBadges();
  showToast(name); // Hiện thông báo nhỏ ở góc màn hình
}


/* ============================================================
   PHẦN 2: THÔNG BÁO TOAST (góc dưới phải màn hình)
   Hiện khi thêm sản phẩm vào giỏ
   ============================================================ */

function showToast(productName) {
  // Nếu toast chưa tồn tại thì tạo mới
  var toast = document.getElementById('tara-toast');

  if (!toast) {
    // Tạo phần tử toast
    toast = document.createElement('div');
    toast.id = 'tara-toast';
    toast.innerHTML =
      '<div id="tara-toast-inner">' +
        '<span id="tara-toast-icon">&#10003;</span>' +
        '<div>' +
          '<div id="tara-toast-title">Đã thêm vào giỏ hàng!</div>' +
          '<div id="tara-toast-name"></div>' +
        '</div>' +
        '<a href="giohang.html" id="tara-toast-btn">Xem giỏ</a>' +
      '</div>';

    // CSS cho toast
    var style = document.createElement('style');
    style.textContent =
      '#tara-toast {' +
        'position:fixed; bottom:30px; right:30px; z-index:99999;' +
        'transform:translateY(120%); opacity:0;' +
        'transition:transform .35s, opacity .35s;' +
        'pointer-events:none;' +
      '}' +
      '#tara-toast.show { transform:translateY(0); opacity:1; pointer-events:auto; }' +
      '#tara-toast-inner {' +
        'background:#1A1A24; color:#fff;' +
        'display:flex; align-items:center; gap:14px;' +
        'padding:16px 20px; min-width:300px; max-width:380px;' +
        'box-shadow:0 8px 30px rgba(0,0,0,.25);' +
      '}' +
      '#tara-toast-icon {' +
        'width:32px; height:32px; border-radius:50%;' +
        'background:#27AE60; display:flex; align-items:center;' +
        'justify-content:center; font-size:16px; flex-shrink:0;' +
        'line-height:32px; text-align:center;' +
      '}' +
      '#tara-toast-title { font-size:13px; font-weight:700; letter-spacing:1px; }' +
      '#tara-toast-name {' +
        'font-size:12px; color:#9E9EA6; margin-top:2px;' +
        'white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;' +
      '}' +
      '#tara-toast-btn {' +
        'margin-left:auto; flex-shrink:0;' +
        'background:#fff; color:#1A1A24;' +
        'padding:6px 14px; font-size:11px; font-weight:700;' +
        'text-decoration:none; letter-spacing:1px; white-space:nowrap;' +
      '}';

    document.head.appendChild(style);
    document.body.appendChild(toast);
  }

  // Hiển thị tên sản phẩm vừa thêm
  document.getElementById('tara-toast-name').textContent = productName;

  // Xóa timer cũ nếu còn đang đếm
  if (toast.timer) {
    clearTimeout(toast.timer);
  }

  // Hiện toast
  toast.classList.add('show');

  // Tự ẩn sau 3 giây
  toast.timer = setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}


/* ============================================================
   PHẦN 3: GẮN SỰ KIỆN CHO CÁC NÚT "MUA NGAY"
   Chạy trên tất cả các trang có nút thêm vào giỏ
   ============================================================ */

function bindCartButtons() {
  var buttons = document.querySelectorAll('.btn-add-to-cart');

  for (var i = 0; i < buttons.length; i++) {
    // Dùng hàm tự gọi để giữ đúng biến btn trong vòng lặp
    (function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();

        var name  = btn.getAttribute('data-name');
        var price = btn.getAttribute('data-price');
        var img   = btn.getAttribute('data-img');

        // Nếu không có data-* thì đọc từ thẻ cha .product-item
        if (!name) {
          var item = btn.closest('.product-item');
          if (item) {
            var nameEl  = item.querySelector('.name');
            var priceEl = item.querySelector('.price');
            var imgEl   = item.querySelector('img');
            name  = nameEl  ? nameEl.textContent.trim() : 'Sản phẩm TARA';
            price = priceEl ? parsePriceText(priceEl.textContent) : 0;
            img   = imgEl   ? imgEl.src : '';
          } 
        }

        addToCart(name, price, img);

        // Hiệu ứng nút: đổi màu xanh rồi khôi phục lại
        var originalText = btn.textContent;
        btn.textContent = '✓ ĐÃ THÊM';
        btn.style.background = '#27AE60';
        btn.style.color = '#fff';

        setTimeout(function() {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 1500);
      });
    })(buttons[i]);
  }
}

/* Chuyển chuỗi giá như "1,250,000 VNĐ" thành số 1250000 */
function parsePriceText(txt) {
  if (!txt) return 0;
  var cleaned = txt.replace(/[^\d]/g, ''); // Xóa hết ký tự không phải số
  return parseInt(cleaned) || 0;
}


/* ============================================================
   PHẦN 4: SLIDESHOW BANNER (chỉ dùng ở trang index.html)
   ============================================================ */

function initSlideshow() {
  var img = document.getElementById('banner-img');
  if (!img) return; // Không phải trang chủ thì thoát

  var banners = [
    'images/banner1.jpg', 'images/banner2.jpg', 'images/banner3.jpg',
    'images/banner4.jpg', 'images/banner5.jpg', 'images/banner6.jpg',
    'images/banner7.jpg'
  ];
  var current = 0; // Ảnh đang hiển thị
  var timer;       // Biến lưu bộ đếm tự chạy

  // Cài đặt thẻ cha chứa ảnh
  var wrap = img.parentElement;
  wrap.style.position = 'relative';
  wrap.style.overflow = 'hidden';
  img.style.width = '100%';
  img.style.display = 'block';
  img.style.transition = 'opacity 0.6s ease';

  // CSS chung cho nút mũi tên
  var arrowBase =
    'position:absolute; top:50%; transform:translateY(-50%);' +
    'background:rgba(26,26,36,.55); color:#fff; border:none;' +
    'width:44px; height:44px; font-size:20px; cursor:pointer; z-index:10;';

  // Tạo nút quay lại (trái)
  var prev = document.createElement('button');
  prev.innerHTML = '&#8249;';
  prev.style.cssText = arrowBase + 'left:16px;';
  prev.onmouseenter = function() { prev.style.background = 'rgba(26,26,36,.9)'; };
  prev.onmouseleave = function() { prev.style.background = 'rgba(26,26,36,.55)'; };

  // Tạo nút tiếp theo (phải)
  var next = document.createElement('button');
  next.innerHTML = '&#8250;';
  next.style.cssText = arrowBase + 'right:16px;';
  next.onmouseenter = function() { next.style.background = 'rgba(26,26,36,.9)'; };
  next.onmouseleave = function() { next.style.background = 'rgba(26,26,36,.55)'; };

  // Tạo vùng chứa các chấm tròn (dots)
  var dotsWrap = document.createElement('div');
  dotsWrap.style.cssText =
    'position:absolute; bottom:16px; left:50%; transform:translateX(-50%);' +
    'display:flex; gap:8px; z-index:10;';

  // Tạo từng chấm dot theo số lượng ảnh
  var dots = [];
  for (var i = 0; i < banners.length; i++) {
    var dot = document.createElement('span');
    dot.style.cssText =
      'width:8px; height:8px; border-radius:50%; cursor:pointer;' +
      'background:rgba(255,255,255,.5); transition:background .3s, transform .3s;';

    // Gắn sự kiện click cho từng dot (dùng hàm tự gọi để giữ đúng index i)
    (function(index) {
      dot.onclick = function() { goTo(index); };
    })(i);

    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  wrap.appendChild(prev);
  wrap.appendChild(next);
  wrap.appendChild(dotsWrap);

  /* Chuyển đến ảnh số n */
  function goTo(n) {
    img.style.opacity = '0'; // Làm mờ ảnh hiện tại

    setTimeout(function() {
      // Tính index hợp lệ (quay vòng)
      current = (n + banners.length) % banners.length;
      img.src = banners[current];
      img.style.opacity = '1'; // Hiện ảnh mới

      // Cập nhật màu các dots
      for (var j = 0; j < dots.length; j++) {
        if (j === current) {
          dots[j].style.background = '#fff';
          dots[j].style.transform = 'scale(1.3)';
        } else {
          dots[j].style.background = 'rgba(255,255,255,.5)';
          dots[j].style.transform = 'scale(1)';
        }
      }
    }, 300);
  }

  /* Đặt lại bộ đếm tự động khi người dùng bấm nút */
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function() { goTo(current + 1); }, 4500);
  }

  prev.onclick = function() { goTo(current - 1); resetTimer(); };
  next.onclick = function() { goTo(current + 1); resetTimer(); };

  goTo(0); // Hiển thị ảnh đầu tiên
  timer = setInterval(function() { goTo(current + 1); }, 4500); // Tự chạy mỗi 4.5 giây
}


/* ============================================================
   PHẦN 5: TRANG GIỎ HÀNG (giohang.html)
   ============================================================ */

/* Kiểm tra có phải trang giỏ hàng không rồi mới chạy */
function initCartPage() {
  if (!document.getElementById('cart-items-container')) return;
  renderCartPage();
}

/* Vẽ lại toàn bộ danh sách sản phẩm trong giỏ */
function renderCartPage() {
  var container = document.getElementById('cart-items-container');
  var cart = getCart();

  // Nếu giỏ trống
  if (cart.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:60px 20px; border:1px solid #E5E5E9;">' +
        '<div style="font-size:48px; margin-bottom:16px; opacity:.3">🛒</div>' +
        '<p style="font-size:15px; color:#6E6E73; margin-bottom:24px;">Giỏ hàng của bạn đang trống</p>' +
        '<a href="sanpham.html" style="padding:12px 28px; background:#1A1A24; color:#fff;' +
          'text-decoration:none; font-size:12px; font-weight:700; letter-spacing:2px;">' +
          'KHÁM PHÁ SẢN PHẨM' +
        '</a>' +
      '</div>';
    updateSummary([]); // Đặt lại tổng tiền về 0
    return;
  }

  // Tạo HTML cho từng sản phẩm trong giỏ
  var html = '';
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    html +=
      '<div class="cart-row-item" data-idx="' + i + '">' +
        '<div class="col-check">' +
          '<input type="checkbox" class="item-check" data-idx="' + i + '" checked' +
          ' onchange="updateSummaryFromChecked()">' +
        '</div>' +
        '<div class="col-img">' +
          '<img class="cart-prod-img" src="' + item.img + '" alt="' + item.name + '"' +
          ' onerror="this.src=\'images/sp1.jpg\'">' +
        '</div>' +
        '<div class="cart-prod-name col-name">' + item.name + '</div>' +
        '<div class="cart-prod-price col-price">' + formatPrice(item.price) + '</div>' +
        '<div class="col-qty">' +
          '<div class="qty-control">' +
            '<button class="qty-btn" onclick="changeQty(' + i + ', -1)">&#8722;</button>' +
            '<div class="quantity-val" id="qty-val-' + i + '">' + item.qty + '</div>' +
            '<button class="qty-btn" onclick="changeQty(' + i + ', 1)">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="col-del">' +
          '<button class="btn-remove" onclick="removeItem(' + i + ')" title="Xóa">&#10005;</button>' +
        '</div>' +
      '</div>';
  }
  container.innerHTML = html;

  updateSummaryFromChecked(); // Tính lại tổng tiền
}

/* Thay đổi số lượng sản phẩm: delta = +1 hoặc -1 */
function changeQty(idx, delta) {
  var cart = getCart();
  var newQty = cart[idx].qty + delta;

  // Số lượng tối thiểu là 1
  if (newQty < 1) newQty = 1;
  cart[idx].qty = newQty;

  saveCart(cart);

  // Cập nhật số lượng hiển thị trực tiếp mà không cần render lại
  var qtyEl = document.getElementById('qty-val-' + idx);
  if (qtyEl) qtyEl.textContent = cart[idx].qty;

  updateAllBadges();
  updateSummaryFromChecked();
}

/* Xóa sản phẩm khỏi giỏ hàng */
function removeItem(idx) {
  var cart = getCart();
  var removedName = cart[idx].name;

  cart.splice(idx, 1); // Xóa phần tử tại vị trí idx
  saveCart(cart);

  updateAllBadges();
  renderCartPage(); // Vẽ lại giỏ hàng
  showToastMsg('Đã xóa: ' + removedName, '#FF2D55');
}

/* Chọn/bỏ chọn tất cả sản phẩm */
function toggleAll(masterCheckbox) {
  var itemCheckboxes = document.querySelectorAll('.item-check');
  for (var i = 0; i < itemCheckboxes.length; i++) {
    itemCheckboxes[i].checked = masterCheckbox.checked;
  }

  // Đồng bộ cả 2 checkbox "chọn tất cả" (trên và dưới)
  var allMasters = document.querySelectorAll('#check-all, #check-all-bottom');
  for (var j = 0; j < allMasters.length; j++) {
    allMasters[j].checked = masterCheckbox.checked;
  }

  updateSummaryFromChecked();
}

/* Tính tổng tiền chỉ cho các sản phẩm đang được chọn */
function updateSummaryFromChecked() {
  var cart = getCart();

  // Lấy danh sách index của các ô đang được tick
  var checkedIndexes = [];
  var checkboxes = document.querySelectorAll('.item-check:checked');
  for (var i = 0; i < checkboxes.length; i++) {
    checkedIndexes.push(Number(checkboxes[i].getAttribute('data-idx')));
  }

  // Lọc ra các sản phẩm đang được chọn
  var selectedItems = [];
  for (var j = 0; j < cart.length; j++) {
    if (checkedIndexes.indexOf(j) > -1) {
      selectedItems.push(cart[j]);
    }
  }

  updateSummary(selectedItems);
}

/* Cập nhật bảng tóm tắt đơn hàng */
function updateSummary(items) {
  var subtotal = 0;
  for (var i = 0; i < items.length; i++) {
    subtotal = subtotal + items[i].price * items[i].qty;
  }

  var el1 = document.getElementById('summary-subtotal');
  var el2 = document.getElementById('summary-total-money');
  if (el1) el1.textContent = formatPrice(subtotal);
  if (el2) el2.textContent = formatPrice(subtotal);
}

/* Định dạng số tiền: 1250000 → "1.250.000 VNĐ" */
function formatPrice(n) {
  return n.toLocaleString('vi-VN') + ' VNĐ';
}

/* Xử lý khi bấm "Tiến hành thanh toán" */
function checkout() {
  var checkboxes = document.querySelectorAll('.item-check:checked');
  if (checkboxes.length === 0) {
    showToastMsg('Vui lòng chọn ít nhất 1 sản phẩm!', '#FF9900');
    return;
  }
  showCheckoutModal();
}

/* Hiện popup chọn phương thức thanh toán */
function showCheckoutModal() {
  // Nếu modal đã tồn tại thì không tạo thêm
  if (document.getElementById('checkout-modal')) return;

  var modal = document.createElement('div');
  modal.id = 'checkout-modal';

  var style = document.createElement('style');
  style.textContent =
    '#checkout-modal {' +
      'position:fixed; inset:0; z-index:100000;' +
      'background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center;' +
    '}' +
    '#checkout-box {' +
      'background:#fff; padding:50px 44px; max-width:460px; width:90%; text-align:center;' +
    '}' +
    '#checkout-box h2 { font-size:18px; letter-spacing:3px; margin-bottom:12px; color:#1A1A24; }' +
    '#checkout-box p { font-size:13px; color:#6E6E73; margin-bottom:28px; line-height:1.7; }' +
    '.checkout-methods { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:30px; }' +
    '.method-btn {' +
      'padding:10px 18px; border:1.5px solid #E5E5E9; background:#fff;' +
      'font-size:12px; font-weight:700; cursor:pointer; letter-spacing:1px;' +
    '}' +
    '.method-btn.selected { border-color:#1A1A24; background:#1A1A24; color:#fff; }' +
    '#confirm-pay-btn {' +
      'width:100%; padding:14px; background:#1A1A24; color:#fff;' +
      'border:none; font-size:12px; font-weight:700; letter-spacing:2px; cursor:pointer; margin-bottom:12px;' +
    '}' +
    '#cancel-pay-btn {' +
      'background:none; border:none; color:#9E9EA6; font-size:12px; cursor:pointer; text-decoration:underline;' +
    '}';

  modal.innerHTML =
    '<div id="checkout-box">' +
      '<h2>THANH TOÁN</h2>' +
      '<p>Chọn phương thức thanh toán của bạn</p>' +
      '<div class="checkout-methods">' +
        '<button class="method-btn selected" onclick="selectMethod(this)">&#128179; VISA/MASTER</button>' +
        '<button class="method-btn" onclick="selectMethod(this)">&#127974; VNPAY</button>' +
        '<button class="method-btn" onclick="selectMethod(this)">&#128181; COD</button>' +
        '<button class="method-btn" onclick="selectMethod(this)">&#128241; MOMO</button>' +
      '</div>' +
      '<button id="confirm-pay-btn" onclick="confirmPayment()">XÁC NHẬN ĐẶT HÀNG</button>' +
      '<br>' +
      '<button id="cancel-pay-btn" onclick="document.getElementById(\'checkout-modal\').remove()">Hủy</button>' +
    '</div>';

  document.head.appendChild(style);
  document.body.appendChild(modal);
}

/* Chọn một phương thức thanh toán */
function selectMethod(btn) {
  var allMethods = document.querySelectorAll('.method-btn');
  for (var i = 0; i < allMethods.length; i++) {
    allMethods[i].classList.remove('selected');
  }
  btn.classList.add('selected');
}

/* Xác nhận đặt hàng */
function confirmPayment() {
  var modal = document.getElementById('checkout-modal');
  if (modal) modal.remove();

  // Lấy các sản phẩm đang được chọn
  var cart = getCart();
  var checkboxes = document.querySelectorAll('.item-check:checked');
  var checkedIndexes = [];
  for (var i = 0; i < checkboxes.length; i++) {
    checkedIndexes.push(Number(checkboxes[i].getAttribute('data-idx')));
  }

  // Giữ lại sản phẩm KHÔNG được chọn
  var remaining = [];
  for (var j = 0; j < cart.length; j++) {
    if (checkedIndexes.indexOf(j) === -1) {
      remaining.push(cart[j]);
    }
  }

  saveCart(remaining);
  updateAllBadges();

  // Hiển thị màn hình đặt hàng thành công
  var box = document.getElementById('cart-workspace');
  if (box) {
    box.innerHTML =
      '<div style="text-align:center; padding:80px 20px; border:1px solid #E5E5E9;">' +
        '<div style="font-size:56px; margin-bottom:20px;">🎉</div>' +
        '<h2 style="font-family:\'Playfair Display\',serif; font-size:24px; font-weight:400; margin-bottom:12px; color:#1A1A24;">' +
          'Đặt hàng thành công!' +
        '</h2>' +
        '<p style="font-size:13px; color:#6E6E73; margin-bottom:8px;">' +
          'Cảm ơn bạn đã tin tưởng <strong>TARA ATELIER</strong>.' +
        '</p>' +
        '<p style="font-size:13px; color:#6E6E73; margin-bottom:32px;">' +
          'Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút.' +
        '</p>' +
        '<a href="index.html" style="padding:13px 32px; background:#1A1A24; color:#fff;' +
          'text-decoration:none; font-size:11px; font-weight:700; letter-spacing:2px;">' +
          'TIẾP TỤC MUA SẮM' +
        '</a>' +
      '</div>';

    // Cập nhật lại bảng tổng tiền
    updateSummary([]);
  }
}

/* Thông báo nhỏ ở góc trên phải (dùng khi xóa sản phẩm, cảnh báo...) */
function showToastMsg(msg, color) {
  if (!color) color = '#27AE60';

  var t = document.getElementById('tara-mini-toast');

  if (!t) {
    t = document.createElement('div');
    t.id = 'tara-mini-toast';

    var s = document.createElement('style');
    s.textContent =
      '#tara-mini-toast {' +
        'position:fixed; top:100px; right:30px; z-index:99999;' +
        'padding:12px 20px; font-size:13px; color:#fff; font-weight:600;' +
        'opacity:0; transition:opacity .3s; pointer-events:none;' +
      '}' +
      '#tara-mini-toast.show { opacity:1; }';

    document.head.appendChild(s);
    document.body.appendChild(t);
  }

  t.textContent = msg;
  t.style.background = color;

  if (t.hideTimer) clearTimeout(t.hideTimer);
  t.classList.add('show');
  t.hideTimer = setTimeout(function() { t.classList.remove('show'); }, 2000);
}


/* ============================================================
   PHẦN 6: TRANG TÀI KHOẢN (taikhoan.html)
   ============================================================ */

var AUTH_KEY = 'tara_user'; // Tên key lưu tài khoản trong localStorage

/* Chuyển đổi giữa tab Đăng nhập / Đăng ký */
function switchTab(tab, el) {
  var forms = document.querySelectorAll('.auth-form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].classList.remove('active');
  }

  var tabs = document.querySelectorAll('.auth-tab');
  for (var j = 0; j < tabs.length; j++) {
    tabs[j].classList.remove('active');
  }

  document.getElementById('form-' + tab).classList.add('active');
  el.classList.add('active');
}

/* Lấy thông tin người dùng từ localStorage */
function getUser() {
  var data = localStorage.getItem(AUTH_KEY);
  if (data) return JSON.parse(data);
  return null;
}

/* Lưu thông tin người dùng vào localStorage */
function saveUser(u) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(u));
}

/* Xử lý đăng nhập */
function handleLogin() {
  var form     = document.getElementById('form-login');
  var emailEl  = form.querySelector('input[type="email"]');
  var passEl   = form.querySelector('input[type="password"]');
  var email    = emailEl.value.trim();
  var password = passEl.value;
  var errors   = [];

  // Kiểm tra email hợp lệ
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    errors.push('Email không hợp lệ.');
  }

  // Kiểm tra mật khẩu
  if (!password || password.length < 6) {
    errors.push('Mật khẩu tối thiểu 6 ký tự.');
  }

  if (errors.length > 0) {
    showFormError(errors.join(' '));
    return;
  }

  // Kiểm tra tài khoản đã lưu
  var stored = getUser();
  if (stored && stored.email === email && stored.password === password) {
    stored.loggedIn = true;
    saveUser(stored);
    showDashboard(stored);
  } else if (stored && stored.email === email) {
    showFormError('Mật khẩu không đúng.');
  } else {
    // Tạo tài khoản demo nếu chưa có
    var demoUser = {
      email: email,
      name: email.split('@')[0],
      loggedIn: true,
      password: password,
      points: 0,
      tier: 'Member'
    };
    saveUser(demoUser);
    showDashboard(demoUser);
  }
}

/* Xử lý đăng ký */
function handleRegister() {
  var form    = document.getElementById('form-register');
  var inputs  = form.querySelectorAll('input');
  var ho      = inputs[0].value.trim();
  var ten     = inputs[1].value.trim();
  var email   = inputs[2].value.trim();
  var phone   = inputs[3].value.trim();
  var pass    = inputs[4].value;
  var confirm = inputs[5].value;
  var agreeEl = document.getElementById('agree-terms');
  var agreed  = agreeEl ? agreeEl.checked : false;
  var errors  = [];

  if (!ho || !ten) errors.push('Vui lòng nhập họ và tên.');

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) errors.push('Email không hợp lệ.');

  var phonePattern = /^0\d{9}$/;
  if (!phone || !phonePattern.test(phone)) errors.push('Số điện thoại phải đủ 10 số, bắt đầu bằng 0.');

  if (!pass || pass.length < 8) errors.push('Mật khẩu tối thiểu 8 ký tự.');
  if (pass !== confirm) errors.push('Mật khẩu xác nhận không khớp.');
  if (!agreed) errors.push('Bạn cần đồng ý điều khoản dịch vụ.');

  if (errors.length > 0) {
    showFormError(errors.join(' '));
    return;
  }

  var today = new Date();
  var joinDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();

  var newUser = {
    email: email,
    password: pass,
    name: ho + ' ' + ten,
    phone: phone,
    loggedIn: true,
    points: 0,
    tier: 'Member',
    joinDate: joinDate
  };

  saveUser(newUser);
  showDashboard(newUser);
}

/* Hiển thị lỗi trong form */
function showFormError(msg) {
  var el = document.getElementById('form-error-msg');

  if (!el) {
    el = document.createElement('div');
    el.id = 'form-error-msg';
    el.style.cssText =
      'background:#FFF3F3; border:1px solid #FFCCCC; color:#CC0000;' +
      'padding:12px 16px; font-size:12.5px; margin-bottom:16px; line-height:1.5;';

    var activeForm = document.querySelector('.auth-form.active');
    if (activeForm) activeForm.prepend(el);
  }

  el.textContent = msg;
  el.style.display = 'block';

  setTimeout(function() {
    if (el) el.style.display = 'none';
  }, 4000);
}

/* Hiển thị trang dashboard sau khi đăng nhập */
function showDashboard(user) {
  var panel = document.querySelector('.auth-panel');
  if (!panel) return;

  var tierColors = { Member: '#9E9EA6', Silver: '#C9A84C', Gold: '#D4AF37', Platinum: '#1A1A24' };
  var color = tierColors[user.tier] || '#9E9EA6';

  // Lấy chữ cái cuối của tên để làm avatar
  var avatarLetter = 'T';
  if (user.name && user.name.trim().length > 0) {
    avatarLetter = user.name.trim().slice(-1).toUpperCase();
  }

  panel.innerHTML =
    '<div style="border:1px solid #E5E5E9;">' +

      // Phần header avatar + tên
      '<div style="background:#1A1A24; padding:28px 32px; display:flex; align-items:center; gap:20px;">' +
        '<div style="width:56px; height:56px; border-radius:50%; background:#fff;' +
          'display:flex; align-items:center; justify-content:center;' +
          'font-size:22px; font-weight:700; color:#1A1A24; flex-shrink:0;">' +
          avatarLetter +
        '</div>' +
        '<div>' +
          '<div style="color:#fff; font-size:15px; font-weight:700; margin-bottom:4px;">' + (user.name || user.email) + '</div>' +
          '<div style="color:#9E9EA6; font-size:12px;">' + user.email + '</div>' +
        '</div>' +
        '<span style="margin-left:auto; padding:5px 14px; font-size:10px; font-weight:700;' +
          'letter-spacing:2px; border:1px solid ' + color + '; color:' + color + ';">' +
          user.tier +
        '</span>' +
      '</div>' +

      // Phần 3 ô thống kê
      '<div style="display:flex; border-bottom:1px solid #E5E5E9;">' +
        dashTab('📦', 'Đơn hàng', '0 đơn') +
        dashTab('◈', 'Điểm tích lũy', (user.points || 0) + ' điểm') +
        dashTab('❤', 'Yêu thích', '0 sản phẩm') +
      '</div>' +

      // Phần thông tin tài khoản
      '<div style="padding:32px;">' +
        '<h3 style="font-size:11px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase;' +
          'margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #E5E5E9;">THÔNG TIN TÀI KHOẢN</h3>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px;">' +
          infoField('Họ và tên', user.name || '—') +
          infoField('Email', user.email) +
          infoField('Điện thoại', user.phone || '—') +
          infoField('Ngày tham gia', user.joinDate || '—') +
        '</div>' +
        '<div style="display:flex; gap:12px; flex-wrap:wrap;">' +
          '<button onclick="editProfile()" style="padding:10px 22px; border:1.5px solid #1A1A24;' +
            'background:transparent; font-size:11px; font-weight:700; letter-spacing:1.5px; cursor:pointer;"' +
            'onmouseenter="this.style.background=\'#1A1A24\';this.style.color=\'#fff\'"' +
            'onmouseleave="this.style.background=\'transparent\';this.style.color=\'#1A1A24\'">' +
            '✏ CHỈNH SỬA' +
          '</button>' +
          '<button onclick="handleLogout()" style="padding:10px 22px; border:1.5px solid #E5E5E9;' +
            'background:transparent; font-size:11px; font-weight:700; letter-spacing:1.5px; cursor:pointer; color:#9E9EA6;"' +
            'onmouseenter="this.style.borderColor=\'#FF2D55\';this.style.color=\'#FF2D55\'"' +
            'onmouseleave="this.style.borderColor=\'#E5E5E9\';this.style.color=\'#9E9EA6\'">' +
            '⏏ ĐĂNG XUẤT' +
          '</button>' +
        '</div>' +
      '</div>' +

    '</div>';
}

/* Tạo HTML cho 1 ô thống kê trong dashboard */
function dashTab(icon, label, value) {
  return '<div style="flex:1; padding:20px; text-align:center; border-right:1px solid #E5E5E9;">' +
    '<div style="font-size:20px; margin-bottom:6px;">' + icon + '</div>' +
    '<div style="font-size:18px; font-weight:700; color:#1A1A24; margin-bottom:2px;">' + value + '</div>' +
    '<div style="font-size:11px; color:#9E9EA6; letter-spacing:1px;">' + label + '</div>' +
  '</div>';
}

/* Tạo HTML cho 1 ô thông tin trong dashboard */
function infoField(label, value) {
  return '<div>' +
    '<div style="font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase;' +
      'color:#9E9EA6; margin-bottom:6px;">' + label + '</div>' +
    '<div style="font-size:13.5px; color:#1A1A24; font-weight:500;">' + value + '</div>' +
  '</div>';
}

/* Chức năng chỉnh sửa profile (chưa phát triển) */
function editProfile() {
  showToastMsg('Tính năng chỉnh sửa đang được phát triển 🛠', '#2e2e85');
}

/* Đăng xuất */
function handleLogout() {
  var u = getUser();
  if (u) {
    u.loggedIn = false;
    saveUser(u);
  }
  location.reload(); // Tải lại trang
}

/* Khởi tạo trang tài khoản: nếu đã đăng nhập thì hiện dashboard luôn */
function initAccountPage() {
  if (!document.getElementById('form-login')) return;
  var user = getUser();
  if (user && user.loggedIn) {
    showDashboard(user);
  }
}


/* ============================================================
   PHẦN 7: HIỂN THỊ TÊN NGƯỜI DÙNG TRÊN HEADER
   (Nếu đã đăng nhập thì hiện tên ngắn bên dưới icon tài khoản)
   ============================================================ */

function updateHeaderAccount() {
  var user = getUser();
  var link = document.querySelector('a[href="taikhoan.html"].nav-icon-link');
  if (!link) return;

  if (user && user.loggedIn && user.name) {
    // Lấy tên (từ cuối họ tên)
    var nameParts = user.name.split(' ');
    var shortName = nameParts[nameParts.length - 1];

    var badge = link.querySelector('.user-name-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'user-name-badge';
      badge.style.cssText =
        'position:absolute; bottom:-16px; left:50%; transform:translateX(-50%);' +
        'font-size:9px; white-space:nowrap; color:#1A1A24; font-weight:600; letter-spacing:.5px;';
      link.style.position = 'relative';
      link.appendChild(badge);
    }

    badge.textContent = shortName;
  }
}


/* ============================================================
   PHẦN 8: KHỞI ĐỘNG - Chạy khi trang tải xong
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  updateAllBadges();    // Hiển thị số lượng trên icon giỏ hàng
  bindCartButtons();    // Gắn sự kiện cho các nút "Mua ngay"
  initSlideshow();      // Khởi động slideshow (chỉ có tác dụng ở trang chủ)
  initCartPage();       // Khởi động trang giỏ hàng (chỉ có tác dụng ở giohang.html)
  initAccountPage();    // Khởi động trang tài khoản (chỉ có tác dụng ở taikhoan.html)
  updateHeaderAccount();// Cập nhật tên người dùng trên header
});