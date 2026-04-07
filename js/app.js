/* ══════════════════════════════════════════════════════════════════
   app.js — Lógica principal del dashboard interactivo
   
   SECCIONES:
   ─────────────────────────────────────────────────────────────────
   CROSS-FILTER STATE    Filtrado cruzado entre gráficos (estilo PBI)
   CHART SETUP           Chart.js: paleta, inicialización, actualización
   NAVIGATION            Cambio entre páginas (Inicio/Dashboard/Mapas)
   LINK HELPER           Activación dinámica de botones de links
   SCHEDA                Panel lateral con ficha del proyecto + imagen
   MAPS                  Leaflet: mapa mundial (Voyager) + Córdoba (ESRI satélite)
   
   DEPENDENCIAS (cargadas en index.html antes que este archivo):
   ─────────────────────────────────────────────────────────────────
   · Leaflet 1.9.4              — mapas interactivos
   · Leaflet.markercluster      — agrupación de marcadores
   · Chart.js 4.4.0             — gráficos del dashboard
   · js/data.js                 — array global `projects`
   ══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════
   CROSS-FILTER STATE
   ═══════════════════════════════ */
let activeFilter = { field: null, value: null };

function getFiltered(){
  if(!activeFilter.field) return projects;
  return projects.filter(p => String(p[activeFilter.field]) === String(activeFilter.value));
}

function applyFilter(field, value){
  // Toggle: same → clear
  if(activeFilter.field===field && activeFilter.value===value){
    clearFilter(); return;
  }
  activeFilter = { field, value };
  updateFilterBar();
  rebuildAllCharts();
}

function clearFilter(){
  activeFilter = { field: null, value: null };
  updateFilterBar();
  rebuildAllCharts();
}

function updateFilterBar(){
  const bar   = document.getElementById('filter-bar');
  const fval  = document.getElementById('filter-val');
  const fcnt  = document.getElementById('filter-count');
  if(activeFilter.field){
    const filtered = getFiltered();
    bar.classList.add('visible');
    fval.textContent = activeFilter.value;
    fcnt.textContent = `· ${filtered.length} de 120 proyectos`;
  } else {
    bar.classList.remove('visible');
  }
}

/* ═══════════════════════════════
   CHART SETUP
   ═══════════════════════════════ */
const A='#F4821A', A2='#F4C820', GN='#44B840', RD='#E84848';
const BRD='#333220', T2='#9c9278', BG2='#1a190f';
const PAL=[
  '#F4821A', // naranja terracota fuerte
  '#E83060', // coral/fucsia
  '#44B840', // verde vivo
  '#2888D8', // azul arquitectónico
  '#F4C820', // amarillo dorado
  '#E84848', // rojo
  '#30C4A8', // verde agua/teal
  '#C040D0', // violeta
  '#F06030', // naranja rojizo
  '#60D040', // lima
  '#E860A0', // rosa intenso
  '#20A8E8', // celeste
  '#F0A030', // ámbar
  '#8040D0', // morado
  '#30D890', // menta
  '#E82828', // rojo intenso
  '#50C8F0', // azul claro
  '#D8B020', // mostaza
];

Chart.defaults.color=T2;
Chart.defaults.font.family="'DM Mono',monospace";
Chart.defaults.font.size=9;

// All distinct values pre-computed (from full dataset, never change)
const ALL_DESTS  = [...new Set(projects.map(p=>p.dest))].sort((a,b)=>projects.filter(r=>r.dest===b).length-projects.filter(r=>r.dest===a).length);
const ALL_PAISES = [...new Set(projects.map(p=>p.pais))].sort((a,b)=>projects.filter(r=>r.pais===b).length-projects.filter(r=>r.pais===a).length);
const DECS       = [1960,1970,1980,1990,2000,2010,2020];

// Chart instances
let chDest, chPais, chTang, chDec;

function cnt(arr,k,v){ return arr.filter(r=>String(r[k])===String(v)).length; }
function decOf(y){ return y ? Math.floor(y/10)*10 : null; }

/* Highlight color: full opacity if selected or no filter, dimmed otherwise */
function barColors(field, labels){
  return labels.map(lbl=>{
    if(!activeFilter.field) return null; // use palette default
    if(activeFilter.field===field && String(activeFilter.value)===String(lbl))
      return null; // highlighted = default
    return 'rgba(255,255,255,.07)'; // dimmed
  });
}

function initDashboard(){
  buildDestChart();
  buildPaisChart();
  buildTangChart();
  buildDecChart();
  buildHeatmap(projects);
}

