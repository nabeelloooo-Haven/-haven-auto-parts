(function(){
  let cartItems = JSON.parse(localStorage.getItem('havenCart') || '[]');
  let currentProducts = window.products || [];

  const style = document.createElement('style');
  style.textContent = `
    .cart{cursor:pointer}.cart-overlay{position:fixed;inset:0;background:#0008;display:none;align-items:stretch;justify-content:flex-start;z-index:9999}.cart-overlay.open{display:flex}.cart-panel{width:min(440px,92vw);height:100%;background:#fff;box-shadow:0 0 35px #0004;padding:22px;overflow:auto;animation:slideIn .2s ease}.cart-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:14px}.cart-head h2{margin:0}.cart-close{border:0;background:#111827;color:#fff;width:36px;height:36px;border-radius:9px;cursor:pointer}.cart-item{display:grid;grid-template-columns:1fr auto;gap:10px;padding:16px 0;border-bottom:1px solid #eee}.cart-item h4{margin:0 0 5px}.cart-meta{font-size:13px;color:#666}.qty{display:flex;align-items:center;gap:8px;margin-top:10px}.qty button{border:1px solid #ddd;background:#fff;width:30px;height:30px;border-radius:7px;cursor:pointer}.remove{border:0;background:none;color:#b91c1c;cursor:pointer;padding:0;margin-top:8px}.cart-summary{margin-top:20px;background:#f7f8fa;border-radius:12px;padding:16px}.cart-row{display:flex;justify-content:space-between;margin:8px 0}.checkout-btn{width:100%;border:0;background:#d4a017;color:#111827;padding:14px;border-radius:10px;font-weight:900;cursor:pointer;margin-top:12px}.empty-cart{text-align:center;color:#777;padding:50px 10px}.cart-badge{font-size:12px;background:#111827;color:white;border-radius:999px;padding:2px 8px;margin-inline-start:8px}@keyframes slideIn{from{transform:translateX(-20px);opacity:.7}to{transform:none;opacity:1}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  overlay.innerHTML = `<aside class="cart-panel"><div class="cart-head"><h2>سلة المشتريات <span id="cartPanelCount" class="cart-badge">0</span></h2><button class="cart-close" id="cartClose">✕</button></div><div id="cartItems"></div><div id="cartSummary"></div></aside>`;
  document.body.appendChild(overlay);

  function save(){ localStorage.setItem('havenCart', JSON.stringify(cartItems)); updateCount(); renderCart(); }
  function updateCount(){
    const count = cartItems.reduce((s,x)=>s+x.qty,0);
    const el = document.getElementById('cartCount'); if(el) el.textContent = count;
    const el2 = document.getElementById('cartPanelCount'); if(el2) el2.textContent = count;
  }
  function money(n){ return Number(n).toLocaleString('ar-SA',{maximumFractionDigits:2}) + ' ر.س'; }
  function renderCart(){
    const itemsEl = document.getElementById('cartItems');
    const sumEl = document.getElementById('cartSummary');
    if(!itemsEl || !sumEl) return;
    if(!cartItems.length){ itemsEl.innerHTML='<div class="empty-cart">السلة فارغة حالياً</div>'; sumEl.innerHTML=''; return; }
    itemsEl.innerHTML = cartItems.map((x,i)=>`<div class="cart-item"><div><h4>${x.name}</h4><div class="cart-meta">${x.brand} • ${x.fit}</div><div class="qty"><button onclick="havenCart.changeQty(${i},-1)">−</button><b>${x.qty}</b><button onclick="havenCart.changeQty(${i},1)">+</button></div><button class="remove" onclick="havenCart.remove(${i})">حذف</button></div><b>${money(x.price*x.qty)}</b></div>`).join('');
    const subtotal = cartItems.reduce((s,x)=>s+x.price*x.qty,0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    sumEl.innerHTML = `<div class="cart-summary"><div class="cart-row"><span>المجموع قبل الضريبة</span><b>${money(subtotal)}</b></div><div class="cart-row"><span>ضريبة القيمة المضافة 15%</span><b>${money(vat)}</b></div><div class="cart-row" style="font-size:18px"><span>الإجمالي</span><b>${money(total)}</b></div><button class="checkout-btn" onclick="havenCart.checkout()">متابعة إتمام الطلب</button></div>`;
  }
  function openCart(){ overlay.classList.add('open'); renderCart(); }
  function closeCart(){ overlay.classList.remove('open'); }

  window.havenCart = {
    open: openCart,
    close: closeCart,
    changeQty(i,d){ if(!cartItems[i]) return; cartItems[i].qty += d; if(cartItems[i].qty<=0) cartItems.splice(i,1); save(); },
    remove(i){ cartItems.splice(i,1); save(); },
    checkout(){ alert('خطوة الدفع وتجميع بيانات الشحن سيتم تفعيلها ضمن صفحة إتمام الطلب.'); }
  };

  window.render = function(arr=products){
    currentProducts = arr;
    const grid=document.getElementById('grid'); if(!grid) return;
    grid.innerHTML=arr.map((p,i)=>`<div class="card"><div class="pic">${p[4]}</div><div class="body"><div class="brand">${p[1]}</div><h3>${p[0]}</h3><div class="fit">متوافق مع: ${p[2]}</div><div class="price">${p[3]} ر.س</div><button class="btn" onclick="addCart(${i})">أضف إلى السلة</button></div></div>`).join('');
  };
  window.addCart = function(i){
    const p=currentProducts[i]; if(!p) return;
    const existing=cartItems.find(x=>x.name===p[0]&&x.brand===p[1]);
    if(existing) existing.qty += 1; else cartItems.push({name:p[0],brand:p[1],fit:p[2],price:Number(p[3]),qty:1});
    save();
    const t=document.getElementById('toast'); if(t){t.style.display='block';setTimeout(()=>t.style.display='none',1400)}
  };
  window.filterProducts = function(){ const q=(document.getElementById('q')?.value||'').toLowerCase(); window.render(products.filter(p=>p.join(' ').toLowerCase().includes(q))); };

  document.querySelector('.cart')?.addEventListener('click',openCart);
  document.getElementById('cartClose')?.addEventListener('click',closeCart);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) closeCart(); });
  updateCount();
  window.render(products);
})();
