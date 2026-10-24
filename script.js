/* Campo estelar com projeção em perspectiva, sem bibliotecas. */
(() => {
'use strict';
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,stars=[],paused=reduced.matches;
let frame=0,previous=0,visible=true,pointerX=0,pointerY=0,driftX=0,driftY=0;
const depth=1600;
function reset(star,initial=false){
star.x=(Math.random()-.5)*width*2.7;star.y=(Math.random()-.5)*height*2.7;
star.z=initial?Math.random()*depth+1:depth;star.size=.35+Math.random()*1.1;star.tint=Math.random();return star;
}
function resize(){
width=hero.clientWidth;height=hero.clientHeight;
const dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
stars=Array.from({length:Math.min(850,Math.floor(width*height/1250))},()=>reset({},true));
if(paused||!visible)draw(0);
}
function draw(delta){
ctx.clearRect(0,0,width,height);
driftX+=(pointerX-driftX)*.025;driftY+=(pointerY-driftY)*.025;
const cx=width*.60+driftX,cy=height*.47+driftY,focal=Math.min(width,height)*.83;
for(const star of stars){
const oldZ=star.z;star.z-=delta*.115;
if(star.z<8){reset(star);continue;}
const scale=focal/star.z,x=cx+star.x*scale,y=cy+star.y*scale;
if(x< -40||x>width+40||y< -40||y>height+40){reset(star);continue;}
const alpha=Math.min(.85,(1-star.z/depth)*.9+.08),radius=Math.min(2.5,star.size*scale);
ctx.fillStyle=star.tint>.85?`rgba(201,165,255,${alpha})`:`rgba(242,228,255,${alpha})`;
ctx.beginPath();ctx.arc(x,y,Math.max(.3,radius),0,Math.PI*2);ctx.fill();
if(scale>.8&&delta>0){const trailZ=Math.min(depth,oldZ+11);ctx.strokeStyle=`rgba(213,178,255,${alpha*.55})`;ctx.lineWidth=Math.max(.4,radius*.65);ctx.beginPath();ctx.moveTo(cx+star.x*focal/trailZ,cy+star.y*focal/trailZ);ctx.lineTo(x,y);ctx.stroke();}
if(radius>1.35&&star.tint>.72){const glow=ctx.createRadialGradient(x,y,0,x,y,radius*6);glow.addColorStop(0,`rgba(190,135,255,${alpha*.38})`);glow.addColorStop(1,'rgba(190,135,255,0)');ctx.fillStyle=glow;ctx.fillRect(x-radius*6,y-radius*6,radius*12,radius*12);}
}}
function animate(now){const delta=previous?Math.min(40,now-previous):16;previous=now;draw(delta);frame=requestAnimationFrame(animate);}
function sync(){cancelAnimationFrame(frame);previous=0;hero.classList.toggle('is-paused',paused||!visible);if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(animate);else draw(0);}
reduced.addEventListener('change',e=>{paused=e.matches;sync();});
hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const rect=hero.getBoundingClientRect();pointerX=(e.clientX/width-.5)*24;pointerY=((e.clientY-rect.top)/height-.5)*18;});
hero.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
document.addEventListener('visibilitychange',sync);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
new ResizeObserver(resize).observe(hero);resize();sync();
})();
