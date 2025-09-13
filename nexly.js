// ===== Estado y helpers =====
let tareas=[];
let gastos=[];
const limites={
  "Comida":900, "Entretenimiento":900, "Transporte":400, "Salud":1000, "Hogar":1500
};
let notificaciones=[];

// ===== Drawer Sidebar & datos visuales =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    overlay.style.display = 'block';
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Actualiza datos usuario en menú
    document.getElementById('sidebar-nombre').textContent = document.getElementById('perfil-nombre').textContent || '';
    document.getElementById('sidebar-correo').textContent = document.getElementById('perfil-correo').textContent || '';
    document.getElementById('sidebar-avatar').src = document.getElementById('foto-perfil').src;
  } else {
    overlay.style.display = 'none';
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
function seleccionMenu(id){
  mostrarSeccion(id);
  toggleSidebar();
}

// ===== Navegación común =====
function mostrarSeccion(id){
  document.querySelectorAll(".seccion").forEach(sec=>sec.style.display="none");
  document.getElementById(id).style.display="block";
  document.querySelectorAll(".sidebar li").forEach(li=>li.classList.remove("active"));
  if(id==="inicio") document.getElementById("nav-inicio").classList.add("active");
  if(id==="tareas") document.getElementById("nav-tareas").classList.add("active");
  if(id==="gastos") document.getElementById("nav-gastos").classList.add("active");
  if(id==="recomendaciones") document.getElementById("nav-recomendaciones").classList.add("active");
  if(id==="perfil") document.getElementById("nav-perfil").classList.add("active");
}

// ===== Bienvenida y Login =====
function mostrarLogin(){
  document.getElementById("bienvenida").style.display="none";
  document.getElementById("login").style.display="block";
}
function entrar(){
  const nombre=document.getElementById("nombre").value.trim();
  const correo=document.getElementById("correo").value.trim();
  if(!nombre||!correo){
    document.getElementById("nombre").classList.add("error");
    document.getElementById("correo").classList.add("error");
    alert("Completa todos los campos para continuar");
    return;
  }
  document.getElementById("perfil-nombre").textContent=nombre;
  document.getElementById("perfil-correo").textContent=correo;
  document.getElementById("perfil-nombre-bar").textContent=nombre;
  document.getElementById("login").style.display="none";
  document.getElementById("bienvenida").style.display="none";
  document.getElementById("main-dashboard").style.display="block";
  mostrarSeccion('inicio');
  pushNotif(`¡Bienvenido ${nombre}!`, 'sistema');
  document.getElementById("foto-perfil-bar").src="img/perfil.jpg";
}
function logout(){
  tareas=[]; gastos=[]; notificaciones=[];
  document.getElementById("main-dashboard").style.display="none";
  document.getElementById("login").style.display="none";
  document.getElementById("bienvenida").style.display="block";
  document.getElementById("lista-tareas").innerHTML="";
  document.getElementById("body-gastos").innerHTML="";
  document.getElementById("notif-list").innerHTML="";
  updateBadge();
  alert("Sesión finalizada. Vuelve pronto.");
}

// ===== Dark mode =====
function toggleDarkMode(){
  document.body.classList.toggle("dark");
  try { localStorage.setItem('nexly-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch(e){}
}
(function(){
  try {
    const pref = localStorage.getItem('nexly-theme');
    if(pref === 'dark') document.body.classList.add('dark');
  } catch(e){}
})();

// ===== Notificaciones =====
function toggleNotifications(){
  const panel=document.getElementById('notif-panel');
  panel.style.display = panel.style.display==='none' || panel.style.display==='' ? 'block' : 'none';
}
function markAllRead(){
  notificaciones=notificaciones.map(n=>({...n,read:true}));
  renderNotifications();
}
function updateBadge(){
  const unread=notificaciones.filter(n=>!n.read).length;
  const badge=document.getElementById('notif-badge');
  if(unread>0){ badge.style.display='inline-block'; badge.textContent=unread; }
  else { badge.style.display='none'; }
}
function pushNotif(msg,type='sistema'){
  const n={ id:Date.now()+Math.random(), msg, type, time:formatTime(), read:false };
  notificaciones.unshift(n);
  renderNotifications();
}
function renderNotifications(){
  const ul=document.getElementById('notif-list');
  ul.innerHTML='';
  notificaciones.forEach(n=>{
    const li=document.createElement('li');
    li.className='notif-item';
    li.innerHTML=`<span class="dot" style="background:${n.read?'#94a3b8':'#22c55e'}"></span>
                  <div class="msg">${n.msg}<div class="time">${n.time}</div></div>
                  <button class="link small ripple" onclick="marcarLeida(${n.id})">${n.read?'Leída':'Marcar'}</button>`;
    ul.appendChild(li);
  });
  updateBadge();
}
function marcarLeida(id){
  notificaciones = notificaciones.map(n=> n.id===id ? {...n, read:true} : n);
  renderNotifications();
}
function formatTime(d=new Date()){
  return d.toLocaleTimeString('es-MX',{hour:'2-digit', minute:'2-digit'});
}

// ===== Tareas =====
function agregarTarea(){
  const t=document.getElementById("nueva-tarea").value.trim();
  const f=document.getElementById("fecha-tarea").value;
  if(!t||!f){
    document.getElementById("nueva-tarea").classList.add("error");
    document.getElementById("fecha-tarea").classList.add("error");
    alert("Completa la descripción y fecha de la tarea.");
    return;
  }
  tareas.push({texto:t,fecha:f});
  mostrarTareas();
  document.getElementById("nueva-tarea").value="";
  document.getElementById("fecha-tarea").value="";
  document.getElementById("nueva-tarea").focus();
}
function mostrarTareas(){
  const ul=document.getElementById("lista-tareas");
  ul.innerHTML="";
  const hoy=new Date();
  tareas.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  tareas.forEach(t=>{
    const li=document.createElement("li");
    li.innerHTML = `<span>${t.texto} - ${t.fecha}</span>`;
    const fechaTarea=new Date(t.fecha);
    const diffDias=Math.floor((fechaTarea - hoy)/(1000*60*60*24));
    if(diffDias<0){ li.className="vencida"; pushNotif(`Tarea vencida: ${t.texto}`, 'tarea'); }
    else if(diffDias===0){ li.className="alerta-hoy"; pushNotif(`Tarea para hoy: ${t.texto}`, 'tarea'); }
    else if(diffDias===1){ li.className="alerta-proxima"; pushNotif(`Tarea próxima (mañana): ${t.texto}`, 'tarea'); }
    ul.appendChild(li);
  });
}

// ===== Gastos =====
function agregarGasto(){
  const cat=document.getElementById("categoria-gasto").value;
  const monto=parseFloat(document.getElementById("monto-gasto").value);
  const fecha=document.getElementById("fecha-gasto").value;
  const desc=document.getElementById("desc-gasto").value.trim();
  if(!cat||isNaN(monto)||!fecha||!desc){
    document.getElementById("categoria-gasto").classList.add("error");
    document.getElementById("monto-gasto").classList.add("error");
    document.getElementById("fecha-gasto").classList.add("error");
    document.getElementById("desc-gasto").classList.add("error");
    alert("Completa todos los campos correctamente");
    return;
  }
  if(monto>limites[cat]) {
    pushNotif(`Excediste el límite permitido en ${cat}: $${monto.toFixed(2)}`, 'gasto');
  }
  gastos.push({cat,monto,fecha,desc});
  mostrarGastos();
  document.getElementById("monto-gasto").value="";
  document.getElementById("desc-gasto").value="";
  document.getElementById("fecha-gasto").value="";
}
function mostrarGastos(){
  const tbody=document.getElementById("body-gastos");
  tbody.innerHTML="";
  const categorias={};
  gastos.forEach(g=>{ if(!categorias[g.cat]) categorias[g.cat]=[]; categorias[g.cat].push(g); });
  Object.keys(categorias).forEach(cat=>{
    categorias[cat].forEach(g=>{
      const tr=document.createElement("tr");
      let claseMonto="";
      if((cat==="Comida"||cat==="Entretenimiento")&&(g.monto>900)) claseMonto="monto-rojo";
      else if((cat==="Comida"||cat==="Entretenimiento")&&(g.monto>=600)) claseMonto="monto-naranja";
      else if(cat==="Transporte" && g.monto>400) claseMonto="monto-rojo";
      else if(cat==="Transporte" && g.monto>=300) claseMonto="monto-naranja";
      else if(cat==="Salud" && g.monto>1000) claseMonto="monto-rojo";
      else if(cat==="Hogar" && g.monto>1500) claseMonto="monto-rojo";
      tr.innerHTML=`<td>${g.cat}</td>
                    <td class="${claseMonto}">${g.monto.toFixed(2)}</td>
                    <td>${g.fecha}</td>
                    <td>${g.desc}</td>
                    <td><button class="btn-outline ripple" onclick="eliminarGasto(${gastos.indexOf(g)})"><i class="fa fa-trash"></i> Eliminar</button></td>`;
      tr.classList.add(cat.toLowerCase());
      tbody.appendChild(tr);
    });
  });
}
function eliminarGasto(index){ gastos.splice(index,1); mostrarGastos(); }

// Validación en tiempo real para números
const montoInput = document.getElementById("monto-gasto");
if(montoInput){
  montoInput.addEventListener("input", e=>{
    const val=e.target.value;
    if(isNaN(val) && val!==""){ alert("Solo se permiten números"); e.target.value=""; }
  });
}

// ===== Recomendaciones Post-its =====
function initPostits() {
  const postits=document.querySelectorAll(".postit");
  postits.forEach(p=>{
    p.addEventListener("dragstart", e=>{ e.dataTransfer.setData("text/plain", e.target.innerHTML); });
    p.addEventListener("dragend", e=>{ e.target.style.transform="translate(0,0)"; });
  });
}
window.addEventListener('DOMContentLoaded', initPostits);

// ===== Perfil =====
function cambiarFoto(e){
  const img=document.getElementById("foto-perfil");
  const imgBar=document.getElementById("foto-perfil-bar");
  if(e.target.files[0]){
    const url = URL.createObjectURL(e.target.files[0]);
    img.src = url;
    imgBar.src = url;
  }
}

// ===== Mejoras visuales para inputs con error (opcional) =====
document.querySelectorAll('input, select').forEach(el=>{
  el.addEventListener('input', ()=>el.classList.remove('error'));
});

// ===== Cerrar menú con Escape =====
window.addEventListener('keydown', function(e){
  if(e.key==='Escape'){
    const sidebar=document.getElementById('sidebar');
    if(sidebar.classList.contains('open')) toggleSidebar();
  }
});