const zangiUrl = "https://services.zangi.com/dl/conversation/6727254150";
let cart = JSON.parse(localStorage.getItem("gshCart") || "[]");

const cartEl = document.getElementById("cart");
const backdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

function addItem(name, price, options = "") {
  const key = `${name}|${options}`;
  const found = cart.find(x => x.key === key);
  if (found) found.qty += 1;
  else cart.push({key, name, price:Number(price), options, qty:1});
  save();
  openCart();
}
function save(){localStorage.setItem("gshCart", JSON.stringify(cart)); renderCart();}
function renderCart(){
  cartCount.textContent = cart.reduce((s,x)=>s+x.qty,0);
  if(!cart.length){
    cartItems.innerHTML = '<p class="empty">Your request list is empty.</p>';
    cartTotal.textContent = "$0";
    return;
  }
  cartItems.innerHTML = cart.map((x,i)=>`
    <div class="cart-item">
      <div><b>${escapeHtml(x.name)}</b><small>${x.options ? escapeHtml(x.options)+" • " : ""}${x.qty} × $${x.price}</small></div>
      <button class="remove" onclick="removeItem(${i})">Remove</button>
    </div>`).join("");
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  cartTotal.textContent="$"+total.toLocaleString();
}
function removeItem(i){cart.splice(i,1);save();}
function openCart(){cartEl.classList.add("open");backdrop.classList.add("open")}
function closeCart(){cartEl.classList.remove("open");backdrop.classList.remove("open")}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
backdrop.onclick=closeCart;

document.querySelectorAll(".add-ticket").forEach(btn=>{
  btn.onclick=()=>addItem(btn.dataset.name,btn.dataset.price);
});
document.querySelectorAll(".add-meet").forEach(btn=>{
  btn.onclick=()=>addItem(btn.dataset.name,btn.dataset.price);
});
document.querySelectorAll(".add-product").forEach(btn=>{
  btn.onclick=()=>{
    let options="";
    if(btn.dataset.type==="top") options=prompt("Choose size: S, M, L, XL, XXL", "L") || "L";
    if(btn.dataset.type==="cup") options=prompt("Choose cup size: 16 oz, 20 oz, or 30 oz", "20 oz") || "20 oz";
    if(btn.dataset.type==="cap") options=prompt("Choose style: Classic, Trucker, or Snapback", "Classic") || "Classic";
    if(btn.dataset.type==="hoodie") options=prompt("Choose size: S, M, L, XL, XXL", "L") || "L";
    addItem(btn.dataset.name,btn.dataset.price,options);
  };
});

document.getElementById("zangiBtn").onclick=()=>{
  if(!cart.length){alert("Please add a ticket, experience or fan item first.");return;}
  const name=document.getElementById("customerName").value.trim();
  const email=document.getElementById("customerEmail").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  if(!name || !phone){alert("Please enter your name and phone number first.");return;}
  const summary=cart.map(x=>`${x.name} (${x.options||"standard"}) x${x.qty}`).join(", ");
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const message=`Hello. I would like to confirm this fan-hub request. Name: ${name}. Phone: ${phone}. Email: ${email||"not provided"}. Items: ${summary}. Estimated total: $${total}. Please verify availability and authenticity before any payment.`;
  // Zangi's supplied conversation URL is opened directly. The message is copied
  // to the clipboard when supported, so the visitor can paste it into Zangi.
  navigator.clipboard?.writeText(message).catch(()=>{});
  window.open(zangiUrl,"_blank","noopener,noreferrer");
};

const menuBtn=document.getElementById("menuBtn");
const nav=document.getElementById("mainNav");
menuBtn.onclick=()=>nav.classList.toggle("open");
nav.querySelectorAll("a").forEach(a=>a.onclick=()=>nav.classList.remove("open"));

renderCart();