/* ── Tipología ── */
function buildDestChart(){
  const filtered = getFiltered();
  const data     = ALL_DESTS.map(d=>cnt(filtered,'dest',d));
  const bgBase   = ALL_DESTS.map((_,i)=>PAL[i%PAL.length]);
  const bg       = ALL_DESTS.map((d,i)=>{
    if(!activeFilter.field || activeFilter.field!=='dest') return bgBase[i];
    return String(activeFilter.value)===d ? bgBase[i] : 'rgba(255,255,255,.07)';
  });

  if(chDest){ chDest.data.datasets[0].data=data; chDest.data.datasets[0].backgroundColor=bg; chDest.update('none'); return; }

  chDest = new Chart('ch-dest',{
    type:'bar',
    data:{labels:ALL_DESTS, datasets:[{data, backgroundColor:bgBase, borderWidth:0, borderRadius:2}]},
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>`  ${c.parsed.x} proyectos`}}},
      scales:{x:{grid:{color:BRD},ticks:{color:T2}}, y:{grid:{display:false},ticks:{color:T2,font:{size:8}}}},
      onClick(evt, els){
        if(!els.length) return;
        applyFilter('dest', ALL_DESTS[els[0].index]);
      }
    }
  });
}

/* ── País ── */
function buildPaisChart(){
  const filtered = getFiltered();
  const data     = ALL_PAISES.map(p=>cnt(filtered,'pais',p));
  const bgBase   = ALL_PAISES.map((_,i)=>PAL[i%PAL.length]);
  const bg       = ALL_PAISES.map((p,i)=>{
    if(!activeFilter.field || activeFilter.field!=='pais') return bgBase[i];
    return String(activeFilter.value)===p ? bgBase[i] : 'rgba(255,255,255,.07)';
  });

  if(chPais){
    chPais.data.datasets[0].data=data;
    chPais.data.datasets[0].backgroundColor=bg;
    chPais.update('none'); return;
  }

  chPais = new Chart('ch-pais',{
    type:'doughnut',
    data:{labels:ALL_PAISES, datasets:[{data, backgroundColor:bgBase, borderColor:BG2, borderWidth:2}]},
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'58%',
      plugins:{
        legend:{position:'right',labels:{color:T2,boxWidth:8,font:{size:8},padding:5}},
        tooltip:{callbacks:{label:c=>{
          const tot=getFiltered().length||1;
          return `${c.label}: ${c.parsed} (${Math.round(c.parsed/tot*100)}%)`;
        }}}
      },
      onClick(evt,els){
        if(!els.length) return;
        applyFilter('pais', ALL_PAISES[els[0].index]);
      }
    }
  });
}

/* ── Realizados ── */
function buildTangChart(){
  const filtered = getFiltered();
  const si       = filtered.filter(p=>p.si==='SI').length;
  const no       = filtered.filter(p=>p.si==='NO').length;
  const bgBase   = [GN,RD];
  const bg       = ['SI','NO'].map((v,i)=>{
    if(!activeFilter.field || activeFilter.field!=='si') return bgBase[i];
    return String(activeFilter.value)===v ? bgBase[i] : 'rgba(255,255,255,.07)';
  });

  if(chTang){
    chTang.data.datasets[0].data=[si,no];
    chTang.data.datasets[0].backgroundColor=bg;
    chTang.update('none'); return;
  }

  chTang = new Chart('ch-tang',{
    type:'bar',
    data:{labels:['Realizados','No ejecutados'], datasets:[{data:[si,no], backgroundColor:bgBase, borderWidth:0, borderRadius:3, hoverBackgroundColor:['#60F040','#FF5050']}]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:T2}}, y:{grid:{color:BRD},ticks:{color:T2}}},
      onClick(evt,els){
        if(!els.length) return;
        applyFilter('si', els[0].index===0?'SI':'NO');
      }
    }
  });
}

