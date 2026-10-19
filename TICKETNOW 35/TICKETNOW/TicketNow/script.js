const money = v => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function qs(name) { return new URLSearchParams(location.search).get(name) }
function go(url) { location.href = url }
function totalWithServiceFee(subtotal) {
  const value = Number(subtotal || 0);
  return value + (value * 0.07);
}
function continuarPagamento(event) {
  if (event) event.preventDefault();

  const selected = document.querySelector('input[name="paymentMethod"]:checked');
  const alertEl = document.getElementById("paymentMethodAlert");

  // Primeiro confirma qual forma de pagamento foi escolhida.
  if (!selected) {
    if (alertEl) {
      alertEl.textContent = "Selecione PIX ou Cartao de credito para continuar.";
      alertEl.style.display = "block";
    }
    return false;
  }

  // Guarda os dados do cliente, caso tenham sido preenchidos, mas nao bloqueia
  // a navegacao para a proxima etapa do pagamento.
  const form = document.getElementById("clientForm");
  if (form) {
    const fields = form.querySelectorAll("input");
    const client = {nome: fields[0]?.value.trim()||"", cpf: onlyDigits(fields[1]?.value||"",11), email: fields[2]?.value.trim()||"", telefone: fields[3]?.value.trim()||""};
    sessionStorage.setItem("ticketnow_client_data", JSON.stringify(client));
  }

  const items = getCart();
  const subtotal = items.reduce((sum, item) => sum + Number(item.preco || 0) * Number(item.qtd || 0), 0);
  const total = totalWithServiceFee(subtotal);

  sessionStorage.setItem("ticketnow_payment_method", selected.value);
  sessionStorage.setItem("ticketnow_payment_total", String(total));

  // NAVEGACAO REAL: leva imediatamente para a pagina correspondente.
  if (selected.value === "pix") {
    window.location.assign("pix.html?total=" + encodeURIComponent(total));
  } else if (selected.value === "card") {
    window.location.assign("credito.html?total=" + encodeURIComponent(total));
  }

  return false;
}

const EVENTS = {
  1: { nome: "SHOW NACIONAL", data: "20 SET", local: "JD EUROPA - SP", preco: 89.90, classificacao: "+16", duracao: "8 horas", abertura: "20:00", img: "https://i.imgur.com/oIWvEEu.jpeg", mapa: "https://i.imgur.com/Ruqkpzj.png", maps: "https://www.google.com/maps/search/?api=1&query=Espaco+Jardim+Europa+Sao+Paulo", descricao: "Uma noite de musica, energia e grandes momentos, reunindo atracoes nacionais em uma experiencia pensada para quem quer aproveitar cada instante.", destaques: ["Atracoes nacionais e clima de festival", "Abertura dos portoes as 20:00", "Experiencia digital e ingresso pratico"] },
  2: { nome: "STAND UP COMEDY", data: "22 SET", local: "PINHEIROS - SP", preco: 89.90, classificacao: "+10", duracao: "3 horas", abertura: "18:00", img: "https://i.imgur.com/hUmnZBS.jpeg", mapa: "https://i.imgur.com/Ruqkpzj.png", maps: "https://www.google.com/maps/search/?api=1&query=Pinheiros+Sao+Paulo", descricao: "Uma noite leve e divertida para reunir amigos, rir e aproveitar uma programacao de humor em um ambiente descontraido.", destaques: ["Humor e entretenimento ao vivo", "Programacao para curtir com amigos", "Abertura dos portoes as 18:00"] },
  3: { nome: "MC IG", data: "20 OUT", local: "BLUMENAU - SC", preco: 129.90, classificacao: "+18", duracao: "5 horas", abertura: "19:00", img: "https://i.imgur.com/ZcefrRq.jpeg", mapa: "https://i.imgur.com/Ruqkpzj.png", maps: "https://www.google.com/maps/search/?api=1&query=Blumenau+Santa+Catarina", descricao: "Uma noite de musica urbana e muita energia, preparada para quem quer viver o show de perto e aproveitar uma experiencia intensa.", destaques: ["Show com alta energia", "Experiencia para o publico +18", "Abertura dos portoes as 19:00"] },
  4: { nome: "TURMA DO PAGODE", data: "29 OUT", local: "BARRA DA TIJUCA - RJ", preco: 79.90, classificacao: "+14", duracao: "4 horas", abertura: "18:00", img: "https://i.imgur.com/U6wHhDt.jpeg", mapa: "https://i.imgur.com/Ruqkpzj.png", maps: "https://www.google.com/maps/search/?api=1&query=Barra+da+Tijuca+Rio+de+Janeiro", descricao: "Uma noite para cantar, curtir e aproveitar o melhor do pagode, com uma atmosfera descontraida e feita para celebrar com quem voce gosta.", destaques: ["Pagode e entretenimento ao vivo", "Clima descontraido para grupos", "Abertura dos portoes as 18:00"] }
};
function getCart() {
  try {
    const saved = localStorage.getItem("ticketnow_cart");
    if (saved) return JSON.parse(saved);
    const legacy = sessionStorage.getItem("ticketnow_cart");
    if (legacy) {
      localStorage.setItem("ticketnow_cart", legacy);
      return JSON.parse(legacy);
    }
    return [];
  } catch (e) { return [] }
}
function setCart(items) {
  localStorage.setItem("ticketnow_cart", JSON.stringify(items));
  sessionStorage.setItem("ticketnow_cart", JSON.stringify(items));
}
function cartCount() { return getCart().reduce((n, i) => n + Number(i.qtd || 0), 0) }
function updateBagCount() { document.querySelectorAll(".bag-count").forEach(e => e.textContent = cartCount()) }
function showToast(text) { let t = document.querySelector(".cart-toast"); if (!t) { t = document.createElement("div"); t.className = "cart-toast"; document.body.appendChild(t) } t.innerHTML = '<span class="toast-check">✓</span><span>' + text + '</span>'; t.classList.remove("show"); void t.offsetWidth; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2600) }
function flyToBag() { const source = document.querySelector(".add-to-cart-source"); const bag = document.querySelector(".bag-icon"); if (!source || !bag) return; const a = source.getBoundingClientRect(), b = bag.getBoundingClientRect(), fly = document.createElement("div"); fly.className = "fly-ticket"; fly.textContent = "🎟"; fly.style.left = (a.left + a.width / 2) + "px"; fly.style.top = (a.top + a.height / 2) + "px"; document.body.appendChild(fly); requestAnimationFrame(() => { fly.style.left = (b.left + b.width / 2) + "px"; fly.style.top = (b.top + b.height / 2) + "px"; fly.style.transform = "translate(-50%,-50%) scale(.35)"; fly.style.opacity = "0" }); setTimeout(() => fly.remove(), 750) }
function addItemsToCart(items) { const cart = getCart(); items.forEach(newItem => { const same = cart.find(i => Number(i.evento) === Number(newItem.evento) && i.setor === newItem.setor); if (same) same.qtd += newItem.qtd; else cart.push(newItem) }); setCart(cart) }

