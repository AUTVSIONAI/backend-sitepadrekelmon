import 'dotenv/config'
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { supabase } from "./supabase.js"
import { adminAuth } from "./middleware/auth.js"
import { validateEmail, requireFields } from "./utils/validation.js"
import { chatWithFreeModels, getApiFreeModels } from "./llm/dispatcher.js"

const sessions=new Map()
const app=express()
const FRONT_ORIGIN=process.env.FRONT_ORIGIN||'https://sitepadrekelmon.vercel.app'
app.use(cors({origin:true}))
app.use((req,res,next)=>{const o=req.headers.origin||FRONT_ORIGIN||'*';res.header('Access-Control-Allow-Origin',o);res.header('Vary','Origin');res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');res.header('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With, Accept, Origin');res.header('Access-Control-Max-Age','600');if(req.method==='OPTIONS'){return res.status(204).end()}next()})
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  useDefaults:true,
  directives:{
    defaultSrc:["'self'"],
    scriptSrc:["'self'","'unsafe-inline'","https://vercel.live","https://*.vercel.live"],
    scriptSrcElem:["'self'","'unsafe-inline'","https://vercel.live","https://*.vercel.live"],
    connectSrc:["'self'","https://vercel.live","https://*.vercel.live","wss://*.vercel.live"],
    imgSrc:["'self'","data:","blob:","https:"],
    styleSrc:["'self'","'unsafe-inline'"],
    fontSrc:["'self'","data:"],
    frameSrc:["'self'","https://www.youtube.com","https://www.youtube-nocookie.com"]
  }
}))
app.use(express.json({limit:'2mb'}))
app.use(morgan('tiny'))