/* ── Décadas ── */
function buildDecChart(){
  const filtered = getFiltered();
  const proyData = DECS.map(d=>filtered.filter(p=>decOf(p.ap)===d).length);
  const realData = DECS.map(d=>filtered.filter(p=>decOf(p.ap)===d&&p.si==='SI').length);

  if(chDec){
    chDec.data.datasets[0].data=proyData;
    chDec.data.datasets[1].data=realData;
    // Highlight selected decade
    const ptBg0 = DECS.map(d=>{
      if(!activeFilter.field || activeFilter.field!=='dec') return A2;
      return String(activeFilter.value)===String(d) ? '#fff' : 'rgba(232,169,107,.25)';
    });
    const ptBg1 = DECS.map(d=>{
      if(!activeFilter.field || activeFilter.field!=='dec') return GN;
      return String(activeFilter.value)===String(d) ? '#fff' : 'rgba(122,170,110,.25)';
    });
    chDec.data.datasets[0].pointBackgroundColor=ptBg0;
    chDec.data.datasets[1].pointBackgroundColor=ptBg1;
    chDec.update('none'); return;
  }

  chDec = new Chart('ch-dec',{
    type:'line',
    data:{
      labels: DECS.map(d=>d+'s'),
      datasets:[
        {label:'Proyectados', data:proyData, borderColor:'#F4C820', backgroundColor:'rgba(244,200,32,.10)', tension:.35, borderWidth:2.5, pointRadius:5, pointHoverRadius:7, pointBackgroundColor:'#F4C820'},
        {label:'Realizados',  data:realData, borderColor:'#44B840', backgroundColor:'rgba(68,184,64,.10)', tension:.35, borderWidth:2.5, pointRadius:5, pointHoverRadius:7, pointBackgroundColor:'#44B840'}
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{color:T2,boxWidth:8,padding:10}}},
      scales:{x:{grid:{color:BRD},ticks:{color:T2}}, y:{grid:{color:BRD},ticks:{color:T2}}},
      onClick(evt,els){
        if(!els.length) return;
        applyFilter('dec', DECS[els[0].index]);
      }
    }
  });
}

/* ── Heatmap ── */
function buildHeatmap(data){
  const dests=[...new Set(projects.map(p=>p.dest))].sort((a,b)=>projects.filter(r=>r.dest===b).length-projects.filter(r=>r.dest===a).length);
  const hm={};
  DECS.forEach(d=>{ hm[d]={}; dests.forEach(ds=>{ hm[d][ds]=0; }); });
  data.forEach(p=>{
    const d=decOf(p.ap);
    if(d && hm[d] && hm[d][p.dest]!==undefined) hm[d][p.dest]++;
  });
  let mx=0; DECS.forEach(d=>dests.forEach(ds=>{if(hm[d][ds]>mx)mx=hm[d][ds];}));
  if(mx===0) mx=1;

  function cellBg(v){
    if(!v) return 'rgba(0,0,0,0)';
    const t=v/mx;
    return `rgba(${Math.round(26+170*t)},${Math.round(25+88*t)},${Math.round(15+43*t)},${.3+t*.7})`;
  }
  function cellTxt(v){ return v>=6?'#f5efdf':v>=3?'#e8a96b':v>=1?'#9c9278':'transparent'; }

  let h='<thead><tr><th>Década</th>'+dests.map(d=>`<th title="${d}">${d.length>12?d.slice(0,11)+'…':d}</th>`).join('')+'</tr></thead><tbody>';
  DECS.forEach(d=>{
    // highlight row if filtering by decade
    const rowStyle = (activeFilter.field==='dec' && String(activeFilter.value)===String(d))
      ? ' style="outline:1px solid rgba(196,113,58,.5)"' : '';
    h+=`<tr${rowStyle}><td>${d}s</td>`+dests.map(ds=>{
      const v=hm[d][ds];
      // dim cell if its dest or pais is filtered out and doesn't match
      let extra='';
      if(activeFilter.field==='dest' && activeFilter.value!==ds && v>0) extra='opacity:.25;';
      return `<td style="background:${cellBg(v)};color:${cellTxt(v)};${extra}">${v||''}</td>`;
    }).join('')+'</tr>';
  });
  document.getElementById('hm').innerHTML=h+'</tbody>';
}

/* Rebuild everything from current filter */
function rebuildAllCharts(){
  buildDestChart();
  buildPaisChart();
  buildTangChart();
  buildDecChart();
  buildHeatmap(getFiltered());
  // Highlight source card
  ['dest','pais','tang','dec'].forEach(id=>{
    const fieldMap={dest:'dest',pais:'pais',tang:'si',dec:'dec'};
    const card=document.getElementById('card-'+id);
    if(!card) return;
    card.classList.toggle('has-filter', activeFilter.field===fieldMap[id]);
  });
}

/* ═══════════════════════════════
   NAVIGATION
   ═══════════════════════════════ */
let dashInit=false, mapWInit=false, mapCInit=false;

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('#topbar nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.getElementById('btn-'+id).classList.add('active');
  if(id==='dash'   && !dashInit){ dashInit=true; initDashboard(); }
  if(id==='world'  && !mapWInit)  initMapWorld();
  if(id==='cordoba'&& !mapCInit)  initMapCba();
}

/* ═══════════════════════════════
   LINK HELPER
   ═══════════════════════════════ */
function imgErr(container){
  container.innerHTML='<div class="imgph"><span>▣</span><span>Sin imagen disponible</span></div>';
}

