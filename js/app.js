/* app.js — M.A.R. Archivo Digital | v7
   Gráficos: Dest · Pais · Tang · Tipo · Ciudad · Dec · Heatmap · EU · Sankey
   Filtros:  dest · pais · si · dec · eu · tipo (multi-dimensional)
   Mapas:    4 capas · naranja/azul · icono seleccionado animado · 5 links
*/

/* ═══════════════════════════════════════════════════════
   CROSS-FILTER STATE — multidimensional
   activeFilters: Map de field → value
   Ej: { dest:'UNC', pais:'Argentina' }
   ═══════════════════════════════════════════════════════ */
const activeFilters = new Map();

const FIELD_LABELS = {
  dest: 'Tipología',
  pais: 'País',
  si:   'Estado',
  dec:  'Década',
  eu:   'Estrategia Urbana',
  tipo: 'Tipo General',
};

function getFiltered(){
  if(activeFilters.size === 0) return projects;
  return projects.filter(p =>
    [...activeFilters.entries()].every(([field, value]) => {
      if(field === 'dec') return decOf(p.ap) === Number(value);
      return String(p[field]) === String(value);
    })
  );
}

function applyFilter(field, value){
  // Toggle: mismo campo+valor → quitar ese filtro
  if(activeFilters.has(field) && String(activeFilters.get(field)) === String(value)){
    activeFilters.delete(field);
  } else {
    activeFilters.set(field, value);
  }
  updateFilterBar();
  rebuildAllCharts();
}

function removeFilter(field){
  activeFilters.delete(field);
  updateFilterBar();
  rebuildAllCharts();
}

function clearAllFilters(){
  activeFilters.clear();
  updateFilterBar();
  rebuildAllCharts();
}

// alias para compatibilidad
function clearFilter(){ clearAllFilters(); }

function updateFilterBar(){
  const bar   = document.getElementById('filter-bar');
  const chips = document.getElementById('filter-chips');
  const fcnt  = document.getElementById('filter-count');

  if(activeFilters.size === 0){
    bar.classList.remove('visible');
    chips.innerHTML = '';
    return;
  }

  bar.classList.add('visible');

  // Renderizar chips
  chips.innerHTML = [...activeFilters.entries()].map(([field, value]) => {
    const label = FIELD_LABELS[field] || field;
    const display = field==='dec' ? value+'s' : value;
    const siDisplay = field==='si' ? (value==='SI'?'Realizados':'No ejecutados') : display;
    return `<span class="fchip">
      <span style="color:#F4C820;font-size:6.5px;letter-spacing:.1em">${label}</span>
      <span>${siDisplay}</span>
      <span class="fchip-x" onclick="removeFilter('${field}')">✕</span>
    </span>`;
  }).join('');

  const filtered = getFiltered();
  fcnt.textContent = `· ${filtered.length} de 120 proyectos`;
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
const ALL_DESTS  = [...new Set(projects.map(p=>p.dest))].sort((a,b)=>projects.filter(r=>r.dest===b).length-projects.filter(r=>r.dest===a).length).slice(0,10);
const ALL_PAISES = [...new Set(projects.map(p=>p.pais))].sort((a,b)=>projects.filter(r=>r.pais===b).length-projects.filter(r=>r.pais===a).length);
const DECS       = [1960,1970,1980,1990,2000,2010,2020];

// Chart instances
let chDest, chPais, chTang, chDec, chSankey, chEu, chTipo, chCiudad;

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
  dashInit=true;
  buildDestChart();
  buildPaisChart();
  buildTangChart();
  buildTipoChart();
  buildCiudadChart();
  buildDecChart();
  buildHeatmap(projects);
  buildEuChart();
  buildSankeyChart();
}

