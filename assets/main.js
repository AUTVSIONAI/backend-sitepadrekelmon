const $=s=>document.querySelector(s)
const $$=s=>document.querySelectorAll(s)
const yearEl=$('#year')
if(yearEl)yearEl.textContent=new Date().getFullYear()
const toggle=$('.menu-toggle')
const menu=$('.menu')
toggle&&toggle.addEventListener('click',()=>{const open=menu.classList.toggle('show');toggle.setAttribute('aria-expanded',open)} )
$$('.menu a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('show')))
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(!id||id==='#')return;const el=$(id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}))
const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reveal-in');io.unobserve(e.target)}})},{threshold:.2})
$$('.reveal').forEach(el=>io.observe(el))
const topBtn=$('.back-to-top')
window.addEventListener('scroll',()=>{if(window.scrollY>480)topBtn.classList.add('show');else topBtn.classList.remove('show')})
topBtn&&topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}))
const modal=$('#modal')
const modalContent=$('#modal-content')
const modalClose=$('.modal-close')
modalClose&&modalClose.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')})
$$('[data-modal]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();const type=el.getAttribute('data-modal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(type==='termos'){modalContent.innerHTML=`<h3>Termos de Uso</h3><p>Este site disponibiliza conteúdos institucionais, agenda, notícias e formulários de contato/voluntariado. Ao utilizar, você concorda em fazê-lo com respeito, boa-fé e observância das leis aplicáveis.</p><p>Você se compromete a não enviar informações falsas, ofensivas ou ilícitas. O envio de dados não cria vínculo jurídico automático; a equipe poderá entrar em contato para continuidade do atendimento.</p><p>Conteúdos podem ser atualizados sem aviso prévio. Links externos são oferecidos por conveniência; não nos responsabilizamos por seus conteúdos.</p><p>Ao marcar concordância nos formulários, você declara ciência destes Termos. Em caso de dúvidas, entre em contato pelo e-mail oficial.</p>`}else{modalContent.innerHTML=`<h3>Política de Privacidade</h3><p>Coletamos os dados fornecidos nos formulários (nome, e-mail, cidade e mensagem) exclusivamente para comunicação com o usuário e organização de voluntariado/atendimento. A base legal é o consentimento do titular.</p><p>Tratamos os dados com medidas de segurança compatíveis e não realizamos compartilhamento indevido. Podemos utilizar provedores de infraestrutura (por exemplo, serviços de hospedagem e banco de dados) para operação técnica do site.</p><p>Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail oficial. Manteremos informações pelo tempo necessário ao propósito do tratamento ou para cumprimento de obrigações legais.</p><p>Podemos utilizar cookies e tecnologias similares para métricas de navegação e melhoria da experiência. Você pode desativá-los nas preferências do navegador.</p><p>Esta Política pode ser atualizada para refletir melhorias ou requisitos regulatórios. O uso contínuo do site após alterações indica ciência da versão vigente.</p>`}}))
const API_BASE=(()=>{const ls=localStorage.getItem('API_BASE');if(ls)return ls;const host=location.hostname;const isLocal=/localhost|127\.0\.0\.1/.test(host);return isLocal?'http://127.0.0.1:4000':'https://backend-sitepadrekelmon.vercel.app'})()
const utm=location.search
const apoioUtm=$('#apoio-utm')
const contatoUtm=$('#contato-utm')
if(apoioUtm)apoioUtm.value=utm
if(contatoUtm)contatoUtm.value=utm
const isEmail=v=>/.+@.+\..+/.test(v)
const setStatus=(el,msg)=>{el.textContent=msg}
const apoioForm=$('#apoio-form')
const apoioStatus=$('#apoio-status')
apoioForm&&apoioForm.addEventListener('submit',async e=>{e.preventDefault();const nome=$('#apoio-nome').value.trim();const email=$('#apoio-email').value.trim();const cidade=$('#apoio-cidade').value.trim();const msg=$('#apoio-mensagem').value.trim();const utm=$('#apoio-utm').value;const termos=$('#apoio-termos').checked;if(!nome||!isEmail(email)||!cidade||!termos){setStatus(apoioStatus,'Preencha os campos corretamente.');return}try{const r=await fetch(`${API_BASE}/api/volunteers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nome,email,city:cidade,message:msg,source_utm:utm})});if(!r.ok)throw new Error('Erro ao enviar');setStatus(apoioStatus,'Obrigado pelo apoio! Em breve entraremos em contato.')}catch{setStatus(apoioStatus,'Falha ao enviar. Tente novamente mais tarde.')}})
const contatoForm=$('#contato-form')
const contatoStatus=$('#contato-status')
contatoForm&&contatoForm.addEventListener('submit',async e=>{e.preventDefault();const nome=$('#contato-nome').value.trim();const email=$('#contato-email').value.trim();const assunto=$('#contato-assunto').value.trim();const mensagem=$('#contato-mensagem').value.trim();const utm=$('#contato-utm').value;if(!nome||!isEmail(email)||!assunto||!mensagem){setStatus(contatoStatus,'Preencha os campos corretamente.');return}try{const r=await fetch(`${API_BASE}/api/contacts`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nome,email,subject:assunto,message:mensagem,source_utm:utm})});if(!r.ok)throw new Error('Erro ao enviar');setStatus(contatoStatus,'Mensagem enviada! Obrigado pelo contato.')}catch{setStatus(contatoStatus,'Falha ao enviar. Tente novamente mais tarde.')}})
const waBtn=$('#whatsapp-btn')
waBtn&&waBtn.addEventListener('click',e=>{e.preventDefault();const phone=waBtn.getAttribute('data-phone');const text=encodeURIComponent('Olá! Quero apoiar o movimento.');const url=`https://wa.me/${phone}?text=${text}`;window.open(url,'_blank')})
const defaultPalette={navy:'#0B1B3F',gold:'#C9A227',white:'#ffffff',red:'#B22234'}
const getSettings=()=>{try{return JSON.parse(localStorage.getItem('siteSettings')||'{}')}catch{return {}}}
const applyPalette=p=>{const r=document.documentElement;const pal={...defaultPalette,...p};r.style.setProperty('--navy',pal.navy);r.style.setProperty('--gold',pal.gold);r.style.setProperty('--white',pal.white);r.style.setProperty('--red',pal.red)}
const applyHeroPhoto=(src,style)=>{
  const hp=$('.hero-photo');
  if(!hp)return;
  const setImg=(u,st)=>{hp.style.background='none';hp.style.backgroundImage=`url('${u}')`;const fit=(st&&st.fit)||'cover';const scale=st&&typeof st.scale==='number'?st.scale:1;hp.style.backgroundSize=scale&&scale>1?`${Math.round(scale*100)}% auto`:(fit==='contain'?'contain':'cover');if(st&&st.pos&&typeof st.pos.x==='number'&&typeof st.pos.y==='number'){hp.style.backgroundPosition=`${st.pos.x}% ${st.pos.y}%`}else{hp.style.backgroundPosition='center'}}
  if(src){setImg(src,style);return}
  const candidates=['assets/padre.jpg','assets/padre.jpeg','assets/padre.png']
  const tryNext=async(i)=>{
    if(i>=candidates.length){const ph='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#0B1B3F"/><text x="50%" y="50%" font-family="Montserrat,Arial" font-size="48" fill="#C9A227" text-anchor="middle" dominant-baseline="middle">Foto oficial aqui</text></svg>');setImg(ph);return}
    try{const url=candidates[i];const res=await fetch(url,{method:'HEAD'});if(res.ok){setImg(url)}else{tryNext(i+1)}}catch{tryNext(i+1)}
  }
  tryNext(0)
}
const S=getSettings();applyPalette(S.palette);applyHeroPhoto(S.heroPhoto)
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const pal=map.get('theme_palette');const hero=map.get('hero_photo_url');const style=map.get('hero_photo_style');if(pal)applyPalette(pal);if(hero&&hero.url)applyHeroPhoto(hero.url,style)}).catch(()=>{})
const applyText=(sel,val)=>{const el=typeof sel==='string'?document.querySelector(sel):sel;if(!el)return;el.textContent=String(val||'')}
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const tt=map.get('hero_title');const st=map.get('hero_subtitle');if(tt)applyText('.title',typeof tt==='string'?tt:tt.text);if(st)applyText('.subtitle',typeof st==='string'?st:st.text);const tBio=map.get('section_title_biografia');if(tBio)applyText('#biografia .section-title',typeof tBio==='string'?tBio:tBio.text);const tProp=map.get('section_title_propostas');if(tProp)applyText('#propostas .section-title',typeof tProp==='string'?tProp:tProp.text);const tAg=map.get('section_title_agenda');if(tAg)applyText('#agenda .section-title',typeof tAg==='string'?tAg:tAg.text);const tNews=map.get('section_title_noticias');if(tNews)applyText('#noticias .section-title',typeof tNews==='string'?tNews:tNews.text);const tMid=map.get('section_title_midia');if(tMid)applyText('#midia .section-title',typeof tMid==='string'?tMid:tMid.text);const tSup=map.get('section_title_apoie');if(tSup)applyText('#apoie .section-title',typeof tSup==='string'?tSup:tSup.text);const tCont=map.get('section_title_contato');if(tCont)applyText('#contato .section-title',typeof tCont==='string'?tCont:tCont.text);const b1=map.get('bio_p1');const b2=map.get('bio_p2');const b3=map.get('bio_p3');const bioParas=document.querySelectorAll('#biografia .grid-2 .reveal p');if(bioParas[0]&&b1)applyText(bioParas[0],typeof b1==='string'?b1:b1.text);if(bioParas[1]&&b2)applyText(bioParas[1],typeof b2==='string'?b2:b2.text);if(bioParas[2]&&b3)applyText(bioParas[2],typeof b3==='string'?b3:b3.text)}).catch(()=>{})
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const brand=map.get('brand_name');const party=map.get('party_label');if(brand)applyText('.brand',typeof brand==='string'?brand:brand.text);if(party)applyText('.party',typeof party==='string'?party:party.text);const navs=[{key:'nav_home',sel:'a[href="#home"]'},{key:'nav_biografia',sel:'a[href="#biografia"]'},{key:'nav_propostas',sel:'a[href="#propostas"]'},{key:'nav_agenda',sel:'a[href="#agenda"]'},{key:'nav_noticias',sel:'a[href="#noticias"]'},{key:'nav_midia',sel:'a[href="#midia"]'},{key:'nav_apoie',sel:'a[href="#apoie"]'},{key:'nav_contato',sel:'a[href="#contato"]'}];navs.forEach(n=>{const v=map.get(n.key);if(v)applyText(n.sel,typeof v==='string'?v:v.text)});const ctas=document.querySelectorAll('.cta a');const cta1=map.get('hero_cta_primary');const cta2=map.get('hero_cta_secondary');if(ctas[0]&&cta1)applyText(ctas[0],typeof cta1==='string'?cta1:cta1.text);if(ctas[1]&&cta2)applyText(ctas[1],typeof cta2==='string'?cta2:cta2.text);const cards=document.querySelectorAll('#propostas .cards article');const setCard=(i,prefix)=>{const t=map.get(`${prefix}_title`);const i1=map.get(`${prefix}_item1`);const i2=map.get(`${prefix}_item2`);const i3=map.get(`${prefix}_item3`);if(cards[i]){const h=cards[i].querySelector('h3');const lis=cards[i].querySelectorAll('ul li');if(h&&t)applyText(h,typeof t==='string'?t:t.text);if(lis[0]&&i1)applyText(lis[0],typeof i1==='string'?i1:i1.text);if(lis[1]&&i2)applyText(lis[1],typeof i2==='string'?i2:i2.text);if(lis[2]&&i3)applyText(lis[2],typeof i3==='string'?i3:i3.text)}};setCard(0,'prop1');setCard(1,'prop2');setCard(2,'prop3');setCard(3,'prop4');const wa=map.get('whatsapp_number');const waBtn=document.querySelector('#whatsapp-btn');if(waBtn&&wa){waBtn.setAttribute('data-phone',typeof wa==='string'?wa:wa.number||wa)}const fb=map.get('social_facebook');const ig=map.get('social_instagram');const yt=map.get('social_youtube');const setHref=(label,val)=>{const a=document.querySelector(`.social a[aria-label="${label}"]`);if(a&&val){a.setAttribute('href',typeof val==='string'?val:val.url||val)}};setHref('Facebook',fb);setHref('Instagram',ig);setHref('YouTube',yt)}).catch(()=>{})
const toEmbed=u=>{try{const s=(u||'').trim();if(!s)return '';if(s.includes('/embed/'))return s;const m1=s.match(/v=([\w-]+)/);if(m1)return `https://www.youtube.com/embed/${m1[1]}`;const m2=s.match(/youtu\.be\/([\w-]+)/);if(m2)return `https://www.youtube.com/embed/${m2[1]}`;const m3=s.match(/embed\/([\w-]+)/);if(m3)return `https://www.youtube.com/embed/${m3[1]}`;return s}catch{return ''}}
const toVideoId=u=>{try{const s=(u||'').trim();if(!s)return '';const m1=s.match(/v=([\w-]+)/);if(m1)return m1[1];const m2=s.match(/youtu\.be\/([\w-]+)/);if(m2)return m2[1];const m3=s.match(/embed\/([\w-]+)/);if(m3)return m3[1];return ''}catch{return ''}}
let ytList=[]
let ytIndex=0
const setYouTube=u=>{const f=document.getElementById('youtube-frame');if(!f)return;const e=toEmbed(u);if(e){f.src=e}}
const setYouTubeByIndex=i=>{if(!ytList.length)return;ytIndex=((i%ytList.length)+ytList.length)%ytList.length;setYouTube(ytList[ytIndex])}
const thumbsEl=document.getElementById('yt-thumbs')
const renderYtThumbs=()=>{if(!thumbsEl)return;thumbsEl.innerHTML=ytList.map((u,idx)=>{const id=toVideoId(u);const src=id?`https://img.youtube.com/vi/${id}/hqdefault.jpg`:'';const active=idx===ytIndex?' active':'';return `<div class="yt-thumb${active}" data-yt-index="${idx}"><img src="${src}" alt="Vídeo ${idx+1}"><span class="label">${idx+1}</span></div>`}).join('');thumbsEl.querySelectorAll('.yt-thumb').forEach(el=>el.addEventListener('click',()=>{const i=parseInt(el.getAttribute('data-yt-index'),10);if(!isNaN(i)){setYouTubeByIndex(i);renderYtThumbs();const target=Math.max(el.offsetLeft-(thumbsEl.clientWidth/2-el.clientWidth/2),0);thumbsEl.scrollTo({left:target,behavior:'smooth'});stopAutoAdvance()}}))}
let autoTimer=null
const startAutoAdvance=()=>{if(autoTimer||!ytList.length)return;autoTimer=setInterval(()=>{setYouTubeByIndex(ytIndex+1);renderYtThumbs();const cur=thumbsEl.querySelector(`.yt-thumb[data-yt-index="${ytIndex}"]`);if(cur){const target=Math.max(cur.offsetLeft-(thumbsEl.clientWidth/2-cur.clientWidth/2),0);thumbsEl.scrollTo({left:target,behavior:'smooth'})}},6000)}
const stopAutoAdvance=()=>{if(autoTimer){clearInterval(autoTimer);autoTimer=null}}
thumbsEl&&thumbsEl.addEventListener('mouseenter',stopAutoAdvance)
thumbsEl&&thumbsEl.addEventListener('mouseleave',startAutoAdvance)
thumbsEl&&thumbsEl.addEventListener('touchstart',stopAutoAdvance,{passive:true})
const carouselEl=document.querySelector('.video-primary')
carouselEl&&carouselEl.addEventListener('mouseenter',stopAutoAdvance)
carouselEl&&carouselEl.addEventListener('mouseleave',startAutoAdvance)
carouselEl&&carouselEl.addEventListener('touchstart',stopAutoAdvance,{passive:true})
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAutoAdvance();else startAutoAdvance()})
const prev=document.getElementById('yt-prev')
const next=document.getElementById('yt-next')
prev&&prev.addEventListener('click',()=>{setYouTubeByIndex(ytIndex-1);renderYtThumbs();startAutoAdvance()})
next&&next.addEventListener('click',()=>{setYouTubeByIndex(ytIndex+1);renderYtThumbs();startAutoAdvance()})
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const ylist=map.get('youtube_urls');const ysingle=map.get('youtube_url');if(Array.isArray(ylist)&&ylist.length){ytList=ylist.map(v=>typeof v==='string'?v:(v.url||v)).filter(Boolean)}else if(typeof ylist==='object'&&ylist&&Array.isArray(ylist.list)){ytList=ylist.list.map(v=>String(v)).filter(Boolean)}else if(ysingle){ytList=[typeof ysingle==='string'?ysingle:(ysingle.url||'')].filter(Boolean)}if(ytList.length){setYouTubeByIndex(0);renderYtThumbs();startAutoAdvance()}}).catch(()=>{})
if(!ytList.length){try{const S2=getSettings();const ys=S2.youtube_urls;const y=S2.youtube_url;if(Array.isArray(ys)&&ys.length){ytList=ys}else if(typeof ys==='object'&&ys&&Array.isArray(ys.list)){ytList=ys.list}else if(y){ytList=[y]}if(ytList.length){setYouTubeByIndex(0);renderYtThumbs();startAutoAdvance()}}catch{}}
const applyLayout=layout=>{const show=(sel,vis)=>{const el=document.querySelector(sel);if(el)el.style.display=vis?'':'none'};const hideMenu=(href,vis)=>{const a=document.querySelector(`a[href="${href}"]`);if(a)a.style.display=vis?'':'none'};const chat=document.querySelector('#chat-widget');const setChat=v=>{if(chat)chat.style.display=v?'':'none'};const l=String(layout||'campaign');if(l==='campaign'){show('#biografia',true);show('#propostas',true);show('#agenda',true);show('#noticias',true);show('#midia',true);show('#apoie',true);show('#contato',true);hideMenu('#apoie',true);setChat(true)}else if(l==='institutional'){show('#biografia',true);show('#propostas',true);show('#agenda',true);show('#noticias',true);show('#midia',true);show('#apoie',false);show('#contato',true);hideMenu('#apoie',false);setChat(false)}else if(l==='media'){show('#biografia',false);show('#propostas',false);show('#agenda',false);show('#noticias',true);show('#midia',true);show('#apoie',false);show('#contato',true);hideMenu('#apoie',false);setChat(false)}else if(l==='minimal'){show('#biografia',false);show('#propostas',false);show('#agenda',false);show('#noticias',false);show('#midia',false);show('#apoie',false);show('#contato',true);hideMenu('#apoie',false);setChat(false)}}
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const layout=map.get('site_layout');applyLayout(typeof layout==='string'?layout:layout?.value||'campaign')}).catch(()=>{})
fetch(`${API_BASE}/api/settings`).then(r=>r.ok?r.json():null).then(arr=>{if(!arr)return;const map=new Map(arr.map(i=>[i.key||i.id,i.value]));const cards=document.querySelectorAll('#propostas .cards article');const setCardContent=(i,prefix)=>{const c=map.get(`${prefix}_content`);if(cards[i]){const ul=cards[i].querySelector('ul');if(ul&&c){const text=typeof c==='string'?c:c.text;const lines=String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);ul.innerHTML='';lines.forEach(line=>{const li=document.createElement('li');li.textContent=line;ul.appendChild(li)})}}};setCardContent(0,'prop1');setCardContent(1,'prop2');setCardContent(2,'prop3');setCardContent(3,'prop4')}).catch(()=>{})
const agendaList=$('#agenda-list')
const renderAgenda=list=>{if(!agendaList)return;agendaList.innerHTML=(list||[]).map(e=>`<div class="agenda-item"><div class="date">${new Date(e.date).toLocaleString('pt-BR')}</div><div class="title">${e.title}</div><div class="place">${e.place||''}</div></div>`).join('')}
fetch(`${API_BASE}/api/events`).then(r=>r.ok?r.json():null).then(list=>{if(list&&list.length)renderAgenda(list)}).catch(()=>{})
const newsList=$('#news-list')
const renderNews=list=>{if(!newsList)return;newsList.innerHTML=(list||[]).map(n=>`<div class="news-item"><h3>${n.title}</h3><p>${n.excerpt||''}</p></div>`).join('')}
fetch(`${API_BASE}/api/posts?status=published`).then(r=>r.ok?r.json():null).then(list=>{if(list&&list.length)renderNews(list)}).catch(()=>{})
const gallery=$('#gallery')
const galleryMoreBtn=$('#gallery-more')
const ph='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#0B1B3F"/><text x="50%" y="50%" font-family="Montserrat,Arial" font-size="64" fill="#C9A227" text-anchor="middle" dominant-baseline="middle">Galeria</text></svg>')
let galleryData=(S.gallery&&S.gallery.length?S.gallery.map(src=>({src,tag:'oficiais'})):[
  {src:ph,tag:'encontros'},
  {src:ph,tag:'eventos'},
  {src:ph,tag:'acoes'},
  {src:ph,tag:'oficiais'},
  {src:ph,tag:'eventos'},
  {src:ph,tag:'encontros'}
])
let currentFilter='all'
let pageSize=12
let shownCount=0
let filtered=[]
const updateGallery=()=>{if(!gallery)return;const srcList=currentFilter==='all'?galleryData:[...galleryData.filter(i=>i.tag===currentFilter)].slice(0,50);filtered=srcList;shownCount=Math.min(shownCount||pageSize,filtered.length);const toShow=filtered.slice(0,shownCount);gallery.innerHTML=toShow.map(i=>`<figure class="gallery-item"><img alt="Imagem" src="${i.src}"><figcaption class="tag">${i.tag}</figcaption></figure>`).join('');if(galleryMoreBtn){if(shownCount<filtered.length){galleryMoreBtn.style.display=''}else{galleryMoreBtn.style.display='none'}}}
fetch(`${API_BASE}/api/gallery`).then(r=>r.ok?r.json():null).then(list=>{if(list&&list.length){galleryData=list.map(i=>({src:i.media?.url||ph,tag:i.category}));currentFilter='all';shownCount=pageSize;updateGallery()}else{currentFilter='all';shownCount=pageSize;updateGallery()}}).catch(()=>{currentFilter='all';shownCount=pageSize;updateGallery()})
galleryMoreBtn&&galleryMoreBtn.addEventListener('click',()=>{shownCount=Math.min(shownCount+pageSize,filtered.length);updateGallery()})
$$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentFilter=btn.getAttribute('data-filter')||'all';shownCount=pageSize;updateGallery()}))
const chatWidget=$('#chat-widget')
if(S.chat&&S.chat.enabled){chatWidget&&chatWidget.classList.add('open')}
const chatToggle=$('.chat-toggle')
const chatBody=$('#chat-body')
const chatForm=$('#chat-form')
const addMsg=(text,who)=>{const div=document.createElement('div');div.className=`chat-msg ${who}`;div.textContent=text;chatBody.appendChild(div);chatBody.scrollTop=chatBody.scrollHeight;return div}
chatToggle&&chatToggle.addEventListener('click',()=>{chatWidget.classList.toggle('open')})
chatForm&&chatForm.addEventListener('submit',async e=>{e.preventDefault();const txt=$('#chat-text').value.trim();if(!txt)return;addMsg(txt,'user');$('#chat-text').value='';
  const ph=addMsg('Digitando…','bot')
  try{const r=await fetch(`${API_BASE}/api/assistant`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt,session_id:localStorage.getItem('chat_session')||null})});if(!r.ok)throw new Error('assistant');const data=await r.json();if(data.session_id)localStorage.setItem('chat_session',data.session_id);ph.textContent=data.reply;chatBody.scrollTop=chatBody.scrollHeight}catch{ph.textContent='Obrigado pela mensagem. Estamos à disposição para servir com fé, família e Brasil.';chatBody.scrollTop=chatBody.scrollHeight}}
)
