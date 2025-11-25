const $=s=>document.querySelector(s)
const $$=s=>document.querySelectorAll(s)
const guard=()=>{try{const a=JSON.parse(localStorage.getItem('adminAuth')||'null');if(!a||Date.now()>a.expires){location.href='login.html?redirect=admin.html'}}catch{location.href='login.html?redirect=admin.html'}}
guard()
const bootstrapConn=()=>{const api=localStorage.getItem('API_BASE');if(!api||api.trim()===''){const host=location.hostname;const isLocal=/localhost|127\.0\.0\.1/.test(host);localStorage.setItem('API_BASE',isLocal?'http://127.0.0.1:4000':'https://backend-sitepadrekelmon.vercel.app')}}
bootstrapConn()
const fileToDataURL=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})
const defaultSettings={palette:{navy:'#0B1B3F',gold:'#C9A227',white:'#ffffff',red:'#B22234'},heroPhoto:'',gallery:[],chat:{enabled:true}}
const load=()=>{try{return {...defaultSettings,...JSON.parse(localStorage.getItem('siteSettings')||'{}')}}catch{return defaultSettings}}
const save=s=>localStorage.setItem('siteSettings',JSON.stringify(s))
const S=load()
$('#color-navy').value=S.palette.navy
$('#color-gold').value=S.palette.gold
$('#color-white').value=S.palette.white
$('#color-red').value=S.palette.red
$('#chat-enabled').checked=!!(S.chat&&S.chat.enabled)
const status=$('#admin-status')
const API_BASE=(()=>{const ls=localStorage.getItem('API_BASE');if(ls)return ls;const host=location.hostname;const isLocal=/localhost|127\.0\.0\.1/.test(host);return isLocal?'http://127.0.0.1:4000':''})()
const ADMIN_TOKEN=localStorage.getItem('ADMIN_TOKEN')||''
const apiGetSettings=async()=>{try{const r=await fetch(`${API_BASE}/api/settings`);return r.ok?await r.json():[]}catch{return []}}
$('#save-settings').addEventListener('click',async()=>{
  const palette={navy:$('#color-navy').value,gold:$('#color-gold').value,white:$('#color-white').value,red:$('#color-red').value}
  const heroInput=$('#hero-photo')
  const galleryInput=$('#gallery-photos')
  let heroPhoto=S.heroPhoto
  let gallery=S.gallery
  if(heroInput.files&&heroInput.files[0]){heroPhoto=await fileToDataURL(heroInput.files[0])}
  if(galleryInput.files&&galleryInput.files.length){gallery=[];for(const f of galleryInput.files){const d=await fileToDataURL(f);gallery.push(d)}}
  const chat={enabled:$('#chat-enabled').checked}
  const newSettings={palette,heroPhoto,gallery,chat}
  save(newSettings)
  status.textContent='Configurações salvas localmente. Enviando ao servidor...'
  try{
    const h={'Content-Type':'application/json','Authorization':`Bearer ${ADMIN_TOKEN}`}
    await fetch(`${API_BASE}/api/admin/settings`,{method:'PUT',headers:h,body:JSON.stringify({key:'theme_palette',value:palette})})
    await fetch(`${API_BASE}/api/admin/settings`,{method:'PUT',headers:h,body:JSON.stringify({key:'chat_enabled',value:{enabled:chat.enabled}})})
    if(heroPhoto){const r=await fetch(`${API_BASE}/api/admin/media`,{method:'POST',headers:h,body:JSON.stringify({type:'image',title:'hero',alt_text:'Foto do herói',url:heroPhoto,category:'oficiais'})});if(r.ok){await fetch(`${API_BASE}/api/admin/settings`,{method:'PUT',headers:h,body:JSON.stringify({key:'hero_photo_url',value:await r.json()})})}}
    if(gallery.length){for(let i=0;i<gallery.length;i++){const g=gallery[i];const rm=await fetch(`${API_BASE}/api/admin/media`,{method:'POST',headers:h,body:JSON.stringify({type:'image',title:`galeria_${i}`,alt_text:`galeria_${i}`,url:g,category:'oficiais'})});if(rm.ok){const m=await rm.json();await fetch(`${API_BASE}/api/admin/gallery-items`,{method:'POST',headers:h,body:JSON.stringify({media_id:m.id,category:'oficiais',position:i,published:true})})}}}
    status.textContent='Configurações enviadas ao servidor.'
  }catch(e){status.textContent='Falha ao enviar ao servidor. Verifique API e token.'}
})
$('#clear-settings').addEventListener('click',()=>{localStorage.removeItem('siteSettings');status.textContent='Configurações removidas. O site voltará ao padrão.'})
const logoutBtn=document.createElement('button')
logoutBtn.className='btn btn-outline'
logoutBtn.textContent='Sair'
document.querySelector('.nav').appendChild(logoutBtn)
logoutBtn.addEventListener('click',()=>{localStorage.removeItem('adminAuth');location.href='login.html'})
const sections=$$('.admin-content section')
const setActive=hash=>{sections.forEach(s=>{if(`#${s.id}`===hash){s.classList.add('active')}else{s.classList.remove('active')}});$$('.admin-link').forEach(a=>{if(a.getAttribute('href')===hash){a.classList.add('active')}else{a.classList.remove('active')}})}
const initial=location.hash||'#sec-theme'
setActive(initial)
$$('.admin-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const h=a.getAttribute('href');history.replaceState(null,'',h);setActive(h)}))
const toHex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')
const sha256=async s=>{const enc=new TextEncoder().encode(s);const buf=await crypto.subtle.digest('SHA-256',enc);return toHex(buf)}
const getCreds=()=>{try{return JSON.parse(localStorage.getItem('adminCredentials')||'null')}catch{return null}}
const setCreds=c=>localStorage.setItem('adminCredentials',JSON.stringify(c))
const secSave=$('#sec-save')
const secStatus=$('#sec-status')
if(secSave){secSave.addEventListener('click',async()=>{const cur=$('#sec-current').value;const nxt=$('#sec-new').value;const conf=$('#sec-confirm').value;const c=getCreds();if(!cur||!nxt||!conf){secStatus.textContent='Preencha todos os campos.';return}const curHash=await sha256(cur);if(!c||curHash!==c.passHash){secStatus.textContent='Senha atual incorreta.';return}if(nxt.length<8){secStatus.textContent='Nova senha deve ter ao menos 8 caracteres.';return}if(nxt!==conf){secStatus.textContent='Confirmação diferente.';return}const nxtHash=await sha256(nxt);setCreds({user:c.user,passHash:nxtHash});secStatus.textContent='Senha atualizada com sucesso.'})}
const connSave=$('#conn-save')
const connStatus=$('#conn-status')
if(connSave){connSave.addEventListener('click',()=>{const api=$('#api-base').value.trim();const tok=$('#admin-token').value.trim();if(!api||!tok){connStatus.textContent='Informe API e token.';return}localStorage.setItem('API_BASE',api);localStorage.setItem('ADMIN_TOKEN',tok);connStatus.textContent='Conexão salva.'})}
if(!localStorage.getItem('ADMIN_TOKEN')){}
const h=()=>({'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('ADMIN_TOKEN')||ADMIN_TOKEN}`})
const slugify=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
const postMsg=$('#post-status-msg')
const postCreate=$('#post-create')
const postsList=$('#posts-list')
const loadPosts=async()=>{try{const api=localStorage.getItem('API_BASE')||API_BASE;const rp=await fetch(`${api}/api/posts?status=published`);const rd=await fetch(`${api}/api/posts?status=draft`);const pub=rp.ok?await rp.json():[];const dra=rd.ok?await rd.json():[];const all=[...dra,...pub];postsList.innerHTML=all.map(p=>`<div class=\"news-item\"><div class=\"form-group\"><label>Título</label><input type=\"text\" value=\"${p.title||''}\" data-p-title=\"${p.id}\"></div><div class=\"form-group\"><label>Resumo</label><input type=\"text\" value=\"${p.excerpt||''}\" data-p-excerpt=\"${p.id}\"></div><div class=\"form-group\"><label>Conteúdo</label><textarea rows=\"4\" data-p-content=\"${p.id}\">${p.content||''}</textarea></div><div class=\"form-group\"><label>Status</label><select data-p-status=\"${p.id}\"><option ${p.status==='draft'?'selected':''} value=\"draft\">Rascunho</option><option ${p.status==='published'?'selected':''} value=\"published\">Publicado</option></select></div><div class=\"filters\"><button class=\"btn btn-outline\" data-p-save=\"${p.id}\">Salvar</button><button class=\"btn btn-outline\" data-act=\"publish\" data-id=\"${p.id}\">Publicar</button><button class=\"btn btn-outline\" data-act=\"draft\" data-id=\"${p.id}\">Rascunho</button><button class=\"btn btn-outline\" data-act=\"delete\" data-id=\"${p.id}\">Excluir</button></div></div>`).join('');postsList.querySelectorAll('[data-p-save]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-p-save');const api=localStorage.getItem('API_BASE')||API_BASE;const body={title:postsList.querySelector(`[data-p-title=\"${id}\"]`).value,excerpt:postsList.querySelector(`[data-p-excerpt=\"${id}\"]`).value,content:postsList.querySelector(`[data-p-content=\"${id}\"]`).value,status:postsList.querySelector(`[data-p-status=\"${id}\"]`).value};const r=await fetch(`${api}/api/admin/posts/${id}`,{method:'PATCH',headers:h(),body:JSON.stringify(body)});if(r.ok)loadPosts()}));postsList.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-id');const act=b.getAttribute('data-act');const api=localStorage.getItem('API_BASE')||API_BASE;if(act==='delete'){const r=await fetch(`${api}/api/admin/posts/${id}`,{method:'DELETE',headers:h()});if(r.ok)loadPosts()}else{const payload=act==='publish'?{status:'published',published_at:new Date().toISOString()}:{status:'draft'};const r=await fetch(`${api}/api/admin/posts/${id}`,{method:'PATCH',headers:h(),body:JSON.stringify(payload)});if(r.ok)loadPosts()}}))}catch{postsList.innerHTML=''} }
postCreate&&postCreate.addEventListener('click',async()=>{const title=$('#post-title').value.trim();const slugInput=$('#post-slug').value.trim();const slug=slugInput||slugify(title);const excerpt=$('#post-excerpt').value.trim();const content=$('#post-content').value.trim();const statusSel=$('#post-status').value;if(!title||!content){postMsg.textContent='Preencha título e conteúdo.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;const body={slug,title,excerpt,content,status:statusSel,published_at:statusSel==='published'?new Date().toISOString():null};const r=await fetch(`${api}/api/admin/posts`,{method:'POST',headers:h(),body:JSON.stringify(body)});if(!r.ok)throw new Error();postMsg.textContent='Post criado.';loadPosts()}catch{postMsg.textContent='Falha ao criar post.'}})
const evMsg=$('#ev-status-msg')
const evCreate=$('#ev-create')
const eventsList=$('#events-list')
const loadEvents=async()=>{try{const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/events`,{headers:h()});const list=r.ok?await r.json():[];eventsList.innerHTML=list.map(e=>{const valDate=(()=>{try{const d=new Date(e.date);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}catch{return ''}})();return `<div class=\"agenda-item\"><div class=\"form-group\"><label>Título</label><input type=\"text\" value=\"${e.title||''}\" data-e-title=\"${e.id}\"></div><div class=\"form-group\"><label>Data</label><input type=\"datetime-local\" value=\"${valDate}\" data-e-date=\"${e.id}\"></div><div class=\"form-group\"><label>Local</label><input type=\"text\" value=\"${e.place||''}\" data-e-place=\"${e.id}\"></div><div class=\"form-group\"><label>Tipo</label><select data-e-type=\"${e.id}\"><option ${e.type==='missa'?'selected':''} value=\"missa\">Missa</option><option ${e.type==='evento'?'selected':''} value=\"evento\">Evento</option><option ${e.type==='reuniao'?'selected':''} value=\"reuniao\">Reunião</option><option ${e.type==='entrevista'?'selected':''} value=\"entrevista\">Entrevista</option></select></div><div class=\"form-group\"><label>Descrição</label><textarea rows=\"3\" data-e-desc=\"${e.id}\">${e.description||''}</textarea></div><div class=\"form-group inline\"><input type=\"checkbox\" ${e.published?'checked':''} data-e-pub=\"${e.id}\"><label>Publicado</label></div><div class=\"filters\"><button class=\"btn btn-outline\" data-e-save=\"${e.id}\">Salvar</button><button class=\"btn btn-outline\" data-act=\"delete\" data-id=\"${e.id}\">Excluir</button></div></div>`}).join('');eventsList.querySelectorAll('[data-e-save]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-e-save');const api=localStorage.getItem('API_BASE')||API_BASE;const body={title:eventsList.querySelector(`[data-e-title=\"${id}\"]`).value,date:new Date(eventsList.querySelector(`[data-e-date=\"${id}\"]`).value).toISOString(),place:eventsList.querySelector(`[data-e-place=\"${id}\"]`).value,type:eventsList.querySelector(`[data-e-type=\"${id}\"]`).value,description:eventsList.querySelector(`[data-e-desc=\"${id}\"]`).value,published:eventsList.querySelector(`[data-e-pub=\"${id}\"]`).checked};const r=await fetch(`${api}/api/admin/events/${id}`,{method:'PATCH',headers:h(),body:JSON.stringify(body)});if(r.ok)loadEvents()}));eventsList.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-id');const act=b.getAttribute('data-act');const api=localStorage.getItem('API_BASE')||API_BASE;if(act==='delete'){const r=await fetch(`${api}/api/admin/events/${id}`,{method:'DELETE',headers:h()});if(r.ok)loadEvents()}}))}catch{eventsList.innerHTML=''} }
evCreate&&evCreate.addEventListener('click',async()=>{const title=$('#ev-title').value.trim();const date=$('#ev-date').value;const place=$('#ev-place').value.trim();const type=$('#ev-type').value;const description=$('#ev-desc').value.trim();const published=$('#ev-published').checked;if(!title||!date||!type){evMsg.textContent='Preencha título, data e tipo.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;const body={title,date:new Date(date).toISOString(),place,type,description,published};const r=await fetch(`${api}/api/admin/events`,{method:'POST',headers:h(),body:JSON.stringify(body)});if(!r.ok)throw new Error();evMsg.textContent='Evento criado.';loadEvents()}catch{evMsg.textContent='Falha ao criar evento.'}})
loadPosts()
loadEvents()
/* Textos do Site */
const txtSave=$('#txt-save')
const txtStatus=$('#txt-status')
const fields=[
  {key:'site_layout',el:'#site-layout'},
  {key:'hero_title',el:'#txt-hero-title'},
  {key:'hero_subtitle',el:'#txt-hero-subtitle'},
  {key:'hero_cta_primary',el:'#txt-cta1'},
  {key:'hero_cta_secondary',el:'#txt-cta2'},
  {key:'brand_name',el:'#txt-brand'},
  {key:'party_label',el:'#txt-party'},
  {key:'section_title_biografia',el:'#txt-sec-bio'},
  {key:'section_title_propostas',el:'#txt-sec-propostas'},
  {key:'section_title_agenda',el:'#txt-sec-agenda'},
  {key:'section_title_noticias',el:'#txt-sec-noticias'},
  {key:'section_title_midia',el:'#txt-sec-midia'},
  {key:'section_title_apoie',el:'#txt-sec-apoie'},
  {key:'section_title_contato',el:'#txt-sec-contato'},
  {key:'bio_p1',el:'#txt-bio-p1'},
  {key:'bio_p2',el:'#txt-bio-p2'},
  {key:'bio_p3',el:'#txt-bio-p3'},
  {key:'nav_home',el:'#txt-nav-home'},
  {key:'nav_biografia',el:'#txt-nav-bio'},
  {key:'nav_propostas',el:'#txt-nav-prop'},
  {key:'nav_agenda',el:'#txt-nav-agenda'},
  {key:'nav_noticias',el:'#txt-nav-news'},
  {key:'nav_midia',el:'#txt-nav-midia'},
  {key:'nav_apoie',el:'#txt-nav-apoie'},
  {key:'nav_contato',el:'#txt-nav-contato'},
  {key:'whatsapp_number',el:'#txt-whatsapp'},
  {key:'social_facebook',el:'#txt-fb'},
  {key:'social_instagram',el:'#txt-ig'},
  {key:'social_youtube',el:'#txt-yt'},
  {key:'prop1_title',el:'#txt-prop1-title'},
  {key:'prop1_content',el:'#txt-prop1-content'},
  {key:'prop2_title',el:'#txt-prop2-title'},
  {key:'prop2_content',el:'#txt-prop2-content'},
  {key:'prop3_title',el:'#txt-prop3-title'},
  {key:'prop3_content',el:'#txt-prop3-content'},
  {key:'prop4_title',el:'#txt-prop4-title'},
  {key:'prop4_content',el:'#txt-prop4-content'}
]
const fillTexts=async()=>{try{const data=await apiGetSettings();const map=new Map(data.map(i=>[i.key||i.id,i.value]));fields.forEach(f=>{const el=document.querySelector(f.el);if(!el)return;const v=map.get(f.key);el.value=typeof v==='string'?v:(v&&v.text?v.text:'')})}catch{}}
const saveTexts=async()=>{try{const api=localStorage.getItem('API_BASE')||API_BASE;for(const f of fields){const el=document.querySelector(f.el);if(!el)continue;const val=el.value.trim();const r=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:f.key,value:val})});if(r.status===401)throw new Error('unauthorized');if(!r.ok)throw new Error()}}catch{return false}return true}
fillTexts()
if(txtSave){txtSave.addEventListener('click',async()=>{txtStatus.textContent='Salvando...';const ok=await saveTexts();txtStatus.textContent=ok?'Textos salvos.':'Falha ao salvar.'})}
/* Editor Foto do Herói */
const heroFile=$('#hero-file')
const heroPreview=$('#hero-preview')
const heroPosX=$('#hero-pos-x')
const heroPosY=$('#hero-pos-y')
const heroFit=$('#hero-fit')
const heroScale=$('#hero-scale')
const heroSave=$('#hero-save')
const heroMsg=$('#hero-msg')
const heroGrid=document.querySelector('#hero-grid')
const heroGridToggle=$('#hero-grid-toggle')
const heroOutPreset=$('#hero-out-preset')
const heroOutW=$('#hero-out-w')
const heroOutH=$('#hero-out-h')
const renderHeroGrid=()=>{if(!heroGrid)return;heroGrid.innerHTML='';const gold='rgba(201,162,39,0.7)';const mk=s=>{const d=document.createElement('div');Object.assign(d.style,s);heroGrid.appendChild(d)};mk({position:'absolute',left:'33.33%',top:'0',bottom:'0',width:'1px',background:gold});mk({position:'absolute',left:'66.66%',top:'0',bottom:'0',width:'1px',background:gold});mk({position:'absolute',top:'33.33%',left:'0',right:'0',height:'1px',background:gold});mk({position:'absolute',top:'66.66%',left:'0',right:'0',height:'1px',background:gold})}
const updateHeroPreview=(url)=>{if(heroPreview){heroPreview.style.backgroundImage=url?`url('${url}')`:''}}
const applyHeroStyle=()=>{if(heroPreview){const x=parseInt(heroPosX.value||'50',10);const y=parseInt(heroPosY.value||'50',10);const fit=heroFit.value||'cover';const scale=parseFloat(heroScale?.value||'1');if(scale&&scale>1){heroPreview.style.backgroundSize=`${Math.round(scale*100)}% auto`}else{heroPreview.style.backgroundSize=fit==='contain'?'contain':'cover'}heroPreview.style.backgroundPosition=`${x}% ${y}%`}}
heroPosX&&heroPosX.addEventListener('input',applyHeroStyle)
heroPosY&&heroPosY.addEventListener('input',applyHeroStyle)
heroFit&&heroFit.addEventListener('change',applyHeroStyle)
heroScale&&heroScale.addEventListener('input',applyHeroStyle)
heroFile&&heroFile.addEventListener('change',async()=>{const f=heroFile.files&&heroFile.files[0];if(!f)return;const d=await fileToDataURL(f);updateHeroPreview(d);applyHeroStyle()})
heroGridToggle&&heroGridToggle.addEventListener('change',()=>{if(!heroGrid)return;heroGrid.style.display=heroGridToggle.checked?'block':'none';if(heroGridToggle.checked)renderHeroGrid()})
heroOutPreset&&heroOutPreset.addEventListener('change',()=>{const v=(heroOutPreset.value||'').trim();const m=v.match(/^(\d+)x(\d+)$/);if(m){if(heroOutW)heroOutW.value=m[1];if(heroOutH)heroOutH.value=m[2]}})
const loadHero=async()=>{try{const data=await apiGetSettings();const map=new Map(data.map(i=>[i.key||i.id,i.value]));const hero=map.get('hero_photo_url');const style=map.get('hero_photo_style');if(hero&&hero.url)updateHeroPreview(hero.url);if(style){heroPosX.value=String(style.pos?.x??50);heroPosY.value=String(style.pos?.y??50);heroFit.value=style.fit||'cover';heroScale.value=String(typeof style.scale==='number'?style.scale:1);applyHeroStyle()}if(heroGrid){heroGrid.style.display=(heroGridToggle&&heroGridToggle.checked)?'block':'none';if(heroGridToggle&&heroGridToggle.checked)renderHeroGrid()}if(heroOutPreset){const v=(heroOutPreset.value||'').trim();const m=v.match(/^(\d+)x(\d+)$/);if(m){if(heroOutW)heroOutW.value=m[1];if(heroOutH)heroOutH.value=m[2]}}}catch{}}
loadHero()
heroSave&&heroSave.addEventListener('click',async()=>{heroMsg.textContent='Salvando...';try{const api=localStorage.getItem('API_BASE')||API_BASE;let url=null;if(heroFile&&heroFile.files&&heroFile.files[0]){const d=await fileToDataURL(heroFile.files[0]);const rm=await fetch(`${api}/api/admin/media`,{method:'POST',headers:h(),body:JSON.stringify({type:'image',title:'hero',alt_text:'hero',url:d,category:'hero'})});if(!rm.ok)throw new Error('media');const m=await rm.json();url=m.url||d}else{const bg=heroPreview.style.backgroundImage||'';url=bg.replace(/^url\(['"]?(.+?)['"]?\)$/,'$1')||null}
  let cropped=null;try{cropped=await exportHeroCrop()}catch{}
  const style={fit:heroFit.value||'cover',pos:{x:parseInt(heroPosX.value||'50',10),y:parseInt(heroPosY.value||'50',10)},scale:parseFloat(heroScale?.value||'1')}
  if(cropped){let rm2=await fetch(`${api}/api/admin/media`,{method:'POST',headers:h(),body:JSON.stringify({type:'image',title:'hero-crop',alt_text:'hero-crop',url:cropped,category:'hero'})});if(rm2.ok){const m2=await rm2.json();url=m2.url||cropped}}
  let r=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'hero_photo_url',value:{url}})});if(r.status===401)throw new Error('unauthorized')
  if(!r.ok)throw new Error('settings-url');
  let r2=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'hero_photo_style',value:style})});if(r2.status===401)throw new Error('unauthorized')
  if(!r2.ok)throw new Error('settings-style');
  heroMsg.textContent='Foto do herói salva.'
}catch(e){heroMsg.textContent='Falha ao salvar a foto.'}})
/* YouTube */
const ytSave=$('#youtube-save')
const ytAdd=$('#youtube-add')
const ytStatus=$('#youtube-status')
const ytPreview=document.querySelector('#youtube-preview')
const ytListEl=$('#youtube-list')
let ytArr=[]
const toEmbed=u=>{try{const s=(u||'').trim();if(!s)return '';if(s.includes('/embed/'))return s;const m1=s.match(/v=([\w-]+)/);if(m1)return `https://www.youtube.com/embed/${m1[1]}`;const m2=s.match(/youtu\.be\/([\w-]+)/);if(m2)return `https://www.youtube.com/embed/${m2[1]}`;return s}catch{return ''}}
const updateYtPreview=()=>{const url=$('#youtube-url').value.trim();const e=toEmbed(url);if(ytPreview){if(e){ytPreview.src=e;ytStatus.textContent=''}else{ytPreview.removeAttribute('src');ytStatus.textContent='URL inválida.'}}}
const renderYtList=()=>{if(!ytListEl)return;ytListEl.innerHTML=ytArr.map((u,i)=>`<div class="news-item"><div style="display:flex;align-items:center;gap:8px"><span style="flex:1">${u}</span><button class="btn btn-outline" data-yt-del="${i}">Remover</button></div></div>`).join('');ytListEl.querySelectorAll('[data-yt-del]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.getAttribute('data-yt-del'),10);if(!isNaN(i)){ytArr.splice(i,1);renderYtList()}}))}
const ytInput=$('#youtube-url');ytInput&&ytInput.addEventListener('input',updateYtPreview)
ytAdd&&ytAdd.addEventListener('click',()=>{const url=$('#youtube-url').value.trim();if(!url){ytStatus.textContent='Informe a URL.';return}ytArr.push(url);$('#youtube-url').value='';updateYtPreview();renderYtList();ytStatus.textContent='Vídeo adicionado.'})
if(ytSave){ytSave.addEventListener('click',async()=>{if(!ytArr.length){ytStatus.textContent='Adicione pelo menos um vídeo.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'youtube_urls',value:ytArr})});if(r.status===401)throw new Error('unauthorized');if(!r.ok)throw new Error();ytStatus.textContent='Lista de vídeos salva.'}catch{ytStatus.textContent='Falha ao salvar vídeos.'}})}
/* Galeria */
const galAdd=$('#gal-add')
const galStatus=$('#gal-status')
const galList=$('#gal-list')
const renderAdminGallery=(list)=>{galList.innerHTML=list.map(i=>`<figure class=\"gallery-item\"><img src=\"${i.media?.url||''}\" alt=\"\"><figcaption class=\"tag\">${i.category}</figcaption><div class=\"filters\" style=\"padding:6px;display:flex;gap:6px\"><select data-edit-cat=\"${i.id}\"><option ${i.category==='encontros'?'selected':''} value=\"encontros\">Encontros</option><option ${i.category==='eventos'?'selected':''} value=\"eventos\">Eventos</option><option ${i.category==='acoes'?'selected':''} value=\"acoes\">Ações</option><option ${i.category==='oficiais'?'selected':''} value=\"oficiais\">Oficiais</option></select><input type=\"number\" style=\"width:64px\" value=\"${i.position||0}\" data-edit-pos=\"${i.id}\"/><button class=\"btn btn-outline\" data-save=\"${i.id}\">Salvar</button><button class=\"btn btn-outline\" data-del=\"${i.id}\">Remover</button></div></figure>`).join('')}
const loadGallery=async()=>{try{const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/gallery`);const list=r.ok?await r.json():[];renderAdminGallery(list);galList.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-del');const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/gallery-items/${id}`,{method:'DELETE',headers:h()});if(r.ok)loadGallery()}));galList.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',async()=>{const id=b.getAttribute('data-save');const cat=galList.querySelector(`[data-edit-cat="${id}"]`).value;const pos=parseInt(galList.querySelector(`[data-edit-pos="${id}"]`).value||'0',10);const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/gallery-items/${id}`,{method:'PATCH',headers:h(),body:JSON.stringify({category:cat,position:pos})});if(r.ok)loadGallery()}))}catch{galList.innerHTML=''}}
galAdd&&galAdd.addEventListener('click',async()=>{const files=$('#gal-photo').files;const category=$('#gal-cat').value;let position=parseInt($('#gal-pos').value||'0',10);if(!files||!files.length){galStatus.textContent='Selecione as fotos.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;let r=await fetch(`${api}/api/gallery`);let list=r.ok?await r.json():[];const cur=list.filter(i=>i.category===category).length;const max=50;const remain=Math.max(max-cur,0);if(remain<=0){galStatus.textContent='Limite atingido para a categoria.';return}const up=Array.from(files).slice(0,remain);for(const f of up){const d=await fileToDataURL(f);const rm=await fetch(`${api}/api/admin/media`,{method:'POST',headers:h(),body:JSON.stringify({type:'image',title:'galeria',alt_text:'galeria',url:d,category})});if(!rm.ok)throw new Error();const m=await rm.json();const ri=await fetch(`${api}/api/admin/gallery-items`,{method:'POST',headers:h(),body:JSON.stringify({media_id:m.id,category,position,published:true})});if(!ri.ok)throw new Error();position++}galStatus.textContent=up.length<files.length?'Parte das fotos adicionadas (limite 50).':'Fotos adicionadas.';loadGallery()}catch{galStatus.textContent='Falha ao adicionar.'}})
loadGallery()
/* Chat prompt/model */
const chatSave=$('#chat-save')
const chatStatus=$('#chat-status')
if(chatSave){chatSave.addEventListener('click',async()=>{const model=$('#llm-model').value.trim();const prompt=$('#chat-prompt').value.trim();if(!model||!prompt){chatStatus.textContent='Informe modelo e prompt.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;const r1=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'llm_model',value:model})});const r2=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'chat_system_prompt',value:prompt})});if(r1.status===401||r2.status===401)throw new Error('unauthorized');if(r1.ok&&r2.ok){chatStatus.textContent='Configurações salvas.'}else{throw new Error()} }catch{chatStatus.textContent='Falha ao salvar.'}})}
const prefill=async()=>{const data=await apiGetSettings();const map=new Map(data.map(i=>[i.key||i.id,i.value]));const m=map.get('llm_model');const p=map.get('chat_system_prompt');const l=map.get('llm_free_models');const y=map.get('youtube_url');const ys=map.get('youtube_urls');if(m)$('#llm-model').value=typeof m==='string'?m:(m.model||'');if(p)$('#chat-prompt').value=typeof p==='string'?p:(p.prompt||'');if(l)$('#llm-free-list').value=typeof l==='string'?l:(Array.isArray(l)?l.join(', '):'');if(Array.isArray(ys)&&ys.length){ytArr=ys.map(v=>typeof v==='string'?v:(v.url||v)).filter(Boolean)}else if(typeof ys==='object'&&ys&&Array.isArray(ys.list)){ytArr=ys.list.map(v=>String(v)).filter(Boolean)}else if(y){const val=typeof y==='string'?y:(y.url||'');$('#youtube-url').value=val}renderYtList()};prefill().then(()=>{updateYtPreview()})
const llmFreeSave=$('#llm-free-save')
const llmFreeStatus=$('#llm-free-status')
const llmFreeLoad=$('#llm-free-load')
if(llmFreeLoad){llmFreeLoad.addEventListener('click',async()=>{llmFreeStatus.textContent='Carregando lista da OpenRouter...';try{const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/llm/free-models`);if(!r.ok)throw new Error();const data=await r.json();const models=(data.models||[]).join(', ');$('#llm-free-list').value=models;llmFreeStatus.textContent='Lista carregada.'}catch{llmFreeStatus.textContent='Falha ao carregar lista.'}})}
const llmTestBtn=$('#llm-test')
const llmTestStatus=$('#llm-test-status')
if(llmTestBtn){llmTestBtn.addEventListener('click',async()=>{const msg=$('#llm-test-msg').value.trim()||'Olá';const api=localStorage.getItem('API_BASE')||API_BASE;const t0=performance.now();try{const r=await fetch(`${api}/api/assistant`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:msg,session_id:null})});const t1=performance.now();if(!r.ok)throw new Error();const data=await r.json();const ms=Math.round(t1-t0);const model=data.model||'-';const preview=(data.reply||'').slice(0,180);llmTestStatus.textContent=`Modelo: ${model} • Tempo: ${ms}ms \u2014 ${preview}`}catch{llmTestStatus.textContent='Falha ao testar LLM.'}})}
/* LLM Free Models */
if(llmFreeSave){llmFreeSave.addEventListener('click',async()=>{const list=$('#llm-free-list').value.trim();if(!list){llmFreeStatus.textContent='Informe ao menos um modelo.';return}try{const api=localStorage.getItem('API_BASE')||API_BASE;const r=await fetch(`${api}/api/admin/settings`,{method:'PUT',headers:h(),body:JSON.stringify({key:'llm_free_models',value:list})});if(r.status===401)throw new Error('unauthorized');if(!r.ok)throw new Error();llmFreeStatus.textContent='Lista de modelos salva.'}catch{llmFreeStatus.textContent='Falha ao salvar a lista.'}})}
const exportHeroCrop=async()=>{const bg=heroPreview.style.backgroundImage||'';const m=bg.match(/^url\(['"]?(.+?)['"]?\)$/);const src=m?m[1]:null;if(!src)return null;return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{try{const cw=heroPreview.clientWidth||heroPreview.offsetWidth||800;const ch=heroPreview.clientHeight||320;const fit=heroFit.value||'cover';const scale=parseFloat(heroScale?.value||'1');const iw=img.naturalWidth;const ih=img.naturalHeight;const base=fit==='contain'?Math.min(cw/iw,ch/ih):Math.max(cw/iw,ch/ih);const eff=base*(scale>1?scale:1);const dw=iw*eff;const dh=ih*eff;const posX=parseInt(heroPosX.value||'50',10)/100;const posY=parseInt(heroPosY.value||'50',10)/100;const maxX=Math.max(dw-cw,0);const maxY=Math.max(dh-ch,0);const visX=Math.min(Math.max(maxX*posX,0),maxX);const visY=Math.min(Math.max(maxY*posY,0),maxY);const sx=visX/eff;const sy=visY/eff;const sw=cw/eff;const sh=ch/eff;const outW=parseInt(heroOutW?.value||'1600',10);const outH=parseInt(heroOutH?.value||String(Math.round(outW*ch/cw)),10);const canvas=document.createElement('canvas');canvas.width=outW;canvas.height=outH;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.drawImage(img,sx,sy,sw,sh,0,0,outW,outH);resolve(canvas.toDataURL('image/jpeg',0.92))}catch(e){reject(e)}};img.onerror=()=>reject(new Error('img_load'));img.src=src})}
