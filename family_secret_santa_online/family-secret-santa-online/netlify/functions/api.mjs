import { getStore } from "@netlify/blobs";
import { randomBytes } from "node:crypto";

const store = getStore("family-secret-santa");
const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const token = () => randomBytes(24).toString("base64url");
function shuffled(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function draw(names){for(let n=0;n<5000;n++){const r=shuffled(names);if(r.every((v,i)=>v!==names[i]))return r}throw new Error("Could not create a valid draw. Try again.")}
export const handler = async (event) => {
  if(event.httpMethod!=="POST") return json(405,{error:"Use POST."});
  try {
    const body=JSON.parse(event.body||"{}");
    if(body.action==="create"){
      const names=body.names;
      if(!Array.isArray(names)||names.length<3||names.length>15||names.some(n=>typeof n!=="string"||!n.trim()||n.length>60))return json(400,{error:"Add between 3 and 15 valid names."});
      const clean=names.map(n=>n.trim());
      if(new Set(clean.map(n=>n.toLowerCase())).size!==clean.length)return json(400,{error:"Names must be unique."});
      const recipients=draw(clean),id=token();
      const participants=clean.map((name,i)=>({name,recipient:recipients[i],token:token(),wishlist:""}));
      const record={budget:String(body.budget||"").slice(0,80),date:String(body.date||"").slice(0,30),participants,createdAt:new Date().toISOString()};
      await store.set(id,JSON.stringify(record));
      const base=event.headers?.origin||"";
      return json(200,{links:participants.map(p=>({name:p.name,url:`${base}/?reveal=${encodeURIComponent(p.token)}`}))});
    }
    if(body.action==="reveal"||body.action==="save-wishlist"){
      if(typeof body.token!=="string"||body.token.length<20)return json(400,{error:"Invalid private link."});
      const keys=await store.list();let found=null,record=null;
      for(const item of keys.blobs){const raw=await store.get(item.key,{type:"text"});if(!raw)continue;const parsed=JSON.parse(raw);const p=parsed.participants.find(x=>x.token===body.token);if(p){found=p;record=parsed;found._key=item.key;break}}
      if(!found)return json(404,{error:"This private link could not be found."});
      if(body.action==="save-wishlist"){
        if(typeof body.wishlist!=="string"||body.wishlist.length>1500)return json(400,{error:"Wishlist must be under 1,500 characters."});
        found.wishlist=body.wishlist;
        const key=found._key;
        delete found._key;
        await store.set(key,JSON.stringify(record));
        return json(200,{ok:true});
      }
      const recipient=record.participants.find(x=>x.name===found.recipient);
      return json(200,{recipient:found.recipient,budget:record.budget,date:record.date,myWishlist:found.wishlist,recipientWishlist:recipient?.wishlist||""});
    }
    return json(400,{error:"Unknown action."});
  } catch(e){return json(500,{error:"Server error. Please try again."});}
};