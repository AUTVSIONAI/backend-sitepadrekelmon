const $=s=>document.querySelector(s)
const toHex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')
const sha256=async s=>{const enc=new TextEncoder().encode(s);const buf=await crypto.subtle.digest('SHA-256',enc);return toHex(buf)}
const defaultUser='admin'
const defaultPass='PL-Admin-2024!'
const getCreds=()=>{try{return JSON.parse(localStorage.getItem('adminCredentials')||'null')}catch{return null}}
const setCreds=c=>localStorage.setItem('adminCredentials',JSON.stringify(c))
const ensureDefaults=async()=>{let c=getCreds();if(!c){const hash=await sha256(defaultPass);c={user:defaultUser,passHash:hash};setCreds(c)}return c}
const setAuth=u=>{const t={user:u,issued:Date.now(),expires:Date.now()+2*60*60*1000};localStorage.setItem('adminAuth',JSON.stringify(t))}
const getParam=n=>new URLSearchParams(location.search).get(n)
const redirect=getParam('redirect')||'admin.html'
const form=$('#login-form')
const status=$('#login-status')
if(form){form.addEventListener('submit',async e=>{e.preventDefault();const user=$('#login-user').value.trim();const pass=$('#login-pass').value;const c=await ensureDefaults();const passHash=await sha256(pass);if(c&&user===c.user&&passHash===c.passHash){setAuth(user);status.textContent='Login realizado. Redirecionando...';setTimeout(()=>location.href=redirect,600)}else{status.textContent='Usuário ou senha inválidos.'}})}