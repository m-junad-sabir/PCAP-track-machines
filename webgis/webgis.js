/* PCAP WebGIS demo: Leaflet + Chart.js on static JSON. */
const CONFIG={
  DATA_URL:"data/machines.json",
  // GeoJSON / GeoServer WFS (outputFormat=application/json) endpoints; leave "" to skip a layer.
  PROVINCE_URL:"https://www.arcgis.com/sharing/rest/content/items/1d46e9fd0f204a3e807b6fe590b8b9c3/data",
  DISTRICT_URL:"https://www.arcgis.com/sharing/rest/content/items/ad5ee4c2b3204f9782cb120a42189b5e/data",
  TEHSIL_URL:"https://www.arcgis.com/sharing/rest/content/items/1d7abd98714741ff9b996c7f79415da3/data",
  DISTRICT_NAME_FIELD:"District",
  TEHSIL_NAME_FIELD:"TEHSIL",
  TEHSIL_DISTRICT_FIELD:"DISTRICT",
  CENTER:[31.1,72.7],ZOOM:7
};
const STATUS={Approved:"#208644",Deferred:"#c0392b",Pending:"#e0a020"};
const $=s=>document.querySelector(s);
const h=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

let DATA,PTS=[],sel=null,pie,bar;
const B={province:null,district:null,tehsil:null};

const map=L.map("map",{zoomControl:true}).setView(CONFIG.CENTER,CONFIG.ZOOM);
const osm=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
const sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imagery &copy; Esri"});
L.control.scale({imperial:false}).addTo(map);
const gQ=L.layerGroup().addTo(map),gD=L.layerGroup().addTo(map);
const layers=L.control.layers({"OpenStreetMap":osm,"Satellite (Esri)":sat},{"QIC points (at firm)":gQ,"DIC points (at farmer)":gD},{collapsed:false,position:"topright"}).addTo(map);

const legend=L.control({position:"bottomright"});
legend.onAdd=()=>{const d=L.DomUtil.create("div","legend");d.innerHTML="<b>Machine status</b>"+Object.entries(STATUS).map(([k,c])=>`<div><i style="background:${c}"></i>${k}</div>`).join("")+
  "<b>Pin label</b><div>Q = QIC · D = DIC</div><b>Boundaries</b><div><span class=ln style=\"border-color:#e00\"></span>Province</div><div><span class=ln style=\"border-color:#000\"></span>District / Tehsil</div>";return d};
legend.addTo(map);

function icon(status,type,on){const c=STATUS[status]||"#888";
  return L.divIcon({className:"pin"+(on?" sel":""),iconSize:[28,38],iconAnchor:[14,37],popupAnchor:[0,-32],
    html:`<svg width="28" height="38" viewBox="0 0 28 38"><path d="M14 1C6.8 1 1 6.7 1 13.8 1 23.5 14 37 14 37s13-13.5 13-23.2C27 6.7 21.2 1 14 1z" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="8" fill="#fff"/><text x="14" y="18.5" text-anchor="middle" font-size="12" font-weight="700" font-family="sans-serif" fill="${c}">${type[0]}</text></svg>`})}

async function loadBoundary(key,url,style,label){
  if(!url){console.info(`[WebGIS] ${label} URL not set; layer skipped.`);return}
  try{const r=await fetch(url);if(!r.ok)throw Error(r.status);
    B[key]=L.geoJSON(await r.json(),{style:{...style,fill:false},interactive:false});
    if(key!="tehsil")B[key].addTo(map);
    layers.addOverlay(B[key],label);B[key].bringToBack?.()}
  catch(e){console.warn(`[WebGIS] ${label} failed to load:`,e)}}

function buildPoints(){PTS=[];DATA.machines.forEach(m=>{
  if(m.qicStatus)PTS.push({m,type:"QIC",status:m.qicStatus,date:m.qicDate,ll:[m.lat,m.lng]});
  if(m.dicStatus)PTS.push({m,type:"DIC",status:m.dicStatus,date:m.dicDate,ll:[m.dlat,m.dlng]})});
  PTS.forEach(p=>{p.mk=L.marker(p.ll,{icon:icon(p.status,p.type),title:p.m.id}).bindPopup(()=>`<b>${h(p.m.id)}</b><br>${h(p.m.farmer)} · ${h(p.m.dist)}<br>${p.type}: <span class="tag ${h(p.status)}">${h(p.status)}</span>`).on("click",()=>select(p))})}

