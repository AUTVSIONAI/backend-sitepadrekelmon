import { createClient } from "@supabase/supabase-js"
const url=process.env.SUPABASE_URL
const key=process.env.SUPABASE_SERVICE_ROLE_KEY
const db=createClient(url,key)
const API_BASE=process.env.LLM_API_URL||'https://openrouter.ai/api'
const API_KEY=process.env.LLM_API_KEY
const REFERER=process.env.OR_REFERER||'http://localhost'
const TITLE=process.env.OR_TITLE||'Site Padre Kelmon'
const DEFAULT_LIST=(process.env.LLM_FREE_MODELS||[
  'meta-llama/llama-3.1-8b-instruct:free',
  'anthropic/claude-3-haiku:free',
  'google/gemma-7b-it:free',
  'nousresearch/nous-capybara-7b:free',
  'mistralai/mistral-small-latest',
  'qwen/qwen2.5-7b-instruct:free'
].join(',')).split(',').map(s=>s.trim()).filter(Boolean)
let LAST_MODEL=null
const parseList=v=>{try{if(Array.isArray(v))return v.map(s=>String(s).trim()).filter(Boolean);if(typeof v==='string')return v.split(',').map(s=>s.trim()).filter(Boolean);if(v&&typeof v==='object'&&Array.isArray(v.list))return v.list.map(s=>String(s).trim()).filter(Boolean)}catch{}return null}
const getFreeList=async()=>{try{const {data}=await db.from('settings').select('*').eq('key','llm_free_models').limit(1);const row=(data||[])[0];const parsed=parseList(row?.value);if(parsed&&parsed.length)return parsed}catch{}return DEFAULT_LIST}
export const getApiFreeModels=async()=>{try{const r=await fetch(`${API_BASE}/v1/models`,{headers:{'Authorization':`Bearer ${API_KEY}`,'Accept':'application/json','Referer':REFERER,'X-Title':TITLE,'HTTP-Referer':REFERER}});if(!r.ok)return [];const out=await r.json();const isChatty=id=>/chat|instruct|it|assistant/i.test(id)&&!/coder|code|vl|vision|longcat|flash|roleplay|poetry/i.test(id);const list=(out.data||[]).filter(m=>{const id=m.id||'';const free=id.includes(':free');const p=m.pricing||{};const zero=(p.prompt===0||p.completion===0);return (free||zero)&&isChatty(id)}).map(m=>m.id);return list.slice(0,20)}catch{return []}}
const getPreferredModel=async()=>{try{const {data}=await db.from('settings').select('*').eq('key','llm_model').limit(1);const row=(data||[])[0];const v=row?.value;if(typeof v==='string')return v;if(v&&typeof v==='object'&&v.model)return v.model}catch{}return null}
const filterList=arr=>arr.filter(m=>!/longcat|flash|roleplay|poetry/i.test(m))
const chooseModelList=async()=>{const admin=await getFreeList();const pref=await getPreferredModel();const api=await getApiFreeModels();let arr=[...(admin||[]),...(api||[]),...DEFAULT_LIST];if(pref&&arr.indexOf(pref)===-1)arr.unshift(pref);if(LAST_MODEL&&arr.indexOf(LAST_MODEL)===-1)arr.unshift(LAST_MODEL);arr=[...new Set(arr)];arr=filterList(arr);return arr}
const makeFallback=msg=>{try{const last=Array.isArray(msg)?msg[msg.length-1]?.content:String(msg||'');const q=(last||'').trim();if(/candidat|eleiç|2026/i.test(q))return 'No momento, não posso confirmar candidatura para 2026. Acompanhe os canais oficiais para atualizações. Posso ajudar com outra dúvida?';if(q)return 'Obrigado pela mensagem. Vou responder de forma objetiva ao que você trouxe. Como posso ajudar mais?';return 'Como posso ajudar?'}catch{return 'Como posso ajudar?'}}
export const chatWithFreeModels=async({messages,system,session_id})=>{
  if(!API_KEY)throw new Error('LLM_API_KEY ausente')
  const list=await chooseModelList()
  for(const model of list){
    try{
      const history=Array.isArray(messages)?messages:[{role:'user',content:String(messages||'').trim()}]
      const payload={model,messages:[{role:'system',content:String(system||'').trim()},...history.map(m=>({role:m.role,content:String(m.content||'').trim()}))],temperature:0.12,top_p:0.85,max_tokens:120}
      const ctrl=new AbortController()
      const timer=setTimeout(()=>ctrl.abort(),15000)
      const r=await fetch(`${API_BASE}/v1/chat/completions`,{method:'POST',headers:{'Authorization':`Bearer ${API_KEY}`,'Content-Type':'application/json','Referer':REFERER,'HTTP-Referer':REFERER,'X-Title':TITLE,'Origin':REFERER,'Accept':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal}).finally(()=>clearTimeout(timer))
      if(!r.ok){
        if(r.status===429){await new Promise(res=>setTimeout(res,3000))}
        if([402,403,429,500,503].includes(r.status))continue
        const text=await r.text();throw new Error(`LLM falha ${r.status} ${text}`)
      }
      const out=await r.json()
      const reply=out.choices?.[0]?.message?.content||'Obrigado pela mensagem.'
      try{await db.from('chat_messages').insert([{session_id,role:'assistant',message:reply,model,metadata:{provider:'openrouter'}}])}catch{}
      LAST_MODEL=model
      return {reply,model}
    }catch(e){try{console.warn('LLM model fail',model,String(e&&e.message||e))}catch{}/* tenta próximo */}
  }
  return {reply:makeFallback(messages),model:'fallback'}
}
