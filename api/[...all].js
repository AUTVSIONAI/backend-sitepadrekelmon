import app from '../server/app.js'
export default function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Requested-With, Accept, Origin')
  res.setHeader('Access-Control-Max-Age','600')
  if(req.method==='OPTIONS'){res.status(204).end();return}
  return app(req,res)
}