const F=()=>({dist:$("#fDist").value,teh:$("#fTeh").value,st:$("#fStat").value,ty:$("#fType").value,from:$("#fFrom").value,to:$("#fTo").value});
function filtered(){const f=F();return PTS.filter(p=>(!f.dist||p.m.dist==f.dist)&&(!f.teh||p.m.tehsil==f.teh)&&(!f.st||p.status==f.st)&&(!f.ty||p.type==f.ty)&&(!f.from||p.date>=f.from)&&(!f.to||p.date<=f.to))}

function refresh(){const list=filtered();gQ.clearLayers();gD.clearLayers();list.forEach(p=>(p.type=="QIC"?gQ:gD).addLayer(p.mk));charts(list)}

function charts(list){const S=Object.keys(STATUS),cnt=S.map(s=>list.filter(p=>p.status==s).length);
  $("#cnt").textContent=`(${list.length} records)`;
  const ds=[...new Set(list.map(p=>p.m.dist))].sort();
  const sets=S.map(s=>({label:s,backgroundColor:STATUS[s],data:ds.map(d=>list.filter(p=>p.m.dist==d&&p.status==s).length)}));
  if(!pie){Chart.defaults.font.family='"Source Sans 3",system-ui,sans-serif';
    pie=new Chart($("#pie"),{type:"pie",data:{labels:S,datasets:[{data:cnt,backgroundColor:S.map(s=>STATUS[s]),borderColor:"#fff"}]},options:{maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}});
    bar=new Chart($("#bar"),{type:"bar",data:{labels:ds,datasets:sets},options:{maintainAspectRatio:false,scales:{x:{stacked:true},y:{stacked:true,beginAtZero:true,ticks:{precision:0}}},plugins:{legend:{position:"bottom"}}}});return}
  pie.data.datasets[0].data=cnt;pie.update();
  bar.data.labels=ds;sets.forEach((s,i)=>bar.data.datasets[i].data=s.data);bar.update()}

function zoomTo(){const f=F();let lyr=null;
  if(f.teh&&B.tehsil)lyr=B.tehsil.getLayers().filter(l=>l.feature.properties[CONFIG.TEHSIL_NAME_FIELD]==f.teh&&l.feature.properties[CONFIG.TEHSIL_DISTRICT_FIELD]==f.dist);
  else if(f.dist&&!f.teh&&B.district)lyr=B.district.getLayers().filter(l=>l.feature.properties[CONFIG.DISTRICT_NAME_FIELD]==f.dist);
  if(lyr&&lyr.length)return map.fitBounds(L.featureGroup(lyr).getBounds(),{padding:[20,20]});
  const pts=filtered().filter(p=>p.type=="DIC"||!f.dist).map(p=>p.ll);
  if(f.dist&&pts.length)map.fitBounds(pts,{padding:[40,40],maxZoom:11});else if(!f.dist)map.setView(CONFIG.CENTER,CONFIG.ZOOM)}

function fillTehsils(){const d=$("#fDist").value,t=$("#fTeh");
  t.innerHTML='<option value="">All tehsils</option>'+[...new Set(DATA.machines.filter(m=>m.dist==d).map(m=>m.tehsil))].sort().map(x=>`<option>${h(x)}</option>`).join("");
  t.disabled=!d;
  if(B.tehsil){if(d)map.addLayer(B.tehsil);B.tehsil.setStyle(l=>({opacity:!d||l.properties[CONFIG.TEHSIL_DISTRICT_FIELD]==d?1:0}))}}

function select(p){if(sel)sel.mk.setIcon(icon(sel.status,sel.type));sel=p;p.mk.setIcon(icon(p.status,p.type,1));
  const m=p.m,cap=DATA.photoCaptions;
  const sec=(t,no,st,dt,fe,ll,ph)=>`<h4>${t} ${st?`<span class="tag ${h(st)}">${h(st)}</span>`:""}</h4><table>${[["Certificate #",no||"—"],["Date",dt||"—"],["Field Engineer",fe||"—"],["GPS",ll[0]?ll.join(", "):"—"]].map(r=>`<tr><td>${r[0]}</td><td>${h(r[1])}</td></tr>`).join("")}</table>`+
    (ph.length?`<div class=photos style="margin-top:6px">${ph.map((u,i)=>`<button data-src="${h(u)}" data-cap="${h(`${t} photo ${i+1}: ${cap[t][i]}`)}" title="${h(cap[t][i])}"><img src="${h(u)}" alt="${h(cap[t][i])}" loading="lazy"></button>`).join("")}</div>`:`<p class=note>No ${t} photos yet.</p>`);
  $("#det").innerHTML=`<h4 style="margin-top:0">${h(m.id)}</h4>${m.open?`<div class=flag>Open discrepancy: ${h(m.log.at(-1).m)}</div>`:""}
<table>${[["Farmer",m.farmer],["Father name",m.father],["CNIC",m.cnic],["Contact",m.contact],["Address",m.addr],["Tehsil",m.tehsil],["District",m.dist],["Division",m.div],["Manufacturer",m.firm],["Punched code",m.code],["Tracker IMEI",m.imei],["Reason (if deferred)",m.reason||"—"]].map(r=>`<tr><td>${r[0]}</td><td>${h(r[1])}</td></tr>`).join("")}</table>`+
    sec("QIC",m.qicNo,m.qicStatus,m.qicDate,m.qicFE,[m.lat,m.lng],m.qicPhotos)+sec("DIC",m.dicNo,m.dicStatus,m.dicDate,m.dicFE,[m.dlat,m.dlng],m.dicPhotos)+
    `<h4>Discrepancy / correction log</h4>${m.log.length?m.log.map(l=>`<div class=note>${h(l.t)} · ${h(l.who)}: ${h(l.m)}</div>`).join(""):"<span class=note>No entries</span>"}`;
  panel(true)}