/* ── Tipología ── */
function buildDestChart(){
  const filtered = getFiltered();
  const data     = ALL_DESTS.map(d=>cnt(filtered,'dest',d));
  const bgBase   = ALL_DESTS.map((_,i)=>PAL[i%PAL.length]);
  const bg       = ALL_DESTS.map((d,i)=>{
    if(!activeFilters.has('dest')) return bgBase[i];
    return String(activeFilters.get('dest'))===d ? bgBase[i] : 'rgba(255,255,255,.07)';
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
    if(!activeFilters.has('pais')) return bgBase[i];
    return String(activeFilters.get('pais'))===p ? bgBase[i] : 'rgba(255,255,255,.07)';
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
    if(!activeFilters.has('si')) return bgBase[i];
    return String(activeFilters.get('si'))===v ? bgBase[i] : 'rgba(255,255,255,.07)';
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
      if(!activeFilters.has('dec')) return A2;
      return String(activeFilters.get('dec'))===String(d) ? '#fff' : 'rgba(232,169,107,.25)';
    });
    const ptBg1 = DECS.map(d=>{
      if(!activeFilters.has('dec')) return GN;
      return String(activeFilters.get('dec'))===String(d) ? '#fff' : 'rgba(122,170,110,.25)';
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
  const dests=[...new Set(projects.map(p=>p.dest))].sort((a,b)=>projects.filter(r=>r.dest===b).length-projects.filter(r=>r.dest===a).length).slice(0,10);
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
    // degradado: amarillo dorado → naranja terracota vivo
    const r=Math.round(244-40*t), g=Math.round(200-120*t), b=Math.round(32-22*t);
    return `rgba(${r},${g},${b},${.22+t*.78})`;
  }
  function cellTxt(v){ return v>=5?'#111009':v>=2?'#1a0a00':v>=1?'#c8a030':'transparent'; }

  let h='<thead><tr><th>Década</th>'+dests.map(d=>`<th title="${d}">${d.length>12?d.slice(0,11)+'…':d}</th>`).join('')+'</tr></thead><tbody>';
  DECS.forEach(d=>{
    // highlight row if filtering by decade
    const rowStyle = (activeFilters.has('dec') && String(activeFilters.get('dec'))===String(d))
      ? ' style="outline:1px solid rgba(244,200,32,.5)"' : '';
    h+=`<tr${rowStyle}><td>${d}s</td>`+dests.map(ds=>{
      const v=hm[d][ds];
      // dim cell if its dest or pais is filtered out and doesn't match
      let extra='';
      if(activeFilters.has('dest') && String(activeFilters.get('dest'))!==ds && v>0) extra='opacity:.25;';
      return `<td style="background:${cellBg(v)};color:${cellTxt(v)};${extra}">${v||''}</td>`;
    }).join('')+'</tr>';
  });
  document.getElementById('hm').innerHTML=h+'</tbody>';
}


/* ── Sankey: País × Tipología ── */
function buildSankeyChart(){
  const filtered = getFiltered();

  // Calcular flows — ignorar países con un solo proyecto en el filtro actual
  const flows = [];
  const pairs = {};
  const paisTotal = {};
  filtered.forEach(p=>{
    paisTotal[p.pais] = (paisTotal[p.pais]||0)+1;
  });
  filtered.forEach(p=>{
    if(!ALL_DESTS.includes(p.dest)) return; // solo top 10 tipologías
    if(paisTotal[p.pais] <= 1) return;       // ignorar países con ≤1 proyecto
    const key = p.pais+'|'+p.dest;
    pairs[key] = (pairs[key]||0)+1;
  });
  Object.entries(pairs).forEach(([key,flow])=>{
    const [from,to] = key.split('|');
    if(flow>0) flows.push({from, to, flow});
  });

  // Paleta: países a la izquierda con colores del PAL
  const allPaises = [...new Set(filtered.map(p=>p.pais))].filter(p=>paisTotal[p]>1).sort((a,b)=>
    filtered.filter(r=>r.pais===b).length - filtered.filter(r=>r.pais===a).length
  );
  const paisColors = {};
  allPaises.forEach((p,i)=>{ paisColors[p]=PAL[i%PAL.length]; });

  // Color por nodo origen (país)
  const colorFn = (node)=>{
    if(paisColors[node.key]) return paisColors[node.key]+'cc';
    return 'rgba(200,180,150,.5)';
  };

  // Sankey necesita destroy+recreate para actualizar correctamente
  if(chSankey){ chSankey.destroy(); chSankey=null; }

  if(flows.length === 0){
    const ctx = document.getElementById('ch-sankey').getContext('2d');
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle='#a89070';
    ctx.font="11px 'DM Mono', monospace";
    ctx.textAlign='center';
    ctx.fillText('Sin datos para el filtro actual', ctx.canvas.width/2, ctx.canvas.height/2);
    return;
  }

  chSankey = new Chart('ch-sankey',{
    type: 'sankey',
    data:{
      datasets:[{
        data: flows,
        colorFrom: (c)=>{
          const d = c.dataset.data[c.dataIndex];
          return d ? (paisColors[d.from]||'#888')+'bb' : '#888bb';
        },
        colorTo: (c)=>{
          const d = c.dataset.data[c.dataIndex];
          // Destino: color más suave basado en el índice de ALL_DESTS
          const i = ALL_DESTS.indexOf(d?.to||'');
          return i>=0 ? PAL[i%PAL.length]+'55' : 'rgba(200,180,150,.2)';
        },
        colorMode: 'gradient',
        borderWidth: 0,
        nodeWidth: 14,
        nodePadding: 12,
        color: '#e0d4c0',           // color de labels de nodos
        size: 'max',
      }]
    },
    options:{
      responsive: true,
      maintainAspectRatio: false,
      plugins:{
        legend:{ display:false },
        tooltip:{
          backgroundColor:'rgba(26,25,15,.92)',
          borderColor:'rgba(244,200,32,.3)',
          borderWidth:1,
          titleColor:'#F4C820',
          bodyColor:'#e0d4c0',
          callbacks:{
            title(){ return ''; },
            label(c){
              const d = c.dataset.data[c.dataIndex];
              if(!d) return '';
              return `  ${d.from}  →  ${d.to}:  ${d.flow} proyecto${d.flow>1?'s':''}`;
            }
          }
        }
      }
    }
  });
}


/* ── Estrategias Urbanas ── */
function buildEuChart(){
  const filtered = getFiltered();
  const euProjects = filtered.filter(p=>p.eu && p.eu.trim()!=='');

  // Agrupar por estrategia
  const euMap = {};
  euProjects.forEach(p=>{
    const si = p.si==='SI' ? 'real' : 'proy';
    if(!euMap[p.eu]) euMap[p.eu]={real:0,proy:0};
    euMap[p.eu][si]++;
  });

  const labels = Object.keys(euMap).sort((a,b)=>
    (euMap[b].real+euMap[b].proy)-(euMap[a].real+euMap[a].proy)
  );
  const dataReal = labels.map(l=>euMap[l].real);
  const dataProy = labels.map(l=>euMap[l].proy);

  if(chEu){
    chEu.data.labels=labels;
    chEu.data.datasets[0].data=dataReal;
    chEu.data.datasets[1].data=dataProy;
    chEu.update('none');
    return;
  }

  chEu = new Chart('ch-eu',{
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:'Realizados', data:dataReal, backgroundColor:'#F4821A', borderWidth:0, borderRadius:3},
        {label:'Proyectados',data:dataProy, backgroundColor:'#2060c8', borderWidth:0, borderRadius:3}
      ]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:'top',labels:{color:T2,boxWidth:8,padding:10}},
        tooltip:{callbacks:{label:c=>`  ${c.dataset.label}: ${c.parsed.x} proyectos`}}
      },
      scales:{
        x:{grid:{color:BRD},ticks:{color:T2},stacked:true},
        y:{grid:{display:false},ticks:{color:T2,font:{size:9}},stacked:true}
      },
      onClick(evt,els){
        if(!els.length) return;
        applyFilter('eu', labels[els[0].index]);
      }
    }
  });
}