// Evento selecionado: funciona sem PHP e sem banco de dados.
// O ID fica salvo durante a navegacao para que a pagina de setores e o carrinho
// saibam automaticamente qual evento o comprador escolheu.
function getSelectedEventId() {
  const fromUrl = qs("evento");
  const fromPage = window.DETALHE_EVENTO_ID;
  const saved = sessionStorage.getItem("ticketnow_selected_event");
  const id = Number(fromUrl || fromPage || saved || 1);
  return EVENTS[id] ? id : 1;
}
function saveSelectedEvent(id) {
  id = Number(id);
  if (EVENTS[id]) sessionStorage.setItem("ticketnow_selected_event", String(id));
  return id;
}


function isLoggedIn() { return sessionStorage.getItem("ticketnow_logged_in") === "1" }
function getCurrentUser() {
  return {
    nome: sessionStorage.getItem("ticketnow_user_name") || "Cliente TicketNow",
    email: sessionStorage.getItem("ticketnow_user_email") || "E-mail nao informado",
    cpf: sessionStorage.getItem("ticketnow_user_cpf") || "CPF nao informado"
  };
}
function updateProfileLink() {
  document.querySelectorAll(".profile-button").forEach(a => {
    a.href = isLoggedIn() ? "painelcliente.html" : "login.html";
    a.setAttribute("aria-label", isLoggedIn() ? "Minha conta" : "Entrar ou criar conta");
  });
}
function renderClientAccount() {
  const box = document.getElementById("accountInfo");
  if (!box) return;
  if (!isLoggedIn()) {
    box.innerHTML = '<div class="account-empty"><h2>VOCE NAO ESTA LOGADO</h2><p>Entre na sua conta para visualizar seus dados.</p><a class="btn" href="login.html">ENTRAR</a></div>';
    return;
  }
  const u = getCurrentUser();
  box.innerHTML = `
    <div class="account-profile">
      <div class="account-avatar">${(u.nome || "C").trim().charAt(0).toUpperCase()}</div>
      <div><span class="account-label">MINHA CONTA</span><h2>${u.nome}</h2><p>Conta do comprador TicketNow</p></div>
    </div>
    <div class="account-data-grid">
      <div><small>NOME COMPLETO</small><strong>${u.nome}</strong></div>
      <div><small>E-MAIL</small><strong>${u.email}</strong></div>
      <div><small>CPF</small><strong>${u.cpf}</strong></div>
    </div>
    <div class="account-actions"><a class="btn" href="meusingresso.html">MEUS INGRESSOS</a><button class="btn account-logout" type="button" id="clientLogout">SAIR DA CONTA</button></div>`;
  const logout = document.getElementById("clientLogout");
  if (logout) logout.addEventListener("click", () => {
    sessionStorage.removeItem("ticketnow_logged_in");
    sessionStorage.removeItem("ticketnow_user_name");
    sessionStorage.removeItem("ticketnow_user_email");
    sessionStorage.removeItem("ticketnow_user_cpf");
    sessionStorage.removeItem("ticketnow_password");
    sessionStorage.removeItem("ticketnow_selected_event");
    go("index.html");
  });
}
function parseMoneyBR(value) {
  if (typeof value === "number") return value;
  let v = String(value || "").trim().replace(/[R$\s]/g, "");
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  return Number(v) || 0;
}
function getManagerBalance() {
  const saved = Number(localStorage.getItem("ticketnow_manager_balance"));
  if (Number.isFinite(saved) && saved >= 0) return saved;
  const old = Number(sessionStorage.getItem("ticketnow_manager_balance"));
  if (Number.isFinite(old) && old >= 0) {
    localStorage.setItem("ticketnow_manager_balance", String(old));
    return old;
  }
  localStorage.setItem("ticketnow_manager_balance", "14290");
  return 14290;
}
function setManagerBalance(v) { localStorage.setItem("ticketnow_manager_balance", String(Math.max(0, Number(v) || 0))) }
function validPassword(value) { return /[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value) && value.length >= 6 }
function onlyDigits(value, max) {
  const clean = String(value || "").replace(/\D/g, "");
  return typeof max === "number" ? clean.slice(0, max) : clean;
}
function isAdminLoggedIn() { return sessionStorage.getItem("ticketnow_admin_logged_in") === "1" }
function protectManagerPage() {
  const restricted = document.querySelector(".manager-page") || document.getElementById("withdrawForm") || document.querySelector(".withdraw-success");
  if (restricted && !isAdminLoggedIn()) {
    location.replace("admin-login.html");
    return true;
  }
  return false;
}
function formatAccount(account) {
  if (!account) return "Conta bancária informada";
  const bank = account.bank || "Banco", agency = account.agency || "", number = account.number || "";
  return bank + (agency ? " · Ag. " + agency : "") + (number ? " · Conta " + number : "");
}


