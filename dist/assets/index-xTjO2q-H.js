var Be=Object.defineProperty;var He=(f,t,e)=>t in f?Be(f,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):f[t]=e;var le=(f,t,e)=>He(f,typeof t!="symbol"?t+"":t,e);import{W as _t,H as Re,D as ht,M as g,a as p,B as y,P as kt,C as k,S as gt,b as ft,T as D,c as Jt,d as ge,e as We,f as At,g as V,R as te,V as m,h as Bt,A as Ht,i as mt,j as R,F as Wt,k as xt,l as $t,m as Rt,G as A,n as lt,o as ut,p as ct,q as J,r as Oe,s as Pe,t as me,u as $e,v as De,w as Gt,x as ee,y as se,z as ze,E as _e,I as we,J as Fe,L as je,K as Ge,N as Ye,O as Xe}from"./three-jFgxbYDq.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(o){if(o.ep)return;o.ep=!0;const i=e(o);fetch(o.href,i)}})();class Ve{constructor(){this._state=null,this._payload=null,this._listeners={}}get state(){return this._state}get payload(){return this._payload}setState(t,e=null){const s=this._state;this._state=t,this._payload=e,this._emit("stateChange",{from:s,to:t,payload:e})}on(t,e){return this._listeners[t]||(this._listeners[t]=[]),this._listeners[t].push(e),()=>this.off(t,e)}off(t,e){this._listeners[t]&&(this._listeners[t]=this._listeners[t].filter(s=>s!==e))}_emit(t,e){const s=this._listeners[t];if(s)for(const o of s)o(e)}}class Ue{constructor(){this._callbacks=[],this._running=!1,this._raf=null,this._lastTime=0,this._tick=this._tick.bind(this)}add(t){this._callbacks.push(t)}remove(t){this._callbacks=this._callbacks.filter(e=>e!==t)}start(){this._running||(this._running=!0,this._lastTime=performance.now(),this._raf=requestAnimationFrame(this._tick))}stop(){this._running=!1,this._raf&&(cancelAnimationFrame(this._raf),this._raf=null)}_tick(t){if(!this._running)return;const e=Math.min((t-this._lastTime)/1e3,.1);this._lastTime=t;for(const s of this._callbacks)s(e,t);this._raf=requestAnimationFrame(this._tick)}}class Ke{constructor(){this.canvas=null,this._renderer=null}init(){this.canvas=document.getElementById("game-canvas"),this._renderer=new _t({canvas:this.canvas,antialias:!1,powerPreference:"high-performance",alpha:!1,stencil:!1,depth:!0}),this._renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this._renderer.setSize(window.innerWidth,window.innerHeight),this._renderer.shadowMap.enabled=!1,window.addEventListener("resize",()=>this._onResize()),this.hide()}show(){this.canvas.style.display="block"}hide(){this.canvas.style.display="none"}get instance(){return this._renderer}_onResize(){this._renderer.setSize(window.innerWidth,window.innerHeight)}}class Qe{constructor(){this._touches=new Map,this._listeners={}}init(){document.addEventListener("touchstart",t=>this._onTouchStart(t),{passive:!0}),document.addEventListener("touchend",t=>this._onTouchEnd(t),{passive:!0}),document.addEventListener("touchmove",t=>this._onTouchMove(t),{passive:!0})}on(t,e){return this._listeners[t]||(this._listeners[t]=[]),this._listeners[t].push(e),()=>this.off(t,e)}off(t,e){this._listeners[t]&&(this._listeners[t]=this._listeners[t].filter(s=>s!==e))}_onTouchStart(t){for(const e of t.changedTouches)this._touches.set(e.identifier,{x:e.clientX,y:e.clientY});this._emit("touchstart",t)}_onTouchMove(t){this._emit("touchmove",t)}_onTouchEnd(t){for(const e of t.changedTouches)this._touches.delete(e.identifier);this._emit("touchend",t)}_emit(t,e){const s=this._listeners[t];if(s)for(const o of s)o(e)}get activeTouches(){return this._touches}}class Ze{constructor(t){this.state=t,this._timer=null,this.container=this._build()}_build(){const t=document.createElement("div");return t.className="screen screen-hidden splash-screen",t.innerHTML=`
      <div class="sp-bg-layer"></div>
      <div class="sp-glow-left"></div>
      <div class="sp-glow-right"></div>

      <div class="sp-body">
        <!-- Left: logo + tagline -->
        <div class="sp-left">
          <div class="sp-logo-wrap">
            <img src="/TextLogo.png" class="sp-logo-img" alt="WireVerse" draggable="false" />
          </div>
          <p class="sp-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>
        </div>

        <!-- Right: mascot -->
        <div class="sp-right">
          <img src="/Mascot.png" alt="Volt" class="sp-mascot" draggable="false" />
          <div class="sp-mascot-glow"></div>
        </div>
      </div>

      <div class="sp-footer">
        <span class="sp-version">Version 1.0.0</span>
      </div>
    `,t}onShow(){clearTimeout(this._timer),this._timer=setTimeout(()=>this.state.setState("loading"),2200)}onHide(){clearTimeout(this._timer)}}const ke="wv2_player",Yt=200;function ce(){return{playerName:null,xp:0,level:1,loginStreak:0,lastLoginDate:null,learnProgress:{wireTypes:!1,electricianTools:!1,wireStripping:!1},learnStages:{electricianTools:!1,outlet:!1,learnOutlet:!1,ways:!1,switchInstallation:!1},exploreOutlets:{},exploreSwitches:{},exploreBreakerFixed:!1,scenarioScores:{},settings:{masterVolume:80,music:70,sfx:90,vibration:!0,tutorialHints:!0,darkMode:!0}}}class O{static load(){if(this._cache)return this._cache;try{const t=localStorage.getItem(ke);return t?(this._cache=this._merge(ce(),JSON.parse(t)),this._cache):(this._cache=ce(),this._cache)}catch{return this._cache=ce(),this._cache}}static save(t){this._cache=t;try{localStorage.setItem(ke,JSON.stringify(t))}catch{}}static patch(t){const s={...this.load(),...t};return this.save(s),s}static isFirstLaunch(){return!this.load().playerName}static setPlayerName(t){return this.patch({playerName:t.trim()})}static getPlayerName(){return this.load().playerName||"Player"}static checkLoginStreak(){const t=this.load(),e=new Date().toDateString();if(t.lastLoginDate===e)return t;const s=new Date(Date.now()-864e5).toDateString(),o=t.lastLoginDate===s?t.loginStreak+1:1,i=25*Math.min(o,7);return this.patch({loginStreak:o,lastLoginDate:e,xp:(t.xp||0)+i})}static saveSettings(t){const e=this.load();e.settings={...e.settings,...t},this.save(e)}static completeLesson(t){const e=this.load();return e.learnProgress||(e.learnProgress={}),e.learnProgress[t]=!0,this.save(e),e}static getLessonProgress(){return this.load().learnProgress||{}}static saveLearnStage(t){const e=this.load();return e.learnStages||(e.learnStages={}),e.learnStages[t]=!0,this.save(e),e}static getLearnStage(t){var e;return!!((e=this.load().learnStages)!=null&&e[t])}static isLearnStageUnlocked(t){return!0}static isExploreModeUnlocked(){return!0}static saveExploreOutlet(t){const e=this.load();e.exploreOutlets||(e.exploreOutlets={}),e.exploreOutlets[t]=!0,this.save(e)}static saveExploreSwitch(t){const e=this.load();e.exploreSwitches||(e.exploreSwitches={}),e.exploreSwitches[t]=!0,this.save(e)}static getExploreProgress(){const t=this.load();return{outletCount:Object.keys(t.exploreOutlets||{}).length,switchCount:Object.keys(t.exploreSwitches||{}).length,outlets:t.exploreOutlets||{},switches:t.exploreSwitches||{}}}static xpForLevel(t){return(t-1)*Yt}static levelFromXP(t){return Math.floor(t/Yt)+1}static xpProgressInLevel(t){return t%Yt}static addXP(t){const s=(this.load().xp||0)+t,o=this.levelFromXP(s);return this.patch({xp:s,level:o})}static saveScenarioScore(t,e){const s=this.load();s.scenarioScores||(s.scenarioScores={});const o=s.scenarioScores[t]||0;return e>o&&(s.scenarioScores[t]=e,this.save(s)),s}static getScenarioScore(t){var e;return((e=this.load().scenarioScores)==null?void 0:e[t])||0}static saveExploreBreaker(){return this.patch({exploreBreakerFixed:!0})}static getStats(){const t=this.load(),e=t.xp||0,s=t.level||1;return{xp:e,level:s,xpInLevel:this.xpProgressInLevel(e),xpToNext:Yt,loginStreak:t.loginStreak}}static _merge(t,e){const s={...t};for(const o of Object.keys(e))e[o]&&typeof e[o]=="object"&&!Array.isArray(e[o])?s[o]=this._merge(t[o]||{},e[o]):s[o]=e[o];return s}}le(O,"_cache",null);const Te=["Check your connections carefully. Every wire matters!","Yellow wires carry positive current — plan your route!","A short circuit can blow the fuse. Stay alert.","Use hints wisely — they cost gems to unlock.","Stars are awarded based on accuracy and completion speed."];class Je{constructor(t){this.state=t,this.container=this._build()}_build(){const t=document.createElement("div");return t.className="screen screen-hidden loading-screen",t.innerHTML=`
      <div class="ld-bg-circuit"></div>
      <div class="ld-bg-vignette"></div>

      <div class="ld-content">
        <div class="ld-label">LOADING...</div>

        <div class="ld-bar-wrap">
          <div class="ld-track">
            <div class="ld-fill" id="ld-fill">
              <div class="ld-fill-glow"></div>
            </div>
          </div>
          <span class="ld-pct" id="ld-pct">0%</span>
        </div>

        <div class="ld-tip-row">
          <div class="ld-bulb-icon">
            <div class="ld-bulb-shape"></div>
            <div class="ld-bulb-rays"></div>
          </div>
          <p class="ld-tip-text" id="ld-tip"></p>
        </div>
      </div>
    `,t}onShow(){const t=Te[Math.floor(Math.random()*Te.length)];this.container.querySelector("#ld-tip").textContent="TIP: "+t,this._run()}_run(){const t=this.container.querySelector("#ld-fill"),e=this.container.querySelector("#ld-pct");let s=0,o=0;const i=()=>{const a=Math.random()*14+6;if(s=Math.min(s+a,100),o+=140,t.style.width=`${s}%`,e.textContent=`${Math.floor(s)}%`,s>=100&&o>=1e3){setTimeout(()=>{O.isFirstLaunch()?this.state.setState("nameEntry"):(O.checkLoginStreak(),this.state.setState("menu"))},350);return}setTimeout(i,140+Math.random()*60)};i()}}const X=(f,t=18,e=18)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${f}</svg>`,ts=(f,t=18,e=18)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${e}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${f}</svg>`,N={settings:X('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),achievements:X('<path d="M7 21h10M12 21v-4"/><path d="M17 5H7v8a5 5 0 0 0 10 0V5z"/><path d="M7 5H4v5h3M17 5h3v5h-3"/>'),tools:X('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),credits:X('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/>'),exit:X('<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>'),learn:X('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),back:X('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),gem:ts('<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20M6 3l4 6m4 0l4-6" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none"/>'),audio:X('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'),graphics:X('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'),controls:X('<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1.2" fill="currentColor"/><circle cx="17" cy="13" r="1.2" fill="currentColor"/>'),language:X('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),pause:X('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'),hint:X('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),user:X('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),check:X('<polyline points="20 6 9 17 4 12"/>')};function qe(f=""){return`<div class="wv-logo" ${f?`style="font-size:${f}"`:""}>WIRE<span class="wv-bolt"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 18" width="0.55em" height="0.9em"><polygon points="7,0 0,10 6,10 3,18 10,8 4,8" fill="#ffa500"/></svg></span>VERSE</div>`}class es{constructor(t){this.state=t,this.container=this._build(),this._input=this.container.querySelector("#ne-input")}_build(){const t=document.createElement("div");t.className="screen screen-hidden name-entry-screen",t.innerHTML=`
      <div class="ne-bg-grid"></div>
      <div class="ne-content">

        ${qe("clamp(42px, 11vw, 64px)")}
        <p class="ne-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>

        <div class="ne-card">
          <h2 class="ne-title">WELCOME, ELECTRICIAN!</h2>
          <p class="ne-subtitle">Enter your name to begin your journey</p>

          <div class="ne-input-wrap">
            <input
              id="ne-input"
              class="ne-input"
              type="text"
              maxlength="16"
              placeholder="Your name..."
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <button class="ne-start-btn" id="ne-start">
            START JOURNEY
          </button>
        </div>

      </div>
    `;const e=t.querySelector("#ne-start"),s=t.querySelector("#ne-input"),o=()=>{const i=s.value.trim();if(!i){s.classList.add("ne-input--shake"),setTimeout(()=>s.classList.remove("ne-input--shake"),500);return}O.setPlayerName(i),O.checkLoginStreak(),this.state.setState("menu")};return e.addEventListener("click",o),s.addEventListener("keydown",i=>{i.key==="Enter"&&o()}),t}onShow(){setTimeout(()=>{var t;return(t=this._input)==null?void 0:t.focus()},350)}}const ss=[{id:"learn",label:"LEARN",icon:N.learn,state:"stagesHub",primary:!0},{id:"settings",label:"SETTINGS",icon:N.settings,state:"settings"},{id:"achievements",label:"ACHIEVEMENTS",icon:N.achievements,state:"achievements"},{id:"tools",label:"TOOLS",icon:N.tools,state:"tools"},{id:"credits",label:"CREDITS",icon:N.credits,state:"credits"},{id:"exit",label:"EXIT",icon:N.exit,state:"exit",danger:!0}];class is{constructor(t){this.state=t,this.container=this._build()}_build(){const t=ss.map(s=>`
      <button
        class="mm-btn ${s.primary?"mm-btn--play":""} ${s.danger?"mm-btn--exit":""}"
        data-state="${s.state}">
        <span class="mm-btn-icon">${s.icon}</span>
        <span class="mm-btn-label">${s.label}</span>
      </button>`).join(""),e=document.createElement("div");return e.className="screen screen-hidden main-menu-screen",e.innerHTML=`
      <header class="mm-topbar">
        <div class="mm-player-badge" id="mm-player-badge"></div>
        <div class="mm-stats" id="mm-stats"></div>
      </header>

      <div class="mm-body">
        <div class="mm-left">
          <div class="mm-logo-area">
            <img src="/TextLogo.png" class="mm-logo-img" alt="WireVerse" draggable="false" />
            <p class="mm-tagline">LEARN. CONNECT. POWER THE FUTURE.</p>
          </div>
          <nav class="mm-nav">${t}</nav>
        </div>

        <div class="mm-right">
          <div class="mm-mascot-wrap">
            <div class="mm-mascot-light"></div>
            <img src="/Mascot.png" alt="Volt" class="mm-mascot-img" draggable="false" />
          </div>
        </div>
      </div>
    `,e.querySelectorAll(".mm-btn").forEach(s=>{s.addEventListener("click",()=>{var i,a,n,r;const o=s.dataset.state;if(o==="exit"){(r=(n=(a=(i=window.Capacitor)==null?void 0:i.Plugins)==null?void 0:a.App)==null?void 0:n.exitApp)==null||r.call(n);return}this.state.setState(o)})}),this._el=e,e}onShow(){const t=O.load(),e=O.getStats(),s=t.playerName||"Player",o=Math.round(e.xpInLevel/e.xpToNext*100),i=O.getExploreProgress(),a=i.outletCount,n=i.switchCount;this._el.querySelector("#mm-player-badge").innerHTML=`
      <span class="mm-player-icon">${N.user}</span>
      <div class="mm-player-info">
        <span class="mm-player-name">${s.toUpperCase()}</span>
        <div class="mm-xp-bar-wrap">
          <div class="mm-xp-bar" style="width:${o}%"></div>
        </div>
      </div>
      <span class="mm-level-badge">LVL ${e.level}</span>
    `,this._el.querySelector("#mm-stats").innerHTML=`
      <div class="mm-stat mm-stat-coins">
        <span class="mm-stat-icon">🪙</span>
        <span class="mm-stat-val">${t.coins}</span>
      </div>
      <div class="mm-stat mm-stat-gems">
        <span class="mm-stat-icon">${N.gem}</span>
        <span class="mm-stat-val">${t.gems}</span>
      </div>
      <div class="mm-stat mm-stat-explore">
        <span class="mm-stat-icon">⚡</span>
        <span class="mm-stat-val">${a+n}/8</span>
      </div>
    `}}let it=null,Ot=null,pt=null,It=null,Tt=null,Nt=null,Xt=0,Se=!1;function he(){return it||(it=new(window.AudioContext||window.webkitAudioContext),It=it.createGain(),Tt=it.createGain(),Nt=it.createGain(),Tt.connect(It),Nt.connect(It),It.connect(it.destination),Ne()),it}function Ne(){const f=O.load().settings||{},t=(f.masterVolume??80)/100,e=(f.sfx??90)/100,s=(f.music??70)/100;It&&(It.gain.value=t),Tt&&(Tt.gain.value=e),Nt&&(Nt.gain.value=s)}function Vt(f,t,e,s=.18){const o=f.sampleRate*t,i=f.createBuffer(1,o,f.sampleRate),a=i.getChannelData(0);for(let c=0;c<o;c++)a[c]=Math.random()*2-1;const n=f.createBufferSource();n.buffer=i;const r=f.createBiquadFilter();r.type="bandpass",r.frequency.value=e,r.Q.value=.8;const l=f.createGain();l.gain.setValueAtTime(s,f.currentTime),l.gain.exponentialRampToValueAtTime(1e-4,f.currentTime+t),n.connect(r),r.connect(l),l.connect(Tt),n.start(),n.stop(f.currentTime+t)}function yt(f,t,e,s="sine",o=.25,i=.01,a=null){const n=f.createOscillator(),r=f.createGain();n.type=s,n.frequency.value=t;const l=a??e*.6;return r.gain.setValueAtTime(0,f.currentTime),r.gain.linearRampToValueAtTime(o,f.currentTime+i),r.gain.setValueAtTime(o,f.currentTime+e-l),r.gain.exponentialRampToValueAtTime(1e-4,f.currentTime+e),n.connect(r),r.connect(Tt),n.start(),n.stop(f.currentTime+e),n}const U={init(){if(Se)return;Se=!0;const f=()=>{he(),it.state==="suspended"&&it.resume()};document.addEventListener("click",f,{once:!0}),document.addEventListener("touchstart",f,{once:!0,passive:!0}),document.addEventListener("keydown",f,{once:!0})},applySettings(){it&&Ne()},play(f,t){try{const e=he();switch(e.state==="suspended"&&e.resume(),f){case"footstep":{if(Xt=(Xt||0)+(t||.016),Xt<.38)return;Xt=0,Vt(e,.055,140+Math.random()*80,.12);break}case"door":{const s=e.createOscillator(),o=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(90,e.currentTime),s.frequency.exponentialRampToValueAtTime(30,e.currentTime+.55),o.gain.setValueAtTime(.18,e.currentTime),o.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+.55),s.connect(o),o.connect(Tt),s.start(),s.stop(e.currentTime+.55),Vt(e,.18,3e3,.06);break}case"interact_click":{yt(e,800,.08,"square",.15,.005,.07);break}case"success":{[392,493.88,587.33].forEach((o,i)=>{setTimeout(()=>yt(e,o,.5,"sine",.18,.02,.35),i*80)});break}case"error":{yt(e,120,.22,"sawtooth",.2,.005,.18);break}case"xp_gain":{yt(e,1200,.14,"sine",.14,.01,.1),setTimeout(()=>yt(e,1600,.12,"sine",.1,.01,.09),80);break}case"breaker_click":{Vt(e,.025,2e3,.22),setTimeout(()=>Vt(e,.1,80,.28),20);break}case"complete":{[261.63,329.63,392,523.25].forEach((o,i)=>{setTimeout(()=>yt(e,o,.7,"sine",.2,.02,.5),i*110)}),setTimeout(()=>{[523.25,659.25,783.99].forEach(o=>yt(e,o,1.2,"sine",.18,.05,.9))},550);break}}}catch{}},startAmbient(){try{const f=he();if(Ot)return;const t=f.createOscillator();t.type="sine",t.frequency.value=60;const e=f.createOscillator();e.type="sine",e.frequency.value=120;const s=f.createBuffer(1,f.sampleRate*2,f.sampleRate),o=s.getChannelData(0);for(let c=0;c<o.length;c++)o[c]=Math.random()*2-1;const i=f.createBufferSource();i.buffer=s,i.loop=!0;const a=f.createBiquadFilter();a.type="lowpass",a.frequency.value=400,pt=f.createGain(),pt.gain.value=0;const n=f.createGain();n.gain.value=.055;const r=f.createGain();r.gain.value=.02;const l=f.createGain();l.gain.value=.03,t.connect(n),n.connect(pt),e.connect(r),r.connect(pt),i.connect(a),a.connect(l),l.connect(pt),pt.connect(Nt),t.start(),e.start(),i.start(),Ot={hum:t,hum2:e,fan:i},pt.gain.linearRampToValueAtTime(1,f.currentTime+2.5)}catch{}},stopAmbient(){try{if(!Ot||!it)return;pt==null||pt.gain.linearRampToValueAtTime(0,it.currentTime+1.2);const f=Ot;Ot=null,setTimeout(()=>{try{f.hum.stop(),f.hum2.stop(),f.fan.stop()}catch{}},1300)}catch{}}},os=[{id:"profile",label:"PROFILE",icon:N.user},{id:"audio",label:"AUDIO",icon:N.audio},{id:"graphics",label:"GRAPHICS",icon:N.graphics},{id:"controls",label:"CONTROLS",icon:N.controls},{id:"language",label:"LANGUAGE",icon:N.language}];class ns{constructor(t){this.state=t,this._data={},this._activeTab="profile",this.container=this._build()}_build(){const t=document.createElement("div");return t.className="screen screen-hidden settings-screen",t.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="stg-back">${N.back}</button>
        <h2 class="hdr-title">SETTINGS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="stg-body">
        <div class="stg-tabs" id="stg-tabs">
          ${os.map((e,s)=>`
            <button class="stg-tab ${s===0?"stg-tab--active":""}" data-tab="${e.id}">
              <span class="stg-tab-icon">${e.icon}</span>
              <span class="stg-tab-label">${e.label}</span>
            </button>`).join("")}
        </div>
        <div class="stg-content" id="stg-content"></div>
      </div>
    `,t.querySelector("#stg-back").addEventListener("click",()=>this.state.setState("menu")),t.querySelector("#stg-tabs").addEventListener("click",e=>{const s=e.target.closest("[data-tab]");s&&(this._activeTab=s.dataset.tab,t.querySelectorAll(".stg-tab").forEach(o=>o.classList.toggle("stg-tab--active",o.dataset.tab===this._activeTab)),this._renderContent(t))}),this._el=t,t}onShow(){this._data={...O.load().settings},this._renderContent()}_renderContent(t){const e=(t||this._el).querySelector("#stg-content");this._activeTab==="profile"?this._renderProfile(e):this._activeTab==="audio"?this._renderAudio(e):e.innerHTML=`<div class="stg-placeholder">${this._activeTab.charAt(0).toUpperCase()+this._activeTab.slice(1)} settings — coming soon</div>`}_renderProfile(t){const e=O.getPlayerName();t.innerHTML=`
      <div class="stg-profile">
        <div class="stg-avatar-wrap">
          <img src="/Mascot.png" class="stg-avatar-img" alt="Avatar" />
          <div class="stg-avatar-glow"></div>
        </div>

        <div class="stg-profile-card">
          <div class="stg-profile-title">PLAYER PROFILE</div>

          <div class="stg-name-row">
            <label class="stg-label">PLAYER NAME</label>
            <div class="stg-name-field">
              <input
                class="stg-name-input"
                id="stg-name-input"
                type="text"
                maxlength="16"
                value="${e}"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>

          <button class="stg-save-btn" id="stg-save-name">
            ${N.check} SAVE NAME
          </button>

          <div class="stg-save-status" id="stg-save-status"></div>
        </div>
      </div>
    `,t.querySelector("#stg-save-name").addEventListener("click",()=>{const s=t.querySelector("#stg-name-input").value.trim();if(!s)return;O.setPlayerName(s);const o=t.querySelector("#stg-save-status");o.textContent="Name saved!",o.className="stg-save-status stg-save-status--ok",setTimeout(()=>{o.textContent="",o.className="stg-save-status"},2e3)})}_renderAudio(t){t.innerHTML=`
      ${this._sliderRow("masterVolume","MASTER VOLUME",this._data.masterVolume)}
      ${this._sliderRow("music","MUSIC",this._data.music)}
      ${this._sliderRow("sfx","SFX",this._data.sfx)}
      ${this._toggleRow("vibration","VIBRATION",this._data.vibration)}
      ${this._toggleRow("tutorialHints","TUTORIAL HINTS",this._data.tutorialHints)}
      ${this._toggleRow("darkMode","DARK MODE",this._data.darkMode)}
      <div class="stg-version">Version 1.0.0</div>
    `,t.querySelectorAll('.stg-row[data-type="slider"]').forEach(e=>{const s=e.querySelector(".stg-slider"),o=e.querySelector(".stg-val"),i=e.dataset.key;s.addEventListener("input",()=>{this._data[i]=Number(s.value),o.textContent=`${s.value}%`,O.saveSettings(this._data),U.applySettings()})}),t.querySelectorAll('.stg-row[data-type="toggle"]').forEach(e=>{const s=e.querySelector(".stg-toggle"),o=e.dataset.key;s.addEventListener("click",()=>{const i=!this._data[o];this._data[o]=i,s.className=`stg-toggle ${i?"stg-toggle--on":"stg-toggle--off"}`,s.textContent=i?"ON":"OFF",O.saveSettings(this._data),U.applySettings()})})}_sliderRow(t,e,s){return`
      <div class="stg-row" data-key="${t}" data-type="slider">
        <label class="stg-label">${e}</label>
        <div class="stg-control"><input class="stg-slider" type="range" min="0" max="100" value="${s}" /></div>
        <span class="stg-val">${s}%</span>
      </div>`}_toggleRow(t,e,s){return`
      <div class="stg-row" data-key="${t}" data-type="toggle">
        <label class="stg-label">${e}</label>
        <div class="stg-control"></div>
        <button class="stg-toggle ${s?"stg-toggle--on":"stg-toggle--off"}">${s?"ON":"OFF"}</button>
      </div>`}}function Ee(){const f=O.load(),t=Object.keys(f.exploreOutlets||{}).length,e=Object.keys(f.exploreSwitches||{}).length,s=f.learnStages||{},o=[s.wireTypes,s.electricianTools,s.wireStripping,s.learnOutlet,s.switchInstallation].filter(Boolean).length;return[{id:"first_fix",name:"First Fix",desc:"Repair your first outlet in the workshop.",cat:"explore",goal:1,progress:Math.min(t,1)},{id:"full_repair",name:"Full Repair",desc:"Fix all 7 outlets in the workshop.",cat:"explore",goal:7,progress:t},{id:"switch_master",name:"Switch Master",desc:"Wire all 5 light switches.",cat:"explore",goal:5,progress:e},{id:"all_clear",name:"All Clear",desc:"Complete every scenario in the workshop.",cat:"mastery",goal:12,progress:t+e},{id:"basics_done",name:"Wire Basics",desc:"Complete Stage 01 — Understand the Basics.",cat:"learning",goal:1,progress:s.wireTypes?1:0},{id:"tools_done",name:"Tool Ready",desc:"Complete Stage 02 — Learn the Tools.",cat:"learning",goal:1,progress:s.electricianTools?1:0},{id:"strip_done",name:"Strip Expert",desc:"Complete Stage 03 — Wire Stripping.",cat:"learning",goal:1,progress:s.wireStripping?1:0},{id:"full_course",name:"Certified Trainee",desc:"Complete all 5 learning stages.",cat:"mastery",goal:5,progress:o}]}const as=["ALL","EXPLORE","LEARNING","MASTERY"],Me={ALL:"⚡",EXPLORE:"🔧",LEARNING:"📚",MASTERY:"🏆"};class rs{constructor(t){this.state=t,this._cat="ALL",this.container=this._build()}_build(){const t=document.createElement("div");return t.className="screen screen-hidden achievements-screen",t.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="ach-back">${N.back}</button>
        <h2 class="hdr-title">ACHIEVEMENTS</h2>
        <div class="hdr-stats" id="ach-stats"></div>
      </header>
      <div class="ach-tabs" id="ach-tabs">
        ${as.map(e=>`<button class="ach-tab ${e==="ALL"?"ach-tab--active":""}" data-cat="${e}">
          <span class="ach-tab-icon">${Me[e]}</span>${e}
        </button>`).join("")}
      </div>
      <div class="ach-list" id="ach-list"></div>
    `,t.querySelector("#ach-back").addEventListener("click",()=>this.state.setState("menu")),t.querySelector("#ach-tabs").addEventListener("click",e=>{const s=e.target.closest("[data-cat]");s&&(this._cat=s.dataset.cat,t.querySelectorAll(".ach-tab").forEach(o=>o.classList.toggle("ach-tab--active",o.dataset.cat===this._cat)),this._renderList(t))}),this._el=t,t}onShow(){const t=Ee(),e=t.filter(s=>s.progress>=s.goal).length;this._el.querySelector("#ach-stats").innerHTML=`<span class="hstat" style="color:#00d4ff;font-size:12px;letter-spacing:.08em;">${e}/${t.length} UNLOCKED</span>`,this._renderList(this._el)}_renderList(t){const e=(t||this._el).querySelector("#ach-list"),s=Ee(),o=this._cat==="ALL"?s:s.filter(i=>i.cat===this._cat.toLowerCase());e.innerHTML=o.map(i=>{const a=Math.min(100,Math.round(i.progress/i.goal*100)),n=i.progress>=i.goal,r=Me[i.cat.toUpperCase()]||"⚡";return`
        <div class="ach-item ${n?"ach-item--done":""}">
          <div class="ach-icon" style="font-size:26px;line-height:1;">${r}</div>
          <div class="ach-info">
            <div class="ach-name">${i.name}${n?' <span style="color:#22c55e;font-size:11px;">✓ UNLOCKED</span>':""}</div>
            <div class="ach-desc">${i.desc}</div>
            <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${a}%"></div></div>
            <div class="ach-prog-label">${i.progress} / ${i.goal}</div>
          </div>
        </div>
      `}).join("")}}const Ce=[{id:"lineman",name:"Lineman's Pliers",cat:"HAND TOOL",emoji:"🔧",color:"#4d8aff",steps:[{phase:"WHAT IS IT",title:"Meet the Lineman's Pliers",tasks:["Look at the flat gripping jaw","See the cutter at the base","Notice the insulated handles"],dialog:"This is a <b>Lineman's Pliers!</b> 🔧 One of the most important tools for any electrician. The flat jaw grips wires tightly, and the base edge cuts them clean!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Gripping & holding wire bundles","Cutting thick copper wire","Twisting wires together"],dialog:"You use it to <b style='color:#ffd000'>grip</b>, <b style='color:#ffd000'>twist</b>, and <b style='color:#ffd000'>cut</b> wires! Every time wires need to be joined in a circuit, this is the tool you'd reach for!",cam:"perspective(500px) scale(1.5) rotateY(-25deg) translateY(-6%)"},{phase:"HOW TO USE",title:"Using it safely",tasks:["Always hold the rubber handles","Grip at the BASE jaw, not the tip","⚠️ Turn OFF the power first!"],dialog:"Hold ONLY the <b style='color:#1fc95a'>rubber handles</b> — never the metal part! Always make sure the power is <b style='color:#ff3355'>OFF</b> before you touch any wire. Safety first, always! 💪",cam:"perspective(500px) scale(1.3) rotateY(20deg) rotateX(-10deg)"}]},{id:"longnose",name:"Long Nose Pliers",cat:"HAND TOOL",emoji:"🤏",color:"#ff9500",steps:[{phase:"WHAT IS IT",title:"Long Nose Pliers",tasks:["Long thin tapered jaws","Great for tight, small spaces","Insulated rubber handles"],dialog:"This is a <b>Long Nose Pliers!</b> 🤏 See those long pointy jaws? They can reach into tiny spots that regular pliers simply can't fit into!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Bending wire into loops & shapes","Reaching into tight spaces","Holding small parts steady"],dialog:"Perfect for <b style='color:#ffd000'>bending wire loops</b> around screw terminals and working in <b style='color:#ffd000'>tight spots</b> inside an outlet box. You'll use this a LOT in circuits!",cam:"perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)"},{phase:"HOW TO USE",title:"Making a wire loop",tasks:["Grab wire end with the tip","Curl clockwise around screw","Loop should close fully"],dialog:"Grab the wire end with the <b style='color:#1fc95a'>tip of the pliers</b>, then curl it <b style='color:#ffd000'>clockwise</b>. That loop hooks perfectly onto screw terminals — like a pro!",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)"}]},{id:"screwdriver",name:"Screwdrivers Set",cat:"HAND TOOL",emoji:"🪛",color:"#ff3355",steps:[{phase:"WHAT IS IT",title:"The Screwdriver Set",tasks:["Phillips head (+) and flathead (−)","Insulated rubber handles (1000V rated)","Different sizes for different screws"],dialog:"This is a <b>Screwdriver Set!</b> 🪛 The red one is <b style='color:#ffd000'>Phillips (+)</b> and the blue one is <b style='color:#4d8aff'>Flathead (−)</b>. Each screw type needs the RIGHT screwdriver!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Tightening terminal screws","Fastening outlets & switches","Opening electrical panels"],dialog:"You use it to <b style='color:#ffd000'>tighten screws</b> on wire terminals, outlets, and switches. A loose screw = a loose wire = <b style='color:#ff3355'>sparks and danger</b>! Always tighten firmly!",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)"},{phase:"HOW TO USE",title:"How to drive a screw",tasks:["Push DOWN firmly before turning","Turn clockwise to tighten","Use the correct size — don't force it!"],dialog:"The trick is: <b style='color:#1fc95a'>push firmly THEN turn</b>. Using the wrong size strips the screw head permanently — then it's stuck forever! Match the screwdriver to the screw. 🎯",cam:"perspective(500px) scale(1.2) rotateY(22deg) rotateX(-6deg)"}]},{id:"stripper",name:"Wire Stripper",cat:"WIRE TOOL",emoji:"✂️",color:"#1fc95a",steps:[{phase:"WHAT IS IT",title:"The Wire Stripper",tasks:["Notched blades match wire sizes","Spring-loaded for easy use","Built-in wire cutter too!"],dialog:"This is a <b>Wire Stripper!</b> ✂️ Those notches on the blade each match a different wire size. It removes the plastic coating (called insulation) from wires — safely and cleanly!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Removing wire insulation","Exposing bare copper inside","Cutting wires to exact length"],dialog:"You need to <b style='color:#ffd000'>expose the copper inside</b> the wire to make a connection. Without bare copper, no electricity can flow — the plastic blocks it!",cam:"perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Stripping a wire",tasks:["Match wire gauge to the notch","Squeeze handles and give a half-turn","Pull toward wire end — plastic pops off!"],dialog:"Find your wire's gauge number, place it in that notch, squeeze, give a <b style='color:#1fc95a'>half turn</b>, then pull toward the wire end. The plastic slides right off — revealing shiny copper! ✨",cam:"perspective(500px) scale(1.3) rotateY(25deg) rotateX(-5deg)"}]},{id:"voltester",name:"Voltage Tester",cat:"TEST TOOL",emoji:"⚡",color:"#ffd000",steps:[{phase:"WHAT IS IT",title:"Non-Contact Voltage Tester",tasks:["Small handheld safety device","Glows AND beeps near live wires","No touching the wire needed!"],dialog:"This is a <b>Voltage Tester!</b> ⚡ It's a safety superhero! It can sense electricity in a wire WITHOUT you touching the wire. Think of it as your personal danger detector!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Checking if a wire is live (dangerous!)","Testing BEFORE you touch anything","Finding which wire has power"],dialog:"Before touching ANY wire, you <b style='color:#ff3355'>ALWAYS</b> test it first! If the tester lights up <b style='color:#ffd000'>yellow/red and beeps</b> — there's live electricity. <b style='color:#ff3355'>DO NOT TOUCH!</b>",cam:"perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)"},{phase:"HOW TO USE",title:"Testing safely",tasks:["Turn it ON first (press the button)","Hold tip NEAR the wire (don't touch)","Beep + light = LIVE. No beep = safe"],dialog:"Hold the tip <b style='color:#1fc95a'>near the wire</b> — no touching! If it beeps: <b style='color:#ff3355'>STEP BACK</b>, go to the breaker box, and turn off the power. Always test first! 🦺",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)"}]},{id:"multimeter",name:"Digital Multimeter",cat:"TEST TOOL",emoji:"📟",color:"#60b0ff",steps:[{phase:"WHAT IS IT",title:"The Multimeter",tasks:["Digital display screen","Rotating selector dial","Two probe cables (red & black)"],dialog:"This is a <b>Digital Multimeter!</b> 📟 It's like the Swiss Army knife of electrical testing — one device that measures voltage, current, AND resistance. Super powerful!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What it measures",tasks:["Voltage (V) — electrical pressure","Current (A) — how much flows","Resistance (Ω) — how much it blocks"],dialog:"Turn the dial to <b style='color:#ffd000'>V</b> for Volts, <b style='color:#4d8aff'>A</b> for Amperes, or <b style='color:#1fc95a'>Ω</b> (Ohm) for Resistance. In WireVerse, you check these numbers to know if your circuit is working!",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Taking a reading",tasks:["Set dial to correct mode (V/A/Ω)","RED probe → positive (+) side","BLACK probe → negative (−) side"],dialog:"<b style='color:#ff3355'>RED probe</b> always goes to the positive (+) side, <b style='color:#6a7a9a'>BLACK probe</b> to negative (−). The number on screen is your measurement. If it says 0 — no power is flowing! 🔍",cam:"perspective(500px) scale(1.3) rotateY(20deg) rotateX(-8deg)"}]},{id:"etape",name:"Electrical Tape",cat:"WIRE TOOL",emoji:"🌀",color:"#ff9500",steps:[{phase:"WHAT IS IT",title:"Electrical Tape",tasks:["Stretchy black PVC vinyl tape","Does NOT conduct electricity","Different colors for wire labeling"],dialog:"This is <b>Electrical Tape!</b> 🌀 It's a special stretchy tape that blocks electricity. This is NOT the same as regular tape — using the wrong tape on wires is extremely dangerous!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Covering exposed copper wire","Insulating wire splices & joints","Color-coding different circuits"],dialog:"Wrap it around <b style='color:#ffd000'>bare copper wire</b> so no one accidentally touches a live wire. Different tape colors (red, black, blue) also help you remember <b style='color:#ffd000'>which wire does what!</b>",cam:"perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Wrapping properly",tasks:["Start BELOW the exposed area","Wrap at 45° angle, overlapping","Minimum 3 full layers!"],dialog:"Start <b style='color:#1fc95a'>below the bare wire</b>, wrap at a <b style='color:#ffd000'>45° angle</b> overlapping half each time. At least <b>3 full layers</b> — stretch slightly as you wrap for a better seal! 💪",cam:"perspective(500px) scale(1.3) rotateY(22deg) rotateX(-5deg)"}]},{id:"breaker",name:"Circuit Breaker",cat:"COMPONENT",emoji:"🔌",color:"#4d8aff",steps:[{phase:"WHAT IS IT",title:"The Circuit Breaker",tasks:["Switch inside the breaker panel","Has ON / OFF / TRIPPED positions","Each circuit gets its own breaker"],dialog:"This is a <b>Circuit Breaker!</b> 🔌 It's the guardian of your electrical system. When too much electricity flows — it automatically <b style='color:#ff3355'>SHUTS OFF</b> to prevent fires and damage!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Protecting wires from overheating","Preventing electrical fires","Cutting power to a single circuit"],dialog:"It's like a <b style='color:#ffd000'>fuse that resets itself!</b> If you plug in too many devices and the wire gets too hot — the breaker TRIPS (turns off). It just saved your home from a fire! 🏠",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-6%)"},{phase:"HOW TO USE",title:"Resetting a tripped breaker",tasks:["Find the tripped breaker (middle position)","Push it fully to OFF first","Then push to ON — it's reset!"],dialog:"If a breaker trips, push it <b style='color:#1fc95a'>fully OFF first</b>, then push it back to ON. But first: unplug some devices! If it keeps tripping, there's a wiring problem — call an electrician! ⚠️",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(-8deg)"}]}];class ls{constructor(t){this.state=t,this._tool=null,this._step=0,this.container=this._build()}_build(){const t=document.createElement("div");return t.className="screen screen-hidden tools-screen",t.innerHTML=`
      <!-- ══ BROWSE VIEW ══ -->
      <div class="tl-view" id="tl-browse">
        <header class="game-header">
          <button class="hdr-back" id="tl-back">${N.back}</button>
          <h2 class="hdr-title">TOOL GUIDE</h2>
          <div class="hdr-right"></div>
        </header>
        <div class="tl-browse-body">
          <div class="tl-tool-list" id="tl-tool-list"></div>
          <div class="tl-browse-mascot">
            <div class="tl-browse-mascot-glow"></div>
            <img src="/Mascot.png" class="tl-mascot-img" alt="Volt" draggable="false" />
          </div>
        </div>
      </div>

      <!-- ══ GUIDE VIEW ══ -->
      <div class="tl-view" id="tl-guide" style="display:none">
        <header class="game-header">
          <button class="hdr-back" id="tl-guide-back">${N.back}</button>
          <h2 class="hdr-title" id="tl-guide-title"></h2>
          <div class="hdr-right tl-step-badge" id="tl-step-badge">1/3</div>
        </header>

        <div class="tl-guide-body">
          <!-- Left: tasks panel -->
          <div class="tl-tasks-panel">
            <div class="tl-panel-label">TASKS</div>
            <div class="tl-tasks-list" id="tl-tasks-list"></div>
            <button class="tl-hint-btn">${N.hint} HINT <span class="tl-hint-badge">2</span></button>
          </div>

          <!-- Center: 3D tool visual -->
          <div class="tl-visual-area">
            <div class="tl-visual-bg"></div>
            <div class="tl-visual-stage" id="tl-visual-stage">
              <div class="tl-visual-glow" id="tl-visual-glow"></div>
              <div class="tl-visual-icon" id="tl-visual-icon"></div>
              <div class="tl-phase-tag" id="tl-phase-tag"></div>
            </div>
            <div class="tl-cam-hint">TAP DIALOG TO ADVANCE</div>
          </div>

          <!-- Right: mascot -->
          <div class="tl-guide-mascot">
            <div class="tl-guide-mascot-glow"></div>
            <img src="/Mascot.png" class="tl-mascot-img" alt="Volt" draggable="false" />
          </div>
        </div>

        <!-- Bottom: Volt's dialog -->
        <div class="tl-dialog" id="tl-dialog">
          <div class="tl-dialog-header">
            <span class="tl-char-name">VOLT</span>
            <div class="tl-dialog-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <p class="tl-dialog-text" id="tl-dialog-text"></p>
          <div class="tl-dialog-footer">
            <button class="tl-skip-btn" id="tl-skip-btn">✕ SKIP</button>
            <button class="tl-next-btn" id="tl-next-btn">TAP TO CONTINUE ▶▶</button>
          </div>
        </div>
      </div>
    `,t.querySelector("#tl-back").addEventListener("click",()=>this.state.setState("menu")),t.querySelector("#tl-guide-back").addEventListener("click",()=>this._goToBrowse()),t.querySelector("#tl-skip-btn").addEventListener("click",()=>this._goToBrowse()),t.querySelector("#tl-next-btn").addEventListener("click",()=>this._nextStep()),t.querySelector("#tl-dialog").addEventListener("click",e=>{e.target.closest(".tl-skip-btn")||this._nextStep()}),this._el=t,t}onShow(){this._goToBrowse()}_goToBrowse(){this._el.querySelector("#tl-browse").style.display="flex",this._el.querySelector("#tl-guide").style.display="none",this._renderBrowse()}_renderBrowse(){const t=this._el.querySelector("#tl-tool-list");t.innerHTML=Ce.map(e=>`
      <button class="tl-tool-card" data-id="${e.id}">
        <div class="tl-tc-icon" style="--tc-col:${e.color}">${e.emoji}</div>
        <div class="tl-tc-info">
          <div class="tl-tc-name">${e.name}</div>
          <div class="tl-tc-cat">${e.cat}</div>
        </div>
        <div class="tl-tc-arrow">${N.back}</div>
      </button>
    `).join(""),t.querySelectorAll(".tl-tool-card").forEach(e=>{e.addEventListener("click",()=>{const s=Ce.find(o=>o.id===e.dataset.id);s&&this._startGuide(s)})})}_startGuide(t){this._tool=t,this._step=0,this._el.querySelector("#tl-browse").style.display="none",this._el.querySelector("#tl-guide").style.display="flex";const e=this._el.querySelector("#tl-visual-icon");e.style.transition="none",e.style.transform="perspective(500px) scale(0.6) rotateY(0deg)",e.textContent=t.emoji,setTimeout(()=>{e.style.transition="",this._renderStep()},60)}_renderStep(){const t=this._tool.steps[this._step],e=this._tool.steps.length;this._el.querySelector("#tl-guide-title").textContent=this._tool.name.toUpperCase(),this._el.querySelector("#tl-step-badge").textContent=`${this._step+1}/${e}`,this._el.querySelector("#tl-phase-tag").textContent=t.phase,this._el.querySelector("#tl-tasks-list").innerHTML=t.tasks.map((i,a)=>`
      <div class="tl-task-item ${a===0?"tl-task--active":""}">
        <span class="tl-task-num">${a+1}</span>
        <span class="tl-task-text">${i}</span>
      </div>
    `).join("");const s=this._el.querySelector("#tl-visual-icon");s.style.transform=t.cam,s.style.color=this._tool.color,this._el.querySelector("#tl-visual-glow").style.background=`radial-gradient(ellipse at 50% 60%, ${this._tool.color}44 0%, ${this._tool.color}11 45%, transparent 70%)`,this._el.querySelector("#tl-dialog-text").innerHTML=t.dialog;const o=this._el.querySelector("#tl-next-btn");o.textContent=this._step>=e-1?"✓  GOT IT!":"TAP TO CONTINUE  ▶▶",o.className=`tl-next-btn ${this._step>=e-1?"tl-next-btn--done":""}`}_nextStep(){const t=this._el.querySelector("#tl-visual-icon");this._step<this._tool.steps.length-1?(t.style.transform="perspective(500px) scale(0.75) rotateY(0deg)",this._step++,setTimeout(()=>this._renderStep(),180)):this._goToBrowse()}}const cs=[{label:"DEVELOPED BY",value:"Volt Games Studio",hl:"blue"},{label:"DESIGN LEAD",value:"Arjun Dev",hl:""},{label:"LEAD DEVELOPER",value:"Neha Sharma",hl:"orange"},{label:"ART DIRECTOR",value:"Ravi Patel",hl:"orange"},{label:"SPECIAL THANKS",value:"To all our players and supporters!",hl:""}];class hs{constructor(t){this.state=t,this.container=this._build()}_build(){const t=cs.map(s=>`
      <div class="crd-row">
        <span class="crd-label">${s.label}</span>
        <span class="crd-value ${s.hl?"crd-hl-"+s.hl:""}">${s.value}</span>
      </div>`).join(""),e=document.createElement("div");return e.className="screen screen-hidden credits-screen",e.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="crd-back">${N.back}</button>
        <h2 class="hdr-title">CREDITS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="crd-body">
        <div class="crd-top">
          ${qe("clamp(36px,8vw,56px)")}
          <div class="crd-mascot">
            <img src="/Mascot.png" alt="Volt" draggable="false" />
          </div>
        </div>
        <div class="crd-list">${t}</div>
      </div>
    `,e.querySelector("#crd-back").addEventListener("click",()=>this.state.setState("menu")),e}}const de=[{id:"wireTypes",state:"wireTypes",module:"MODULE 1",title:"WIRE TYPES",desc:"Learn the 5 wire types used in Philippine homes — THHN, NM-B, TW, BX, and UF-B. What they are, where they go, and why it matters.",pills:[["⚡","5 Wire Types","Know them all"],["🛡","Safe & Reliable","Install with confidence"],["✓","Real-World Ready","Apply what you learn"]],colorA:"#00d4ff",colorB:"#2dc653",icon:"🔌",requires:null},{id:"wireStripping",state:"wireStripping",module:"MODULE 2",title:"WIRE STRIPPING",desc:"Master the four tools used to strip wire insulation — manual, automatic, utility knife, and rotary. When to use each and how.",pills:[["✂","4 Tools","Every tool, every time"],["🎯","Use It Right","When, why, how"],["📊","Build the Habit","Precision. Safety. Efficiency."]],colorA:"#cc44ff",colorB:"#ff4444",icon:"✂",requires:null}],ds=`
@keyframes lh-fade-up{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

/* ── ROOT ─────────────────────────────────────────────────── */
.lh{position:absolute;inset:0;display:flex;flex-direction:column;background:#070d1c;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── HEADER ─────────────────────────────────────────────── */
.lh-top{
  height:58px;flex-shrink:0;
  background:rgba(4,8,20,.98);
  border-bottom:1px solid rgba(0,212,255,.12);
  display:flex;align-items:center;padding:0 14px;gap:10px;
  box-shadow:0 2px 18px rgba(0,0,0,.55);
}
.lh-back{
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.26);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;
  padding:8px 13px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:all .15s;touch-action:manipulation;white-space:nowrap;
}
.lh-back:active{transform:scale(.93);}
.lh-title-wrap{flex:1;text-align:center;}
.lh-title{font-size:18px;font-weight:900;letter-spacing:4px;color:#fff;}
.lh-title-sub{font-size:8px;letter-spacing:3px;color:rgba(0,212,255,.45);margin-top:1px;}
.lh-badge{
  background:rgba(45,198,83,.08);border:1px solid rgba(45,198,83,.3);
  border-radius:8px;padding:5px 9px;
  font-size:10px;font-weight:800;color:#2dc653;letter-spacing:.5px;white-space:nowrap;text-align:center;
}
.lh-badge-label{font-size:8px;color:rgba(45,198,83,.6);margin-top:1px;letter-spacing:1px;}

/* ── SCROLL BODY ─────────────────────────────────────────── */
.lh-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px 0;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.lh-body::-webkit-scrollbar{display:none;}

/* ── MODULE CARD ─────────────────────────────────────────── */
.lh-card{
  border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);
  background:rgba(6,12,28,.9);position:relative;cursor:pointer;
  -webkit-tap-highlight-color:transparent;transition:transform .14s;
  display:flex;flex-direction:row;min-height:200px;
  animation:lh-fade-up .32s ease-out both;margin-bottom:14px;
}
.lh-card:active{transform:scale(.977);}
.lh-card.locked{opacity:.5;cursor:not-allowed;}
.lh-card.locked:active{transform:none;}

/* Image column (left ~42%) */
.lh-card-img{
  width:42%;flex-shrink:0;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.lh-card-img-bg{position:absolute;inset:0;}
.lh-card-img-icon{font-size:52px;position:relative;z-index:1;filter:drop-shadow(0 4px 20px rgba(0,0,0,.6));}

/* Info column (right) */
.lh-card-info{flex:1;padding:16px 14px 14px;display:flex;flex-direction:column;position:relative;}
.lh-card-mod{font-size:9px;font-weight:800;letter-spacing:3px;margin-bottom:4px;}
.lh-card-title{font-size:24px;font-weight:900;letter-spacing:1.5px;color:#fff;line-height:1.1;margin-bottom:4px;}
.lh-card-rule{height:2px;width:36px;border-radius:99px;margin-bottom:8px;}
.lh-card-desc{font-size:11.5px;color:rgba(255,255,255,.52);line-height:1.55;margin-bottom:10px;flex:1;}

/* Feature pills */
.lh-card-pills{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;}
.lh-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:7px;padding:5px 8px;}
.lh-pill-icon{font-size:11px;width:16px;text-align:center;}
.lh-pill-name{font-size:10px;font-weight:700;color:rgba(255,255,255,.6);}
.lh-pill-sub{font-size:9px;color:rgba(255,255,255,.3);margin-left:auto;}

/* Arrow / status */
.lh-card-arrow{position:absolute;top:14px;right:14px;font-size:18px;font-weight:700;}
.lh-done-badge{
  position:absolute;top:10px;right:10px;
  background:rgba(45,198,83,.14);border:1px solid rgba(45,198,83,.5);
  border-radius:7px;padding:3px 9px;font-size:8px;font-weight:800;letter-spacing:2px;color:#2dc653;
}

/* ── BOTTOM BAR ──────────────────────────────────────────── */
.lh-bottom{
  flex-shrink:0;padding:14px 14px 18px;
  background:rgba(4,8,20,.95);border-top:1px solid rgba(255,255,255,.06);
  display:flex;align-items:center;gap:12px;
}
.lh-bottom-icon{
  width:44px;height:44px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#ff9f1c,#ff6600);
  display:flex;align-items:center;justify-content:center;font-size:20px;
  box-shadow:0 0 14px rgba(255,150,0,.3);
}
.lh-bottom-text{flex:1;}
.lh-bottom-title{font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;}
.lh-bottom-sub{font-size:10px;color:rgba(255,255,255,.38);margin-top:1px;}
.lh-progress-btn{
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.3);
  border-radius:9px;padding:8px 13px;
  font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;
  color:#00d4ff;letter-spacing:.5px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  display:flex;align-items:center;gap:5px;white-space:nowrap;touch-action:manipulation;
  transition:all .15s;
}
.lh-progress-btn:active{transform:scale(.93);}
`;function ps(){if(document.querySelector("#lh-css"))return;const f=document.createElement("style");f.id="lh-css",f.textContent=ds,document.head.appendChild(f)}class us{constructor(t){this.state=t,this.container=this._build()}_build(){ps();const t=document.createElement("div");return t.className="screen screen-hidden",t.innerHTML=`
      <div class="lh">
        <header class="lh-top">
          <button class="lh-back">← MENU</button>
          <div class="lh-title-wrap">
            <div class="lh-title">⚡ LEARN</div>
            <div class="lh-title-sub">BUILD KNOWLEDGE. BUILD CONFIDENCE.</div>
          </div>
          <div class="lh-badge" id="lh-badge">
            <div>0/2</div>
            <div class="lh-badge-label">Completed</div>
          </div>
        </header>
        <div class="lh-body" id="lh-body"></div>
        <div class="lh-bottom">
          <div class="lh-bottom-icon">⚡</div>
          <div class="lh-bottom-text">
            <div class="lh-bottom-title">KEEP LEARNING. KEEP GROWING.</div>
            <div class="lh-bottom-sub">Every skill you build today, powers your future.</div>
          </div>
          <button class="lh-progress-btn">PROGRESS 📊</button>
        </div>
      </div>`,t.querySelector(".lh-back").addEventListener("click",()=>this.state.setState("menu")),this._el=t,t}_renderCards(t){const e=de.filter(o=>!!t[o.id]).length;this._el.querySelector("#lh-badge").innerHTML=`
      <div>${e}/${de.length}</div>
      <div class="lh-badge-label">Completed</div>`;const s=this._el.querySelector("#lh-body");s.innerHTML=de.map((o,i)=>{const a=!!t[o.id],n=o.requires&&!t[o.requires],r=o.pills.map(([l,c,h])=>`
        <div class="lh-pill">
          <span class="lh-pill-icon">${l}</span>
          <span class="lh-pill-name">${c}</span>
          <span class="lh-pill-sub">${h}</span>
        </div>`).join("");return`
        <div class="lh-card ${n?"locked":""}"
             data-state="${o.state}"
             style="animation-delay:${(i*.1).toFixed(2)}s;">
          <div class="lh-card-img">
            <div class="lh-card-img-bg"
                 style="background:linear-gradient(135deg,${o.colorA}22,${o.colorB}14)"></div>
            <div class="lh-card-img-icon">${o.icon}</div>
          </div>
          <div class="lh-card-info">
            ${a?'<div class="lh-done-badge">COMPLETED ✓</div>':`<div class="lh-card-arrow" style="color:${o.colorA}">›</div>`}
            <div class="lh-card-mod" style="color:${o.colorA}">${o.module}</div>
            <div class="lh-card-title">${o.title}</div>
            <div class="lh-card-rule" style="background:linear-gradient(90deg,${o.colorA},${o.colorB})"></div>
            <div class="lh-card-desc">${o.desc}</div>
            <div class="lh-card-pills">${r}</div>
          </div>
        </div>`}).join(""),s.querySelectorAll(".lh-card:not(.locked)").forEach(o=>{o.addEventListener("click",()=>this.state.setState(o.dataset.state))})}onShow(){this._renderCards(O.getLessonProgress())}}function fs(){const f=document.createElement("canvas");f.width=512,f.height=512;const t=f.getContext("2d"),e=t.createLinearGradient(0,0,512,512);e.addColorStop(0,"#4a2e12"),e.addColorStop(.3,"#5c3a18"),e.addColorStop(.7,"#4e321a"),e.addColorStop(1,"#3d2610"),t.fillStyle=e,t.fillRect(0,0,512,512);for(let i=0;i<80;i++){let a=0,n=Math.random()*512;for(t.beginPath(),t.moveTo(a,n);a<512;)a+=8+Math.random()*18,n+=(Math.random()-.5)*10,t.lineTo(a,n);const r=Math.random()>.4;t.strokeStyle=r?`rgba(0,0,0,${.04+Math.random()*.18})`:`rgba(255,200,120,${.015+Math.random()*.06})`,t.lineWidth=.4+Math.random()*2.2,t.stroke()}for(let i=0;i<3;i++){const a=60+Math.random()*390,n=60+Math.random()*390,r=12+Math.random()*22,l=t.createRadialGradient(a,n,0,a,n,r*2.4);l.addColorStop(0,"rgba(15,7,2,0.75)"),l.addColorStop(.45,"rgba(28,14,6,0.45)"),l.addColorStop(1,"transparent"),t.fillStyle=l,t.beginPath(),t.ellipse(a,n,r*1.6,r,Math.random()*.6,0,Math.PI*2),t.fill();for(let c=0;c<10;c++){const h=c/10*Math.PI*2;t.beginPath(),t.moveTo(a+Math.cos(h)*r,n+Math.sin(h)*r),t.bezierCurveTo(a+Math.cos(h)*r*2.2,n+Math.sin(h)*r*2.2,a+Math.cos(h+.35)*r*3.5,n+Math.sin(h+.35)*r*3.5,a+Math.cos(h+.6)*r*5,n+Math.sin(h+.6)*r*5),t.strokeStyle="rgba(0,0,0,0.1)",t.lineWidth=.8,t.stroke()}}const s=t.createRadialGradient(256,256,120,256,256,380);s.addColorStop(0,"transparent"),s.addColorStop(1,"rgba(0,0,0,0.3)"),t.fillStyle=s,t.fillRect(0,0,512,512);const o=new ft(f);return o.wrapS=o.wrapT=te,o.repeat.set(4,2.5),o}function gs(){const f=document.createElement("canvas");f.width=256,f.height=256;const t=f.getContext("2d");t.fillStyle="#1c1c1e",t.fillRect(0,0,256,256);const e=18;for(let o=e;o<256;o+=e)for(let i=e;i<256;i+=e)t.beginPath(),t.arc(o,i,2.8,0,Math.PI*2),t.fillStyle="#0a0a0c",t.fill(),t.beginPath(),t.arc(o-.8,i-.8,1.4,0,Math.PI*2),t.fillStyle="rgba(255,255,255,0.04)",t.fill();for(let o=0;o<60;o++)t.beginPath(),t.moveTo(Math.random()*256,Math.random()*256),t.lineTo(Math.random()*256,Math.random()*256),t.strokeStyle=`rgba(0,0,0,${.02+Math.random()*.06})`,t.lineWidth=Math.random()*1.5,t.stroke();const s=new ft(f);return s.wrapS=s.wrapT=te,s.repeat.set(5,2.5),s}function ms(){const f=document.createElement("canvas");f.width=512,f.height=512;const t=f.getContext("2d");t.fillStyle="#1e1e20",t.fillRect(0,0,512,512);for(let s=0;s<3e3;s++)t.beginPath(),t.arc(Math.random()*512,Math.random()*512,.4+Math.random()*1.8,0,Math.PI*2),t.fillStyle=Math.random()>.5?`rgba(255,255,255,${.015+Math.random()*.04})`:`rgba(0,0,0,${.04+Math.random()*.09})`,t.fill();t.strokeStyle="rgba(0,0,0,0.22)",t.lineWidth=1.5,[128,256,384].forEach(s=>{t.beginPath(),t.moveTo(s,0),t.lineTo(s,512),t.stroke(),t.beginPath(),t.moveTo(0,s),t.lineTo(512,s),t.stroke()});const e=new ft(f);return e.wrapS=e.wrapT=te,e.repeat.set(6,4),e}function ie(f,t={}){const{benchY:e=-.64,benchW:s=12,benchD:o=5.5,benchH:i=.3}=t,a=e+i/2,n=e-i/2,r=1.45,l=n-r,c=fs(),h=new g({map:c,color:6963232,roughness:.82,metalness:0}),d=new g({color:2758152,roughness:.92}),u=new g({color:6710903,roughness:.28,metalness:.88}),w=new g({color:2236979,roughness:.45,metalness:.75}),b=new g({color:4006416,roughness:.9}),_=new p(new y(s,i,o),h);_.position.y=e,_.receiveShadow=!0,_.castShadow=!0,f.add(_);const v=new p(new y(s,.055,.1),d);v.position.set(0,a-.01,o/2+.01),f.add(v),[-1,1].forEach(K=>{const dt=new p(new y(.06,i+.01,o),d);dt.position.set(K*(s/2+.03),e,0),f.add(dt)});const E=s/2-.35,M=o/2-.35;[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([K,dt])=>{const St=new p(new y(.22,r,.22),b);St.position.set(K*E,n-r/2,dt*M),St.castShadow=!0,St.receiveShadow=!0,f.add(St)});const S=new p(new y(s-.8,.1,.1),b);S.position.set(0,n-r*.55,M),f.add(S);const x=new p(new kt(22,14),new g({map:ms(),roughness:.95,metalness:0,color:2105378}));x.rotation.x=-Math.PI/2,x.position.y=l,x.receiveShadow=!0,f.add(x);const T=5.5,C=new g({map:gs(),color:1710620,roughness:.94,metalness:0}),I=new p(new kt(s+4,T),C);I.position.set(0,n-r+T/2,-(o/2)-.05),I.receiveShadow=!0,f.add(I);const z=new p(new y(s+4,.14,.06),new g({color:1118483,roughness:.95}));z.position.set(0,l+.07,-(o/2)-.02),f.add(z);const L=-s/2+.9,P=o/2-.5,H=new p(new y(.68,.1,.62),u);H.position.set(L,a+.05,P-.1),f.add(H);const F=new p(new y(.65,.42,.14),u);F.position.set(L,a+.25,P-.38),f.add(F);const Y=new p(new y(.65,.42,.14),w);Y.position.set(L,a+.25,P-.05),f.add(Y);const B=new p(new k(.032,.032,.55,10),u);B.rotation.x=Math.PI/2,B.position.set(L,a+.18,P-.22),f.add(B);const q=new p(new k(.018,.018,.6,8),u);q.rotation.z=Math.PI/2,q.position.set(L,a+.18,P+.15),f.add(q),[-.28,.28].forEach(K=>{const dt=new p(new gt(.038,8,8),w);dt.position.set(L+K,a+.18,P+.15),f.add(dt)});const j=document.createElement("canvas");j.width=256,j.height=32;const wt=j.getContext("2d");wt.fillStyle="#e8c842",wt.fillRect(0,0,256,32),wt.fillStyle="#1a1a00";for(let K=0;K<=30;K++){const dt=K*8.533333333333333,St=K%5===0?20:K%2===0?14:9;wt.fillRect(dt-.5,0,1,St),K%5===0&&(wt.font="10px monospace",wt.fillText(String(K),dt-4,30))}const Dt=new ft(j),Ft=new p(new y(3.8,.025,.18),new g({map:Dt,roughness:.6}));Ft.position.set(s/2-2.5,a+.012,-1.8),f.add(Ft);const G=s/2-.8,W=new p(new D(.32,.1,10,30),new g({color:1710638,roughness:.65,metalness:.05}));W.rotation.y=Math.PI/2,W.position.set(G,a+.32,-1),f.add(W);const tt=new p(new k(.18,.18,.22,16),new g({color:13928762,roughness:.4,metalness:.7}));tt.rotation.z=Math.PI/2,tt.position.copy(W.position),f.add(tt);const et=s/2-1.5,vt=-o/2+.5,xe=new g({color:3355460,roughness:.5,metalness:.8}),ve=new p(new y(.14,.14,.14),w);ve.position.set(et,a+2.8,-(o/2)-0),f.add(ve);const ye=new p(new k(.025,.025,1.8,8),xe);ye.position.set(et,a+1.9,-(o/2)+.1),f.add(ye);const ne=new p(new k(.022,.022,2,8),xe);ne.rotation.z=Math.PI/2,ne.position.set(et-1,a+2.8,vt),f.add(ne);const bt=new p(new Jt(.44,.36,18,1,!0),new g({color:1842208,roughness:.8,metalness:.55,side:ge}));bt.rotation.x=Math.PI,bt.position.set(et-2,a+2.4,vt),f.add(bt);const ae=new p(new Jt(.4,.32,18,1,!0),new g({color:16771232,emissive:16771232,emissiveIntensity:.55,side:We}));ae.rotation.x=Math.PI,ae.position.copy(bt.position),f.add(ae);const jt=new p(new gt(.055,8,8),new g({color:16775376,emissive:16775376,emissiveIntensity:3.5}));jt.position.set(bt.position.x,bt.position.y+.08,bt.position.z),f.add(jt);const ot=new At(16769168,4.5);ot.position.copy(jt.position),ot.target.position.set(bt.position.x,a,vt+.5),ot.angle=.52,ot.penumbra=.38,ot.decay=1.6,ot.castShadow=!0,ot.shadow.mapSize.set(1024,1024),ot.shadow.bias=-.002,f.add(ot),f.add(ot.target);const re=new V(16746547,.7,6);return re.position.copy(jt.position),f.add(re),{spotLight:ot,lampFill:re}}function oe(f){f.add(new Re(2241450,1707524,.55));const t=new ht(16774880,2);t.position.set(5,12,6),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),t.shadow.camera.left=-10,t.shadow.camera.right=10,t.shadow.camera.top=8,t.shadow.camera.bottom=-8,t.shadow.bias=-.001,f.add(t);const e=new ht(3368703,.3);return e.position.set(-7,4,-5),f.add(e),{sun:t,rim:e}}const pe=[{id:"red",col:13378082,hex:"#cc2222",lbl:"RED",role:"HOT",z:-1},{id:"white",col:14211288,hex:"#d8d8d8",lbl:"WHITE",role:"NEUTRAL",z:0},{id:"green",col:1744452,hex:"#1a9e44",lbl:"GREEN",role:"GROUND",z:1}],Ut=[{id:"THHN",col:1710638,hex:"#1a1a2e",lbl:"THHN",tag:"Inside conduit · 90°C",r:.12,shape:"round"},{id:"NMB",col:10526880,hex:"#a0a0a0",lbl:"NM-B",tag:"Dry indoor walls only",r:.18,shape:"flat"},{id:"TW",col:2250171,hex:"#2255bb",lbl:"TW",tag:"Older buildings · 60°C",r:.12,shape:"round"},{id:"BX",col:8947840,hex:"#888880",lbl:"BX",tag:"Exposed areas · Armored",r:.15,shape:"armored"},{id:"UFB",col:5075008,hex:"#4d7040",lbl:"UF-B",tag:"Direct burial only",r:.22,shape:"thick"}],Qt=[{q:"What type of wire is this? It has a spiral metal armor around it.",vis:"bx",opts:["THHN","UF-B","BX Armored","Romex (NM-B)"],ans:2,hint:"The spiral metal armor is the signature of BX cable — designed to protect against physical damage."},{q:"What does a RED wire mean?",vis:"red",opts:["Ground — safety wire","Neutral — return path","Hot — 220V live electricity","Depends on country"],ans:2,hint:"Red = HOT. 220 volts. Always treat a red wire as live even when you think the power is off."},{q:"Power needs to run buried underground from the house to a garden lamp. Which wire?",vis:"ufb",opts:["THHN","Romex (NM-B)","TW wire","UF-B"],ans:3,hint:"Only UF-B is rated for direct burial. Soil and moisture would destroy the others."},{q:"Your air conditioner needs 20 amps. Which wire do you choose?",vis:"awg",opts:["AWG 14 — thinner (15A max)","AWG 12 — thicker (20A max)"],ans:1,hint:"AWG 12 handles 20 amps. AWG 14 only handles 15. Wrong choice means overheating and risk of fire."},{q:"Someone is about to touch a white neutral wire without testing it. Is this safe?",vis:"white",opts:["Yes — white is neutral so it is safe","No — always test any wire before touching"],ans:1,hint:"Neutral wires can carry fault current during electrical faults. Always test any wire before touching."}],nt=[{t:"info",ch:0,chLbl:"WIRE TYPES",cam:{p:[4,3,8],t:[0,0,0]},scene:"empty",mascotIn:!0,text:"Before you touch a single wire in real life — you need to know what you are looking at. Because not all wires are the same. Pick the wrong one and at best the job fails. At worst someone gets hurt.",btn:"NEXT"},{t:"info",ch:0,chLbl:"WIRE TYPES",cam:{p:[4,3,8],t:[0,0,0]},scene:"empty",text:"I am going to show you five wires today. By the end you will know what each one is, where it goes, and why it exists. Ready?",btn:"LET'S GO"},{t:"info",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2.5,5.5],t:[0,-.1,0]},scene:"wire_drop",text:"Let us start here. This is a wire. Looks simple. But it is actually three things built on top of each other.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:-1,text:"The wire slices open — like cutting through a sausage. Three layers. Each one has a completely different job.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:0,layerName:"COPPER",layerHex:"#b87333",text:"COPPER — the center. This is what carries electricity. Copper conducts current better than almost any other affordable metal. Without this, nothing works.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:1,layerName:"INSULATION",layerHex:"#3355cc",text:"INSULATION — wrapped around the copper. Plastic. Its job is to stop electricity from escaping. Two bare copper wires touching causes a short circuit. The insulation stops that.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:2,layerName:"JACKET",layerHex:"#666666",text:"JACKET — the outer layer. Tougher plastic. Protects everything inside from physical damage — scraping, bending, heat, moisture.",btn:"NEXT"},{t:"info",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2.5,5.5],t:[0,-.1,0]},scene:"wire_single",text:"Copper carries. Insulation contains. Jacket protects. Every wire you ever see is built this way.",btn:"NEXT CHAPTER"},{t:"info",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,3.5,7.5],t:[0,-.4,0]},scene:"color_wires",text:"Before we look at the five wire types — I need to teach you something that could save your life. The color of a wire is a message. It tells every electrician what that wire is doing. Get this wrong and you are in serious danger.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[-1.5,1.5,3.5],t:[-1,-.2,0]},scene:"color_wires",focus:"red",text:"RED means HOT. This wire carries live electricity — 220 volts. If you touch this wire while power is on, you will get a shock that can stop your heart. Every electrician treats a red wire as live. Even when they think the power is off.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,1.5,3.5],t:[0,-.2,0]},scene:"color_wires",focus:"white",text:"WHITE means NEUTRAL. This wire is the return path. Electricity goes out on the red wire and comes back home on the white wire. Less dangerous than red — but not safe to touch either. During a fault it can carry current too.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[1.5,1.5,3.5],t:[1,-.2,0]},scene:"color_wires",focus:"green",text:"GREEN means GROUND. This wire does not carry electricity under normal conditions. But if something goes wrong — if electricity leaks where it should not — the green wire catches it and sends it safely into the earth. It is the reason a faulty appliance trips the breaker instead of shocking you.",btn:"NEXT"},{t:"info",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"color_wires",text:`Red — hot. White — neutral. Green — ground.

Say that in your head twice. You will use it forever.`,btn:"NEXT"},{t:"cquiz",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,1.4,3.2],t:[0,-.5,0]},scene:"color_wires",text:"Quick check. I will call the role — you tap the correct wire on the workbench.",btn:null},{t:"info",ch:3,chLbl:"CH.3 WIRE TYPES",cam:{p:[0,3.5,7.5],t:[0,-.3,0]},scene:"wt_slots",text:"Now. The five wires. Each one has a specific job. A specific place where it belongs. Using the wrong wire in the wrong place is a code violation — and a safety hazard.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — THHN",wti:0,cam:{p:[-2.5,2.2,5.5],t:[-2,-.2,0]},scene:"wt_show",active:0,text:"THHN — the most common wire in the Philippines. Any new building, any new home — this is what is running through the walls. It is the standard.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — THHN",wti:0,cam:{p:[-2.5,1.8,4.2],t:[-2,-.2,0]},scene:"wt_show",active:0,text:"THHN lives inside conduit — those grey tubes running along ceilings and walls. The conduit is the road. THHN is the car inside it. Handles heat up to 90°C. Always inside conduit. That is the rule.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — NM-B",wti:1,cam:{p:[-1.2,2.2,5.5],t:[-1,-.2,0]},scene:"wt_show",active:1,text:"NM-B — also called Romex. Look at it — fatter than THHN. That is because it bundles three wires in one sheath — black (hot), white (neutral), and bare copper (ground). Three wires, one package.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — NM-B",wti:1,cam:{p:[-1.2,1.8,4.2],t:[-1,-.2,0]},scene:"wt_show",active:1,text:"Romex is used inside walls — behind drywall, in dry indoor spaces. Much faster to run one cable than three. But never outside. Never in wet locations. Inside the wall. Dry location. That is all.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — TW",wti:2,cam:{p:[.2,2.2,5.5],t:[0,-.2,0]},scene:"wt_show",active:2,text:"TW wire — the older version of what we use today. It works. But it has a lower heat rating — only 60°C instead of 90. You will see TW in homes built 20 to 30 years ago. Not bad wire. Just know its limits.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — BX",wti:3,cam:{p:[1.2,2.2,5.5],t:[1,-.2,0]},scene:"wt_show",active:3,text:"BX cable — Armored Cable. That spiral is real metal. It protects the wires inside from physical damage. You can step on this. Hit it with tools. It survives things that would destroy THHN or Romex.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — BX",wti:3,cam:{p:[1.2,1.8,4.2],t:[1,-.2,0]},scene:"wt_show",active:3,text:"Use BX where the wire will be exposed — not inside walls. Workshops. Factories. Garages. The metal armor also acts as a ground path — extra safety built right in.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — UF-B",wti:4,cam:{p:[2.5,2.2,5.5],t:[2,-.2,0]},scene:"wt_show",active:4,text:"UF-B — Underground Feeder Cable. Every other wire today — THHN, Romex, TW, BX — cannot be buried in the ground. Soil and moisture would destroy them. UF-B is designed specifically for direct burial with no conduit.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — UF-B",wti:4,cam:{p:[2.5,1.8,4.2],t:[2,-.2,0]},scene:"wt_show",active:4,text:"It is filled with a solid waterproof compound — water cannot penetrate it. Use it to bring power to outdoor lights, gate motors, garden sockets. Bury at least 300mm below the surface.",btn:"NEXT CHAPTER"},{t:"info",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[0,3,6.5],t:[0,-.3,0]},scene:"awg_pair",text:"One more thing before the test. Wire thickness matters just as much as wire type. A thin wire carrying too much current is how fires start. Thickness is measured in AWG — American Wire Gauge. Bigger number = thinner wire. It is backwards. It has been this way for 100 years.",btn:"NEXT"},{t:"awg14",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[-1.5,1.8,4],t:[-1,-.3,0]},scene:"awg_pair",hl:"awg14",text:"AWG 14 — thinner wire — handles 15 amps. Normal wall outlets. Lights. Fans. Phone chargers. Everyday household loads.",btn:"NEXT"},{t:"awg12",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[1.5,1.8,4],t:[1,-.3,0]},scene:"awg_pair",hl:"awg12",text:"AWG 12 — thicker wire — handles 20 amps. Air conditioners. Kitchen appliances. Water heaters. Anything that pulls serious power.",btn:"NEXT"},{t:"fire",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[0,2.5,5.5],t:[0,-.2,0]},scene:"awg_fire",text:"Match the wrong wire to the wrong load and the wire overheats. Insulation melts. Fire. Every time. Match the wire to the load. Always.",btn:"TAKE THE TEST"},{t:"qintro",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"bench_clean",text:"Five questions. One at a time. Take your time — you have learned all of this.",btn:"START"},...Qt.map((f,t)=>({t:"quiz",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"quiz",qi:t})),{t:"done",ch:7,chLbl:"COMPLETE",cam:{p:[5,4,9],t:[0,-.2,0]},scene:"wt_all",text:"That is wire types. You now know what is inside a wire, what the colors mean, which wire goes where, and how thickness affects safety. This is the foundation. Everything else in electrical work builds on this.",btn:"FINISH"}],ws=`
.wtl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

/* TOP BAR */
.wtl-top{height:48px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:center;padding:0 12px;gap:10px;flex-shrink:0;}
.wtl-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wtl-top-center{flex:1;text-align:center;}
.wtl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#00d4ff;display:block;}
.wtl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

/* 3D SCENE */
.wtl-scene{height:44vh;min-height:200px;max-height:340px;position:relative;flex-shrink:0;background:#07101f;overflow:hidden;}
.wtl-canvas{display:block;}
.wtl-tap-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(0,212,255,.85);letter-spacing:2px;pointer-events:none;animation:wtlPulse 1.2s ease-in-out infinite;background:rgba(4,10,24,.75);padding:5px 14px;border-radius:20px;border:1px solid rgba(0,212,255,.3);white-space:nowrap;}
@keyframes wtlPulse{0%,100%{opacity:.45;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.03)}}

/* CROSS-SECTION OVERLAY */
.wtl-cross-overlay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(7,16,31,.92);backdrop-filter:blur(2px);}
.wtl-cross-overlay.show{display:flex;}
.wtl-cross-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;}
.wtl-cross-canvas{border-radius:50%;display:block;}
.wtl-cross-labels{display:flex;gap:18px;justify-content:center;}
.wtl-cross-tag{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:1px;padding:3px 10px;border-radius:12px;border:1px solid currentColor;transition:all .3s;}

/* FEEDBACK */
.wtl-feedback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .1s;}
.wtl-feedback.show{opacity:1;}
.wtl-fb{font-size:88px;line-height:1;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 0 22px rgba(255,255,255,.5));}
@keyframes wtlPop{from{transform:scale(0) rotate(-15deg)}to{transform:scale(1) rotate(0)}}

/* WT BADGE */
.wtl-wt-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(4,10,24,.9);border-radius:12px;padding:6px 16px;text-align:center;display:none;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(0,212,255,.25);}
.wtl-wt-badge.show{display:block;}
.wtl-wt-badge-name{font-size:18px;font-weight:900;letter-spacing:2px;color:#fff;}
.wtl-wt-badge-tag{font-family:'Share Tech Mono',monospace;font-size:9px;color:#00d4ff;letter-spacing:1px;}

/* COLOR QUIZ PROMPT */
.wtl-cquiz-prompt{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(4,10,24,.96);border-radius:16px;padding:16px 24px;text-align:center;display:none;backdrop-filter:blur(6px);border:1px solid rgba(0,212,255,.3);}
.wtl-cquiz-prompt.show{display:block;animation:wtlPop .3s cubic-bezier(.34,1.56,.64,1);}
.wtl-cquiz-role{font-size:28px;font-weight:900;letter-spacing:3px;margin-bottom:4px;}
.wtl-cquiz-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.5);letter-spacing:2px;}
.wtl-cquiz-prog{display:flex;gap:6px;justify-content:center;margin-top:10px;}
.wtl-cquiz-pip{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.15);transition:background .3s;}
.wtl-cquiz-pip.done{background:#2dc653;}
.wtl-cquiz-pip.active{background:#00d4ff;}

/* DIALOG AREA */
.wtl-dialog{flex:1;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;min-height:0;}
.wtl-bubble{background:rgba(8,18,42,.98);border:1px solid rgba(0,212,255,.18);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;flex:1;overflow:hidden;}
.wtl-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,212,255,.35);flex-shrink:0;
  transform:translateX(60px);opacity:0;transition:transform .55s cubic-bezier(.25,.46,.45,.94),opacity .55s;}
.wtl-avatar.entered{transform:translateX(0);opacity:1;}
.wtl-bubble-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.wtl-bubble-name{font-family:'Share Tech Mono',monospace;font-size:9px;color:#00d4ff;letter-spacing:3px;display:flex;align-items:center;gap:6px;}
.wtl-wave{display:flex;gap:2px;align-items:center;}
.wtl-wave span{width:2px;border-radius:2px;background:#00d4ff;animation:wtlWave .8s ease-in-out infinite;}
.wtl-wave span:nth-child(2){animation-delay:.15s;}.wtl-wave span:nth-child(3){animation-delay:.3s;}
@keyframes wtlWave{0%,100%{height:3px}50%{height:8px}}
.wtl-bubble-text{font-size:13px;color:#e8f4ff;line-height:1.55;white-space:pre-wrap;overflow-y:auto;flex:1;}
.wtl-bubble-tap{margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(0,212,255,.45);letter-spacing:2px;text-align:right;}

/* QUIZ MCQ */
.wtl-quiz-area{flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden;}
.wtl-quiz-q{font-size:13px;color:#e8f4ff;line-height:1.5;font-weight:600;flex-shrink:0;}
.wtl-quiz-opts{display:flex;flex-direction:column;gap:5px;overflow-y:auto;flex:1;}
.wtl-opt{background:rgba(8,18,42,.9);border:1px solid rgba(0,212,255,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;text-align:left;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s;}
.wtl-opt:active{background:rgba(0,212,255,.08);}
.wtl-opt.correct{border-color:#2dc653;background:rgba(45,198,83,.12);color:#2dc653;}
.wtl-opt.wrong{border-color:#ff4444;background:rgba(255,68,68,.08);color:#ff4444;}
.wtl-quiz-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.5px;line-height:1.5;display:none;flex-shrink:0;}
.wtl-quiz-hint.show{display:block;}

/* PROGRESS BAR */
.wtl-progress-row{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.wtl-prog-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.wtl-prog-fill{height:100%;background:linear-gradient(90deg,#00d4ff,#2dc653);border-radius:2px;transition:width .4s;}
.wtl-prog-pct{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

/* BOTTOM BAR */
.wtl-bottom{height:62px;background:rgba(4,8,18,.98);border-top:1px solid rgba(0,212,255,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px;gap:10px;flex-shrink:0;}
.wtl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.wtl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.wtl-dot.done{background:#2dc653;}
.wtl-dot.active{background:#00d4ff;width:14px;border-radius:3px;}
.wtl-nav{display:flex;align-items:center;justify-content:center;padding:0 18px;height:44px;border-radius:12px;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .2s;}
.wtl-nav:active{transform:scale(.93);}
.wtl-nav-back{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);min-width:72px;}
.wtl-nav-next{background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;min-width:96px;}
.wtl-nav-next:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed;transform:none;}

/* FIRE GLOW */
@keyframes wtlFireGlow{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 40px 8px rgba(255,80,0,.35)}}
.wtl-scene.fire-anim{animation:wtlFireGlow 0.6s ease-in-out infinite;}

/* INLINE COLOR QUIZ (replaces bubble during cquiz) */
.wtl-cquiz-inline{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,18,42,.98);border:1px solid rgba(0,212,255,.18);border-radius:14px;padding:12px;}
.wtl-cquiz-inline-label{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.45);}
.wtl-cquiz-inline-role{font-size:38px;font-weight:900;letter-spacing:5px;text-align:center;text-shadow:0 0 18px currentColor;}
.wtl-cquiz-inline-prog{display:flex;gap:8px;align-items:center;margin-top:2px;}
@keyframes wtlShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.wtl-cquiz-inline.shake{animation:wtlShake .35s ease;}
`;function bs(){if(document.querySelector("#wtl-css"))return;const f=document.createElement("style");f.id="wtl-css",f.textContent=ws,document.head.appendChild(f)}function _s(f,t){const e=f.width,s=e/2,o=e/2,i=f.getContext("2d");i.clearRect(0,0,e,e);const a=e*.46,n=e*.33,r=e*.18,l=(c,h,d)=>{if(d){const u=i.createRadialGradient(s,o,c*.4,s,o,c+18);u.addColorStop(0,h+"cc"),u.addColorStop(1,"transparent"),i.fillStyle=u,i.beginPath(),i.arc(s,o,c+18,0,Math.PI*2),i.fill()}};l(a,"#888",t===2),i.beginPath(),i.arc(s,o,a,0,Math.PI*2),i.fillStyle=t===2?"#888888":t===-1?"#555":"#3a3a3a",i.fill(),l(n,"#3355cc",t===1),i.beginPath(),i.arc(s,o,n,0,Math.PI*2),i.fillStyle=t===1?"#3355cc":t===-1?"#333":"#222255",i.fill(),l(r,"#b87333",t===0),i.beginPath(),i.arc(s,o,r,0,Math.PI*2),i.fillStyle=t===0?"#d4893a":t===-1?"#555":"#6b4420",i.fill(),[[a,"#ffffff22"],[n,"#ffffff18"],[r,"#ffffff25"]].forEach(([c,h])=>{i.beginPath(),i.arc(s,o,c,0,Math.PI*2),i.strokeStyle=h,i.lineWidth=1.5,i.stroke()})}function at(f,t){const e=document.createElement("canvas");e.width=160,e.height=50;const s=e.getContext("2d");s.fillStyle="rgba(4,10,24,0.9)",s.beginPath(),s.roundRect(2,2,156,46,9),s.fill(),s.strokeStyle=f,s.lineWidth=2,s.beginPath(),s.roundRect(2,2,156,46,9),s.stroke(),s.fillStyle=f,s.font="bold 18px monospace",s.textAlign="center",s.textBaseline="middle",s.fillText(t,80,25);const o=new ft(e),i=new Oe({map:o,transparent:!0,depthTest:!1}),a=new Pe(i);return a.scale.set(.85,.28,1),a}class xs{constructor(t){this.state=t,this._step=0,this._three=null,this._animId=null,this._sceneObjs=[],this._sparks=[],this._dropObjs=[],this._fireObjs=[],this._quizDone=!1,this._cqIdx=0,this._cqCorrect=0,this._cqTargets=[],this._cqActive=!1,this._cqTargetId="",this._quizMeshTap=null,this._camPos=new m(4,3,8),this._camTarget=new m(0,0,0),this.container=this._build()}_build(){bs();const t=document.createElement("div");return t.className="screen screen-hidden",t.innerHTML=`
      <div class="wtl">
        <header class="wtl-top">
          <button class="wtl-back">← MENU</button>
          <div class="wtl-top-center">
            <span class="wtl-ch-label" id="wtl-ch-lbl">WIRE TYPES</span>
          </div>
          <span class="wtl-ch-step" id="wtl-step-num">1/${nt.length}</span>
        </header>

        <div class="wtl-scene" id="wtl-scene">
          <canvas class="wtl-canvas" id="wtl-canvas"></canvas>

          <!-- Cross-section overlay -->
          <div class="wtl-cross-overlay" id="wtl-cross-overlay">
            <div class="wtl-cross-wrap">
              <canvas id="wtl-cross-canvas" width="220" height="220"></canvas>
              <div class="wtl-cross-labels" id="wtl-cross-labels"></div>
            </div>
          </div>

          <!-- Wire type badge -->
          <div class="wtl-wt-badge" id="wtl-wt-badge">
            <div class="wtl-wt-badge-name" id="wtl-wt-name"></div>
            <div class="wtl-wt-badge-tag"  id="wtl-wt-tag"></div>
          </div>

          <!-- Color quiz prompt -->
          <div class="wtl-cquiz-prompt" id="wtl-cquiz-prompt">
            <div class="wtl-cquiz-role" id="wtl-cquiz-role"></div>
            <div class="wtl-cquiz-sub">TAP THE CORRECT WIRE</div>
            <div class="wtl-cquiz-prog" id="wtl-cquiz-prog"></div>
          </div>

          <div class="wtl-tap-hint" id="wtl-tap-hint" style="display:none">👆 TAP THE CORRECT WIRE</div>
          <div class="wtl-feedback" id="wtl-feedback"><div class="wtl-fb" id="wtl-fb"></div></div>
        </div>

        <div class="wtl-dialog" id="wtl-dialog">
          <!-- swapped between bubble-mode and quiz-mode -->
          <div class="wtl-bubble" id="wtl-bubble">
            <img src="/Mascot.png" class="wtl-avatar" id="wtl-avatar" alt="Electro"/>
            <div class="wtl-bubble-content">
              <div class="wtl-bubble-name">ELECTRO
                <div class="wtl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wtl-bubble-text" id="wtl-text"></p>
              <div class="wtl-bubble-tap" id="wtl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct"></span>
          </div>
        </div>

        <div class="wtl-bottom">
          <button class="wtl-nav wtl-nav-back" id="wtl-prev">← BACK</button>
          <div class="wtl-dots" id="wtl-dots"></div>
          <button class="wtl-nav wtl-nav-next" id="wtl-next">NEXT →</button>
        </div>
      </div>`,t.querySelector(".wtl-back").addEventListener("click",()=>this.state.setState("menu")),t.querySelector("#wtl-next").addEventListener("click",()=>this._onNext()),t.querySelector("#wtl-prev").addEventListener("click",()=>this._onPrev()),t.querySelector("#wtl-bubble-tap").addEventListener("click",()=>this._onNext()),this._el=t,t}_initThree(){if(this._three)return;const t=this._el.querySelector("#wtl-canvas"),e=this._el.querySelector("#wtl-scene"),s=e.offsetWidth,o=e.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}const i=new _t({canvas:t,antialias:!0,powerPreference:"high-performance"});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Bt,i.toneMapping=Ht,i.toneMappingExposure=1.15;const a=new mt;a.background=new R(658968),a.fog=new Wt(658968,.025);const n=new xt(52,s/o,.1,80);n.position.copy(this._camPos),n.lookAt(this._camTarget),oe(a);const{lampFill:r}=ie(a,{benchY:-.64,benchW:11,benchD:5.5}),l=r,c=new $t,h=new Rt,d=w=>{if(!this._cqActive&&!this._quizMeshTap)return;w.preventDefault();const b=t.getBoundingClientRect(),_=w.touches?w.changedTouches[0]:w;h.x=(_.clientX-b.left)/b.width*2-1,h.y=-((_.clientY-b.top)/b.height)*2+1,c.setFromCamera(h,n);const v=c.intersectObjects(this._cqTargets);if(v.length){const E=v[0].object.userData.wireId;this._cqActive&&this._onColorTap(E,v[0].point),this._quizMeshTap&&this._quizMeshTap(E)}};t.addEventListener("pointerdown",d),this._resizeObs=new ResizeObserver(()=>{const w=e.offsetWidth,b=e.offsetHeight;!w||!b||(i.setSize(w,b),n.aspect=w/b,n.updateProjectionMatrix())}),this._resizeObs.observe(e),this._three={renderer:i,scene:a,camera:n,lamp:l},this._cqActive=!1,this._quizMeshTap=null;const u=()=>{this._animId=requestAnimationFrame(u),this._updateThree(),i.render(a,n)};u()}_clearSceneObjs(){if(this._three){for(const t of this._sceneObjs)this._three.scene.remove(t);this._sceneObjs=[],this._dropObjs=[],this._fireObjs=[],this._cqTargets=[],this._cqActive=!1,this._quizMeshTap=null,this._el.querySelector("#wtl-scene").classList.remove("fire-anim"),this._el.querySelector("#wtl-cross-overlay").classList.remove("show"),this._el.querySelector("#wtl-wt-badge").classList.remove("show"),this._el.querySelector("#wtl-cquiz-prompt").classList.remove("show"),this._el.querySelector("#wtl-tap-hint").style.display="none"}}_add(t){return this._three.scene.add(t),this._sceneObjs.push(t),t}_makeWire(t,e){const s=t.shape==="armored",o=t.shape==="flat",i=new g({color:t.col,roughness:s?.18:o?.75:.35,metalness:s?.92:.05,clearcoat:s?0:.6,clearcoatRoughness:.2}),a=new p(this._makeWireGeo(t),i);if(a.rotation.z=Math.PI/2,a.castShadow=!0,a.userData.wireId=t.id,a.position.set(e,-.35,0),o){const n=new A;[-.04,0,.04].forEach((r,l)=>{const c=[1118481,12088115,15658734][l],h=new g({color:c,roughness:.4,metalness:l===1?.9:0}),d=new p(new k(.035,.035,5.85,12),h);d.position.set(0,0,r),n.add(d)}),a.add(n)}return s&&this._makeArmorSpiral(a,t.r),a}_makeWireGeo(t){return t.shape==="flat"?new lt(t.r*.45,5.6,8,16):new k(t.r,t.r,5.8,24)}_makeArmorSpiral(t,e){const s=new g({color:11184810,roughness:.18,metalness:.92}),o=[],i=45,a=5.6;for(let c=0;c<=200;c++){const h=c/200,d=h*Math.PI*2*i,u=-a/2+h*a;o.push(new m(Math.cos(d)*e,u,Math.sin(d)*e))}const n=new ut(o),r=new ct(n,200,.022,8,!1),l=new p(r,s);t.add(l)}_makeCopperEnd(t,e,s=!1){const o=new A,i=new g({color:13928762,roughness:.15,metalness:.95,emissive:13928762,emissiveIntensity:.12});if(s)for(let a=0;a<7;a++){const n=a/7*Math.PI*2,r=new p(new k(.018,.018,.14,8),i);r.rotation.z=Math.PI/2,r.position.set(0,Math.cos(n)*.038,Math.sin(n)*.038),o.add(r)}else{const a=new p(new k(.065,.065,.14,16),i);a.rotation.z=Math.PI/2,o.add(a)}return o.position.set(t,-.35,e),o}_makeTermEnd(t,e,s){const o=new g({color:11184810,roughness:.12,metalness:.95}),i=new p(new k(s+.02,s+.02,.16,16),o);return i.rotation.z=Math.PI/2,i.position.set(t,-.35,e),i}_applyScene(t){this._clearSceneObjs();const e=t.scene;if(e!=="empty"){if(e==="wire_drop"||e==="wire_single"){const s={col:1710638,r:.13,shape:"round",id:"anatomy"},o=this._makeWire(s,0);e==="wire_drop"?(o.position.set(0,4,0),this._dropObjs.push({mesh:o,target:-.35,vel:0})):o.position.set(0,-.35,0),this._add(o),this._add(this._makeCopperEnd(-3.01,0,!0)),this._add(this._makeCopperEnd(3.01,0,!0)),this._add(this._makeTermEnd(-2.9,0,.13)),this._add(this._makeTermEnd(2.9,0,.13))}if(e==="cross_section"){this._el.querySelector("#wtl-cross-overlay").classList.add("show");const o=this._el.querySelector("#wtl-cross-canvas");_s(o,t.layer??-1);const i=this._el.querySelector("#wtl-cross-labels"),a=[{name:"COPPER",hex:"#b87333",active:t.layer===0},{name:"INSULATION",hex:"#3355cc",active:t.layer===1},{name:"JACKET",hex:"#666666",active:t.layer===2}];i.innerHTML=a.map(n=>`
        <span class="wtl-cross-tag" style="color:${n.active?n.hex:"rgba(255,255,255,0.3)"};border-color:${n.active?n.hex:"rgba(255,255,255,0.12)"};font-weight:${n.active?"800":"400"}">
          ${n.name}
        </span>`).join("")}if(e==="color_wires"&&(this._cqTargets=[],pe.forEach(s=>{const o=this._makeWire({col:s.col,r:.14,shape:"round",id:s.id},0);o.position.z=s.z,this._add(o),this._cqTargets.push(o),this._add(this._makeCopperEnd(-2.71,s.z,!1)),this._add(this._makeCopperEnd(2.71,s.z,!1)),this._add(this._makeTermEnd(-2.7,s.z,.14)),this._add(this._makeTermEnd(2.7,s.z,.14));const i=at(s.hex,s.lbl);i.position.set(0,.1,s.z),this._add(i);const a=t.focus;a&&a!==s.id&&(o.material.opacity=.2,o.material.transparent=!0),a===s.id&&(o.material.emissive=new R(s.col),o.material.emissiveIntensity=.25)})),e==="wt_slots"){const s=new g({color:662058,roughness:.9,transparent:!0,opacity:.6});Ut.forEach((o,i)=>{const a=(i-2)*1.1,n=new p(new k(.23,.23,5.6,24),s);n.rotation.z=Math.PI/2,n.position.set(a,-.35,0),this._add(n);const r=at("#334455",o.lbl);r.position.set(a,.12,0),this._add(r)})}if(e==="wt_show"){const s=t.active??-1;Ut.forEach((o,i)=>{const a=(i-2)*1.1,n=i===s;let r;if(o.shape==="armored"){r=new A;const l=new p(new k(o.r,o.r,5.8,20),new g({color:5592405,roughness:.5,metalness:.6}));r.add(l),this._makeArmorRings(r,o.r,n?24:14),r.rotation.z=Math.PI/2,r.position.set(a,-.35,0),r.castShadow=!0,l.userData.wireId=o.id,this._cqTargets.push(l),this._add(r)}else{const l=new k(o.r,o.r,5.8,24),c=new g({color:o.col,roughness:.65,metalness:.05,transparent:!n,opacity:n?1:.22}),h=new p(l,c);h.rotation.z=Math.PI/2,h.position.set(a,-.35,0),h.castShadow=!0,h.userData.wireId=o.id,this._add(h),n&&(c.emissive=new R(o.col),c.emissiveIntensity=.2)}if(n){const l=at(o.hex,o.lbl);l.position.set(a,.18,0),this._add(l);const c=this._el.querySelector("#wtl-wt-badge");this._el.querySelector("#wtl-wt-name").textContent=o.lbl,this._el.querySelector("#wtl-wt-tag").textContent=o.tag,c.classList.add("show")}this._add(this._makeCopperEnd(a-2.91,0)),this._add(this._makeCopperEnd(a+2.91,0)),this._add(this._makeTermEnd(a-2.9,0,o.r)),this._add(this._makeTermEnd(a+2.9,0,o.r))})}if(e==="awg_pair"){const s=t.hl;[{id:"awg14",r:.11,col:8934826,hex:"#8855aa",x:-1.1,lbl:"AWG 14"},{id:"awg12",r:.155,col:13395456,hex:"#cc6600",x:1.1,lbl:"AWG 12"}].forEach(i=>{const a=s===i.id||!s,n=new g({color:i.col,roughness:.6,metalness:.05,transparent:!a,opacity:a?1:.25}),r=new p(new k(i.r,i.r,5.4,22),n);r.rotation.z=Math.PI/2,r.position.set(i.x,-.35,0),r.castShadow=!0,a&&(n.emissive=new R(i.col),n.emissiveIntensity=s?.25:0),this._add(r);const l=at(i.hex,i.lbl);l.position.set(i.x,.12,0),this._add(l),this._add(this._makeCopperEnd(i.x-2.71,0)),this._add(this._makeCopperEnd(i.x+2.71,0))})}if(e==="awg_fire"){const s=new g({color:8934826,roughness:.6,metalness:.05}),o=new p(new k(.11,.11,5.4,22),s);o.rotation.z=Math.PI/2,o.position.set(0,-.35,0),o.castShadow=!0,this._add(o),this._fireObjs.push({mesh:o,mat:s,t:0}),this._el.querySelector("#wtl-scene").classList.add("fire-anim");const i=at("#ff4400","AWG 14");i.position.set(0,.12,0),this._add(i)}if(e!=="bench_clean"&&(e==="wt_all"&&Ut.forEach((s,o)=>{const i=(o-2)*1.25,a=new g({color:s.col,roughness:.65,metalness:s.shape==="armored"?.7:.05}),n=new p(new k(s.r,s.r,5.4,22),a);n.rotation.z=Math.PI/2,n.position.set(i,-.35,0),n.castShadow=!0,this._add(n);const r=at(s.hex,s.lbl);r.position.set(i,.12,0),this._add(r),a.emissive=new R(s.col),a.emissiveIntensity=.15}),e==="quiz"||e==="quiz_intro")){const s=t.qi;if(s==null)return;const i=Qt[s].vis;let a=Ut.find(r=>r.id.toLowerCase()===i),n=pe.find(r=>r.id===i);if(i==="awg"){const r=new g({color:13395456,roughness:.6,metalness:0}),l=new p(new k(.155,.155,5.4,22),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,this._add(l);const c=at("#cc6600","AWG 12");c.position.set(0,.12,0),this._add(c)}else if(a){const r=new g({color:a.col,roughness:.65,metalness:a.shape==="armored"?.7:.05}),l=new p(new k(a.r,a.r,5.4,22),r);if(l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,a.shape==="armored"){const h=new A;h.add(l),this._makeArmorRings(h,a.r,22),h.rotation.z=Math.PI/2,h.children[0].rotation.z=0,h.position.set(0,-.35,0),this._add(h)}else r.emissive=new R(a.col),r.emissiveIntensity=.15,this._add(l);const c=at(a.hex,a.lbl);c.position.set(0,.18,0),this._add(c)}else if(n){const r=new g({color:n.col,roughness:.6,metalness:.05}),l=new p(new k(.14,.14,5.4,24),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,r.emissive=new R(n.col),r.emissiveIntensity=.2,this._add(l);const c=at(n.hex,n.lbl);c.position.set(0,.12,0),this._add(c)}else if(i==="outdoor"){const r=new g({color:5075008,roughness:.7,metalness:0}),l=new p(new k(.22,.22,5.4,22),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,r.emissive=new R(5075008),r.emissiveIntensity=.2,this._add(l);const c=at("#4d7040","UF-B");c.position.set(0,.12,0),this._add(c)}else if(i==="neutral"){const r=new g({color:14211288,roughness:.6,metalness:.05}),l=new p(new k(.14,.14,5.4,24),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,this._add(l);const c=at("#d8d8d8","WHITE");c.position.set(0,.12,0),this._add(c)}}}}_updateThree(){if(!this._three)return;const{camera:t,lamp:e}=this._three,s=performance.now()*.001,o=nt[this._step],i=o.cam,a=new m(...i.p),n=new m(...i.t);this._camPos.lerp(a,.042),this._camTarget.lerp(n,.042),t.position.copy(this._camPos),t.lookAt(this._camTarget),e.intensity=1.5+Math.sin(s*4.1)*.07;for(const r of this._dropObjs){const l=r.mesh.position.y-r.target;Math.abs(l)<.01&&Math.abs(r.vel)<.002?r.mesh.position.y=r.target:(r.vel+=-.018*l-.18*r.vel,r.mesh.position.y+=r.vel)}for(const r of this._sceneObjs)r.userData&&r.userData.floatIdx!==void 0&&(r.position.y=r.userData.baseY+Math.sin(s*.55+r.userData.floatIdx*1.1)*.018);for(const r of this._fireObjs){r.t+=.04;const l=(Math.sin(r.t*3.1)+1)*.5;r.mat.emissive=new R(16729088),r.mat.emissiveIntensity=.4+l*.6,r.mat.color=new R(16720384)}if(this._sparks=this._sparks.filter(r=>(r.life-=.024,r.life<=0?(this._three.scene.remove(r.mesh),!1):(r.vel.y-=.005,r.mesh.position.addScaledVector(r.vel,1),r.mesh.material.opacity=r.life,!0))),o.t==="color"||o.t==="cquiz"||o.t==="color_sum"){for(const r of this._sceneObjs)if(r.isMesh&&r.userData.wireId&&!r.material.transparent){const l=pe.find(c=>c.id===r.userData.wireId);if(l&&this._cqActive){const c=this._cqTargetId===l.id;r.material.emissive=new R(l.col),r.material.emissiveIntensity=c?.08+Math.sin(s*3)*.08:0}}}}_spawnSparks(t){if(this._three)for(let e=0;e<16;e++){const s=new J({color:[16763904,16737792,16777215][e%3],transparent:!0,opacity:1}),o=new p(new gt(.032,4,4),s);o.position.copy(t),this._three.scene.add(o),this._sparks.push({mesh:o,life:.7+Math.random()*.6,vel:new m((Math.random()-.5)*.09,.05+Math.random()*.09,(Math.random()-.5)*.09)})}}_showFeedback(t){const e=this._el.querySelector("#wtl-feedback");this._el.querySelector("#wtl-fb").textContent=t,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),800)}_startColorQuiz(){this._cqIdx=0,this._cqCorrect=0,this._cqActive=!0,this._renderColorQuizRound(),this._el.querySelector("#wtl-next").disabled=!0}_renderColorQuizRound(){const t=[{id:"red",role:"HOT",hex:"#cc2222"},{id:"white",role:"NEUTRAL",hex:"#d8d8d8"},{id:"green",role:"GROUND",hex:"#1a9e44"}],e=t[this._cqIdx];this._cqTargetId=e.id;const s=Math.round(this._step/(nt.length-1)*100);this._el.querySelector("#wtl-dialog").innerHTML=`
      <div class="wtl-cquiz-inline" id="wtl-cq-inline">
        <div class="wtl-cquiz-inline-label">TAP THE CORRECT WIRE</div>
        <div class="wtl-cquiz-inline-role" style="color:${e.hex}">${e.role}</div>
        <div class="wtl-cquiz-inline-prog">${t.map((o,i)=>`<div class="wtl-cquiz-pip ${i<this._cqIdx?"done":i===this._cqIdx?"active":""}"></div>`).join("")}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${s}%"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct">${s}%</span>
      </div>`,this._el.querySelector("#wtl-tap-hint").style.display="block"}_onColorTap(t,e){if(this._cqActive)if(t===this._cqTargetId)if(this._showFeedback("✅"),this._spawnSparks(e),this._cqCorrect++,this._cqIdx++,this._cqIdx>=3){this._cqActive=!1,this._el.querySelector("#wtl-tap-hint").style.display="none",this._el.querySelector("#wtl-next").disabled=!1,this._el.querySelector("#wtl-next").textContent="NEXT CHAPTER";const s=Math.round(this._step/(nt.length-1)*100);this._el.querySelector("#wtl-dialog").innerHTML=`
          <div class="wtl-cquiz-inline">
            <div class="wtl-cquiz-inline-role" style="color:#2dc653">ALL CORRECT ✓</div>
            <div class="wtl-cquiz-inline-label">Tap NEXT CHAPTER to continue</div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${s}%"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct">${s}%</span>
          </div>`}else setTimeout(()=>this._renderColorQuizRound(),450);else{this._showFeedback("❌");const s=this._el.querySelector("#wtl-cq-inline");s&&(s.classList.remove("shake"),s.offsetWidth,s.classList.add("shake"))}}_renderQuiz(t){const e=Qt[t],s=this._el.querySelector("#wtl-dialog");s.innerHTML=`
      <div class="wtl-quiz-area">
        <p class="wtl-quiz-q">${e.q}</p>
        <div class="wtl-quiz-opts">
          ${e.opts.map((o,i)=>`
            <button class="wtl-opt" data-idx="${i}">${o}</button>
          `).join("")}
        </div>
        <div class="wtl-quiz-hint" id="wtl-quiz-hint">${e.hint}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct"></span>
      </div>`,s.querySelectorAll(".wtl-opt").forEach(o=>{o.addEventListener("click",()=>this._onQuizAnswer(t,parseInt(o.dataset.idx)))})}_onQuizAnswer(t,e){if(this._quizDone)return;const s=Qt[t];if(this._el.querySelectorAll(".wtl-opt").forEach((i,a)=>{i.style.pointerEvents="none",a===s.ans?i.classList.add("correct"):a===e&&i.classList.add("wrong")}),e===s.ans)this._showFeedback("✅"),this._quizDone=!0,this._el.querySelector("#wtl-next").disabled=!1;else{this._showFeedback("❌");const i=this._el.querySelector("#wtl-quiz-hint");i&&i.classList.add("show"),setTimeout(()=>{this._quizDone=!0,this._el.querySelector("#wtl-next").disabled=!1},900)}}_render(){const t=nt[this._step],e=nt.length,s=Math.round(this._step/(e-1)*100);this._el.querySelector("#wtl-ch-lbl").textContent=t.chLbl||"",this._el.querySelector("#wtl-step-num").textContent=`${this._step+1}/${e}`;const o=this._el.querySelector("#wtl-dots");o.innerHTML=nt.map((n,r)=>`<div class="wtl-dot ${r<this._step?"done":r===this._step?"active":""}"></div>`).join("");const i=this._el.querySelector("#wtl-next"),a=this._el.querySelector("#wtl-prev");if(a.style.visibility=this._step===0?"hidden":"visible",t.t==="quiz")this._quizDone=!1,i.disabled=!0,i.textContent="NEXT →",this._renderQuiz(t.qi),requestAnimationFrame(()=>{const n=this._el.querySelector("#wtl-prog"),r=this._el.querySelector("#wtl-pct");n&&(n.style.width=s+"%"),r&&(r.textContent=s+"%")});else{this._el.querySelector("#wtl-bubble")||(this._el.querySelector("#wtl-dialog").innerHTML=`
          <div class="wtl-bubble" id="wtl-bubble">
            <img src="/Mascot.png" class="wtl-avatar" id="wtl-avatar" alt="Electro"/>
            <div class="wtl-bubble-content">
              <div class="wtl-bubble-name">ELECTRO
                <div class="wtl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wtl-bubble-text" id="wtl-text"></p>
              <div class="wtl-bubble-tap" id="wtl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct"></span>
          </div>`,this._el.querySelector("#wtl-bubble-tap").addEventListener("click",()=>this._onNext())),this._el.querySelector("#wtl-text").textContent=t.text||"",this._el.querySelector("#wtl-prog").style.width=s+"%",this._el.querySelector("#wtl-pct").textContent=s+"%";const n=t.t==="cquiz",r=!n&&!t.btn;this._el.querySelector("#wtl-bubble-tap").style.display=r?"block":"none",i.disabled=n,i.textContent=t.btn||"NEXT →";const l=this._el.querySelector("#wtl-avatar");l&&(t.mascotIn?(l.classList.remove("entered"),requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add("entered")))):l.classList.add("entered")),n&&this._startColorQuiz()}}_gotoStep(t){this._step=Math.max(0,Math.min(nt.length-1,t));const e=nt[this._step];this._applyScene(e),this._render()}_onNext(){if(nt[this._step].t==="done"){O.completeLesson("wireTypes"),this.state.setState("wireLearn");return}this._step<nt.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}onShow(){this._step=0,this._camPos.set(4,3,8),this._camTarget.set(0,0,0),this._sparks=[],this._render(),setTimeout(()=>this._initThree(),80)}onHide(){this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._three&&(this._clearSceneObjs(),this._three.renderer.dispose(),this._three=null),this._sparks=[]}}const Et=[{q:"What is fish tape used for?",opts:["Measuring wire resistance","Threading wire through installed conduit","Bending wire into terminal hooks","Cutting conduit to length"],a:1,vis:"fishtape",hint:"Fish tape is pushed through conduit first, then wire is attached to the end and pulled back through."},{q:"An electrician switches off the breaker. Before touching exposed conductors they should:",opts:["Proceed — breaker off means no power","Test with a voltage tester first","Check the wire color only","Use rubber gloves only"],a:1,vis:"tester",hint:"The breaker being off is not enough — always verify with a voltage tester before touching any conductor."},{q:"A crowded junction box needs wires bent into tight loops. The best tool is:",opts:["Lineman's pliers — wider jaw","Long nose pliers — narrow jaw fits tight spaces","Diagonal cutters — cut the excess","Conduit bender — bends the wire"],a:1,vis:"longnose",hint:"Long nose pliers have a narrow tapered jaw that reaches into tight spaces where lineman's cannot fit."},{q:"A screwdriver has a visible crack in its insulated handle. You should:",opts:["Tape it up and continue","Use it only on low-voltage work","Replace it immediately","Wrap with electrical tape"],a:2,vis:"flathead",hint:"A damaged handle offers no insulation protection between your hand and a live conductor. Replace immediately."},{q:"You suspect a wire break inside insulation with no visible damage. Which tool finds it?",opts:["Voltage tester — checks for live voltage","Fish tape — locates breaks mechanically","Multimeter in continuity mode — beeps when connected","Measuring tape — confirms wire length"],a:2,vis:"multimeter",hint:"Multimeter continuity mode sends a tiny test signal — no beep means the circuit path is broken."},{q:"Which tool bends rigid metal conduit to an accurate angle?",opts:["Lineman's pliers — strong enough to force it","Conduit bender — built specifically for this","Long nose pliers — precise control","Measuring tape — guides the bend angle"],a:1,vis:"conduitbender",hint:"The conduit bender's curved head and angle markings ensure accurate kink-free bends every time."}],Kt=[{id:"lineman",name:"LINEMAN'S PLIERS",col:13378082,row:0,xi:0,displayRz:0},{id:"dykes",name:"DIAGONAL CUTTERS",col:3364266,row:0,xi:1,displayRz:0},{id:"knife",name:"UTILITY KNIFE",col:5592422,row:0,xi:2,displayRz:0},{id:"longnose",name:"LONG NOSE PLIERS",col:8947848,row:0,xi:3,displayRz:0},{id:"conduitbender",name:"CONDUIT BENDER",col:8930304,row:0,xi:4,displayRz:0},{id:"flathead",name:"FLATHEAD SCREWDRIVER",col:16755234,row:0,xi:5,displayRz:Math.PI/2},{id:"phillips",name:"PHILLIPS SCREWDRIVER",col:16746496,row:1,xi:0,displayRz:Math.PI/2},{id:"tape",name:"ELECTRICAL TAPE",col:1118481,row:1,xi:1,displayRz:0},{id:"tester",name:"VOLTAGE TESTER",col:16772608,row:1,xi:2,displayRz:Math.PI/2},{id:"multimeter",name:"MULTIMETER",col:3355443,row:1,xi:3,displayRz:0},{id:"fishtape",name:"FISH TAPE",col:16737792,row:1,xi:4,displayRz:0},{id:"measuringtape",name:"MEASURING TAPE",col:16763904,row:1,xi:5,displayRz:0}],rt=[{t:"info",scene:"bench_clean",chLbl:"INTRO",title:"ELECTRICIAN'S TOOLS",text:"Every professional electrician carries a core set of hand tools. Not any tools — the right tools. This lesson covers the 12 essential tools used in Philippine electrical work. What they do, how to use them, and how to stay safe.",btn:"START →"},{t:"info",scene:"all_tools",chLbl:"OVERVIEW",title:"12 ESSENTIAL TOOLS",text:`Six categories:
✦ Cutting — wire and conduit
✦ Gripping — bending and holding
✦ Fastening — terminals and fittings
✦ Testing — safety and fault-finding
✦ Measuring — accurate runs
✦ Protection — electrical tape`,btn:"LET'S START →"},{t:"chap",scene:"cutting_group",ch:1,chLbl:"CH.1 CUTTING",title:"CUTTING TOOLS",text:"Three cutting tools. Each built for a different job. Using the wrong cutter damages the conductor and creates a hidden failure point."},{t:"tool",scene:"show_lineman",chLbl:"CH.1 CUTTING",toolName:"LINEMAN'S PLIERS",about:"The workhorse of Philippine electrical work. Heavy-duty jaws with a cutter notch near the pivot — twists wires, cuts conductors, and pulls stubborn wire through conduit.",features:[["✂","Cuts AWG 8–12"],["⟳","Wire Twisting"],["🛡","VDE 1000V"]],howTo:["Grip the wire firmly in the serrated jaw.","Twist both handles together to join conductors.","Use the cutter notch near the pivot to shear thick wire."],tip:"Always twist clockwise when joining conductors — it creates a tighter, more secure splice."},{t:"tool",scene:"show_dykes",chLbl:"CH.1 CUTTING",toolName:"DIAGONAL CUTTERS",about:"Angled jaws cut flush against a surface. Where lineman's leave a stub, diagonal cutters snip right at the terminal — essential for clean, professional finishes.",features:[["→","Flush Cut"],["🎯","Tight Spaces"],["✂","AWG 14–22"]],howTo:["Position the angled jaw flat against the work surface.","Squeeze handles firmly to shear the wire.","Trim zip ties by cutting at the base for a clean finish."],tip:"The diagonal edge cuts cleaner than straight jaws — less fraying, less chance of a resistance hot spot."},{t:"tool",scene:"show_knife",chLbl:"CH.1 CUTTING",toolName:"UTILITY KNIFE",about:"For scoring cable jackets only — not individual conductors. Score LENGTHWISE along the jacket. A circular score almost always nicks a conductor inside.",features:[["|","Score Only"],["↩","Retractable"],["⚠","Away From Body"]],howTo:["Extend the blade to a safe scoring length.","Score lengthwise along the outer jacket only.","Bend the cable to open the score and peel the jacket back."],tip:"Never score in a ring around the cable — the blade will nick conductors below the jacket surface."},{t:"chap",scene:"gripping_group",ch:2,chLbl:"CH.2 GRIPPING",title:"GRIPPING TOOLS",text:"Two specialized gripping tools — one for precision detail work, one for bending rigid conduit into precise angles."},{t:"tool",scene:"show_longnose",chLbl:"CH.2 GRIPPING",toolName:"LONG NOSE PLIERS",about:"Long tapered jaws reach into tight spaces lineman's cannot. Bends terminal hooks at wire ends and positions wires in crowded junction boxes.",features:[["↔","Tight Reach"],["⌒","Hook Bending"],["◆","Precise Grip"]],howTo:["Grip the wire near the end using the tapered jaws.","Bend slowly and steadily to the desired angle.","Form a J-hook for screw terminal connections."],tip:"Use smooth, controlled movements — the narrow jaws can crimp soft copper if you force it."},{t:"tool",scene:"show_conduitbender",chLbl:"CH.2 GRIPPING",toolName:"CONDUIT BENDER",about:"Bends rigid EMT conduit to accurate angles. Angle markers (22.5°, 45°, 90°) guide every bend. The foot step applies consistent downward pressure without kinking.",features:[["📐","Angle Marks"],["⚙","No Kinks"],["⬇","Foot Step"]],howTo:["Hook the head over the conduit at the bend mark.","Apply firm, steady pressure on the foot step.","Watch the angle markers — release exactly at your target."],tip:"Never force a bend by hand — kinking creates a stress point and restricts wire pull-through permanently."},{t:"chap",scene:"fastening_group",ch:3,chLbl:"CH.3 FASTENING",title:"FASTENING TOOLS",text:"Screwdrivers tighten terminal lugs, secure outlet screws, and adjust panel breakers. The right tip type protects both the screw head and your safety."},{t:"tool",scene:"show_flathead",chLbl:"CH.3 FASTENING",toolName:"FLATHEAD SCREWDRIVER",about:"Most electrical terminal screws in Philippine outlets, switches, and circuit breakers are slotted. The tip must fit exactly — too narrow and it slips, risking a dangerous arc flash.",features:[["—","Slotted Tip"],["⚡","Panel Ready"],["🛡","VDE Handle"]],howTo:["Match the tip width exactly to the slot — no wider, no narrower.","Apply firm downward pressure while turning.","Tighten until snug — overtightening cracks plastic terminals."],tip:"A slipping screwdriver causes arc flash. Always match tip width to the slot before applying torque."},{t:"tool",scene:"show_phillips",chLbl:"CH.3 FASTENING",toolName:"PHILLIPS SCREWDRIVER",about:"Cross-shaped tip for Phillips screws common on boxes, fixtures, and cover plates. Self-centers on the head — safer near live parts than a flathead.",features:[["✚","Cross Tip"],["🎯","Self-Centers"],["📦","Box Mount"]],howTo:["Align the cross tip with the screw head — it will seat automatically.","Apply downward pressure and rotate.","Match tip size (#1, #2, #3) to the screw head size."],tip:"Wrong tip size damages the head. If the tip feels loose in the cross, switch to the correct size immediately."},{t:"chap",scene:"testing_group",ch:4,chLbl:"CH.4 TESTING",title:"TESTING & MEASURING",text:"Testing tools separate a safe electrician from a dangerous one. Touch these before touching any conductor."},{t:"tool",scene:"show_tester",chLbl:"CH.4 TESTING",toolName:"VOLTAGE TESTER",about:"Non-contact voltage tester — detects AC voltage through insulation without touching bare wire. The LED and beep fire the moment it senses a live field. The most critical safety tool in any kit.",features:[["🔴","NCV Sensor"],["🔔","Beep Alert"],["🛡","No Contact"]],howTo:["Hold the tip near the wire or outlet without touching.","A beep + red LED means voltage is present — do not touch.","Always test every wire, even after the breaker is confirmed off."],tip:"Test on a known live outlet first to confirm the tester works. A dead tester is a silent danger."},{t:"tool",scene:"show_multimeter",chLbl:"CH.4 TESTING",toolName:"MULTIMETER",about:"Measures voltage, current, and resistance. Most-used: AC voltage (220V outlets), continuity (unbroken wire), and resistance (motor windings and loose connections).",features:[["V","Voltage"],["~","Continuity"],["Ω","Resistance"]],howTo:["Turn the dial to the correct function (V, continuity, Ω).","Connect probes: BLACK to COM, RED to measurement port.","Read the display — a beep in continuity mode means unbroken circuit."],tip:"In voltage mode, connect the BLACK probe first to avoid a short circuit on first contact."},{t:"tool",scene:"show_fishtape",chLbl:"CH.4 TESTING",toolName:"FISH TAPE",about:"Long flexible steel tape coiled on a reel. Pushed through installed conduit first — navigating bends — then wire is hooked to the end and pulled back through.",features:[["🌀","Reel Feed"],["↩","Hook End"],["💧","Lube Compatible"]],howTo:["Push the tape into the conduit, navigate bends from the far end.","Attach wire to the hooked end at the far opening.","Wind the reel handle to pull the wire back through."],tip:"Apply wire pulling lubricant on runs over 5m — it prevents conductor jacket damage from friction heat."},{t:"tool",scene:"show_measuringtape",chLbl:"CH.4 TESTING",toolName:"MEASURING TAPE",about:"For planning conduit runs, locating boxes, and cutting wire to length. Always add 15–20% extra — a too-short wire means splicing inside a wall, which is a code violation.",features:[["📏","Accurate"],["📌","Box Locate"],["➕","Add 15–20%"]],howTo:["Extend and lock the blade at the required measurement.","Mark the conduit or wire at the cut length.","Add 15–20% extra for routing bends and terminal tails."],tip:"Measure in straight lines, then add for every bend. Short wire in conduit cannot be extended — ever."},{t:"chap",scene:"show_tape",ch:5,chLbl:"CH.5 PROTECTION",title:"ELECTRICAL TAPE",text:"The final protection layer — used in almost every connection to ensure nothing remains exposed."},{t:"tool",scene:"show_tape",chLbl:"CH.5 PROTECTION",toolName:"ELECTRICAL TAPE",about:"Vinyl insulating tape rated 600V and 80°C. Stretchy enough to conform to wire shapes without gaps. Overlap half the tape width on each wrap — no gaps, no exposed copper.",features:[["⚡","600V Rated"],["🌡","80°C Max"],["🔄","Self-Sealing"]],howTo:["Stretch the tape as you wrap — tension creates a tight, self-sealing layer.","Overlap each wrap by half the tape width, no gaps.","Extend 10mm past the bare area on each side."],tip:"Tape is not a connector substitute — it cannot hold a live splice long-term. Use proper wire nuts first."},{t:"chap",scene:"all_tools",ch:6,chLbl:"CH.6 SAFETY",title:"TOOL SAFETY",text:"Four rules every licensed electrician follows without exception. Skip one and a tool becomes a hazard."},{t:"info",scene:"all_tools",chLbl:"CH.6 SAFETY",title:"RULES FOR SAFE TOOL USE",text:`1. INSPECT — Check for cracked handles, broken insulation, and damaged jaws before every job.
2. RIGHT TOOL — Never use pliers as a hammer or a screwdriver as a pry bar.
3. VDE RATED — All handles must be VDE 1000V AC rated. Look for the double triangle symbol.
4. STORE PROPERLY — Keep tools in separate pockets. Nicked cutting jaws create resistance hot spots.`,btn:"START QUIZ →"},{t:"quiz",qi:0,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:1,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:2,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:3,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:4,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:5,scene:"quiz",chLbl:"QUIZ"},{t:"done",scene:"all_tools",cam:{p:[0,5,13],t:[0,0,0]},chLbl:"COMPLETE",title:"MODULE COMPLETE",text:`You know your tools. 12 essential tools — their purpose, their limits, and the rules that keep you safe.

Next: Wire Stripping — where you put some of these tools to work.`,btn:"FINISH"}],vs=`
/* ── LESSON WRAPPER ─────────────────────────────────────── */
.etl{position:absolute;inset:0;display:flex;flex-direction:column;background:#060a14;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── TOP BAR ────────────────────────────────────────────── */
.etl-top{
  height:50px;flex-shrink:0;
  background:linear-gradient(180deg,rgba(2,5,14,.98) 0%,rgba(4,8,20,.9) 100%);
  border-bottom:1px solid rgba(0,212,255,.14);
  box-shadow:0 2px 16px rgba(0,0,0,.6);
  display:flex;align-items:center;padding:0 12px;gap:8px;
  z-index:5;
}
.etl-back{
  background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,150,200,.06));
  border:1px solid rgba(0,212,255,.35);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:1.5px;
  padding:9px 16px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 10px rgba(0,212,255,.12);transition:all .18s;min-width:72px;text-align:center;
  touch-action:manipulation;
}
.etl-back:active{transform:scale(.93);background:rgba(0,212,255,.2);}
.etl-chlbl{
  flex:1;text-align:center;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;
  color:rgba(255,255,255,.75);text-transform:uppercase;
}
.etl-prog{
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;
  color:rgba(0,212,255,.6);letter-spacing:1px;white-space:nowrap;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.18);
  padding:4px 9px;border-radius:6px;
}

/* ── 3D SCENE ────────────────────────────────────────────── */
.etl-scene{
  height:42vh;min-height:190px;max-height:300px;
  position:relative;flex-shrink:0;background:#060a14;overflow:hidden;
  transition:height .25s ease,min-height .25s ease;
}
.etl-canvas{display:block;width:100%;height:100%;}

/* Quiz mode: collapse 3D scene, give full height to quiz panel */
.etl--quiz .etl-scene{height:0;min-height:0;max-height:0;overflow:hidden;}

/* Scene vignette overlay for depth */
.etl-scene::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    linear-gradient(180deg,rgba(2,5,14,.45) 0%,transparent 25%,transparent 70%,rgba(2,5,14,.55) 100%),
    radial-gradient(ellipse 70% 80% at 50% 50%,transparent 40%,rgba(2,5,14,.25) 100%);
}

/* Tool name overlay on 3D canvas */
.etl-tool-overlay{
  position:absolute;bottom:14px;left:50%;transform:translateX(-50%);
  background:rgba(2,5,14,.82);border:1px solid rgba(0,212,255,.3);
  border-radius:8px;padding:5px 14px;
  font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;
  letter-spacing:3px;color:#00d4ff;text-transform:uppercase;
  pointer-events:none;opacity:0;transition:opacity .3s;z-index:3;
  white-space:nowrap;
}
.etl-tool-overlay.show{opacity:1;}

/* ── DIALOG PANEL ────────────────────────────────────────── */
.etl-dialog{
  background:linear-gradient(180deg,rgba(4,8,20,.98) 0%,rgba(6,10,24,.98) 100%);
  border-top:1px solid rgba(0,212,255,.14);
  padding:14px 16px 16px;
  display:flex;flex-direction:column;gap:10px;
  flex:1;overflow-y:auto;min-height:0;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
}
.etl-dialog::-webkit-scrollbar{display:none;}

.etl-dlg-title{
  font-size:16px;font-weight:900;letter-spacing:2.5px;
  color:#00d4ff;text-transform:uppercase;
  text-shadow:0 0 16px rgba(0,212,255,.3);
}
.etl-dlg-body{
  font-size:13px;color:rgba(255,255,255,.78);
  line-height:1.68;white-space:pre-line;
}
.etl-dlg-btn{
  align-self:flex-end;
  padding:12px 28px;
  background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;
  border:none;border-radius:11px;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:900;letter-spacing:1.5px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;margin-top:4px;
  box-shadow:0 0 16px rgba(0,212,255,.25),0 4px 12px rgba(0,0,0,.35);
  transition:all .18s;touch-action:manipulation;
}
.etl-dlg-btn:active{transform:scale(.94);}

/* ── CHAPTER CARD ────────────────────────────────────────── */
.etl-chap-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 0;}
.etl-chap-num{font-size:10px;font-weight:700;letter-spacing:5px;color:rgba(0,212,255,.55);text-transform:uppercase;}
.etl-chap-title{font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;text-align:center;}
.etl-chap-body{font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;text-align:center;}

/* ── QUIZ ────────────────────────────────────────────────── */
.etl-quiz-header{
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.18);
  border-radius:10px;padding:10px 14px;flex-shrink:0;
}
.etl-quiz-hd-label{font-size:10px;font-weight:800;letter-spacing:3px;color:#00d4ff;text-transform:uppercase;}
.etl-quiz-hd-score{font-size:13px;font-weight:700;color:rgba(255,255,255,.5);}
.etl-quiz-q{font-size:15px;font-weight:700;color:#fff;line-height:1.55;flex-shrink:0;}
.etl-quiz-opts{display:flex;flex-direction:column;gap:8px;}
.etl-quiz-opt{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:12px;padding:14px 16px;
  font-family:'Barlow Condensed',sans-serif;font-size:14px;color:rgba(255,255,255,.82);
  text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:background .14s,border-color .14s;touch-action:manipulation;
  line-height:1.4;min-height:48px;
}
.etl-quiz-opt:active{background:rgba(0,212,255,.14);}
.etl-quiz-opt.correct{background:rgba(45,198,83,.18);border-color:#2dc653;color:#2dc653;}
.etl-quiz-opt.wrong{background:rgba(255,68,68,.14);border-color:#ff4444;color:#ff4444;}
.etl-quiz-hint{
  font-size:12px;color:rgba(255,255,255,.55);line-height:1.6;
  background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.2);
  border-radius:9px;padding:10px 12px;flex-shrink:0;
}
.etl-quiz-next{
  align-self:stretch;padding:14px 24px;
  background:linear-gradient(135deg,#00d4ff,#2dc653);color:#000;
  border:none;border-radius:12px;
  font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:900;letter-spacing:1px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 0 16px rgba(0,212,255,.3);transition:all .18s;flex-shrink:0;
}
.etl-quiz-next:active{transform:scale(.97);}
.etl-quiz-prog{display:flex;gap:6px;align-self:center;flex-shrink:0;}
.etl-quiz-pip{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.12);}
.etl-quiz-pip.done{background:#2dc653;}
.etl-quiz-pip.active{background:#00d4ff;box-shadow:0 0 8px #00d4ff;}

/* ── RICH TOOL PANEL ─────────────────────────────────────── */
.etl-rich{display:grid;grid-template-columns:1fr 1fr 120px;gap:10px;padding:10px 14px 0;}
.etl-rich-col{display:flex;flex-direction:column;gap:7px;}
.etl-rich-hd{font-size:9px;font-weight:800;letter-spacing:2.5px;color:#00d4ff;display:flex;align-items:center;gap:5px;flex-shrink:0;}
.etl-rich-hd-icon{width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(0,212,255,.6);display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0;}
.etl-about-text{font-size:11.5px;color:rgba(255,255,255,.72);line-height:1.58;flex:1;}
.etl-feat-row{display:flex;flex-direction:column;gap:5px;margin-top:auto;}
.etl-feat-item{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:5px 8px;}
.etl-feat-icon{font-size:13px;flex-shrink:0;width:20px;text-align:center;}
.etl-feat-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.3px;}
.etl-howto-steps{display:flex;flex-direction:column;gap:6px;}
.etl-step{display:flex;align-items:flex-start;gap:7px;}
.etl-step-num{width:19px;height:19px;border-radius:6px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#00d4ff;flex-shrink:0;margin-top:1px;}
.etl-step-text{font-size:11px;color:rgba(255,255,255,.68);line-height:1.52;}
.etl-tip-box{background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.15);border-radius:10px;padding:9px 10px;display:flex;flex-direction:column;gap:5px;}
.etl-tip-head{font-size:9px;font-weight:800;letter-spacing:2px;color:#00d4ff;display:flex;align-items:center;gap:4px;flex-shrink:0;}
.etl-tip-text{font-size:10.5px;color:rgba(255,255,255,.55);line-height:1.55;}

/* ── NAV BAR (PREV / NEXT) ───────────────────────────────── */
.etl-nav{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 10px;border-top:1px solid rgba(0,212,255,.08);flex-shrink:0;gap:6px;margin-top:auto;}
.etl-nav-lesson{display:flex;align-items:center;gap:5px;background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.15);border-radius:8px;padding:7px 11px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;color:rgba(0,212,255,.65);cursor:pointer;-webkit-tap-highlight-color:transparent;}
.etl-nav-prev{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 14px;font-size:11px;font-weight:700;color:rgba(255,255,255,.45);cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px;-webkit-tap-highlight-color:transparent;transition:all .15s;touch-action:manipulation;}
.etl-nav-prev:active{transform:scale(.93);}
.etl-nav-next{background:linear-gradient(135deg,#00d4ff,#2dc653);border:none;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:900;color:#000;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;box-shadow:0 0 12px rgba(0,212,255,.2);transition:all .15s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
.etl-nav-next:active{transform:scale(.93);}
`;function ys(){if(document.querySelector("#etl-css"))return;const f=document.createElement("style");f.id="etl-css",f.textContent=vs,document.head.appendChild(f)}class ks{constructor(t){this.state=t,this._step=0,this._renderer=null,this._raf=null,this._toolMeshes={},this._quizAnswered=!1,this._quizScore=0,this._targetCam=null,this._camTarget=new m,this._camPos=new m,this.container=this._build()}_build(){ys();const t=document.createElement("div");t.className="screen screen-hidden",t.innerHTML=`
      <div class="etl">
        <header class="etl-top">
          <button class="etl-back">← BACK</button>
          <span class="etl-chlbl" id="etl-chlbl">TOOLS</span>
          <span class="etl-prog" id="etl-prog"></span>
        </header>
        <div class="etl-scene" id="etl-scene">
          <canvas id="etl-canvas" class="etl-canvas"></canvas>
          <div class="etl-tool-overlay" id="etl-tool-overlay"></div>
        </div>
        <div class="etl-dialog" id="etl-dialog"></div>
      </div>`;const e=t.querySelector(".etl-back"),s=()=>this.state.setState("stagesHub");return e.addEventListener("click",s),e.addEventListener("touchend",o=>{o.preventDefault(),s()}),this._el=t,t}_initThree(){if(this._renderer)return;const t=this._el.querySelector("#etl-canvas"),e=this._el.querySelector("#etl-scene"),s=e.offsetWidth,o=e.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}this._renderer=new _t({canvas:t,antialias:!0,alpha:!1}),this._renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this._renderer.setSize(s,o),this._renderer.setClearColor(395796),this._renderer.shadowMap.enabled=!0,this._renderer.shadowMap.type=Bt,this._renderer.toneMapping=Ht,this._renderer.toneMappingExposure=1.3,this._scene=new mt,this._scene.background=new R(395796),this._scene.fog=new Wt(395796,.018),this._camera=new xt(52,s/o,.1,100);const i=rt[0].cam??{p:[0,3,8],t:[0,0,0]};this._camera.position.set(...i.p),this._camTarget.set(...i.t),this._camera.lookAt(this._camTarget),this._targetCam=i,oe(this._scene),ie(this._scene,{benchY:-.07,benchW:15,benchD:5}),this._toolSpot=new At(16772829,5.5),this._toolSpot.position.set(1.8,4.5,2.2),this._toolSpot.target.position.set(0,.1,0),this._toolSpot.angle=.38,this._toolSpot.penumbra=.55,this._toolSpot.decay=1.4,this._toolSpot.castShadow=!0,this._toolSpot.shadow.mapSize.set(1024,1024),this._toolSpot.shadow.bias=-.002,this._scene.add(this._toolSpot),this._scene.add(this._toolSpot.target),this._rimLight=new ht(3368703,.55),this._rimLight.position.set(-3,3,-4),this._scene.add(this._rimLight);for(const a of Kt){const n=this[`_build_${a.id}`](a);n.visible=!1,this._scene.add(n),this._toolMeshes[a.id]=n,n.userData.baseY=n.position.y,n.userData.baseRx=n.rotation.x,n.userData.baseScale=n.scale.x,n.userData.displayRz=a.displayRz??0}this._resizeObs=new ResizeObserver(()=>{const a=e.offsetWidth,n=e.offsetHeight;!a||!n||(this._camera.aspect=a/n,this._camera.updateProjectionMatrix(),this._renderer.setSize(a,n))}),this._resizeObs.observe(e),this._tick(),rt[this._step]&&this._applyScene(rt[this._step].scene,rt[this._step])}_mat(t,e=.2,s=.65){return new g({color:t,metalness:e,roughness:s})}_build_lineman(){const t=new A,e=new g({color:7237230,roughness:.22,metalness:.88}),s=new g({color:3355443,roughness:.35,metalness:.8}),o=new g({color:11184810,roughness:.12,metalness:.95}),i=new g({color:13373713,roughness:.78,metalness:0}),a=new g({color:1118481,roughness:.76,metalness:0}),n=new g({color:10030606,roughness:.85,metalness:0}),r=new g({color:1710618,roughness:.85,metalness:0}),l=new A,c=new A,h=new p(new y(.62,.052,.16),e);h.position.set(.2,.66-.47,0),l.add(h);for(let x=0;x<9;x++){const T=new p(new y(.042,.022,.163),s);T.position.set(-.16+x*.065,.686-.47,0),l.add(T)}const d=new p(new y(.058,.28,.13),e);d.position.set(-.045,.33-.47,0),l.add(d);const u=new p(new lt(.052,.55,6,14),i);u.position.set(-.092,.05-.47,0),u.rotation.z=.24,l.add(u);for(let x=0;x<6;x++){const T=new p(new D(.054,.008,6,18),n);T.position.set(-.092+Math.sin(.24)*(-.1+x*.065),.2-.47-x*.075,0),T.rotation.set(Math.PI/2,0,.24),l.add(T)}const w=new p(new y(.08,.042,.082),s);w.position.set(-.07,.475-.47,.041),l.add(w);const b=new p(new y(.62,.052,.16),e);b.position.set(.2,.604-.47,0),c.add(b);for(let x=0;x<9;x++){const T=new p(new y(.042,.022,.163),s);T.position.set(-.16+x*.065,.583-.47,0),c.add(T)}const _=new p(new y(.058,.28,.13),e);_.position.set(.045,.33-.47,0),c.add(_);const v=new p(new lt(.052,.55,6,14),a);v.position.set(.092,.05-.47,0),v.rotation.z=-.24,c.add(v);for(let x=0;x<6;x++){const T=new p(new D(.054,.008,6,18),r);T.position.set(.092+Math.sin(-.24)*(-.1+x*.065),.2-.47-x*.075,0),T.rotation.set(Math.PI/2,0,-.24),c.add(T)}const E=new p(new y(.08,.042,.082),s);E.position.set(-.07,.475-.47,-.041),c.add(E),l.position.y=.47,c.position.y=.47;const M=new p(new k(.048,.048,.19,6),o);M.rotation.x=Math.PI/2,M.position.set(0,.47,0),t.add(M);const S=new p(new k(.044,.044,.008,6),s);return S.rotation.x=Math.PI/2,S.position.set(0,.47,.098),t.add(S),t.add(l),t.add(c),t.userData.armA=l,t.userData.armB=c,t.position.y=.08,t}_build_dykes(){const t=new A,e=this._mat(6710886,.8,.3),s=new A,o=new A,i=new p(new y(.13,.032,.07),e);i.position.set(-.04,.4-.28,0),i.rotation.z=-.32,s.add(i);const a=new p(new lt(.032,.36,4,8),this._mat(3364266));a.position.set(.05,.04-.28,0),a.rotation.z=.18,s.add(a);const n=new p(new y(.13,.032,.07),e);n.position.set(.04,.4-.28,0),n.rotation.z=.32,o.add(n);const r=new p(new lt(.032,.36,4,8),this._mat(1710638));r.position.set(-.05,-.15-.28,0),r.rotation.z=-.18,o.add(r),s.position.y=.28,o.position.y=.28;const l=new p(new k(.022,.022,.11,8),e);return l.rotation.x=Math.PI/2,l.position.y=.28,t.add(l),t.add(s),t.add(o),t.userData.armA=s,t.userData.armB=o,t.position.y=.08,t}_build_knife(){const t=new A,e=new p(new y(.1,.17,.52),this._mat(5592422));e.position.y=.085,t.add(e);const s=new p(new y(.006,.072,.28),this._mat(13158600,.9,.2));s.position.set(0,.12,-.34),t.add(s);const o=new p(new y(.006,.04,.06),this._mat(13158600,.9,.2));o.position.set(0,.09,-.45),o.rotation.x=.4,t.add(o);const i=new p(new y(.042,.058,.042),this._mat(3355460));return i.position.set(.073,.13,-.08),t.add(i),t.position.y=.085,t}_build_longnose(){const t=new A,e=new g({color:8026746,roughness:.2,metalness:.9}),s=new g({color:3355443,roughness:.35,metalness:.8}),o=new g({color:12303291,roughness:.1,metalness:.96}),i=new g({color:14492194,roughness:.76,metalness:0}),a=new g({color:1118481,roughness:.76,metalness:0}),n=new A,r=new A,l=new p(new y(.048,.8,.1),e);l.position.set(.022,.72-.22,0),l.rotation.z=.03,n.add(l);for(let b=0;b<7;b++){const _=new p(new y(.012,.044,.102),s);_.position.set(.01,.42-.22+b*.065,0),n.add(_)}const c=new p(new lt(.042,.5,5,12),i);c.position.set(.068,-.08-.22,0),c.rotation.z=.15,n.add(c);for(let b=0;b<5;b++){const _=new p(new D(.044,.007,6,16),new g({color:11145489,roughness:.85}));_.position.set(.068+Math.sin(.15)*(-.05+b*.058),-.02-.22-b*.068,0),_.rotation.set(Math.PI/2,0,.15),n.add(_)}const h=new p(new y(.048,.8,.1),e);h.position.set(-.022,.72-.22,0),h.rotation.z=-.03,r.add(h);for(let b=0;b<7;b++){const _=new p(new y(.012,.044,.102),s);_.position.set(-.01,.42-.22+b*.065,0),r.add(_)}const d=new p(new lt(.042,.5,5,12),a);d.position.set(-.068,-.08-.22,0),d.rotation.z=-.15,r.add(d);for(let b=0;b<5;b++){const _=new p(new D(.044,.007,6,16),new g({color:2236962,roughness:.85}));_.position.set(-.068+Math.sin(-.15)*(-.05+b*.058),-.02-.22-b*.068,0),_.rotation.set(Math.PI/2,0,-.15),r.add(_)}n.position.y=.22,r.position.y=.22;const u=new p(new k(.036,.036,.15,6),o);u.rotation.x=Math.PI/2,u.position.set(0,.22,0),t.add(u);const w=new A;for(let b=0;b<8;b++){const _=b/7*Math.PI,v=new p(new y(.012,.012,.012),new g({color:11184810,roughness:.3,metalness:.85}));v.position.set(Math.cos(_)*.055,.02,Math.sin(_)*.055),w.add(v)}return t.add(w),t.add(n),t.add(r),t.userData.armA=n,t.userData.armB=r,t.userData.spring=w,t.position.y=.08,t}_build_conduitbender(){const t=new A,e=this._mat(14505216,.3,.7),s=this._mat(8947848,.8,.3),o=[];for(let l=0;l<=20;l++){const c=l/20*(Math.PI*.6)-.12;o.push(new m(Math.sin(c)*.88,Math.cos(c)*.88,0))}const i=new p(new ct(new ut(o),20,.044,8,!1),e);i.position.set(0,.08,0),t.add(i);const a=new p(new k(.024,.024,1.45,8),s);a.position.set(0,-.68,0),t.add(a);const n=new p(new y(.14,.04,.09),e);n.position.set(-.34,.07,0),t.add(n);const r=new p(new y(.022,.022,.065),this._mat(16772608,0,1));return r.position.set(-.61,.73,.05),t.add(r),t.scale.setScalar(.85),t.position.y=.1,t}_build_flathead(){const t=new A,e=new g({color:10066329,roughness:.18,metalness:.92}),s=new g({color:13421772,roughness:.1,metalness:.96}),o=new g({color:16750848,roughness:.72,metalness:0}),i=new g({color:13399808,roughness:.82,metalness:0});for(let d=0;d<3;d++){const u=d/3*Math.PI*2,w=new p(new k(.052,.044,.46,10),o);w.position.set(Math.cos(u)*.02,.44,Math.sin(u)*.02),t.add(w)}const a=new p(new k(.058,.058,.028,14),i);a.position.y=.685,t.add(a);const n=new p(new k(.04,.035,.045,14),s);n.position.y=.195,t.add(n);for(let d=0;d<5;d++){const u=new p(new D(.056,.007,6,16),i);u.position.y=.6-d*.072,u.rotation.x=Math.PI/2,t.add(u)}const r=new p(new k(.018,.018,.18,6),e);r.position.y=.085,t.add(r);const l=new p(new k(.013,.013,.24,10),e);l.position.y=-.075,t.add(l);const c=new p(new y(.095,.01,.018),s);c.position.y=-.215,t.add(c);const h=new p(new y(.095,.005,.012),s);return h.position.y=-.222,t.add(h),t.position.y=.23,t}_build_phillips(){const t=new A,e=new g({color:10066329,roughness:.18,metalness:.92}),s=new g({color:13421772,roughness:.1,metalness:.96}),o=new g({color:16737792,roughness:.72,metalness:0}),i=new g({color:13386752,roughness:.82,metalness:0});for(let h=0;h<3;h++){const d=h/3*Math.PI*2,u=new p(new k(.052,.044,.46,10),o);u.position.set(Math.cos(d)*.02,.44,Math.sin(d)*.02),t.add(u)}const a=new p(new k(.058,.058,.028,14),i);a.position.y=.685,t.add(a);const n=new p(new k(.04,.035,.045,14),s);n.position.y=.195,t.add(n);for(let h=0;h<5;h++){const d=new p(new D(.056,.007,6,16),i);d.position.y=.6-h*.072,d.rotation.x=Math.PI/2,t.add(d)}const r=new p(new k(.018,.018,.18,6),e);r.position.y=.085,t.add(r);const l=new p(new k(.013,.013,.24,10),e);l.position.y=-.075,t.add(l),[0,1].forEach(h=>{const d=new p(new y(.082,.012,.016),s);d.position.y=-.212,d.rotation.y=h*Math.PI/2,t.add(d)});const c=new p(new Jt(.014,.028,8),s);return c.position.y=-.232,c.rotation.x=Math.PI,t.add(c),t.position.y=.23,t}_build_tape(){const t=new A,e=new p(new D(.27,.09,12,32),this._mat(1118481,.1,.9));e.rotation.x=Math.PI/2,t.add(e);const s=new p(new k(.17,.17,.18,16),this._mat(2761240,.1,.9));return t.add(s),t.scale.setScalar(.8),t.position.y=.22,t}_build_tester(){const t=new A,e=new g({color:16763904,roughness:.6,metalness:.1}),s=new g({color:1118481,roughness:.8,metalness:0}),o=new g({color:16777215,roughness:.1,transmission:.9,transparent:!0,opacity:.5}),i=new g({color:15658734,roughness:.4,metalness:.4}),a=new p(new k(.045,.038,.65,16),e);a.position.y=.12,t.add(a);const n=new p(new k(.04,.03,.28,16),s);n.position.y=-.34,t.add(n);for(let v=0;v<4;v++){const E=new p(new D(.042-v*.002,.005,6,16),s);E.position.y=-.25-v*.06,E.rotation.x=Math.PI/2,t.add(E)}const r=new p(new k(.015,.026,.22,12),i);r.position.y=-.59,t.add(r);const l=new p(new Jt(.015,.04,12),i);l.position.y=-.72,l.rotation.x=Math.PI,t.add(l);const c=new p(new k(.045,.045,.06,16),s);c.position.y=.47,t.add(c);const h=new p(new gt(.035,12,12,0,Math.PI*2,0,Math.PI/2),o);h.position.y=.5,t.add(h);const d=new p(new gt(.018,8,8),new g({color:16720384,emissive:16720384,emissiveIntensity:1.2}));d.position.set(0,.49,0),t.add(d);const u=new p(new y(.05,.02,.06),s);u.position.set(-.04,.45,0),t.add(u);const w=new p(new y(.015,.4,.03),s);w.position.set(-.06,.25,0),t.add(w);const b=new p(new y(.022,.02,.03),s);b.position.set(-.055,.05,0),t.add(b);const _=new p(new y(.018,.06,.03),s);return _.position.set(.042,.2,0),t.add(_),t.scale.setScalar(.88),t.position.y=.45,t}_build_multimeter(){const t=new A,e=new g({color:1710618,roughness:.65,metalness:0}),s=new g({color:16755200,roughness:.85,metalness:0}),o=new g({color:13373713,roughness:.5,metalness:.2}),i=new g({color:1118481,roughness:.5,metalness:.2}),a=new p(new y(.38,.6,.08),e);t.add(a);const n=new p(new y(.44,.64,.09),s);n.position.z=-.01,t.add(n);const r=document.createElement("canvas");r.width=128,r.height=64;const l=r.getContext("2d");l.fillStyle="#a1b5a5",l.fillRect(0,0,128,64),l.fillStyle="#111111",l.font="bold 42px monospace",l.fillText("120.4",8,48),l.font="14px sans-serif",l.fillText("V~",104,48);const c=new ft(r),h=new p(new y(.28,.16,.02),new g({map:c,roughness:.2,metalness:.1}));h.position.set(0,.16,.041),t.add(h);const d=new p(new y(.3,.18,.015),e);d.position.set(0,.16,.04),t.add(d);const u=new p(new k(.11,.11,.015,24),e);u.rotation.x=Math.PI/2,u.position.set(0,-.06,.04),t.add(u);const w=new p(new k(.08,.08,.03,16),e);w.rotation.x=Math.PI/2,w.position.set(0,-.06,.05),t.add(w);for(let _=0;_<8;_++){const v=_/8*Math.PI*2,E=new p(new y(.02,.035,.025),e);E.position.set(Math.cos(v)*.08,-.06+Math.sin(v)*.08,.05),t.add(E)}const b=new p(new y(.012,.08,.035),new g({color:16777215}));return b.position.set(0,-.02,.05),t.add(b),[-.1,0,.1].forEach((_,v)=>{const E=new p(new k(.02,.02,.02,12),v===0?i:o);E.rotation.x=Math.PI/2,E.position.set(_,-.24,.042),t.add(E);const M=new p(new k(.012,.012,.022,12),new g({color:0}));M.rotation.x=Math.PI/2,M.position.set(_,-.24,.044),t.add(M)}),t.scale.setScalar(.78),t.position.y=.24,t}_build_fishtape(){const t=new A,e=this._mat(16737792,.2,.7),s=new p(new k(.32,.32,.14,20),e);t.add(s),[-.08,.08].forEach(a=>{const n=new p(new k(.35,.35,.02,20),this._mat(14500864,.2,.7));n.position.y=a,t.add(n)});const o=new p(new lt(.028,.22,4,8),this._mat(3355443,.1,.8));o.position.set(.36,.14,0),o.rotation.z=Math.PI/2,t.add(o);const i=new p(new y(.24,.012,.018),this._mat(8947848,.8,.3));return i.position.set(.34,0,0),t.add(i),t.rotation.x=Math.PI/2,t.scale.setScalar(.85),t.position.y=.27,t}_build_measuringtape(){const t=new A,e=new p(new y(.38,.22,.28),this._mat(16763904,.1,.7));t.add(e);for(let i=0;i<4;i++){const a=new p(new y(.005,.22,.28),this._mat(14526976,.1,.8));a.position.x=-.15+i*.1,t.add(a)}const s=new p(new y(.42,.018,.022),this._mat(14540253,.6,.4));s.position.set(.4,.06,.06),t.add(s);const o=new p(new y(.018,.26,.02),this._mat(5592405,.7,.4));return o.position.set(-.2,.02,.15),t.add(o),t.scale.setScalar(.85),t.position.y=.1,t}_applyScene(t,e){var n,r,l;for(const c of Object.values(this._toolMeshes))c.visible=!1,c.rotation.set(0,0,0),c.scale.setScalar(1);const s=(e==null?void 0:e.cam)??{p:[0,3,8],t:[0,0,0]};if(this._targetCam=s,t==="bench_clean")return;if(t==="all_tools"){Kt.forEach(c=>{const h=this._toolMeshes[c.id];h.visible=!0,h.position.set(-2.5+c.xi*1.02,.08,-.65+c.row*1.32),h.rotation.set(-Math.PI/2,0,0),h.scale.setScalar(.65)});return}const o={cutting_group:["lineman","dykes","knife"],gripping_group:["longnose","conduitbender"],fastening_group:["flathead","phillips"],testing_group:["tester","multimeter","fishtape","measuringtape"]};if(o[t]){const c=o[t],h=(c.length-1)*1.65;c.forEach((d,u)=>{const w=this._toolMeshes[d];w.visible=!0,w.position.set(-h/2+u*1.65,.08,0),w.rotation.set(-Math.PI/2,0,0),w.scale.setScalar(.85)});return}this._animProps&&(this._scene.remove(this._animProps),this._animProps=null);const i=t.startsWith("show_")||t.startsWith("anim_")||t==="quiz";if(this._toolSpot&&(this._toolSpot.intensity=i?5.5:0),this._rimLight&&(this._rimLight.intensity=i?.55:.18),t.startsWith("show_")||t==="quiz"?this._targetCam={p:[.35,1.5,2.8],t:[0,1,0]}:t.startsWith("anim_")&&(this._targetCam={p:[0,1.5,3],t:[0,1,0]}),i){const c=t==="quiz"?((n=Et[e==null?void 0:e.qi])==null?void 0:n.vis)??null:t.split("_")[1],h=c?this._toolMeshes[c]:null;if(h){h.visible=!0;const u=(h.userData.baseScale??1)*2;h.scale.setScalar(u);const w=Kt.find(E=>E.id===c),b=(w==null?void 0:w.displayRz)??0;h.rotation.set(h.userData.baseRx??0,.42,b),h.position.set(0,100,.1),h.updateMatrixWorld(!0);const _=new me().setFromObject(h),v=100.02-_.min.y;if(h.position.y=v,h.userData.displayY=v,this._toolSpot){const E=v-100,M=(_.min.y+_.max.y)*.5+E,S=_.max.y+E;this._toolSpot.target.position.set(.1,M,.1),this._toolSpot.target.updateMatrixWorld(),this._toolSpot.position.set(1.6,S+3.2,2)}}const d=(r=this._el)==null?void 0:r.querySelector("#etl-tool-overlay");if(d&&h&&c){const u=Kt.find(w=>w.id===c);d.textContent=(u==null?void 0:u.name)??"",d.classList.toggle("show",!!u&&t!=="quiz")}else d&&d.classList.remove("show");if(t.startsWith("anim_")){if(this._animProps=new A,this._animProps.position.set(0,(h==null?void 0:h.userData.displayY)??.2,.1),this._scene.add(this._animProps),c==="lineman"||c==="dykes"){const u=new p(new k(.038,.038,1.6,12),this._mat(13382451,.1,.7));u.rotation.z=Math.PI/2,u.position.set(.1,.18,0),this._animProps.add(u);const w=new p(new k(.028,.028,.12,8),this._mat(14252101,.1,.85));w.rotation.z=Math.PI/2,w.position.set(.82,.18,0),this._animProps.add(w)}else if(c==="flathead"||c==="phillips"){const u=new p(new k(.09,.07,.12,12),this._mat(8947848,.8,.3));u.position.set(0,-.22,0),this._animProps.add(u);const w=new p(new k(.07,.07,.6,12),this._mat(5592405,.5,.5));w.position.set(0,-.58,0),this._animProps.add(w)}else if(c==="tester"){const u=new p(new k(.038,.038,1.6,12),this._mat(1118481,.1,.7));u.rotation.z=Math.PI/2,u.position.set(.2,-.3,0),this._animProps.add(u)}}return}const a=(l=this._el)==null?void 0:l.querySelector("#etl-tool-overlay");a&&a.classList.remove("show")}_gotoStep(t){this._step=t,this._quizAnswered=!1;const e=rt[t];this._el.querySelector("#etl-chlbl").textContent=e.chLbl??"TOOLS",this._el.querySelector("#etl-prog").textContent=`${t+1}/${rt.length}`,this._el.querySelector(".etl").classList.toggle("etl--quiz",e.t==="quiz"),this._applyScene(e.scene,e),this._renderDialog(e)}_renderDialog(t){var s,o;const e=this._el.querySelector("#etl-dialog");if(t.t==="chap"){e.innerHTML=`
        <div class="etl-chap-wrap">
          <div class="etl-chap-num">CHAPTER ${t.ch}</div>
          <div class="etl-chap-title">${t.title}</div>
          <div class="etl-chap-body">${t.text}</div>
        </div>
        <button class="etl-dlg-btn" id="etl-btn">NEXT →</button>`,e.querySelector("#etl-btn").addEventListener("click",()=>this._onNext());return}if(t.t==="quiz"){const i=Et[t.qi],a=Et.map((n,r)=>`<div class="etl-quiz-pip ${r<t.qi?"done":r===t.qi?"active":""}"></div>`).join("");e.innerHTML=`
        <div class="etl-quiz-header">
          <span class="etl-quiz-hd-label">Question ${t.qi+1} / ${Et.length}</span>
          <span class="etl-quiz-hd-score">${this._quizScore} correct</span>
        </div>
        <div class="etl-quiz-prog">${a}</div>
        <div class="etl-quiz-q">${i.q}</div>
        <div class="etl-quiz-opts">
          ${i.opts.map((n,r)=>`<button class="etl-quiz-opt" data-i="${r}">${n}</button>`).join("")}
        </div>`,e.querySelectorAll(".etl-quiz-opt").forEach(n=>{n.addEventListener("click",()=>this._onQuizAnswer(parseInt(n.dataset.i)))});return}if(t.t==="done"){const i=this._quizScore>=5?"#2dc653":this._quizScore>=3?"#ffaa22":"#ff4444";e.innerHTML=`
        <div class="etl-dlg-title">${t.title}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:${i};letter-spacing:2px;">QUIZ: ${this._quizScore}/${Et.length} CORRECT</div>
        <div class="etl-dlg-body">${t.text}</div>
        <button class="etl-dlg-btn" id="etl-btn" style="background:linear-gradient(135deg,#2dc653,#00d4ff)">${t.btn}</button>`,e.querySelector("#etl-btn").addEventListener("click",()=>this._onNext());return}if(t.t==="tool"){const i=t.features.map(([n,r])=>`
        <div class="etl-feat-item">
          <span class="etl-feat-icon">${n}</span>
          <span class="etl-feat-label">${r}</span>
        </div>`).join(""),a=t.howTo.map((n,r)=>`
        <div class="etl-step">
          <div class="etl-step-num">${r+1}</div>
          <div class="etl-step-text">${n}</div>
        </div>`).join("");e.innerHTML=`
        <div class="etl-rich">
          <div class="etl-rich-col">
            <div class="etl-rich-hd"><div class="etl-rich-hd-icon">i</div> ABOUT THE TOOL</div>
            <div class="etl-about-text">${t.about}</div>
            <div class="etl-feat-row">${i}</div>
          </div>
          <div class="etl-rich-col">
            <div class="etl-rich-hd">HOW TO USE</div>
            <div class="etl-howto-steps">${a}</div>
          </div>
          <div class="etl-tip-box">
            <div class="etl-tip-head">💡 TIP</div>
            <div class="etl-tip-text">${t.tip}</div>
          </div>
        </div>
        <div class="etl-nav">
          <button class="etl-nav-lesson">📖 OVERVIEW</button>
          <div style="display:flex;gap:7px;">
            <button class="etl-nav-prev" id="etl-prev">← PREV</button>
            <button class="etl-nav-next" id="etl-next">NEXT →</button>
          </div>
        </div>`,e.querySelector("#etl-prev").addEventListener("click",()=>this._onPrev()),e.querySelector("#etl-next").addEventListener("click",()=>this._onNext()),e.querySelector(".etl-nav-lesson").addEventListener("click",()=>this._gotoStep(0));return}e.innerHTML=`
      ${t.title?`<div class="etl-dlg-title">${t.title}</div>`:""}
      <div class="etl-dlg-body">${t.text??""}</div>
      <div class="etl-nav" style="border-top:none;padding:0;margin-top:auto;">
        ${this._step>0?'<button class="etl-nav-prev" id="etl-prev">← PREV</button>':"<div></div>"}
        <button class="etl-nav-next" id="etl-next">${t.btn??"NEXT →"}</button>
      </div>`,(s=e.querySelector("#etl-next"))==null||s.addEventListener("click",()=>this._onNext()),(o=e.querySelector("#etl-prev"))==null||o.addEventListener("click",()=>this._onPrev())}_onNext(){if(rt[this._step].t==="done"){const e=O.getLessonProgress().electricianTools;O.completeLesson("electricianTools"),O.saveLearnStage("electricianTools"),e||O.addXP(100+this._quizScore*25),this.state.setState("stagesHub");return}this._step<rt.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}_onQuizAnswer(t){if(this._quizAnswered)return;this._quizAnswered=!0;const e=Et[rt[this._step].qi];t===e.a&&this._quizScore++,this._el.querySelectorAll(".etl-quiz-opt").forEach((a,n)=>{a.disabled=!0,n===e.a?a.classList.add("correct"):n===t&&t!==e.a&&a.classList.add("wrong")});const s=this._el.querySelector("#etl-dialog"),o=document.createElement("div");o.className="etl-quiz-hint",o.textContent=e.hint,s.appendChild(o);const i=document.createElement("button");i.className="etl-quiz-next",i.textContent="NEXT →",i.addEventListener("click",()=>{this._step<rt.length-1&&this._gotoStep(this._step+1)}),s.appendChild(i)}_tick(){var i,a;if(!this._renderer)return;this._raf=requestAnimationFrame(()=>this._tick());const t=performance.now()*.001;if(this._targetCam){const[n,r,l]=this._targetCam.p,[c,h,d]=this._targetCam.t;this._camera.position.x+=(n-this._camera.position.x)*.06,this._camera.position.y+=(r-this._camera.position.y)*.06,this._camera.position.z+=(l-this._camera.position.z)*.06,this._camTarget.x+=(c-this._camTarget.x)*.06,this._camTarget.y+=(h-this._camTarget.y)*.06,this._camTarget.z+=(d-this._camTarget.z)*.06,this._camera.lookAt(this._camTarget)}const e=rt[this._step],s=(i=e==null?void 0:e.scene)==null?void 0:i.startsWith("anim_");if(((a=e==null?void 0:e.scene)==null?void 0:a.startsWith("show_"))||(e==null?void 0:e.scene)==="quiz"){for(const n of Object.values(this._toolMeshes)){if(!n.visible)continue;const r=n.userData.displayRz??0;n.rotation.y=.42+Math.sin(t*.32)*.5,n.rotation.z=r+Math.sin(t*.2)*.025;const l=n.userData.displayY??.2;n.position.y=l+Math.sin(t*.52)*.018}this._toolSpot&&(this._toolSpot.intensity=5.2+Math.sin(t*.7)*.4)}else if(s){const n=e.scene.split("_")[1],r=this._toolMeshes[n];if(r){const l=t*2.8,c=r.userData.displayY??.2;if(r.position.y=c+Math.sin(t*.52)*.016,n==="lineman"||n==="dykes"||n==="longnose"){r.rotation.y=.55+Math.sin(t*.3)*.3;const h=(Math.sin(l)*.5+.5)*.22;r.userData.armA&&(r.userData.armA.rotation.z=h),r.userData.armB&&(r.userData.armB.rotation.z=-h)}else if(n==="flathead"||n==="phillips")r.rotation.y=t*1.8,r.rotation.z=.12+Math.sin(l*.5)*.06;else if(n==="knife")r.rotation.y=.55+Math.sin(t*.4)*.5,r.rotation.z=.12+Math.sin(l*.5)*.18;else if(n==="tester"){r.rotation.y=.55+Math.sin(t*.3)*.35;const h=r.children.find(d=>{var u;return(u=d.material)==null?void 0:u.emissive});h&&(h.material.emissiveIntensity=.8+Math.sin(t*14)*.8)}else n==="conduitbender"?(r.rotation.y=.55,r.rotation.z=.12+Math.sin(l*.45)*.28):n==="tape"?r.rotation.y=t*1.4:r.rotation.y=.55+Math.sin(t*.3)*.5;this._toolSpot&&(this._toolSpot.intensity=5.2+Math.sin(t*.7)*.4)}}this._renderer.render(this._scene,this._camera)}onShow(){this._quizScore=0,this._gotoStep(0),setTimeout(()=>this._initThree(),80)}onHide(){this._raf&&(cancelAnimationFrame(this._raf),this._raf=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._renderer&&(this._renderer.dispose(),this._renderer=null,this._scene=null,this._camera=null,this._toolMeshes={},this._toolSpot=null,this._rimLight=null,this._animProps=null)}}const be=[{q:"Which tool automatically adjusts to any wire gauge without notch selection?",opts:["Manual Stripper","Automatic Stripper","Utility Knife","Rotary Stripper"],a:1,hint:"Automatic strippers have self-adjusting jaws — no notch selection, no gauge matching required."},{q:"What is the correct technique when using a utility knife to strip wire insulation?",opts:["Score around the wire in a circle","Score along the length of the wire","Press the blade straight down","Spin the knife around the wire"],a:1,hint:"Scoring lengthwise cannot nick the conductor below. A circular score almost always does."},{q:"Which tool is best for removing the outer jacket of NM-B (Romex) cable?",opts:["Manual Wire Stripper","Rotary Stripper","Utility Knife","Automatic Stripper"],a:2,hint:"The outer NM-B sheath is too large for manual strippers. The utility knife scored lengthwise along the jacket is correct."},{q:"What happens when you use the wrong notch size on a manual wire stripper?",opts:["The insulation tears cleanly","The conductor strands get crushed or nicked","Nothing — it self-adjusts","The tool breaks"],a:1,hint:"Too small a notch crushes the copper strands inside. Always match the notch AWG marking to the wire gauge."},{q:"What is the correct exposed conductor length for most standard terminal connections?",opts:["2–3 mm","6–10 mm","15–20 mm","25–30 mm"],a:1,hint:"6–10 mm is the standard for most terminals. More creates a shock hazard; less means poor contact."}],Le=[{q:"You are stripping 50 pieces of 14 AWG THHN on a job site. Speed matters most.",a:"automatic"},{q:"Removing the outer jacket from a length of NM-B (Romex) cable.",a:"knife"},{q:"Inside a distribution panel — one conductor, one precision ring cut needed.",a:"rotary"},{q:"Quick home repair: stripping a single 12 AWG TW wire at an outlet box.",a:"manual"},{q:"Preparing coaxial cable for a CCTV security camera installation.",a:"rotary"}],ue=[{id:"manual",name:"MANUAL STRIPPER",col:13378048,hex:"#cc2200",x:-2.8},{id:"automatic",name:"AUTO STRIPPER",col:1136076,hex:"#1155cc",x:-.9},{id:"knife",name:"UTILITY KNIFE",col:5592422,hex:"#666677",x:.9},{id:"rotary",name:"ROTARY STRIPPER",col:16755200,hex:"#ffaa00",x:2.8}],Q=[{t:"intro",ch:0,chLbl:"WIRE STRIPPING",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",mascotIn:!0,text:`Before any wire can make a connection, it must be stripped. Use the wrong tool — or wrong technique — and you damage the conductor. That means heat, faults, and fire.

This lesson teaches you the four stripping tools used in Philippine electrical work.`,btn:"NEXT"},{t:"info",ch:0,chLbl:"WIRE STRIPPING",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:`Five chapters:
1 — Why tool choice matters
2 — The four stripping tools
3 — Tool selection challenge
4 — Strip quality standards
5 — Tool care and maintenance`,btn:"LET'S START"},{t:"chap",ch:1,chLbl:"CH.1 TOOL CHOICE",cam:{p:[0,2,6],t:[0,-.1,0]},scene:"bench_clean",text:"Three methods you will see on job sites — each one wrong. Understanding why helps you remember the correct approach.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_teeth",text:"TEETH — Never strip wire with your teeth. You nick the conductor at the bite point, creating a high-resistance stress spot that heats up under load. Illegal in all professional electrical installations.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_crush",text:"WRONG NOTCH — Too-small a notch on a manual stripper crushes the copper strands inside. Crushed strands have higher resistance. Under load that section heats up and melts the surrounding insulation from the inside.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_nick",text:"DEEP KNIFE CUT — Scoring around the wire with a knife too deeply nicks the copper. Even a small nick concentrates stress — under load or repeated bending, the wire can break inside the wall where you cannot inspect it.",btn:"NEXT"},{t:"info",ch:1,chLbl:"CH.1 THE STANDARD",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"good_strip",text:`A correct strip has three things:
✓ Clean 90° insulation edge — no tearing
✓ Zero nicks on the copper — smooth surface
✓ Correct length — 6 to 10 mm for most terminals

Every time. No exceptions.`,btn:"NEXT CHAPTER"},{t:"chap",ch:2,chLbl:"CH.2 THE 4 TOOLS",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",text:"Four tools. Each one has a specific strength. Each one has specific use cases. You need to know all four.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_manual",text:"MANUAL WIRE STRIPPER — the most common tool on Philippine job sites. Multiple notches for different AWG gauges. Squeeze the handles — the jaws grip and cut the insulation at the exact depth without touching the copper.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_manual",text:"Position the wire in the correct notch. Squeeze firmly and rotate 360°. Pull — the insulation sleeve slides off cleanly. The copper is untouched.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_manual",text:"BEST FOR: THHN, TW, NM-B individual conductors in 12–14 AWG. Fast for single wires in everyday installations. Always match the notch label to the wire's AWG gauge.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_automatic",text:"AUTOMATIC WIRE STRIPPER — self-adjusting jaws detect the wire gauge and grip automatically. One squeeze action cuts and pulls simultaneously. No notch selection, no rotation. Faster than manual.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_automatic",text:"Insert the wire into the front port. Squeeze the trigger — the self-adjusting jaws clamp, cut, and pull in a single motion. The wire drops out stripped in one second.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_automatic",text:"BEST FOR: high-volume work, stranded wires, 10–26 AWG. More expensive than manual, but essential on large installations where you strip hundreds of wires per job.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_knife",text:"UTILITY KNIFE — standard box cutter used with the correct technique. Key rule: score LENGTHWISE, not around the wire. A lengthwise score cannot reach the conductor below. A circular cut almost always does.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_knife",text:"Score along the insulation lengthwise on two sides. Light pressure — let the blade's sharpness do the work. Peel back the scored sections and strip off the insulation.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_knife",text:"BEST FOR: NM-B outer sheath, BX jacket, UF-B jacket — large cables where manual strippers are too small. Not recommended for individual conductors; the nick risk is too high for most skill levels.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_rotary",text:"ROTARY WIRE STRIPPER — a circular blade scores a perfect ring around the insulation as you rotate the tool. Produces the cleanest, most consistent strip. Common in panel work and coaxial cable installations.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_rotary",text:"Clamp the tool at the strip mark. Rotate 2 to 3 full turns — the circular blade scores all the way around. Pull the insulation sleeve off cleanly.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_rotary",text:"BEST FOR: coaxial cable, THHN in panels, any wire needing a precision ring cut. The blade depth is preset by the tool — you physically cannot cut too deep.",btn:"NEXT CHAPTER"},{t:"chap",ch:3,chLbl:"CH.3 TOOL QUIZ",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",text:"Chapter 3. Five scenarios. Tap the correct tool on the bench for each job. All four tools are in front of you.",btn:"START"},{t:"tselect",ch:3,chLbl:"CH.3 — Q1/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:0},{t:"tselect",ch:3,chLbl:"CH.3 — Q2/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:1},{t:"tselect",ch:3,chLbl:"CH.3 — Q3/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:2},{t:"tselect",ch:3,chLbl:"CH.3 — Q4/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:3},{t:"tselect",ch:3,chLbl:"CH.3 — Q5/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:4},{t:"chap",ch:4,chLbl:"CH.4 STRIP QUALITY",cam:{p:[0,1.8,5.5],t:[0,-.2,0]},scene:"quality_good",text:"Chapter 4. Strip quality. Not all strips are equal. Learn to identify good and bad — this is how you inspect your own work before it goes into a terminal.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"nick",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_nick",text:"FAIL — NICKED COPPER. The blade cut too deep and scored the conductor. At the nick, current concentrates and heats the wire. Insulation softens and cracks from the inside. A fire risk hidden in the wall.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"long",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_long",text:"FAIL — TOO LONG. Too much exposed conductor beyond the terminal creates a live shock hazard. PEC requires bare conductor to be limited to terminal contact only.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"ragged",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_ragged",text:"FAIL — RAGGED EDGE. The insulation was torn, not cut cleanly. Individual strands may be broken inside the insulation where you cannot see them. Use a sharp tool, not force.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — PASS",qType:"good",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_good",text:"PASS — CLEAN STRIP. 90° edge, no nicks, 6–10 mm exposed. This is the professional standard. Every strip you make — on a repair or a new installation — should look exactly like this.",btn:"NEXT CHAPTER"},{t:"chap",ch:5,chLbl:"CH.5 TOOL CARE",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"Chapter 5. Tool maintenance. A clean, sharp tool strips cleanly. A dirty or dull tool damages wires.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 CLEAN",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"CLEAN AFTER EVERY JOB. Insulation debris in notches changes the effective cut depth. A plugged notch means you are using the wrong size without knowing it. Wipe blades dry. Use a small brush on notch channels.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 BLADES",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"BLADE SHARPNESS. When a utility knife drags instead of cutting, replace the blade — pressing harder increases nick risk. Dull rotary stripper blades should be replaced, not forced. Manual stripper jaws can be honed with a flat jeweler's file.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 STORAGE",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"STORAGE. Always retract utility knife blades before storing. Moisture rusts blades and stiffens springs in manual strippers — a stiff spring means inconsistent closing force, which means inconsistent cut depth.",btn:"NEXT CHAPTER"},{t:"qintro",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,2.5,7],t:[0,-.3,0]},scene:"bench_clean",text:"Five questions. Take your time — you have covered all of this.",btn:"START QUIZ"},...be.map((f,t)=>({t:"quiz",ch:6,chLbl:`QUESTION ${t+1}/5`,cam:{p:[0,2.5,7],t:[0,-.3,0]},scene:"bench_clean",qi:t})),{t:"done",ch:7,chLbl:"COMPLETE",cam:{p:[0,2.8,8],t:[0,-.2,0]},scene:"bench_tools",text:`Wire Stripping complete.

You know the four tools, when each one is correct, what a quality strip looks like, and how to maintain your tools. Apply this every time you pick up a wire.`,btn:"FINISH"}],Ts=`
.wsl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

.wsl-top{height:48px;background:rgba(4,8,18,.98);border-bottom:1px solid rgba(255,165,0,.15);display:flex;align-items:center;padding:0 12px;gap:10px;flex-shrink:0;}
.wsl-back{background:rgba(255,165,0,.08);border:1px solid rgba(255,165,0,.28);color:#ffaa00;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wsl-top-center{flex:1;text-align:center;}
.wsl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#ffaa00;display:block;}
.wsl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

.wsl-scene{height:44vh;min-height:200px;max-height:340px;position:relative;flex-shrink:0;background:#07101f;overflow:hidden;}
.wsl-canvas{display:block;}

.wsl-tap-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(255,170,0,.9);letter-spacing:2px;pointer-events:none;animation:wslPulse 1.2s ease-in-out infinite;background:rgba(4,10,24,.8);padding:5px 14px;border-radius:20px;border:1px solid rgba(255,170,0,.3);white-space:nowrap;}
@keyframes wslPulse{0%,100%{opacity:.45;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.03)}}

.wsl-feedback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .1s;}
.wsl-feedback.show{opacity:1;}
.wsl-fb{font-size:88px;line-height:1;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 0 22px rgba(255,255,255,.5));}
@keyframes wslPop{from{transform:scale(0) rotate(-15deg)}to{transform:scale(1) rotate(0)}}

.wsl-tool-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(4,10,24,.92);border-radius:12px;padding:6px 18px;text-align:center;display:none;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(255,170,0,.3);}
.wsl-tool-badge.show{display:block;}
.wsl-tool-badge-name{font-size:17px;font-weight:900;letter-spacing:2px;color:#fff;}
.wsl-tool-badge-tag{font-family:'Share Tech Mono',monospace;font-size:9px;color:#ffaa00;letter-spacing:1px;}

.wsl-quality-badge{position:absolute;top:10px;right:14px;border-radius:10px;padding:5px 14px;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;display:none;animation:wslPop .3s cubic-bezier(.34,1.56,.64,1);}
.wsl-quality-badge.fail{display:block;background:rgba(255,68,68,.18);border:1px solid #ff4444;color:#ff4444;}
.wsl-quality-badge.pass{display:block;background:rgba(45,198,83,.18);border:1px solid #2dc653;color:#2dc653;}

.wsl-dialog{flex:1;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;min-height:0;}
.wsl-bubble{background:rgba(8,18,42,.98);border:1px solid rgba(255,170,0,.18);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;flex:1;overflow:hidden;}
.wsl-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,170,0,.35);flex-shrink:0;transform:translateX(60px);opacity:0;transition:transform .55s cubic-bezier(.25,.46,.45,.94),opacity .55s;}
.wsl-avatar.entered{transform:translateX(0);opacity:1;}
.wsl-bubble-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.wsl-bubble-name{font-family:'Share Tech Mono',monospace;font-size:9px;color:#ffaa00;letter-spacing:3px;display:flex;align-items:center;gap:6px;}
.wsl-wave{display:flex;gap:2px;align-items:center;}
.wsl-wave span{width:2px;border-radius:2px;background:#ffaa00;animation:wslWave .8s ease-in-out infinite;}
.wsl-wave span:nth-child(2){animation-delay:.15s;}.wsl-wave span:nth-child(3){animation-delay:.3s;}
@keyframes wslWave{0%,100%{height:3px}50%{height:8px}}
.wsl-bubble-text{font-size:13px;color:#e8f4ff;line-height:1.55;white-space:pre-wrap;overflow-y:auto;flex:1;}
.wsl-bubble-tap{margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,170,0,.45);letter-spacing:2px;text-align:right;}

.wsl-ts-area{flex:1;display:flex;flex-direction:column;gap:8px;overflow:hidden;background:rgba(8,18,42,.98);border:1px solid rgba(255,170,0,.18);border-radius:14px;padding:12px 14px;}
.wsl-ts-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#ffaa00;}
.wsl-ts-q{font-size:13px;color:#e8f4ff;line-height:1.55;font-weight:600;flex:1;}
.wsl-ts-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,170,0,.65);letter-spacing:1px;animation:wslPulse 1.4s ease-in-out infinite;}
.wsl-ts-result{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.5px;line-height:1.5;}
.wsl-ts-result.ok{color:#2dc653;animation:none;}
.wsl-ts-result.fail{color:#ff4444;animation:none;}

.wsl-quiz-area{flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden;}
.wsl-quiz-q{font-size:13px;color:#e8f4ff;line-height:1.5;font-weight:600;flex-shrink:0;}
.wsl-quiz-opts{display:flex;flex-direction:column;gap:5px;overflow-y:auto;flex:1;}
.wsl-opt{background:rgba(8,18,42,.9);border:1px solid rgba(255,170,0,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,.85);cursor:pointer;text-align:left;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:border-color .15s,background .15s;}
.wsl-opt:active{background:rgba(255,170,0,.08);}
.wsl-opt.correct{border-color:#2dc653;background:rgba(45,198,83,.12);color:#2dc653;}
.wsl-opt.wrong{border-color:#ff4444;background:rgba(255,68,68,.08);color:#ff4444;}
.wsl-quiz-hint{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.5px;line-height:1.5;display:none;flex-shrink:0;}
.wsl-quiz-hint.show{display:block;}

.wsl-progress-row{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.wsl-prog-bar{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.wsl-prog-fill{height:100%;background:linear-gradient(90deg,#ffaa00,#2dc653);border-radius:2px;transition:width .4s;}
.wsl-prog-pct{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

.wsl-bottom{height:62px;background:rgba(4,8,18,.98);border-top:1px solid rgba(255,170,0,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px;gap:10px;flex-shrink:0;}
.wsl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.wsl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.wsl-dot.done{background:#2dc653;}
.wsl-dot.active{background:#ffaa00;width:14px;border-radius:3px;}
.wsl-nav{display:flex;align-items:center;justify-content:center;padding:0 18px;height:44px;border-radius:12px;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .2s;}
.wsl-nav:active{transform:scale(.93);}
.wsl-nav-back{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);min-width:72px;}
.wsl-nav-next{background:linear-gradient(135deg,#ffaa00,#ff6600);color:#000;min-width:96px;}
.wsl-nav-next:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed;transform:none;}
`;function Ss(){if(document.querySelector("#wsl-css"))return;const f=document.createElement("style");f.id="wsl-css",f.textContent=Ts,document.head.appendChild(f)}function Mt(f,t){const e=document.createElement("canvas");e.width=160,e.height=50;const s=e.getContext("2d");s.fillStyle="rgba(4,10,24,0.9)",s.beginPath(),s.roundRect(2,2,156,46,9),s.fill(),s.strokeStyle=f,s.lineWidth=2,s.beginPath(),s.roundRect(2,2,156,46,9),s.stroke(),s.fillStyle=f,s.font="bold 17px monospace",s.textAlign="center",s.textBaseline="middle",s.fillText(t,80,25);const o=new ft(e),i=new Oe({map:o,transparent:!0,depthTest:!1}),a=new Pe(i);return a.scale.set(.82,.27,1),a}function Pt(f){return f<.5?2*f*f:-1+(4-2*f)*f}class Es{constructor(t){this.state=t,this._step=0,this._three=null,this._animId=null,this._sceneObjs=[],this._dropObjs=[],this._tsGroups=[],this._tsActive=!1,this._tsAnswered=!1,this._animObjs={},this._animT=0,this._animScene=null,this._lastTime=0,this._sparks=[],this._quizDone=!1,this._camPos=new m(0,2.5,7.5),this._camTarget=new m(0,-.3,0),this.container=this._build()}_build(){Ss();const t=document.createElement("div");return t.className="screen screen-hidden",t.innerHTML=`
      <div class="wsl">
        <header class="wsl-top">
          <button class="wsl-back">← MENU</button>
          <div class="wsl-top-center">
            <span class="wsl-ch-label" id="wsl-ch-lbl">WIRE STRIPPING</span>
          </div>
          <span class="wsl-ch-step" id="wsl-step-num">1/${Q.length}</span>
        </header>

        <div class="wsl-scene" id="wsl-scene">
          <canvas class="wsl-canvas" id="wsl-canvas"></canvas>
          <div class="wsl-tool-badge" id="wsl-tool-badge">
            <div class="wsl-tool-badge-name" id="wsl-badge-name"></div>
            <div class="wsl-tool-badge-tag"  id="wsl-badge-tag"></div>
          </div>
          <div class="wsl-quality-badge" id="wsl-quality-badge"></div>
          <div class="wsl-tap-hint" id="wsl-tap-hint" style="display:none">👆 TAP THE CORRECT TOOL</div>
          <div class="wsl-feedback" id="wsl-feedback"><div class="wsl-fb" id="wsl-fb"></div></div>
        </div>

        <div class="wsl-dialog" id="wsl-dialog">
          <div class="wsl-bubble" id="wsl-bubble">
            <img src="/Mascot.png" class="wsl-avatar" id="wsl-avatar" alt="Volt"/>
            <div class="wsl-bubble-content">
              <div class="wsl-bubble-name">VOLT
                <div class="wsl-wave"><span></span><span></span><span></span></div>
              </div>
              <p class="wsl-bubble-text" id="wsl-text"></p>
              <div class="wsl-bubble-tap" id="wsl-bubble-tap">TAP TO CONTINUE »</div>
            </div>
          </div>
          <div class="wsl-progress-row">
            <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog"></div></div>
            <span class="wsl-prog-pct" id="wsl-pct"></span>
          </div>
        </div>

        <div class="wsl-bottom">
          <button class="wsl-nav wsl-nav-back" id="wsl-prev">← BACK</button>
          <div class="wsl-dots" id="wsl-dots"></div>
          <button class="wsl-nav wsl-nav-next" id="wsl-next">NEXT →</button>
        </div>
      </div>`,t.querySelector(".wsl-back").addEventListener("click",()=>this.state.setState("wireLearn")),t.querySelector("#wsl-next").addEventListener("click",()=>this._onNext()),t.querySelector("#wsl-prev").addEventListener("click",()=>this._onPrev()),t.querySelector("#wsl-bubble-tap").addEventListener("click",()=>this._onNext()),this._el=t,t}_initThree(){if(this._three)return;const t=this._el.querySelector("#wsl-canvas"),e=this._el.querySelector("#wsl-scene"),s=e.offsetWidth,o=e.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}const i=new _t({canvas:t,antialias:!0,powerPreference:"high-performance"});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Bt,i.toneMapping=Ht,i.toneMappingExposure=1.1;const a=new mt;a.background=new R(658968),a.fog=new Wt(658968,.025);const n=new xt(50,s/o,.1,80);n.position.copy(this._camPos),n.lookAt(this._camTarget),oe(a);const{lampFill:r}=ie(a,{benchY:-.64,benchW:12,benchD:5.5}),l=r,c=new $t,h=new Rt,d=w=>{if(!this._tsActive)return;w.preventDefault();const b=t.getBoundingClientRect(),_=w.touches?w.changedTouches[0]:w;h.x=(_.clientX-b.left)/b.width*2-1,h.y=-((_.clientY-b.top)/b.height)*2+1,c.setFromCamera(h,n);const v=c.intersectObjects(this._tsGroups,!0);if(v.length){let E=v[0].object,M=E.userData.toolId;for(;!M&&E.parent;)E=E.parent,M=E.userData.toolId;M&&this._onToolTap(M,v[0].point)}};t.addEventListener("pointerdown",d),this._resizeObs=new ResizeObserver(()=>{const w=e.offsetWidth,b=e.offsetHeight;!w||!b||(i.setSize(w,b),n.aspect=w/b,n.updateProjectionMatrix())}),this._resizeObs.observe(e),this._three={renderer:i,scene:a,camera:n,lamp:l},this._lastTime=performance.now()*.001;const u=()=>{this._animId=requestAnimationFrame(u),this._updateThree(),i.render(a,n)};u()}_clearSceneObjs(){if(!this._three)return;for(const e of this._sceneObjs)this._three.scene.remove(e);this._sceneObjs=[],this._dropObjs=[],this._tsGroups=[],this._tsActive=!1,this._tsAnswered=!1,this._animObjs={},this._animScene=null,this._el.querySelector("#wsl-tool-badge").classList.remove("show");const t=this._el.querySelector("#wsl-quality-badge");t.className="wsl-quality-badge",this._el.querySelector("#wsl-tap-hint").style.display="none"}_add(t){return this._three.scene.add(t),this._sceneObjs.push(t),t}_tagMeshes(t,e){t.userData.toolId=e,t.traverse(s=>{s.isMesh&&(s.userData.toolId=e)})}_buildManual(t=1){const e=new A,s=new g({color:13373713,roughness:.75,metalness:0}),o=new g({color:7237230,roughness:.22,metalness:.88}),i=new g({color:2236962,roughness:.35,metalness:.8}),a=new g({color:11184810,roughness:.12,metalness:.95}),n=new g({color:16755200,roughness:.8,metalness:0}),r=new A,l=new p(new lt(.08*t,.72*t,6,14),s);l.position.set(-.52*t,.16*t,0),l.rotation.z=.35,r.add(l);for(let x=0;x<8;x++){const T=new p(new D(.082*t,.015*t,6,18),new g({color:10030606}));T.position.set(-.52*t+Math.sin(.35)*(-.16+x*.09)*t,.16*t-Math.cos(.35)*(-.16+x*.09)*t,0),T.rotation.set(Math.PI/2,0,.35),r.add(T)}const c=new p(new y(.25*t,.08*t,.12*t),o);c.position.set(-.1*t,.04*t,0),c.rotation.z=.15,r.add(c);const h=new p(new y(.56*t,.065*t,.16*t),o);h.position.set(.38*t,-.065*t,0),r.add(h);const d=new p(new y(.12*t,.05*t,.16*t),i);d.position.set(.12*t,-.02*t,0),r.add(d);const u=new A,w=new p(new lt(.08*t,.72*t,6,14),s);w.position.set(-.52*t,-.16*t,0),w.rotation.z=-.35,u.add(w);for(let x=0;x<8;x++){const T=new p(new D(.082*t,.015*t,6,18),new g({color:10030606}));T.position.set(-.52*t+Math.sin(-.35)*(-.16+x*.09)*t,-.16*t-Math.cos(-.35)*(-.16+x*.09)*t,0),T.rotation.set(Math.PI/2,0,-.35),u.add(T)}const b=new p(new y(.25*t,.08*t,.12*t),o);b.position.set(-.1*t,-.04*t,0),b.rotation.z=-.15,u.add(b);const _=new p(new y(.56*t,.065*t,.16*t),o);_.position.set(.38*t,.065*t,0),u.add(_);const v=new p(new y(.12*t,.05*t,.16*t),i);v.position.set(.12*t,.02*t,0),u.add(v);const E=new p(new k(.065*t,.065*t,.22*t,6),a);E.rotation.x=Math.PI/2;for(let x=0;x<8;x++){const T=x/7*Math.PI,C=new p(new y(.015*t,.015*t,.015*t),a);C.position.set(-.32*t,Math.cos(T)*.1*t,Math.sin(T)*.06*t),e.add(C)}[.26,.36,.46,.56].forEach((x,T)=>{const C=(.045-T*.008)*t,I=new p(new k(C,C,.18*t,12),i);I.rotation.x=Math.PI/2,I.position.set(x*t,0,0),e.add(I);const z=new p(new y(.025*t,.04*t,.17*t),n);z.position.set(x*t,.04*t,0),u.add(z)});const M=new p(new y(.08*t,.03*t,.16*t),o);M.position.set(.62*t,-.01*t,0),r.add(M);const S=new p(new y(.08*t,.03*t,.16*t),o);S.position.set(.62*t,.01*t,0),u.add(S);for(let x=0;x<4;x++){const T=new p(new y(.015*t,.01*t,.16*t),i);T.position.set((.59+x*.02)*t,.01*t,0),r.add(T);const C=new p(new y(.015*t,.01*t,.16*t),i);C.position.set((.59+x*.02)*t,-.01*t,0),u.add(C)}return e.add(r),e.add(u),e.add(E),e.userData.armA=r,e.userData.armB=u,e}_buildAutomatic(t=1){const e=new A,s=new g({color:1136076,roughness:.6}),o=new g({color:666214,roughness:.7}),i=new g({color:8947848,roughness:.25,metalness:.9}),a=new g({color:1118481,roughness:.5}),n=new p(new y(1.1*t,.36*t,.28*t),s.clone());n.position.set(0,.05*t,0),e.add(n);const r=new p(new y(.9*t,.06*t,.24*t),o.clone());r.position.set(-.05*t,.26*t,0),e.add(r);const l=new p(new lt(.11*t,.52*t,5,14),s.clone());l.position.set(.05*t,-.36*t,0),l.rotation.z=.22,e.add(l);const c=new p(new y(.06*t,.26*t,.12*t),o.clone());c.position.set(.14*t,-.14*t,0),c.rotation.z=.18,e.add(c);const h=new p(new y(.28*t,.32*t,.26*t),i.clone());h.position.set(.6*t,.05*t,0),e.add(h);const d=new p(new k(.065*t,.065*t,.3*t,14),a.clone());d.rotation.z=Math.PI/2,d.position.set(.6*t,.05*t,0),e.add(d);for(let u=0;u<3;u++){const w=new p(new y(.26*t,.025*t,.3*t),new g({color:17578,roughness:.8}));w.position.set(.6*t,(-.05+u*.06)*t,0),e.add(w)}return e.userData.trigger=c,e}_buildKnife(t=1){const e=new A,s=new g({color:5592422,roughness:.72}),o=new g({color:2236979,roughness:.8}),i=new g({color:13421772,roughness:.18,metalness:.92});new g({color:1118481,roughness:.6});const a=new p(new y(.88*t,.22*t,.2*t),s.clone());a.position.set(-.18*t,0,0),e.add(a);for(let w=0;w<5;w++){const b=new p(new y(.025*t,.225*t,.21*t),new g({color:3355460,roughness:.85}));b.position.set((-.48+w*.13)*t,0,0),e.add(b)}const n=new p(new y(.28*t,.2*t,.22*t),o.clone());n.position.set(.44*t,.01*t,0),e.add(n);const r=new p(new y(.56*t,.048*t,.018*t),i.clone());r.position.set(.48*t,.09*t,0),e.add(r);const l=new $e,c=new Float32Array([0,0,0,.14*t,0,0,.14*t,-.04*t,0,0,0,.018*t,.14*t,0,.018*t,.14*t,-.04*t,.018*t]);l.setAttribute("position",new De(c,3)),l.setIndex([0,1,2,3,5,4,0,3,1,1,3,4,1,4,2,2,4,5]),l.computeVertexNormals();const h=new p(l,i.clone());h.position.set(.76*t,.09*t,0),e.add(h);const d=new p(new y(.12*t,.1*t,.22*t),o.clone());d.position.set(-.12*t,.16*t,0),e.add(d);const u=new p(new y(.035*t,.72*t,.035*t),i.clone());return u.position.set(-.18*t,0,.12*t),e.add(u),e.userData.blade=r,e}_buildRotary(t=1){const e=new A,s=new g({color:16755200,roughness:.6}),o=new g({color:6710903,roughness:.42,metalness:.5}),i=new g({color:12303308,roughness:.18,metalness:.9}),a=new g({color:1118481,roughness:.6}),n=new g({color:3355460,roughness:.7}),r=new p(new k(.095*t,.1*t,.85*t,18),s.clone());r.position.set(0,-.525*t,0),e.add(r);for(let w=0;w<4;w++){const b=new p(new D(.1*t,.01*t,6,18),n.clone());b.position.set(0,(-.25-w*.16)*t,0),b.rotation.x=Math.PI/2,e.add(b)}const l=new p(new k(.125*t,.125*t,.14*t,18),o.clone());l.position.set(0,-.045*t,0),e.add(l);const c=new p(new k(.175*t,.175*t,.4*t,20),o.clone());c.position.set(0,.255*t,0),e.add(c);const h=new p(new D(.115*t,.018*t,7,22),i.clone());h.position.set(0,.32*t,0),h.rotation.x=Math.PI/2,e.add(h);const d=new p(new k(.175*t,.175*t,.06*t,20),n.clone());d.position.set(0,.485*t,0),e.add(d);const u=new p(new k(.06*t,.06*t,.1*t,14),a.clone());u.position.set(0,.5*t,0),e.add(u);for(let w=0;w<8;w++){const b=w/8*Math.PI*2,_=new p(new y(.025*t,.35*t,.025*t),n.clone());_.position.set(Math.cos(b)*.175*t,.255*t,Math.sin(b)*.175*t),e.add(_)}return e}_buildStrippedWire(t=.55,e={}){const s=new A,o=new g({color:e.insColor||1710638,roughness:.35,metalness:.05,clearcoat:.8,clearcoatRoughness:.2}),i=new g({color:13928762,roughness:.15,metalness:.95,emissive:e.glowCopper?new R(13928762):new R(0),emissiveIntensity:e.glowCopper?.4:0}),a=e.insLen||2.8,n=new p(new k(.13,.13,a,24),o);n.rotation.z=Math.PI/2,n.position.x=-(a/2+t/2),s.add(n);const r=new p(new k(.065,.13,.08,24),o);r.rotation.z=Math.PI/2,r.position.x=-(t/2)-.04,s.add(r);const l=new p(new k(.065,.065,t,20),i);l.rotation.z=Math.PI/2,s.add(l);for(let c=0;c<7;c++){const h=c/7*Math.PI*2,d=new p(new k(.015,.015,t,8),i);d.rotation.z=Math.PI/2,d.position.set(0,Math.cos(h)*.06,Math.sin(h)*.06),s.add(d)}return s.userData.copMesh=l,s.userData.copMat=i,s.userData.insMat=o,s}_applyScene(t){if(this._clearSceneObjs(),!this._three)return;const e=t.scene,s=(i,a,n=0)=>{i.position.set(a,-.38+n,.2),i.rotation.set(0,0,Math.PI/2),this._add(i)},o=(i,a,n=0)=>{i.position.set(a,-.38+n,.2),i.rotation.set(Math.PI/2,0,0),this._add(i)};if(e!=="bench_clean"){if(e==="bench_tools"){const i=this._buildManual(.55);this._tagMeshes(i,"manual"),s(i,-2.8);const a=this._buildAutomatic(.55);this._tagMeshes(a,"automatic"),s(a,-.9);const n=this._buildKnife(.55);this._tagMeshes(n,"knife"),s(n,.9);const r=this._buildRotary(.55);this._tagMeshes(r,"rotary"),o(r,2.8);return}if(e==="all_tools"){ue.forEach(i=>{let a;i.id==="manual"&&(a=this._buildManual(.68)),i.id==="automatic"&&(a=this._buildAutomatic(.68)),i.id==="knife"&&(a=this._buildKnife(.68)),i.id==="rotary"&&(a=this._buildRotary(.68)),this._tagMeshes(a,i.id),i.id==="rotary"?o(a,i.x,.12):s(a,i.x,.12);const n=Mt(i.hex,i.name);n.position.set(i.x,.42,.2),this._add(n),this._tsGroups.push(a)}),t.t==="tselect"&&(this._tsActive=!0,this._el.querySelector("#wsl-tap-hint").style.display="block");return}if(e==="show_manual"){const i=this._buildManual(1.1);i.position.set(0,0,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="MANUAL STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="AWG NOTCH SELECTION",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(e==="show_automatic"){const i=this._buildAutomatic(1.1);i.position.set(0,.1,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="AUTOMATIC STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="SELF-ADJUSTING JAWS",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(e==="show_knife"){const i=this._buildKnife(1.1);i.position.set(0,0,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="UTILITY KNIFE",this._el.querySelector("#wsl-badge-tag").textContent="SCORE LENGTHWISE ONLY",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(e==="show_rotary"){const i=this._buildRotary(1.1);i.position.set(0,0,0),i.rotation.set(.3,-.4,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="ROTARY STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="CIRCULAR BLADE — RING CUT",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(e==="anim_manual"||e==="anim_automatic"||e==="anim_knife"||e==="anim_rotary"){const i=e.replace("anim_",""),a=new g({color:1710638,roughness:.65}),n=new p(new k(.13,.13,3.2,20),a);n.rotation.z=Math.PI/2,n.position.set(-1,-.35,0),n.castShadow=!0,this._add(n);const r=new g({color:1710638,roughness:.65,transparent:!0,opacity:1}),l=new p(new k(.132,.132,1.1,20),r);l.rotation.z=Math.PI/2,l.position.set(.9,-.35,0),this._add(l);const c=new g({color:12088115,roughness:.22,metalness:.85,emissive:new R(12088115),emissiveIntensity:0,transparent:!0,opacity:0}),h=new p(new k(.065,.065,1.1,16),c);h.rotation.z=Math.PI/2,h.position.set(.9,-.35,0),this._add(h);const d=new g({color:12088115,roughness:.22,metalness:.85}),u=new p(new k(.065,.065,.14,14),d);u.rotation.z=Math.PI/2,u.position.set(-2.67,-.35,0),this._add(u);let w;i==="manual"&&(w=this._buildManual(.9)),i==="automatic"&&(w=this._buildAutomatic(.9)),i==="knife"&&(w=this._buildKnife(.9)),i==="rotary"&&(w=this._buildRotary(.9)),i==="rotary"?(w.rotation.set(Math.PI/2,0,0),w.position.set(.9,1.8,0)):(w.rotation.set(0,0,Math.PI/2),w.position.set(.9,1.8,0)),this._add(w),this._animScene=`strip_${i}`,this._animT=0,this._animObjs={tool:w,sleeve:l,sleeveMat:r,copper:h,copMat:c,armA:w.userData.armA||null,armB:w.userData.armB||null};return}if(e==="bad_teeth"){const i=new g({color:1710638,roughness:.65}),a=new p(new k(.13,.13,5,20),i);a.rotation.z=Math.PI/2,a.position.set(0,-.35,0),a.castShadow=!0,this._add(a);const n=new g({color:4456448,roughness:.9}),r=new p(new k(.135,.135,.18,20),n);r.rotation.z=Math.PI/2,r.position.set(0,-.35,0),this._add(r);const l=new g({color:3346688,roughness:.95}),c=new p(new y(.24,.1,.2),l);c.position.set(0,-.35,0),this._add(c);const h=Mt("#ff4444","⚠ NEVER DO THIS");h.scale.set(1.1,.38,1),h.position.set(0,.28,0),this._add(h);return}if(e==="bad_crush"){const i=new g({color:2250171,roughness:.65}),a=new p(new k(.13,.13,4.8,20),i);a.rotation.z=Math.PI/2,a.position.set(0,-.35,0),a.castShadow=!0,this._add(a);const n=new g({color:1718920,roughness:.85}),r=new p(new k(.13,.08,.22,12),n);r.rotation.z=Math.PI/2,r.scale.y=.45,r.position.set(.3,-.35,0),this._add(r);const l=new g({color:14496512,roughness:.5,emissive:new R(4456448),emissiveIntensity:.5});for(let h=0;h<5;h++){const d=new p(new k(.008,.008,.28,6),l.clone());d.rotation.z=Math.PI/2,d.position.set(.3,-.35+(h-2)*.025,(h-2)*.018),this._add(d)}const c=Mt("#ff4444","⚠ WRONG NOTCH");c.scale.set(1.1,.38,1),c.position.set(0,.28,0),this._add(c);return}if(e==="bad_nick"){const i=new g({color:1710638,roughness:.65}),a=new p(new k(.13,.13,3.2,20),i);a.rotation.z=Math.PI/2,a.position.set(-.85,-.35,0),a.castShadow=!0,this._add(a);const n=new g({color:12088115,roughness:.22,metalness:.85}),r=new p(new k(.065,.065,1,16),n);r.rotation.z=Math.PI/2,r.position.set(.75,-.35,0),this._add(r);const l=new g({color:5570560,roughness:.9,emissive:new R(2228224),emissiveIntensity:.5}),c=new p(new D(.067,.02,6,16),l);c.rotation.y=Math.PI/2,c.position.set(.38,-.35,0),this._add(c);const h=new V(16720384,2,.5);h.position.set(.38,-.35,0),this._add(h);const d=Mt("#ff4444","⚠ NICKED COPPER");d.scale.set(1.1,.38,1),d.position.set(0,.28,0),this._add(d);return}if(e==="good_strip"){const i=new g({color:1710638,roughness:.65}),a=new p(new k(.13,.13,3.2,20),i);a.rotation.z=Math.PI/2,a.position.set(-.9,-.35,0),a.castShadow=!0,this._add(a);const n=new g({color:12088115,roughness:.22,metalness:.85,emissive:new R(4465152),emissiveIntensity:.35}),r=new p(new k(.065,.065,.72,16),n);r.rotation.z=Math.PI/2,r.position.set(.58,-.35,0),this._add(r);const l=new g({color:2999891,roughness:.5,emissive:new R(2999891),emissiveIntensity:.6}),c=new p(new D(.133,.012,8,20),l);c.rotation.y=Math.PI/2,c.position.set(.22,-.35,0),this._add(c);const h=new V(2999891,1.5,1.2);h.position.set(.58,-.2,0),this._add(h);const d=Mt("#2dc653","✓ CORRECT STRIP");d.scale.set(1.1,.38,1),d.position.set(0,.28,0),this._add(d);return}if(e==="quality_nick"){const i=this._buildStrippedWire(.65);i.position.set(.35,-.35,0),this._add(i);const a=new g({color:5570560,roughness:.9,emissive:new R(3342336),emissiveIntensity:.6}),n=new p(new D(.067,.022,6,16),a);n.rotation.y=Math.PI/2,n.position.set(.35,-.35,0),this._add(n);const r=new V(16720384,1.5,.7);r.position.set(.35,-.2,0),this._add(r);const l=this._el.querySelector("#wsl-quality-badge");l.textContent="FAIL ✗",l.className="wsl-quality-badge fail";return}if(e==="quality_long"){const i=this._buildStrippedWire(1.8,{insLen:1.6});i.position.set(.65,-.35,0),this._add(i);const a=new V(16729088,1.2,1.5);a.position.set(.65,-.25,0),this._add(a),this._animScene="quality_pulse_red",this._animObjs={mat:i.userData.copMat};const n=this._el.querySelector("#wsl-quality-badge");n.textContent="FAIL ✗",n.className="wsl-quality-badge fail";return}if(e==="quality_ragged"){const i=new g({color:1710638,roughness:.65}),a=new p(new k(.13,.13,2.8,20),i);a.rotation.z=Math.PI/2,a.position.set(-.65,-.35,0),this._add(a);const n=new g({color:12088115,roughness:.22,metalness:.85}),r=new p(new k(.065,.065,.65,16),n);r.rotation.z=Math.PI/2,r.position.set(.58,-.35,0),this._add(r);const l=new g({color:2763322,roughness:.9});[.1,-.08,.13,-.05,.09].forEach((u,w)=>{const b=new p(new y(.06,.1,.05),l.clone());b.position.set(.22,-.35+u,(w-2)*.04),b.rotation.z=u,this._add(b)});const h=Mt("#ff8800","⚠ RAGGED EDGE");h.scale.set(1,.36,1),h.position.set(0,.26,0),this._add(h);const d=this._el.querySelector("#wsl-quality-badge");d.textContent="FAIL ✗",d.className="wsl-quality-badge fail";return}if(e==="quality_good"){const i=this._buildStrippedWire(.7,{glowCopper:!0});i.position.set(.35,-.35,0),this._add(i);const a=new g({color:2999891,roughness:.5,emissive:new R(2999891),emissiveIntensity:.55}),n=new p(new D(.133,.012,8,20),a);n.rotation.y=Math.PI/2,n.position.set(.35,-.35,0),this._add(n);const r=new V(2999891,1.4,1.4);r.position.set(.35,-.22,.3),this._add(r);const l=this._el.querySelector("#wsl-quality-badge");l.textContent="PASS ✓",l.className="wsl-quality-badge pass",this._animScene="quality_pulse_green",this._animObjs={mat:i.userData.copMat};return}}}_updateThree(){if(!this._three)return;const{camera:t,lamp:e}=this._three,s=performance.now()*.001,o=Math.min(s-this._lastTime,.05);this._lastTime=s;const a=Q[this._step].cam;this._camPos.lerp(new m(...a.p),.044),this._camTarget.lerp(new m(...a.t),.044),t.position.copy(this._camPos),t.lookAt(this._camTarget),e.intensity=1.6+Math.sin(s*4)*.08;for(const n of this._dropObjs){const r=n.mesh.position.y-n.target;Math.abs(r)<.008&&Math.abs(n.vel)<.002?n.mesh.position.y=n.target:(n.vel+=-.018*r-.18*n.vel,n.mesh.position.y+=n.vel)}if(this._sparks=this._sparks.filter(n=>(n.life-=.025,n.life<=0?(this._three.scene.remove(n.mesh),!1):(n.vel.y-=.005,n.mesh.position.addScaledVector(n.vel,1),n.mesh.material.opacity=n.life,!0))),this._animScene==="float"){const n=this._animObjs.pivot;n&&(n.rotation.y=Math.sin(s*.55)*.35)}if(this._animScene&&this._animScene.startsWith("strip_")&&(this._animT=(this._animT+o*.22)%1,this._updateStripAnim(this._animT)),this._animScene==="quality_pulse_red"){const n=this._animObjs.mat;n&&(n.emissive=new R(16720384),n.emissiveIntensity=.3+Math.sin(s*3.5)*.25)}if(this._animScene==="quality_pulse_green"){const n=this._animObjs.mat;n&&(n.emissiveIntensity=.3+Math.sin(s*2)*.18)}for(const n of this._tsGroups)n&&(n.position.y=-.26+Math.sin(s*1.2+n.position.x*.8)*.025)}_updateStripAnim(t){const{tool:e,sleeve:s,sleeveMat:o,copper:i,copMat:a,armA:n,armB:r}=this._animObjs;if(!e)return;const l=this._animScene.replace("strip_","");if(t<.35){const c=Pt(t/.35);e.position.y=Gt.lerp(1.8,.12,c),e.position.x=.9,o&&(o.opacity=1),a&&(a.opacity=0),n&&(n.rotation.z=.32),r&&(r.rotation.z=-.32)}else if(t<.52){const c=Pt((t-.35)/.17);e.position.y=.12,n&&(n.rotation.z=Gt.lerp(.32,.055,c)),r&&(r.rotation.z=Gt.lerp(-.32,-.055,c)),l==="rotary"&&(e.rotation.z=c*Math.PI*2),l==="automatic"&&e.userData.trigger&&(e.userData.trigger.rotation.z=Gt.lerp(.18,.55,c))}else if(t<.82){const c=Pt((t-.52)/.3),h=c*1.55;e.position.x=.9+h,e.position.y=.12,s&&(s.position.x=.9+h),o&&(o.opacity=1-Pt(c)),a&&(a.opacity=Pt(c)),l==="rotary"&&(e.rotation.z=Math.PI*2+c*Math.PI*4),l==="knife"&&e.rotation.set(0,0,Math.PI/2-.25)}else{const c=(t-.82)/.18;a&&(a.opacity=1,a.emissiveIntensity=.4+Math.sin(c*Math.PI*4)*.3),t>.96&&(e.position.set(.9,1.8,0),s&&(s.position.x=.9),n&&(n.rotation.z=.32),r&&(r.rotation.z=-.32),l==="rotary"?e.rotation.set(Math.PI/2,0,0):e.rotation.set(0,0,Math.PI/2),l==="automatic"&&e.userData.trigger&&(e.userData.trigger.rotation.z=.18),this._animT=0)}}_spawnSparks(t){if(this._three)for(let e=0;e<14;e++){const s=new J({color:[16763904,16746496,16777215][e%3],transparent:!0,opacity:1}),o=new p(new gt(.03,4,4),s);o.position.copy(t),this._three.scene.add(o),this._sparks.push({mesh:o,life:.65+Math.random()*.5,vel:new m((Math.random()-.5)*.09,.05+Math.random()*.09,(Math.random()-.5)*.09)})}}_showFeedback(t){const e=this._el.querySelector("#wsl-feedback");this._el.querySelector("#wsl-fb").textContent=t,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),820)}_onToolTap(t,e){var n,r;if(!this._tsActive||this._tsAnswered)return;const s=Q[this._step];if(s.t!=="tselect")return;const o=Le[s.qIdx].a;this._tsAnswered=!0,this._tsActive=!1,this._el.querySelector("#wsl-tap-hint").style.display="none";const i=this._el.querySelector(".wsl-ts-result");(n=ue.find(l=>l.id===t))!=null&&n.name||t.toUpperCase();const a=((r=ue.find(l=>l.id===o))==null?void 0:r.name)||o.toUpperCase();t===o?(this._showFeedback("✅"),this._spawnSparks(e),i&&(i.textContent=`✓ Correct! ${a} is the right choice.`,i.className="wsl-ts-result ok")):(this._showFeedback("❌"),i&&(i.textContent=`✗ Incorrect. The right tool is the ${a}.`,i.className="wsl-ts-result fail")),setTimeout(()=>{this._el.querySelector("#wsl-next").disabled=!1},500)}_renderQuiz(t){const e=be[t],s=this._el.querySelector("#wsl-dialog"),o=Math.round(this._step/(Q.length-1)*100);s.innerHTML=`
      <div class="wsl-quiz-area">
        <p class="wsl-quiz-q">${e.q}</p>
        <div class="wsl-quiz-opts">
          ${e.opts.map((i,a)=>`<button class="wsl-opt" data-idx="${a}">${i}</button>`).join("")}
        </div>
        <div class="wsl-quiz-hint" id="wsl-quiz-hint">${e.hint}</div>
      </div>
      <div class="wsl-progress-row">
        <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${o}%"></div></div>
        <span class="wsl-prog-pct" id="wsl-pct">${o}%</span>
      </div>`,s.querySelectorAll(".wsl-opt").forEach(i=>{i.addEventListener("click",()=>this._onQuizAnswer(t,parseInt(i.dataset.idx)))})}_onQuizAnswer(t,e){if(this._quizDone)return;const s=be[t];if(this._el.querySelectorAll(".wsl-opt").forEach((i,a)=>{i.style.pointerEvents="none",a===s.a?i.classList.add("correct"):a===e&&i.classList.add("wrong")}),e===s.a)this._showFeedback("✅"),this._quizDone=!0,this._el.querySelector("#wsl-next").disabled=!1;else{this._showFeedback("❌");const i=this._el.querySelector("#wsl-quiz-hint");i&&i.classList.add("show"),setTimeout(()=>{this._quizDone=!0,this._el.querySelector("#wsl-next").disabled=!1},900)}}_render(){const t=Q[this._step],e=Q.length,s=Math.round(this._step/(e-1)*100);this._el.querySelector("#wsl-ch-lbl").textContent=t.chLbl||"",this._el.querySelector("#wsl-step-num").textContent=`${this._step+1}/${e}`;const o=this._el.querySelector("#wsl-dots");o.innerHTML=Q.map((r,l)=>`<div class="wsl-dot ${l<this._step?"done":l===this._step?"active":""}"></div>`).join("");const i=this._el.querySelector("#wsl-next"),a=this._el.querySelector("#wsl-prev");if(a.style.visibility=this._step===0?"hidden":"visible",t.t==="quiz"){this._quizDone=!1,i.disabled=!0,i.textContent="NEXT →",this._renderQuiz(t.qi);return}if(t.t==="tselect"){this._tsAnswered=!1,i.disabled=!0,i.textContent="NEXT →";const r=Le[t.qIdx],l=this._el.querySelector("#wsl-dialog");l.innerHTML=`
        <div class="wsl-ts-area">
          <div class="wsl-ts-label">SCENARIO ${t.qIdx+1} / 5</div>
          <p class="wsl-ts-q">${r.q}</p>
          <div class="wsl-ts-hint">👆 TAP THE CORRECT TOOL ON THE BENCH</div>
          <div class="wsl-ts-result"></div>
        </div>
        <div class="wsl-progress-row">
          <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${s}%"></div></div>
          <span class="wsl-prog-pct" id="wsl-pct">${s}%</span>
        </div>`,this._tsActive=!0,this._el.querySelector("#wsl-tap-hint").style.display="block";return}this._el.querySelector("#wsl-bubble")||(this._el.querySelector("#wsl-dialog").innerHTML=`
        <div class="wsl-bubble" id="wsl-bubble">
          <img src="/Mascot.png" class="wsl-avatar" id="wsl-avatar" alt="Volt"/>
          <div class="wsl-bubble-content">
            <div class="wsl-bubble-name">VOLT
              <div class="wsl-wave"><span></span><span></span><span></span></div>
            </div>
            <p class="wsl-bubble-text" id="wsl-text"></p>
            <div class="wsl-bubble-tap" id="wsl-bubble-tap">TAP TO CONTINUE »</div>
          </div>
        </div>
        <div class="wsl-progress-row">
          <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog"></div></div>
          <span class="wsl-prog-pct" id="wsl-pct"></span>
        </div>`,this._el.querySelector("#wsl-bubble-tap").addEventListener("click",()=>this._onNext())),this._el.querySelector("#wsl-text").textContent=t.text||"",this._el.querySelector("#wsl-prog").style.width=s+"%",this._el.querySelector("#wsl-pct").textContent=s+"%",i.disabled=!1,i.textContent=t.btn||"NEXT →",this._el.querySelector("#wsl-bubble-tap").style.display=t.btn?"none":"block";const n=this._el.querySelector("#wsl-avatar");n&&(t.mascotIn?(n.classList.remove("entered"),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("entered")))):n.classList.add("entered"))}_gotoStep(t){this._step=Math.max(0,Math.min(Q.length-1,t));const e=Q[this._step];this._applyScene(e),this._render()}_onNext(){if(Q[this._step].t==="done"){O.completeLesson("wireStripping"),this.state.setState("wireLearn");return}this._step<Q.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}onShow(){this._step=0,this._animT=0,this._sparks=[],this._camPos.set(0,2.5,7.5),this._camTarget.set(0,-.3,0),this._render(),setTimeout(()=>{if(this._initThree(),this._three){const t=Q[this._step];this._applyScene(t)}else setTimeout(()=>{this._applyScene(Q[this._step])},200)},80)}onHide(){this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._three&&(this._clearSceneObjs(),this._three.renderer.dispose(),this._three=null),this._sparks=[],this._animScene=null}}const Ct=[{key:"wireTypes",state:"wireTypes",num:"01",title:`UNDERSTAND
THE BASICS`,short:"Understand the Basics",desc:"Learn what wires are, their types, colors, and basic functions.",icon:"wire",color:"#00d4ff",img:"https://images.unsplash.com/photo-1597766370173-a14200ec0b42?w=400&q=70&auto=format"},{key:"electricianTools",state:"electricianTools",num:"02",title:`LEARN
THE TOOLS`,short:"Learn the Tools",desc:"Get familiar with electrical tools and their proper use.",icon:"tools",color:"#f59e0b",img:"https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=400&q=70&auto=format"},{key:"wireStripping",state:"wireStripping",num:"03",title:`WIRE
STRIPPING`,short:"Wire Stripping",desc:"Learn how to strip wires safely and correctly.",icon:"strip",color:"#22c55e",img:"https://images.pexels.com/photos/5853935/pexels-photo-5853935.jpeg?auto=compress&cs=tinysrgb&w=400"},{key:"learnOutlet",state:"learnOutlet",num:"04",title:`BASIC
CONNECTIONS`,short:"Basic Connections",desc:"Learn basic wiring connections using PH standard.",icon:"outlet",color:"#ef4444",img:"https://images.unsplash.com/photo-1565049981953-379c9c2a5d48?w=400&q=70&auto=format"},{key:"switchInstallation",state:"switchInstallation",num:"05",title:`SCENARIO
CHALLENGES`,short:"Scenario Challenges",desc:"Apply your knowledge in real-life electrical scenarios.",icon:"scenario",color:"#3b82f6",img:"https://images.unsplash.com/photo-1566417110090-6b15a06ec800?w=400&q=70&auto=format"},{key:"ways",state:"explore",num:"06",title:`ADVANCED
MASTERY`,short:"Advanced Mastery",desc:"Advanced projects and become a wiring master!",icon:"trophy",color:"#f59e0b",img:"https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=400&q=70&auto=format"}];function Ms(f,t){const e=`stroke="${t}" stroke-width="1.5"`;switch(f){case"wire":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><path d="M2 12h4l3-7 4 14 3-7h6"/></svg>`;case"tools":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;case"strip":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><path d="M6 3v18M6 12h6m0-9v18"/><path d="M14 8l4-5M14 16l4 5"/></svg>`;case"outlet":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="8" x2="9" y2="12"/><line x1="15" y1="8" x2="15" y2="12"/><path d="M9 15h6"/></svg>`;case"scenario":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;case"trophy":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${e}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;default:return""}}const Cs=`
/* ── ROOT ── */
.sh{position:absolute;inset:0;display:flex;flex-direction:column;background:#060a14;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── HEADER ── */
.sh-top{
  flex-shrink:0;height:52px;
  background:rgba(4,8,20,.98);border-bottom:1px solid rgba(0,212,255,.16);
  display:flex;align-items:center;padding:0 14px;gap:10px;
}
.sh-back{
  background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.28);color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.1em;
  padding:7px 13px;border-radius:8px;cursor:pointer;transition:all .15s;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-back:active{transform:scale(.93);}
.sh-title-wrap{flex:1;text-align:center;}
.sh-title{font-size:17px;font-weight:900;letter-spacing:.3em;color:#fff;}
.sh-title-sub{font-size:8px;letter-spacing:.22em;color:rgba(0,212,255,.4);margin-top:1px;}
.sh-pct-badge{
  font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;color:#00d4ff;
  background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);
  border-radius:6px;padding:5px 10px;
}

/* ── MAIN AREA ── */
.sh-main{flex:1;display:flex;overflow:hidden;min-height:0;}

/* ── STAGE STRIP ── */
.sh-strip-area{
  flex:1;display:flex;flex-direction:column;overflow:hidden;
  padding:12px 0 12px 12px;
}
.sh-journey-lbl{
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;letter-spacing:.28em;
  color:rgba(255,255,255,.22);display:flex;align-items:center;gap:8px;
  margin-bottom:10px;padding-right:12px;flex-shrink:0;
}
.sh-journey-lbl::before,.sh-journey-lbl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.07);}
.sh-scroll{
  flex:1;display:flex;align-items:stretch;
  overflow-x:auto;overflow-y:hidden;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
}
.sh-scroll::-webkit-scrollbar{display:none;}

/* ── ARROW ── */
.sh-arrow{
  flex-shrink:0;width:22px;display:flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,.18);
}
.sh-arrow svg{width:13px;height:13px;}

/* ── STAGE CARD ── */
.sh-card{
  flex-shrink:0;width:182px;
  background:rgba(6,12,26,.96);border:1px solid rgba(255,255,255,.08);
  border-radius:13px;overflow:hidden;
  display:flex;flex-direction:column;
  cursor:pointer;position:relative;
  transition:transform .15s,border-color .15s,box-shadow .15s;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-card:not(.sh-locked):hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(0,0,0,.55);}
.sh-card:not(.sh-locked):active{transform:scale(.97);}
.sh-card.sh-locked{opacity:.45;cursor:not-allowed;}
.sh-card.sh-done{border-color:rgba(34,197,94,.24);}
.sh-card.sh-active{border-color:rgba(0,212,255,.45);box-shadow:0 0 16px rgba(0,212,255,.1);}

/* Image band */
.sh-card-img{
  height:86px;flex-shrink:0;position:relative;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.sh-card-img-bg{position:absolute;inset:0;}
.sh-stage-num{
  position:absolute;top:8px;left:10px;z-index:2;
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;letter-spacing:.2em;
  background:rgba(0,0,0,.55);border-radius:4px;padding:2px 7px;
}
.sh-badge{
  position:absolute;top:8px;right:10px;z-index:2;
  font-family:'Barlow Condensed',sans-serif;font-size:7px;font-weight:800;letter-spacing:.12em;
  padding:2px 7px;border-radius:4px;
}
.sh-b-done  {background:rgba(34,197,94,.2); border:1px solid rgba(34,197,94,.5); color:#4ade80;}
.sh-b-prog  {background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.5);color:#fcd34d;}
.sh-b-avail {background:rgba(0,212,255,.12); border:1px solid rgba(0,212,255,.42);color:#00d4ff;}
.sh-b-lock  {background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.28);}

/* Body */
.sh-card-body{flex:1;padding:9px 11px 7px;display:flex;flex-direction:column;gap:4px;}
.sh-card-title{font-size:16px;font-weight:900;letter-spacing:.04em;color:#fff;line-height:1.15;}
.sh-card-desc{font-size:10px;color:rgba(255,255,255,.4);line-height:1.5;flex:1;font-family:'Barlow',sans-serif;}

/* Action button */
.sh-card-btn{
  margin:0 9px 9px;padding:8px;border-radius:7px;border:none;
  font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:800;letter-spacing:.1em;
  cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:4px;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.sh-card-btn:active:not([disabled]){transform:scale(.95);}
.sh-btn-done{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.35);color:#4ade80;}
.sh-btn-start{background:linear-gradient(135deg,#00d4ff,#0088cc);color:#000;}
.sh-btn-cont{background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;}
.sh-btn-lock{background:rgba(255,255,255,.04);color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.07);pointer-events:none;}

/* ── RIGHT PANEL ── */
.sh-rpanel{
  flex-shrink:0;width:212px;
  display:flex;flex-direction:column;gap:9px;
  padding:12px 12px 12px 0;overflow:hidden;
}
.sh-rcard{
  background:rgba(6,12,26,.96);border:1px solid rgba(255,255,255,.08);
  border-radius:13px;padding:12px 13px;flex-shrink:0;
}
.sh-rlbl{
  font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:800;
  letter-spacing:.25em;color:#00d4ff;text-transform:uppercase;margin-bottom:10px;
}

/* Circular gauge */
.sh-circ-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.sh-circ-wrap{position:relative;width:58px;height:58px;flex-shrink:0;}
.sh-circ-wrap svg{transform:rotate(-90deg);}
.sh-circ-bg  {fill:none;stroke:rgba(255,255,255,.07);stroke-width:5;}
.sh-circ-fill{fill:none;stroke:#00d4ff;stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .7s ease;}
.sh-circ-pct{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;color:#00d4ff;
}
.sh-circ-info{flex:1;}
.sh-circ-head{font-size:13px;font-weight:800;color:#fff;}
.sh-circ-sub{font-size:9px;color:rgba(255,255,255,.36);margin-top:2px;line-height:1.4;font-family:'Barlow',sans-serif;}

/* Checklist */
.sh-chk{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-family:'Barlow',sans-serif;}
.sh-chk:last-child{border-bottom:none;}
.sh-chk-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.d-done  {background:#22c55e;}
.d-active{background:#00d4ff;animation:sh-dp 1s infinite;}
.d-lock  {background:rgba(255,255,255,.14);}
@keyframes sh-dp{0%,100%{opacity:1}50%{opacity:.2}}
.sh-chk-name{flex:1;font-size:10px;color:rgba(255,255,255,.58);}
.sh-chk-name.done  {color:rgba(255,255,255,.28);text-decoration:line-through;}
.sh-chk-name.active{color:#fff;}
.sh-chk-tick{font-size:8px;color:#22c55e;}

/* PH wire rows */
.sh-ph-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
.sh-ph-row:last-of-type{margin-bottom:0;}
.sh-ph-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.sh-ph-name{flex:1;font-size:9.5px;color:rgba(255,255,255,.68);font-family:'Barlow',sans-serif;}
.sh-ph-role{font-size:8.5px;color:rgba(255,255,255,.26);font-family:'Barlow',sans-serif;}
.sh-ph-note{margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.06);font-size:8px;color:rgba(255,255,255,.22);line-height:1.5;font-family:'Barlow',sans-serif;}

/* ── LOCK ICON ── */
@keyframes sh-fade-up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
`;function Ls(){if(document.querySelector("#sh-css"))return;const f=document.createElement("style");f.id="sh-css",f.textContent=Cs,document.head.appendChild(f)}class Is{constructor(t){this.state=t,this.container=this._build()}_build(){Ls();const t=document.createElement("div");return t.className="screen screen-hidden",t.innerHTML=`
      <div class="sh">
        <header class="sh-top">
          <button class="sh-back">← MENU</button>
          <div class="sh-title-wrap">
            <div class="sh-title">⚡ WIREVERSE</div>
            <div class="sh-title-sub">LEARNING PATH</div>
          </div>
          <div class="sh-pct-badge" id="sh-pct">0%</div>
        </header>
        <div class="sh-main">
          <div class="sh-strip-area">
            <div class="sh-journey-lbl">YOUR JOURNEY TO BECOME A CERTIFIED ELECTRICIAN</div>
            <div class="sh-scroll" id="sh-scroll"></div>
          </div>
          <div class="sh-rpanel" id="sh-rpanel">
            <div class="sh-rcard">
              <div class="sh-rlbl">YOUR PROGRESS</div>
              <div class="sh-circ-row">
                <div class="sh-circ-wrap">
                  <svg width="58" height="58" viewBox="0 0 58 58">
                    <circle class="sh-circ-bg"   cx="29" cy="29" r="23"/>
                    <circle class="sh-circ-fill" id="sh-circ" cx="29" cy="29" r="23"
                      stroke-dasharray="144.5" stroke-dashoffset="144.5"/>
                  </svg>
                  <div class="sh-circ-pct" id="sh-pct2">0%</div>
                </div>
                <div class="sh-circ-info">
                  <div class="sh-circ-head" id="sh-head">Just Started</div>
                  <div class="sh-circ-sub"  id="sh-sub">0 of 6 done</div>
                </div>
              </div>
              <div id="sh-checklist"></div>
            </div>
            <div class="sh-rcard">
              <div class="sh-rlbl">STANDARD WIRING (PH)</div>
              <div style="font-size:8.5px;color:rgba(255,255,255,.3);font-family:'Barlow',sans-serif;margin-bottom:8px;">TYPE A OUTLET</div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#ef4444"></div><div class="sh-ph-name">Red — Line (Hot)</div><div class="sh-ph-role">From MCB</div></div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#3b82f6"></div><div class="sh-ph-name">Blue — Neutral</div><div class="sh-ph-role">Return</div></div>
              <div class="sh-ph-row"><div class="sh-ph-dot" style="background:#22c55e"></div><div class="sh-ph-name">Green — Ground</div><div class="sh-ph-role">Safety</div></div>
              <div class="sh-ph-note">220V AC / 60Hz · PEC 2017<br>MERALCO grid</div>
            </div>
          </div>
        </div>
      </div>`,t.querySelector(".sh-back").addEventListener("click",()=>this.state.setState("menu")),this._el=t,t}_render(){const t=Ct.filter(h=>O.getLearnStage(h.key)).length,e=Ct.length,s=Math.round(t/e*100),o=Ct.findIndex(h=>!O.getLearnStage(h.key));this._el.querySelector("#sh-pct").textContent=s+"%",this._el.querySelector("#sh-pct2").textContent=s+"%";const i=2*Math.PI*23;this._el.querySelector("#sh-circ").style.strokeDashoffset=i-s/100*i;const a=["Just Started","Keep Going!","Good Progress","Half Way!","Almost Done!","Almost Done!","Complete! 🎉"];this._el.querySelector("#sh-head").textContent=a[t]||"Complete!",this._el.querySelector("#sh-sub").textContent=t===e?"All stages complete!":`${t} of ${e} done`;const n=this._el.querySelector("#sh-scroll");let r="";Ct.forEach((h,d)=>{const u=O.getLearnStage(h.key),w=O.isLearnStageUnlocked(h.key),b=d===o&&w,_=!w,v=u?"sh-b-done":b?"sh-b-prog":w?"sh-b-avail":"sh-b-lock",E=u?"COMPLETED":b?"IN PROGRESS":w?"AVAILABLE":"LOCKED",M=`sh-card ${u?"sh-done":b?"sh-active":_?"sh-locked":""}`,S=u?"sh-btn-done":b?"sh-btn-cont":w?"sh-btn-start":"sh-btn-lock",x=u?"✓  REVIEW":b?"CONTINUE →":w?"START →":"🔒  LOCKED",T=h.title.split(`
`).join("<br>");r+=`
        <div class="${M}" data-state="${h.state}">
          <div class="sh-card-img">
            <div class="sh-card-img-bg" style="background:linear-gradient(160deg,${h.color}44 0%,rgba(4,8,20,.85) 100%),url('${h.img}') center/cover no-repeat;"></div>
            <div class="sh-stage-num" style="color:${h.color}">STAGE ${h.num}</div>
            <div class="sh-badge ${v}">${E}</div>
            <span style="position:relative;z-index:3">${Ms(h.icon,h.color)}</span>
          </div>
          <div class="sh-card-body">
            <div class="sh-card-title">${T}</div>
            <div class="sh-card-desc">${h.desc}</div>
          </div>
          <button class="sh-card-btn ${S}" ${_?"disabled":""}>${x}</button>
        </div>`,d<Ct.length-1&&(r+=`<div class="sh-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>`)}),n.innerHTML=r,n.querySelectorAll(".sh-card:not(.sh-locked)").forEach(h=>{h.addEventListener("click",()=>{const d=h.dataset.state;d&&this.state.setState(d)})});let l="";Ct.forEach((h,d)=>{const u=O.getLearnStage(h.key),w=d===o&&O.isLearnStageUnlocked(h.key);O.isLearnStageUnlocked(h.key),l+=`
        <div class="sh-chk">
          <div class="sh-chk-dot ${u?"d-done":w?"d-active":"d-lock"}"></div>
          <div class="sh-chk-name ${u?"done":w?"active":""}">${h.num.replace(/^0/,"")}. ${h.short}</div>
          ${u?'<div class="sh-chk-tick">✓</div>':""}
        </div>`}),this._el.querySelector("#sh-checklist").innerHTML=l;const c=n.querySelector(".sh-active");c&&setTimeout(()=>c.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"}),100)}onShow(){this._render()}}const As=`
.ol{position:absolute;inset:0;display:flex;flex-direction:column;background:#1a1814;font-family:'Exo 2',sans-serif;overflow:hidden;color:#fff;}

.ol-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(to bottom,rgba(0,0,0,.72) 0%,transparent 100%);z-index:20;pointer-events:none;}
.ol-back{pointer-events:auto;color:#F5C518;font-family:'Share Tech Mono',monospace;font-size:11px;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.25);padding:5px 12px;border-radius:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.ol-top-title{font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.15em;color:#F5C518;}
.ol-timer-box{display:flex;align-items:center;gap:6px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:6px;padding:5px 12px;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:700;}

.ol-canvas{display:block;width:100%;height:100%;position:absolute;inset:0;}

.ol-mission{position:absolute;top:58px;left:14px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:14px 16px;min-width:200px;z-index:15;pointer-events:none;}
.ol-mission-hd{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.1em;color:#F5C518;margin-bottom:8px;}
.ol-task{display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:5px;color:rgba(255,255,255,.4);}
.ol-task.active{color:#fff;}
.ol-task.done{color:#22c55e;text-decoration:line-through;}
.ol-dot{width:8px;height:8px;border-radius:50%;border:2px solid currentColor;flex-shrink:0;}
.ol-task.done .ol-dot{background:#22c55e;border-color:#22c55e;}
.ol-task.active .ol-dot{background:#F5C518;border-color:#F5C518;animation:olPulse 1s infinite;}
@keyframes olPulse{0%,100%{opacity:1}50%{opacity:.35}}
.ol-task-count{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:10px;color:rgba(255,255,255,.35);}

.ol-prog-wrap{position:absolute;top:58px;right:14px;background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:12px 14px;min-width:120px;z-index:15;pointer-events:none;}
.ol-prog-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.1em;color:#F5C518;margin-bottom:6px;}
.ol-prog-bg{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;}
.ol-prog-bar{height:100%;background:#F5C518;border-radius:99px;transition:width .5s ease;width:0%;}
.ol-prog-pct{font-family:'Share Tech Mono',monospace;font-size:20px;font-weight:900;margin-top:4px;}

.ol-instr{position:absolute;bottom:86px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:10px 18px;font-size:13px;font-weight:500;text-align:center;pointer-events:none;max-width:440px;line-height:1.55;z-index:15;}
.ol-instr span{color:#F5C518;}
.ol-snum{display:inline-block;background:#F5C518;color:#000;font-family:'Share Tech Mono',monospace;font-weight:900;font-size:10px;padding:1px 6px;border-radius:3px;margin-right:4px;letter-spacing:.05em;}

.ol-toolbar{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:7px;z-index:20;}
.ol-tool{width:54px;height:54px;border-radius:8px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:20px;gap:2px;-webkit-tap-highlight-color:transparent;transition:all .18s;}
.ol-tool.active{border-color:#F5C518;background:rgba(245,197,24,.18);box-shadow:0 0 12px rgba(245,197,24,.3);}
.ol-tool.disabled{opacity:.25;pointer-events:none;}
.ol-tool-name{font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(255,255,255,.55);}
.ol-tool.active .ol-tool-name{color:#F5C518;}

.ol-wire-panel{position:absolute;bottom:86px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.92);border:1px solid rgba(245,197,24,.3);border-radius:14px;padding:18px 22px;display:none;pointer-events:auto;min-width:340px;z-index:20;}
.ol-wire-panel.hi{box-shadow:0 0 28px rgba(245,197,24,.5);border-color:rgba(245,197,24,.8);animation:olWpGlow 1.8s ease-in-out infinite;}
@keyframes olWpGlow{0%,100%{box-shadow:0 0 14px rgba(245,197,24,.3)}50%{box-shadow:0 0 32px rgba(245,197,24,.65)}}
.ol-wp-title{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;color:#F5C518;margin-bottom:12px;text-align:center;}
.ol-wire-row{display:flex;align-items:center;gap:9px;margin-bottom:9px;}
.ol-wire-drag{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:grab;color:#fff;user-select:none;border:1.5px solid rgba(255,255,255,.2);min-width:78px;text-align:center;transition:all .18s;}
.ol-wire-drag.used{opacity:.28;pointer-events:none;}
.ol-wire-line{flex:1;height:3px;border-radius:2px;}
.ol-wire-term{width:42px;height:28px;border-radius:6px;border:2px dashed;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;transition:all .22s;}
.ol-wire-term.connected{border-style:solid;}
.ol-wire-term.reject{animation:olShake .3s;}
@keyframes olShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

.ol-toast{position:absolute;top:58px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:30px;font-size:12px;font-weight:600;opacity:0;transition:opacity .28s;pointer-events:none;white-space:nowrap;z-index:30;}
.ol-toast.show{opacity:1;}
.ol-toast.ok{background:rgba(34,197,94,.18);border:1px solid #22c55e;color:#22c55e;}
.ol-toast.err{background:rgba(239,68,68,.16);border:1px solid #ef4444;color:#ef4444;}
.ol-toast.info{background:rgba(59,130,246,.18);border:1px solid #3b82f6;color:#3b82f6;}

.ol-reading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;padding:22px 34px;text-align:center;display:none;z-index:35;pointer-events:none;}
.ol-reading.show{display:block;}
.ol-rd-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.18em;color:rgba(255,255,255,.4);margin-bottom:8px;}
.ol-rd-val{font-family:'Share Tech Mono',monospace;font-size:54px;font-weight:900;color:#22c55e;line-height:1;}
.ol-rd-unit{font-family:'Share Tech Mono',monospace;font-size:16px;color:rgba(255,255,255,.45);margin-top:4px;}

.ol-tgt-ring{position:absolute;pointer-events:none;z-index:25;width:68px;height:68px;border-radius:50%;border:3px solid #F5C518;transform:translate(-50%,-50%);display:none;box-shadow:0 0 16px rgba(245,197,24,.5);}
.ol-tgt-pulse{position:absolute;pointer-events:none;z-index:24;width:68px;height:68px;border-radius:50%;border:2px solid rgba(245,197,24,.5);transform:translate(-50%,-50%);animation:olRingPulse 1.3s ease-out infinite;display:none;}
@keyframes olRingPulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.8}100%{transform:translate(-50%,-50%) scale(2.1);opacity:0}}
.ol-tgt-lbl{position:absolute;pointer-events:none;z-index:26;background:rgba(0,0,0,.82);border:1px solid #F5C518;color:#F5C518;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;padding:3px 10px;border-radius:4px;transform:translateX(-50%);display:none;white-space:nowrap;animation:olTapBounce .7s ease-in-out infinite alternate;}
@keyframes olTapBounce{from{transform:translateX(-50%) translateY(0)}to{transform:translateX(-50%) translateY(7px)}}

.ol-success{position:absolute;inset:0;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;pointer-events:auto;z-index:40;}
.ol-success.show{display:flex;}
.ol-so-big{font-family:'Share Tech Mono',monospace;font-size:72px;font-weight:900;color:#22c55e;line-height:1;}
.ol-so-sub{font-size:15px;color:rgba(255,255,255,.65);}
.ol-so-btn{margin-top:8px;padding:12px 30px;border-radius:8px;background:#F5C518;color:#000;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:900;letter-spacing:.07em;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}
`;function Rs(){if(document.querySelector("#ol-css"))return;const f=document.createElement("style");f.id="ol-css",f.textContent=As,document.head.appendChild(f)}function st(f,t,e,s,o=.7,i=.1){return new p(new y(f,t,e),new g({color:s,roughness:o,metalness:i}))}function zt(f,t,e,s,o,i=.5,a=.3){return new p(new k(f,t,e,s),new g({color:o,roughness:i,metalness:a}))}function Lt(f){return f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2}class Os{constructor(t){le(this,"_$",t=>this._el.querySelector(`#${t}`));this.state=t,this._animId=null,this._renderer=null,this._timerIv=null,this.container=this._build()}_build(){Rs();const t=document.createElement("div");return t.className="screen screen-hidden",t.innerHTML=`
      <div class="ol">
        <canvas class="ol-canvas" id="ol-canvas"></canvas>

        <div class="ol-top">
          <button class="ol-back" id="ol-back">← STAGES</button>
          <span class="ol-top-title">⚡ OUTLET REPAIR</span>
          <div class="ol-timer-box">⏱ <span id="ol-timer">05:00</span></div>
        </div>

        <div class="ol-mission">
          <div class="ol-mission-hd">🔧 Broken Outlet</div>
          ${[1,2,3,4,5,6,7,8].map(e=>`<div class="ol-task ${e===1?"active":""}" id="ol-t${e}"><div class="ol-dot"></div>${["Turn OFF breaker","Remove cover screw","Open outlet cover","Inspect wires","Reconnect wires","Close outlet","Turn ON breaker","Test with multimeter"][e-1]}</div>`).join("")}
          <div class="ol-task-count">Steps: <span id="ol-done-count">0</span>/8</div>
        </div>

        <div class="ol-prog-wrap">
          <div class="ol-prog-lbl">PROGRESS</div>
          <div class="ol-prog-bg"><div class="ol-prog-bar" id="ol-prog-bar"></div></div>
          <div class="ol-prog-pct"><span id="ol-pct">0</span>%</div>
        </div>

        <div class="ol-instr" id="ol-instr"><span class="ol-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span></div>

        <div class="ol-wire-panel" id="ol-wire-panel">
          <div class="ol-wp-title">CONNECT WIRES TO CORRECT TERMINALS</div>
          ${["brown","blue","green"].map(e=>{const o={brown:{bg:"#92400e",bc:"#b45309",lbl:"BROWN (L)",tLbl:"L"},blue:{bg:"#1d4ed8",bc:"#3b82f6",lbl:"BLUE (N)",tLbl:"N"},green:{bg:"#166534",bc:"#22c55e",lbl:"GREEN (E)",tLbl:"E"}}[e];return`<div class="ol-wire-row">
              <div class="ol-wire-drag" id="ol-wd-${e}" style="background:${o.bg};border-color:${o.bc}" draggable="true">${o.lbl}</div>
              <div class="ol-wire-line" style="background:${o.bc};opacity:.5"></div>
              <div class="ol-wire-term" id="ol-wt-${e}" style="border-color:${o.bc};color:${o.bc}">${o.tLbl}</div>
            </div>`}).join("")}
        </div>

        <div class="ol-toolbar" id="ol-toolbar">
          <div class="ol-tool disabled" id="ol-tool-screwdriver">🔧<div class="ol-tool-name">SCREW</div></div>
          <div class="ol-tool disabled" id="ol-tool-multimeter">📊<div class="ol-tool-name">METER</div></div>
        </div>

        <div class="ol-toast" id="ol-toast"></div>

        <div class="ol-tgt-ring"   id="ol-tgt-ring"></div>
        <div class="ol-tgt-pulse"  id="ol-tgt-pulse"></div>
        <div class="ol-tgt-lbl"    id="ol-tgt-lbl">TAP HERE</div>

        <div class="ol-reading" id="ol-reading">
          <div class="ol-rd-lbl">VOLTAGE READING</div>
          <div class="ol-rd-val" id="ol-rd-val">---</div>
          <div class="ol-rd-unit">Volts AC</div>
        </div>

        <div class="ol-success" id="ol-success">
          <div class="ol-so-big">✓ FIXED!</div>
          <div class="ol-so-sub">Outlet repaired and tested successfully.</div>
          <button class="ol-so-btn" id="ol-so-btn">BACK TO STAGES</button>
        </div>
      </div>`,t.querySelector("#ol-back").addEventListener("click",()=>{this._cleanup(),this.state.setState("stagesHub")}),t.querySelector("#ol-so-btn").addEventListener("click",()=>{this._cleanup(),this.state.setState("stagesHub")}),t.querySelectorAll(".ol-tool").forEach(e=>{e.addEventListener("click",()=>{const s=e.id.replace("ol-tool-","");this._selectTool(s)})}),this._setupDragDrop(t),this._el=t,t}_initThree(){if(this._renderer)return;const t=this._el.querySelector("#ol-canvas"),e=this._el.querySelector(".ol"),s=e.offsetWidth||window.innerWidth,o=e.offsetHeight||window.innerHeight;if(!s||!o){setTimeout(()=>this._initThree(),80);return}const i=new _t({canvas:t,antialias:!0});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Bt,i.toneMapping=Ht,i.toneMappingExposure=1.15;const a=new mt;a.background=new R(1710100),a.fog=new ee(1710100,10,22);const n=new xt(42,s/o,.1,100);n.position.set(1.2,.8,6.5),n.lookAt(0,0,0),a.add(new se(16777215,.35));const r=new At(16774368,2.8,22,Math.PI*.16,.25);r.position.set(1,7,6),r.castShadow=!0,a.add(r),a.add(r.target);const l=new ht(4491519,.25);l.position.set(-4,2,-3),a.add(l);const c=new ht(16768426,.15);c.position.set(3,-2,4),a.add(c),a.add(Object.assign(new ht(16777215,.45),{position:new m(-6,3,5)}));const h=new V(16729088,0,2.5);h.position.set(0,-.35,.25),a.add(h);const d=new p(new kt(14,9),new ze({color:2762272}));d.position.z=-1.2,d.receiveShadow=!0,a.add(d);const{outletRoot:u,faceGroup:w,facePlate:b,screwGroup:_,screwHead:v,washer:E,internalGroup:M,terminalMeshes:S,wireMeshes:x,looseWirePts:T,jBox:C,bkHandle:I,bkHandleMat:z,bkLEDMat:L,HANDLE_ON_Y:P,HANDLE_OFF_Y:H}=this._buildOutlet(a),F=new $t,Y=new Rt;t.addEventListener("click",B=>this._onClick(B,F,Y,n,b,v,E,I,C)),t.addEventListener("pointermove",B=>{Y.x=B.clientX/s*2-1,Y.y=-(B.clientY/o)*2+1,F.setFromCamera(Y,n);const q=this._gameState;let j="default";((q==="breaker_off"||q==="breaker_on")&&F.intersectObjects([I],!0).length||q==="screw"&&F.intersectObjects([v,E],!0).length||(q==="open"||q==="test")&&F.intersectObject(b,!1).length||q==="rescrew")&&(j="pointer"),t.style.cursor=j}),this._resizeObs=new ResizeObserver(()=>{const B=e.offsetWidth,q=e.offsetHeight;!B||!q||(i.setSize(B,q),n.aspect=B/q,n.updateProjectionMatrix())}),this._resizeObs.observe(e),this._renderer=i,this._three={scene:a,camera:n,renderer:i,damageLight:h,outletRoot:u,faceGroup:w,facePlate:b,screwGroup:_,screwHead:v,washer:E,internalGroup:M,terminalMeshes:S,wireMeshes:x,looseWirePts:T,jBox:C,bkHandle:I,bkHandleMat:z,bkLEDMat:L,HANDLE_ON_Y:P,HANDLE_OFF_Y:H,raycaster:F,ptr:Y,camFrom:new m,camTo:new m,camLookFrom:new m,camLookTo:new m,camTweening:!1,camT:0,camDur:0,camCB:null},this._startLoop()}_buildOutlet(t){const e=new A;t.add(e);const s=.7,o=st(2.4,2.4,s,5914656,.9,.05);o.position.z=-1.2+s/2-.05,e.add(o);const i=st(2.1,2.1,.05,1708040,.95,0);i.position.z=-1.2+s-.03,e.add(i);const a=new p(new y(2.6,2.6,.06),new g({color:8947848,roughness:.4,metalness:.6}));a.position.z=-1.2+s,e.add(a),[-.7,.7].forEach(G=>{const W=st(.22,.14,.08,6710886,.5,.5);W.position.set(G,.95,-1.2+s+.02),e.add(W)});const n=new A;n.position.set(0,-.9,0),e.add(n);const r=st(2,1.85,.14,14012614,.65,.05);r.position.set(0,.925,0),r.castShadow=!0,n.add(r),[-.65,.65].forEach(G=>{[-.7,.7].forEach(W=>{const tt=zt(.055,.055,.16,12,11184810,.3,.5);tt.rotation.x=Math.PI/2,tt.position.set(G,W+.925,.07),n.add(tt)})});const l=new g({color:1118481,roughness:.9});[-.32,.32].forEach(G=>{const W=new p(new y(.14,.35,.18),l);W.position.set(G,1.08,.07),n.add(W)});const c=new p(new k(.11,.11,.18,20),l);c.rotation.x=Math.PI/2,c.position.set(0,.72,.07),n.add(c);const h=new A;h.position.set(0,.925,0),n.add(h);const d=zt(.115,.095,.07,24,11579568,.2,.7);d.rotation.x=Math.PI/2,d.position.z=.11,h.add(d);const u=zt(.13,.13,.015,24,8947848,.4,.5);u.rotation.x=Math.PI/2,u.position.z=.075,h.add(u);const w=new g({color:3355443,roughness:.8});for(let G=0;G<2;G++){const W=new p(new y(.2,.025,.03),w);W.rotation.z=G*Math.PI/2,W.position.z=.15,h.add(W)}const b=zt(.045,.05,.5,12,10066329,.3,.6);b.rotation.x=Math.PI/2,b.position.z=-.18,h.add(b);const _=new A;_.visible=!1,e.add(_);const v=st(2,.22,.12,5592405,.7,.3);v.position.set(0,0,-.52),_.add(v);const E=st(1.7,.55,.18,3815994,.85,.1);E.position.set(0,0,-.45),_.add(E);const M=[{x:-.52,color:11817737},{x:0,color:3900150},{x:.52,color:2278750}],S=[];M.forEach(({x:G,color:W})=>{const tt=st(.28,.42,.22,W,.6,.2);tt.position.set(G,0,-.38),_.add(tt);const et=zt(.08,.08,.06,16,11184810,.2,.7);et.rotation.x=Math.PI/2,et.position.set(G,0,-.27),_.add(et);const vt=st(.26,.04,.02,2236962,1,0);vt.position.set(G,.22,-.37),_.add(vt),S.push({x:G,color:W,glowMesh:vt})});const x=-3.05,T=.28,C=-1.06,I=st(1.02,1.65,.22,4342338,.72,.38);I.position.set(x,T,C+.11),t.add(I);const z=st(.84,1.44,.04,2894892,.88,.05);z.position.set(x,T,C+.235),t.add(z);const L=st(.84,.055,.05,16106776,.65,.1);L.position.set(x,T+.72,C+.24),t.add(L);const P=st(.34,.64,.03,1579032,.9,0);P.position.set(x,T,C+.256),t.add(P);const H=new g({color:2278750,roughness:.42,metalness:.28}),F=T+.16,Y=T-.16,B=new p(new y(.24,.3,.16),H);B.position.set(x,F,C+.31),t.add(B);const q=new g({color:2278750,roughness:.28,metalness:.5,emissive:new R(2278750),emissiveIntensity:1}),j=new p(new k(.048,.048,.055,12),q);j.rotation.x=Math.PI/2,j.position.set(x+.27,T+.54,C+.245),t.add(j);const wt=[11817737,3900150,2278750],Dt=[[new m(-.52,0,-.42),new m(-.6,-.3,-.1),new m(-.8,-.85,.2),new m(-.55,-1.35,.05)],[new m(0,0,-.42),new m(.1,-.28,-.1),new m(.05,-.9,.18),new m(.1,-1.4,.08)],[new m(.52,0,-.42),new m(.62,-.28,-.1),new m(.75,-.88,.2),new m(.55,-1.3,.04)]],Ft=wt.map((G,W)=>{const tt=new ut(Dt[W]),et=new p(new ct(tt,32,.042,8,!1),new g({color:G,roughness:.58,metalness:.04}));return et.visible=!1,e.add(et),et});return{outletRoot:e,faceGroup:n,facePlate:r,screwGroup:h,screwHead:d,washer:u,internalGroup:_,terminalMeshes:S,wireMeshes:Ft,looseWirePts:Dt,jBox:o,bkHandle:B,bkHandleMat:H,bkLEDMat:q,HANDLE_ON_Y:F,HANDLE_OFF_Y:Y}}_resetState(){this._gameState="breaker_off",this._selectedTool=null,this._wiresState={brown:!1,blue:!1,green:!1},this._completedTasks=0,this._timerVal=300,this._timerRunning=!1,this._screwRemoving=!1,this._screwSpinT=0,this._screwReattach=!1,this._screwReattachT=0,this._coverOpening=!1,this._coverOpenT=0,this._coverClosing=!1,this._coverCloseT=0,this._bkAnimating=!1,this._bkAnimT=0,this._bkGoingOff=!1,this._bkCB=null,this._inspecting=!1,this._inspectT=0,this._idleT=0,this._damageLightT=0,this._tutTarget=null}_completeTask(t,e){this._completedTasks++;const s=this._$(`ol-t${t}`);s&&(s.classList.remove("active"),s.classList.add("done"));const o=this._$(`ol-t${t+1}`);o&&o.classList.add("active"),this._$("ol-done-count").textContent=this._completedTasks,this._setPct(e)}_setPct(t){this._$("ol-prog-bar").style.width=t+"%",this._$("ol-pct").textContent=t}_setInstr(t){const e=this._$("ol-instr");e.style.display="block",e.innerHTML=t}_selectTool(t){this._selectedTool=t,this._el.querySelectorAll(".ol-tool").forEach(s=>s.classList.remove("active"));const e=this._$(`ol-tool-${t}`);e&&e.classList.add("active")}_enableTool(t){const e=this._$(`ol-tool-${t}`);e&&e.classList.remove("disabled")}_showToast(t,e){const s=this._$("ol-toast");s.textContent=t,s.className=`ol-toast show ${e}`,clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>s.classList.remove("show"),2800)}_setTut(t,e="TAP HERE"){this._tutTarget=t,this._$("ol-tgt-lbl").textContent=e}_updateTutorial(){const t=this._gameState,e=this._tutTarget&&t!=="animating"&&t!=="inspect"&&t!=="wires"&&t!=="done",s=this._$("ol-tgt-ring"),o=this._$("ol-tgt-pulse"),i=this._$("ol-tgt-lbl");if(!e||!this._three){s.style.display="none",o.style.display="none",i.style.display="none";return}const{camera:a}=this._three,n=this._el.querySelector(".ol"),r=n.offsetWidth,l=n.offsetHeight,c=new m;this._tutTarget.getWorldPosition(c);const h=c.clone().project(a);if(h.z>1){s.style.display="none",o.style.display="none",i.style.display="none";return}const d=(h.x+1)/2*r,u=(-h.y+1)/2*l;[s,o].forEach(w=>{w.style.display="block",w.style.left=d+"px",w.style.top=u+"px"}),i.style.display="block",i.style.left=d+"px",i.style.top=u+46+"px"}_onClick(t,e,s,o,i,a,n,r,l){const c=this._gameState;if(c==="animating"||c==="inspect"||c==="done")return;const d=this._el.querySelector(".ol").getBoundingClientRect();if(s.x=(t.clientX-d.left)/d.width*2-1,s.y=-((t.clientY-d.top)/d.height)*2+1,e.setFromCamera(s,o),c==="breaker_off")e.intersectObjects([r],!0).length?this._doBreaker(!0):this._showToast("Find the breaker panel on the left and tap it!","err");else if(c==="screw")if(e.intersectObjects([a,n],!0).length){if(this._selectedTool!=="screwdriver"){this._showToast("Select the Screwdriver first!","err");return}this._doRemoveScrew()}else this._showToast("Click the screw at the center of the outlet!","err");else if(c==="open")e.intersectObject(i,!1).length?this._doOpenCover():this._showToast("Click the outlet cover plate to open it","err");else if(c==="rescrew")this._doCloseCover();else if(c==="breaker_on")e.intersectObjects([r],!0).length?this._doBreaker(!1):this._showToast("Tap the breaker panel to switch it back ON!","err");else if(c==="test"){if(this._selectedTool!=="multimeter"){this._showToast("Select the Multimeter tool first!","err");return}e.intersectObject(i,!1).length?this._doTest():this._showToast("Point the multimeter at the outlet and tap","err")}}_animateCam(t,e,s,o){const{camera:i,camFrom:a,camTo:n,camLookFrom:r,camLookTo:l}=this._three;a.copy(i.position),n.copy(t);const c=new m(0,0,-1).applyQuaternion(i.quaternion);r.copy(i.position).addScaledVector(c,5),l.copy(e),this._three.camT=0,this._three.camDur=s,this._three.camCB=o,this._three.camTweening=!0}_doBreaker(t){this._gameState="animating",this._setTut(null),this._showToast(t?"Switching breaker OFF...":"Switching breaker back ON...","ok"),this._animateCam(new m(-1.4,.55,5.6),new m(this._three.bkHandle.position.x,this._three.bkHandle.position.y,0),900,()=>{this._bkGoingOff=t,this._bkAnimT=0,this._bkAnimating=!0,this._bkCB=t?()=>this._afterBreakerOff():()=>this._afterBreakerOn()})}_afterBreakerOff(){this._completeTask(1,12),this._showToast("Breaker OFF — Safe to work! Now remove the cover screw.","ok"),this._setInstr('<span class="ol-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span> on the outlet'),this._enableTool("screwdriver"),this._selectTool("screwdriver"),this._setTut(this._three.screwHead,"TAP SCREW"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),800,()=>{this._gameState="screw"})}_afterBreakerOn(){this._completeTask(7,88),this._showToast("Breaker ON! Test the outlet with the multimeter.","ok"),this._setInstr('<span class="ol-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span> to test voltage'),this._enableTool("multimeter"),this._selectTool("multimeter"),this._setTut(this._three.facePlate,"TAP OUTLET"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),800,()=>{this._gameState="test"})}_doRemoveScrew(){this._gameState="animating",this._setTut(null),this._showToast("Removing cover screw...","ok"),this._animateCam(new m(.3,1.1,3.2),new m(0,.92,0),900,()=>{this._screwRemoving=!0,this._screwSpinT=0})}_doOpenCover(){this._gameState="animating",this._setTut(null),this._showToast("Opening outlet cover...","ok"),this._animateCam(new m(-3.5,2.2,4),new m(0,.2,0),1100,()=>{this._coverOpening=!0,this._coverOpenT=0})}_doCloseCover(){this._gameState="animating",this._setTut(null),this._showToast("Closing outlet cover...","ok"),this._animateCam(new m(-2.8,1.8,4.2),new m(0,.3,0),900,()=>{this._coverClosing=!0,this._coverCloseT=0})}_doTest(){this._gameState="animating",this._setTut(null),this._animateCam(new m(.3,.3,3.5),new m(0,.2,0),700,()=>{const t=this._$("ol-reading"),e=this._$("ol-rd-val");t.classList.add("show"),e.textContent="---";const s=["---","12V","85V","154V","199V","216V","220V"];let o=0;const i=setInterval(()=>{o<s.length&&(e.textContent=s[o],o++),o>=s.length&&(clearInterval(i),setTimeout(()=>{t.classList.remove("show"),this._completeTask(8,100),this._gameState="done",this._timerRunning&&(clearInterval(this._timerIv),this._timerRunning=!1),this._showToast("220V AC — Outlet working perfectly!","ok"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),1200,()=>{setTimeout(()=>{O.saveLearnStage("outlet"),O.completeLesson("outlet"),this._$("ol-success").classList.add("show")},700)})},700))},220)})}_setupDragDrop(t){const e=["brown","blue","green"];let s=null;e.forEach(i=>{const a=t.querySelector(`#ol-wd-${i}`);a&&(a.addEventListener("dragstart",r=>{r.dataTransfer.setData("text/plain",i),s=i}),a.addEventListener("dragend",()=>{s=null}));const n=t.querySelector(`#ol-wt-${i}`);n&&(n.addEventListener("dragover",r=>r.preventDefault()),n.addEventListener("drop",r=>{r.preventDefault();const l=r.dataTransfer.getData("text/plain");this._connectWire(l,i)}),n.addEventListener("click",()=>{s&&(this._connectWire(s,i),s=null)}))});let o=null;e.forEach(i=>{const a=t.querySelector(`#ol-wd-${i}`);a&&a.addEventListener("click",()=>{this._wiresState[i]||(o=i,t.querySelectorAll(".ol-wire-drag").forEach(r=>r.style.outline=""),a.style.outline="2px solid #F5C518")});const n=t.querySelector(`#ol-wt-${i}`);n&&n.addEventListener("click",()=>{o&&(this._connectWire(o,i),o=null,t.querySelectorAll(".ol-wire-drag").forEach(r=>r.style.outline=""))})})}_connectWire(t,e){if(t!==e){const b=this._$(`ol-wt-${e}`);b&&(b.classList.add("reject"),setTimeout(()=>b.classList.remove("reject"),400)),this._showToast("Wrong terminal! Match the wire color to the terminal.","err");return}if(this._wiresState[t])return;this._wiresState[t]=!0;const s=this._$(`ol-wd-${t}`);s&&s.classList.add("used");const o=this._$(`ol-wt-${t}`);if(o){const b={brown:"#92400e",blue:"#1d4ed8",green:"#166534"};o.style.background=b[t],o.style.color="#fff",o.style.borderStyle="solid",o.textContent="✓"}const i=["brown","blue","green"],a=[11817737,3900150,2278750],n=i.indexOf(t),{outletRoot:r,terminalMeshes:l,wireMeshes:c}=this._three,h=l[n].x;r.remove(c[n]);const d=[new m(h,0,-.42),new m(h,-.25,-.2),new m(h+(Math.random()-.5)*.3,-.7,.05),new m(h+(Math.random()-.5)*.2,-1.2,0)],u=new p(new ct(new ut(d),32,.038,8,!1),new g({color:a[n],roughness:.55,metalness:.05}));r.add(u),c[n]=u,l[n].glowMesh.material.color.setHex(a[n]),l[n].glowMesh.material.emissive=new R(a[n]),l[n].glowMesh.material.emissiveIntensity=.8;const w={brown:54,blue:62,green:70};this._showToast(`${t.charAt(0).toUpperCase()+t.slice(1)} wire connected ✓`,"ok"),this._setPct(w[t]),this._three.damageLight.intensity=Math.max(0,.9-Object.values(this._wiresState).filter(Boolean).length*.3),this._wiresState.brown&&this._wiresState.blue&&this._wiresState.green&&(this._three.damageLight.intensity=0,setTimeout(()=>{this._completedTasks++;const b=this._$("ol-t5");b&&(b.classList.remove("active"),b.classList.add("done"));const _=this._$("ol-t6");_&&_.classList.add("active"),this._$("ol-done-count").textContent=this._completedTasks,this._setPct(75),this._$("ol-wire-panel").style.display="none",this._$("ol-wire-panel").classList.remove("hi"),this._setInstr('<span class="ol-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover'),this._setTut(this._three.jBox,"TAP TO CLOSE"),this._gameState="rescrew",this._animateCam(new m(.8,.4,5.5),new m(0,.2,0),700,()=>{})},900))}_startLoop(){const{renderer:t,scene:e,camera:s}=this._three;let o=performance.now();const i=()=>{if(!this._renderer)return;this._animId=requestAnimationFrame(i);const a=performance.now(),n=Math.min((a-o)*.001,.05);o=a,this._idleT=(this._idleT||0)+n,this._damageLightT=(this._damageLightT||0)+n,this._update(n),t.render(e,s)};i()}_update(t){const e=this._three;if(!e)return;const{outletRoot:s,faceGroup:o,internalGroup:i,wireMeshes:a,screwGroup:n,damageLight:r,bkHandle:l,bkHandleMat:c,bkLEDMat:h,HANDLE_ON_Y:d,HANDLE_OFF_Y:u,camera:w,camFrom:b,camTo:_,camLookFrom:v,camLookTo:E}=e;if(s.position.y=Math.sin(this._idleT*.55)*.035,s.rotation.z=Math.sin(this._idleT*.35)*.006,s.rotation.x=Math.sin(this._idleT*.28)*.005+.04,i.visible&&r.intensity>0){const M=.5+.5*Math.sin(this._damageLightT*3.5);r.intensity=.9*M,r.color.setHSL(.06-M*.04,1,.5)}if(e.camTweening){e.camT+=t*1e3;const M=Lt(Math.min(e.camT/e.camDur,1));if(w.position.lerpVectors(b,_,M),w.lookAt(new m().lerpVectors(v,E,M)),e.camT>=e.camDur&&(e.camTweening=!1,e.camCB)){const S=e.camCB;e.camCB=null,S()}}if(this._bkAnimating){this._bkAnimT+=t*2.8;const M=Lt(Math.min(this._bkAnimT,1)),S=this._bkGoingOff?d:u,x=this._bkGoingOff?u:d;if(l.position.y=S+(x-S)*M,this._bkAnimT>=1&&(this._bkAnimating=!1,l.position.y=x,this._bkGoingOff?(c.color.setHex(15680580),h.color.setHex(15680580),h.emissive.setHex(8917265),h.emissiveIntensity=.55):(c.color.setHex(2278750),h.color.setHex(2278750),h.emissive.setHex(2278750),h.emissiveIntensity=1),this._bkCB)){const T=this._bkCB;this._bkCB=null,T()}}if(this._screwRemoving&&(this._screwSpinT+=t*5.5,n.rotation.z=this._screwSpinT,n.position.z=this._screwSpinT*.09,n.position.y=this._screwSpinT*.03,this._screwSpinT>Math.PI*5&&(this._screwRemoving=!1,n.visible=!1,this._completeTask(2,24),this._showToast("Screw removed! Now tap the outlet cover to open it.","ok"),this._setInstr('<span class="ol-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it'),this._setTut(e.facePlate,"TAP COVER"),this._animateCam(new m(-1.8,1.4,5.2),new m(0,.4,0),700,()=>{this._gameState="open"}))),this._coverOpening){this._coverOpenT+=t*1.4;const M=Math.min(this._coverOpenT,1);o.rotation.x=Lt(M)*1.95,this._coverOpenT>=1&&(this._coverOpening=!1,o.visible=!1,i.visible=!0,a.forEach(S=>S.visible=!0),r.intensity=.9,this._damageLightT=0,this._completeTask(3,36),this._showToast("Cover open! Inspecting wiring...","ok"),this._setInstr('<span class="ol-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>'),this._setTut(null),this._inspecting=!0,this._inspectT=0,this._animateCam(new m(.2,.5,3.6),new m(0,-.25,0),1e3,()=>{}))}if(this._inspecting&&(this._inspectT+=t,this._inspectT>.8&&this._inspectT<.82&&this._animateCam(new m(-.1,-.4,2.6),new m(0,-.5,0),900,()=>{}),this._inspectT>=2.5&&(this._inspecting=!1,this._completeTask(4,48),this._showToast("Wires disconnected — match wire color to terminal.","info"),this._$("ol-wire-panel").style.display="block",this._$("ol-wire-panel").classList.add("hi"),this._$("ol-instr").style.display="none",this._gameState="wires",this._animateCam(new m(.3,2.2,5),new m(0,-.1,0),900,()=>{}))),this._coverClosing){this._coverCloseT+=t*1.2;const M=Math.min(this._coverCloseT,1);o.visible=!0,o.rotation.x=(1-Lt(M))*1.95,this._coverCloseT>=1&&(this._coverClosing=!1,o.rotation.x=0,o.position.set(0,-.9,0),i.visible=!1,a.forEach(S=>S.visible=!1),r.intensity=0,n.visible=!0,n.position.set(0,.925,.6),n.rotation.z=Math.PI*9,this._screwReattach=!0,this._screwReattachT=0,this._animateCam(new m(.2,.95,3),new m(0,.92,0),600,()=>{}))}if(this._screwReattach){this._screwReattachT+=t*4;const M=Math.min(this._screwReattachT/3.5,1);n.rotation.z=(1-Lt(M))*Math.PI*9,n.position.z=(1-Lt(M))*.6,n.position.y=.925,this._screwReattachT>=3.5&&(this._screwReattach=!1,n.rotation.z=0,n.position.set(0,.925,0),this._completeTask(6,82),this._showToast("Outlet closed! Turn the breaker back ON.","ok"),this._setInstr('<span class="ol-snum">STEP 7</span>Find the <span>breaker panel</span> on the left — switch it back <span>ON</span>'),this._setTut(l,"TAP BREAKER"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),1200,()=>{this._gameState="breaker_on"}))}this._updateTutorial()}_startTimer(){this._timerRunning||(this._timerRunning=!0,this._timerIv=setInterval(()=>{if(!this._timerRunning){clearInterval(this._timerIv);return}this._timerVal=Math.max(0,this._timerVal-1);const t=Math.floor(this._timerVal/60).toString().padStart(2,"0"),e=(this._timerVal%60).toString().padStart(2,"0"),s=this._$("ol-timer");s&&(s.textContent=t+":"+e)},1e3))}onShow(){this._resetState(),this._initDOMReset(),setTimeout(()=>this._initThree(),80),this._startTimer()}_initDOMReset(){this._setPct(0),this._$("ol-done-count").textContent="0";for(let t=1;t<=8;t++){const e=this._$(`ol-t${t}`);e&&(e.classList.remove("done","active"),t===1&&e.classList.add("active"))}this._$("ol-wire-panel").style.display="none",this._$("ol-wire-panel").classList.remove("hi"),this._$("ol-instr").style.display="block",this._$("ol-instr").innerHTML='<span class="ol-snum">STEP 1</span>Find the <span>breaker panel</span> on the left wall — tap to switch it <span>OFF</span> before working',this._$("ol-success").classList.remove("show"),this._$("ol-reading").classList.remove("show"),["screwdriver","multimeter"].forEach(t=>{const e=this._$(`ol-tool-${t}`);e&&(e.classList.add("disabled"),e.classList.remove("active"))}),["brown","blue","green"].forEach(t=>{const e=this._$(`ol-wd-${t}`);e&&e.classList.remove("used");const s=this._$(`ol-wt-${t}`);if(s){const o={brown:"#b45309",blue:"#3b82f6",green:"#22c55e"}[t],i={brown:"L",blue:"N",green:"E"}[t];s.style.background="",s.style.color=o,s.style.borderStyle="dashed",s.textContent=i}}),this._$("ol-timer").textContent="05:00"}_cleanup(){this._timerIv&&(clearInterval(this._timerIv),this._timerIv=null,this._timerRunning=!1),this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._renderer&&(this._renderer.dispose(),this._renderer=null,this._three=null)}onHide(){this._cleanup()}}const Ps=`
.hls{position:absolute;inset:0;background:#060a14;}
.hls-frame{position:absolute;inset:0;border:none;width:100%;height:100%;}
.hls-fab{
  position:absolute;top:12px;left:12px;z-index:100;
  background:rgba(4,8,20,.88);border:1px solid rgba(0,212,255,.35);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
  padding:8px 14px;border-radius:9px;cursor:pointer;touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;letter-spacing:1px;
  box-shadow:0 2px 12px rgba(0,0,0,.5);transition:all .15s;
  display:flex;align-items:center;gap:6px;
}
.hls-fab:active{transform:scale(.93);}
`;let Ie=!1;function zs(){if(Ie)return;Ie=!0;const f=document.createElement("style");f.id="hls-css",f.textContent=Ps,document.head.appendChild(f)}class fe{constructor(t,e){this.state=t,this.cfg=e,this.container=this._build()}_build(){zs();const t=document.createElement("div");t.className="screen screen-hidden",t.innerHTML=`
      <div class="hls">
        <button class="hls-fab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          BACK
        </button>
        <iframe class="hls-frame" id="hls-frame" allowfullscreen></iframe>
      </div>`;const e=()=>this.state.setState(this.cfg.backState||"stagesHub");return t.querySelector(".hls-fab").addEventListener("click",e),t.querySelector(".hls-fab").addEventListener("touchend",s=>{s.preventDefault(),e()}),this._msgHandler=s=>{var o,i;((o=s.data)==null?void 0:o.type)==="complete"&&this._complete(),((i=s.data)==null?void 0:i.type)==="back"&&e()},this._el=t,t}_complete(){O.saveLearnStage(this.cfg.key)}onShow(){window.addEventListener("message",this._msgHandler);const t=this._el.querySelector("#hls-frame");t.src=this.cfg.src}onHide(){window.removeEventListener("message",this._msgHandler);const t=this._el.querySelector("#hls-frame");t.src="about:blank"}}class qs{constructor(t,e){this._root=t,this._onFixed=e,this._open=!1,this._socketId=1,this._outletRoot=null,this._faceGroup=null,this._facePlate=null,this._screwGroup=null,this._screwHead=null,this._washer=null,this._internalGroup=null,this._terminalMeshes=[],this._wireMeshes=[],this._looseWirePts=[],this._bkHandle=null,this._bkHandleMat=null,this._bkLEDMat=null,this._jBox=null,this._BX=0,this._BY=0,this._BZ=0,this._HANDLE_ON_Y=0,this._HANDLE_OFF_Y=0,this._damageLight=null,this._raycaster=null,this._mouse=null,this._clickScrewObjs=[],this._clickBreakerObjs=[],this._gameState="breaker_off",this._selectedTool=null,this._wiresState={},this._completedTasks=0,this._timerVal=300,this._timerRunning=!1,this._timerInterval=null,this._touchWire=null,this._touchClone=null,this._screwRemoving=!1,this._screwSpinT=0,this._screwReattaching=!1,this._screwReattachT=0,this._coverOpening=!1,this._coverOpenT=0,this._coverClosing=!1,this._coverCloseT=0,this._bkAnimating=!1,this._bkAnimT=0,this._bkGoingOff=!1,this._bkCB=null,this._inspecting=!1,this._inspectT=0,this._camTweening=!1,this._camT=0,this._camDur=0,this._camCB=null,this._camFrom=new m,this._camTo=new m,this._camLookFrom=new m,this._camLookTo=new m,this._idleT=0,this._damageLightT=0,this._tutTarget3D=null,this._toastTimer=null,this._camHintTimer=null,this._renderer=null,this._scene=null,this._camera=null,this._clock=null,this._raf=null,this._docListeners=[],this._initThree(),this._initDragDrop(),this._initCanvasEvents()}open(t){this._socketId=t;const e=this._root.querySelector("#or-overlay");e&&(e.style.display="block");const s=this._root.querySelector("#or-canvas");s&&this._renderer&&requestAnimationFrame(()=>{const a=s.clientWidth||window.innerWidth,n=s.clientHeight||window.innerHeight;this._renderer.setSize(a,n),this._camera.aspect=a/n,a<n?this._camera.fov=Math.min(70,42*(n/a)*.75):this._camera.fov=42,this._camera.updateProjectionMatrix()});const o={1:"Lobby",2:"Wiring Lab",3:"Corridor",4:"Control Room",5:"Tool Room"},i=this._$o("socket-label");i&&(i.textContent=`Socket #${t} — ${o[t]||"Room"}`),this._resetAll(),this._open||(this._open=!0,this._loop())}close(){this._open=!1;const t=this._root.querySelector("#or-overlay");t&&(t.style.display="none"),this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this._touchClone&&(this._touchClone.remove(),this._touchClone=null),this._touchWire=null}destroy(){this.close(),cancelAnimationFrame(this._raf),this._raf=null;for(const[t,e,s]of this._docListeners)t.removeEventListener(e,s);this._docListeners=[],this._scene&&this._scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material.dispose())}),this._renderer&&(this._renderer.dispose(),this._renderer=null)}_$o(t){return this._root.querySelector("#or-"+t)}_initThree(){const t=this._root.querySelector("#or-canvas");if(!t){console.error("[OutletScenario] #or-canvas not found");return}this._renderer=new _t({canvas:t,antialias:!1}),this._renderer.setPixelRatio(1),this._renderer.shadowMap.enabled=!1,this._renderer.setSize(window.innerWidth,window.innerHeight),this._scene=new mt,this._scene.background=new R(1380880),this._scene.fog=new ee(1380880,12,24),this._camera=new xt(42,window.innerWidth/window.innerHeight,.1,100),this._camera.position.set(1.2,.8,6.5),this._camera.lookAt(0,0,0),this._clock=new _e,this._scene.add(new se(16777215,.32));const e=new At(16774368,3,22,Math.PI*.16,.25);e.position.set(1,7,6),e.castShadow=!1,this._scene.add(e),this._scene.add(e.target);const s=new ht(4491519,.3);s.position.set(-4,2,-3),this._scene.add(s);const o=new ht(16777215,.4);o.position.set(-6,3,5),this._scene.add(o);const i=new V(16746547,.35,8);i.position.set(0,-3,3),this._scene.add(i),this._damageLight=new V(16729088,0,2.5),this._damageLight.position.set(0,-.35,.25),this._scene.add(this._damageLight),this._raycaster=new $t,this._mouse=new Rt,this._buildScene();const a=()=>{if(!this._open||!this._renderer)return;const n=this._root.querySelector("#or-canvas");if(!n)return;const r=n.clientWidth||window.innerWidth,l=n.clientHeight||window.innerHeight;this._renderer.setSize(r,l),this._camera.aspect=r/l,r<l?this._camera.fov=Math.min(70,42*(l/r)*.75):this._camera.fov=42,this._camera.updateProjectionMatrix()};window.addEventListener("resize",a),this._docListeners.push([window,"resize",a])}_mkBox(t,e,s,o,i=.7,a=.1){return new p(new y(t,e,s),new g({color:o,roughness:i,metalness:a}))}_mkCyl(t,e,s,o,i,a=.5,n=.3){return new p(new k(t,e,s,o),new g({color:i,roughness:a,metalness:n}))}_makeWireTube(t,e,s=.038){const o=new ut(e);return new p(new ct(o,32,s,8,!1),new g({color:t,roughness:.55,metalness:.05}))}_makeDamagedWireGroup(t,e){const s=new A,o=new ut(e),i=new p(new ct(o,40,.042,8,!1),new g({color:t,roughness:.62,metalness:.04}));s.add(i);const a=[];for(let u=.3;u<=.58;u+=.04)a.push(o.getPoint(u));if(a.length>=2){const u=new ut(a);s.add(new p(new ct(u,16,.055,8,!1),new g({color:1705984,roughness:.98,metalness:0}))),s.add(new p(new ct(u,16,.048,8,!1),new g({color:5903616,roughness:.92,metalness:0,emissive:new R(2754560),emissiveIntensity:.4})));for(let w=0;w<5;w++){const b=o.getPoint(.33+w*.05);b.add(new m((Math.random()-.5)*.06,(Math.random()-.5)*.06,(Math.random()-.5)*.04));const _=new p(new gt(.025+Math.random()*.025,6,5),new g({color:853248,roughness:1,metalness:0}));_.position.copy(b),s.add(_)}}const n=[];for(let u=.8;u<=1;u+=.04)n.push(o.getPoint(u));n.length>=2&&s.add(new p(new ct(new ut(n),12,.03,8,!1),new g({color:12088115,roughness:.22,metalness:.88,emissive:new R(3346688),emissiveIntensity:.18})));const r=o.getPoint(1),l=o.getTangent(1).normalize(),c=new g({color:13931866,roughness:.18,metalness:.92,emissive:new R(2230272),emissiveIntensity:.1});for(let u=0;u<7;u++){const w=u/7*Math.PI*2,b=.05+Math.random()*.03,_=.09+Math.random()*.06;let v=new m(1,0,0);Math.abs(l.dot(v))>.9&&v.set(0,1,0);const E=new m().crossVectors(l,v).normalize(),M=new m().crossVectors(E,l).normalize(),S=new m().addScaledVector(E,Math.cos(w)*b).addScaledVector(M,Math.sin(w)*b).addScaledVector(l,.04).normalize(),x=new m().copy(r).addScaledVector(S,_),T=new m().lerpVectors(r,x,.5);T.addScaledVector(S.clone().cross(l).normalize(),(Math.random()-.5)*.02);const C=new p(new ct(new ut([r.clone(),T,x]),6,.006+Math.random()*.004,5,!1),c);s.add(C);const I=new p(new gt(.009,4,4),new g({color:13140026,roughness:.15,metalness:.95}));I.position.copy(x),s.add(I)}const h=o.getPoint(.79),d=o.getTangent(.79).normalize();for(let u=0;u<8;u++){const w=u/8*Math.PI*2,b=.044+(Math.random()-.5)*.012;let _=new m(0,1,0);Math.abs(d.dot(_))>.9&&_.set(1,0,0);const v=new m().crossVectors(d,_).normalize(),E=new m().crossVectors(v,d).normalize(),M=new p(new y(.015,.008,.02+Math.random()*.015),new g({color:t,roughness:.8}));M.position.copy(h).addScaledVector(v,Math.cos(w)*b).addScaledVector(E,Math.sin(w)*b),M.lookAt(M.position.clone().add(d)),M.rotation.z+=w,s.add(M)}return s}_buildScene(){const t=new p(new kt(14,9),new ze({color:2433568}));t.position.z=-1.2,t.receiveShadow=!0,this._scene.add(t);for(let L=-4;L<=4;L++){const P=this._mkBox(12,.007,.01,3223082,1,0);P.position.set(0,L*.9,-1.18),this._scene.add(P)}this._outletRoot=new A,this._scene.add(this._outletRoot);const e=.7,s=this._mkBox(2.4,2.4,e,5914656,.92,.04);s.position.z=-1.2+e/2-.05,this._outletRoot.add(s),this._jBox=s;const o=this._mkBox(2.1,2.1,.05,1708040,.96,0);o.position.z=-1.2+e-.03,this._outletRoot.add(o);const i=new p(new y(2.6,2.6,.06),new g({color:8947848,roughness:.4,metalness:.6}));i.position.z=-1.2+e,this._outletRoot.add(i),[-.7,.7].forEach(L=>{const P=this._mkBox(.22,.14,.08,6710886,.5,.5);P.position.set(L,.95,-1.2+e+.02),this._outletRoot.add(P)}),this._faceGroup=new A,this._faceGroup.position.set(0,-.9,0),this._outletRoot.add(this._faceGroup),this._facePlate=this._mkBox(2,1.85,.14,14012614,.65,.04),this._facePlate.position.set(0,.925,0),this._facePlate.castShadow=!0,this._facePlate.receiveShadow=!0,this._faceGroup.add(this._facePlate),[-.65,.65].forEach(L=>[-.7,.7].forEach(P=>{const H=this._mkCyl(.055,.055,.16,12,11184810,.3,.5);H.rotation.x=Math.PI/2,H.position.set(L,P+.925,.07),this._faceGroup.add(H)}));const a=new g({color:855309,roughness:.95}),n=[1710626,2754568];[-.22,.22].forEach((L,P)=>{const H=new p(new y(.12,.5,.06),new g({color:1315860,roughness:.9}));H.position.set(L,.925,.04),this._faceGroup.add(H);const F=P===0?.072:.06,Y=new p(new y(F,.42,.1),a);Y.position.set(L,.925,.07),this._faceGroup.add(Y);const B=new p(new y(F+.016,.44,.02),new g({color:n[P],roughness:.6,metalness:.3}));B.position.set(L,.925,.065),this._faceGroup.add(B);const q=P===0?3355443:5902352,j=new p(new we(.014,10),new g({color:q,roughness:.9}));j.rotation.x=-Math.PI/2,j.position.set(L,.56,.075),this._faceGroup.add(j)}),this._screwGroup=new A,this._screwGroup.position.set(0,.925,0),this._faceGroup.add(this._screwGroup),this._screwHead=this._mkCyl(.115,.095,.07,24,11579568,.2,.7),this._screwHead.rotation.x=Math.PI/2,this._screwHead.position.z=.11,this._screwGroup.add(this._screwHead),this._washer=this._mkCyl(.13,.13,.015,24,8947848,.4,.5),this._washer.rotation.x=Math.PI/2,this._washer.position.z=.075,this._screwGroup.add(this._washer);for(let L=0;L<2;L++){const P=new p(new y(.2,.025,.03),new g({color:3355443,roughness:.8}));P.rotation.z=L*Math.PI/2,P.position.z=.15,this._screwGroup.add(P)}const r=this._mkCyl(.045,.05,.5,12,10066329,.3,.6);r.rotation.x=Math.PI/2,r.position.z=-.18,this._screwGroup.add(r),this._internalGroup=new A,this._internalGroup.visible=!1,this._outletRoot.add(this._internalGroup);const l=this._mkBox(2,.22,.12,5592405,.7,.3);l.position.set(0,0,-.52),this._internalGroup.add(l);const c=this._mkBox(1.7,.55,.18,3815994,.85,.1);c.position.set(0,0,-.45),this._internalGroup.add(c),this._terminalMeshes=[],[{x:-.3,color:1710618},{x:.3,color:14427686}].forEach(({x:L,color:P})=>{const H=this._mkBox(.28,.42,.22,P,.6,.2);H.position.set(L,0,-.38),this._internalGroup.add(H);const F=this._mkCyl(.08,.08,.06,16,11184810,.2,.7);F.rotation.x=Math.PI/2,F.position.set(L,0,-.27),this._internalGroup.add(F);const Y=new p(new y(.15,.02,.03),new g({color:2236962}));Y.position.set(L,0,-.24),this._internalGroup.add(Y);const B=this._mkBox(.08,.28,.1,1118481,1,0);B.position.set(L,-.06,-.27),this._internalGroup.add(B);const q=this._mkBox(.26,.04,.02,2236962,1,0);q.position.set(L,.22,-.37),q.userData.isGlow=!0,this._internalGroup.add(q),this._terminalMeshes.push({x:L,color:P,glowMesh:q})}),[-.35,.35].forEach(L=>{const P=this._mkBox(.18,.08,.12,6710886,.7,.2);P.position.set(L,-.35,-.46),this._internalGroup.add(P)}),this._looseWirePts=[[new m(-.3,0,-.42),new m(-.45,-.3,-.1),new m(-.6,-.85,.2),new m(-.45,-1.35,.05)],[new m(.3,0,-.42),new m(.48,-.28,-.1),new m(.6,-.88,.2),new m(.48,-1.3,.04)]];const h=[1118481,14427686];this._wireMeshes=[],h.forEach((L,P)=>{const H=this._makeDamagedWireGroup(L,this._looseWirePts[P]);H.visible=!1,this._outletRoot.add(H),this._wireMeshes.push(H)}),this._BX=-3.05,this._BY=.28,this._BZ=-1.06;const d=this._BX,u=this._BY,w=this._BZ,b=this._mkBox(1.02,1.65,.22,4342338,.72,.38);b.position.set(d,u,w+.11),this._scene.add(b);const _=this._mkBox(.84,1.44,.04,2894892,.88,.05);_.position.set(d,u,w+.235),this._scene.add(_);const v=this._mkBox(.84,.055,.05,16106776,.65,.1);v.position.set(d,u+.72,w+.24),this._scene.add(v);const E=this._mkBox(.56,.05,.03,13421772,.8,0);E.position.set(d,u+.58,w+.255),this._scene.add(E);const M=this._mkBox(.34,.64,.03,1579032,.9,0);M.position.set(d,u,w+.256),this._scene.add(M),this._bkHandleMat=new g({color:2278750,roughness:.42,metalness:.28}),this._bkHandle=new p(new y(.24,.3,.16),this._bkHandleMat),this._HANDLE_ON_Y=u+.16,this._HANDLE_OFF_Y=u-.16,this._bkHandle.position.set(d,this._HANDLE_ON_Y,w+.31),this._scene.add(this._bkHandle),this._bkLEDMat=new g({color:2278750,roughness:.28,metalness:.5,emissive:new R(2278750),emissiveIntensity:1});const S=new p(new k(.048,.048,.055,12),this._bkLEDMat);S.rotation.x=Math.PI/2,S.position.set(d+.27,u+.54,w+.245),this._scene.add(S);const x=this._mkCyl(.1,.1,.55,10,5592405,.8,.3);x.position.set(d,u-1.08,w+.11),this._scene.add(x);const T=document.createElement("canvas");T.width=128,T.height=32;const C=T.getContext("2d");C.clearRect(0,0,128,32),C.font="bold 13px sans-serif",C.fillStyle="#F5C518",C.textAlign="center",C.fillText("BREAKER",64,22);const I=new ft(T),z=new p(new kt(.56,.14),new J({map:I,transparent:!0,depthWrite:!1}));z.position.set(d,u+.72,w+.27),this._scene.add(z),this._clickScrewObjs=[this._screwHead,this._washer],this._clickBreakerObjs=[this._bkHandle]}_initDragDrop(){["red","black"].forEach(o=>{const i=this._root.querySelector(`#or-wd-${o}`),a=this._root.querySelector(`#or-wt-${o}`);i&&i.addEventListener("dragstart",n=>{n.dataTransfer.setData("text/plain",o)}),a&&(a.addEventListener("dragover",n=>n.preventDefault()),a.addEventListener("drop",n=>{if(n.preventDefault(),!this._open)return;const r=n.dataTransfer.getData("text/plain");r===o?this._connectWire(r):(a.classList.add("reject"),setTimeout(()=>a.classList.remove("reject"),400),this._showToast("Wrong terminal! Match the wire color.","err"))})),i&&i.addEventListener("touchstart",n=>{if(!this._open||this._gameState!=="wires")return;n.stopPropagation(),this._touchWire=o;const r=i.getBoundingClientRect(),l=n.changedTouches[0];this._touchClone=i.cloneNode(!0),Object.assign(this._touchClone.style,{position:"fixed",zIndex:"9999",pointerEvents:"none",opacity:"0.82",width:r.width+"px",left:l.clientX-r.width/2+"px",top:l.clientY-r.height/2+"px",margin:"0"}),document.body.appendChild(this._touchClone),i.style.opacity="0.4"},{passive:!1})});const t=o=>{if(!this._touchClone)return;const i=o.changedTouches[0];this._touchClone.style.left=i.clientX-parseFloat(this._touchClone.style.width)/2+"px",this._touchClone.style.top=i.clientY-16+"px"},e=o=>{var l;if(!this._touchClone||!this._touchWire)return;const i=o.changedTouches[0],a=this._root.querySelector(`#or-wd-${this._touchWire}`);if(a&&(a.style.opacity=""),this._touchClone.remove(),this._touchClone=null,!this._open||this._gameState!=="wires"){this._touchWire=null;return}const n=document.elementFromPoint(i.clientX,i.clientY),r=n&&(n.classList.contains("or-wire-term")?n:(l=n.closest)==null?void 0:l.call(n,".or-wire-term"));r&&(r.id.replace("or-wt-","")===this._touchWire?this._connectWire(this._touchWire):(r.classList.add("reject"),setTimeout(()=>r.classList.remove("reject"),400),this._showToast("Wrong terminal! Match the wire color.","err"))),this._touchWire=null},s=()=>{if(!this._touchClone)return;const o=this._touchWire?this._root.querySelector(`#or-wd-${this._touchWire}`):null;o&&(o.style.opacity=""),this._touchClone.remove(),this._touchClone=null,this._touchWire=null};document.addEventListener("touchmove",t,{passive:!0}),document.addEventListener("touchend",e,{passive:!0}),document.addEventListener("touchcancel",s,{passive:!0}),this._docListeners.push([document,"touchmove",t],[document,"touchend",e],[document,"touchcancel",s])}_initCanvasEvents(){const t=this._root.querySelector("#or-canvas");if(!t)return;let e=-1,s=0,o=0,i=0;t.addEventListener("touchstart",a=>{if(!this._open||this._touchWire||a.changedTouches.length!==1||e!==-1)return;const n=a.changedTouches[0];e=n.identifier,s=n.clientX,o=n.clientY,i=Date.now()},{passive:!0}),t.addEventListener("touchend",a=>{for(const n of a.changedTouches)if(n.identifier===e){if(e=-1,!this._open||Date.now()-i>300||Math.hypot(n.clientX-s,n.clientY-o)>18)break;this._handleClick(n.clientX,n.clientY)}},{passive:!0}),t.addEventListener("click",a=>{this._open&&this._handleClick(a.clientX,a.clientY)}),t.addEventListener("mousemove",a=>{if(!this._open)return;this._mouse.x=a.clientX/t.clientWidth*2-1,this._mouse.y=-(a.clientY/t.clientHeight)*2+1,this._raycaster.setFromCamera(this._mouse,this._camera);let n="default";((this._gameState==="breaker_off"||this._gameState==="breaker_on")&&this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length||this._gameState==="screw"&&this._raycaster.intersectObjects(this._clickScrewObjs,!0).length||(this._gameState==="open"||this._gameState==="test")&&this._raycaster.intersectObject(this._facePlate,!1).length||this._gameState==="rescrew")&&(n="pointer"),t.style.cursor=n})}_handleClick(t,e){const s=this._root.querySelector("#or-canvas");if(s&&!(this._gameState==="animating"||this._gameState==="inspect"||this._gameState==="done")){if(this._mouse.x=t/s.clientWidth*2-1,this._mouse.y=-(e/s.clientHeight)*2+1,this._raycaster.setFromCamera(this._mouse,this._camera),this._gameState==="breaker_off")this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length?this._doBreaker(!0):this._showToast("Find the breaker panel on the left — tap it!","err");else if(this._gameState==="screw")if(this._raycaster.intersectObjects(this._clickScrewObjs,!0).length){if(this._selectedTool!=="screwdriver"){this._showToast("Select the Screwdriver first!","err");return}this._doRemoveScrew()}else this._showToast("Click the screw at the center of the outlet!","err");else if(this._gameState==="open")this._raycaster.intersectObject(this._facePlate,!1).length?this._doOpenCover():this._showToast("Click the outlet cover to open it","err");else if(this._gameState==="rescrew")this._doCloseCover();else if(this._gameState==="breaker_on")this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length?this._doBreaker(!1):this._showToast("Tap the breaker panel to switch it back ON!","err");else if(this._gameState==="test"){if(this._selectedTool!=="multimeter"){this._showToast("Select the Multimeter first!","err");return}this._raycaster.intersectObject(this._facePlate,!1).length?this._doTest():this._showToast("Point the multimeter at the outlet","err")}}}_doBreaker(t){this._gameState="animating",this._setTut(null),this._showToast(t?"Switching breaker OFF...":"Switching breaker back ON...","ok"),this._showCamHint("Panning to breaker"),this._animateCam(new m(-1.4,.55,5.6),new m(this._BX,this._BY,0),900,()=>{this._bkGoingOff=t,this._bkAnimT=0,this._bkAnimating=!0,this._bkCB=t?()=>this._afterBreakerOff():()=>this._afterBreakerOn()})}_afterBreakerOff(){this._completeTask(1,12),this._showToast("Breaker OFF — safe to work!","ok"),this._setInstr('<span class="or-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span>'),this._enableTool("screwdriver"),this._selectTool("screwdriver"),this._setTut(this._screwHead,"TAP SCREW"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),800,()=>{this._gameState="screw"})}_afterBreakerOn(){this._completeTask(7,88),this._showToast("Breaker ON! Test with multimeter.","ok"),this._setInstr('<span class="or-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span>'),this._enableTool("multimeter"),this._selectTool("multimeter"),this._setTut(this._facePlate,"TAP OUTLET"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),800,()=>{this._gameState="test"})}_doRemoveScrew(){this._gameState="animating",this._setTut(null),this._showToast("Removing cover screw...","ok"),this._showCamHint("Zooming in"),this._animateCam(new m(.3,1.1,3.2),new m(0,.92,0),900,()=>{this._screwRemoving=!0,this._screwSpinT=0})}_doOpenCover(){this._gameState="animating",this._setTut(null),this._showToast("Opening outlet cover...","ok"),this._showCamHint("Side angle view"),this._animateCam(new m(-3.5,2.2,4),new m(0,.2,0),1100,()=>{this._coverOpening=!0,this._coverOpenT=0})}_doCloseCover(){this._gameState="animating",this._setTut(null),this._showToast("Closing outlet cover...","ok"),this._showCamHint("Watching cover close"),this._animateCam(new m(-2.8,1.8,4.2),new m(0,.3,0),900,()=>{this._coverClosing=!0,this._coverCloseT=0})}_doTest(){this._gameState="animating",this._setTut(null),this._showCamHint("Testing outlet"),this._animateCam(new m(.3,.3,3.5),new m(0,.2,0),700,()=>{const t=this._$o("reading"),e=this._$o("rd-val");t&&t.classList.add("show"),e&&(e.textContent="---",e.style.color="#22c55e");const s=["---","12V","85V","154V","199V","216V","220V"];let o=0;const i=setInterval(()=>{o<s.length&&e&&(e.textContent=s[o],o++),o>=s.length&&(clearInterval(i),setTimeout(()=>{t&&t.classList.remove("show"),this._completeTask(8,100),this._gameState="done",this._timerRunning=!1,this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this._showToast("220V AC — Outlet working perfectly!","ok"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),1200,()=>{setTimeout(()=>{const a=500+this._timerVal*2,n=this._$o("so-score");n&&(n.textContent=`Score: ${a} pts`);const r=this._$o("success-overlay");r&&r.classList.add("show"),this._onFixed&&this._onFixed(this._socketId,1)},800)})},700))},220)})}_connectWire(t){if(this._wiresState[t])return;this._wiresState[t]=!0;const e=this._root.querySelector(`#or-wd-${t}`),s=this._root.querySelector(`#or-wt-${t}`);if(e&&e.classList.add("used"),s){const u={red:"#7f1d1d",black:"#1f2937"};s.style.background=u[t],s.style.color="#fff",s.style.borderStyle="solid",s.textContent="✓"}const o=[1118481,14427686],a=["black","red"].indexOf(t),n=this._terminalMeshes[a].x;this._outletRoot.remove(this._wireMeshes[a]);const r=[new m(n,0,-.42),new m(n,-.25,-.2),new m(n+(Math.random()-.5)*.25,-.7,.05),new m(n+(Math.random()-.5)*.2,-1.2,0)],l=this._makeWireTube(o[a],r);this._outletRoot.add(l),this._wireMeshes[a]=l,this._terminalMeshes[a].glowMesh.material.color.setHex(o[a]),this._terminalMeshes[a].glowMesh.material.emissive=new R(o[a]),this._terminalMeshes[a].glowMesh.material.emissiveIntensity=.8;const c=Object.values(this._wiresState).filter(Boolean).length;this._damageLight.intensity=Math.max(0,.9-c*.45);const h={black:54,red:66},d=t==="red"?"RED (Live)":"BLACK (Neutral)";this._showToast(`${d} wire connected ✓`,"ok"),this._setPct(h[t]),this._wiresState.red&&this._wiresState.black&&(this._damageLight.intensity=0,setTimeout(()=>{this._completedTasks++;const u=this._$o("t5");u&&(u.classList.remove("active"),u.classList.add("done"));const w=this._$o("t6");w&&w.classList.add("active");const b=this._$o("done-count");b&&(b.textContent=this._completedTasks),this._setPct(75);const _=this._$o("wire-panel");_&&(_.style.display="none",_.classList.remove("hi")),this._setInstr('<span class="or-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover');const v=this._$o("instruction");v&&(v.style.display="block"),this._setTut(this._jBox,"TAP TO CLOSE"),this._gameState="rescrew",this._animateCam(new m(.8,.4,5.5),new m(0,.2,0),700,()=>{})},900))}_animateCam(t,e,s,o){this._camFrom.copy(this._camera.position);const i=new m(0,0,-1).applyQuaternion(this._camera.quaternion);this._camLookFrom.copy(this._camera.position).addScaledVector(i,5),this._camTo.copy(t),this._camLookTo.copy(e),this._camT=0,this._camDur=s,this._camCB=o,this._camTweening=!0}_eio3(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}_setTut(t,e="TAP HERE"){this._tutTarget3D=t;const s=this._$o("tgt-label");s&&(s.textContent=e)}_updateTutorial(){const t=this._root.querySelector("#or-canvas"),e=this._$o("tgt-ring"),s=this._$o("tgt-pulse"),o=this._$o("tgt-label"),i=this._$o("breaker-tip");if(!t)return;if(!(this._tutTarget3D!==null&&this._gameState!=="animating"&&this._gameState!=="inspect"&&this._gameState!=="wires"&&this._gameState!=="done")){[e,s,o,i].forEach(u=>u&&(u.style.display="none"));return}const n=new m;this._tutTarget3D.getWorldPosition(n);const r=n.clone().project(this._camera);if(r.z>1){[e,s,o,i].forEach(u=>u&&(u.style.display="none"));return}const l=t.clientWidth,c=t.clientHeight,h=(r.x+1)/2*l,d=(-r.y+1)/2*c;[e,s].forEach(u=>{u&&(u.style.display="block",u.style.left=h+"px",u.style.top=d+"px")}),o&&(o.style.display="block",o.style.left=h+"px",o.style.top=d+48+"px"),i&&(this._gameState==="breaker_off"||this._gameState==="breaker_on"?(i.style.display="block",i.style.left=h+"px",i.style.top=d-60+"px",i.textContent=this._gameState==="breaker_off"?"BREAKER  ·  SWITCH OFF":"BREAKER  ·  SWITCH ON"):i.style.display="none")}_completeTask(t,e){this._completedTasks++;const s=this._$o("t"+t);s&&(s.classList.remove("active"),s.classList.add("done"));const o=this._$o("t"+(t+1));o&&o.classList.add("active");const i=this._$o("done-count");i&&(i.textContent=this._completedTasks),this._setPct(e)}_setPct(t){const e=this._$o("pw-bar");e&&(e.style.width=t+"%");const s=this._$o("pw-pct");s&&(s.textContent=t)}_selectTool(t){this._selectedTool=t,["screwdriver","pliers","multimeter"].forEach(s=>{const o=this._$o("tool-"+s);o&&o.classList.remove("active")});const e=this._$o("tool-"+t);e&&e.classList.add("active")}_enableTool(t){const e=this._$o("tool-"+t);e&&e.classList.remove("disabled")}_setInstr(t){const e=this._$o("instruction");e&&(e.style.display="block",e.innerHTML=t)}_showToast(t,e){const s=this._$o("toast");s&&(s.textContent=t,s.className="show "+e,clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>s.classList.remove("show"),2800))}_showCamHint(t){const e=this._$o("cam-hint");e&&(e.textContent="📷 "+t,e.classList.add("show"),clearTimeout(this._camHintTimer),this._camHintTimer=setTimeout(()=>e.classList.remove("show"),2e3))}_resetAll(){this._touchClone&&(this._touchClone.remove(),this._touchClone=null),this._touchWire=null,this._gameState="breaker_off",this._selectedTool=null,this._wiresState={red:!1,black:!1},this._completedTasks=0,this._timerVal=300,this._timerRunning=!0,this._screwRemoving=!1,this._screwSpinT=0,this._screwReattaching=!1,this._screwReattachT=0,this._coverOpening=!1,this._coverOpenT=0,this._coverClosing=!1,this._coverCloseT=0,this._inspecting=!1,this._inspectT=0,this._bkAnimating=!1,this._bkAnimT=0,this._camTweening=!1,this._idleT=0,this._damageLightT=0,this._damageLight.intensity=0,this._bkHandle.position.y=this._HANDLE_ON_Y,this._bkHandleMat.color.setHex(2278750),this._bkLEDMat.color.setHex(2278750),this._bkLEDMat.emissive.setHex(2278750),this._bkLEDMat.emissiveIntensity=1,this._faceGroup.visible=!0,this._faceGroup.rotation.x=0,this._faceGroup.position.set(0,-.9,0),this._screwGroup.visible=!0,this._screwGroup.rotation.z=0,this._screwGroup.position.set(0,.925,0),this._internalGroup.visible=!1,this._terminalMeshes.forEach(l=>{l.glowMesh.material.color.setHex(2236962),l.glowMesh.material.emissiveIntensity=0});const t=[1118481,14427686];[0,1].forEach(l=>{this._outletRoot.remove(this._wireMeshes[l]);const c=this._makeDamagedWireGroup(t[l],this._looseWirePts[l]);c.visible=!1,this._outletRoot.add(c),this._wireMeshes[l]=c}),this._camera.position.set(1.2,.8,6.5),this._camera.lookAt(0,0,0),this._setPct(0);const e=this._$o("done-count");e&&(e.textContent="0");for(let l=1;l<=8;l++){const c=this._$o("t"+l);c&&(c.classList.remove("done","active"),l===1&&c.classList.add("active"))}const s=this._$o("wire-panel");s&&(s.style.display="none",s.classList.remove("hi"));const o=this._$o("success-overlay");o&&o.classList.remove("show");const i=this._$o("reading");i&&i.classList.remove("show");const a=this._$o("rd-val");a&&(a.textContent="---"),this._setInstr('<span class="or-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>'),["red","black"].forEach(l=>{const c=this._root.querySelector(`#or-wd-${l}`);c&&c.classList.remove("used");const h=this._root.querySelector(`#or-wt-${l}`);if(h){const d={red:"L",black:"N"},u={red:"#dc2626",black:"#888"};h.style.background="",h.style.color=u[l],h.style.borderStyle="dashed",h.textContent=d[l]}}),["screwdriver","pliers","multimeter"].forEach(l=>{const c=this._$o("tool-"+l);c&&(c.classList.add("disabled"),c.classList.remove("active"))}),["screwdriver","pliers","multimeter"].forEach(l=>{const c=this._$o("tool-"+l);c&&(c.onclick=()=>{this._open&&this._selectTool(l)})});const n=this._$o("replay-btn");n&&(n.onclick=()=>this._resetAll()),this._setTut(this._bkHandle,"TAP HERE"),this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null);const r=this._$o("timer");r&&(r.textContent="05:00"),this._timerInterval=setInterval(()=>{if(!this._timerRunning||!this._open)return;this._timerVal=Math.max(0,this._timerVal-1);const l=Math.floor(this._timerVal/60).toString().padStart(2,"0"),c=(this._timerVal%60).toString().padStart(2,"0"),h=this._$o("timer");h&&(h.textContent=`${l}:${c}`)},1e3)}_loop(){if(!this._open)return;this._raf=requestAnimationFrame(()=>this._loop());const t=Math.min(this._clock.getDelta(),.05);if(this._idleT+=t,this._outletRoot.position.y=Math.sin(this._idleT*.55)*.035,this._outletRoot.rotation.z=Math.sin(this._idleT*.35)*.006,this._outletRoot.rotation.x=Math.sin(this._idleT*.28)*.005+.04,this._internalGroup.visible&&this._damageLight.intensity>0){this._damageLightT+=t;const e=.5+.5*Math.sin(this._damageLightT*3.5);this._damageLight.intensity=.9*e,this._damageLight.color.setHSL(.06-e*.04,1,.5)}if(this._camTweening){this._camT+=t*1e3;const e=this._eio3(Math.min(this._camT/this._camDur,1));if(this._camera.position.lerpVectors(this._camFrom,this._camTo,e),this._camera.lookAt(new m().lerpVectors(this._camLookFrom,this._camLookTo,e)),this._camT>=this._camDur&&(this._camTweening=!1,this._camCB)){const s=this._camCB;this._camCB=null,s()}}if(this._bkAnimating){this._bkAnimT+=t*2.8;const e=this._eio3(Math.min(this._bkAnimT,1)),s=this._bkGoingOff?this._HANDLE_ON_Y:this._HANDLE_OFF_Y,o=this._bkGoingOff?this._HANDLE_OFF_Y:this._HANDLE_ON_Y;if(this._bkHandle.position.y=s+(o-s)*e,this._bkAnimT>=1&&(this._bkAnimating=!1,this._bkHandle.position.y=o,this._bkGoingOff?(this._bkHandleMat.color.setHex(15680580),this._bkLEDMat.color.setHex(15680580),this._bkLEDMat.emissive.setHex(8917265),this._bkLEDMat.emissiveIntensity=.55):(this._bkHandleMat.color.setHex(2278750),this._bkLEDMat.color.setHex(2278750),this._bkLEDMat.emissive.setHex(2278750),this._bkLEDMat.emissiveIntensity=1),this._bkCB)){const i=this._bkCB;this._bkCB=null,i()}}if(this._screwRemoving&&(this._screwSpinT+=t*5.5,this._screwGroup.rotation.z=this._screwSpinT,this._screwGroup.position.z=this._screwSpinT*.09,this._screwGroup.position.y=this._screwSpinT*.03,this._screwSpinT>Math.PI*5&&(this._screwRemoving=!1,this._screwGroup.visible=!1,this._completeTask(2,24),this._showToast("Screw removed! Tap the outlet cover.","ok"),this._setInstr('<span class="or-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it'),this._setTut(this._facePlate,"TAP COVER"),this._animateCam(new m(-1.8,1.4,5.2),new m(0,.4,0),700,()=>{this._gameState="open"}))),this._coverOpening&&(this._coverOpenT+=t*1.4,this._faceGroup.rotation.x=this._eio3(Math.min(this._coverOpenT,1))*1.95,this._coverOpenT>=1&&(this._coverOpening=!1,this._faceGroup.visible=!1,this._internalGroup.visible=!0,this._wireMeshes.forEach(e=>e.visible=!0),this._damageLight.intensity=.9,this._damageLightT=0,this._completeTask(3,36),this._showToast("Cover open! Inspecting wiring...","ok"),this._setInstr('<span class="or-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>'),this._setTut(null),this._inspecting=!0,this._inspectT=0,this._animateCam(new m(.2,.5,3.6),new m(0,-.25,0),1e3,()=>{}))),this._inspecting&&(this._inspectT+=t,this._inspectT>.8&&this._inspectT<.82&&this._animateCam(new m(-.1,-.4,2.6),new m(0,-.5,0),900,()=>{}),this._inspectT>=2.5)){this._inspecting=!1,this._completeTask(4,48),this._showToast("Wires disconnected — drag each wire to its matching terminal.","info");const e=this._$o("wire-panel");e&&(e.style.display="block",e.classList.add("hi"));const s=this._$o("instruction");s&&(s.style.display="none"),this._gameState="wires",this._animateCam(new m(.3,2.2,5),new m(0,-.1,0),900,()=>{})}if(this._coverClosing&&(this._coverCloseT+=t*1.2,this._faceGroup.visible=!0,this._faceGroup.rotation.x=(1-this._eio3(Math.min(this._coverCloseT,1)))*1.95,this._coverCloseT>=1&&(this._coverClosing=!1,this._faceGroup.rotation.x=0,this._faceGroup.position.set(0,-.9,0),this._internalGroup.visible=!1,this._wireMeshes.forEach(e=>e.visible=!1),this._damageLight.intensity=0,this._screwGroup.visible=!0,this._screwGroup.position.set(0,.925,.6),this._screwGroup.rotation.z=Math.PI*9,this._screwReattaching=!0,this._screwReattachT=0,this._animateCam(new m(.2,.95,3),new m(0,.92,0),600,()=>{}))),this._screwReattaching){this._screwReattachT+=t*4;const e=Math.min(this._screwReattachT/3.5,1);this._screwGroup.rotation.z=(1-this._eio3(e))*Math.PI*9,this._screwGroup.position.z=(1-this._eio3(e))*.6,this._screwGroup.position.y=.925,this._screwReattachT>=3.5&&(this._screwReattaching=!1,this._screwGroup.rotation.z=0,this._screwGroup.position.set(0,.925,0),this._completeTask(6,82),this._showToast("Outlet closed! Turn the breaker back ON.","ok"),this._setInstr('<span class="or-snum">STEP 7</span>Find the <span>breaker panel</span> — switch it <span>ON</span>'),this._setTut(this._bkHandle,"TAP BREAKER"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),1200,()=>{this._gameState="breaker_on"}))}this._updateTutorial(),this._renderer.render(this._scene,this._camera)}}class Ns{constructor(t,e){this._root=t,this._onFixed=e,this._open=!1,this._switchId=1,this._swRoot=null,this._swLever=null,this._swLeverMat=null,this._swBodyMesh=null,this._bkHandle=null,this._bkHandleMat=null,this._bkLEDMat=null,this._wbFlange=null,this._bulbGlassMat=null,this._filMat=null,this._bulbLight=null,this._bulbGlass=null,this._bulbRoot=null,this._wallWires=[],this._swWires={},this._bulbWire=null,this._BX=0,this._BY=0,this._BZ=0,this._HANDLE_ON_Y=0,this._HANDLE_OFF_Y=0,this._clickBreakerObjs=[],this._clickWallBoxObjs=[],this._clickBulbObjs=[],this._clickSwObjs=[],this._raycaster=null,this._mouse=null,this._gameState="breaker_off",this._activeTool=null,this._wireConn={red:!1,black:!1},this._completedTasks=0,this._timerVal=480,this._timerRunning=!1,this._timerInterval=null,this._switchFlipped=!1,this._lightOn=!1,this._swWiresBuilt=!1,this._touchWire=null,this._touchClone=null,this._bkAnimating=!1,this._bkAnimT=0,this._bkGoingOff=!1,this._bkCB=null,this._mountAnim=!1,this._mountT=0,this._mountFrom=new m,this._mountTo=new m,this._mountCB=null,this._leverTween=!1,this._leverT=0,this._leverTarget=0,this._camTweening=!1,this._camT=0,this._camDur=0,this._camCB=null,this._camFrom=new m,this._camTo=new m,this._camLookFrom=new m,this._camLookTo=new m,this._idleT=0,this._tutTarget=null,this._toastTimer=null,this._camHintTimer=null,this._renderer=null,this._scene=null,this._camera=null,this._clock=null,this._raf=null,this._docListeners=[],this._initThree(),this._initDragDrop(),this._initCanvasEvents()}open(t){this._switchId=t;const e=this._root.querySelector("#sw-overlay");e&&(e.style.display="block"),requestAnimationFrame(()=>{const i=this._root.querySelector("#sw-canvas");if(i&&this._renderer){const a=i.clientWidth||window.innerWidth,n=i.clientHeight||window.innerHeight;this._renderer.setSize(a,n),this._camera.aspect=a/n,this._camera.fov=a<n?Math.min(70,44*(n/a)*.75):44,this._camera.updateProjectionMatrix()}});const s={1:"Workshop A Station 1",2:"Workshop B Station 2",3:"Workshop B Station 3"},o=this._$s("label");o&&(o.textContent=`Switch #${t} — ${s[t]||"Station"}`),this._resetAll(),this._open||(this._open=!0,this._loop())}close(){this._open=!1;const t=this._root.querySelector("#sw-overlay");t&&(t.style.display="none"),this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this._touchClone&&(this._touchClone.remove(),this._touchClone=null),this._touchWire=null}destroy(){this.close(),cancelAnimationFrame(this._raf),this._raf=null;for(const[t,e,s]of this._docListeners)t.removeEventListener(e,s);this._docListeners=[],this._scene&&this._scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material.dispose())}),this._renderer&&(this._renderer.dispose(),this._renderer=null)}_$s(t){return this._root.querySelector("#sw-"+t)}_initThree(){const t=this._root.querySelector("#sw-canvas");if(!t){console.error("[SwitchScenario] #sw-canvas not found");return}this._renderer=new _t({canvas:t,antialias:!1}),this._renderer.setPixelRatio(1),this._renderer.shadowMap.enabled=!1,this._renderer.setSize(window.innerWidth,window.innerHeight),this._scene=new mt,this._scene.background=new R(526861),this._scene.fog=new ee(526861,14,28),this._camera=new xt(44,window.innerWidth/window.innerHeight,.1,100),this._camera.position.set(0,.5,8),this._camera.lookAt(0,0,0),this._clock=new _e,this._scene.add(new se(16777215,.32));const e=new At(16774880,2.5,25,Math.PI*.14,.3);e.position.set(2,8,7),this._scene.add(e),this._scene.add(e.target);const s=new ht(3359846,.3);s.position.set(-4,2,-3),this._scene.add(s);const o=new ht(16772829,.2);o.position.set(4,-1,5),this._scene.add(o),this._bulbLight=new V(16769152,0,6),this._bulbLight.position.set(3.5,2.2,.5),this._scene.add(this._bulbLight),this._raycaster=new $t,this._mouse=new Rt,this._buildScene();const i=()=>{if(!this._open||!this._renderer)return;const a=this._root.querySelector("#sw-canvas");if(!a)return;const n=a.clientWidth||window.innerWidth,r=a.clientHeight||window.innerHeight;this._renderer.setSize(n,r),this._camera.aspect=n/r,this._camera.fov=n<r?Math.min(70,44*(r/n)*.75):44,this._camera.updateProjectionMatrix()};window.addEventListener("resize",i),this._docListeners.push([window,"resize",i])}_mkBox(t,e,s,o,i=.7,a=.1){return new p(new y(t,e,s),new g({color:o,roughness:i,metalness:a}))}_mkCyl(t,e,s,o,i,a=.5,n=.3){return new p(new k(t,e,s,o),new g({color:i,roughness:a,metalness:n}))}_mkTube(t,e,s=.034){return new p(new ct(new ut(t),32,s,8,!1),new g({color:e,roughness:.55,metalness:.05}))}_buildScene(){const t=this._scene,e=this._mkBox(18,10,.01,1842722,1,0);e.position.z=-1.5,t.add(e);for(let x=-5;x<=5;x++){const T=this._mkBox(16,.006,.01,2435120,1,0);T.position.set(0,x*.85,-1.48),t.add(T)}this._BX=-3.8,this._BY=.3,this._BZ=-1.3;const s=this._BX,o=this._BY,i=this._BZ,a=this._mkBox(1.1,1.8,.28,3815996,.7,.35);a.position.set(s,o,i+.14),t.add(a);const n=this._mkBox(.88,1.56,.04,2368552,.88,.06);n.position.set(s,o,i+.3),t.add(n);const r=this._mkBox(.88,.06,.05,16105984,.65,.1);r.position.set(s,o+.78,i+.31),t.add(r);const l=this._mkBox(.36,.7,.04,1579032,.95,0);l.position.set(s,o,i+.32),t.add(l),this._HANDLE_ON_Y=o+.18,this._HANDLE_OFF_Y=o-.18,this._bkHandleMat=new g({color:2278750,roughness:.42,metalness:.3}),this._bkHandle=new p(new y(.26,.32,.17),this._bkHandleMat),this._bkHandle.position.set(s,this._HANDLE_ON_Y,i+.375),t.add(this._bkHandle),this._bkLEDMat=new g({color:2278750,roughness:.3,metalness:.5,emissive:new R(2278750),emissiveIntensity:1});const c=this._mkCyl(.05,.05,.06,12,2278750);c.material=this._bkLEDMat,c.rotation.x=Math.PI/2,c.position.set(s+.3,o+.6,i+.315),t.add(c);const h=this._mkCyl(.11,.11,.6,10,5592405,.8,.35);h.position.set(s,o-1.2,i+.14),t.add(h),this._wbRoot=new A,this._wbRoot.position.set(0,-.2,0),t.add(this._wbRoot);const d=this._mkBox(1.6,2,.7,4865576,.9,.06);d.position.z=-1.15,this._wbRoot.add(d);const u=this._mkBox(1.35,1.72,.08,1183754,.95,0);u.position.z=-.79,this._wbRoot.add(u),this._wbFlange=this._mkBox(1.78,2.18,.06,8026746,.45,.55),this._wbFlange.position.z=-.82,this._wbRoot.add(this._wbFlange),this._wallWires=[],[[.2,-.9],[-.2,-.9]].forEach((x,T)=>{const C=[new m(x[0],x[1],-.78),new m(x[0]*.5,-1.8,-.78),new m(s+.15*(T===0?1:-1),-1.5,-1.1)],I=this._mkTube(C,[14427686,1118481][T],.026);I.visible=!1,this._wbRoot.add(I),this._wallWires.push(I)}),this._swRoot=new A,this._swRoot.position.set(0,-.2,2),t.add(this._swRoot),this._swBodyMesh=this._mkBox(.8,1.4,.22,14210248,.65,.05),this._swRoot.add(this._swBodyMesh);const w=this._mkBox(.55,.18,.04,8947848,.8,.1);w.position.set(0,.52,.12),this._swRoot.add(w),this._swLeverMat=new g({color:15658734,roughness:.4,metalness:.2}),this._swLever=new p(new y(.35,.55,.18),this._swLeverMat),this._swLever.position.set(0,-.05,.14),this._swRoot.add(this._swLever),[-.28,.28].forEach(x=>[-.58,.58].forEach(T=>{const C=this._mkCyl(.065,.055,.06,16,11579568,.25,.7);C.rotation.x=Math.PI/2,C.position.set(x,T,.13),this._swRoot.add(C)}));const b=[14427686,3355443];[.32,-.32].forEach((x,T)=>{const C=this._mkCyl(.06,.05,.1,12,b[T],.25,.7);C.rotation.x=Math.PI/2,C.position.set(0,x,-.12),this._swRoot.add(C)}),this._bulbRoot=new A,this._bulbRoot.position.set(3.5,3.8,0),t.add(this._bulbRoot);const v=this._mkCyl(.3,.25,.25,16,5592405,.6,.3);v.position.y=-.12,this._bulbRoot.add(v);const E=[new m(0,0,0),new m(.05,-.45,.02),new m(-.02,-.9,-.01),new m(0,-1.35,0)];this._bulbRoot.add(this._mkTube(E,2236962,.02));const M=this._mkCyl(.14,.1,.2,16,8947848,.45,.5);M.position.y=-1.45,this._bulbRoot.add(M),this._bulbGlassMat=new g({color:8956586,roughness:.05,metalness:0,transparent:!0,opacity:.35,emissive:new R(3346688),emissiveIntensity:0}),this._bulbGlass=new p(new gt(.38,24,18),this._bulbGlassMat),this._bulbGlass.position.y=-1.8,this._bulbRoot.add(this._bulbGlass),this._filMat=new g({color:16763972,roughness:.5,metalness:.8,emissive:new R(16755200),emissiveIntensity:0});const S=new p(new D(.1,.018,6,16),this._filMat);S.position.y=-1.8,S.rotation.x=Math.PI/2,this._bulbRoot.add(S),this._clickBreakerObjs=[this._bkHandle],this._clickWallBoxObjs=[d,this._wbFlange,u],this._clickBulbObjs=[this._bulbGlass],this._clickSwObjs=[this._swBodyMesh]}_initDragDrop(){["red","black"].forEach(o=>{const i=this._root.querySelector(`#sw-wd-${o}`),a=this._root.querySelector(`#sw-wt-${o}`);i&&i.addEventListener("dragstart",n=>{n.dataTransfer.setData("text/plain",o)}),a&&(a.addEventListener("dragover",n=>n.preventDefault()),a.addEventListener("drop",n=>{if(n.preventDefault(),!this._open)return;const r=n.dataTransfer.getData("text/plain");r===o?this._connectWire(r):(a.classList.add("sw-reject"),setTimeout(()=>a.classList.remove("sw-reject"),400),this._showToast("Wrong terminal! Match the wire color.","err"))})),i&&i.addEventListener("touchstart",n=>{if(!this._open||this._gameState!=="wires")return;n.stopPropagation(),this._touchWire=o;const r=i.getBoundingClientRect(),l=n.changedTouches[0];this._touchClone=i.cloneNode(!0),Object.assign(this._touchClone.style,{position:"fixed",zIndex:"9999",pointerEvents:"none",opacity:"0.82",width:r.width+"px",left:l.clientX-r.width/2+"px",top:l.clientY-r.height/2+"px",margin:"0"}),document.body.appendChild(this._touchClone),i.style.opacity="0.4"},{passive:!1})});const t=o=>{if(!this._touchClone)return;const i=o.changedTouches[0];this._touchClone.style.left=i.clientX-parseFloat(this._touchClone.style.width)/2+"px",this._touchClone.style.top=i.clientY-16+"px"},e=o=>{var l;if(!this._touchClone||!this._touchWire)return;const i=o.changedTouches[0],a=this._root.querySelector(`#sw-wd-${this._touchWire}`);if(a&&(a.style.opacity=""),this._touchClone.remove(),this._touchClone=null,!this._open||this._gameState!=="wires"){this._touchWire=null;return}const n=document.elementFromPoint(i.clientX,i.clientY),r=n&&(n.classList.contains("sw-wire-term")?n:(l=n.closest)==null?void 0:l.call(n,".sw-wire-term"));r&&(r.id.replace("sw-wt-","")===this._touchWire?this._connectWire(this._touchWire):(r.classList.add("sw-reject"),setTimeout(()=>r.classList.remove("sw-reject"),400),this._showToast("Wrong terminal! Match the wire color.","err"))),this._touchWire=null},s=()=>{if(!this._touchClone)return;const o=this._touchWire?this._root.querySelector(`#sw-wd-${this._touchWire}`):null;o&&(o.style.opacity=""),this._touchClone.remove(),this._touchClone=null,this._touchWire=null};document.addEventListener("touchmove",t,{passive:!0}),document.addEventListener("touchend",e,{passive:!0}),document.addEventListener("touchcancel",s,{passive:!0}),this._docListeners.push([document,"touchmove",t],[document,"touchend",e],[document,"touchcancel",s])}_initCanvasEvents(){const t=this._root.querySelector("#sw-canvas");if(!t)return;let e=-1,s=0,o=0,i=0;t.addEventListener("touchstart",a=>{if(!this._open||this._touchWire||a.changedTouches.length!==1||e!==-1)return;const n=a.changedTouches[0];e=n.identifier,s=n.clientX,o=n.clientY,i=Date.now()},{passive:!0}),t.addEventListener("touchend",a=>{for(const n of a.changedTouches)if(n.identifier===e){if(e=-1,!this._open||Date.now()-i>300||Math.hypot(n.clientX-s,n.clientY-o)>18)break;this._handleClick(n.clientX,n.clientY)}},{passive:!0}),t.addEventListener("click",a=>{this._open&&this._handleClick(a.clientX,a.clientY)}),t.addEventListener("mousemove",a=>{if(!this._open)return;this._mouse.x=a.clientX/t.clientWidth*2-1,this._mouse.y=-(a.clientY/t.clientHeight)*2+1,this._raycaster.setFromCamera(this._mouse,this._camera);let n="default";((this._gameState==="breaker_off"||this._gameState==="breaker_on")&&this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length||this._gameState==="mount"&&this._raycaster.intersectObjects(this._clickWallBoxObjs,!1).length||this._gameState==="test"&&(this._raycaster.intersectObjects(this._clickBulbObjs,!1).length||this._raycaster.intersectObjects(this._clickSwObjs,!1).length))&&(n="pointer"),t.style.cursor=n})}_handleClick(t,e){const s=this._root.querySelector("#sw-canvas");if(s&&!["animating","wires","flip","done"].includes(this._gameState)){if(this._mouse.x=t/s.clientWidth*2-1,this._mouse.y=-(e/s.clientHeight)*2+1,this._raycaster.setFromCamera(this._mouse,this._camera),this._gameState==="breaker_off")this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length?this._doBreaker(!0):this._showToast("Find the breaker panel on the left — tap it!","err");else if(this._gameState==="mount"){if(!this._activeTool){this._showToast("Select Mount Tool first!","err");return}this._raycaster.intersectObjects(this._clickWallBoxObjs,!1).length?this._doMount():this._showToast("Click the wall box to mount the switch","err")}else if(this._gameState==="breaker_on")this._raycaster.intersectObjects(this._clickBreakerObjs,!0).length?this._doBreaker(!1):this._showToast("Tap the breaker panel to switch it back ON!","err");else if(this._gameState==="test"){if(this._activeTool!=="multimeter"){this._showToast("Select the Multimeter first!","err");return}this._raycaster.intersectObjects([...this._clickBulbObjs,...this._clickSwObjs],!1).length?this._doTest():this._showToast("Tap the bulb or switch to test","err")}}}_doBreaker(t){this._gameState="animating",this._setTut(null),this._showToast(t?"Switching breaker OFF...":"Switching breaker back ON...","ok"),this._showCamHint("Panning to breaker"),this._animateCam(new m(-2,.5,6.5),new m(this._BX,this._BY,0),900,()=>{this._bkGoingOff=t,this._bkAnimT=0,this._bkAnimating=!0,this._bkCB=t?()=>this._afterBreakerOff():()=>this._afterBreakerOn()})}_afterBreakerOff(){this._completeTask(1,12),this._showToast("Breaker OFF ✓ — Mount the switch to the wall box","ok"),this._setInstr('<span class="sw-snum">STEP 2</span>Select <span>Mount Tool</span> then tap the <span>wall box</span>'),this._enableTool("mount"),this._selectTool("mount"),this._setTut(this._wbFlange,"TAP BOX"),this._animateCam(new m(0,.3,7),new m(0,0,0),800,()=>{this._gameState="mount"})}_doMount(){this._gameState="animating",this._setTut(null),this._showToast("Mounting switch to wall box...","ok"),this._showCamHint("Mounting switch"),this._mountFrom.copy(this._swRoot.position),this._mountTo.set(0,-.2,-.72),this._mountT=0,this._mountAnim=!0,this._mountCB=()=>this._afterMount()}_afterMount(){this._completeTask(2,24),this._showToast("Switch mounted ✓ — Connect the wires","ok"),this._buildSwWires(),this._setInstr('<span class="sw-snum">STEP 3–5</span>Drag each <span>wire</span> to its matching <span>terminal</span>');const t=this._$s("wire-panel");t&&(t.style.display="block");const e=this._$s("instruction");e&&(e.style.display="none"),this._wallWires.forEach(s=>s.visible=!0),this._gameState="wires",this._animateCam(new m(0,.4,5.2),new m(0,0,0),700,()=>{})}_buildSwWires(){if(this._swWiresBuilt)return;this._swWiresBuilt=!0;const t=this._swRoot.position,e=this._BX,s=this._BY;this._swWires.red=this._mkTube([new m(t.x,t.y+.32,t.z-.12),new m(t.x-.3,t.y-.5,-.88),new m(e+.25,s-.3,-1.15)],14427686,.032),this._swWires.red.visible=!1,this._scene.add(this._swWires.red),this._swWires.black=this._mkTube([new m(t.x,t.y-.32,t.z-.12),new m(.8,.2,-.8),new m(2,1.4,-.5),new m(3.5,2.45,-.2)],1118481,.032),this._swWires.black.visible=!1,this._scene.add(this._swWires.black)}_connectWire(t){if(this._wireConn[t])return;this._wireConn[t]=!0;const e=this._root.querySelector(`#sw-wd-${t}`),s=this._root.querySelector(`#sw-wt-${t}`);if(e&&e.classList.add("sw-used"),s){const h={red:"#7f1d1d",black:"#1f2937"};s.style.background=h[t],s.style.color="#fff",s.style.borderStyle="solid",s.textContent="✓"}this._swWires[t]&&(this._swWires[t].visible=!0);const o={red:3,black:4},i={red:36,black:48},a={red:"COM",black:"L1"},n=o[t],r=t==="red"?"RED (COM/Live)":"BLACK (L1/Output)",l=this._$s("s"+n);l&&(l.classList.remove("active"),l.classList.add("done")),this._completedTasks++;const c=this._$s("done-count");if(c&&(c.textContent=this._completedTasks),this._setPct(i[t]),this._showToast(`${r} → ${a[t]} ✓`,"ok"),this._wireConn.red&&this._wireConn.black){const h=this._$s("s5");h&&(h.classList.remove("active"),h.classList.add("done")),this._completedTasks++;const d=this._$s("done-count");d&&(d.textContent=this._completedTasks),this._setPct(60);const u=this._$s("s6");u&&u.classList.add("active"),this._afterAllWires()}else{const h=this._wireConn.red?4:3,d=this._$s("s"+h);d&&d.classList.add("active")}}_afterAllWires(){setTimeout(()=>{this._showToast("All wires secured ✓ — Turn breaker back ON","ok"),this._setInstr('<span class="sw-snum">STEP 6</span>Return to <span>breaker panel</span> and switch it <span>ON</span>');const t=this._$s("instruction");t&&(t.style.display="block");const e=this._$s("wire-panel");e&&(e.style.display="none"),this._setTut(this._bkHandle,"TAP BREAKER"),this._gameState="breaker_on",this._animateCam(new m(-1,.5,7.5),new m(0,.2,0),1e3,()=>{})},900)}_afterBreakerOn(){this._completeTask(6,75),this._showToast("Power ON ✓ — Flip the switch!","ok"),this._setInstr('<span class="sw-snum">STEP 7</span>Press the <span>FLIP SWITCH</span> button'),this._setTut(null);const t=this._$s("flip-ui");t&&(t.style.display="flex");const e=this._$s("instruction");e&&(e.style.display="block"),this._gameState="flip",this._animateCam(new m(1.2,.4,5.8),new m(.5,.1,0),800,()=>{})}doFlip(){this._gameState==="flip"&&(this._switchFlipped=!this._switchFlipped,this._leverTarget=this._switchFlipped?-.38:0,this._leverTween=!0,this._leverT=0,setTimeout(()=>{this._lightOn=this._switchFlipped,this._setLightState(this._lightOn),this._completeTask(7,88),setTimeout(()=>{const t=this._$s("flip-ui");t&&(t.style.display="none"),this._gameState="test",this._setInstr('<span class="sw-snum">STEP 8</span>Select <span>Multimeter</span> and tap the <span>bulb</span> to verify'),this._enableTool("multimeter"),this._selectTool("multimeter"),this._setTut(this._bulbGlass,"TEST BULB"),this._animateCam(new m(1.8,1.8,5.5),new m(1.5,1.5,0),900,()=>{})},1500)},300))}_doTest(){this._gameState="animating",this._setTut(null),this._showCamHint("Testing circuit");const t=this._$s("reading"),e=this._$s("rd-val");t&&t.classList.add("show"),e&&(e.textContent="---");const s=["---","18V","67V","124V","198V","218V","220V"];let o=0;const i=setInterval(()=>{o<s.length&&e&&(e.textContent=s[o],o++),o>=s.length&&(clearInterval(i),setTimeout(()=>{t&&t.classList.remove("show"),this._completeTask(8,100),this._gameState="done",this._timerRunning=!1,this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this._showToast("220V AC — Circuit complete!","ok"),this._animateCam(new m(1.2,.8,6.5),new m(0,0,0),1200,()=>{setTimeout(()=>{const a=550+this._timerVal*2,n=this._$s("so-score");n&&(n.textContent=`Score: ${a} pts`);const r=this._$s("success-overlay");r&&r.classList.add("show"),this._onFixed&&this._onFixed(this._switchId,1)},800)})},600))},200)}_setLightState(t){this._bulbLight.intensity=t?2.2:0,this._bulbGlassMat.emissive.setHex(t?16769152:0),this._bulbGlassMat.emissiveIntensity=t?1.4:0,this._bulbGlassMat.opacity=t?.85:.35,this._filMat.emissiveIntensity=t?2.5:0;const e=this._$s("light-glow");e&&(e.className=t?"on":"")}_animateCam(t,e,s,o){this._camFrom.copy(this._camera.position);const i=new m(0,0,-1).applyQuaternion(this._camera.quaternion);this._camLookFrom.copy(this._camera.position).addScaledVector(i,5),this._camTo.copy(t),this._camLookTo.copy(e),this._camT=0,this._camDur=s,this._camCB=o,this._camTweening=!0}_eio3(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}_setTut(t,e="TAP HERE"){this._tutTarget=t;const s=this._$s("tgt-label");s&&(s.textContent=e)}_updateTutorial(){const t=this._root.querySelector("#sw-canvas"),e=this._$s("tgt-ring"),s=this._$s("tgt-pulse"),o=this._$s("tgt-label");if(!t||!e||!s||!o)return;if(!(this._tutTarget&&!["animating","wires","flip","done"].includes(this._gameState))){[e,s,o].forEach(d=>d.style.display="none");return}const a=new m;this._tutTarget.getWorldPosition(a);const n=a.clone().project(this._camera);if(n.z>1){[e,s,o].forEach(d=>d.style.display="none");return}const r=t.clientWidth,l=t.clientHeight,c=(n.x+1)/2*r,h=(-n.y+1)/2*l;[e,s].forEach(d=>{d.style.display="block",d.style.left=c+"px",d.style.top=h+"px"}),o.style.display="block",o.style.left=c+"px",o.style.top=h+48+"px"}_completeTask(t,e){this._completedTasks++;const s=this._$s("s"+t);s&&(s.classList.remove("active"),s.classList.add("done"));const o=this._$s("s"+(t+1));o&&o.classList.add("active");const i=this._$s("done-count");i&&(i.textContent=this._completedTasks),this._setPct(e)}_setPct(t){const e=this._$s("pw-bar");e&&(e.style.width=t+"%");const s=this._$s("pw-pct");s&&(s.textContent=t)}_selectTool(t){this._activeTool=t,["mount","pliers","multimeter"].forEach(s=>{const o=this._$s("tool-"+s);o&&o.classList.remove("active")});const e=this._$s("tool-"+t);e&&e.classList.add("active")}_enableTool(t){const e=this._$s("tool-"+t);e&&e.classList.remove("disabled")}_setInstr(t){const e=this._$s("instruction");e&&(e.style.display="block",e.innerHTML=t)}_showToast(t,e){const s=this._$s("toast");s&&(s.textContent=t,s.className="show "+e,clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>s.classList.remove("show"),2800))}_showCamHint(t){const e=this._$s("cam-hint");e&&(e.textContent="📷 "+t,e.classList.add("show"),clearTimeout(this._camHintTimer),this._camHintTimer=setTimeout(()=>e.classList.remove("show"),2e3))}_resetAll(){this._touchClone&&(this._touchClone.remove(),this._touchClone=null),this._touchWire=null,this._gameState="breaker_off",this._activeTool=null,this._wireConn={red:!1,black:!1},this._completedTasks=0,this._timerVal=480,this._timerRunning=!0,this._switchFlipped=!1,this._lightOn=!1,this._swWiresBuilt=!1,this._bkAnimating=!1,this._mountAnim=!1,this._leverTween=!1,this._camTweening=!1,this._idleT=0,this._bkHandle.position.y=this._HANDLE_ON_Y,this._bkHandleMat.color.setHex(2278750),this._bkLEDMat.color.setHex(2278750),this._bkLEDMat.emissive.setHex(2278750),this._bkLEDMat.emissiveIntensity=1,this._swRoot.position.set(0,-.2,2),this._swRoot.rotation.set(0,0,0),this._swLever.rotation.x=0,this._swLever.position.y=-.05,this._setLightState(!1),this._wallWires.forEach(c=>c.visible=!1),["red","black"].forEach(c=>{this._swWires[c]&&(this._scene.remove(this._swWires[c]),delete this._swWires[c])}),this._bulbWire&&(this._scene.remove(this._bulbWire),this._bulbWire=null),this._camera.position.set(0,.5,8),this._camera.lookAt(0,0,0),this._setPct(0);const t=this._$s("done-count");t&&(t.textContent="0");for(let c=1;c<=8;c++){const h=this._$s("s"+c);h&&(h.classList.remove("done","active"),c===1&&h.classList.add("active"))}const e=this._$s("wire-panel");e&&(e.style.display="none");const s=this._$s("flip-ui");s&&(s.style.display="none");const o=this._$s("success-overlay");o&&o.classList.remove("show");const i=this._$s("reading");i&&i.classList.remove("show");const a=this._$s("rd-val");a&&(a.textContent="---"),this._setInstr('<span class="sw-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>'),["red","black"].forEach(c=>{const h=this._root.querySelector(`#sw-wd-${c}`);h&&h.classList.remove("sw-used");const d=this._root.querySelector(`#sw-wt-${c}`);if(d){const u={red:"COM",black:"L1"},w={red:"#dc2626",black:"#888"};d.style.background="",d.style.color=w[c],d.style.borderStyle="dashed",d.textContent=u[c]}}),["mount","pliers","multimeter"].forEach(c=>{const h=this._$s("tool-"+c);h&&(h.classList.add("disabled"),h.classList.remove("active"))}),["mount","pliers","multimeter"].forEach(c=>{const h=this._$s("tool-"+c);h&&(h.onclick=()=>{this._open&&this._selectTool(c)})});const n=this._$s("flip-btn");n&&(n.onclick=()=>this.doFlip());const r=this._$s("replay-btn");r&&(r.onclick=()=>this._resetAll()),this._setTut(this._bkHandle,"TAP HERE"),this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null);const l=this._$s("timer");l&&(l.textContent="08:00"),this._timerInterval=setInterval(()=>{if(!this._timerRunning||!this._open)return;this._timerVal=Math.max(0,this._timerVal-1);const c=Math.floor(this._timerVal/60).toString().padStart(2,"0"),h=(this._timerVal%60).toString().padStart(2,"0"),d=this._$s("timer");d&&(d.textContent=`${c}:${h}`)},1e3)}_loop(){if(!this._open)return;this._raf=requestAnimationFrame(()=>this._loop());const t=Math.min(this._clock.getDelta(),.05);if(this._idleT+=t,this._wbRoot.position.y=-.2+Math.sin(this._idleT*.5)*.012,this._wbRoot.rotation.z=Math.sin(this._idleT*.32)*.005,this._swRoot.position.z>.5&&(this._swRoot.position.y=Math.sin(this._idleT*.65)*.06+.2,this._swRoot.rotation.z=Math.sin(this._idleT*.45)*.04),this._lightOn){const e=.9+.1*Math.sin(this._idleT*4.5);this._bulbLight.intensity=2.2*e,this._filMat.emissiveIntensity=2.5*e}if(this._camTweening){this._camT+=t*1e3;const e=this._eio3(Math.min(this._camT/this._camDur,1));if(this._camera.position.lerpVectors(this._camFrom,this._camTo,e),this._camera.lookAt(new m().lerpVectors(this._camLookFrom,this._camLookTo,e)),this._camT>=this._camDur&&(this._camTweening=!1,this._camCB)){const s=this._camCB;this._camCB=null,s()}}if(this._bkAnimating){this._bkAnimT+=t*3;const e=this._eio3(Math.min(this._bkAnimT,1)),s=this._bkGoingOff?this._HANDLE_ON_Y:this._HANDLE_OFF_Y,o=this._bkGoingOff?this._HANDLE_OFF_Y:this._HANDLE_ON_Y;if(this._bkHandle.position.y=s+(o-s)*e,this._bkAnimT>=1&&(this._bkAnimating=!1,this._bkHandle.position.y=o,this._bkGoingOff?(this._bkHandleMat.color.setHex(15680580),this._bkLEDMat.color.setHex(15680580),this._bkLEDMat.emissive.setHex(8917265),this._bkLEDMat.emissiveIntensity=.5):(this._bkHandleMat.color.setHex(2278750),this._bkLEDMat.color.setHex(2278750),this._bkLEDMat.emissive.setHex(2278750),this._bkLEDMat.emissiveIntensity=1),this._bkCB)){const i=this._bkCB;this._bkCB=null,i()}}if(this._mountAnim){this._mountT+=t*1.2;const e=this._eio3(Math.min(this._mountT,1));if(this._swRoot.position.lerpVectors(this._mountFrom,this._mountTo,e),this._swRoot.rotation.z=(1-e)*.18,this._mountT>=1&&(this._mountAnim=!1,this._swRoot.position.copy(this._mountTo),this._swRoot.rotation.z=0,this._mountCB)){const s=this._mountCB;this._mountCB=null,s()}}if(this._leverTween){this._leverT+=t*4;const e=this._eio3(Math.min(this._leverT,1));this._swLever.rotation.x=this._leverTarget*e,this._swLever.position.y=-.05+this._leverTarget*.15*e,this._leverT>=1&&(this._leverTween=!1,this._swLever.rotation.x=this._leverTarget,this._swLever.position.y=-.05+this._leverTarget*.15)}this._updateTutorial(),this._renderer.render(this._scene,this._camera)}}const qt=0,$=4.2,Z=.22,Zt=1.72,Ae=new m(0,Zt,5),Bs=Math.PI,Hs=[{id:1,pos:new m(-7.7,1.2,3),label:"Entrance West"},{id:2,pos:new m(7.7,1.2,0),label:"Entrance East"},{id:3,pos:new m(-7.7,1.2,-8),label:"Workshop A West"},{id:4,pos:new m(7.7,1.2,-14),label:"Workshop A East"},{id:5,pos:new m(0,1.2,-31.8),label:"Workshop B North"},{id:6,pos:new m(-7.7,1.2,-20),label:"Workshop B West"},{id:7,pos:new m(7.7,1.2,-28),label:"Workshop B East"}],Ws=[{id:1,pos:new m(-7.7,1.5,-5),label:"Workshop A Station 1"},{id:2,pos:new m(7.7,1.5,-22),label:"Workshop B Station 2"},{id:3,pos:new m(-7.7,1.5,-28),label:"Workshop B Station 3"},{id:4,pos:new m(7.7,1.5,-2),label:"Entrance Station 4"},{id:5,pos:new m(-7.7,1.5,-20),label:"Workshop B Station 5"}];class $s{constructor(t,e,s=null){this.state=t,this.root=e,this._guide=s,this._raf=null,this._listeners=[];const o=O.getExploreProgress();this._player={pos:Ae.clone(),yaw:Bs,pitch:0,yawVel:0,pitchVel:0,vel:new m,vy:0,grounded:!1},this._keys={},this._joy={x:0,y:0},this._joyId=-1,this._lookTouches={},this._pointerLocked=!1,this._repairOpen=!1,this._bobT=0,this._bobAmt=0,this._outlets=Hs.map(i=>({...i,fixed:!!o.outlets[i.id]})),this._switches=Ws.map(i=>({...i,fixed:!!o.switches[i.id]})),this._nearest=null,this._guideTipsFired={},this._colBoxes=[],this._isMob=navigator.maxTouchPoints>0,this._outletScenario=null,this._switchScenario=null,U.init(),this._initThree(),this._buildWorld(),this._buildInteractables(),this._setupInput(),this._startLoop(),this._updateScoreHUD(),U.startAmbient()}_initThree(){const t=this.root.querySelector("#ex-canvas"),e=this._isMob;if(this._renderer=new _t({canvas:t,antialias:!e,powerPreference:"high-performance"}),this._renderer.setPixelRatio(Math.min(devicePixelRatio,e?1.5:2)),this._renderer.outputColorSpace=Fe,this._renderer.toneMapping=e?je:Ht,this._renderer.toneMappingExposure=1.35,this._renderer.shadowMap.enabled=!e,this._renderer.shadowMap.type=Bt,this._scene=new mt,this._scene.background=new R(395280),e?this._scene.fog=new ee(395280,12,32):this._scene.fog=new Wt(395280,.028),!e)try{const s=new Ge(this._renderer);s.compileCubemapShader();const o=new mt,i=(n,r,l,c,h,d,u)=>{const w=new p(new y(n,r,l),new J({color:c}));w.position.set(h,d,u),o.add(w)};i(120,2,120,658970,0,0,0),i(120,2,120,658970,0,20,0),i(2,60,2,1714756,18,0,-10),i(120,2,120,528398,0,-20,0);const a=s.fromScene(o);this._scene.environment=a.texture,s.dispose()}catch{}this._camera=new xt(72,1,.1,e?40:120),this._camera.position.copy(Ae),this._clock=new _e,this._ro=new ResizeObserver(()=>this._onResize()),this._ro.observe(this.root),this._onResize()}_onResize(){const t=this.root.clientWidth,e=this.root.clientHeight;!t||!e||(this._renderer.setSize(t,e),this._camera.aspect=t/e,this._camera.updateProjectionMatrix())}_mkTex(t){const e=new ft(t);return e.wrapS=e.wrapT=te,e.minFilter=Ye,e.magFilter=Xe,e.anisotropy=this._isMob?8:16,e}_heightToNormal(t,e=3){const s=t.width,o=t.height,i=t.getContext("2d").getImageData(0,0,s,o).data,a=document.createElement("canvas");a.width=s,a.height=o;const n=a.getContext("2d"),r=n.createImageData(s,o),l=(c,h)=>i[((h%o+o)%o*s+(c%s+s)%s)*4]/255;for(let c=0;c<o;c++)for(let h=0;h<s;h++){const d=-l(h-1,c-1)+l(h+1,c-1)+(-2*l(h-1,c)+2*l(h+1,c))+(-l(h-1,c+1)+l(h+1,c+1)),u=-l(h-1,c-1)-2*l(h,c-1)-l(h+1,c-1)+(l(h-1,c+1)+2*l(h,c+1)+l(h+1,c+1));let w=d*e,b=u*e,_=1;const v=Math.sqrt(w*w+b*b+_*_),E=(c*s+h)*4;r.data[E]=(w/v*.5+.5)*255|0,r.data[E+1]=(b/v*.5+.5)*255|0,r.data[E+2]=(_/v*.5+.5)*255|0,r.data[E+3]=255}return n.putImageData(r,0,0),this._mkTex(a)}_makeFloorTex(){const t=document.createElement("canvas");t.width=t.height=512;const e=t.getContext("2d");e.fillStyle="#525e6a",e.fillRect(0,0,512,512);const s=128,o=3;for(let a=0;a<4;a++)for(let n=0;n<4;n++){const r=n*s+o,l=a*s+o,c=s-o*2,h=s-o*2,d=(Math.random()-.5)*14;e.fillStyle=`rgb(${82+d|0},${94+d|0},${106+d|0})`,e.fillRect(r,l,c,h);const u=r+c/2,w=l+h/2,b=e.createRadialGradient(u,w,2,u,w,c*.72);b.addColorStop(0,"rgba(255,255,255,.10)"),b.addColorStop(.5,"rgba(255,255,255,.03)"),b.addColorStop(1,"rgba(0,0,0,.08)"),e.fillStyle=b,e.fillRect(r,l,c,h),e.strokeStyle="rgba(0,0,0,.18)",e.lineWidth=1.5,e.strokeRect(r+1,l+1,c-2,h-2)}e.fillStyle="#2e3840";for(let a=0;a<=512;a+=s)e.fillRect(a,0,o,512),e.fillRect(0,a,512,o);for(let a=0;a<400;a++){e.strokeStyle=`rgba(0,0,0,${Math.random()*.15})`,e.lineWidth=Math.random()*2.5,e.beginPath();const n=Math.random()*512,r=Math.random()*512;e.moveTo(n,r),e.lineTo(n+(Math.random()-.5)*80,r+(Math.random()-.5)*20),e.stroke()}const i=this._mkTex(t);return i.repeat.set(8,8),i}_makeWallTex(){const t=document.createElement("canvas");t.width=t.height=512;const e=t.getContext("2d");e.fillStyle="#c2cbd4",e.fillRect(0,0,512,512);const s=48,o=128,i=4;for(let n=0;n*s<512;n++){const r=n%2===0?0:o/2;for(let l=-1;l*o+r<512;l++){const c=l*o+r+i/2,h=n*s+i/2,d=o-i,u=s-i,w=(Math.random()-.5)*18,b=194+w|0,_=204+w|0,v=214+w|0;e.fillStyle=`rgb(${b},${_},${v})`,e.fillRect(c,h,d,u);const E=e.createLinearGradient(c,h,c,h+u);E.addColorStop(0,"rgba(255,255,255,.08)"),E.addColorStop(1,"rgba(0,0,0,.06)"),e.fillStyle=E,e.fillRect(c,h,d,u),e.strokeStyle="rgba(0,0,0,.12)",e.lineWidth=.8,e.strokeRect(c+.5,h+.5,d-1,u-1)}}e.fillStyle="#9aabb8";for(let n=0;n<=512/s;n++){e.fillRect(0,n*s,512,i);const r=n%2===0?0:o/2;for(let l=-1;l*o+r<512;l++)e.fillRect(l*o+r,0,i,512)}const a=this._mkTex(t);return a.repeat.set(4,2),a}_makeCeilTex(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d");e.fillStyle="#d8e4ee",e.fillRect(0,0,256,256);const s=64;e.strokeStyle="rgba(100,130,160,.22)",e.lineWidth=1.5;for(let i=0;i<=256;i+=s)e.beginPath(),e.moveTo(i,0),e.lineTo(i,256),e.stroke();for(let i=0;i<=256;i+=s)e.beginPath(),e.moveTo(0,i),e.lineTo(256,i),e.stroke();for(let i=0;i<4;i++)for(let a=0;a<4;a++){const n=a*s+s/2,r=i*s+s/2,l=e.createRadialGradient(n,r,2,n,r,s*.4);l.addColorStop(0,"rgba(255,255,255,.12)"),l.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=l,e.fillRect(a*s,i*s,s,s)}const o=this._mkTex(t);return o.repeat.set(8,8),o}_makeConcrTex(){const t=document.createElement("canvas");t.width=t.height=512;const e=t.getContext("2d");e.fillStyle="#8a9298",e.fillRect(0,0,512,512);for(let o=0;o<3e3;o++){const i=Math.random()*512,a=Math.random()*512,r=138+(Math.random()-.5)*30|0;e.fillStyle=`rgba(${r},${r},${r},.18)`,e.fillRect(i,a,1+Math.random()*3,1+Math.random()*3)}e.strokeStyle="rgba(60,70,75,.3)",e.lineWidth=1.5;for(let o=0;o<512;o+=128)e.beginPath(),e.moveTo(0,o),e.lineTo(512,o),e.stroke();for(let o=0;o<512;o+=128)e.beginPath(),e.moveTo(o,0),e.lineTo(o,512),e.stroke();const s=this._mkTex(t);return s.repeat.set(4,2),s}_makeMetalTex(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d"),s=e.createLinearGradient(0,0,0,256);s.addColorStop(0,"#b0bcc8"),s.addColorStop(.5,"#d0dce8"),s.addColorStop(1,"#9aacbc"),e.fillStyle=s,e.fillRect(0,0,256,256),e.strokeStyle="rgba(255,255,255,.25)",e.lineWidth=1;for(let i=0;i<256;i+=4)e.beginPath(),e.moveTo(0,i),e.lineTo(256,i),e.stroke();const o=this._mkTex(t);return o.repeat.set(2,2),o}_buildWorld(){const t=this._isMob,e=this._scene,s=this._makeFloorTex(),o=this._makeWallTex(),i=this._makeCeilTex(),a=this._makeConcrTex(),n=this._makeMetalTex();let r=null,l=null,c=null;if(!t){const S=document.createElement("canvas");S.width=S.height=512;const x=S.getContext("2d");x.fillStyle="#666",x.fillRect(0,0,512,512);for(let I=0;I<=512;I+=128)x.strokeStyle="rgba(0,0,0,.5)",x.lineWidth=3,x.beginPath(),x.moveTo(I,0),x.lineTo(I,512),x.stroke(),x.beginPath(),x.moveTo(0,I),x.lineTo(512,I),x.stroke();r=this._heightToNormal(S,2.5),r.repeat.set(8,8);const T=document.createElement("canvas");T.width=T.height=512;const C=T.getContext("2d");C.fillStyle="#888",C.fillRect(0,0,512,512);for(let I=0;I*48<512;I++){const z=I%2===0?0:64;for(let L=-1;L*128+z<512;L++)C.fillStyle="rgba(0,0,0,.35)",C.fillRect(L*128+z,I*48,4,48),C.fillRect(L*128+z,I*48,128,4)}l=this._heightToNormal(T,3),l.repeat.set(4,2),c=this._makeMetalTex(),c.repeat.set(2,2)}const h=(S,x)=>new Rt(S,x);this._M={floor:new g({map:s,roughness:.62,metalness:.06,envMapIntensity:.4}),wall:new g({map:o,roughness:.85,metalness:0,envMapIntensity:.2}),ceil:new g({map:i,roughness:.9,metalness:0,envMapIntensity:.15}),concrete:new g({map:a,color:11186874,roughness:.92,metalness:0,envMapIntensity:.15}),door:new g({color:11567184,roughness:.68,metalness:.1,envMapIntensity:.3}),doorFrame:new g({map:n,color:10070715,roughness:.18,metalness:.92,envMapIntensity:.8}),panel:new g({color:2771554,roughness:.52,metalness:.38,envMapIntensity:.5}),panelGrey:new g({map:n,color:6978184,roughness:.44,metalness:.48,envMapIntensity:.6}),yellow:new g({color:15777888,emissive:new R(15777888),emissiveIntensity:1.2,roughness:.45}),red:new g({color:14500915,emissive:new R(14500915),emissiveIntensity:1.4,roughness:.4}),green:new g({color:3399014,emissive:new R(3399014),emissiveIntensity:1.6,roughness:.4}),orange:new g({color:16746547,emissive:new R(16746547),emissiveIntensity:1.2,roughness:.45}),bench:new g({color:10125413,roughness:.8,metalness:0,envMapIntensity:.2}),black:new g({color:1315860,roughness:.75,metalness:.15,envMapIntensity:.3}),chrome:new g({map:n,color:13426159,roughness:.04,metalness:1,envMapIntensity:1.4}),pipe:new g({map:n,color:8032160,roughness:.12,metalness:.96,envMapIntensity:1.2}),copper:new g({color:14252101,roughness:.18,metalness:.96,envMapIntensity:1.2}),eWhite:new J({color:16775392}),eBlue:new J({color:3377407}),eGreen:new J({color:2293640}),eRed:new J({color:16724770}),eYellow:new J({color:16772608}),window:new g({color:12116216,transparent:!0,opacity:.34,roughness:.02,metalness:.06,envMapIntensity:.5,side:ge}),winFrame:new g({color:15658732,roughness:.45,metalness:.25,envMapIntensity:.5})};const d=this._M;t?Object.values(d).forEach(S=>{S.isMeshStandardMaterial&&(S.normalMap=null,S.envMapIntensity=0,S.metalness=0,S.roughness=Math.max(S.roughness,.7))}):(d.floor.normalMap=r,d.floor.normalScale=h(1.6,1.6),d.wall.normalMap=l,d.wall.normalScale=h(2.2,2.2),d.concrete.normalMap=l,d.concrete.normalScale=h(1.4,1.4),d.doorFrame.normalMap=c,d.doorFrame.normalScale=h(.8,.8),d.panelGrey.normalMap=c,d.panelGrey.normalScale=h(.6,.6),d.chrome.normalMap=c,d.chrome.normalScale=h(.5,.5),d.pipe.normalMap=c,d.pipe.normalScale=h(.7,.7));const u=new g({map:o,color:924718,roughness:.88,metalness:0,envMapIntensity:.18}),w=new g({map:o,color:661026,roughness:.9,metalness:0,envMapIntensity:.12});t&&(u.normalMap=null,w.normalMap=null,u.envMapIntensity=0,w.envMapIntensity=0),this._roomLightSets={},e.add(new se(1714756,t?.35:.18)),t||e.add(new Re(660520,527376,.12));const b=new ht(15266047,t?.5:1.4);b.position.set(12,18,8),b.target.position.set(0,0,-12),e.add(b),e.add(b.target),t||(b.castShadow=!0,b.shadow.mapSize.width=b.shadow.mapSize.height=2048,b.shadow.camera.near=.5,b.shadow.camera.far=65,b.shadow.camera.left=b.shadow.camera.bottom=-20,b.shadow.camera.right=b.shadow.camera.top=20,b.shadow.bias=-.0015,b.shadow.normalBias=.04,b.shadow.radius=4.5);const _=(S,x,T,C,I)=>{const z=new V(C,I,12,1.8);z.position.set(S,x,T),e.add(z)};_(0,3.2,2,16771264,t?1.2:.55),_(-2,3.2,-8,16773328,t?1:.45),_(3,3.2,-14,16773328,t?1:.45),_(0,3.2,-22,16771264,t?.9:.4),_(0,3.2,-28,16771264,t?.9:.4);const v=(S,x,T,C)=>{const z=this._mkBox(T,.16,C,d.floor);z.position.set(S,qt-.16/2,x),z.castShadow=!1,z.receiveShadow=!t,e.add(z),this._addCol(S,qt-.16/2,x,T,.16,C);const L=this._mkBox(T,.16,C,d.ceil);L.position.set(S,$+.16/2,x),e.add(L)};v(0,3,16,10),v(0,-10,16,16),v(0,-25,16,14);const E=$/2;this._mkWall(8.11,E,3,Z,$,10.22,d.concrete),this._mkWall(8.11,E,-10,Z,$,16.22,u),this._mkWall(8.11,E,-25,Z,$,14.22,w),this._mkWall(-8.11,E,3,Z,$,10.22,d.concrete),this._mkWall(-8.11,E,-10,Z,$,16.22,u),this._mkWall(-8.11,E,-25,Z,$,14.22,w),this._mkWall(0,E,8.11,16.22,$,Z,d.concrete),this._mkWall(0,E,-32.11,16.22,$,Z,w),this._wallDoor(-2,-8,8,0,1.8,d.concrete),this._wallDoor(-18,-8,8,0,1.8,u),this._addWindow(8.06,2.4,4,3.2,1.8,!0),this._addWindow(8.06,2.2,-6,3.4,2,!0),this._addWindow(8.06,2.2,-14,3.4,2,!0),this._addWindow(-8.06,2.2,-6,3.4,2,!0),this._addWindow(-8.06,2.2,-14,3.4,2,!0),this._addWindow(-4,2.2,-32.06,3.2,1.8,!1),this._addWindow(4,2.2,-32.06,3.2,1.8,!1),this._addWindow(8.06,2.2,-25,3.4,2,!0),this._addWindow(-8.06,2.2,-25,3.4,2,!0),this._doors=[this._mkDoor(1,0,-2),this._mkDoor(2,0,-18)],this._mkLight(0,$-.2,3,16774368,2.8,"entrance"),this._mkLight(0,$-.2,-10,16775408,3.2,"workshop"),this._mkLight(0,$-.2,-18,16775408,3,"workshop"),this._mkLight(0,$-.2,-28,16774368,2.6,"workshop");{const S=this._mkBox(16,.08,.38,d.panelGrey);S.position.set(0,$-.45,-10),e.add(S),[-1,1].forEach(x=>{const T=this._mkBox(16,.1,.04,d.panelGrey);T.position.set(0,$-.39,-10+x*.16),e.add(T)})}const M=new g({color:13123600,roughness:.55,metalness:.08});{const S=new p(new k(.028,.028,14,10),M);S.rotation.z=Math.PI/2,S.position.set(0,2.2,-17.88),e.add(S)}this._place(this._mkBox(.03,1.5,1.1,new g({color:16772812,roughness:.9})),-7.97,2,2),this._place(this._mkBox(.02,1.58,1.18,new g({color:2236962,roughness:.5})),-7.96,2,2),[13378048,2245836,2263074].forEach((S,x)=>{this._place(this._mkBox(.02,.01,.82,new J({color:S})),-7.95,1.7+x*.28,2)}),this._place(this._mkBox(2.2,1.3,.03,new g({color:8018458,roughness:.9})),-2,2.2,7.97);{const S=new p(new k(.07,.08,.52,8),d.red);S.position.set(-7.5,.26,-1),e.add(S)}if(!t){const S=new p(new we(.22,24),new g({color:15790312,roughness:.8}));S.rotation.y=Math.PI/2,S.position.set(7.88,2.4,7),e.add(S);const x=new p(new D(.22,.025,8,24),new g({color:3359829,roughness:.4,metalness:.9}));x.rotation.y=Math.PI/2,x.position.set(7.87,2.4,7),e.add(x)}{const T=new g({color:11895098,roughness:.75,metalness:.05}),C=new g({color:8017184,roughness:.8});if(this._place(this._mkBox(2.4,.07,.9,T),-4,.82,3.5),this._addCol(-4,.42,3.5,2.4,.82,.9),this._place(this._mkBox(2.4,.78,.05,C),-4,.41,3.5+.43),this._place(this._mkBox(.05,.82,.9,C),-4-1.18,.41,3.5),this._place(this._mkBox(.05,.82,.9,C),-4+1.18,.41,3.5),!t){const I=new g({color:663354,emissive:new R(1388640),emissiveIntensity:1.3}),z=new p(new kt(.62,.38),I);z.position.set(-4,1.26,3.5-.196),e.add(z);const L=new V(2254591,.7,3);L.position.set(-4,1.2,3.5-.2),e.add(L)}}{const T=new g({color:2968188,roughness:.85}),C=new g({color:3824278,roughness:.82});this._place(this._mkBox(1.9,.45,.75,T),-5,.225,1.2),this._addCol(-5,.225,1.2,1.9,.45,.75),[-.46,.46].forEach(I=>this._place(this._mkBox(.88,.12,.68,C),-5+I,.5,1.2)),this._place(this._mkBox(1.9,.62,.12,T),-5,.76,1.2+.35),[-.97,.97].forEach(I=>this._place(this._mkBox(.12,.58,.75,T),-5+I,.54,1.2))}if(this._place(this._mkBox(.48,1.1,.52,d.panelGrey),6.6,.55,7),this._addCol(6.6,.55,7,.48,1.1,.52),this._place(this._mkBox(.9,1.85,.32,d.panelGrey),-6.5,.925,6.8),this._addCol(-6.5,.925,6.8,.9,1.85,.32),!t){[.38,.8,1.22,1.58].forEach(x=>this._place(this._mkBox(.88,.03,.3,d.bench),-6.5,x,6.8));const S=[13378048,2245836,2263074,16746547,8921804,2263176];[0,1,2].forEach(x=>S.forEach((T,C)=>{C<4&&this._place(this._mkBox(.1,.22,.24,new g({color:T,roughness:.9})),-6.88+C*.12,.38+x*.42+.12,6.8)}))}this._workbench(-4,-7),this._chair(-4,-7.9,!0),this._workbench(4,-7),this._chair(4,-7.9,!0),this._workbench(-4,-13),this._chair(-4,-13.9,!0),this._workbench(4,-13),this._chair(4,-13.9,!0),this._workbench(-4,-22),this._chair(-4,-22.9,!0),this._workbench(4,-22),this._chair(4,-22.9,!0),this._workbench(-4,-28),this._chair(-4,-28.9,!0),this._workbench(4,-28),this._chair(4,-28.9,!0);{const S=this._mkBox(1.2,1.6,.55,d.panelGrey);S.position.set(-5.5,.8,-31.5),e.add(S),this._addCol(-5.5,.8,-31.5,1.2,1.6,.55)}if(this._place(this._mkBox(1.6,1.1,.03,new g({color:663354,roughness:.9})),4,2,-31.97),this._buildBreakerPanel(7.8,0,-8,Math.PI/2,6),!t){const S=new J({color:16775400,transparent:!0,opacity:.18,side:ge,depthWrite:!1});[[-6,-14]].forEach(([x,T])=>{const C=new p(new kt(2,2),S);C.position.set(7.4,2.2,(x+T)/2),C.rotation.y=Math.PI/2,e.add(C);const I=new V(16773324,1.2,5,1.8);I.position.set(6.5,2.2,(x+T)/2),e.add(I)})}}_mkBox(t,e,s,o){const i=new p(new y(t,e,s),o);return i.castShadow=!this._isMob,i.receiveShadow=!this._isMob,i}_mkCyl(t,e,s,o=16){return new p(new k(t,t,e,o),s)}_place(t,e,s,o){return t.position.set(e,s,o),this._scene.add(t),t}_mkWall(t,e,s,o,i,a,n){const r=this._mkBox(o,i,a,n||this._M.wall);return r.position.set(t,e,s),this._scene.add(r),this._addCol(t,e,s,o,i,a),r}_wallDoor(t,e,s,o,i,a){const n=o-i/2,r=o+i/2,l=2.6,c=$-l,h=l+c/2,d=$/2,u=[];n>e&&u.push([e,n,!1]),u.push([n,r,!0]),r<s&&u.push([r,s,!1]),u.forEach(([w,b,_])=>{const v=b-w,E=(w+b)/2;if(_){const M=this._mkBox(v,c,Z,a);M.position.set(E,h,t),this._scene.add(M),this._addCol(E,h,t,v,c,Z)}else{const M=this._mkBox(v,$,Z,a);M.position.set(E,d,t),this._scene.add(M),this._addCol(E,d,t,v,$,Z)}})}_mkDoor(t,e,s){const o=new A;o.position.set(e-.9,0,s);const i=new p(new y(1.8,2.6,.06),this._M.door);return i.position.set(.9,1.3,0),i.userData={type:"door",id:t},i.castShadow=!this._isMob,i.receiveShadow=!this._isMob,o.add(i),this._scene.add(o),{id:t,pivot:o,mesh:i,open:!1,targetRot:0,x:e,z:s}}_addWindow(t,e,s,o,i,a){const n=this._M,r=Z+.04,l=.09;a?(this._place(new p(new y(r,i,o),n.window),t,e,s),this._place(this._mkBox(r+.02,l,o+.12,n.winFrame),t,e+i/2+l/2,s),this._place(this._mkBox(r+.02,l,o+.12,n.winFrame),t,e-i/2-l/2,s),this._place(this._mkBox(r+.02,i+.12,l,n.winFrame),t,e,s-o/2-l/2),this._place(this._mkBox(r+.02,i+.12,l,n.winFrame),t,e,s+o/2+l/2)):(this._place(new p(new y(o,i,r),n.window),t,e,s),this._place(this._mkBox(o+.12,l,r+.02,n.winFrame),t,e+i/2+l/2,s),this._place(this._mkBox(o+.12,l,r+.02,n.winFrame),t,e-i/2-l/2,s),this._place(this._mkBox(l,i+.12,r+.02,n.winFrame),t-o/2-l/2,e,s),this._place(this._mkBox(l,i+.12,r+.02,n.winFrame),t+o/2+l/2,e,s))}_mkLight(t,e,s,o,i,a){const n=this._isMob,r=new At(o||16774368,n?i*1.4:i*1.2,n?16:22,Math.PI/3.8,.38,1.8);r.position.set(t,e,s),r.target.position.set(t,0,s),this._scene.add(r),this._scene.add(r.target),!n&&a&&(this._roomLightSets[a]||(this._roomLightSets[a]=[]),this._roomLightSets[a].push(r)),n||(r.castShadow=!0,r.shadow.mapSize.width=r.shadow.mapSize.height=512,r.shadow.bias=-.003);const l=this._mkBox(.18,.05,1.58,this._M.panelGrey);l.position.set(t,e+.05,s),this._scene.add(l);const c=new g({color:16775392,emissive:new R(16774336),emissiveIntensity:n?3.5:4,roughness:1}),h=new p(new k(.042,.042,1.48,8),c);h.rotation.z=Math.PI/2,h.position.set(t,e-.01,s),this._scene.add(h);const d=new p(new we(.24,12),c);d.rotation.x=Math.PI/2,d.position.set(t,e-.055,s),this._scene.add(d)}_workbench(t,e){const s=this._M;if(this._place(this._mkBox(2.2,.07,.9,s.bench),t,.965,e),this._place(this._mkBox(2.2,1,.05,s.panelGrey),t,.5,e+.44),[[-1.05,-.38],[-1.05,.38],[1.05,-.38],[1.05,.38]].forEach(([r,l])=>this._place(this._mkBox(.06,1,.06,s.chrome),t+r,.5,e+l)),this._addCol(t,.5,e,2.2,1,.9),this._isMob)return;this._place(this._mkBox(2,.04,.7,s.bench),t,.34,e),this._place(this._mkBox(2.2,.55,.03,new g({color:7031838,roughness:.92})),t,1.27,e+.44);const o=new p(new D(.062,.022,6,14),s.copper);o.rotation.x=Math.PI/2,o.position.set(t+.65,1,e-.05),this._scene.add(o);const i=t+.92,a=e+.38;this._place(this._mkCyl(.04,.03,s.panelGrey,8),i,.988,a),this._place(this._mkCyl(.012,.3,s.chrome,6),i,1.14,a),this._place(this._mkBox(.1,.03,.08,new g({color:16777164,emissive:new R(16772744),emissiveIntensity:1.4})),i,1.3,a-.06);const n=new V(16771248,1.2,1.8,2.2);n.position.set(i,1.26,a-.08),this._scene.add(n)}_chair(t,e,s=!1){const o=this._M,i=new g({color:1718876,roughness:.88}),a=s?-.27:.27;this._place(this._mkBox(.58,.07,.58,i),t,.55,e),this._place(this._mkBox(.58,.64,.07,i),t,.98,e+a);const n=this._mkCyl(.05,.52,o.chrome,8);n.position.set(t,.27,e),this._scene.add(n),!this._isMob&&[-.3,.3].forEach(r=>{this._place(this._mkBox(.06,.05,.38,o.panelGrey),t+r,.74,e+a*.15),this._place(this._mkBox(.1,.03,.32,i),t+r,.775,e+a*.1)})}_buildBreakerPanel(t,e,s,o,i=8){const a=this._M,n=new A,r=this._mkBox(1.05,1.55,.18,a.panel);r.position.set(0,1.78,0),n.add(r);const l=this._mkBox(1.07,1.57,.14,a.panelGrey);l.position.set(0,1.78,.02),n.add(l),O.getExploreProgress();const c=O.load().exploreBreakerFixed;this._breakerBreakers=[];for(let d=0;d<i;d++){const u=Math.floor(d/2),w=d%2,b=!c&&d===2,_=b?!1:d<Math.floor(i*.75),v=this._mkBox(.16,.28,.07,b?a.red:_?a.green:a.panelGrey);v.position.set(-.23+w*.46,2.3-u*.32,.12),v.userData={type:"breaker",index:d,tripped:b},n.add(v),b&&(this._breakerInteractMesh=v),this._breakerBreakers.push({mesh:v,tripped:b})}const h=this._mkBox(1,1.5,.1,new J({visible:!1}));h.position.set(0,1.78,.14),h.userData={type:"breaker",id:1},n.add(h),this._breakerHit=h,n.position.set(t,e,s),n.rotation.y=o,this._scene.add(n),this._breakerGroup=n,this._breakerFixed=c}_buildInteractables(){const t=this._M;this._outletMeshes=this._outlets.map(e=>{const s=new A,o=new p(new y(.12,.1,.04),e.fixed?t.green:new g({color:3359846,roughness:.55}));o.userData={type:"outlet",id:e.id},s.add(o);const i=new p(new y(.02,.03,.05),new J({color:0}));i.position.set(-.025,.015,.01),s.add(i);const a=i.clone();a.position.set(.025,.015,.01),s.add(a);const n=i.clone();if(n.position.set(0,-.022,.01),s.add(n),!e.fixed){const r=new V(16720384,1.4,2.2);r.position.set(0,0,.3),s.add(r),s.userData._glow=r;const l=new p(new y(.015,.025,.06),new g({color:16737792,emissive:new R(16729088),emissiveIntensity:8,roughness:1}));l.position.set(.03,.03,.02),s.add(l),s.userData._spark=l}return s.position.copy(e.pos),Math.abs(e.pos.x)>7&&(s.rotation.y=e.pos.x>0?-Math.PI/2:Math.PI/2),this._scene.add(s),{id:e.id,group:s,plate:o}}),this._switchMeshes=this._switches.map(e=>{const s=new A,o=new p(new y(.1,.12,.04),e.fixed?t.green:new g({color:16448250,roughness:.6}));o.userData={type:"switch",id:e.id},s.add(o);const i=new p(new y(.025,.06,.05),new g({color:e.fixed?3355392:6710886}));return i.position.set(0,e.fixed?.018:-.018,.02),i.rotation.z=e.fixed?.3:-.3,s.add(i),s.position.copy(e.pos),Math.abs(e.pos.x)>7&&(s.rotation.y=e.pos.x>0?-Math.PI/2:Math.PI/2),this._scene.add(s),{id:e.id,group:s,box:o}}),this._interactMeshes=[...this._outletMeshes.map(e=>({mesh:e.plate,type:"outlet",id:e.id})),...this._switchMeshes.map(e=>({mesh:e.box,type:"switch",id:e.id})),...this._doors.map(e=>({mesh:e.mesh,type:"door",id:e.id})),...this._breakerHit?[{mesh:this._breakerHit,type:"breaker",id:1}]:[]]}_addCol(t,e,s,o,i,a){this._colBoxes.push(new me(new m(t-o/2,e-i/2,s-a/2),new m(t+o/2,e+i/2,s+a/2)))}_checkCol(t){const e=new me(new m(t.x-.32,t.y-1.65,t.z-.32),new m(t.x+.32,t.y+.12,t.z+.32));return this._colBoxes.some(s=>s.intersectsBox(e))}_setupInput(){const t=this._isMob,e=this.root.querySelector("#ex-canvas"),s=i=>{this._keys[i.code]=!0},o=i=>{this._keys[i.code]=!1};if(this._on(window,"keydown",s),this._on(window,"keyup",o),this._on(window,"keydown",i=>{i.code==="KeyE"&&!this._repairOpen&&this._doInteract()}),!t)this._on(e,"click",()=>{!this._pointerLocked&&!this._repairOpen&&e.requestPointerLock()}),this._on(document,"pointerlockchange",()=>{this._pointerLocked=document.pointerLockElement===e;const i=this.root.querySelector("#ex-ptr-msg");i&&(i.style.display=this._pointerLocked?"none":"block")}),this._on(document,"mousemove",i=>{this._pointerLocked&&(this._player.yawVel-=i.movementX*.0022,this._player.pitchVel-=i.movementY*.0022)});else{const i=this.root.querySelector("#ex-joy-outer"),a=this.root.querySelector("#ex-joy-inner");if(i){this._on(i,"touchstart",h=>{if(h.preventDefault(),this._joyId!==-1)return;const d=h.changedTouches[0];this._joyId=d.identifier;const u=i.getBoundingClientRect();this._joyCX=u.left+u.width*.5,this._joyCY=u.top+u.height*.5,this._joyR=u.width*.5,i.classList.add("joy-active")},{passive:!1}),this._on(document,"touchmove",h=>{if(this._joyId!==-1)for(const d of h.changedTouches){if(d.identifier!==this._joyId)continue;const u=d.clientX-this._joyCX,w=d.clientY-this._joyCY,b=Math.hypot(u,w),_=this._joyR*.72,v=Math.min(b,_),E=Math.atan2(w,u);a&&(a.style.transform=`translate(calc(-50% + ${Math.cos(E)*v}px),calc(-50% + ${Math.sin(E)*v}px))`);const M=.18;if(b<this._joyR*M)this._joy.x=0,this._joy.y=0;else{const S=Math.max(0,(v/_-M)/(1-M))*.75;this._joy.x=u/b*S,this._joy.y=w/b*S}}},{passive:!0});const c=h=>{for(const d of h.changedTouches)d.identifier===this._joyId&&(this._joyId=-1,this._joy.x=0,this._joy.y=0,a&&(a.style.transform="translate(-50%,-50%)"),i.classList.remove("joy-active"))};this._on(document,"touchend",c,{passive:!0}),this._on(document,"touchcancel",c,{passive:!0})}const n=this.root.querySelector("#ex-look-zone");if(n){this._on(n,"touchstart",h=>{if(!this._repairOpen){h.preventDefault();for(const d of h.changedTouches)this._lookTouches[d.identifier]={x:d.clientX,y:d.clientY}}},{passive:!1}),this._on(n,"touchmove",h=>{if(this._repairOpen)return;h.preventDefault();const d=.0032;for(const u of h.changedTouches)if(this._lookTouches[u.identifier]){const w=u.clientX-this._lookTouches[u.identifier].x,b=u.clientY-this._lookTouches[u.identifier].y;this._player.yawVel-=w*d,this._player.pitchVel-=b*d,this._lookTouches[u.identifier]={x:u.clientX,y:u.clientY}}},{passive:!1});const c=h=>{for(const d of h.changedTouches)delete this._lookTouches[d.identifier]};this._on(n,"touchend",c,{passive:!1}),this._on(n,"touchcancel",c,{passive:!1})}const r=this.root.querySelector("#ex-btn-interact");r&&this._on(r,"touchstart",c=>{c.preventDefault(),this._repairOpen||this._doInteract()},{passive:!1});const l=this.root.querySelector("#ex-btn-jump");if(l){const c=d=>{d.preventDefault(),this._keys.Space=!0},h=d=>{d.preventDefault(),this._keys.Space=!1};this._on(l,"touchstart",c,{passive:!1}),this._on(l,"touchend",h,{passive:!1})}}}_on(t,e,s,o){t.addEventListener(e,s,o),this._listeners.push([t,e,s,o])}_startLoop(){let t=0;const e=()=>{this._raf=requestAnimationFrame(e);const s=Math.min(this._clock.getDelta(),.05);t+=s,this._repairOpen||this._updatePlayer(s),this._animateDoors(s),this._pulseInteractables(t),this._updateInteractPrompt(),this._drawMinimap(),this._renderer.render(this._scene,this._camera)};this._raf=requestAnimationFrame(e)}_pulseInteractables(t){for(const e of this._outletMeshes){const s=e.group.userData._glow;s&&(s.intensity=.4+Math.sin(t*3.5)*.3);const o=e.group.userData._spark;o&&(o.material.emissiveIntensity=5+Math.sin(t*7.2)*2)}}_animateDoors(t){for(const e of this._doors){const s=e.targetRot-e.pivot.rotation.y;Math.abs(s)>.004?e.pivot.rotation.y+=s*Math.min(1,t*10):e.pivot.rotation.y=e.targetRot}}_updatePlayer(t){const e=this._player,o=this._isMob?.14:.38;e.yaw+=e.yawVel,e.pitch+=e.pitchVel,e.yawVel*=o,e.pitchVel*=o,Math.abs(e.yawVel)<8e-5&&(e.yawVel=0),Math.abs(e.pitchVel)<8e-5&&(e.pitchVel=0),e.pitch=Math.max(-1.38,Math.min(1.38,e.pitch)),this._camera.rotation.order="YXZ",this._camera.rotation.y=e.yaw,this._camera.rotation.x=e.pitch;const i=4.5,a=Math.sin(e.yaw),n=Math.cos(e.yaw),r=new m(-a,0,-n),l=new m(n,0,-a);let c=this._joy.x,h=this._joy.y;(this._keys.KeyW||this._keys.ArrowUp)&&(h=-1),(this._keys.KeyS||this._keys.ArrowDown)&&(h=1),(this._keys.KeyA||this._keys.ArrowLeft)&&(c=-1),(this._keys.KeyD||this._keys.ArrowRight)&&(c=1);const d=new m;if(d.addScaledVector(r,-h).addScaledVector(l,c),d.lengthSq()>0&&d.normalize(),d.lengthSq()>0)e.vel.addScaledVector(d,22*t),e.vel.length()>i&&e.vel.normalize().multiplyScalar(i);else{const v=e.vel.length();v>.01?e.vel.multiplyScalar(Math.max(0,1-18*t/v)):e.vel.set(0,0,0)}e.grounded=e.pos.y<=qt+Zt+.12,e.grounded?(e.vy<0&&(e.vy=0),this._keys.Space&&(e.vy=7,e.grounded=!1)):e.vy-=22*t,e.pos.y+=e.vy*t,e.pos.y<qt+Zt&&(e.pos.y=qt+Zt,e.vy=0,e.grounded=!0);const u=e.pos.clone().addScaledVector(e.vel,t);if(u.x=Math.max(-7.5,Math.min(7.5,u.x)),u.z=Math.max(-31.5,Math.min(7.5,u.z)),!this._checkCol(u))e.pos.copy(u);else{const v=new m(u.x,e.pos.y,e.pos.z);this._checkCol(v)||(e.pos.x=u.x,e.vel.z=0);const E=new m(e.pos.x,e.pos.y,u.z);this._checkCol(E)||(e.pos.z=u.z,e.vel.x=0)}const w=e.vel.length();w>.2?(this._bobT+=t*7*(w/i),this._bobAmt=Math.min(1,this._bobAmt+t*7),U.play("footstep",t)):this._bobAmt=Math.max(0,this._bobAmt-t*6);const _=Math.sin(this._bobT)*.04*this._bobAmt;this._camera.position.set(e.pos.x,e.pos.y+_,e.pos.z)}_updateInteractPrompt(){var d,u,w,b;const e=this._player.pos;let s=null,o=1/0;for(const _ of this._interactMeshes){const v=new m;_.mesh.getWorldPosition(v);const E=e.distanceTo(v);E<2.4&&E<o&&(o=E,s=_)}this._nearest=s;let i="",a=!1;if(s)if(a=!0,s.type==="door"){const _=this._doors.find(v=>v.id===s.id);i=_!=null&&_.open?"🚪 CLOSE DOOR":"🚪 OPEN DOOR"}else if(s.type==="outlet"){const _=(d=this._outlets.find(v=>v.id===s.id))==null?void 0:d.fixed;i=_?"✅ OUTLET OK":"🔧 FIX OUTLET",a=!_}else if(s.type==="switch"){const _=(u=this._switches.find(v=>v.id===s.id))==null?void 0:u.fixed;i=_?"✅ SWITCH OK":"💡 WIRE SWITCH",a=!_}else s.type==="breaker"&&(i=this._breakerFixed?"✅ PANEL OK":"⚠️ RESET BREAKER",a=!this._breakerFixed);s&&!this._repairOpen&&this._guide&&(s.type==="outlet"&&!((w=this._outlets.find(_=>_.id===s.id))!=null&&w.fixed)&&!this._guideTipsFired.outlet?(this._guideTipsFired.outlet=!0,this._guide.show("near_outlet")):s.type==="switch"&&!((b=this._switches.find(_=>_.id===s.id))!=null&&b.fixed)&&!this._guideTipsFired.switch?(this._guideTipsFired.switch=!0,this._guide.show("near_switch")):s.type==="breaker"&&!this._breakerFixed&&!this._guideTipsFired.breaker&&(this._guideTipsFired.breaker=!0,this._guide.show("near_breaker")));const n=this.root.querySelector("#ex-prompt");n&&(n.style.display=s?"block":"none",s&&(n.textContent=i+(this._isMob?"":" [E]")));const r=this.root.querySelector("#ex-btn-interact");if(r){r.classList.toggle("ex-btn-interact--active",a),r.style.display=this._isMob?"flex":"none";const _=r.querySelector(".ex-btn-interact-icon");_&&(_.textContent=s?s.type==="door"?"🚪":s.type==="outlet"?"🔧":"💡":"⚡");const v=this.root.querySelector("#ex-btn-label");v&&(v.textContent=i,v.classList.toggle("show",!!(i&&a)))}const l=this.root.querySelector("#ex-room");if(l){const _=this._player.pos.z;l.textContent=_>=-2?"ENTRANCE":_>=-18?"WORKSHOP A":"WORKSHOP B"}const c=this.root.querySelector("#ex-crosshair");c&&c.classList.toggle("ex-crosshair--hit",!!s);const h=this.root.querySelector("#ex-btn-label");h&&(h.textContent=i,h.classList.toggle("show",a))}_doInteract(){if(!this._nearest)return;const{type:t,id:e}=this._nearest;if(t==="door")this._toggleDoor(e);else if(t==="outlet"){const s=this._outlets.find(o=>o.id===e);if(s!=null&&s.fixed){this._notify("Outlet already fixed!","ok");return}this._openOutletRepair(e)}else if(t==="switch"){const s=this._switches.find(o=>o.id===e);if(s!=null&&s.fixed){this._notify("Switch already installed!","ok");return}this._openSwitchRepair(e)}else t==="breaker"&&this._doFixBreaker()}_doFixBreaker(){if(this._breakerFixed){this._notify("⚡ Breaker panel OK","ok");return}this._openBreakerRepair()}_openBreakerRepair(){if(this._breakerFixed)return;this._repairOpen=!0,document.exitPointerLock&&document.exitPointerLock();const t=this.root.querySelector("#brk-overlay");if(t){t.style.display="flex";const e=t.querySelector("#brk-tripped");e&&(e.onclick=()=>this._fixBreaker(t))}}_fixBreaker(t){if(t&&(t.style.display="none"),this._repairOpen=!1,this._breakerFixed=!0,O.saveExploreBreaker(),O.addXP(100),this._breakerBreakers){const e=this._breakerBreakers.find(s=>s.tripped);e&&(e.mesh.material=this._M.green,e.tripped=!1)}U.play("breaker_click"),U.play("xp_gain"),this._notify("✅ Breaker reset! +100 XP","ok"),this._updateScoreHUD(),this._guide&&this._guide.show("after_fix")}_toggleDoor(t){const e=this._doors.find(s=>s.id===t);e&&(e.open=!e.open,e.targetRot=e.open?-Math.PI/2:0,U.play("door"),this._notify(e.open?"🚪 Door opened":"🚪 Door closed","info"))}_openOutletRepair(t){this._repairOpen=!0,this._repairType="outlet",this._repairId=t,document.exitPointerLock&&document.exitPointerLock(),this._outletScenario||(this._outletScenario=new qs(this.root,(e,s)=>{var a;O.saveExploreOutlet(e),O.addXP(150),(a=this._guide)==null||a.show("after_fix");const o=this._outlets.find(n=>n.id===e);o&&(o.fixed=!0);const i=this._outletMeshes.find(n=>n.id===e);if(i){i.plate.material=this._M.green;const n=i.group.userData._glow;n&&(n.intensity=0,n.color.set(4521864));const r=i.group.userData._spark;r&&(r.visible=!1)}this._updateScoreHUD(),U.play("success"),U.play("xp_gain"),this._notify("⚡ +150 XP — Outlet Fixed!","ok")})),this._outletScenario.open(t)}closeRepair(){var t,e;this._repairOpen=!1,(t=this._outletScenario)==null||t.close(),(e=this._switchScenario)==null||e.close()}_openSwitchRepair(t){this._repairOpen=!0,this._repairType="switch",this._repairId=t,document.exitPointerLock&&document.exitPointerLock(),this._switchScenario||(this._switchScenario=new Ns(this.root,e=>{O.saveExploreSwitch(e),O.addXP(200);const s=this._switches.find(i=>i.id===e);s&&(s.fixed=!0);const o=this._switchMeshes.find(i=>i.id===e);o&&(o.box.material=new g({color:16768324,roughness:.6,emissive:new R(16768324),emissiveIntensity:.5})),U.play("success"),U.play("xp_gain"),this._notify(`✅ Switch #${e} installed! +200 XP`,"ok"),this._updateScoreHUD()})),this._switchScenario.open(t)}_drawMinimap(){const t=this.root.querySelector("#ex-minimap");if(!t)return;const e=t.getContext("2d"),s=t.width,o=t.height;e.clearRect(0,0,s,o);const i=d=>(d+8)*(s/16),a=d=>(d+32)*(o/40);e.fillStyle="rgba(7,16,31,.9)",e.fillRect(0,0,s,o),[{x:-8,z:-2,w:16,d:10,color:"rgba(0,212,255,.12)"},{x:-8,z:-18,w:16,d:16,color:"rgba(42,111,168,.18)"},{x:-8,z:-32,w:16,d:14,color:"rgba(31,90,140,.18)"}].forEach(d=>{e.fillStyle=d.color,e.fillRect(i(d.x),a(d.z),d.w*(s/16),d.d*(o/40))}),this._outlets.forEach(d=>{e.fillStyle=d.fixed?"#2dc653":"#ff5544",e.beginPath(),e.arc(i(d.pos.x),a(d.pos.z),3,0,Math.PI*2),e.fill()}),this._switches.forEach(d=>{e.fillStyle=d.fixed?"#ffdd44":"#ff9900",e.fillRect(i(d.pos.x)-3,a(d.pos.z)-3,6,6)});const n=i(this._player.pos.x),r=a(this._player.pos.z);e.fillStyle="#00d4ff",e.beginPath(),e.arc(n,r,4,0,Math.PI*2),e.fill();const l=this._player.yaw,c=n+Math.sin(-l)*7,h=r+Math.cos(-l)*7;e.strokeStyle="#00d4ff",e.lineWidth=1.5,e.beginPath(),e.moveTo(n,r),e.lineTo(c,h),e.stroke()}_updateScoreHUD(){const t=this._outlets.length+this._switches.length+1,e=this._outlets.filter(o=>o.fixed).length+this._switches.filter(o=>o.fixed).length+(this._breakerFixed?1:0),s=this.root.querySelector("#ex-score");if(s&&(s.textContent=`${e}/${t}`),e>=t&&t>0){const o=this.root.querySelector("#ex-stage-complete");if(o&&!o.classList.contains("show")){const i=this.root.querySelector("#ex-sc-score");i&&(i.textContent=`${e}/${t} Objectives`),setTimeout(()=>o.classList.add("show"),1200),setTimeout(()=>U.play("complete"),1e3),O.saveLearnStage("ways"),this._guide&&this._guide.show("all_done")}}}_notify(t,e="info"){const s=this.root.querySelector("#ex-notify");if(!s)return;const o=document.createElement("div");o.className="ex-notif"+(e==="ok"?" ok":""),o.textContent=t,s.prepend(o),setTimeout(()=>o.remove(),3200)}destroy(){var t,e,s;cancelAnimationFrame(this._raf),this._raf=null,(t=this._ro)==null||t.disconnect();for(const[o,i,a,n]of this._listeners)o.removeEventListener(i,a,n);this._listeners=[],document.exitPointerLock&&document.exitPointerLock(),(e=this._outletScenario)==null||e.destroy(),this._outletScenario=null,(s=this._switchScenario)==null||s.destroy(),this._switchScenario=null,this._scene.traverse(o=>{o.geometry&&o.geometry.dispose(),o.material&&(Array.isArray(o.material)?o.material.forEach(i=>i.dispose()):o.material.dispose())}),this._renderer.dispose()}}const Ds=[{title:"Welcome to the Workshop!",text:"I'm <b>Volt</b>, your guide! Your mission: find and fix every broken outlet and light switch in this building."},{title:"How to Move",textDesktop:"Click the screen to lock your mouse.<br><b>W A S D</b> — walk &nbsp;|&nbsp; <b>Mouse</b> — look<br><b>Space</b> — jump",textMobile:"<b>Joystick</b> (bottom-left) — walk<br>Drag screen — look around<br><b>▲</b> button — jump"},{title:"How to Interact",textDesktop:"Walk up to a glowing outlet or switch.<br>When the label appears, press <b>E</b> to interact.",textMobile:"Walk up to a glowing outlet or switch.<br>When <b>⚡ ACT</b> lights up, tap it to interact."},{title:"What to Look For",text:"🔴 <b>Red sparks</b> — broken outlet, repair it!<br>🔵 <b>Blue glow</b> — switch that needs wiring!<br>⚡ Fix them all to complete the stage!"}],Fs={near_outlet:"Broken outlet nearby! Press E (or tap ACT) to repair it.",near_switch:"Switch needs wiring! Press E (or tap ACT) to install it.",near_breaker:"Tripped breaker panel! Press E (or tap ACT) to reset the circuit.",after_fix:"Nice fix! Keep exploring — find the rest and repair them all!",all_done:"ALL SYSTEMS GO! You fixed everything! You're a certified electrician! 🏆",door:"Tip: Get close to a door and press E to open it."},js=`
/* ── TUTORIAL OVERLAY ───────────────────────────────────────── */
.mg-tutorial{
  position:absolute;inset:0;
  background:rgba(0,4,14,.88);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
  z-index:60;pointer-events:auto;
  animation:mg-fade-in .32s ease both;
}
.mg-tutorial.hiding{animation:mg-fade-out .24s ease both;}
@keyframes mg-fade-in {from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes mg-fade-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.97)}}

/* Card — horizontal layout */
.mg-card{
  display:flex;flex-direction:row;align-items:stretch;
  background:linear-gradient(135deg,rgba(4,14,36,.99) 0%,rgba(2,8,24,.99) 100%);
  border:1px solid rgba(0,212,255,.38);
  border-radius:22px;
  max-width:480px;width:calc(100% - 40px);
  box-shadow:0 0 0 1px rgba(0,212,255,.08),0 0 60px rgba(0,212,255,.18),0 24px 64px rgba(0,0,0,.75);
  overflow:hidden;
  position:relative;
}

/* Left — text content */
.mg-card-left{
  flex:1;
  display:flex;flex-direction:column;justify-content:center;
  padding:26px 22px 22px 26px;
  min-width:0;
}

/* Right — mascot */
.mg-card-right{
  width:130px;flex-shrink:0;
  display:flex;align-items:flex-end;justify-content:center;
  background:linear-gradient(180deg,rgba(0,212,255,.04) 0%,rgba(0,212,255,.10) 100%);
  border-left:1px solid rgba(0,212,255,.14);
  padding:12px 8px 0;
  position:relative;overflow:hidden;
}
.mg-card-right::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:40%;
  background:linear-gradient(0deg,rgba(0,212,255,.08),transparent);
}
.mg-mascot-img{
  width:115px;height:auto;object-fit:contain;
  filter:drop-shadow(0 0 14px rgba(0,212,255,.5));
  animation:mg-float 2.8s ease-in-out infinite;
  position:relative;z-index:1;
}
@keyframes mg-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}

/* Volt name badge */
.mg-volt-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(0,212,255,.12);
  border:1px solid rgba(0,212,255,.3);
  border-radius:20px;padding:3px 10px;
  font-family:'Barlow Condensed',sans-serif;
  font-size:10px;font-weight:800;letter-spacing:.18em;
  color:#00d4ff;text-transform:uppercase;
  margin-bottom:10px;
  width:fit-content;
}

.mg-step-title{
  font-family:'Barlow Condensed',sans-serif;
  font-size:20px;font-weight:800;letter-spacing:.02em;
  color:#fff;margin-bottom:9px;line-height:1.15;
  text-shadow:0 0 24px rgba(0,212,255,.35);
}
.mg-step-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:500;line-height:1.72;
  color:rgba(255,255,255,.72);
  margin-bottom:18px;flex:1;
}
.mg-step-text b{color:#00d4ff;font-weight:700;}

/* Dots */
.mg-dots{display:flex;gap:6px;margin-bottom:16px;}
.mg-dot{
  width:6px;height:6px;border-radius:50%;
  background:rgba(0,212,255,.18);border:1px solid rgba(0,212,255,.35);
  transition:background .25s,transform .25s,width .25s;
}
.mg-dot.active{
  background:#00d4ff;width:18px;border-radius:4px;
  box-shadow:0 0 8px rgba(0,212,255,.6);
}

/* Action row */
.mg-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.mg-skip-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  color:rgba(255,255,255,.28);background:none;border:none;
  cursor:pointer;padding:6px 2px;-webkit-tap-highlight-color:transparent;
  transition:color .15s;text-transform:uppercase;
}
.mg-skip-btn:hover,.mg-skip-btn:active{color:rgba(255,255,255,.6);}
.mg-next-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:800;letter-spacing:.1em;
  color:#000;background:linear-gradient(135deg,#00d4ff 0%,#0096cc 100%);
  border:none;border-radius:10px;padding:10px 20px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 18px rgba(0,212,255,.45),0 4px 10px rgba(0,0,0,.4);
  transition:transform .14s,box-shadow .14s;
  text-transform:uppercase;
}
.mg-next-btn:active{transform:scale(.92);}

/* Step counter */
.mg-step-counter{
  font-family:'Barlow Condensed',sans-serif;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  color:rgba(0,212,255,.45);text-transform:uppercase;
  margin-bottom:4px;
}

/* ── CORNER TIP ─────────────────────────────────────────────── */
.mg-tip{
  position:absolute;bottom:24px;right:16px;
  display:flex;align-items:flex-end;gap:0;
  z-index:45;pointer-events:auto;
  max-width:270px;
  animation:mg-tip-in .35s cubic-bezier(.18,.89,.32,1.28) both;
}
.mg-tip.hiding{animation:mg-tip-out .25s ease-in both;}
@keyframes mg-tip-in {from{opacity:0;transform:translateY(16px) scale(.86);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes mg-tip-out{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(12px);}}

.mg-tip-bubble{
  flex:1;
  background:rgba(3,10,26,.97);
  border:1px solid rgba(0,212,255,.5);
  border-radius:14px 14px 4px 14px;
  padding:10px 13px;
  box-shadow:0 0 24px rgba(0,212,255,.2),0 8px 24px rgba(0,0,0,.65);
  cursor:pointer;position:relative;
}
.mg-tip-bubble::after{
  content:'';position:absolute;bottom:-8px;right:56px;
  width:0;height:0;
  border-left:8px solid transparent;
  border-top:9px solid rgba(0,212,255,.5);
}
.mg-tip-name{
  font-family:'Barlow Condensed',sans-serif;
  font-size:9px;font-weight:800;letter-spacing:.18em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:4px;
}
.mg-tip-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:12px;font-weight:600;line-height:1.5;
  color:rgba(255,255,255,.88);
}
.mg-tip-mascot-wrap{
  width:56px;flex-shrink:0;
  display:flex;align-items:flex-end;justify-content:center;
}
.mg-tip-mascot{
  width:52px;height:auto;object-fit:contain;
  filter:drop-shadow(0 0 8px rgba(0,212,255,.45));
  animation:mg-float 2.8s ease-in-out infinite;
}
`;class Gs{constructor(t){this._root=t,this._tipEl=null,this._tipTimer=null,this._tutEl=null,this._shown=null,this._isMob=navigator.maxTouchPoints>0,this._injectCSS()}_injectCSS(){if(document.querySelector("#mg-css"))return;const t=document.createElement("style");t.id="mg-css",t.textContent=js,document.head.appendChild(t)}showTutorial(t){if(this._tutEl)return;let e=0;const s=Ds,o=s.length,i=document.createElement("div");i.className="mg-tutorial";const a=Array.from({length:o},(b,_)=>`<div class="mg-dot${_===0?" active":""}"></div>`).join("");i.innerHTML=`
      <div class="mg-card">
        <div class="mg-card-left">
          <div class="mg-volt-badge">⚡ Volt — Your Guide</div>
          <div class="mg-step-counter"></div>
          <div class="mg-step-title"></div>
          <div class="mg-step-text"></div>
          <div class="mg-dots">${a}</div>
          <div class="mg-actions">
            <button class="mg-skip-btn">Skip</button>
            <button class="mg-next-btn">Next →</button>
          </div>
        </div>
        <div class="mg-card-right">
          <img class="mg-mascot-img" src="/Mascot.png" alt="Volt" />
        </div>
      </div>
    `;const n=i.querySelector(".mg-next-btn"),r=i.querySelector(".mg-skip-btn"),l=i.querySelector(".mg-step-title"),c=i.querySelector(".mg-step-text"),h=i.querySelector(".mg-step-counter"),d=i.querySelectorAll(".mg-dot"),u=()=>{const b=s[e];h.textContent=`Step ${e+1} of ${o}`,l.textContent=b.title,c.innerHTML=b.text||(this._isMob?b.textMobile:b.textDesktop)||"",d.forEach((_,v)=>_.classList.toggle("active",v===e)),n.textContent=e===o-1?"Let's Go ⚡":"Next →"},w=()=>{i.classList.add("hiding"),setTimeout(()=>{i.remove(),this._tutEl=null},260),t==null||t()};n.addEventListener("click",()=>{e<o-1?(e++,u()):w()}),r.addEventListener("click",w),u(),this._root.appendChild(i),this._tutEl=i}show(t){const e=Fs[t];if(!e||this._shown===t)return;clearTimeout(this._tipTimer),this._tipEl&&(this._tipEl.remove(),this._tipEl=null),this._shown=t;const s=document.createElement("div");s.className="mg-tip",s.innerHTML=`
      <div class="mg-tip-bubble">
        <div class="mg-tip-name">⚡ Volt</div>
        <div class="mg-tip-text">${e}</div>
      </div>
      <div class="mg-tip-mascot-wrap">
        <img class="mg-tip-mascot" src="/Mascot.png" alt="Volt" />
      </div>
    `,s.addEventListener("click",()=>this.hide()),s.addEventListener("touchstart",()=>this.hide(),{passive:!0}),this._root.appendChild(s),this._tipEl=s;const o=t==="all_done"?12e3:6e3;this._tipTimer=setTimeout(()=>this.hide(),o)}hide(){if(!this._tipEl)return;this._tipEl.classList.add("hiding");const t=this._tipEl;this._tipEl=null,this._shown=null,clearTimeout(this._tipTimer),setTimeout(()=>t.remove(),280)}destroy(){var t,e;clearTimeout(this._tipTimer),(t=this._tipEl)==null||t.remove(),(e=this._tutEl)==null||e.remove(),this._tipEl=null,this._tutEl=null}}const Ys=`
.ex-wrap{position:absolute;inset:0;background:#07101f;overflow:hidden;}

/* Main world canvas */
#ex-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}

/* ── TOP HUD BAR ─────────────────────────────────────────────── */
.ex-hud{
  position:absolute;top:0;left:0;right:0;
  height:54px;
  background:linear-gradient(180deg,rgba(2,6,16,.96) 0%,rgba(4,10,24,.82) 100%);
  border-bottom:1px solid rgba(0,212,255,.18);
  box-shadow:0 2px 20px rgba(0,0,0,.7),0 0 40px rgba(0,212,255,.04);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;padding:0 12px;gap:8px;z-index:20;pointer-events:none;
}
.ex-hud-back{
  pointer-events:all;
  background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(0,150,200,.06));
  border:1px solid rgba(0,212,255,.35);
  color:#00d4ff;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;
  padding:8px 14px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 12px rgba(0,212,255,.15),inset 0 1px 0 rgba(255,255,255,.08);
  transition:all .18s;white-space:nowrap;
}
.ex-hud-back:active{transform:scale(.94);background:rgba(0,212,255,.2);}
.ex-hud-room{
  flex:1;text-align:center;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;
  color:rgba(255,255,255,.9);text-transform:uppercase;
  text-shadow:0 0 20px rgba(0,212,255,.4);
}
.ex-hud-score-wrap{display:flex;align-items:center;gap:6px;}
.ex-hud-score{
  font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;
  color:#00d4ff;letter-spacing:1px;
  background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.25);
  padding:4px 10px;border-radius:8px;
}

/* ── MINIMAP ─────────────────────────────────────────────── */
#ex-minimap{
  position:absolute;top:62px;left:12px;
  width:110px;height:110px;border-radius:12px;
  border:1px solid rgba(0,212,255,.35);
  background:rgba(2,6,16,.85);
  box-shadow:0 0 16px rgba(0,212,255,.12),0 4px 12px rgba(0,0,0,.5);
  z-index:15;
}
.ex-minimap-label{
  position:absolute;top:180px;left:12px;
  font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;
  letter-spacing:3px;color:rgba(0,212,255,.45);text-transform:uppercase;
  z-index:15;pointer-events:none;
}

/* ── CROSSHAIR (desktop) ─────────────────────────────────── */
#ex-crosshair{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;pointer-events:none;z-index:15;}
#ex-crosshair::before,#ex-crosshair::after{content:'';position:absolute;background:rgba(255,255,255,.65);border-radius:1px;}
#ex-crosshair::before{width:2px;height:100%;left:50%;transform:translateX(-50%);}
#ex-crosshair::after{width:100%;height:2px;top:50%;transform:translateY(-50%);}
#ex-crosshair.ex-crosshair--hit::before,#ex-crosshair.ex-crosshair--hit::after{background:#00d4ff;box-shadow:0 0 8px #00d4ff;}

/* ── INTERACTION PROMPT (desktop) ─────────────────────────── */
#ex-prompt{
  position:absolute;bottom:58%;left:50%;transform:translateX(-50%);
  background:rgba(2,6,16,.94);
  border:1px solid rgba(0,212,255,.6);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;
  letter-spacing:2px;padding:8px 20px;border-radius:10px;
  z-index:15;display:none;pointer-events:none;white-space:nowrap;
  box-shadow:0 0 20px rgba(0,212,255,.25);
}

/* ── NOTIFICATIONS ───────────────────────────────────────── */
#ex-notify{position:absolute;top:62px;right:12px;width:200px;z-index:15;pointer-events:none;}
.ex-notif{
  background:rgba(2,6,16,.94);border:1px solid rgba(0,212,255,.2);
  border-radius:10px;padding:8px 14px;
  font-family:'Barlow Condensed',sans-serif;font-size:13px;color:#aab8cc;
  margin-bottom:5px;
  animation:exNotifIn .2s ease-out,exNotifFade 3.2s ease forwards;
  box-shadow:0 4px 12px rgba(0,0,0,.4);
}
@keyframes exNotifIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
@keyframes exNotifFade{0%,65%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(12px);}}
.ex-notif.ok{color:#44ff88;border-color:rgba(68,255,136,.35);background:rgba(2,20,8,.94);}
.ex-notif.info{color:#60b0ff;border-color:rgba(96,176,255,.3);}

/* ── DESKTOP HINT ────────────────────────────────────────── */
#ex-ptr-msg{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);font-family:'Barlow Condensed',sans-serif;font-size:12px;color:rgba(255,255,255,.3);letter-spacing:2px;z-index:10;pointer-events:none;}


/* ══════════════════════════════════════════════════════════
   MOBILE CONTROLS — REDESIGNED
   ══════════════════════════════════════════════════════════ */

/* Look zone covers full screen but is behind controls */
.ex-look-zone{position:absolute;inset:0;z-index:15;touch-action:none;}

/* ── JOYSTICK ────────────────────────────────────────────── */
.ex-joy-outer{
  position:absolute;bottom:32px;left:24px;
  width:140px;height:140px;border-radius:50%;
  /* Multi-layer ring design */
  background:radial-gradient(circle at 50% 50%,
    rgba(0,212,255,.04) 0%,
    rgba(0,212,255,.02) 60%,
    transparent 100%);
  border:2px solid rgba(0,212,255,.18);
  box-shadow:
    0 0 0 1px rgba(0,212,255,.06),
    inset 0 0 30px rgba(0,212,255,.04),
    0 8px 32px rgba(0,0,0,.5);
  z-index:20;touch-action:none;
  transition:border-color .15s,box-shadow .15s,background .15s;
}
/* Inner dashed guide ring */
.ex-joy-outer::before{
  content:'';position:absolute;inset:12px;border-radius:50%;
  border:1px dashed rgba(0,212,255,.1);
}
/* Outer pulse ring */
.ex-joy-outer::after{
  content:'';position:absolute;inset:-6px;border-radius:50%;
  border:1px solid rgba(0,212,255,.06);
}
.ex-joy-outer.joy-active{
  background:radial-gradient(circle at 50% 50%,
    rgba(0,212,255,.1) 0%,
    rgba(0,212,255,.04) 60%,
    transparent 100%);
  border-color:rgba(0,212,255,.45);
  box-shadow:
    0 0 0 1px rgba(0,212,255,.12),
    0 0 24px rgba(0,212,255,.18),
    inset 0 0 30px rgba(0,212,255,.06),
    0 8px 32px rgba(0,0,0,.5);
}
/* Thumb nub */
.ex-joy-inner{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:56px;height:56px;border-radius:50%;
  background:radial-gradient(circle at 38% 32%,
    rgba(0,220,255,.55) 0%,
    rgba(0,160,220,.35) 45%,
    rgba(0,80,140,.4) 100%);
  border:2px solid rgba(0,212,255,.7);
  box-shadow:
    0 4px 16px rgba(0,0,0,.6),
    0 0 20px rgba(0,212,255,.3),
    inset 0 1px 0 rgba(255,255,255,.2),
    inset 0 -2px 6px rgba(0,0,0,.3);
  transition:box-shadow .1s;
}
.ex-joy-outer.joy-active .ex-joy-inner{
  box-shadow:
    0 4px 16px rgba(0,0,0,.6),
    0 0 28px rgba(0,212,255,.55),
    inset 0 1px 0 rgba(255,255,255,.25),
    inset 0 -2px 6px rgba(0,0,0,.3);
}
/* Directional arrows on joystick */
.ex-joy-arrows{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
}
.ex-joy-arrows::before,.ex-joy-arrows::after{
  content:'';position:absolute;
  border:solid rgba(0,212,255,.18);
}
.ex-joy-arrows::before{
  width:0;height:0;
  border-width:6px 4px;border-style:solid;border-color:rgba(0,212,255,.18) transparent transparent transparent;
  top:12px;left:50%;transform:translateX(-50%);
  border-top-color:rgba(0,212,255,.25);
}

/* ── INTERACT BUTTON ─────────────────────────────────────── */
.ex-btn-interact{
  position:absolute;bottom:38px;right:22px;
  width:86px;height:86px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,
    rgba(0,30,60,.9) 0%,
    rgba(0,16,38,.95) 100%);
  border:2.5px solid rgba(0,212,255,.22);
  color:rgba(0,212,255,.38);
  display:flex;align-items:center;justify-content:center;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none;
  flex-direction:column;gap:2px;
  box-shadow:
    0 6px 24px rgba(0,0,0,.6),
    inset 0 1px 0 rgba(255,255,255,.07),
    inset 0 -2px 8px rgba(0,0,0,.4);
  transition:all .18s cubic-bezier(.4,0,.2,1);
}
.ex-btn-interact:active{transform:scale(.92);}
.ex-btn-interact--active{
  border-color:rgba(0,212,255,.75) !important;
  background:radial-gradient(circle at 40% 35%,
    rgba(0,60,100,.9) 0%,
    rgba(0,30,70,.95) 100%) !important;
  color:#00d4ff !important;
  box-shadow:
    0 0 0 3px rgba(0,212,255,.12),
    0 0 28px rgba(0,212,255,.5),
    0 0 60px rgba(0,212,255,.18),
    0 6px 24px rgba(0,0,0,.5),
    inset 0 1px 0 rgba(255,255,255,.12) !important;
  animation:ex-btn-pulse 1.1s ease-in-out infinite;
}
@keyframes ex-btn-pulse{
  0%,100%{box-shadow:0 0 0 3px rgba(0,212,255,.1),0 0 22px rgba(0,212,255,.4),0 6px 20px rgba(0,0,0,.5);}
  50%{box-shadow:0 0 0 5px rgba(0,212,255,.18),0 0 38px rgba(0,212,255,.65),0 6px 20px rgba(0,0,0,.5);}
}
.ex-btn-interact-icon{font-size:28px;line-height:1;}
.ex-btn-interact-txt{
  font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;opacity:.7;
}

/* ── ACTION LABEL ABOVE INTERACT ─────────────────────────── */
#ex-btn-label{
  position:absolute;bottom:132px;right:16px;
  background:rgba(2,6,16,.95);
  border:1px solid rgba(0,212,255,.55);
  color:#00d4ff;font-family:'Barlow Condensed',sans-serif;
  font-size:12px;font-weight:700;letter-spacing:.1em;
  padding:5px 13px;border-radius:20px;z-index:22;
  pointer-events:none;white-space:nowrap;text-align:center;
  opacity:0;transform:translateY(4px);
  transition:opacity .2s,transform .2s;
  box-shadow:0 0 16px rgba(0,212,255,.25);
}
#ex-btn-label.show{opacity:1;transform:translateY(0);}

/* ── JUMP BUTTON ─────────────────────────────────────────── */
.ex-btn-jump{
  position:absolute;bottom:42px;right:118px;
  width:58px;height:58px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,rgba(30,30,60,.9),rgba(10,10,30,.95));
  border:2px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.55);
  font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none;
  box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);
  transition:all .15s;
}
.ex-btn-jump:active{transform:scale(.9);border-color:rgba(255,255,255,.3);}

/* ── ALWAYS-VISIBLE MENU BUTTON (mobile) ─────────────────── */
.ex-menu-fab{
  position:absolute;top:64px;right:12px;
  width:42px;height:42px;border-radius:12px;
  background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(0,100,180,.08));
  border:1px solid rgba(0,212,255,.32);
  color:#00d4ff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  z-index:20;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 0 14px rgba(0,212,255,.12),0 4px 12px rgba(0,0,0,.45);
  transition:all .18s;
}
.ex-menu-fab:active{transform:scale(.88);background:rgba(0,212,255,.22);}
.ex-menu-fab-line{width:18px;height:2px;background:#00d4ff;border-radius:1px;opacity:.85;transition:opacity .2s;}
.ex-menu-fab-label{font-family:'Barlow Condensed',sans-serif;font-size:7px;font-weight:700;letter-spacing:1px;color:rgba(0,212,255,.7);}


/* ══════════════════════════════════════════════════════════════════
   OUTLET REPAIR OVERLAY — matches Electric Copy scenarios/outlet-repair.html
   ══════════════════════════════════════════════════════════════════ */
#or-overlay{
  position:absolute;inset:0;background:#1a1814;
  display:none;z-index:30;overflow:hidden;
}
#or-canvas{
  display:block;width:100%;height:100%;position:absolute;inset:0;
}
#or-hud{
  position:absolute;inset:0;pointer-events:none;z-index:10;
  font-family:'Barlow Condensed',sans-serif;
}

/* Top bar */
#or-topbar{
  position:absolute;top:0;left:0;right:0;display:flex;align-items:center;
  justify-content:space-between;padding:14px 20px;
  background:linear-gradient(to bottom,rgba(0,0,0,.7) 0%,transparent 100%);
}
.or-tb-title{
  font-size:13px;font-weight:700;letter-spacing:.15em;
  color:#00d4ff;text-transform:uppercase;
}
.or-tb-stats{display:flex;gap:16px;}
.or-tb-stat{
  display:flex;align-items:center;gap:6px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:6px;padding:5px 12px;font-size:16px;font-weight:700;color:#fff;
}
.or-back-btn{
  padding:6px 14px;border-radius:6px;
  background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.4);
  color:#00d4ff;font-size:12px;font-weight:700;letter-spacing:.1em;
  cursor:pointer;pointer-events:all;-webkit-tap-highlight-color:transparent;
}

/* Mission panel */
#or-mission-panel{
  position:absolute;top:60px;left:18px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:14px 18px;min-width:230px;pointer-events:none;
}
.or-mp-header{
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:10px;
}
.or-mp-task{
  display:flex;align-items:center;gap:9px;font-size:12px;
  margin-bottom:6px;color:rgba(255,255,255,.45);
}
.or-mp-task.active{color:#fff;}
.or-mp-task.done{color:#22c55e;text-decoration:line-through;}
.or-mp-dot{
  width:9px;height:9px;border-radius:50%;
  border:2px solid currentColor;flex-shrink:0;
}
.or-mp-task.done  .or-mp-dot{background:#22c55e;border-color:#22c55e;}
.or-mp-task.active .or-mp-dot{background:#00d4ff;border-color:#00d4ff;animation:or-pulse 1s infinite;}
@keyframes or-pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* Progress panel */
#or-progress-wrap{
  position:absolute;top:60px;right:18px;
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:12px 16px;min-width:130px;
}
.or-pw-label{font-size:10px;font-weight:700;letter-spacing:.12em;color:#00d4ff;text-transform:uppercase;margin-bottom:8px;}
.or-pw-bar-bg{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;}
.or-pw-bar{height:100%;background:#00d4ff;border-radius:99px;transition:width .5s ease;width:0%;}
.or-pw-pct{font-size:22px;font-weight:900;margin-top:4px;color:#fff;}

/* Instruction bar */
#or-instruction{
  position:absolute;bottom:90px;left:50%;transform:translateX(-50%);
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:10px;padding:10px 20px;font-size:14px;font-weight:500;
  text-align:center;pointer-events:none;max-width:480px;
  transition:opacity .3s;line-height:1.6;color:#fff;
}
#or-instruction span{color:#00d4ff;}
.or-snum{
  display:inline-block;background:#00d4ff;color:#000;
  font-size:11px;font-weight:900;padding:1px 7px;
  border-radius:4px;margin-right:5px;letter-spacing:.06em;
}

/* Wire panel */
#or-wire-panel{
  position:absolute;bottom:90px;left:50%;transform:translateX(-50%);
  background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);
  border-radius:14px;padding:18px 24px;display:none;pointer-events:auto;
  min-width:320px;transition:box-shadow .4s,border-color .4s;
}
#or-wire-panel.hi{
  box-shadow:0 0 28px rgba(0,212,255,.55);
  border-color:rgba(0,212,255,.85);
  animation:or-wire-glow 1.8s ease-in-out infinite;
}
@keyframes or-wire-glow{
  0%,100%{box-shadow:0 0 14px rgba(0,212,255,.35);}
  50%{box-shadow:0 0 32px rgba(0,212,255,.7);}
}
.or-wp-title{
  font-size:12px;font-weight:700;letter-spacing:.12em;color:#00d4ff;
  text-transform:uppercase;margin-bottom:14px;text-align:center;
}
.or-wire-rows{display:flex;flex-direction:column;gap:10px;}
.or-wire-row-ui{display:flex;align-items:center;gap:10px;}
.or-wire-draggable{
  padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;
  cursor:grab;color:#fff;user-select:none;transition:all .2s;
  border:1.5px solid rgba(255,255,255,.2);min-width:80px;text-align:center;
}
.or-wire-draggable:hover{transform:scale(1.05);box-shadow:0 0 10px rgba(255,255,255,.2);}
.or-wire-draggable.used{opacity:.3;pointer-events:none;}
.or-wire-line-ui{flex:1;height:3px;border-radius:2px;}
.or-wire-term{
  width:44px;height:30px;border-radius:6px;border:2px dashed;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;cursor:pointer;transition:all .25s;
}
.or-wire-term.connected{border-style:solid;}
.or-wire-term.reject{animation:or-shake .3s;}
@keyframes or-shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}

/* Toolbar */
#or-toolbar{
  position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
  display:flex;gap:8px;background:rgba(0,0,0,.7);
  border:1px solid rgba(255,255,255,.1);border-radius:12px;
  padding:8px;pointer-events:auto;
}
.or-tool-slot{
  width:56px;height:56px;border-radius:8px;
  background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  cursor:pointer;transition:all .2s;font-size:22px;gap:2px;
}
.or-tool-slot:hover{border-color:#00d4ff;background:rgba(0,212,255,.1);}
.or-tool-slot.active{border-color:#00d4ff;background:rgba(0,212,255,.18);box-shadow:0 0 12px rgba(0,212,255,.3);}
.or-tool-slot.disabled{opacity:.25;pointer-events:none;}
.or-tool-name{font-size:9px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.6);}
.or-tool-slot.active .or-tool-name{color:#00d4ff;}

/* Toast */
#or-toast{
  position:absolute;top:60px;left:50%;transform:translateX(-50%);
  padding:9px 20px;border-radius:30px;font-size:13px;font-weight:600;
  opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;color:#fff;
}
#or-toast.show{opacity:1;}
#or-toast.ok{background:rgba(34,197,94,.2);border:1px solid #22c55e;color:#22c55e;}
#or-toast.err{background:rgba(239,68,68,.18);border:1px solid #ef4444;color:#ef4444;}
#or-toast.info{background:rgba(59,130,246,.2);border:1px solid #3b82f6;color:#3b82f6;}

/* Camera hint */
#or-cam-hint{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:rgba(0,0,0,.6);border:1px solid #00d4ff;border-radius:8px;
  padding:8px 16px;font-size:14px;color:#00d4ff;opacity:0;
  transition:opacity .4s;pointer-events:none;letter-spacing:.05em;
}
#or-cam-hint.show{opacity:1;}

/* Tutorial ring */
#or-tgt-ring{
  position:absolute;pointer-events:none;z-index:25;
  width:72px;height:72px;border-radius:50%;
  border:3px solid #00d4ff;transform:translate(-50%,-50%);
  display:none;box-shadow:0 0 18px rgba(0,212,255,.55);
}
#or-tgt-pulse{
  position:absolute;pointer-events:none;z-index:24;
  width:72px;height:72px;border-radius:50%;
  border:2px solid rgba(0,212,255,.55);
  transform:translate(-50%,-50%);
  animation:or-ring-pulse 1.3s ease-out infinite;display:none;
}
@keyframes or-ring-pulse{
  0%{transform:translate(-50%,-50%) scale(1);opacity:.85;}
  100%{transform:translate(-50%,-50%) scale(2.1);opacity:0;}
}
#or-tgt-label{
  position:absolute;pointer-events:none;z-index:26;
  background:rgba(0,0,0,.82);border:1px solid #00d4ff;color:#00d4ff;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  padding:3px 11px;border-radius:4px;
  transform:translateX(-50%);display:none;white-space:nowrap;
  animation:or-tap-bounce .7s ease-in-out infinite alternate;
}
@keyframes or-tap-bounce{from{transform:translateX(-50%) translateY(0);}to{transform:translateX(-50%) translateY(8px);}}
#or-breaker-tip{
  position:absolute;pointer-events:none;z-index:27;
  background:rgba(0,0,0,.8);border:1px solid rgba(0,212,255,.5);
  color:rgba(255,255,255,.9);font-size:10px;font-weight:700;
  letter-spacing:.1em;padding:4px 10px;border-radius:5px;
  transform:translateX(-50%);display:none;white-space:nowrap;
}

/* Multimeter reading */
#or-reading{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;
  padding:22px 36px;text-align:center;display:none;z-index:30;
  pointer-events:none;min-width:200px;
}
#or-reading.show{display:block;}
.or-rd-label{font-size:10px;letter-spacing:.2em;color:rgba(255,255,255,.45);text-transform:uppercase;margin-bottom:10px;}
.or-rd-val{font-size:58px;font-weight:900;color:#22c55e;line-height:1;font-variant-numeric:tabular-nums;}
.or-rd-unit{font-size:18px;color:rgba(255,255,255,.5);margin-top:6px;}

/* Success overlay */
#or-success-overlay{
  position:absolute;inset:0;background:rgba(0,0,0,.75);
  display:none;align-items:center;justify-content:center;
  flex-direction:column;gap:16px;pointer-events:auto;z-index:35;
}
#or-success-overlay.show{display:flex;}
.or-so-big{font-size:80px;font-weight:900;color:#22c55e;line-height:1;}
.or-so-sub{font-size:16px;color:rgba(255,255,255,.7);}
.or-so-score{font-size:26px;font-weight:700;color:#00d4ff;}
.or-so-btn{
  margin-top:10px;padding:12px 32px;border-radius:8px;
  background:#00d4ff;color:#000;font-size:18px;font-weight:900;
  letter-spacing:.08em;border:none;cursor:pointer;transition:transform .15s;
}
.or-so-btn:hover{transform:scale(1.04);}
#or-socket-label{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.05em;}

/* ══════════════════════════════════════════════════════════════════
   SWITCH INSTALL OVERLAY
   ══════════════════════════════════════════════════════════════════ */
#sw-overlay{position:absolute;inset:0;background:#080a0d;display:none;z-index:30;overflow:hidden;}
#sw-canvas{display:block;width:100%;height:100%;position:absolute;inset:0;}
#sw-hud{position:absolute;inset:0;pointer-events:none;z-index:10;font-family:'Barlow Condensed',sans-serif;}
#sw-topbar{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:linear-gradient(to bottom,rgba(0,0,0,.7) 0%,transparent 100%);}
#sw-mission-panel{position:absolute;top:60px;left:18px;background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:14px 18px;min-width:230px;pointer-events:none;}
#sw-progress-wrap{position:absolute;top:60px;right:18px;background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:12px 16px;min-width:130px;}
#sw-instruction{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.3);border-radius:10px;padding:10px 20px;font-size:14px;font-weight:500;text-align:center;pointer-events:none;max-width:480px;transition:opacity .3s;line-height:1.6;color:#fff;}
#sw-instruction span{color:#00d4ff;}
.sw-snum{display:inline-block;background:#00d4ff;color:#000;font-size:11px;font-weight:900;padding:1px 7px;border-radius:4px;margin-right:5px;letter-spacing:.06em;}
#sw-wire-panel{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(10,10,14,.88);border:1px solid rgba(0,212,255,.5);border-radius:14px;padding:18px 24px;display:none;pointer-events:auto;min-width:320px;box-shadow:0 0 28px rgba(0,212,255,.3);}
.sw-wire-term{width:44px;height:30px;border-radius:6px;border:2px dashed;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;transition:all .25s;}
.sw-wire-term.reject{animation:or-shake .3s;}
.sw-used{opacity:.3!important;pointer-events:none!important;}
#sw-flip-ui{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:12px;pointer-events:auto;}
.sw-flip-btn{padding:14px 40px;border-radius:8px;background:#00d4ff;color:#000;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:.08em;border:none;cursor:pointer;transition:transform .15s,box-shadow .15s;}
.sw-flip-btn:hover{transform:scale(1.04);box-shadow:0 0 20px rgba(0,212,255,.5);}
#sw-toolbar{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px;pointer-events:auto;}
#sw-toast{position:absolute;top:60px;left:50%;transform:translateX(-50%);padding:9px 20px;border-radius:30px;font-size:13px;font-weight:600;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;color:#fff;}
#sw-toast.show{opacity:1;}
#sw-toast.ok{background:rgba(34,197,94,.2);border:1px solid #22c55e;color:#22c55e;}
#sw-toast.err{background:rgba(239,68,68,.18);border:1px solid #ef4444;color:#ef4444;}
#sw-toast.info{background:rgba(59,130,246,.2);border:1px solid #3b82f6;color:#3b82f6;}
#sw-cam-hint{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.6);border:1px solid #00d4ff;border-radius:8px;padding:8px 16px;font-size:14px;color:#00d4ff;opacity:0;transition:opacity .4s;pointer-events:none;letter-spacing:.05em;}
#sw-cam-hint.show{opacity:1;}
#sw-tgt-ring{position:absolute;pointer-events:none;z-index:25;width:72px;height:72px;border-radius:50%;border:3px solid #00d4ff;transform:translate(-50%,-50%);display:none;box-shadow:0 0 18px rgba(0,212,255,.55);}
#sw-tgt-pulse{position:absolute;pointer-events:none;z-index:24;width:72px;height:72px;border-radius:50%;border:2px solid rgba(0,212,255,.55);transform:translate(-50%,-50%);animation:or-ring-pulse 1.3s ease-out infinite;display:none;}
#sw-tgt-label{position:absolute;pointer-events:none;z-index:26;background:rgba(0,0,0,.82);border:1px solid #00d4ff;color:#00d4ff;font-size:11px;font-weight:700;letter-spacing:.12em;padding:3px 11px;border-radius:4px;transform:translateX(-50%);display:none;white-space:nowrap;animation:or-tap-bounce .7s ease-in-out infinite alternate;}
#sw-reading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(5,20,10,.95);border:2px solid #22c55e;border-radius:14px;padding:22px 36px;text-align:center;display:none;z-index:30;pointer-events:none;min-width:200px;}
#sw-reading.show{display:block;}
#sw-success-overlay{position:absolute;inset:0;background:rgba(0,0,0,.75);display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;pointer-events:auto;z-index:35;}
#sw-success-overlay.show{display:flex;}
#sw-light-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 65% 35%,rgba(255,240,100,.18) 0%,transparent 70%);opacity:0;transition:opacity 1.2s ease;z-index:5;}
#sw-light-glow.on{opacity:1;}

/* ── STAGE COMPLETE OVERLAY ────────────────────────────────────────── */
#ex-stage-complete{
  position:absolute;inset:0;background:rgba(0,2,10,.88);
  display:none;align-items:center;justify-content:center;
  flex-direction:column;z-index:50;pointer-events:auto;
}
#ex-stage-complete.show{display:flex;}
.ex-sc-inner{text-align:center;animation:ex-sc-in .6s ease-out;}
@keyframes ex-sc-in{from{transform:scale(.82);opacity:0;}to{transform:scale(1);opacity:1;}}
.ex-sc-bolt{font-size:72px;margin-bottom:8px;filter:drop-shadow(0 0 24px #00d4ff);}
.ex-sc-title{font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;
  color:#00d4ff;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;
  text-shadow:0 0 32px rgba(0,212,255,.6);}
.ex-sc-sub{font-family:'Barlow Condensed',sans-serif;font-size:18px;color:rgba(255,255,255,.65);margin-bottom:14px;}
.ex-sc-score{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;
  color:#00d4ff;margin-bottom:28px;border:1px solid rgba(0,212,255,.3);
  padding:8px 24px;border-radius:8px;background:rgba(0,212,255,.06);}
.ex-sc-btn{padding:14px 52px;border-radius:8px;background:#00d4ff;color:#000;
  font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;
  letter-spacing:.1em;border:none;cursor:pointer;transition:transform .15s,box-shadow .15s;
  box-shadow:0 0 24px rgba(0,212,255,.4);}
.ex-sc-btn:hover{transform:scale(1.04);box-shadow:0 0 36px rgba(0,212,255,.65);}
`;function Xs(){if(document.querySelector("#ex-css"))return;const f=document.createElement("style");f.id="ex-css",f.textContent=Ys,document.head.appendChild(f)}class Vs{constructor(t){this.state=t,this._scene=null,this.container=this._build()}_build(){Xs();const t=navigator.maxTouchPoints>0,e=document.createElement("div");e.className="screen screen-hidden",e.innerHTML=`
      <div class="ex-wrap">
        <canvas id="ex-canvas"></canvas>

        <!-- HUD -->
        <div class="ex-hud">
          <button class="ex-hud-back">← MENU</button>
          <span class="ex-hud-room" id="ex-room">ENTRANCE</span>
          <div class="ex-hud-score-wrap">
            <span class="ex-hud-score" id="ex-score">0/8</span>
          </div>
        </div>

        <!-- Minimap -->
        <canvas id="ex-minimap" width="110" height="110"></canvas>

        <!-- Prompt -->
        <div id="ex-prompt">🔧 FIX [E]</div>

        <!-- Notify log -->
        <div id="ex-notify"></div>

        <!-- Crosshair (desktop) -->
        ${t?"":'<div id="ex-crosshair"></div>'}

        <!-- Desktop hint -->
        ${t?"":'<div id="ex-ptr-msg">CLICK TO LOOK · WASD MOVE · E INTERACT</div>'}


        <!-- Mobile controls -->
        ${t?`
          <div class="ex-look-zone" id="ex-look-zone"></div>
          <div class="ex-joy-outer" id="ex-joy-outer">
            <div class="ex-joy-arrows"></div>
            <div class="ex-joy-inner" id="ex-joy-inner"></div>
          </div>
          <div id="ex-btn-label"></div>
          <div class="ex-btn-interact" id="ex-btn-interact">
            <div class="ex-btn-interact-icon">⚡</div>
            <div class="ex-btn-interact-txt">ACT</div>
          </div>
          <div class="ex-btn-jump" id="ex-btn-jump">▲</div>
          <div class="ex-menu-fab" id="ex-mob-menu">
            <div class="ex-menu-fab-line"></div>
            <div class="ex-menu-fab-line"></div>
            <div class="ex-menu-fab-line"></div>
          </div>
        `:""}

        <!-- ═══════ OUTLET REPAIR OVERLAY ═══════ -->
        <div id="or-overlay">
          <!-- 3D canvas (own renderer) -->
          <canvas id="or-canvas"></canvas>

          <!-- HUD layer -->
          <div id="or-hud">
            <!-- Top bar -->
            <div id="or-topbar">
              <div class="or-tb-title">⚡ Outlet Repair</div>
              <div class="or-tb-stats">
                <div class="or-tb-stat"><span>⏱</span><span id="or-timer">05:00</span></div>
              </div>
              <button class="or-back-btn" id="or-back-btn">✕ CANCEL</button>
            </div>

            <!-- Mission panel -->
            <div id="or-mission-panel">
              <div class="or-mp-header">🔧 Broken Electrical Outlet</div>
              <div class="or-mp-task active" id="or-t1"><div class="or-mp-dot"></div>Turn OFF breaker</div>
              <div class="or-mp-task" id="or-t2"><div class="or-mp-dot"></div>Remove cover screw</div>
              <div class="or-mp-task" id="or-t3"><div class="or-mp-dot"></div>Open outlet cover</div>
              <div class="or-mp-task" id="or-t4"><div class="or-mp-dot"></div>Inspect wires</div>
              <div class="or-mp-task" id="or-t5"><div class="or-mp-dot"></div>Reconnect wires</div>
              <div class="or-mp-task" id="or-t6"><div class="or-mp-dot"></div>Close outlet</div>
              <div class="or-mp-task" id="or-t7"><div class="or-mp-dot"></div>Turn ON breaker</div>
              <div class="or-mp-task" id="or-t8"><div class="or-mp-dot"></div>Test with multimeter</div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:rgba(255,255,255,.4)">
                Steps: <span id="or-done-count">0</span>/8
              </div>
              <div id="or-socket-label" style="margin-top:4px;">Socket #1 — Lobby</div>
            </div>

            <!-- Progress panel -->
            <div id="or-progress-wrap">
              <div class="or-pw-label">Progress</div>
              <div class="or-pw-bar-bg"><div class="or-pw-bar" id="or-pw-bar"></div></div>
              <div class="or-pw-pct"><span id="or-pw-pct">0</span>%</div>
            </div>

            <!-- Instruction bar -->
            <div id="or-instruction">
              <span class="or-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>
            </div>

            <!-- Wire panel -->
            <div id="or-wire-panel">
              <div class="or-wp-title">Connect Wires — PH Type A (Red=Live, Black=Neutral)</div>
              <div class="or-wire-rows">
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="or-wd-red"
                       style="background:#7f1d1d;border-color:#dc2626" draggable="true">RED (Live)</div>
                  <div class="or-wire-line-ui" style="background:#dc2626;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">Live</div>
                  <div class="or-wire-term" id="or-wt-red"
                       style="border-color:#dc2626;color:#dc2626" draggable="false">L</div>
                </div>
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="or-wd-black"
                       style="background:#1c1c1c;border-color:#666" draggable="true">BLACK (Neutral)</div>
                  <div class="or-wire-line-ui" style="background:#666;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">Neutral</div>
                  <div class="or-wire-term" id="or-wt-black"
                       style="border-color:#666;color:#aaa" draggable="false">N</div>
                </div>
              </div>
            </div>

            <!-- Toolbar -->
            <div id="or-toolbar">
              <div class="or-tool-slot disabled" id="or-tool-screwdriver">🔧<div class="or-tool-name">SCREWDRIVER</div></div>
              <div class="or-tool-slot disabled" id="or-tool-pliers">🔩<div class="or-tool-name">PLIERS</div></div>
              <div class="or-tool-slot disabled" id="or-tool-multimeter">📊<div class="or-tool-name">MULTIMETER</div></div>
            </div>

            <!-- Toast & cam hint -->
            <div id="or-toast"></div>
            <div id="or-cam-hint"></div>

            <!-- Tutorial ring -->
            <div id="or-tgt-ring"></div>
            <div id="or-tgt-pulse"></div>
            <div id="or-tgt-label">TAP HERE</div>
            <div id="or-breaker-tip"></div>

            <!-- Voltage reading -->
            <div id="or-reading">
              <div class="or-rd-label">Voltage Reading</div>
              <div class="or-rd-val" id="or-rd-val">---</div>
              <div class="or-rd-unit">Volts AC</div>
            </div>

            <!-- Success overlay -->
            <div id="or-success-overlay">
              <div class="or-so-big">✓ FIXED!</div>
              <div class="or-so-sub">Outlet repaired and tested successfully.</div>
              <div class="or-so-score" id="or-so-score">Score: 0 pts</div>
              <button class="or-so-btn" id="or-replay-btn">PLAY AGAIN</button>
            </div>
          </div>
        </div>

        <!-- ═══════ BREAKER REPAIR OVERLAY ═══════ -->
        <div id="brk-overlay" style="
          display:none;position:absolute;inset:0;background:rgba(0,0,0,.85);
          z-index:40;align-items:center;justify-content:center;flex-direction:column;gap:18px;
          font-family:'Barlow Condensed',sans-serif;
        ">
          <div style="font-size:36px;">⚡</div>
          <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:.12em;">TRIPPED BREAKER</div>
          <div style="font-size:13px;color:rgba(255,255,255,.55);text-align:center;max-width:280px;line-height:1.6;">
            Breaker #3 has tripped. Tap it to reset and restore power.
          </div>
          <div id="brk-panel" style="
            display:grid;grid-template-columns:1fr 1fr;gap:10px;
            background:rgba(10,20,40,.95);border:1px solid rgba(0,212,255,.3);
            border-radius:14px;padding:20px 24px;
          ">
            ${[...Array(8)].map((o,i)=>i===2?`<div id="brk-tripped" style="
                  width:72px;height:44px;border-radius:8px;
                  background:#ef4444;border:2px solid #ff6666;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:800;color:#fff;letter-spacing:.08em;
                  cursor:pointer;box-shadow:0 0 18px rgba(255,50,50,.6);
                  animation:brkPulse 1s infinite;
                ">TRIP #3</div>`:`<div style="
                  width:72px;height:44px;border-radius:8px;
                  background:${i<6?"#22c55e":"rgba(255,255,255,.1)"};
                  border:1px solid rgba(255,255,255,.15);
                  display:flex;align-items:center;justify-content:center;
                  font-size:10px;color:rgba(255,255,255,.4);
                ">#${i+1}</div>`).join("")}
          </div>
          <style>@keyframes brkPulse{0%,100%{box-shadow:0 0 12px rgba(255,50,50,.5);}50%{box-shadow:0 0 28px rgba(255,50,50,.9);}}</style>
          <button id="brk-cancel" style="
            padding:8px 24px;border-radius:8px;background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.45);
            font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;
            letter-spacing:.1em;cursor:pointer;
          ">✕ CANCEL</button>
        </div>

        <!-- ═══════ STAGE COMPLETE OVERLAY ═══════ -->
        <div id="ex-stage-complete">
          <div class="ex-sc-inner">
            <div class="ex-sc-bolt">⚡</div>
            <div class="ex-sc-title">STAGE COMPLETE</div>
            <div class="ex-sc-sub">All electrical systems repaired!</div>
            <div class="ex-sc-score" id="ex-sc-score">8/8 Objectives</div>
            <button class="ex-sc-btn" id="ex-sc-btn">CONTINUE →</button>
          </div>
        </div>

        <!-- ═══════ SWITCH INSTALL OVERLAY ═══════ -->
        <div id="sw-overlay">
          <canvas id="sw-canvas"></canvas>
          <div id="sw-hud">
            <div id="sw-topbar">
              <div class="or-tb-title">💡 Switch Install</div>
              <div class="or-tb-stats">
                <div class="or-tb-stat"><span>⏱</span><span id="sw-timer">08:00</span></div>
              </div>
              <button class="or-back-btn" id="sw-back-btn">✕ CANCEL</button>
            </div>
            <div id="sw-mission-panel">
              <div class="or-mp-header">🔌 Light Switch Install — PH Standard</div>
              <div class="or-mp-task active" id="sw-s1"><div class="or-mp-dot"></div>Turn OFF breaker</div>
              <div class="or-mp-task" id="sw-s2"><div class="or-mp-dot"></div>Mount switch to wall box</div>
              <div class="or-mp-task" id="sw-s3"><div class="or-mp-dot"></div>Connect RED wire (COM/Live)</div>
              <div class="or-mp-task" id="sw-s4"><div class="or-mp-dot"></div>Connect BLACK wire (L1/Output)</div>
              <div class="or-mp-task" id="sw-s5"><div class="or-mp-dot"></div>Secure all terminals</div>
              <div class="or-mp-task" id="sw-s6"><div class="or-mp-dot"></div>Turn ON breaker</div>
              <div class="or-mp-task" id="sw-s7"><div class="or-mp-dot"></div>Flip switch</div>
              <div class="or-mp-task" id="sw-s8"><div class="or-mp-dot"></div>Test with multimeter</div>
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:rgba(255,255,255,.4)">
                Steps: <span id="sw-done-count">0</span>/8
              </div>
              <div id="sw-label" style="margin-top:4px;font-size:11px;color:rgba(255,255,255,.4);"></div>
            </div>
            <div id="sw-progress-wrap">
              <div class="or-pw-label">Progress</div>
              <div class="or-pw-bar-bg"><div class="or-pw-bar" id="sw-pw-bar"></div></div>
              <div class="or-pw-pct"><span id="sw-pw-pct">0</span>%</div>
            </div>
            <div id="sw-instruction">
              <span class="sw-snum">STEP 1</span>Find the <span>breaker panel</span> on the left — tap to switch it <span>OFF</span>
            </div>
            <div id="sw-wire-panel">
              <div class="or-wp-title">Connect Wires — PH Switch (Red=COM, Black=L1)</div>
              <div class="or-wire-rows">
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="sw-wd-red"
                       style="background:#7f1d1d;border-color:#dc2626" draggable="true">RED (COM/Live)</div>
                  <div class="or-wire-line-ui" style="background:#dc2626;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">COM</div>
                  <div class="sw-wire-term" id="sw-wt-red"
                       style="border-color:#dc2626;color:#dc2626" draggable="false">COM</div>
                </div>
                <div class="or-wire-row-ui">
                  <div class="or-wire-draggable" id="sw-wd-black"
                       style="background:#1c1c1c;border-color:#666" draggable="true">BLACK (L1/Output)</div>
                  <div class="or-wire-line-ui" style="background:#666;opacity:.6"></div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5);min-width:36px;text-align:right">L1</div>
                  <div class="sw-wire-term" id="sw-wt-black"
                       style="border-color:#666;color:#aaa" draggable="false">L1</div>
                </div>
              </div>
            </div>
            <div id="sw-flip-ui">
              <div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase">Flip the switch to test</div>
              <button class="sw-flip-btn" id="sw-flip-btn">⬆ FLIP SWITCH</button>
            </div>
            <div id="sw-toolbar">
              <div class="or-tool-slot disabled" id="sw-tool-mount">📐<div class="or-tool-name">MOUNT</div></div>
              <div class="or-tool-slot disabled" id="sw-tool-pliers">🔩<div class="or-tool-name">PLIERS</div></div>
              <div class="or-tool-slot disabled" id="sw-tool-multimeter">📊<div class="or-tool-name">METER</div></div>
            </div>
            <div id="sw-toast"></div>
            <div id="sw-cam-hint"></div>
            <div id="sw-tgt-ring"></div>
            <div id="sw-tgt-pulse"></div>
            <div id="sw-tgt-label">TAP HERE</div>
            <div id="sw-reading">
              <div class="or-rd-label">Voltage Reading</div>
              <div class="or-rd-val" id="sw-rd-val">---</div>
              <div class="or-rd-unit">Volts AC</div>
            </div>
            <div id="sw-success-overlay">
              <div class="or-so-big">✓ WIRED!</div>
              <div class="or-so-sub">Switch installed and light verified.</div>
              <div class="or-so-score" id="sw-so-score">Score: 0 pts</div>
              <button class="or-so-btn" id="sw-replay-btn">PLAY AGAIN</button>
            </div>
            <div id="sw-light-glow"></div>
          </div>
        </div>

      </div>`,e.querySelector(".ex-hud-back").addEventListener("click",()=>{var o;(o=this._scene)==null||o.destroy(),this._scene=null,this.state.setState("stagesHub")});const s=e.querySelector("#ex-mob-menu");return s&&s.addEventListener("touchstart",o=>{var i;o.preventDefault(),(i=this._scene)==null||i.destroy(),this._scene=null,this.state.setState("stagesHub")},{passive:!1}),e.querySelector("#or-back-btn").addEventListener("click",()=>{var o;(o=this._scene)==null||o.closeRepair()}),e.querySelector("#sw-back-btn").addEventListener("click",()=>{var o;(o=this._scene)==null||o.closeRepair()}),e.querySelector("#ex-sc-btn").addEventListener("click",()=>{var o,i;(o=this._scene)==null||o.destroy(),this._scene=null,(i=this._guide)==null||i.destroy(),this._guide=null,this.state.setState("stagesHub")}),e.querySelector("#brk-cancel").addEventListener("click",()=>{e.querySelector("#brk-overlay").style.display="none",this._scene&&(this._scene._repairOpen=!1)}),this._el=e,e}onShow(){if(!this._scene){const t=this._el.querySelector(".ex-wrap");this._guide=new Gs(t),this._scene=new $s(this.state,t,this._guide),this._guide.showTutorial()}}onHide(){var t,e;(t=this._scene)==null||t.destroy(),this._scene=null,(e=this._guide)==null||e.destroy(),this._guide=null}}const Us={splash:"splash",loading:"loading",nameEntry:"nameEntry",menu:"menu",settings:"settings",achievements:"achievements",tools:"tools",credits:"credits",wireLearn:"wireLearn",wireTypes:"wireTypes",electricianTools:"electricianTools",wireStripping:"wireStripping",stagesHub:"stagesHub",outletLesson:"outletLesson",learnOutlet:"learnOutlet",ways:"ways",switchInstallation:"switchInstallation",explore:"explore",game:null};class Ks{constructor(t){this.state=t,this.root=null,this.screens={},this.currentScreen=null,this._busy=!1}init(){this.root=document.getElementById("ui-root"),this.screens={splash:new Ze(this.state),loading:new Je(this.state),nameEntry:new es(this.state),menu:new is(this.state),settings:new ns(this.state),achievements:new rs(this.state),tools:new ls(this.state),credits:new hs(this.state),wireLearn:new us(this.state),wireTypes:new xs(this.state),electricianTools:new ks(this.state),wireStripping:new Es(this.state),stagesHub:new Is(this.state),outletLesson:new Os(this.state),learnOutlet:new fe(this.state,{key:"learnOutlet",src:"/learn-outlet.html",title:"FIX THE FAULTS",backState:"stagesHub"}),ways:new fe(this.state,{key:"ways",src:"/ways.html",title:"SWITCH WAYS",backState:"stagesHub"}),switchInstallation:new fe(this.state,{key:"switchInstallation",src:"/switch_installation.html",title:"SWITCH INSTALLATION",backState:"stagesHub"}),explore:new Vs(this.state)};for(const t of Object.values(this.screens))this.root.appendChild(t.container);this.state.on("stateChange",({from:t,to:e,payload:s})=>this._onChange(t,e,s))}_onChange(t,e,s){const o=Us[e];if(e==="game"){this.currentScreen&&(this._hide(this.currentScreen),this.currentScreen=null);return}o!==void 0&&this._go(o,s)}_go(t,e){var s,o;if(!this._busy){if(!this.currentScreen){this._show(t,e);return}if(this.currentScreen===t){(o=(s=this.screens[t])==null?void 0:s.onShow)==null||o.call(s,e);return}this._busy=!0,this._hide(this.currentScreen,()=>{this._show(t,e),this._busy=!1})}}_show(t,e){var o;const s=this.screens[t];s&&((o=s.onShow)==null||o.call(s,e),s.container.classList.remove("screen-hidden","screen-exit"),s.container.offsetWidth,s.container.classList.add("screen-visible"),this.currentScreen=t)}_hide(t,e){const s=this.screens[t];if(!s){e==null||e();return}s.container.classList.remove("screen-visible"),s.container.classList.add("screen-exit");let o=!1;const i=()=>{var n;o||(o=!0,clearTimeout(a),s.container.classList.remove("screen-exit"),s.container.classList.add("screen-hidden"),(n=s.onHide)==null||n.call(s),e==null||e())};s.container.addEventListener("transitionend",i,{once:!0});const a=setTimeout(i,380)}}class Qs{constructor(t,e,s){this.renderer=t,this.loop=e,this.state=s,this._scene=null,this._camera=null,this._active=!1,this._hud=null,this._levelData=null,this._t=0,this._lampFill=null}init(){this._buildScene(),this._buildHUD(),window.addEventListener("resize",()=>this._onResize()),this.state.on("stateChange",({to:t,payload:e})=>{this._active=t==="game",this._hud.style.display=this._active?"flex":"none",this._active&&e&&(this._levelData=e)})}_buildScene(){this._scene=new mt,this._scene.background=new R(658968),this._scene.fog=new Wt(658968,.022),this._camera=new xt(58,window.innerWidth/window.innerHeight,.1,100),this._camera.position.set(0,2.8,6.5),this._camera.lookAt(0,-.4,0),oe(this._scene);const{lampFill:t}=ie(this._scene,{benchY:-.64,benchW:12,benchD:5.5});this._lampFill=t;const e=-.49;[13378082,14211288,1744452,2250171].forEach((r,l)=>{const c=new p(new k(.055,.055,2.4,20),new g({color:r,roughness:.55,metalness:.05,emissive:r,emissiveIntensity:.04}));c.rotation.z=Math.PI/2,c.position.set(-1.5+l*1,e+.055,.4),c.castShadow=!0,this._scene.add(c),[-1,1].forEach(h=>{const d=new p(new k(.038,.038,.14,12),new g({color:13928762,roughness:.15,metalness:.95,emissive:13928762,emissiveIntensity:.12}));d.rotation.z=Math.PI/2,d.position.set(-1.5+l*1+h*1.27,e+.055,.4),this._scene.add(d)})});const o=document.createElement("canvas");o.width=256,o.height=160;const i=o.getContext("2d");i.fillStyle="#0d3320",i.fillRect(0,0,256,160),i.strokeStyle="#00aa44",i.lineWidth=1.5,[[20,20,200,20],[20,20,20,140],[200,20,200,60],[20,60,120,60],[120,60,120,140],[120,100,200,100]].forEach(([r,l,c,h])=>{i.beginPath(),i.moveTo(r,l),i.lineTo(c,h),i.stroke()}),i.fillStyle="#00ff66",[[20,20],[200,20],[20,60],[120,60],[200,100],[120,140]].forEach(([r,l])=>{i.beginPath(),i.arc(r,l,4,0,Math.PI*2),i.fill()});const a=new ft(o),n=new p(new y(2.2,.04,1.4),new g({map:a,color:865056,roughness:.7,metalness:.15}));n.position.set(2.5,e+.02,-.8),n.castShadow=!0,this._scene.add(n)}_buildHUD(){this._hud=document.createElement("div"),this._hud.id="game-hud",this._hud.style.display="none",this._hud.innerHTML=`
      <div class="hud-top">
        <button class="hud-btn" id="hud-menu">${N.back} MENU</button>
        <div class="hud-progress">
          <div class="hud-bar-track">
            <div class="hud-bar-fill" id="hud-fill" style="width:60%"></div>
          </div>
          <span id="hud-pct">60%</span>
        </div>
        <button class="hud-btn" id="hud-pause">${N.pause}</button>
      </div>
      <div class="hud-task">
        <div class="hud-task-title">TASK</div>
        <p class="hud-task-text">
          Connect the <strong>yellow wire</strong> from the battery
          <strong>positive (+)</strong> to the switch.
        </p>
      </div>
    `,document.getElementById("ui-root").appendChild(this._hud),this._hud.querySelector("#hud-menu").addEventListener("click",()=>{this.state.setState("menu")})}update(t){this._active&&(this._t+=t,this._lampFill&&(this._lampFill.intensity=.65+Math.sin(this._t*3.1)*.04),this.renderer.instance.render(this._scene,this._camera))}_onResize(){this._camera&&(this._camera.aspect=window.innerWidth/window.innerHeight,this._camera.updateProjectionMatrix())}}class Zs{constructor(){this.state=new Ve,this.loop=new Ue,this.renderer=new Ke,this.input=new Qe,this.ui=new Ks(this.state),this.scene=new Qs(this.renderer,this.loop,this.state),this.db=O}init(){this.renderer.init(),this.input.init(),this.ui.init(),this.scene.init(),this.state.on("stateChange",({from:t,to:e})=>{e==="game"?(this.renderer.show(),this.loop.start()):t==="game"&&(this.renderer.hide(),this.loop.stop())}),this.loop.add(t=>this.scene.update(t)),this.state.setState("splash")}}U.init();const Js=new Zs;Js.init();