/* ── Tipo General ── */
function buildTipoChart(){
  const filtered = getFiltered();
  const tipos = [...new Set(projects.map(p=>p.tipo).filter(Boolean))];
  const data  = tipos.map(t=>cnt(filtered,'tipo',t));
  const bg    = tipos.map((t,i)=>
    activeFilters.has('tipo')
      ? (String(activeFilters.get('tipo'))===t ? PAL[i%PAL.length] : 'rgba(255,255,255,.07)')
      : PAL[i%PAL.length]
  );

  if(chTipo){
    chTipo.data.datasets[0].data=data;
    chTipo.data.datasets[0].backgroundColor=bg;
    chTipo.update('none'); return;
  }

  chTipo = new Chart('ch-tipo',{
    type:'doughnut',
    data:{
      labels: tipos,
      datasets:[{
        data,
        backgroundColor: tipos.map((_,i)=>PAL[i%PAL.length]),
        borderColor: BG2, borderWidth:2,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'52%',
      plugins:{
        legend:{position:'right', labels:{color:T2, boxWidth:8, font:{size:8}, padding:6}},
        tooltip:{callbacks:{label:c=>`${c.label}: ${c.parsed} (${Math.round(c.parsed/filtered.length*100)}%)`}}
      },
      onClick(evt,els){
        if(!els.length) return;
        applyFilter('tipo', tipos[els[0].index]);
      }
    }
  });
}

/* ── Concentración por Ciudad ── */
function buildCiudadChart(){
  const filtered = getFiltered();

  // Contar por ciudad, ordenar desc, tomar top 12
  const cityMap = {};
  filtered.forEach(p=>{
    if(p.ciudad) cityMap[p.ciudad] = (cityMap[p.ciudad]||0)+1;
  });
  const sorted = Object.entries(cityMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,12);
  const labels = sorted.map(([c])=>c);
  const data   = sorted.map(([,n])=>n);

  // Colores: ciudad con más proyectos en acc, resto degradado
  const max = data[0]||1;
  const bgColors = data.map((v,i)=>{
    const t = v/max;
    return `rgba(${Math.round(244-60*t)},${Math.round(130+50*t)},${Math.round(26+30*(1-t))},${0.35+t*0.65})`;
  });

  if(chCiudad){
    chCiudad.data.labels=labels;
    chCiudad.data.datasets[0].data=data;
    chCiudad.data.datasets[0].backgroundColor=bgColors;
    chCiudad.update('none'); return;
  }

  chCiudad = new Chart('ch-ciudad',{
    type:'bar',
    data:{
      labels,
      datasets:[{
        data, backgroundColor:bgColors,
        borderWidth:0, borderRadius:3,
      }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{callbacks:{label:c=>`  ${c.parsed.x} proyectos`}}
      },
      scales:{
        x:{grid:{color:BRD}, ticks:{color:T2}},
        y:{grid:{display:false}, ticks:{color:T2, font:{size:8}}}
      }
    }
  });
}

/* Rebuild everything from current filter */
function rebuildAllCharts(){
  buildDestChart();
  buildPaisChart();
  buildTangChart();
  buildDecChart();
  buildHeatmap(getFiltered());
  buildTipoChart();
  buildCiudadChart();
  buildEuChart();
  buildSankeyChart();
  // Highlight source cards (puede haber varios activos)
  ['dest','pais','tang','dec','eu','tipo'].forEach(id=>{
    const fieldMap={dest:'dest',pais:'pais',tang:'si',dec:'dec',eu:'eu',tipo:'tipo'};
    const card=document.getElementById('card-'+id);
    if(!card) return;
    card.classList.toggle('has-filter', activeFilters.has(fieldMap[id]));
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
    setLink('lnk-'+panel+'-info','',false);
    setLink('lnk-'+panel+'-360','',true);
    setLink('lnk-'+panel+'-entrev','',false);
    setLink('lnk-'+panel+'-3d','',false);
    setLink('lnk-'+panel+'-legajo','',false);
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

  setLink('lnk-'+panel+'-info',   proj.lp,        false);
  setLink('lnk-'+panel+'-360',   proj.l360,      true);
  setLink('lnk-'+panel+'-entrev',proj.entrevista, false);
  setLink('lnk-'+panel+'-3d',    proj.modelo3d,  false);
  setLink('lnk-'+panel+'-legajo',proj.legajo,    false);
}

/* ═══════════════════════════════
   MAPS
   ═══════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   TILE LAYERS DISPONIBLES
   ═══════════════════════════════════════════════════════════ */
const TILE_DEFS = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    opts: {attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19},
    labels: null
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    opts: {attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19},
    labels: null
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    opts: {attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19},
    labels: null
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    opts: {attribution:'Tiles © Esri', maxZoom:19},
    labels: {
      url:'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
      opts:{attribution:'', subdomains:'abcd', maxZoom:19}
    }
  }
};

/* Estado de capas activas por mapa */
const mapState = {
  world: { map: null, baseTile: null, labelTile: null, cluster: null, activeLayer: 'voyager', selectedMarker: null },
  cba:   { map: null, baseTile: null, labelTile: null, cluster: null, activeLayer: 'satellite', selectedMarker: null }
};

/* ── setLayer: cambia la capa base del mapa ── */
function setLayer(which, layerKey){
  const st = mapState[which];
  if(!st.map) return;
  const def = TILE_DEFS[layerKey];

  // Quitar capas actuales
  if(st.baseTile)  st.map.removeLayer(st.baseTile);
  if(st.labelTile) st.map.removeLayer(st.labelTile);

  // Agregar nueva base
  st.baseTile = L.tileLayer(def.url, def.opts).addTo(st.map);

  // Agregar labels si tiene (satélite)
  if(def.labels){
    st.labelTile = L.tileLayer(def.labels.url, def.labels.opts).addTo(st.map);
  } else {
    st.labelTile = null;
  }

  st.activeLayer = layerKey;

  // Actualizar botones UI
  document.querySelectorAll(`#ls-${which} .ls-btn`).forEach(b=>{
    b.classList.toggle('active', b.id === `ls-${which}-${layerKey}`);
  });
}

/* ── Iconos de marcador ── */
function mkIcon(si){
  const cls = si==='NO' ? 'rm no' : 'rm';
  return L.divIcon({
    className:'',
    html:`<div class="${cls}"></div>`,
    iconSize:[11,11], iconAnchor:[5,5], popupAnchor:[0,-14]
  });
}

function mkIconSelected(){
  return L.divIcon({
    className:'',
    html:'<div class="rm-selected"></div>',
    iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-18]
  });
}

function selectMarker(which, marker, proj){
  const st = mapState[which];
  // Restaurar marcador anterior
  if(st.selectedMarker && st.selectedMarker !== marker){
    st.selectedMarker.setIcon(mkIcon(st.selectedMarker._projData.si));
  }
  // Aplicar icono seleccionado
  marker.setIcon(mkIconSelected());
  st.selectedMarker = marker;
  st.selectedMarker._projData = proj;
  renderScheda(which, proj);
}

function ppHtml(p){
  const im=p.img&&p.img.startsWith('http')?`<img class="ppimg" src="${p.img}" loading="lazy" onerror="this.style.display='none'">`:'';
  return `${im}<strong>${p.name}</strong>${p.dest} · ${p.ap}${p.ar?'–'+p.ar:''} · ${p.ciudad}`;
}


function initMapWorld(){
  mapWInit=true;
  const st = mapState['world'];
  st.map = L.map('map-world',{center:[-20,-40],zoom:3,zoomControl:true});

  // Capa inicial
  const def = TILE_DEFS[st.activeLayer];
  st.baseTile = L.tileLayer(def.url, def.opts).addTo(st.map);

  // Cluster
  st.cluster = L.markerClusterGroup({maxClusterRadius:40,showCoverageOnHover:false});

  projects.forEach(p=>{
    if(!p.lat||!p.lng) return;
    const m = L.marker([p.lat,p.lng],{icon:mkIcon(p.si)});
    m._projData = p;
    m.bindPopup(ppHtml(p),{maxWidth:220});
    m.on('click',()=>{ selectMarker('world',m,p); });
    st.cluster.addLayer(m);
  });
  st.map.addLayer(st.cluster);
}



function initMapCba(){
  mapCInit=true;
  const st = mapState['cba'];
  const cba = projects.filter(p=>p.ciudad==='Córdoba');
  st.map = L.map('map-cba',{center:[-31.416,-64.185],zoom:13,zoomControl:true});

  // Capa inicial: satélite + labels
  const def = TILE_DEFS[st.activeLayer];
  st.baseTile = L.tileLayer(def.url, def.opts).addTo(st.map);
  if(def.labels){
    st.labelTile = L.tileLayer(def.labels.url, def.labels.opts).addTo(st.map);
  }

  // Cluster
  st.cluster = L.markerClusterGroup({maxClusterRadius:50,showCoverageOnHover:false});

  cba.forEach(p=>{
    if(!p.lat||!p.lng) return;
    const m = L.marker([p.lat,p.lng],{icon:mkIcon(p.si)});
    m._projData = p;
    m.bindPopup(ppHtml(p),{maxWidth:220});
    m.on('click',()=>{ selectMarker('cba',m,p); });
    st.cluster.addLayer(m);
  });
  st.map.addLayer(st.cluster);
}