app.post('/api/volunteers',async(req,res)=>{const {name,email,city,message,source_utm}=req.body||{};if(!requireFields([name,email]))return res.status(400).json({error:'dados_invalidos'});if(!validateEmail(email))return res.status(400).json({error:'email_invalido'});const {error}=await supabase.from('volunteers').insert([{name,email,city,message,source_utm}]);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.post('/api/contacts',async(req,res)=>{const {name,email,subject,message,source_utm}=req.body||{};if(!requireFields([name,email,message]))return res.status(400).json({error:'dados_invalidos'});if(!validateEmail(email))return res.status(400).json({error:'email_invalido'});const {error}=await supabase.from('contacts').insert([{name,email,subject,message,source_utm}]);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.post('/api/chat',async(req,res)=>{const {session_id,role,message,model,metadata}=req.body||{};if(!requireFields([session_id,role,message]))return res.status(400).json({error:'dados_invalidos'});const {error}=await supabase.from('chat_messages').insert([{session_id,role,message,model,metadata}]);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.get('/api/posts',async(req,res)=>{const {status='published'}=req.query;const {data,error}=await supabase.from('posts').select('*').eq('status',status).order('published_at',{ascending:false});if(error)return res.status(500).json({error:error.message});res.json(data||[])})
app.get('/api/events',async(req,res)=>{const {data,error}=await supabase.from('events').select('*').eq('published',true).order('date',{ascending:true});if(error)return res.status(500).json({error:error.message});res.json(data||[])})
app.get('/api/gallery',async(req,res)=>{const {data:items,error}=await supabase.from('gallery_items').select('*').eq('published',true).order('position');if(error)return res.status(500).json({error:error.message});const ids=[...new Set(items.map(i=>i.media_id))];const {data:med,error:err2}=await supabase.from('media').select('*').in('id',ids);if(err2)return res.status(500).json({error:err2.message});const map=new Map(med.map(m=>[m.id,m]));const out=items.map(i=>({id:i.id,category:i.category,position:i.position,media:map.get(i.media_id)}));res.json(out)})
app.get('/api/settings',async(req,res)=>{const {data,error}=await supabase.from('settings').select('*');if(error)return res.status(500).json({error:error.message});res.json(data||[])})
app.post('/api/admin/media',adminAuth,async(req,res)=>{const {type,title,alt_text,url,category,published=true}=req.body||{};if(!requireFields([type,url]))return res.status(400).json({error:'dados_invalidos'});const {data,error}=await supabase.from('media').insert([{type,title,alt_text,url,category,published}]).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.post('/api/admin/gallery-items',adminAuth,async(req,res)=>{const {media_id,category,position=0,published=true}=req.body||{};if(!requireFields([media_id,category]))return res.status(400).json({error:'dados_invalidos'});const {data,error}=await supabase.from('gallery_items').insert([{media_id,category,position,published}]).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.patch('/api/admin/gallery-items/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {data,error}=await supabase.from('gallery_items').update(req.body).eq('id',id).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.post('/api/admin/posts',adminAuth,async(req,res)=>{const {slug,title,excerpt,content,status='draft',published_at=null,cover_media_id=null}=req.body||{};if(!requireFields([slug,title,content]))return res.status(400).json({error:'dados_invalidos'});const {data,error}=await supabase.from('posts').insert([{slug,title,excerpt,content,status,published_at,cover_media_id}]).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.patch('/api/admin/posts/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {data,error}=await supabase.from('posts').update(req.body).eq('id',id).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.delete('/api/admin/posts/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {error}=await supabase.from('posts').delete().eq('id',id);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.post('/api/admin/events',adminAuth,async(req,res)=>{const {title,date,place,type,description,published=true}=req.body||{};if(!requireFields([title,date,type]))return res.status(400).json({error:'dados_invalidos'});const {data,error}=await supabase.from('events').insert([{title,date,place,type,description,published}]).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.patch('/api/admin/events/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {data,error}=await supabase.from('events').update(req.body).eq('id',id).select().single();if(error)return res.status(500).json({error:error.message});res.json(data)})
app.delete('/api/admin/events/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {error}=await supabase.from('events').delete().eq('id',id);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.get('/api/admin/events',adminAuth,async(req,res)=>{const {data,error}=await supabase.from('events').select('*').order('date',{ascending:true});if(error)return res.status(500).json({error:error.message});res.json(data||[])})
app.put('/api/admin/settings',adminAuth,async(req,res)=>{const {key,value}=req.body||{};if(typeof key!=='string'||key.trim()==='')return res.status(400).json({error:'chave_invalida'});
  const val=(typeof value==='undefined')?null:value
  let data,error
  await supabase.from('settings').delete().eq('key',key)
  ;({data,error}=await supabase.from('settings').insert([{key,value:val}]).select().single())
  if(error)return res.status(500).json({error:error.message});res.json(data)
})
app.delete('/api/admin/gallery-items/:id',adminAuth,async(req,res)=>{const {id}=req.params;const {error}=await supabase.from('gallery_items').delete().eq('id',id);if(error)return res.status(500).json({error:error.message});res.json({ok:true})})
app.post('/api/assistant',async(req,res)=>{try{const {text,session_id}=req.body||{};if(!text)return res.status(400).json({error:'texto_vazio'});const {data:settings}=await supabase.from('settings').select('*');const map=new Map((settings||[]).map(s=>[s.key,s.value]));let system=map.get('chat_system_prompt')||'Responda em português de forma direta e objetiva à pergunta do usuário antes de qualquer saudação. Mantenha um tom pastoral e patriótico, mas sem floreios. Use até 2 parágrafos. Se não souber ou não puder confirmar (por exemplo, sobre candidatura), diga isso claramente e oriente a acompanhar canais oficiais. Ofereça ajuda adicional no final, com uma única frase breve.';if(system&&typeof system!=='string'){system=system.prompt||'Responda em português de forma direta e objetiva à pergunta do usuário antes de qualquer saudação. Mantenha um tom pastoral e patriótico, mas sem floreios. Use até 2 parágrafos. Se não souber ou não puder confirmar (por exemplo, sobre candidatura), diga isso claramente e oriente a acompanhar canais oficiais. Ofereça ajuda adicional no final, com uma única frase breve.'};const sid=session_id||`sess-${Date.now()}`;try{await supabase.from('chat_messages').insert([{session_id:sid,role:'user',message:text,model:'user'}])}catch{}
  let history=sessions.get(sid)||[];history=[...history,{role:'user',content:text}];sessions.set(sid,history.slice(-6))
  const bio1=map.get('bio_p1');const bio2=map.get('bio_p2');const bio3=map.get('bio_p3');const party=map.get('party_label')||'PL';const brand=map.get('brand_name')||'Padre Kelmon';const bioText=[bio1,bio2,bio3].map(b=>typeof b==='string'?b:(b&&b.text)||'').join(' ').trim().slice(0,300)
  system=[system,`Contexto: você fala em nome de ${brand}, sacerdote, com tom pastoral e patriótico, alinhado ao ${party}. Seja direto, objetivo e cordial. Use a biografia como referência: ${bioText}. Evite saudações iniciais; responda primeiro ao que foi perguntado e, se adequado, finalize com uma única frase breve de acompanhamento pastoral.`].join(' ')
  const {reply:rawReply,model}=await chatWithFreeModels({messages:history,system,session_id:sid})
  const clean=s=>{let t=String(s||'');t=t.replace(/[\u{1F000}-\u{1FFFF}]/gu,'');t=t.replace(/[\u2600-\u26FF]/g,'');t=t.replace(/\*\*|__|`/g,'');t=t.replace(/^\s*(olá|boa\s+(tarde|noite|dia)|saudações|paz\s+e\s+bem|tudo\s+bem\??|filho\(a\)?)[^.!?]*[.!?]\s*/i,'');t=t.replace(/\s*(como\s+posso\s+te\s+ajudar(\s+hoje)?\??|estou\s+aqui\s+para\s+ajudar\.?|conte\s+comigo\.?|posso\s+ajudar\??)\s*$/i,'');t=t.replace(/\s{3,}/g,' ').trim();return t}
  const ensure=(q,r)=>{try{const a=String(r||'');const qa=String(q||'').toLowerCase();const isCand=/candidat|eleiç|2026/.test(qa);const isLoc=/(de\s+s[ãa]o\s+paulo|s[ãa]o\s+paulo|de\s+onde|onde\s+você)/i.test(qa);const generic=/^\s*(como\s+posso\s+te\s+ajudar|em\s+que\s+posso\s+te\s+ajudar)/i.test(a)||a.trim().length<12; if(isCand){return 'No momento, não posso confirmar candidatura para 2026. Acompanhe os canais oficiais para atualizações. Posso ajudar com outra dúvida?'} if(isLoc&&generic){return 'Não posso confirmar dados pessoais como cidade de origem. Acompanhe os canais oficiais para informações públicas. Como posso ajudar em outra questão?'} return r}catch{return r}}
  const last=history[history.length-1]?.content||''
  const reply=clean(ensure(last,rawReply))
  try{supabase.from('chat_messages').insert([{session_id:sid,role:'assistant',message:reply,model}]).then(()=>{}).catch(()=>{})}catch{}
  history=[...history,{role:'assistant',content:reply}];sessions.set(sid,history.slice(-6))
  res.json({reply,session_id:sid,model})
}catch(err){res.status(500).json({error:'assistant_fail',detail:String(err)})}})
app.get('/api/admin/llm/free-models',async(req,res)=>{try{const list=await getApiFreeModels();res.json({models:list})}catch{res.status(500).json({error:'fetch_fail'})}})

export default app
app.get('/',(req,res)=>{
  res.json({
    ok:true,
    name:'sitepadrekelmon-backend',
    endpoints:[
      'GET /',
      'GET /api/posts',
      'GET /api/events',
      'GET /api/gallery',
      'GET /api/settings',
      'POST /api/volunteers',
      'POST /api/contacts',
      'POST /api/assistant',
      'GET /api/admin/events',
      'POST /api/admin/events',
      'PATCH /api/admin/events/:id',
      'DELETE /api/admin/events/:id',
      'POST /api/admin/media',
      'POST /api/admin/gallery-items',
      'PATCH /api/admin/gallery-items/:id',
      'DELETE /api/admin/gallery-items/:id',
      'POST /api/admin/posts',
      'PATCH /api/admin/posts/:id',
      'DELETE /api/admin/posts/:id',
      'PUT /api/admin/settings',
      'GET /api/admin/llm/free-models'
    ]
  })
})