function setLink(elId, url, is360){
  const el=document.getElementById(elId);
  if(!el) return;
  if(url && url.startsWith('http')){
    el.href=url; el.classList.remove('off');
    if(is360) el.classList.add('has360'); else el.classList.remove('has360');
  } else {
    el.removeAttribute('href'); el.classList.add('off'); el.classList.remove('has360');
  }
}

/* ═══════════════════════════════
   SCHEDA
   ═══════════════════════════════ */
function renderScheda(panel, proj){
  const sem  = document.getElementById('sem-'+panel);
  const card = document.getElementById('scard-'+panel);
  if(!proj){
    sem.style.display='flex'; card.innerHTML='';
    setLink('lnk-'+panel+'-360','',true);
    setLink('lnk-'+panel+'-info','',false);
    return;
  }
  sem.style.display='none';
  const stCls = proj.si==='SI'?'si':'no';
  const stTxt = proj.si==='SI'?'✓ Realizado':'○ No ejecutado';
  const yr    = proj.ar||'—';
  const desc  = proj.desc||'';

  const imgHtml = proj.img&&proj.img.startsWith('http')
    ? '<div class="imgwrap"><img src="'+proj.img+'" alt="" loading="lazy" onerror="imgErr(this.parentElement)"><div class="imglbl"><div class="imglbl-dest">'+proj.dest+'</div></div></div>'
    : '<div class="imgwrap"><div class="imgph"><span>▣</span><span>Sin imagen disponible</span></div></div>';

  card.innerHTML=imgHtml+`
    <div class="scc">
      <div class="scname">${proj.name}</div>
      <div class="scst ${stCls}"><span class="dot"></span>${stTxt}</div>
      <hr class="scdiv">
      <div class="scrow">
        <div class="scf"><span class="sfl">Año de Proyecto</span><span class="sfv yr">${proj.ap||'—'}</span></div>
        <div class="scf"><span class="sfl">Año de Realización</span><span class="sfv yr">${yr}</span></div>
      </div>
      <div class="scf" style="margin-bottom:10px">
        <span class="sfl">País · Ciudad</span>
        <span class="sfv">${proj.pais} · ${proj.ciudad}</span>
      </div>
      <div class="scf">
        <span class="sfl">Descripción</span>
        <span class="sfv desc">${desc||'<em style="color:var(--txt3)">Sin descripción</em>'}</span>
      </div>
    </div>`;

  setLink('lnk-'+panel+'-360', proj.l360, true);
  setLink('lnk-'+panel+'-info', proj.lp,  false);
}

/* ═══════════════════════════════
   MAPS
   ═══════════════════════════════ */
function mkIcon(si){
  return L.divIcon({className:'',html:`<div class="rm${si==='NO'?' no':''}"></div>`,iconSize:[11,11],iconAnchor:[5,5],popupAnchor:[0,-10]});
}
function ppHtml(p){
  const im=p.img&&p.img.startsWith('http')?`<img class="ppimg" src="${p.img}" loading="lazy" onerror="this.style.display='none'">`:'';
  return `${im}<strong>${p.name}</strong>${p.dest} · ${p.ap}${p.ar?'–'+p.ar:''} · ${p.ciudad}`;
}

function initMapWorld(){
  mapWInit=true;
  const map=L.map('map-world',{center:[-20,-40],zoom:3});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    attribution:'© OpenStreetMap © CARTO',subdomains:'abcd',maxZoom:19
  }).addTo(map);
  const cl=L.markerClusterGroup({maxClusterRadius:40,showCoverageOnHover:false});
  projects.forEach(p=>{
    if(!p.lat||!p.lng) return;
    const m=L.marker([p.lat,p.lng],{icon:mkIcon(p.si)});
    m.bindPopup(ppHtml(p),{maxWidth:220});
    m.on('click',()=>renderScheda('world',p));
    cl.addLayer(m);
  });
  map.addLayer(cl);
}

function initMapCba(){
  mapCInit=true;
  const cba=projects.filter(p=>p.ciudad==='Córdoba');
  const map=L.map('map-cba',{center:[-31.416,-64.185],zoom:13});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
    attribution:'Tiles © Esri',maxZoom:19
  }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',{
    attribution:'',subdomains:'abcd',maxZoom:19
  }).addTo(map);
  const cl=L.markerClusterGroup({maxClusterRadius:50,showCoverageOnHover:false});
  cba.forEach(p=>{
    if(!p.lat||!p.lng) return;
    const m=L.marker([p.lat,p.lng],{icon:mkIcon(p.si)});
    m.bindPopup(ppHtml(p),{maxWidth:220});
    m.on('click',()=>renderScheda('cba',p));
    cl.addLayer(m);
  });
  map.addLayer(cl);
}