function getPurchases() {
  try { return JSON.parse(localStorage.getItem("ticketnow_purchases") || "[]"); } catch(e) { return []; }
}
function purchaseDate(item) { return new Date(item.compradoEm || item.dataCompra || Date.now()); }
function inDateRange(d, start, end) { const x=purchaseDate(d); return (!start || x>=start) && (!end || x<=end); }
function getFinanceRange() {
  const period=document.getElementById("financePeriod");
  const startEl=document.getElementById("financeStart"), endEl=document.getElementById("financeEnd");
  let start=null,end=null; const now=new Date(); now.setHours(23,59,59,999);
  const v=period ? period.value : "all";
  if(v==="month") start=new Date(now.getFullYear(),now.getMonth(),1);
  else if(v==="previous"){ start=new Date(now.getFullYear(),now.getMonth()-1,1); end=new Date(now.getFullYear(),now.getMonth(),0,23,59,59,999); }
  else if(v==="30"){ start=new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0); }
  else if(v==="7"){ start=new Date(); start.setDate(start.getDate()-6); start.setHours(0,0,0,0); }
  if(startEl && startEl.value) start=new Date(startEl.value+"T00:00:00");
  if(endEl && endEl.value) end=new Date(endEl.value+"T23:59:59.999");
  return {start,end};
}
function financeData(start,end) {
  const all=getPurchases().filter(x=>inDateRange(x,start,end));
  const tickets=all.reduce((n,x)=>n+Number(x.qtd||1),0);
  const revenue=all.reduce((n,x)=>n+(Number(x.preco||0)*Number(x.qtd||1)),0);
  const fees=revenue*0.07;
  const profit=revenue*0.12;
  const payable=revenue*0.85;
  const clients=new Set(all.map(x=>(x.cliente&&x.cliente.email)||x.clienteCpf||x.pedido||Math.random())).size;
  return {all,tickets,revenue,fees,profit,payable,clients};
}
function totalAutomaticBalance() {
  const all=getPurchases();
  const sales=all.reduce((n,x)=>n+Number(x.preco||0)*Number(x.qtd||1),0);
  const alreadyWithdrawn=Number(localStorage.getItem("ticketnow_withdrawn_total")||0);
  return Math.max(0,sales*0.85-alreadyWithdrawn);
}
function renderFinanceDashboard() {
  if(!document.getElementById("financeRevenue")) return;
  const {start,end}=getFinanceRange(), d=financeData(start,end);
  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
  set("financeTickets",d.tickets.toLocaleString("pt-BR")); set("financeRevenue",money(d.revenue)); set("financeFees",money(d.fees)); set("financeProfit",money(d.profit)); set("financePayable",money(d.payable)); set("financeClients",d.clients.toLocaleString("pt-BR"));
  const balance=totalAutomaticBalance(); set("saldoGerente",money(balance)); set("saldoLateral",money(balance));
  const label=document.getElementById("financePeriodLabel"); if(label) label.textContent=start||end ? ((start?start.toLocaleDateString("pt-BR"):"início")+" até "+(end?end.toLocaleDateString("pt-BR"):"hoje")) : "Todo o período";
  const recent=document.getElementById("financeRecent"); if(recent){ const rows=d.all.slice().sort((a,b)=>purchaseDate(b)-purchaseDate(a)).slice(0,5); recent.innerHTML='<div class="sales-head"><span>ID</span><span>EVENTO</span><span>CLIENTE</span><span>DATA</span><span>VALOR</span><span>STATUS</span></div>'+(rows.length?rows.map(x=>{const c=x.cliente||{};return `<div class="sales-row"><span>#${x.pedido||"-"}</span><span>${x.eventoNome||((EVENTS[x.evento]||{}).nome)||"Evento"}</span><span>${c.nome||"Cliente"}</span><span>${purchaseDate(x).toLocaleDateString("pt-BR")}</span><span>${money(Number(x.preco||0)*Number(x.qtd||1))}</span><b>Pago</b></div>`}).join(""):'<div class="empty-state">Nenhuma venda encontrada neste período.</div>'); }
  const ev=document.getElementById("financeEvents"); if(ev){const map={}; d.all.forEach(x=>{const n=x.eventoNome||((EVENTS[x.evento]||{}).nome)||"Evento";map[n]=(map[n]||0)+Number(x.preco||0)*Number(x.qtd||1)}); ev.innerHTML=Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="event-sale-row"><div><b>${n}</b><span>Vendas registradas</span></div><strong>${money(v)}</strong></div>`).join("")||'<div class="empty-state">Sem vendas no período.</div>';}
  const chart=document.getElementById("financeChart"); if(chart){
    const baseStart=start||new Date(Math.min(...d.all.map(x=>purchaseDate(x).getTime()).filter(Number.isFinite),Date.now()));
    const baseEnd=end||new Date();
    const span=Math.max(1,Math.ceil((baseEnd-baseStart)/86400000)+1);
    const bucketCount=Math.min(span,14), step=Math.max(1,Math.ceil(span/bucketCount)), buckets=[];
    for(let i=0;i<span;i+=step){
      const day=new Date(baseStart); day.setDate(day.getDate()+i); day.setHours(0,0,0,0);
      const endDay=new Date(day); endDay.setDate(endDay.getDate()+step-1); endDay.setHours(23,59,59,999);
      const total=d.all.filter(x=>purchaseDate(x)>=day&&purchaseDate(x)<=endDay).reduce((n,x)=>n+Number(x.preco||0)*Number(x.qtd||1),0);
      buckets.push({day,total,endDay});
    }
    const max=Math.max(...buckets.map(x=>x.total),1);
    chart.innerHTML=buckets.map(x=>`<div class="finance-bar"><span>${money(x.total)}</span><i style="height:${Math.max(4,Math.min(100,x.total/max*100))}%"></i><small>${x.day.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</small></div>`).join("");
  }
}
function renderSalesPage(){const box=document.getElementById("salesDetails");if(!box)return;const period=document.getElementById("salesPeriod"), search=document.getElementById("salesSearch");const draw=()=>{let d=financeData(null,null).all; const now=new Date();if(period&&period.value!=="all"){let start=new Date(now);if(period.value==="month")start=new Date(now.getFullYear(),now.getMonth(),1);else if(period.value==="previous"){start=new Date(now.getFullYear(),now.getMonth()-1,1);now.setDate(0)}else{start.setDate(start.getDate()-Number(period.value)+1)}d=d.filter(x=>purchaseDate(x)>=start&&purchaseDate(x)<=now)} const q=(search?.value||"").toLowerCase();d=d.filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));box.innerHTML='<div class="sales-head"><span>PEDIDO</span><span>EVENTO</span><span>CLIENTE</span><span>DATA</span><span>VALOR</span><span>STATUS</span></div>'+(d.length?d.sort((a,b)=>purchaseDate(b)-purchaseDate(a)).map(x=>{let c=x.cliente||{};return `<div class="sales-row"><span>#${x.pedido||"-"}</span><span>${x.eventoNome||((EVENTS[x.evento]||{}).nome)||"Evento"}</span><span>${c.nome||"Cliente"}</span><span>${purchaseDate(x).toLocaleString("pt-BR")}</span><span>${money(Number(x.preco||0)*Number(x.qtd||1))}</span><b>Pago</b></div>`}).join(""):'<div class="empty-state">Nenhuma venda encontrada.</div>')};period?.addEventListener("change",draw);search?.addEventListener("input",draw);draw();}
function renderClients(){const box=document.getElementById("clientList");if(!box)return;const draw=()=>{const all=getPurchases(), map={};all.forEach(x=>{const c=x.cliente||{};const key=c.email||c.cpf||x.pedido;if(!map[key])map[key]={...c,compras:0,total:0};map[key].compras+=Number(x.qtd||1);map[key].total+=Number(x.preco||0)*Number(x.qtd||1)});const q=(document.getElementById("clientSearch")?.value||"").toLowerCase();const arr=Object.values(map).filter(c=>!q||JSON.stringify(c).toLowerCase().includes(q));box.innerHTML=arr.length?arr.map(c=>`<div class="client-card"><div><strong>${c.nome||"Cliente"}</strong><span>${c.email||"E-mail não informado"}</span><small>CPF: ${c.cpf||"-"} · ${c.compras} ingresso(s)</small></div><b>${money(c.total)}</b></div>`).join(""):'<div class="empty-state">Nenhum cliente com compras registradas.</div>';};document.getElementById("clientSearch")?.addEventListener("input",draw);draw();}
function applyTheme(){const theme=localStorage.getItem("ticketnow_theme")||"dark";document.documentElement.setAttribute("data-theme",theme);document.querySelectorAll(".theme-toggle").forEach(b=>{b.textContent=theme==="light"?"☾ MODO ESCURO":"☀ MODO CLARO";b.title=theme==="light"?"Ativar modo escuro":"Ativar modo claro"})}
function setupTheme(){
  const nav=document.querySelector(".nav");
  const fallback=document.querySelector(".header-icons");
  const box=nav||fallback;
  if(box && !box.querySelector(".theme-toggle")){
    const b=document.createElement("button");
    b.className="theme-toggle";
    b.type="button";
    b.addEventListener("click",()=>{
      localStorage.setItem("ticketnow_theme",(localStorage.getItem("ticketnow_theme")||"dark")==="dark"?"light":"dark");
      applyTheme();
    });
    box.appendChild(b);
  }
  applyTheme();
}
function protectManagerArea(){
  const admin= sessionStorage.getItem("ticketnow_admin_logged_in")==="1";
  const quickFinance=document.getElementById("managerQuickAccess");
  if(quickFinance) quickFinance.classList.toggle("admin-visible", admin);
  const manager=document.querySelector(".manager-page");
  if(manager && !admin && !location.pathname.endsWith("admin-login.html")){
    location.replace("admin-login.html");
    return false;
  }
  if(!admin){
    document.querySelectorAll('a[href*="financeiro.html"],a[href*="clientes.html"],a[href*="vendas.html"],a[href*="relatorios.html"],a[href*="configuracoes.html"],a[href*="saque.html"],a[href*="saquesucesso.html"],a[href*="painelcliente.html"] .finance-link').forEach(a=>a.remove());
    document.querySelectorAll('.finance-link').forEach(a=>a.remove());
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  // Ao atualizar/reiniciar a pagina, a sessao de comprador/gerente volta ao inicio.
  // Os dados de compras, tema e carrinho permanecem salvos.
  const navEntry = performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
  if (navEntry && navEntry.type === "reload") {
    sessionStorage.removeItem("ticketnow_logged_in");
    sessionStorage.removeItem("ticketnow_admin_logged_in");
    sessionStorage.removeItem("ticketnow_user_name");
    sessionStorage.removeItem("ticketnow_user_email");
    sessionStorage.removeItem("ticketnow_user_cpf");
    sessionStorage.removeItem("ticketnow_password");
    sessionStorage.removeItem("ticketnow_selected_event");
    if (!location.pathname.endsWith("index.html") && !location.pathname.endsWith("/")) {
      location.replace("index.html");
      return;
    }
  }
  setupTheme();
  if(!protectManagerArea()) return;
  if (protectManagerPage()) return;

  // Reconhece automaticamente o evento aberto.
  // Nas paginas detalhesevento1/2/3/4 o ID vem de window.DETALHE_EVENTO_ID.
  // Em links com ?evento=3, o ID vem da URL.
  const currentEventId = getSelectedEventId();
  if (window.DETALHE_EVENTO_ID || qs("evento")) saveSelectedEvent(currentEventId);

  // O botao VER INGRESSOS sempre leva o evento correto para a pagina unica de setores.
  const detailSectorButton = document.getElementById("goSector");
  if (detailSectorButton && (window.DETALHE_EVENTO_ID || qs("evento"))) {
    detailSectorButton.href = "setores.html?evento=" + currentEventId;
  }
  updateBagCount();
  updateProfileLink();
  renderClientAccount();

  const adminLogout = document.getElementById("adminLogout");
  if (adminLogout) adminLogout.addEventListener("click", () => sessionStorage.removeItem("ticketnow_admin_logged_in"));

  const adminLogin = document.getElementById("adminLoginForm");
  if (adminLogin) {
    adminLogin.addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("adminUser").value.trim();
      const pass = document.getElementById("adminPass").value;
      const error = document.getElementById("adminLoginError");
      if (user === "admin" && pass === "admin123") {
        sessionStorage.setItem("ticketnow_admin_logged_in", "1");
        go("financeiro.html");
      } else {
        error.textContent = "Usuário ou senha do administrador incorretos.";
        error.style.display = "block";
      }
    });
  }

  const login = document.getElementById("loginForm");
  if (login) login.addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const savedPass = sessionStorage.getItem("ticketnow_password");
    const savedEmail = sessionStorage.getItem("ticketnow_user_email") || "";
    const savedCpf = sessionStorage.getItem("ticketnow_user_cpf") || "";
    if (savedPass && savedPass !== pass) {
      let error = document.getElementById("loginError");
      if (!error) { error = document.createElement("div"); error.id = "loginError"; error.className = "auth-error"; login.insertBefore(error, login.querySelector(".btn")); }
      error.textContent = "Senha incorreta. Se precisar, use 'Esqueci minha senha'.";
      error.style.display = "block";
      return;
    }
    if (savedPass && savedEmail && user !== savedEmail && user !== savedCpf) {
      let error = document.getElementById("loginError");
      if (!error) { error = document.createElement("div"); error.id = "loginError"; error.className = "auth-error"; login.insertBefore(error, login.querySelector(".btn")); }
      error.textContent = "E-mail ou CPF não encontrado.";
      error.style.display = "block";
      return;
    }
    sessionStorage.setItem("ticketnow_logged_in", "1");
    go("painelcliente.html");
  });

  const cadastro = document.getElementById("cadastroForm");
  if (cadastro) cadastro.addEventListener("submit", e => {
    e.preventDefault();
    const inputs = cadastro.querySelectorAll("input");
    const email = inputs[1] ? inputs[1].value.trim() : "";
    const cpf = inputs[2] ? onlyDigits(inputs[2].value, 11) : "";
    const password = inputs[3] ? inputs[3].value : "";
    const error = document.getElementById("cadastroPasswordError") || (() => { const x=document.createElement("div"); x.id="cadastroPasswordError"; x.className="auth-error"; cadastro.insertBefore(x, cadastro.querySelector(".btn")); return x; })();
    if (!/^\d{11}$/.test(cpf)) { error.textContent = "O CPF deve ter exatamente 11 numeros."; error.style.display = "block"; return; }
    if (!validPassword(password)) { error.textContent = "A senha deve ter pelo menos 6 caracteres, 1 letra maiuscula e 1 caracter especial."; error.style.display = "block"; return; }
    error.style.display = "none";
    inputs[2].value = cpf;
    const name = inputs[0] ? inputs[0].value.trim() : "";
    sessionStorage.setItem("ticketnow_user_name", name);
    sessionStorage.setItem("ticketnow_user_email", email);
    sessionStorage.setItem("ticketnow_user_cpf", cpf);
    sessionStorage.setItem("ticketnow_password", password);
    go("login.html");
  });

  const sendRecoveryCode = document.getElementById("sendRecoveryCode");
  if (sendRecoveryCode) {
    sendRecoveryCode.addEventListener("click", () => {
      const user = document.getElementById("recoveryUser").value.trim();
      if (!user) { document.getElementById("recoveryUser").reportValidity(); return; }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      sessionStorage.setItem("ticketnow_recovery_code", code);
      document.getElementById("recoveryStep1").style.display = "none";
      document.getElementById("recoveryStep2").style.display = "block";
      document.getElementById("demoCode").textContent = "Código de demonstração: " + code;
    });
  }

  const verifyRecoveryCode = document.getElementById("verifyRecoveryCode");
  if (verifyRecoveryCode) {
    verifyRecoveryCode.addEventListener("click", () => {
      const entered = document.getElementById("recoveryCode").value.trim();
      const expected = sessionStorage.getItem("ticketnow_recovery_code");
      const msg = document.getElementById("recoveryMessage");
      if (entered !== expected) {
        msg.textContent = "Código de autenticação incorreto.";
        msg.style.display = "block";
        return;
      }
      document.getElementById("recoveryStep2").style.display = "none";
      document.getElementById("recoveryStep3").style.display = "block";
      msg.style.display = "none";
    });
  }

  const recoveryForm = document.getElementById("recoveryForm");
  if (recoveryForm) recoveryForm.addEventListener("submit", e => {
    e.preventDefault();
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    const error = document.getElementById("passwordMatchError");
    if (!validPassword(newPass)) { error.textContent = "A senha deve ter pelo menos 6 caracteres, 1 letra maiuscula e 1 caracter especial."; error.style.display = "block"; return; }
    if (newPass !== confirmPass) { error.textContent = "As senhas são diferentes. Digite a mesma senha nos dois campos."; error.style.display = "block"; return; }
    sessionStorage.setItem("ticketnow_password", newPass);
    sessionStorage.removeItem("ticketnow_recovery_code");
    document.getElementById("recoveryStep3").style.display = "none";
    document.getElementById("recoveryMessage").textContent = "Senha alterada com sucesso! Você já pode entrar.";
    document.getElementById("recoveryMessage").style.display = "block";
    setTimeout(() => go("login.html"), 1200);
  });

  const ticketsArea = document.getElementById("ticketsArea");
  if (ticketsArea) {
    let purchases = [];
    try { purchases = JSON.parse(localStorage.getItem("ticketnow_purchases") || "[]") } catch (e) { purchases = [] }
    if (!purchases.length) {
      ticketsArea.innerHTML = `
        <div class="no-tickets">
          <div class="no-tickets-icon">🎟</div>
          <h1>NÃO HÁ INGRESSOS COMPRADOS</h1>
          <p>Você ainda não possui ingressos na sua conta.</p>
          <span>Encontre seu próximo evento e garanta seu ingresso.</span>
          <a class="btn" href="index.html">VER EVENTOS</a>
        </div>`;
    } else {
      ticketsArea.innerHTML = `
        <div class="tickets-header">
          <div><h1>MEUS INGRESSOS</h1><p>Confira os ingressos comprados nesta conta.</p></div>
          <a class="btn" href="index.html">COMPRAR MAIS</a>
        </div>
        <div class="tickets-list">
          ${purchases.map(it => {
        const ev = EVENTS[it.evento] || EVENTS[1];
        return `<article class="owned-ticket">
              <div class="owned-ticket-main">
                <span class="owned-ticket-label">INGRESSO DIGITAL</span>
                <h2>${ev.nome}</h2>
                <p>${ev.data} · ${ev.local}</p>
                <p>Setor: <b>${it.setor}</b> · Quantidade: <b>${it.qtd}</b></p>
                <span class="ticket-status">CONFIRMADO</span>
                <a class="owned-ticket-action" href="ingresso.html?index=${purchases.indexOf(it)}">ABRIR MEU INGRESSO</a>
              </div>
              <div class="owned-ticket-qr">QR</div>
            </article>`;
      }).join("")}
        </div>`;
    }
  }

  const eventName = document.getElementById("eventName");
  if (eventName && !eventName.dataset.static) {
    const id = getSelectedEventId(), ev = EVENTS[id] || EVENTS[1]; saveSelectedEvent(id);
    eventName.textContent = ev.nome;
    document.getElementById("eventDate").textContent = ev.data;
    document.getElementById("eventLocal").textContent = ev.local;
    document.getElementById("eventPrice").textContent = money(ev.preco);
    document.getElementById("eventClass").textContent = ev.classificacao;
    document.getElementById("eventDuration").textContent = ev.duracao;
    document.getElementById("eventOpening").textContent = ev.abertura;
    const img = document.getElementById("eventImage"); if (img) img.src = ev.img;
    const map = document.getElementById("mapImage"); if (map) map.src = ev.mapa || "";
    const mapLink = document.querySelector(".google-map-link"); if (mapLink && ev.maps) mapLink.href = ev.maps;
    const desc = document.getElementById("eventDescription"); if (desc) desc.textContent = ev.descricao;
    const highlights = document.getElementById("eventHighlights"); if (highlights) highlights.innerHTML = ev.destaques.map(x => `<li>${x}</li>`).join("");
    const goSector = document.getElementById("goSector"); if (goSector) goSector.href = "setores.html?evento=" + id;
  }

  const sectorList = document.getElementById("sectorList");
  if (sectorList) {
    const id = saveSelectedEvent(getSelectedEventId()), prices = [["PISTA", 89.90], ["VIP INTENSE", 149.90], ["CAMAROTE", 189.90]], selected = {}; sectorList.innerHTML = prices.map((x, i) => `<div class="sector-row"><span>${x[0]}<br><b style="color:#f4c400">${money(x[1])}</b></span><div class="quantity-control"><button class="qty minus" data-i="${i}" aria-label="Diminuir">−</button><span id="q${i}">0</span><button class="qty plus" data-i="${i}" aria-label="Aumentar">+</button></div></div>`).join("");
    sectorList.querySelectorAll(".plus").forEach(b => b.onclick = () => { let i = b.dataset.i; selected[i] = (selected[i] || 0) + 1; document.getElementById("q" + i).textContent = selected[i] });
    sectorList.querySelectorAll(".minus").forEach(b => b.onclick = () => { let i = b.dataset.i; selected[i] = Math.max(0, (selected[i] || 0) - 1); document.getElementById("q" + i).textContent = selected[i] });
    document.getElementById("continueCart").onclick = () => { const items = []; prices.forEach((x, i) => { if (selected[i] > 0) items.push({ evento: Number(id), setor: x[0], preco: x[1], qtd: selected[i] }) }); if (!items.length) { alert("Selecione pelo menos um ingresso."); return } addItemsToCart(items); updateBagCount(); document.getElementById("continueCart").classList.add("add-to-cart-source"); flyToBag(); showToast("Ingresso adicionado à sacola!"); setTimeout(() => { window.location.href = "index.html#eventos"; }, 650) };
  }

  const cartItems = document.getElementById("cartItems");
  if (cartItems) {
    let items = getCart();
    const recommendation = document.getElementById("cartRecommendation");
    const renderRecommendation = () => {
      if (!recommendation || !items.length) { if (recommendation) recommendation.innerHTML = ""; return; }
      const presentEvents = [...new Set(items.map(i => Number(i.evento)))];
      const recId = [1,2,3,4].find(id => !presentEvents.includes(id)) || 1;
      const ev = EVENTS[recId];
      recommendation.innerHTML = `
        <div class="cart-recommendation">
          <h3>QUE TAL MAIS UM?</h3>
          <div class="cart-recommendation-card">
            <div class="cart-recommendation-img"><img src="${ev.img}" alt="${ev.nome}"></div>
            <div class="cart-recommendation-info">
              <h4>${ev.nome}</h4>
              <p>${ev.data} - ${ev.local}<br>Classificação: ${ev.classificacao} · Duração: ${ev.duracao}<br>Abertura dos portões: ${ev.abertura}</p>
              <div class="cart-recommendation-price">${money(ev.preco)}</div>
            </div>
            <a class="btn" href="detalhesevento${recId}.html">VER EVENTO</a>
          </div>
        </div>`;
    };
    const render = () => {
      items = getCart();
      if (!items.length) {
        cartItems.innerHTML = '<p style="color:#aaa;font-size:12px">Sua sacola está vazia.</p>';
        if (recommendation) recommendation.innerHTML = "";
        document.getElementById("toPayment").disabled = true;
        document.getElementById("toPayment").style.opacity = .4;
        document.getElementById("sumQty").textContent = "0";
        document.getElementById("sumSub").textContent = money(0);
        const feeEl = document.getElementById("sumFee"); if (feeEl) feeEl.textContent = money(0);
        document.getElementById("sumTotal").textContent = money(0);
        return;
      }
      document.getElementById("toPayment").disabled = false;
      document.getElementById("toPayment").style.opacity = 1;
      cartItems.innerHTML = items.map((it, i) => {
        const ev = EVENTS[it.evento] || EVENTS[1];
        return `<div class="cart-item"><div class="cart-item-img"><!-- IMAGEM: capa do ingresso do item --><img class="image-slot" src="${ev.img}" alt="${ev.nome}"></div><div><h3>${ev.nome} - ${it.setor}</h3><p>Classificação: ${ev.classificacao}<br>Data: ${ev.data}<br>Local: ${ev.local}</p></div><div><div class="cart-price">${money(it.preco * it.qtd)}</div><div class="cart-qty-control"><button class="qty minus" data-i="${i}">−</button><span>${it.qtd}</span><button class="qty plus" data-i="${i}">+</button><button class="qty remove" data-remove="${i}">×</button></div></div></div>`;
      }).join("");
      const total = items.reduce((sum, x) => sum + x.preco * x.qtd, 0);
      const qty = items.reduce((sum, x) => sum + x.qtd, 0);
      const fee = total * 0.07;
      const finalTotal = total + fee;
      document.getElementById("sumQty").textContent = qty;
      document.getElementById("sumSub").textContent = money(total);
      const feeEl = document.getElementById("sumFee"); if (feeEl) feeEl.textContent = money(fee);
      document.getElementById("sumTotal").textContent = money(finalTotal);
      cartItems.querySelectorAll(".plus").forEach(b => b.onclick = () => { items[b.dataset.i].qtd++; setCart(items); render(); updateBagCount() });
      cartItems.querySelectorAll(".minus").forEach(b => b.onclick = () => { items[b.dataset.i].qtd--; if (items[b.dataset.i].qtd <= 0) items.splice(b.dataset.i, 1); setCart(items); render(); updateBagCount() });
      cartItems.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { items.splice(b.dataset.remove, 1); setCart(items); render(); updateBagCount() });
      document.getElementById("toPayment").onclick = () => { if (!items.length) return; go("pagamento.html") };
      renderRecommendation();
    };
    render();
  }

  const paymentTotal = document.getElementById("paymentTotal");
  if (paymentTotal) {
    const items = getCart();
    const subtotal = items.reduce((sum, x) => sum + x.preco * x.qtd, 0);
    const total = totalWithServiceFee(subtotal);
    paymentTotal.textContent = money(total);

    const paymentItems = document.getElementById("paymentItems");
    if (paymentItems) {
      paymentItems.innerHTML = items.length ? items.map(it => {
        const ev = EVENTS[it.evento] || EVENTS[1];
        return `<div class="payment-item"><span>${ev.nome} - ${it.setor}</span><b>${it.qtd}x</b></div>`;
      }).join("") : '<div class="payment-item"><span>Nenhum ingresso selecionado.</span></div>';
      const oldRows = paymentItems.parentElement.querySelectorAll(".payment-breakdown");
      oldRows.forEach(e => e.remove());
      const breakdown = document.createElement("div");
      breakdown.className = "payment-breakdown";
      breakdown.innerHTML = `<div><span>Subtotal</span><span>${money(subtotal)}</span></div><div><span>Taxa de serviço (7%)</span><span>${money(subtotal * 0.07)}</span></div>`;
      paymentItems.after(breakdown);
    }

    if (items.length && !sessionStorage.getItem("ticketnow_checkout_id")) {
      sessionStorage.setItem("ticketnow_checkout_id", "checkout_" + Date.now() + "_" + Math.random().toString(36).slice(2));
    }

    const form = document.getElementById("clientForm");
    const alertEl = document.getElementById("paymentMethodAlert");
    const continuePayment = document.getElementById("continuePayment");
    const radios = document.querySelectorAll('input[name="paymentMethod"]');

    const selectPayment = (radio) => {
      if (!radio) return;
      radios.forEach(r => r.checked = false);
      radio.checked = true;
      document.querySelectorAll(".payment-choice").forEach(choice => choice.classList.remove("selected"));
      const selected = radio.closest(".payment-choice");
      if (selected) selected.classList.add("selected");
      if (alertEl) { alertEl.textContent = ""; alertEl.style.display = "none"; }
    };

    radios.forEach(radio => {
      radio.addEventListener("change", () => selectPayment(radio));
      const label = radio.closest(".payment-choice");
      if (label) {
        label.addEventListener("click", () => selectPayment(radio));
      }
    });

    if (continuePayment) {
      continuePayment.addEventListener("click", continuarPagamento);
    }

    form.addEventListener("submit", e => e.preventDefault());
  }
  const credit = document.getElementById("creditForm"); if (credit) { document.getElementById("creditTotal").textContent = money(qs("total") || 0); const num = document.getElementById("cardNumber"); if (num) num.addEventListener("input", () => { num.value = num.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() }); credit.addEventListener("submit", e => { e.preventDefault(); if (!credit.checkValidity()) { credit.reportValidity(); return } go("comprafinalizada.html") }) }
  const timer = document.getElementById("timer"); if (timer) { const total = Number(qs("total") || 0); document.getElementById("pixTotal").textContent = money(total); const code = "00020126580014BR.GOV.BCB.PIX0136ticketnow" + Math.random().toString(36).slice(2, 20).toUpperCase(); document.getElementById("pixCode").textContent = code; let seconds = 600; const fill = document.getElementById("timerFill"); let int; const tick = () => { const m = String(Math.floor(seconds / 60)).padStart(2, "0"), s = String(seconds % 60).padStart(2, "0"); timer.textContent = `${m}:${s}`; fill.style.width = (seconds / 600 * 100) + "%"; if (seconds <= 0) { clearInterval(int); document.getElementById("copyPix").disabled = true; document.getElementById("paidPix").disabled = true; return } seconds-- }; tick(); int = setInterval(tick, 1000); document.getElementById("copyPix").onclick = async () => { try { await navigator.clipboard.writeText(code); showToast("Código Pix copiado!") } catch (e) { alert(code) } }; document.getElementById("paidPix").onclick = () => { sessionStorage.setItem("ticketnow_payment_method", "pix"); go("comprafinalizada.html") } }
  const purchasePage = document.querySelector(".success");
  if (purchasePage) {
    const cart = getCart();
    const checkoutId = sessionStorage.getItem("ticketnow_checkout_id");
    const recordedId = sessionStorage.getItem("ticketnow_last_recorded_checkout");

    if (cart.length && checkoutId && checkoutId !== recordedId) {
      let purchases = [];
      try { purchases = JSON.parse(localStorage.getItem("ticketnow_purchases") || "[]") } catch (e) { purchases = [] }

      const purchaseDate = new Date().toISOString();
      cart.forEach(item => {
        purchases.push({
          ...item,
          pedido: "TN" + Date.now().toString().slice(-8),
          compradoEm: purchaseDate,
          cliente: (()=>{try{return JSON.parse(sessionStorage.getItem("ticketnow_client_data")||"{}")}catch(e){return {}}})(),
          eventoNome: (EVENTS[item.evento]||{}).nome || "Evento",
          totalCompra: Number(item.preco||0)*Number(item.qtd||1)*1.07,
          formaPagamento: sessionStorage.getItem("ticketnow_payment_method") || "pix"
        });
      });

      localStorage.setItem("ticketnow_purchases", JSON.stringify(purchases));
      sessionStorage.setItem("ticketnow_last_recorded_checkout", checkoutId);
      sessionStorage.removeItem("ticketnow_checkout_id");
      setCart([]);
      updateBagCount();
    }
  }

  // Campos numericos e CPF: aceitam somente numeros, com CPF limitado a 11 digitos.
  document.querySelectorAll('input[inputmode="numeric"]').forEach(input => {
    input.addEventListener("input", () => {
      const max = input.id === "cadastroCpf" || input.id === "clientCpf" || input.id === "holderDocument" ? 11 : null;
      input.value = onlyDigits(input.value, max);
    });
  });
  [document.getElementById("cadastroCpf"), document.getElementById("clientCpf"), document.getElementById("holderDocument")].filter(Boolean).forEach(input => {
    input.addEventListener("blur", () => {
      input.setCustomValidity(/^\d{11}$/.test(input.value) ? "" : "CPF deve ter exatamente 11 numeros.");
    });
  });

  const withdrawForm = document.getElementById("withdrawForm");
  if (withdrawForm) {
    const balance = totalAutomaticBalance();
    const balanceEl = document.getElementById("withdrawBalance");
    if (balanceEl) balanceEl.textContent = money(balance);
    const amount = document.getElementById("withdrawAmount");
    const error = document.getElementById("withdrawError");
    withdrawForm.addEventListener("submit", e => {
      e.preventDefault();
      const value = parseMoneyBR(amount.value);
      if (!value || value <= 0) { error.textContent = "Digite um valor valido."; error.style.display = "block"; return }
      if (value > balance) { error.textContent = "O valor informado é maior que o saldo disponível."; error.style.display = "block"; return }
      if (!withdrawForm.checkValidity()) { withdrawForm.reportValidity(); return }
      const account = {
        holder: document.getElementById("holderName").value,
        document: document.getElementById("holderDocument").value,
        bank: document.getElementById("bankName").value,
        agency: document.getElementById("bankAgency").value,
        number: document.getElementById("bankAccount").value,
        type: document.getElementById("accountType").value,
        pix: document.getElementById("pixKey").value
      };
      localStorage.setItem("ticketnow_withdrawn_total", String(Number(localStorage.getItem("ticketnow_withdrawn_total")||0)+value));
      sessionStorage.setItem("ticketnow_last_withdraw", JSON.stringify({
        amount: value, account: account, date: new Date().toLocaleString("pt-BR")
      }));
      go("saquesucesso.html");
    });
    amount.addEventListener("input", () => { error.style.display = "none" });
  }
  const successAmount = document.getElementById("successAmount");
  if (successAmount) {
    let last = {}; try { last = JSON.parse(sessionStorage.getItem("ticketnow_last_withdraw") || "{}") } catch (e) { }
    successAmount.textContent = money(last.amount || 0);
    const accountEl = document.getElementById("successAccount");
    if (accountEl) accountEl.textContent = formatAccount(last.account);
  }
  renderFinanceDashboard();
  renderSalesPage();
  renderClients();
  const reportRevenue=document.getElementById("reportRevenue"); if(reportRevenue){const d=financeData(null,null); reportRevenue.textContent=money(d.revenue); document.getElementById("reportProfit").textContent=money(d.profit); document.getElementById("reportFees").textContent=money(d.fees); document.getElementById("reportBalance").textContent=money(totalAutomaticBalance());}

});