function panel(open){$("#panel").classList.toggle("closed",!open);setTimeout(()=>map.invalidateSize(),220)}

function search(){const q=$("#q").value.trim().toLowerCase(),u=$("#sug");
  if(q.length<2){u.hidden=true;return}
  const hits=DATA.machines.filter(m=>[m.id,m.code,m.farmer,m.cnic,m.imei].some(v=>String(v).toLowerCase().includes(q))).slice(0,12);
  u.innerHTML=hits.map(m=>`<li data-id="${h(m.id)}"><b>${h(m.id)}</b> · ${h(m.farmer)}<br><small>${h(m.dist)} · CNIC ${h(m.cnic)}</small></li>`).join("")||"<li><small>No match</small></li>";u.hidden=false}

function go(id){const ps=PTS.filter(p=>p.m.id==id);if(!ps.length)return;const p=ps.find(x=>x.type=="DIC")||ps[0];
  $("#sug").hidden=true;$("#q").value=id;
  if(!filtered().includes(p)){resetFilters(false)}
  map.flyTo(p.ll,13);map.once("moveend",()=>p.mk.openPopup());select(p)}

function resetFilters(view=true){["#fDist","#fStat","#fType","#fFrom","#fTo"].forEach(s=>$(s).value="");fillTehsils();refresh();if(view)map.setView(CONFIG.CENTER,CONFIG.ZOOM)}

$("#fDist").onchange=()=>{fillTehsils();refresh();zoomTo()};
$("#fTeh").onchange=()=>{refresh();zoomTo()};
["#fStat","#fType","#fFrom","#fTo"].forEach(s=>$(s).onchange=refresh);
$("#reset").onclick=()=>{$("#q").value="";resetFilters()};
$("#q").oninput=search;
$("#q").onkeydown=e=>{if(e.key=="Enter"){const li=$("#sug li[data-id]");if(li)go(li.dataset.id)}if(e.key=="Escape")$("#sug").hidden=true};
$("#sug").onclick=e=>{const li=e.target.closest("li[data-id]");if(li)go(li.dataset.id)};
document.addEventListener("click",e=>{if(!e.target.closest(".search"))$("#sug").hidden=true});
$("#tgl").onclick=()=>panel($("#panel").classList.contains("closed"));
$("#close").onclick=()=>panel(false);
$("#det").onclick=e=>{const b=e.target.closest("button[data-src]");if(!b)return;const lb=$("#lb");lb.querySelector("img").src=b.dataset.src;lb.querySelector("p").textContent=b.dataset.cap;lb.hidden=false};
$("#lb").onclick=e=>{if(e.target.tagName!="IMG")$("#lb").hidden=true};

(async()=>{
  try{const r=await fetch(CONFIG.DATA_URL);if(!r.ok)throw Error(r.status);DATA=await r.json()}
  catch(e){$("#map").innerHTML="<p style='padding:20px'>Demo data could not be loaded. Serve this folder over HTTP.</p>";return console.error(e)}
  $("#fDist").innerHTML+=[...new Set(DATA.machines.map(m=>m.dist))].sort().map(d=>`<option>${h(d)}</option>`).join("");
  buildPoints();refresh();
  await Promise.all([
    loadBoundary("province",CONFIG.PROVINCE_URL,{color:"#e00000",weight:2.5},"Province boundary"),
    loadBoundary("district",CONFIG.DISTRICT_URL,{color:"#000",weight:1.2},"District boundaries"),
    loadBoundary("tehsil",CONFIG.TEHSIL_URL,{color:"#000",weight:.8},"Tehsil boundaries")]);
})();
