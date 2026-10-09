const games = [
 {id:"ml",name:"Mobile Legends",short:"ML",icon:"💎",currency:"Diamonds",packages:[[86,16000],[172,31000],[257,47000],[344,62000],[429,77000],[514,93000],[706,124000],[878,155000]]},
 {id:"ff",name:"Free Fire",short:"FF",icon:"🔥",currency:"Diamonds",packages:[[70,10000],[140,20000],[355,50000],[720,100000],[1450,200000]]},
 {id:"pubg",name:"PUBG Mobile",short:"PUBG",icon:"🎯",currency:"UC",packages:[[60,15000],[325,75000],[660,149000],[1800,375000],[3850,749000]]},
 {id:"genshin",name:"Genshin Impact",short:"GI",icon:"✨",currency:"Genesis Crystals",packages:[[60,16000],[300,79000],[980,249000],[1980,479000],[6480,1200000]]},
 {id:"hsr",name:"Honkai: Star Rail",short:"HSR",icon:"🚄",currency:"Oneiric Shards",packages:[[60,16000],[300,79000],[980,249000],[1980,479000]]},
 {id:"valo",name:"Valorant",short:"VAL",icon:"🎯",currency:"VP",packages:[[125,15000],[420,50000],[700,80000],[1375,150000]]},
 {id:"cod",name:"Call of Duty",short:"COD",icon:"⚔️",currency:"CP",packages:[[80,15000],[400,75000],[800,149000],[2000,369000]]},
 {id:"roblox",name:"Roblox",short:"RBLX",icon:"🧱",currency:"Robux",packages:[[80,16000],[400,79000],[800,149000],[1700,299000]]},
 {id:"hok",name:"Honor of Kings",short:"HOK",icon:"👑",currency:"Tokens",packages:[[80,16000],[240,49000],[400,79000],[800,149000]]}
];
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n).replace(/\u00a0/g," ");
const fee = 1000;
let selectedGame = "all", cart = [], promoApplied = false, toastTimer;
let history = safeParse(localStorage.getItem("novaOrders")) || [];
function safeParse(s){try{return JSON.parse(s)}catch{return null}}
function packageList(){return games.flatMap(g=>g.packages.map(([amount,price],i)=>({key:`${g.id}-${i}`,gameId:g.id,game:g.name,gameIcon:g.icon,amount,price,currency:g.currency,label:`${amount.toLocaleString("id-ID")} ${g.currency}`})))}
const allPackages = packageList();
function showToast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function renderGames(){ $("gameGrid").innerHTML=games.map(g=>`<button class="game-card ${selectedGame===g.id?"selected":""}" data-game="${g.id}"><span class="game-icon">${g.icon}</span><b>${g.name}</b></button>`).join("");$("gameCount").textContent=`${games.length} game tersedia`; $("gameFilter").innerHTML='<option value="all">Semua Game</option>'+games.map(g=>`<option value="${g.id}">${g.name}</option>`).join("");}
function renderProducts(query=""){const q=query.trim().toLowerCase();let list=allPackages.filter(p=>(selectedGame==="all"||p.gameId===selectedGame)&&(!q||p.game.toLowerCase().includes(q)||p.label.toLowerCase().includes(q)||p.currency.toLowerCase().includes(q)));$("productGrid").innerHTML=list.map(p=>`<article class="product-card"><div class="product-game"><span>${p.gameIcon}</span>${p.game}</div><div class="diamond-art">${p.gameId==="roblox"?"🟦":p.gameId==="genshin"||p.gameId==="hsr"?"✨":"💎"}</div><h3>${p.label}</h3><div class="product-price">${money(p.price)}</div><button class="btn btn-primary" data-add="${p.key}">Pilih Paket <span>→</span></button></article>`).join("");$("emptyProducts").classList.toggle("hidden",list.length>0);$("packageHeading").textContent=selectedGame==="all"?"Top Up Populer":`Top Up ${games.find(g=>g.id===selectedGame)?.name||""}`;}
function addToCart(key){const p=allPackages.find(x=>x.key===key);if(!p)return;const existing=cart.find(x=>x.key===key);if(existing)existing.qty=Math.min(existing.qty+1,10);else cart.push({...p,qty:1});renderCart();showToast(`${p.label} ditambahkan ke pesanan.`)}
function cartSubtotal(){return cart.reduce((sum,p)=>sum+p.price*p.qty,0)}
function cartDiscount(){return promoApplied?Math.round(cartSubtotal()*.1):0}
function cartTotal(){return Math.max(0,cartSubtotal()-cartDiscount()+(cart.length?fee:0))}
function renderCart(){const count=cart.reduce((n,p)=>n+p.qty,0);$("cartCount").textContent=count;$("cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-item"><div class="cart-item-icon">${p.gameIcon}</div><div><h4>${p.game}</h4><p>${p.label}</p><div class="qty-control"><button data-qty="${p.key}" data-delta="-1" aria-label="Kurangi">−</button><span>${p.qty}</span><button data-qty="${p.key}" data-delta="1" aria-label="Tambah">+</button></div></div><button class="remove-item" data-remove="${p.key}" aria-label="Hapus item">×</button></div>`).join(""):`<div class="cart-empty"><span>🛍️</span><b>Keranjang masih kosong</b><small>Pilih paket game untuk memulai.</small></div>`;$("subtotal").textContent=money(cartSubtotal());$("serviceFee").textContent=money(cart.length?fee:0);$("totalPrice").textContent=money(cartTotal());$("checkoutBtn").disabled=!cart.length;renderCheckoutSummary();renderHistory();}
function renderCheckoutSummary(){if(!$("checkoutSummary"))return;const subtotal=cartSubtotal(),discount=cartDiscount();$("checkoutSummary").innerHTML=`<div class="summary-line"><span>${cart.reduce((n,p)=>n+p.qty,0)} paket/item</span><b>${money(subtotal)}</b></div>${discount?`<div class="summary-line"><span>Diskon NOVA10</span><b>− ${money(discount)}</b></div>`:""}<div class="summary-line"><span>Biaya layanan</span><b>${cart.length?money(fee):money(0)}</b></div><div class="summary-line"><span>Total demo</span><b>${money(cartTotal())}</b></div>`}
function setGame(id){selectedGame=id;renderGames();$("gameFilter").value=id;renderProducts($("gameSearch").value);$("populer").scrollIntoView({behavior:"smooth",block:"start"})}
function openModal(id){$(id).classList.remove("hidden");document.body.style.overflow="hidden";if(id==="checkoutModal"){renderCheckoutSummary();$("customerName").focus()}}
function closeModal(id){$(id).classList.add("hidden");if(!document.querySelector(".modal-backdrop:not(.hidden)"))document.body.style.overflow=""}
function renderHistory(){const recent=history.slice(0,4);$("recentTransactions").innerHTML=recent.length?recent.map(o=>`<div class="transaction-row"><span class="transaction-icon">${o.items[0]?.gameIcon||"🎮"}</span><span class="transaction-name">${o.items.map(p=>`${p.game} - ${p.label}`).join(", ")}</span><b class="transaction-price">${money(o.total)}</b><span class="status demo">Demo</span></div>`).join(""):`<div class="empty-history">Belum ada pesanan di browser ini.</div>`;$("historyList").innerHTML=history.length?history.map(o=>`<div class="history-entry"><div class="history-entry-top"><span>${o.code}</span><span>${money(o.total)} · <span class="status demo">DEMO</span></span></div><p>${new Date(o.createdAt).toLocaleString("id-ID")} · ${o.items.map(p=>`${p.game} (${p.label}) ×${p.qty}`).join(", ")}</p><p>Tujuan: ${escapeHtml(o.userId)} ${o.server?"/ Server "+escapeHtml(o.server):""} · Pembayaran: ${escapeHtml(o.payment)}</p></div>`).join(""):`<div class="empty-history">Riwayat masih kosong.</div>`}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveOrder(data){history.unshift(data);history=history.slice(0,50);localStorage.setItem("novaOrders",JSON.stringify(history));}
function updatePaymentInfo(){const method=$("paymentMethod").value;const descriptions={QRIS:["QRIS","Instruksi QRIS demo muncul setelah pesanan dibuat."],DANA:["DANA","Tidak ada saldo yang ditarik di demo ini."],GoPay:["GoPay","Tidak ada aplikasi pembayaran yang dibuka."],OVO:["OVO","Tidak ada pembayaran nyata yang diproses."],"Transfer Bank":["BANK","Nomor rekening tidak dibuat dalam demo."]};$("paymentLogo").textContent=descriptions[method][0];$("paymentTitle").textContent=`Pembayaran ${method}`;$("paymentDescription").textContent=descriptions[method][1]}
$("gameGrid").addEventListener("click",e=>{const b=e.target.closest("[data-game]");if(b)setGame(b.dataset.game)});
$("productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(b.dataset.add)});
$("cartItems").addEventListener("click",e=>{const rm=e.target.closest("[data-remove]"),qty=e.target.closest("[data-qty]");if(rm){cart=cart.filter(p=>p.key!==rm.dataset.remove);renderCart()}if(qty){const p=cart.find(p=>p.key===qty.dataset.qty);if(p){p.qty+=Number(qty.dataset.delta);if(p.qty<=0)cart=cart.filter(x=>x.key!==p.key);if(p.qty>10)p.qty=10;renderCart()}}});
$("gameFilter").addEventListener("change",e=>{selectedGame=e.target.value;renderGames();renderProducts($("gameSearch").value)});
$("gameSearch").addEventListener("input",e=>renderProducts(e.target.value));
$("searchBtn").addEventListener("click",()=>{$("game").scrollIntoView({behavior:"smooth"});renderProducts($("gameSearch").value)});
$("searchFocus").addEventListener("click",()=>{$("gameSearch").focus();$("beranda").scrollIntoView({behavior:"smooth"})});
$("paymentMethod").addEventListener("change",updatePaymentInfo);
$("checkoutBtn").addEventListener("click",()=>{if(cart.length)openModal("checkoutModal")});
$("applyPromo").addEventListener("click",()=>{promoApplied=true;showToast("Promo NOVA10 siap digunakan saat checkout.");renderCart();$("promoCode").value="NOVA10"});
$("checkoutForm").addEventListener("submit",e=>{e.preventDefault();if(!cart.length)return;const code=$("promoCode").value.trim().toUpperCase();const discount=code==="NOVA10"?Math.round(cartSubtotal()*.1):0;const subtotal=cartSubtotal(),total=Math.max(0,subtotal-discount+fee);const order={code:"NOVA-"+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),name:$("customerName").value.trim(),contact:$("customerContact").value.trim(),userId:$("gameUserId").value.trim(),server:$("gameServer").value.trim(),payment:$("paymentMethod").value,items:cart.map(p=>({...p})),subtotal,discount,fee,total,status:"DEMO — belum dibayar"};saveOrder(order);closeModal("checkoutModal");$("orderCode").textContent=order.code;$("resultTotal").textContent=money(order.total);$("resultMessage").textContent=`Pesanan untuk ${order.items.map(p=>p.game).join(", ")} berhasil dibuat sebagai simulasi.`;openModal("resultModal");cart=[];promoApplied=false;$("checkoutForm").reset();renderCart();});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach(m=>closeModal(m.id))});
$("finishOrder").addEventListener("click",()=>{closeModal("resultModal");$("transaksi").scrollIntoView({behavior:"smooth"})});
$("viewHistory").addEventListener("click",()=>openModal("historyModal"));
$("clearHistory").addEventListener("click",()=>{if(!history.length){showToast("Riwayat sudah kosong.");return}if(confirm("Hapus semua riwayat pesanan lokal di browser ini?")){history=[];localStorage.removeItem("novaOrders");renderHistory();showToast("Riwayat lokal dihapus.")}});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");const light=document.body.classList.contains("light");$("themeToggle").textContent=light?"☀":"☾";localStorage.setItem("novaTheme",light?"light":"dark")});
if(localStorage.getItem("novaTheme")==="light"){document.body.classList.add("light");$("themeToggle").textContent="☀"}
$("mobileMenu").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
$("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
$("loginBtn").addEventListener("click",()=>showToast("Login membutuhkan backend untuk autentikasi sungguhan."));
$("registerBtn").addEventListener("click",()=>showToast("Pendaftaran akun nyata membutuhkan backend."));
$("promoCode").addEventListener("input",e=>{promoApplied=e.target.value.trim().toUpperCase()==="NOVA10";renderCheckoutSummary()});
renderGames();renderProducts();renderCart();updatePaymentInfo();



const DEMO_NOTICE_KEY = "novaDemoNoticeAccepted";
const demoWarning = document.getElementById("demoWarning");
const acceptDemoWarning = document.getElementById("acceptDemoWarning");

// Tampilkan peringatan jika belum diterima dalam sesi tab ini
if (sessionStorage.getItem(DEMO_NOTICE_KEY) === "yes") {
  demoWarning.classList.add("hidden");
} else {
  document.body.classList.add("demo-warning-open");
}

// Saat tombol diklik
acceptDemoWarning.addEventListener("click", () => {
  sessionStorage.setItem(DEMO_NOTICE_KEY, "yes");

  demoWarning.classList.add("hidden");
  document.body.classList.remove("demo-warning-open");
});
