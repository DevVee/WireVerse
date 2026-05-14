var Pt=Object.defineProperty;var qt=(u,e,t)=>e in u?Pt(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t;var rt=(u,e,t)=>qt(u,typeof e!="symbol"?e+"":e,t);import{W as Me,A as Ve,D as de,M as f,a as p,B as y,P as Se,C as k,S as Ee,b as he,T as N,c as Ke,d as gt,e as Nt,f as Je,g as D,R as et,V as v,h as Pe,i as qe,j as we,k as L,F as Ne,l as Ce,m as bt,n as tt,G as A,o as ae,p as Qe,q as Ze,r as j,s as It,t as At,u as Xe,v as Ht,w as Bt,x as $e,y as zt,z as Wt,E as $t,H as Dt,I as jt,L as Ft,J as Gt,K as Xt,N as vt}from"./three-3F7DNUQf.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();class Ut{constructor(){this._state=null,this._payload=null,this._listeners={}}get state(){return this._state}get payload(){return this._payload}setState(e,t=null){const s=this._state;this._state=e,this._payload=t,this._emit("stateChange",{from:s,to:e,payload:t})}on(e,t){return this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push(t),()=>this.off(e,t)}off(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(s=>s!==t))}_emit(e,t){const s=this._listeners[e];if(s)for(const o of s)o(t)}}class Yt{constructor(){this._callbacks=[],this._running=!1,this._raf=null,this._lastTime=0,this._tick=this._tick.bind(this)}add(e){this._callbacks.push(e)}remove(e){this._callbacks=this._callbacks.filter(t=>t!==e)}start(){this._running||(this._running=!0,this._lastTime=performance.now(),this._raf=requestAnimationFrame(this._tick))}stop(){this._running=!1,this._raf&&(cancelAnimationFrame(this._raf),this._raf=null)}_tick(e){if(!this._running)return;const t=Math.min((e-this._lastTime)/1e3,.1);this._lastTime=e;for(const s of this._callbacks)s(t,e);this._raf=requestAnimationFrame(this._tick)}}class Vt{constructor(){this.canvas=null,this._renderer=null}init(){this.canvas=document.getElementById("game-canvas"),this._renderer=new Me({canvas:this.canvas,antialias:!1,powerPreference:"high-performance",alpha:!1,stencil:!1,depth:!0}),this._renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this._renderer.setSize(window.innerWidth,window.innerHeight),this._renderer.shadowMap.enabled=!1,window.addEventListener("resize",()=>this._onResize()),this.hide()}show(){this.canvas.style.display="block"}hide(){this.canvas.style.display="none"}get instance(){return this._renderer}_onResize(){this._renderer.setSize(window.innerWidth,window.innerHeight)}}class Kt{constructor(){this._touches=new Map,this._listeners={}}init(){document.addEventListener("touchstart",e=>this._onTouchStart(e),{passive:!0}),document.addEventListener("touchend",e=>this._onTouchEnd(e),{passive:!0}),document.addEventListener("touchmove",e=>this._onTouchMove(e),{passive:!0})}on(e,t){return this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push(t),()=>this.off(e,t)}off(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(s=>s!==t))}_onTouchStart(e){for(const t of e.changedTouches)this._touches.set(t.identifier,{x:t.clientX,y:t.clientY});this._emit("touchstart",e)}_onTouchMove(e){this._emit("touchmove",e)}_onTouchEnd(e){for(const t of e.changedTouches)this._touches.delete(t.identifier);this._emit("touchend",e)}_emit(e,t){const s=this._listeners[e];if(s)for(const o of s)o(t)}get activeTouches(){return this._touches}}class Qt{constructor(e){this.state=e,this._timer=null,this.container=this._build()}_build(){const e=document.createElement("div");return e.className="screen screen-hidden splash-screen",e.innerHTML=`
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
    `,e}onShow(){clearTimeout(this._timer),this._timer=setTimeout(()=>this.state.setState("loading"),2200)}onHide(){clearTimeout(this._timer)}}const _t="wv2_player",De=200;function lt(){return{playerName:null,xp:0,level:1,loginStreak:0,lastLoginDate:null,learnProgress:{wireTypes:!1,electricianTools:!1,wireStripping:!1},learnStages:{wireTypes:!1,wireStripping:!1,electricianTools:!1,outlet:!1,learnOutlet:!1,ways:!1,switchInstallation:!1},exploreOutlets:{},exploreSwitches:{},exploreBreakerFixed:!1,scenarioScores:{},settings:{masterVolume:80,music:70,sfx:90,vibration:!0,tutorialHints:!0,darkMode:!0}}}class C{static load(){if(this._cache)return this._cache;try{const e=localStorage.getItem(_t);return e?(this._cache=this._merge(lt(),JSON.parse(e)),this._cache):(this._cache=lt(),this._cache)}catch{return this._cache=lt(),this._cache}}static save(e){this._cache=e;try{localStorage.setItem(_t,JSON.stringify(e))}catch{}}static patch(e){const s={...this.load(),...e};return this.save(s),s}static isFirstLaunch(){return!this.load().playerName}static setPlayerName(e){return this.patch({playerName:e.trim()})}static getPlayerName(){return this.load().playerName||"Player"}static checkLoginStreak(){const e=this.load(),t=new Date().toDateString();if(e.lastLoginDate===t)return e;const s=new Date(Date.now()-864e5).toDateString(),o=e.lastLoginDate===s?e.loginStreak+1:1,i=25*Math.min(o,7);return this.patch({loginStreak:o,lastLoginDate:t,xp:(e.xp||0)+i})}static saveSettings(e){const t=this.load();t.settings={...t.settings,...e},this.save(t)}static completeLesson(e){const t=this.load();return t.learnProgress||(t.learnProgress={}),t.learnProgress[e]=!0,this.save(t),t}static getLessonProgress(){return this.load().learnProgress||{}}static saveLearnStage(e){const t=this.load();return t.learnStages||(t.learnStages={}),t.learnStages[e]=!0,this.save(t),t}static getLearnStage(e){var t;return!!((t=this.load().learnStages)!=null&&t[e])}static isLearnStageUnlocked(e){return!0}static isExploreModeUnlocked(){return!0}static saveExploreOutlet(e){const t=this.load();t.exploreOutlets||(t.exploreOutlets={}),t.exploreOutlets[e]=!0,this.save(t)}static saveExploreSwitch(e){const t=this.load();t.exploreSwitches||(t.exploreSwitches={}),t.exploreSwitches[e]=!0,this.save(t)}static getExploreProgress(){const e=this.load();return{outletCount:Object.keys(e.exploreOutlets||{}).length,switchCount:Object.keys(e.exploreSwitches||{}).length,outlets:e.exploreOutlets||{},switches:e.exploreSwitches||{}}}static xpForLevel(e){return(e-1)*De}static levelFromXP(e){return Math.floor(e/De)+1}static xpProgressInLevel(e){return e%De}static addXP(e){const s=(this.load().xp||0)+e,o=this.levelFromXP(s);return this.patch({xp:s,level:o})}static saveScenarioScore(e,t){const s=this.load();s.scenarioScores||(s.scenarioScores={});const o=s.scenarioScores[e]||0;return t>o&&(s.scenarioScores[e]=t,this.save(s)),s}static getScenarioScore(e){var t;return((t=this.load().scenarioScores)==null?void 0:t[e])||0}static saveExploreBreaker(){return this.patch({exploreBreakerFixed:!0})}static getStats(){const e=this.load(),t=e.xp||0,s=e.level||1;return{xp:t,level:s,xpInLevel:this.xpProgressInLevel(t),xpToNext:De,loginStreak:e.loginStreak}}static _merge(e,t){const s={...e};for(const o of Object.keys(t))t[o]&&typeof t[o]=="object"&&!Array.isArray(t[o])?s[o]=this._merge(e[o]||{},t[o]):s[o]=t[o];return s}}rt(C,"_cache",null);const yt=["Check your connections carefully. Every wire matters!","Yellow wires carry positive current — plan your route!","A short circuit can blow the fuse. Stay alert.","Stars are awarded based on accuracy and completion speed."];class Zt{constructor(e){this.state=e,this.container=this._build()}_build(){const e=document.createElement("div");return e.className="screen screen-hidden loading-screen",e.innerHTML=`
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
    `,e}onShow(){const e=yt[Math.floor(Math.random()*yt.length)];this.container.querySelector("#ld-tip").textContent="TIP: "+e,this._run()}_run(){const e=this.container.querySelector("#ld-fill"),t=this.container.querySelector("#ld-pct");let s=0,o=0;const i=()=>{const a=Math.random()*14+6;if(s=Math.min(s+a,100),o+=140,e.style.width=`${s}%`,t.textContent=`${Math.floor(s)}%`,s>=100&&o>=1e3){setTimeout(()=>{C.isFirstLaunch()?this.state.setState("nameEntry"):(C.checkLoginStreak(),this.state.setState("menu"))},350);return}setTimeout(i,140+Math.random()*60)};i()}}const Z=(u,e=18,t=18)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${u}</svg>`,H={settings:Z('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),achievements:Z('<path d="M7 21h10M12 21v-4"/><path d="M17 5H7v8a5 5 0 0 0 10 0V5z"/><path d="M7 5H4v5h3M17 5h3v5h-3"/>'),tools:Z('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),credits:Z('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/>'),exit:Z('<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>'),learn:Z('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),back:Z('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),audio:Z('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'),pause:Z('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'),hint:Z('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),user:Z('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),check:Z('<polyline points="20 6 9 17 4 12"/>')};function Rt(u=""){return`<div class="wv-logo" ${u?`style="font-size:${u}"`:""}>WIRE<span class="wv-bolt"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 18" width="0.55em" height="0.9em"><polygon points="7,0 0,10 6,10 3,18 10,8 4,8" fill="#ffa500"/></svg></span>VERSE</div>`}class Jt{constructor(e){this.state=e,this.container=this._build(),this._input=this.container.querySelector("#ne-input")}_build(){const e=document.createElement("div");e.className="screen screen-hidden name-entry-screen",e.innerHTML=`
      <div class="ne-bg-grid"></div>
      <div class="ne-content">

        ${Rt("clamp(42px, 11vw, 64px)")}
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
    `;const t=e.querySelector("#ne-start"),s=e.querySelector("#ne-input"),o=()=>{const i=s.value.trim();if(!i){s.classList.add("ne-input--shake"),setTimeout(()=>s.classList.remove("ne-input--shake"),500);return}C.setPlayerName(i),C.checkLoginStreak(),this.state.setState("menu")};return t.addEventListener("click",o),s.addEventListener("keydown",i=>{i.key==="Enter"&&o()}),e}onShow(){setTimeout(()=>{var e;return(e=this._input)==null?void 0:e.focus()},350)}}const es=[{id:"learn",label:"LEARN",icon:H.learn,state:"stagesHub",primary:!0},{id:"settings",label:"SETTINGS",icon:H.settings,state:"settings"},{id:"achievements",label:"ACHIEVEMENTS",icon:H.achievements,state:"achievements"},{id:"tools",label:"TOOLS",icon:H.tools,state:"tools"},{id:"credits",label:"CREDITS",icon:H.credits,state:"credits"},{id:"exit",label:"EXIT",icon:H.exit,state:"exit",danger:!0}];class ts{constructor(e){this.state=e,this.container=this._build()}_build(){const e=es.map(s=>`
      <button
        class="mm-btn ${s.primary?"mm-btn--play":""} ${s.danger?"mm-btn--exit":""}"
        data-state="${s.state}">
        <span class="mm-btn-icon">${s.icon}</span>
        <span class="mm-btn-label">${s.label}</span>
      </button>`).join(""),t=document.createElement("div");return t.className="screen screen-hidden main-menu-screen",t.innerHTML=`
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
          <nav class="mm-nav">${e}</nav>
        </div>

        <div class="mm-right">
          <div class="mm-mascot-wrap">
            <div class="mm-mascot-light"></div>
            <img src="/Mascot.png" alt="Volt" class="mm-mascot-img" draggable="false" />
          </div>
        </div>
      </div>
    `,t.querySelectorAll(".mm-btn").forEach(s=>{s.addEventListener("click",()=>{var i,a,n,r;const o=s.dataset.state;if(o==="exit"){(r=(n=(a=(i=window.Capacitor)==null?void 0:i.Plugins)==null?void 0:a.App)==null?void 0:n.exitApp)==null||r.call(n);return}this.state.setState(o)})}),this._el=t,t}onShow(){const e=C.load(),t=C.getStats(),s=e.playerName||"Player",o=Math.round(t.xpInLevel/t.xpToNext*100),i=C.getExploreProgress(),a=i.outletCount,n=i.switchCount;this._el.querySelector("#mm-player-badge").innerHTML=`
      <span class="mm-player-icon">${H.user}</span>
      <div class="mm-player-info">
        <span class="mm-player-name">${s.toUpperCase()}</span>
        <div class="mm-xp-bar-wrap">
          <div class="mm-xp-bar" style="width:${o}%"></div>
        </div>
      </div>
      <span class="mm-level-badge">LVL ${t.level}</span>
    `,this._el.querySelector("#mm-stats").innerHTML=`
      <div class="mm-stat mm-stat-explore">
        <span class="mm-stat-icon">⚡</span>
        <span class="mm-stat-val">${a+n}/8</span>
      </div>
    `}}let te=null,Le=null,ce=null,Te=null,me=null,Oe=null,je=0,kt=!1;function ct(){return te||(te=new(window.AudioContext||window.webkitAudioContext),Te=te.createGain(),me=te.createGain(),Oe=te.createGain(),me.connect(Te),Oe.connect(Te),Te.connect(te.destination),Ot()),te}function Ot(){const u=C.load().settings||{},e=(u.masterVolume??80)/100,t=(u.sfx??90)/100,s=(u.music??70)/100;Te&&(Te.gain.value=e),me&&(me.gain.value=t),Oe&&(Oe.gain.value=s)}function Ie(u,e,t,s=.18){const o=u.sampleRate*e,i=u.createBuffer(1,o,u.sampleRate),a=i.getChannelData(0);for(let c=0;c<o;c++)a[c]=Math.random()*2-1;const n=u.createBufferSource();n.buffer=i;const r=u.createBiquadFilter();r.type="bandpass",r.frequency.value=t,r.Q.value=.8;const l=u.createGain();l.gain.setValueAtTime(s,u.currentTime),l.gain.exponentialRampToValueAtTime(1e-4,u.currentTime+e),n.connect(r),r.connect(l),l.connect(me),n.start(),n.stop(u.currentTime+e)}function be(u,e,t,s="sine",o=.25,i=.01,a=null){const n=u.createOscillator(),r=u.createGain();n.type=s,n.frequency.value=e;const l=a??t*.6;return r.gain.setValueAtTime(0,u.currentTime),r.gain.linearRampToValueAtTime(o,u.currentTime+i),r.gain.setValueAtTime(o,u.currentTime+t-l),r.gain.exponentialRampToValueAtTime(1e-4,u.currentTime+t),n.connect(r),r.connect(me),n.start(),n.stop(u.currentTime+t),n}const G={init(){if(kt)return;kt=!0;const u=()=>{ct(),te.state==="suspended"&&te.resume()};document.addEventListener("click",u,{once:!0}),document.addEventListener("touchstart",u,{once:!0,passive:!0}),document.addEventListener("keydown",u,{once:!0})},applySettings(){te&&Ot()},play(u,e){try{const t=ct();switch(t.state==="suspended"&&t.resume(),u){case"footstep":{if(je=(je||0)+(e||.016),je<.4)return;je=0,Ie(t,.08,70+Math.random()*30,.32),setTimeout(()=>Ie(t,.04,260+Math.random()*80,.14),12);break}case"door":{const s=t.createOscillator(),o=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(90,t.currentTime),s.frequency.exponentialRampToValueAtTime(30,t.currentTime+.55),o.gain.setValueAtTime(.18,t.currentTime),o.gain.exponentialRampToValueAtTime(1e-4,t.currentTime+.55),s.connect(o),o.connect(me),s.start(),s.stop(t.currentTime+.55),Ie(t,.18,3e3,.06);break}case"interact_click":{be(t,800,.08,"square",.15,.005,.07);break}case"success":{[392,493.88,587.33].forEach((o,i)=>{setTimeout(()=>be(t,o,.5,"sine",.18,.02,.35),i*80)});break}case"error":{be(t,120,.22,"sawtooth",.2,.005,.18);break}case"xp_gain":{be(t,1200,.14,"sine",.14,.01,.1),setTimeout(()=>be(t,1600,.12,"sine",.1,.01,.09),80);break}case"breaker_click":{Ie(t,.025,2e3,.22),setTimeout(()=>Ie(t,.1,80,.28),20);break}case"complete":{[261.63,329.63,392,523.25].forEach((o,i)=>{setTimeout(()=>be(t,o,.7,"sine",.2,.02,.5),i*110)}),setTimeout(()=>{[523.25,659.25,783.99].forEach(o=>be(t,o,1.2,"sine",.18,.05,.9))},550);break}}}catch{}},startAmbient(){try{const u=ct();if(Le)return;const e=u.createOscillator();e.type="sine",e.frequency.value=60;const t=u.createOscillator();t.type="sine",t.frequency.value=120;const s=u.createBuffer(1,u.sampleRate*2,u.sampleRate),o=s.getChannelData(0);for(let c=0;c<o.length;c++)o[c]=Math.random()*2-1;const i=u.createBufferSource();i.buffer=s,i.loop=!0;const a=u.createBiquadFilter();a.type="lowpass",a.frequency.value=400,ce=u.createGain(),ce.gain.value=0;const n=u.createGain();n.gain.value=.055;const r=u.createGain();r.gain.value=.02;const l=u.createGain();l.gain.value=.03,e.connect(n),n.connect(ce),t.connect(r),r.connect(ce),i.connect(a),a.connect(l),l.connect(ce),ce.connect(Oe),e.start(),t.start(),i.start(),Le={hum:e,hum2:t,fan:i},ce.gain.linearRampToValueAtTime(1,u.currentTime+2.5)}catch{}},stopAmbient(){try{if(!Le||!te)return;ce==null||ce.gain.linearRampToValueAtTime(0,te.currentTime+1.2);const u=Le;Le=null,setTimeout(()=>{try{u.hum.stop(),u.hum2.stop(),u.fan.stop()}catch{}},1300)}catch{}}},ss=[{id:"profile",label:"PROFILE",icon:H.user},{id:"audio",label:"AUDIO",icon:H.audio}];class is{constructor(e){this.state=e,this._data={},this._activeTab="profile",this.container=this._build()}_build(){const e=document.createElement("div");return e.className="screen screen-hidden settings-screen",e.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="stg-back">${H.back}</button>
        <h2 class="hdr-title">SETTINGS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="stg-body">
        <div class="stg-tabs" id="stg-tabs">
          ${ss.map((t,s)=>`
            <button class="stg-tab ${s===0?"stg-tab--active":""}" data-tab="${t.id}">
              <span class="stg-tab-icon">${t.icon}</span>
              <span class="stg-tab-label">${t.label}</span>
            </button>`).join("")}
        </div>
        <div class="stg-content" id="stg-content"></div>
      </div>
    `,e.querySelector("#stg-back").addEventListener("click",()=>this.state.setState("menu")),e.querySelector("#stg-tabs").addEventListener("click",t=>{const s=t.target.closest("[data-tab]");s&&(this._activeTab=s.dataset.tab,e.querySelectorAll(".stg-tab").forEach(o=>o.classList.toggle("stg-tab--active",o.dataset.tab===this._activeTab)),this._renderContent(e))}),this._el=e,e}onShow(){this._data={...C.load().settings},this._renderContent()}_renderContent(e){const t=(e||this._el).querySelector("#stg-content");this._activeTab==="profile"?this._renderProfile(t):this._activeTab==="audio"?this._renderAudio(t):t.innerHTML=`<div class="stg-placeholder">${this._activeTab.charAt(0).toUpperCase()+this._activeTab.slice(1)} settings — coming soon</div>`}_renderProfile(e){const t=C.getPlayerName();e.innerHTML=`
      <div class="stg-profile">
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
                value="${t}"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>

          <button class="stg-save-btn" id="stg-save-name">
            ${H.check} SAVE NAME
          </button>

          <div class="stg-save-status" id="stg-save-status"></div>
        </div>
      </div>
    `,e.querySelector("#stg-save-name").addEventListener("click",()=>{const s=e.querySelector("#stg-name-input").value.trim();if(!s)return;C.setPlayerName(s);const o=e.querySelector("#stg-save-status");o.textContent="Name saved!",o.className="stg-save-status stg-save-status--ok",setTimeout(()=>{o.textContent="",o.className="stg-save-status"},2e3)})}_renderAudio(e){e.innerHTML=`
      ${this._sliderRow("masterVolume","MASTER VOLUME",this._data.masterVolume)}
      ${this._sliderRow("music","MUSIC",this._data.music)}
      ${this._sliderRow("sfx","SFX",this._data.sfx)}
      ${this._toggleRow("vibration","VIBRATION",this._data.vibration)}
      ${this._toggleRow("tutorialHints","TUTORIAL HINTS",this._data.tutorialHints)}
      ${this._toggleRow("darkMode","DARK MODE",this._data.darkMode)}
      <div class="stg-version">Version 1.0.0</div>
    `,e.querySelectorAll('.stg-row[data-type="slider"]').forEach(t=>{const s=t.querySelector(".stg-slider"),o=t.querySelector(".stg-val"),i=t.dataset.key;s.addEventListener("input",()=>{this._data[i]=Number(s.value),o.textContent=`${s.value}%`,C.saveSettings(this._data),G.applySettings()})}),e.querySelectorAll('.stg-row[data-type="toggle"]').forEach(t=>{const s=t.querySelector(".stg-toggle"),o=t.dataset.key;s.addEventListener("click",()=>{const i=!this._data[o];this._data[o]=i,s.className=`stg-toggle ${i?"stg-toggle--on":"stg-toggle--off"}`,s.textContent=i?"ON":"OFF",C.saveSettings(this._data),G.applySettings()})})}_sliderRow(e,t,s){return`
      <div class="stg-row" data-key="${e}" data-type="slider">
        <label class="stg-label">${t}</label>
        <div class="stg-control"><input class="stg-slider" type="range" min="0" max="100" value="${s}" /></div>
        <span class="stg-val">${s}%</span>
      </div>`}_toggleRow(e,t,s){return`
      <div class="stg-row" data-key="${e}" data-type="toggle">
        <label class="stg-label">${t}</label>
        <div class="stg-control"></div>
        <button class="stg-toggle ${s?"stg-toggle--on":"stg-toggle--off"}">${s?"ON":"OFF"}</button>
      </div>`}}function Tt(){const u=C.load(),e=Object.keys(u.exploreOutlets||{}).length,t=Object.keys(u.exploreSwitches||{}).length,s=u.learnStages||{},o=[s.wireTypes,s.electricianTools,s.wireStripping,s.learnOutlet,s.switchInstallation].filter(Boolean).length;return[{id:"first_fix",name:"First Fix",desc:"Repair your first outlet in the workshop.",cat:"explore",goal:1,progress:Math.min(e,1)},{id:"full_repair",name:"Full Repair",desc:"Fix all 7 outlets in the workshop.",cat:"explore",goal:7,progress:e},{id:"switch_master",name:"Switch Master",desc:"Wire all 5 light switches.",cat:"explore",goal:5,progress:t},{id:"all_clear",name:"All Clear",desc:"Complete every scenario in the workshop.",cat:"mastery",goal:12,progress:e+t},{id:"basics_done",name:"Wire Basics",desc:"Complete Stage 01 — Understand the Basics.",cat:"learning",goal:1,progress:s.wireTypes?1:0},{id:"tools_done",name:"Tool Ready",desc:"Complete Stage 02 — Learn the Tools.",cat:"learning",goal:1,progress:s.electricianTools?1:0},{id:"strip_done",name:"Strip Expert",desc:"Complete Stage 03 — Wire Stripping.",cat:"learning",goal:1,progress:s.wireStripping?1:0},{id:"full_course",name:"Certified Trainee",desc:"Complete all 5 learning stages.",cat:"mastery",goal:5,progress:o}]}const os=["ALL","EXPLORE","LEARNING","MASTERY"],St={ALL:"⚡",EXPLORE:"🔧",LEARNING:"📚",MASTERY:"🏆"};class ns{constructor(e){this.state=e,this._cat="ALL",this.container=this._build()}_build(){const e=document.createElement("div");return e.className="screen screen-hidden achievements-screen",e.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="ach-back">${H.back}</button>
        <h2 class="hdr-title">ACHIEVEMENTS</h2>
        <div class="hdr-stats" id="ach-stats"></div>
      </header>
      <div class="ach-tabs" id="ach-tabs">
        ${os.map(t=>`<button class="ach-tab ${t==="ALL"?"ach-tab--active":""}" data-cat="${t}">
          <span class="ach-tab-icon">${St[t]}</span>${t}
        </button>`).join("")}
      </div>
      <div class="ach-list" id="ach-list"></div>
    `,e.querySelector("#ach-back").addEventListener("click",()=>this.state.setState("menu")),e.querySelector("#ach-tabs").addEventListener("click",t=>{const s=t.target.closest("[data-cat]");s&&(this._cat=s.dataset.cat,e.querySelectorAll(".ach-tab").forEach(o=>o.classList.toggle("ach-tab--active",o.dataset.cat===this._cat)),this._renderList(e))}),this._el=e,e}onShow(){const e=Tt(),t=e.filter(s=>s.progress>=s.goal).length;this._el.querySelector("#ach-stats").innerHTML=`<span class="hstat" style="color:#00d4ff;font-size:12px;letter-spacing:.08em;">${t}/${e.length} UNLOCKED</span>`,this._renderList(this._el)}_renderList(e){const t=(e||this._el).querySelector("#ach-list"),s=Tt(),o=this._cat==="ALL"?s:s.filter(i=>i.cat===this._cat.toLowerCase());t.innerHTML=o.map(i=>{const a=Math.min(100,Math.round(i.progress/i.goal*100)),n=i.progress>=i.goal,r=St[i.cat.toUpperCase()]||"⚡";return`
        <div class="ach-item ${n?"ach-item--done":""}">
          <div class="ach-icon" style="font-size:26px;line-height:1;">${r}</div>
          <div class="ach-info">
            <div class="ach-name">${i.name}${n?' <span style="color:#22c55e;font-size:11px;">✓ UNLOCKED</span>':""}</div>
            <div class="ach-desc">${i.desc}</div>
            <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${a}%"></div></div>
            <div class="ach-prog-label">${i.progress} / ${i.goal}</div>
          </div>
        </div>
      `}).join("")}}const Et=[{id:"lineman",name:"Lineman's Pliers",cat:"HAND TOOL",emoji:"🔧",color:"#4d8aff",steps:[{phase:"WHAT IS IT",title:"Meet the Lineman's Pliers",tasks:["Look at the flat gripping jaw","See the cutter at the base","Notice the insulated handles"],dialog:"This is a <b>Lineman's Pliers!</b> 🔧 One of the most important tools for any electrician. The flat jaw grips wires tightly, and the base edge cuts them clean!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Gripping & holding wire bundles","Cutting thick copper wire","Twisting wires together"],dialog:"You use it to <b style='color:#ffd000'>grip</b>, <b style='color:#ffd000'>twist</b>, and <b style='color:#ffd000'>cut</b> wires! Every time wires need to be joined in a circuit, this is the tool you'd reach for!",cam:"perspective(500px) scale(1.5) rotateY(-25deg) translateY(-6%)"},{phase:"HOW TO USE",title:"Using it safely",tasks:["Always hold the rubber handles","Grip at the BASE jaw, not the tip","⚠️ Turn OFF the power first!"],dialog:"Hold ONLY the <b style='color:#1fc95a'>rubber handles</b> — never the metal part! Always make sure the power is <b style='color:#ff3355'>OFF</b> before you touch any wire. Safety first, always! 💪",cam:"perspective(500px) scale(1.3) rotateY(20deg) rotateX(-10deg)"}]},{id:"longnose",name:"Long Nose Pliers",cat:"HAND TOOL",emoji:"🤏",color:"#ff9500",steps:[{phase:"WHAT IS IT",title:"Long Nose Pliers",tasks:["Long thin tapered jaws","Great for tight, small spaces","Insulated rubber handles"],dialog:"This is a <b>Long Nose Pliers!</b> 🤏 See those long pointy jaws? They can reach into tiny spots that regular pliers simply can't fit into!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Bending wire into loops & shapes","Reaching into tight spaces","Holding small parts steady"],dialog:"Perfect for <b style='color:#ffd000'>bending wire loops</b> around screw terminals and working in <b style='color:#ffd000'>tight spots</b> inside an outlet box. You'll use this a LOT in circuits!",cam:"perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)"},{phase:"HOW TO USE",title:"Making a wire loop",tasks:["Grab wire end with the tip","Curl clockwise around screw","Loop should close fully"],dialog:"Grab the wire end with the <b style='color:#1fc95a'>tip of the pliers</b>, then curl it <b style='color:#ffd000'>clockwise</b>. That loop hooks perfectly onto screw terminals — like a pro!",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)"}]},{id:"screwdriver",name:"Screwdrivers Set",cat:"HAND TOOL",emoji:"🪛",color:"#ff3355",steps:[{phase:"WHAT IS IT",title:"The Screwdriver Set",tasks:["Phillips head (+) and flathead (−)","Insulated rubber handles (1000V rated)","Different sizes for different screws"],dialog:"This is a <b>Screwdriver Set!</b> 🪛 The red one is <b style='color:#ffd000'>Phillips (+)</b> and the blue one is <b style='color:#4d8aff'>Flathead (−)</b>. Each screw type needs the RIGHT screwdriver!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Tightening terminal screws","Fastening outlets & switches","Opening electrical panels"],dialog:"You use it to <b style='color:#ffd000'>tighten screws</b> on wire terminals, outlets, and switches. A loose screw = a loose wire = <b style='color:#ff3355'>sparks and danger</b>! Always tighten firmly!",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)"},{phase:"HOW TO USE",title:"How to drive a screw",tasks:["Push DOWN firmly before turning","Turn clockwise to tighten","Use the correct size — don't force it!"],dialog:"The trick is: <b style='color:#1fc95a'>push firmly THEN turn</b>. Using the wrong size strips the screw head permanently — then it's stuck forever! Match the screwdriver to the screw. 🎯",cam:"perspective(500px) scale(1.2) rotateY(22deg) rotateX(-6deg)"}]},{id:"stripper",name:"Wire Stripper",cat:"WIRE TOOL",emoji:"✂️",color:"#1fc95a",steps:[{phase:"WHAT IS IT",title:"The Wire Stripper",tasks:["Notched blades match wire sizes","Spring-loaded for easy use","Built-in wire cutter too!"],dialog:"This is a <b>Wire Stripper!</b> ✂️ Those notches on the blade each match a different wire size. It removes the plastic coating (called insulation) from wires — safely and cleanly!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Removing wire insulation","Exposing bare copper inside","Cutting wires to exact length"],dialog:"You need to <b style='color:#ffd000'>expose the copper inside</b> the wire to make a connection. Without bare copper, no electricity can flow — the plastic blocks it!",cam:"perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Stripping a wire",tasks:["Match wire gauge to the notch","Squeeze handles and give a half-turn","Pull toward wire end — plastic pops off!"],dialog:"Find your wire's gauge number, place it in that notch, squeeze, give a <b style='color:#1fc95a'>half turn</b>, then pull toward the wire end. The plastic slides right off — revealing shiny copper! ✨",cam:"perspective(500px) scale(1.3) rotateY(25deg) rotateX(-5deg)"}]},{id:"voltester",name:"Voltage Tester",cat:"TEST TOOL",emoji:"⚡",color:"#ffd000",steps:[{phase:"WHAT IS IT",title:"Non-Contact Voltage Tester",tasks:["Small handheld safety device","Glows AND beeps near live wires","No touching the wire needed!"],dialog:"This is a <b>Voltage Tester!</b> ⚡ It's a safety superhero! It can sense electricity in a wire WITHOUT you touching the wire. Think of it as your personal danger detector!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Checking if a wire is live (dangerous!)","Testing BEFORE you touch anything","Finding which wire has power"],dialog:"Before touching ANY wire, you <b style='color:#ff3355'>ALWAYS</b> test it first! If the tester lights up <b style='color:#ffd000'>yellow/red and beeps</b> — there's live electricity. <b style='color:#ff3355'>DO NOT TOUCH!</b>",cam:"perspective(500px) scale(1.5) rotateY(-22deg) translateY(-8%)"},{phase:"HOW TO USE",title:"Testing safely",tasks:["Turn it ON first (press the button)","Hold tip NEAR the wire (don't touch)","Beep + light = LIVE. No beep = safe"],dialog:"Hold the tip <b style='color:#1fc95a'>near the wire</b> — no touching! If it beeps: <b style='color:#ff3355'>STEP BACK</b>, go to the breaker box, and turn off the power. Always test first! 🦺",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(8deg)"}]},{id:"multimeter",name:"Digital Multimeter",cat:"TEST TOOL",emoji:"📟",color:"#60b0ff",steps:[{phase:"WHAT IS IT",title:"The Multimeter",tasks:["Digital display screen","Rotating selector dial","Two probe cables (red & black)"],dialog:"This is a <b>Digital Multimeter!</b> 📟 It's like the Swiss Army knife of electrical testing — one device that measures voltage, current, AND resistance. Super powerful!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What it measures",tasks:["Voltage (V) — electrical pressure","Current (A) — how much flows","Resistance (Ω) — how much it blocks"],dialog:"Turn the dial to <b style='color:#ffd000'>V</b> for Volts, <b style='color:#4d8aff'>A</b> for Amperes, or <b style='color:#1fc95a'>Ω</b> (Ohm) for Resistance. In WireVerse, you check these numbers to know if your circuit is working!",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Taking a reading",tasks:["Set dial to correct mode (V/A/Ω)","RED probe → positive (+) side","BLACK probe → negative (−) side"],dialog:"<b style='color:#ff3355'>RED probe</b> always goes to the positive (+) side, <b style='color:#6a7a9a'>BLACK probe</b> to negative (−). The number on screen is your measurement. If it says 0 — no power is flowing! 🔍",cam:"perspective(500px) scale(1.3) rotateY(20deg) rotateX(-8deg)"}]},{id:"etape",name:"Electrical Tape",cat:"WIRE TOOL",emoji:"🌀",color:"#ff9500",steps:[{phase:"WHAT IS IT",title:"Electrical Tape",tasks:["Stretchy black PVC vinyl tape","Does NOT conduct electricity","Different colors for wire labeling"],dialog:"This is <b>Electrical Tape!</b> 🌀 It's a special stretchy tape that blocks electricity. This is NOT the same as regular tape — using the wrong tape on wires is extremely dangerous!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Covering exposed copper wire","Insulating wire splices & joints","Color-coding different circuits"],dialog:"Wrap it around <b style='color:#ffd000'>bare copper wire</b> so no one accidentally touches a live wire. Different tape colors (red, black, blue) also help you remember <b style='color:#ffd000'>which wire does what!</b>",cam:"perspective(500px) scale(1.5) rotateY(-18deg) translateY(-5%)"},{phase:"HOW TO USE",title:"Wrapping properly",tasks:["Start BELOW the exposed area","Wrap at 45° angle, overlapping","Minimum 3 full layers!"],dialog:"Start <b style='color:#1fc95a'>below the bare wire</b>, wrap at a <b style='color:#ffd000'>45° angle</b> overlapping half each time. At least <b>3 full layers</b> — stretch slightly as you wrap for a better seal! 💪",cam:"perspective(500px) scale(1.3) rotateY(22deg) rotateX(-5deg)"}]},{id:"breaker",name:"Circuit Breaker",cat:"COMPONENT",emoji:"🔌",color:"#4d8aff",steps:[{phase:"WHAT IS IT",title:"The Circuit Breaker",tasks:["Switch inside the breaker panel","Has ON / OFF / TRIPPED positions","Each circuit gets its own breaker"],dialog:"This is a <b>Circuit Breaker!</b> 🔌 It's the guardian of your electrical system. When too much electricity flows — it automatically <b style='color:#ff3355'>SHUTS OFF</b> to prevent fires and damage!",cam:"perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)"},{phase:"WHAT IT DOES",title:"What is it used for?",tasks:["Protecting wires from overheating","Preventing electrical fires","Cutting power to a single circuit"],dialog:"It's like a <b style='color:#ffd000'>fuse that resets itself!</b> If you plug in too many devices and the wire gets too hot — the breaker TRIPS (turns off). It just saved your home from a fire! 🏠",cam:"perspective(500px) scale(1.5) rotateY(-20deg) translateY(-6%)"},{phase:"HOW TO USE",title:"Resetting a tripped breaker",tasks:["Find the tripped breaker (middle position)","Push it fully to OFF first","Then push to ON — it's reset!"],dialog:"If a breaker trips, push it <b style='color:#1fc95a'>fully OFF first</b>, then push it back to ON. But first: unplug some devices! If it keeps tripping, there's a wiring problem — call an electrician! ⚠️",cam:"perspective(500px) scale(1.3) rotateY(18deg) rotateX(-8deg)"}]}];class as{constructor(e){this.state=e,this._tool=null,this._step=0,this.container=this._build()}_build(){const e=document.createElement("div");return e.className="screen screen-hidden tools-screen",e.innerHTML=`
      <!-- ══ BROWSE VIEW ══ -->
      <div class="tl-view" id="tl-browse">
        <header class="game-header">
          <button class="hdr-back" id="tl-back">${H.back}</button>
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
          <button class="hdr-back" id="tl-guide-back">${H.back}</button>
          <h2 class="hdr-title" id="tl-guide-title"></h2>
          <div class="hdr-right tl-step-badge" id="tl-step-badge">1/3</div>
        </header>

        <div class="tl-guide-body">
          <!-- Left: tasks panel -->
          <div class="tl-tasks-panel">
            <div class="tl-panel-label">TASKS</div>
            <div class="tl-tasks-list" id="tl-tasks-list"></div>
            <button class="tl-hint-btn">${H.hint} HINT <span class="tl-hint-badge">2</span></button>
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
    `,e.querySelector("#tl-back").addEventListener("click",()=>this.state.setState("menu")),e.querySelector("#tl-guide-back").addEventListener("click",()=>this._goToBrowse()),e.querySelector("#tl-skip-btn").addEventListener("click",()=>this._goToBrowse()),e.querySelector("#tl-next-btn").addEventListener("click",()=>this._nextStep()),e.querySelector("#tl-dialog").addEventListener("click",t=>{t.target.closest(".tl-skip-btn")||this._nextStep()}),this._el=e,e}onShow(){this._goToBrowse()}_goToBrowse(){this._el.querySelector("#tl-browse").style.display="flex",this._el.querySelector("#tl-guide").style.display="none",this._renderBrowse()}_renderBrowse(){const e=this._el.querySelector("#tl-tool-list");e.innerHTML=Et.map(t=>`
      <button class="tl-tool-card" data-id="${t.id}">
        <div class="tl-tc-icon" style="--tc-col:${t.color}">${t.emoji}</div>
        <div class="tl-tc-info">
          <div class="tl-tc-name">${t.name}</div>
          <div class="tl-tc-cat">${t.cat}</div>
        </div>
        <div class="tl-tc-arrow">${H.back}</div>
      </button>
    `).join(""),e.querySelectorAll(".tl-tool-card").forEach(t=>{t.addEventListener("click",()=>{const s=Et.find(o=>o.id===t.dataset.id);s&&this._startGuide(s)})})}_startGuide(e){this._tool=e,this._step=0,this._el.querySelector("#tl-browse").style.display="none",this._el.querySelector("#tl-guide").style.display="flex";const t=this._el.querySelector("#tl-visual-icon");t.style.transition="none",t.style.transform="perspective(500px) scale(0.6) rotateY(0deg)",t.textContent=e.emoji,setTimeout(()=>{t.style.transition="",this._renderStep()},60)}_renderStep(){const e=this._tool.steps[this._step],t=this._tool.steps.length;this._el.querySelector("#tl-guide-title").textContent=this._tool.name.toUpperCase(),this._el.querySelector("#tl-step-badge").textContent=`${this._step+1}/${t}`,this._el.querySelector("#tl-phase-tag").textContent=e.phase,this._el.querySelector("#tl-tasks-list").innerHTML=e.tasks.map((i,a)=>`
      <div class="tl-task-item ${a===0?"tl-task--active":""}">
        <span class="tl-task-num">${a+1}</span>
        <span class="tl-task-text">${i}</span>
      </div>
    `).join("");const s=this._el.querySelector("#tl-visual-icon");s.style.transform=e.cam,s.style.color=this._tool.color,this._el.querySelector("#tl-visual-glow").style.background=`radial-gradient(ellipse at 50% 60%, ${this._tool.color}44 0%, ${this._tool.color}11 45%, transparent 70%)`,this._el.querySelector("#tl-dialog-text").innerHTML=e.dialog;const o=this._el.querySelector("#tl-next-btn");o.textContent=this._step>=t-1?"✓  GOT IT!":"TAP TO CONTINUE  ▶▶",o.className=`tl-next-btn ${this._step>=t-1?"tl-next-btn--done":""}`}_nextStep(){const e=this._el.querySelector("#tl-visual-icon");this._step<this._tool.steps.length-1?(e.style.transform="perspective(500px) scale(0.75) rotateY(0deg)",this._step++,setTimeout(()=>this._renderStep(),180)):this._goToBrowse()}}const rs=[{label:"DEVELOPED BY",value:"WireVerse Team Developer",hl:"blue"},{label:"GAME DESIGN",value:"WireVerse Team",hl:""},{label:"PROGRAMMING",value:"WireVerse Team",hl:"orange"},{label:"3D ART & ASSETS",value:"WireVerse Team",hl:"orange"},{label:"UI / UX DESIGN",value:"WireVerse Team",hl:""},{label:"SOUND & MUSIC",value:"WireVerse Team",hl:""},{label:"SPECIAL THANKS",value:"To all our players and supporters!",hl:""}],ls=`
.crd-screen{position:absolute;inset:0;display:flex;flex-direction:column;background:#070d1c;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}
.crd-body{
  flex:1;overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;
  padding:24px 20px 32px;
  display:flex;flex-direction:column;align-items:center;gap:20px;
}
.crd-body::-webkit-scrollbar{display:none;}
.crd-logo-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8px;}
.crd-list{width:100%;max-width:380px;display:flex;flex-direction:column;gap:0;}
.crd-row{
  display:flex;flex-direction:column;gap:3px;
  padding:14px 16px;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.crd-row:last-child{border-bottom:none;}
.crd-label{font-size:9px;font-weight:800;letter-spacing:3px;color:rgba(0,212,255,.5);text-transform:uppercase;}
.crd-value{font-size:16px;font-weight:800;letter-spacing:.5px;color:#fff;}
.crd-hl-blue  {color:#00d4ff;}
.crd-hl-orange{color:#f59e0b;}
.crd-footer{
  padding:20px 0 4px;
  font-size:10px;color:rgba(255,255,255,.2);letter-spacing:2px;text-align:center;
}
`;function cs(){if(document.querySelector("#crd-css"))return;const u=document.createElement("style");u.id="crd-css",u.textContent=ls,document.head.appendChild(u)}class ds{constructor(e){this.state=e,this.container=this._build()}_build(){cs();const e=rs.map(s=>`
      <div class="crd-row">
        <span class="crd-label">${s.label}</span>
        <span class="crd-value ${s.hl?"crd-hl-"+s.hl:""}">${s.value}</span>
      </div>`).join(""),t=document.createElement("div");return t.className="screen screen-hidden credits-screen",t.innerHTML=`
      <header class="game-header">
        <button class="hdr-back" id="crd-back">${H.back}</button>
        <h2 class="hdr-title">CREDITS</h2>
        <div class="hdr-right"></div>
      </header>
      <div class="crd-body">
        <div class="crd-logo-wrap">
          ${Rt("clamp(36px,8vw,52px)")}
        </div>
        <div class="crd-list">${e}</div>
        <div class="crd-footer">WIREVERSE V2 · 2025</div>
      </div>
    `,t.querySelector("#crd-back").addEventListener("click",()=>this.state.setState("menu")),t}}const dt=[{id:"wireTypes",state:"wireTypes",module:"MODULE 1",title:"WIRE TYPES",desc:"Learn the 5 wire types used in Philippine homes — THHN, NM-B, TW, BX, and UF-B. What they are, where they go, and why it matters.",pills:[["⚡","5 Wire Types","Know them all"],["🛡","Safe & Reliable","Install with confidence"],["✓","Real-World Ready","Apply what you learn"]],colorA:"#00d4ff",colorB:"#2dc653",icon:"🔌",requires:null},{id:"wireStripping",state:"wireStripping",module:"MODULE 2",title:"WIRE STRIPPING",desc:"Master the four tools used to strip wire insulation — manual, automatic, utility knife, and rotary. When to use each and how.",pills:[["✂","4 Tools","Every tool, every time"],["🎯","Use It Right","When, why, how"],["📊","Build the Habit","Precision. Safety. Efficiency."]],colorA:"#cc44ff",colorB:"#ff4444",icon:"✂",requires:null}],hs=`
@keyframes lh-fade-up{0%{opacity:0;transform:translateY(22px) scale(.95);}70%{opacity:1;transform:translateY(-3px) scale(1.015);}100%{opacity:1;transform:translateY(0) scale(1);}}

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
  -webkit-tap-highlight-color:transparent;transition:transform .18s,box-shadow .18s;
  display:flex;flex-direction:row;min-height:200px;
  animation:lh-fade-up .4s cubic-bezier(.34,1.56,.64,1) both;margin-bottom:14px;
}
.lh-card:not(.locked):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.55);}
.lh-card:active{transform:scale(.96);}
.lh-card.locked{opacity:.5;cursor:not-allowed;}
.lh-card.locked:active{transform:none;}
.lh-card:nth-child(1){animation-delay:.05s;}
.lh-card:nth-child(2){animation-delay:.12s;}
.lh-card:nth-child(3){animation-delay:.19s;}
.lh-card:nth-child(n+4){animation-delay:.25s;}

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
`;function ps(){if(document.querySelector("#lh-css"))return;const u=document.createElement("style");u.id="lh-css",u.textContent=hs,document.head.appendChild(u)}class us{constructor(e){this.state=e,this.container=this._build()}_build(){ps();const e=document.createElement("div");return e.className="screen screen-hidden",e.innerHTML=`
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
      </div>`,e.querySelector(".lh-back").addEventListener("click",()=>this.state.setState("menu")),this._el=e,e}_renderCards(e){const t=dt.filter(o=>!!e[o.id]).length;this._el.querySelector("#lh-badge").innerHTML=`
      <div>${t}/${dt.length}</div>
      <div class="lh-badge-label">Completed</div>`;const s=this._el.querySelector("#lh-body");s.innerHTML=dt.map((o,i)=>{const a=!!e[o.id],n=o.requires&&!e[o.requires],r=o.pills.map(([l,c,d])=>`
        <div class="lh-pill">
          <span class="lh-pill-icon">${l}</span>
          <span class="lh-pill-name">${c}</span>
          <span class="lh-pill-sub">${d}</span>
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
        </div>`}).join(""),s.querySelectorAll(".lh-card:not(.locked)").forEach(o=>{o.addEventListener("click",()=>this.state.setState(o.dataset.state))})}onShow(){this._renderCards(C.getLessonProgress())}}function gs(){const u=document.createElement("canvas");u.width=512,u.height=512;const e=u.getContext("2d"),t=e.createLinearGradient(0,0,512,512);t.addColorStop(0,"#4a2e12"),t.addColorStop(.3,"#5c3a18"),t.addColorStop(.7,"#4e321a"),t.addColorStop(1,"#3d2610"),e.fillStyle=t,e.fillRect(0,0,512,512);for(let i=0;i<80;i++){let a=0,n=Math.random()*512;for(e.beginPath(),e.moveTo(a,n);a<512;)a+=8+Math.random()*18,n+=(Math.random()-.5)*10,e.lineTo(a,n);const r=Math.random()>.4;e.strokeStyle=r?`rgba(0,0,0,${.04+Math.random()*.18})`:`rgba(255,200,120,${.015+Math.random()*.06})`,e.lineWidth=.4+Math.random()*2.2,e.stroke()}for(let i=0;i<3;i++){const a=60+Math.random()*390,n=60+Math.random()*390,r=12+Math.random()*22,l=e.createRadialGradient(a,n,0,a,n,r*2.4);l.addColorStop(0,"rgba(15,7,2,0.75)"),l.addColorStop(.45,"rgba(28,14,6,0.45)"),l.addColorStop(1,"transparent"),e.fillStyle=l,e.beginPath(),e.ellipse(a,n,r*1.6,r,Math.random()*.6,0,Math.PI*2),e.fill();for(let c=0;c<10;c++){const d=c/10*Math.PI*2;e.beginPath(),e.moveTo(a+Math.cos(d)*r,n+Math.sin(d)*r),e.bezierCurveTo(a+Math.cos(d)*r*2.2,n+Math.sin(d)*r*2.2,a+Math.cos(d+.35)*r*3.5,n+Math.sin(d+.35)*r*3.5,a+Math.cos(d+.6)*r*5,n+Math.sin(d+.6)*r*5),e.strokeStyle="rgba(0,0,0,0.1)",e.lineWidth=.8,e.stroke()}}const s=e.createRadialGradient(256,256,120,256,256,380);s.addColorStop(0,"transparent"),s.addColorStop(1,"rgba(0,0,0,0.3)"),e.fillStyle=s,e.fillRect(0,0,512,512);const o=new he(u);return o.wrapS=o.wrapT=et,o.repeat.set(4,2.5),o}function fs(){const u=document.createElement("canvas");u.width=256,u.height=256;const e=u.getContext("2d");e.fillStyle="#1c1c1e",e.fillRect(0,0,256,256);const t=18;for(let o=t;o<256;o+=t)for(let i=t;i<256;i+=t)e.beginPath(),e.arc(o,i,2.8,0,Math.PI*2),e.fillStyle="#0a0a0c",e.fill(),e.beginPath(),e.arc(o-.8,i-.8,1.4,0,Math.PI*2),e.fillStyle="rgba(255,255,255,0.04)",e.fill();for(let o=0;o<60;o++)e.beginPath(),e.moveTo(Math.random()*256,Math.random()*256),e.lineTo(Math.random()*256,Math.random()*256),e.strokeStyle=`rgba(0,0,0,${.02+Math.random()*.06})`,e.lineWidth=Math.random()*1.5,e.stroke();const s=new he(u);return s.wrapS=s.wrapT=et,s.repeat.set(5,2.5),s}function bs(){const u=document.createElement("canvas");u.width=512,u.height=512;const e=u.getContext("2d");e.fillStyle="#1e1e20",e.fillRect(0,0,512,512);for(let s=0;s<3e3;s++)e.beginPath(),e.arc(Math.random()*512,Math.random()*512,.4+Math.random()*1.8,0,Math.PI*2),e.fillStyle=Math.random()>.5?`rgba(255,255,255,${.015+Math.random()*.04})`:`rgba(0,0,0,${.04+Math.random()*.09})`,e.fill();e.strokeStyle="rgba(0,0,0,0.22)",e.lineWidth=1.5,[128,256,384].forEach(s=>{e.beginPath(),e.moveTo(s,0),e.lineTo(s,512),e.stroke(),e.beginPath(),e.moveTo(0,s),e.lineTo(512,s),e.stroke()});const t=new he(u);return t.wrapS=t.wrapT=et,t.repeat.set(6,4),t}function st(u,e={}){const{benchY:t=-.64,benchW:s=12,benchD:o=5.5,benchH:i=.3}=e,a=t+i/2,n=t-i/2,r=1.45,l=n-r,c=gs(),d=new f({map:c,color:6963232,roughness:.82,metalness:0}),h=new f({color:2758152,roughness:.92}),g=new f({color:6710903,roughness:.28,metalness:.88}),b=new f({color:2236979,roughness:.45,metalness:.75}),w=new f({color:4006416,roughness:.9}),m=new p(new y(s,i,o),d);m.position.y=t,m.receiveShadow=!0,m.castShadow=!0,u.add(m);const _=new p(new y(s,.055,.1),h);_.position.set(0,a-.01,o/2+.01),u.add(_),[-1,1].forEach(X=>{const le=new p(new y(.06,i+.01,o),h);le.position.set(X*(s/2+.03),t,0),u.add(le)});const E=s/2-.35,M=o/2-.35;[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([X,le])=>{const xe=new p(new y(.22,r,.22),w);xe.position.set(X*E,n-r/2,le*M),xe.castShadow=!0,xe.receiveShadow=!0,u.add(xe)});const S=new p(new y(s-.8,.1,.1),w);S.position.set(0,n-r*.55,M),u.add(S);const x=new p(new Se(22,14),new f({map:bs(),roughness:.95,metalness:0,color:2105378}));x.rotation.x=-Math.PI/2,x.position.y=l,x.receiveShadow=!0,u.add(x);const T=5.5,I=new f({map:fs(),color:1710620,roughness:.94,metalness:0}),z=new p(new Se(s+4,T),I);z.position.set(0,n-r+T/2,-(o/2)-.05),z.receiveShadow=!0,u.add(z);const R=new p(new y(s+4,.14,.06),new f({color:1118483,roughness:.95}));R.position.set(0,l+.07,-(o/2)-.02),u.add(R);const O=-s/2+.9,se=o/2-.5,ge=new p(new y(.68,.1,.62),g);ge.position.set(O,a+.05,se-.1),u.add(ge);const V=new p(new y(.65,.42,.14),g);V.position.set(O,a+.25,se-.38),u.add(V);const re=new p(new y(.65,.42,.14),b);re.position.set(O,a+.25,se-.05),u.add(re);const $=new p(new k(.032,.032,.55,10),g);$.rotation.x=Math.PI/2,$.position.set(O,a+.18,se-.22),u.add($);const W=new p(new k(.018,.018,.6,8),g);W.rotation.z=Math.PI/2,W.position.set(O,a+.18,se+.15),u.add(W),[-.28,.28].forEach(X=>{const le=new p(new Ee(.038,8,8),b);le.position.set(O+X,a+.18,se+.15),u.add(le)});const F=document.createElement("canvas");F.width=256,F.height=32;const pe=F.getContext("2d");pe.fillStyle="#e8c842",pe.fillRect(0,0,256,32),pe.fillStyle="#1a1a00";for(let X=0;X<=30;X++){const le=X*8.533333333333333,xe=X%5===0?20:X%2===0?14:9;pe.fillRect(le-.5,0,1,xe),X%5===0&&(pe.font="10px monospace",pe.fillText(String(X),le-4,30))}const He=new he(F),Be=new p(new y(3.8,.025,.18),new f({map:He,roughness:.6}));Be.position.set(s/2-2.5,a+.012,-1.8),u.add(Be);const B=s/2-.8,q=new p(new N(.32,.1,10,30),new f({color:1710638,roughness:.65,metalness:.05}));q.rotation.y=Math.PI/2,q.position.set(B,a+.32,-1),u.add(q);const K=new p(new k(.18,.18,.22,16),new f({color:13928762,roughness:.4,metalness:.7}));K.rotation.z=Math.PI/2,K.position.copy(q.position),u.add(K);const Q=s/2-1.5,fe=-o/2+.5,wt=new f({color:3355460,roughness:.5,metalness:.8}),mt=new p(new y(.14,.14,.14),b);mt.position.set(Q,a+2.8,-(o/2)-0),u.add(mt);const xt=new p(new k(.025,.025,1.8,8),wt);xt.position.set(Q,a+1.9,-(o/2)+.1),u.add(xt);const ot=new p(new k(.022,.022,2,8),wt);ot.rotation.z=Math.PI/2,ot.position.set(Q-1,a+2.8,fe),u.add(ot);const ue=new p(new Ke(.44,.36,18,1,!0),new f({color:1842208,roughness:.8,metalness:.55,side:gt}));ue.rotation.x=Math.PI,ue.position.set(Q-2,a+2.4,fe),u.add(ue);const nt=new p(new Ke(.4,.32,18,1,!0),new f({color:16771232,emissive:16771232,emissiveIntensity:.55,side:Nt}));nt.rotation.x=Math.PI,nt.position.copy(ue.position),u.add(nt);const We=new p(new Ee(.055,8,8),new f({color:16775376,emissive:16775376,emissiveIntensity:3.5}));We.position.set(ue.position.x,ue.position.y+.08,ue.position.z),u.add(We);const ie=new Je(16769168,4.5);ie.position.copy(We.position),ie.target.position.set(ue.position.x,a,fe+.5),ie.angle=.52,ie.penumbra=.38,ie.decay=1.6,ie.castShadow=!0,ie.shadow.mapSize.set(1024,1024),ie.shadow.bias=-.002,u.add(ie),u.add(ie.target);const at=new D(16746547,.7,6);return at.position.copy(We.position),u.add(at),{spotLight:ie,lampFill:at}}function it(u){u.add(new Ve(13162751,.65));const e=new de(16774880,2.2);e.position.set(5,12,6),e.castShadow=!0,e.shadow.mapSize.set(2048,2048),e.shadow.camera.left=-10,e.shadow.camera.right=10,e.shadow.camera.top=8,e.shadow.camera.bottom=-8,e.shadow.bias=-.001,u.add(e);const t=new de(39372,.85);t.position.set(-6,4,-3),u.add(t);const s=new de(16777215,.4);s.position.set(1,5,9),u.add(s);const o=new de(1122884,.3);return o.position.set(0,-5,2),u.add(o),{sun:e,rim:t,fill:s,bot:o}}const ht=[{id:"red",col:13378082,hex:"#cc2222",lbl:"RED",role:"HOT",z:-1},{id:"white",col:14211288,hex:"#d8d8d8",lbl:"WHITE",role:"NEUTRAL",z:0},{id:"green",col:1744452,hex:"#1a9e44",lbl:"GREEN",role:"GROUND",z:1}],Fe=[{id:"THHN",col:1710638,hex:"#1a1a2e",lbl:"THHN",tag:"Inside conduit · 90°C",r:.12,shape:"round"},{id:"NMB",col:10526880,hex:"#a0a0a0",lbl:"NM-B",tag:"Dry indoor walls only",r:.18,shape:"flat"},{id:"TW",col:2250171,hex:"#2255bb",lbl:"TW",tag:"Older buildings · 60°C",r:.12,shape:"round"},{id:"BX",col:8947840,hex:"#888880",lbl:"BX",tag:"Exposed areas · Armored",r:.15,shape:"armored"},{id:"UFB",col:5075008,hex:"#4d7040",lbl:"UF-B",tag:"Direct burial only",r:.22,shape:"thick"}],Ue=[{q:"What type of wire is this? It has a spiral metal armor around it.",vis:"bx",opts:["THHN","UF-B","BX Armored","Romex (NM-B)"],ans:2,hint:"The spiral metal armor is the signature of BX cable — designed to protect against physical damage."},{q:"What does a RED wire mean?",vis:"red",opts:["Ground — safety wire","Neutral — return path","Hot — 220V live electricity","Depends on country"],ans:2,hint:"Red = HOT. 220 volts. Always treat a red wire as live even when you think the power is off."},{q:"Power needs to run buried underground from the house to a garden lamp. Which wire?",vis:"ufb",opts:["THHN","Romex (NM-B)","TW wire","UF-B"],ans:3,hint:"Only UF-B is rated for direct burial. Soil and moisture would destroy the others."},{q:"Your air conditioner needs 20 amps. Which wire do you choose?",vis:"awg",opts:["AWG 14 — thinner (15A max)","AWG 12 — thicker (20A max)"],ans:1,hint:"AWG 12 handles 20 amps. AWG 14 only handles 15. Wrong choice means overheating and risk of fire."},{q:"Someone is about to touch a white neutral wire without testing it. Is this safe?",vis:"white",opts:["Yes — white is neutral so it is safe","No — always test any wire before touching"],ans:1,hint:"Neutral wires can carry fault current during electrical faults. Always test any wire before touching."}],oe=[{t:"info",ch:0,chLbl:"WIRE TYPES",cam:{p:[4,3,8],t:[0,0,0]},scene:"empty",mascotIn:!0,text:"Before you touch a single wire in real life — you need to know what you are looking at. Because not all wires are the same. Pick the wrong one and at best the job fails. At worst someone gets hurt.",btn:"NEXT"},{t:"info",ch:0,chLbl:"WIRE TYPES",cam:{p:[4,3,8],t:[0,0,0]},scene:"empty",text:"I am going to show you five wires today. By the end you will know what each one is, where it goes, and why it exists. Ready?",btn:"LET'S GO"},{t:"info",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2.5,5.5],t:[0,-.1,0]},scene:"wire_drop",text:"Let us start here. This is a wire. Looks simple. But it is actually three things built on top of each other.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:-1,text:"The wire slices open — like cutting through a sausage. Three layers. Each one has a completely different job.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:0,layerName:"COPPER",layerHex:"#b87333",text:"COPPER — the center. This is what carries electricity. Copper conducts current better than almost any other affordable metal. Without this, nothing works.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:1,layerName:"INSULATION",layerHex:"#3355cc",text:"INSULATION — wrapped around the copper. Plastic. Its job is to stop electricity from escaping. Two bare copper wires touching causes a short circuit. The insulation stops that.",btn:"NEXT"},{t:"cross",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2,4.5],t:[0,-.1,0]},scene:"cross_section",layer:2,layerName:"JACKET",layerHex:"#666666",text:"JACKET — the outer layer. Tougher plastic. Protects everything inside from physical damage — scraping, bending, heat, moisture.",btn:"NEXT"},{t:"info",ch:1,chLbl:"CH.1 WIRE ANATOMY",cam:{p:[0,2.5,5.5],t:[0,-.1,0]},scene:"wire_single",text:"Copper carries. Insulation contains. Jacket protects. Every wire you ever see is built this way.",btn:"NEXT CHAPTER"},{t:"info",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,3.5,7.5],t:[0,-.4,0]},scene:"color_wires",text:"Before we look at the five wire types — I need to teach you something that could save your life. The color of a wire is a message. It tells every electrician what that wire is doing. Get this wrong and you are in serious danger.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[-1.5,1.5,3.5],t:[-1,-.2,0]},scene:"color_wires",focus:"red",text:"RED means HOT. This wire carries live electricity — 220 volts. If you touch this wire while power is on, you will get a shock that can stop your heart. Every electrician treats a red wire as live. Even when they think the power is off.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,1.5,3.5],t:[0,-.2,0]},scene:"color_wires",focus:"white",text:"WHITE means NEUTRAL. This wire is the return path. Electricity goes out on the red wire and comes back home on the white wire. Less dangerous than red — but not safe to touch either. During a fault it can carry current too.",btn:"NEXT"},{t:"color",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[1.5,1.5,3.5],t:[1,-.2,0]},scene:"color_wires",focus:"green",text:"GREEN means GROUND. This wire does not carry electricity under normal conditions. But if something goes wrong — if electricity leaks where it should not — the green wire catches it and sends it safely into the earth. It is the reason a faulty appliance trips the breaker instead of shocking you.",btn:"NEXT"},{t:"info",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"color_wires",text:`Red — hot. White — neutral. Green — ground.

Say that in your head twice. You will use it forever.`,btn:"NEXT"},{t:"cquiz",ch:2,chLbl:"CH.2 WIRE COLORS",cam:{p:[0,1.4,3.2],t:[0,-.5,0]},scene:"color_wires",text:"Quick check. I will call the role — you tap the correct wire on the workbench.",btn:null},{t:"info",ch:3,chLbl:"CH.3 WIRE TYPES",cam:{p:[0,3.5,7.5],t:[0,-.3,0]},scene:"wt_slots",text:"Now. The five wires. Each one has a specific job. A specific place where it belongs. Using the wrong wire in the wrong place is a code violation — and a safety hazard.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — THHN",wti:0,cam:{p:[-2.5,2.2,5.5],t:[-2,-.2,0]},scene:"wt_show",active:0,text:"THHN — the most common wire in the Philippines. Any new building, any new home — this is what is running through the walls. It is the standard.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — THHN",wti:0,cam:{p:[-2.5,1.8,4.2],t:[-2,-.2,0]},scene:"wt_show",active:0,text:"THHN lives inside conduit — those grey tubes running along ceilings and walls. The conduit is the road. THHN is the car inside it. Handles heat up to 90°C. Always inside conduit. That is the rule.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — NM-B",wti:1,cam:{p:[-1.2,2.2,5.5],t:[-1,-.2,0]},scene:"wt_show",active:1,text:"NM-B — also called Romex. Look at it — fatter than THHN. That is because it bundles three wires in one sheath — black (hot), white (neutral), and bare copper (ground). Three wires, one package.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — NM-B",wti:1,cam:{p:[-1.2,1.8,4.2],t:[-1,-.2,0]},scene:"wt_show",active:1,text:"Romex is used inside walls — behind drywall, in dry indoor spaces. Much faster to run one cable than three. But never outside. Never in wet locations. Inside the wall. Dry location. That is all.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — TW",wti:2,cam:{p:[.2,2.2,5.5],t:[0,-.2,0]},scene:"wt_show",active:2,text:"TW wire — the older version of what we use today. It works. But it has a lower heat rating — only 60°C instead of 90. You will see TW in homes built 20 to 30 years ago. Not bad wire. Just know its limits.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — BX",wti:3,cam:{p:[1.2,2.2,5.5],t:[1,-.2,0]},scene:"wt_show",active:3,text:"BX cable — Armored Cable. That spiral is real metal. It protects the wires inside from physical damage. You can step on this. Hit it with tools. It survives things that would destroy THHN or Romex.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — BX",wti:3,cam:{p:[1.2,1.8,4.2],t:[1,-.2,0]},scene:"wt_show",active:3,text:"Use BX where the wire will be exposed — not inside walls. Workshops. Factories. Garages. The metal armor also acts as a ground path — extra safety built right in.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — UF-B",wti:4,cam:{p:[2.5,2.2,5.5],t:[2,-.2,0]},scene:"wt_show",active:4,text:"UF-B — Underground Feeder Cable. Every other wire today — THHN, Romex, TW, BX — cannot be buried in the ground. Soil and moisture would destroy them. UF-B is designed specifically for direct burial with no conduit.",btn:"NEXT"},{t:"wt",ch:3,chLbl:"CH.3 — UF-B",wti:4,cam:{p:[2.5,1.8,4.2],t:[2,-.2,0]},scene:"wt_show",active:4,text:"It is filled with a solid waterproof compound — water cannot penetrate it. Use it to bring power to outdoor lights, gate motors, garden sockets. Bury at least 300mm below the surface.",btn:"NEXT CHAPTER"},{t:"info",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[0,3,6.5],t:[0,-.3,0]},scene:"awg_pair",text:"One more thing before the test. Wire thickness matters just as much as wire type. A thin wire carrying too much current is how fires start. Thickness is measured in AWG — American Wire Gauge. Bigger number = thinner wire. It is backwards. It has been this way for 100 years.",btn:"NEXT"},{t:"awg14",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[-1.5,1.8,4],t:[-1,-.3,0]},scene:"awg_pair",hl:"awg14",text:"AWG 14 — thinner wire — handles 15 amps. Normal wall outlets. Lights. Fans. Phone chargers. Everyday household loads.",btn:"NEXT"},{t:"awg12",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[1.5,1.8,4],t:[1,-.3,0]},scene:"awg_pair",hl:"awg12",text:"AWG 12 — thicker wire — handles 20 amps. Air conditioners. Kitchen appliances. Water heaters. Anything that pulls serious power.",btn:"NEXT"},{t:"fire",ch:4,chLbl:"CH.4 WIRE THICKNESS",cam:{p:[0,2.5,5.5],t:[0,-.2,0]},scene:"awg_fire",text:"Match the wrong wire to the wrong load and the wire overheats. Insulation melts. Fire. Every time. Match the wire to the load. Always.",btn:"TAKE THE TEST"},{t:"qintro",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"bench_clean",text:"Five questions. One at a time. Take your time — you have learned all of this.",btn:"START"},...Ue.map((u,e)=>({t:"quiz",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,3,7],t:[0,-.3,0]},scene:"quiz",qi:e})),{t:"done",ch:7,chLbl:"COMPLETE",cam:{p:[5,4,9],t:[0,-.2,0]},scene:"wt_all",text:"That is wire types. You now know what is inside a wire, what the colors mean, which wire goes where, and how thickness affects safety. This is the foundation. Everything else in electrical work builds on this.",btn:"FINISH"}],ws=`
.wtl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

/* TOP BAR */
.wtl-top{height:calc(48px + env(safe-area-inset-top));background:rgba(4,8,18,.98);border-bottom:1px solid rgba(0,212,255,.15);display:flex;align-items:flex-end;padding:env(safe-area-inset-top) 12px 8px;gap:10px;flex-shrink:0;}
.wtl-back{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);color:#00d4ff;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wtl-top-center{flex:1;text-align:center;}
.wtl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#00d4ff;display:block;}
.wtl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

/* MAIN SPLIT LAYOUT */
.wtl-main{flex:1;display:flex;flex-direction:row;min-height:0;overflow:hidden;}

/* 3D SCENE */
.wtl-scene{flex:1;position:relative;background:#07101f;overflow:hidden;}
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
@keyframes wtlDialogIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
.wtl-dialog{width:38%;flex-shrink:0;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;border-right:1px solid rgba(0,212,255,.1);}
.wtl-bubble{animation:wtlDialogIn .3s cubic-bezier(.25,.46,.45,.94) both;}
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
.wtl-bottom{height:calc(62px + env(safe-area-inset-bottom));background:rgba(4,8,18,.98);border-top:1px solid rgba(0,212,255,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px env(safe-area-inset-bottom);gap:10px;flex-shrink:0;}
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
`;function ms(){if(document.querySelector("#wtl-css"))return;const u=document.createElement("style");u.id="wtl-css",u.textContent=ws,document.head.appendChild(u)}function xs(u,e){const t=u.width,s=t/2,o=t/2,i=u.getContext("2d");i.clearRect(0,0,t,t);const a=t*.46,n=t*.33,r=t*.18,l=(c,d,h)=>{if(h){const g=i.createRadialGradient(s,o,c*.4,s,o,c+18);g.addColorStop(0,d+"cc"),g.addColorStop(1,"transparent"),i.fillStyle=g,i.beginPath(),i.arc(s,o,c+18,0,Math.PI*2),i.fill()}};l(a,"#888",e===2),i.beginPath(),i.arc(s,o,a,0,Math.PI*2),i.fillStyle=e===2?"#888888":e===-1?"#555":"#3a3a3a",i.fill(),l(n,"#3355cc",e===1),i.beginPath(),i.arc(s,o,n,0,Math.PI*2),i.fillStyle=e===1?"#3355cc":e===-1?"#333":"#222255",i.fill(),l(r,"#b87333",e===0),i.beginPath(),i.arc(s,o,r,0,Math.PI*2),i.fillStyle=e===0?"#d4893a":e===-1?"#555":"#6b4420",i.fill(),[[a,"#ffffff22"],[n,"#ffffff18"],[r,"#ffffff25"]].forEach(([c,d])=>{i.beginPath(),i.arc(s,o,c,0,Math.PI*2),i.strokeStyle=d,i.lineWidth=1.5,i.stroke()})}function ne(u,e){const t=document.createElement("canvas");t.width=160,t.height=50;const s=t.getContext("2d");s.fillStyle="rgba(4,10,24,0.9)",s.beginPath(),s.roundRect(2,2,156,46,9),s.fill(),s.strokeStyle=u,s.lineWidth=2,s.beginPath(),s.roundRect(2,2,156,46,9),s.stroke(),s.fillStyle=u,s.font="bold 18px monospace",s.textAlign="center",s.textBaseline="middle",s.fillText(e,80,25);const o=new he(t),i=new It({map:o,transparent:!0,depthTest:!1}),a=new At(i);return a.scale.set(.85,.28,1),a}class vs{constructor(e){this.state=e,this._step=0,this._three=null,this._animId=null,this._sceneObjs=[],this._sparks=[],this._dropObjs=[],this._fireObjs=[],this._quizDone=!1,this._cqIdx=0,this._cqCorrect=0,this._cqTargets=[],this._cqActive=!1,this._cqTargetId="",this._quizMeshTap=null,this._camPos=new v(4,3,8),this._camTarget=new v(0,0,0),this.container=this._build()}_build(){ms();const e=document.createElement("div");return e.className="screen screen-hidden",e.innerHTML=`
      <div class="wtl">
        <header class="wtl-top">
          <button class="wtl-back">← MENU</button>
          <div class="wtl-top-center">
            <span class="wtl-ch-label" id="wtl-ch-lbl">WIRE TYPES</span>
          </div>
          <span class="wtl-ch-step" id="wtl-step-num">1/${oe.length}</span>
        </header>

        <div class="wtl-main">
          <div class="wtl-dialog" id="wtl-dialog">
            <!-- swapped between bubble-mode and quiz-mode -->
            <div class="wtl-bubble" id="wtl-bubble">
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
        </div>

        <div class="wtl-bottom">
          <button class="wtl-nav wtl-nav-back" id="wtl-prev">← BACK</button>
          <div class="wtl-dots" id="wtl-dots"></div>
          <button class="wtl-nav wtl-nav-next" id="wtl-next">NEXT →</button>
        </div>
      </div>`,e.querySelector(".wtl-back").addEventListener("click",()=>this.state.setState("stagesHub")),e.querySelector("#wtl-next").addEventListener("click",()=>this._onNext()),e.querySelector("#wtl-prev").addEventListener("click",()=>this._onPrev()),e.querySelector("#wtl-bubble-tap").addEventListener("click",()=>this._onNext()),this._el=e,e}_initThree(){if(this._three)return;const e=this._el.querySelector("#wtl-canvas"),t=this._el.querySelector("#wtl-scene"),s=t.offsetWidth,o=t.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}const i=new Me({canvas:e,antialias:!0,powerPreference:"high-performance"});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Pe,i.toneMapping=qe,i.toneMappingExposure=1.15;const a=new we;a.background=new L(658968),a.fog=new Ne(658968,.025);const n=new Ce(52,s/o,.1,80);n.position.copy(this._camPos),n.lookAt(this._camTarget),it(a);const{lampFill:r}=st(a,{benchY:-.64,benchW:11,benchD:5.5}),l=r,c=new bt,d=new tt,h=b=>{if(!this._cqActive&&!this._quizMeshTap)return;b.preventDefault();const w=e.getBoundingClientRect(),m=b.touches?b.changedTouches[0]:b;d.x=(m.clientX-w.left)/w.width*2-1,d.y=-((m.clientY-w.top)/w.height)*2+1,c.setFromCamera(d,n);const _=c.intersectObjects(this._cqTargets);if(_.length){const E=_[0].object.userData.wireId;this._cqActive&&this._onColorTap(E,_[0].point),this._quizMeshTap&&this._quizMeshTap(E)}};e.addEventListener("pointerdown",h),this._resizeObs=new ResizeObserver(()=>{const b=t.offsetWidth,w=t.offsetHeight;!b||!w||(i.setSize(b,w),n.aspect=b/w,n.updateProjectionMatrix())}),this._resizeObs.observe(t),this._three={renderer:i,scene:a,camera:n,lamp:l},this._cqActive=!1,this._quizMeshTap=null;const g=()=>{this._animId=requestAnimationFrame(g),this._updateThree(),i.render(a,n)};g()}_clearSceneObjs(){if(this._three){for(const e of this._sceneObjs)this._three.scene.remove(e);this._sceneObjs=[],this._dropObjs=[],this._fireObjs=[],this._cqTargets=[],this._cqActive=!1,this._quizMeshTap=null,this._el.querySelector("#wtl-scene").classList.remove("fire-anim"),this._el.querySelector("#wtl-cross-overlay").classList.remove("show"),this._el.querySelector("#wtl-wt-badge").classList.remove("show"),this._el.querySelector("#wtl-cquiz-prompt").classList.remove("show"),this._el.querySelector("#wtl-tap-hint").style.display="none"}}_add(e){return this._three.scene.add(e),this._sceneObjs.push(e),e}_makeWire(e,t){const s=e.shape==="armored",o=e.shape==="flat",i=new f({color:e.col,roughness:s?.18:o?.75:.35,metalness:s?.92:.05,clearcoat:s?0:.6,clearcoatRoughness:.2}),a=new p(this._makeWireGeo(e),i);if(a.rotation.z=Math.PI/2,a.castShadow=!0,a.userData.wireId=e.id,a.position.set(t,-.35,0),o){const n=new A;[-.04,0,.04].forEach((r,l)=>{const c=[1118481,12088115,15658734][l],d=new f({color:c,roughness:.4,metalness:l===1?.9:0}),h=new p(new k(.035,.035,5.85,12),d);h.position.set(0,0,r),n.add(h)}),a.add(n)}return s&&this._makeArmorSpiral(a,e.r),a}_makeWireGeo(e){return e.shape==="flat"?new ae(e.r*.45,5.6,8,16):new k(e.r,e.r,5.8,24)}_makeArmorSpiral(e,t){const s=new f({color:11184810,roughness:.18,metalness:.92}),o=[],i=45,a=5.6;for(let c=0;c<=200;c++){const d=c/200,h=d*Math.PI*2*i,g=-a/2+d*a;o.push(new v(Math.cos(h)*t,g,Math.sin(h)*t))}const n=new Qe(o),r=new Ze(n,200,.022,8,!1),l=new p(r,s);e.add(l)}_makeCopperEnd(e,t,s=!1){const o=new A,i=new f({color:13928762,roughness:.15,metalness:.95,emissive:13928762,emissiveIntensity:.12});if(s)for(let a=0;a<7;a++){const n=a/7*Math.PI*2,r=new p(new k(.018,.018,.14,8),i);r.rotation.z=Math.PI/2,r.position.set(0,Math.cos(n)*.038,Math.sin(n)*.038),o.add(r)}else{const a=new p(new k(.065,.065,.14,16),i);a.rotation.z=Math.PI/2,o.add(a)}return o.position.set(e,-.35,t),o}_makeTermEnd(e,t,s){const o=new f({color:11184810,roughness:.12,metalness:.95}),i=new p(new k(s+.02,s+.02,.16,16),o);return i.rotation.z=Math.PI/2,i.position.set(e,-.35,t),i}_applyScene(e){this._clearSceneObjs();const t=e.scene;if(t!=="empty"){if(t==="wire_drop"||t==="wire_single"){const s={col:1710638,r:.13,shape:"round",id:"anatomy"},o=this._makeWire(s,0);t==="wire_drop"?(o.position.set(0,4,0),this._dropObjs.push({mesh:o,target:-.35,vel:0})):o.position.set(0,-.35,0),this._add(o),this._add(this._makeCopperEnd(-3.01,0,!0)),this._add(this._makeCopperEnd(3.01,0,!0)),this._add(this._makeTermEnd(-2.9,0,.13)),this._add(this._makeTermEnd(2.9,0,.13))}if(t==="cross_section"){this._el.querySelector("#wtl-cross-overlay").classList.add("show");const o=this._el.querySelector("#wtl-cross-canvas");xs(o,e.layer??-1);const i=this._el.querySelector("#wtl-cross-labels"),a=[{name:"COPPER",hex:"#b87333",active:e.layer===0},{name:"INSULATION",hex:"#3355cc",active:e.layer===1},{name:"JACKET",hex:"#666666",active:e.layer===2}];i.innerHTML=a.map(n=>`
        <span class="wtl-cross-tag" style="color:${n.active?n.hex:"rgba(255,255,255,0.3)"};border-color:${n.active?n.hex:"rgba(255,255,255,0.12)"};font-weight:${n.active?"800":"400"}">
          ${n.name}
        </span>`).join("")}if(t==="color_wires"&&(this._cqTargets=[],ht.forEach(s=>{const o=this._makeWire({col:s.col,r:.14,shape:"round",id:s.id},0);o.position.z=s.z,this._add(o),this._cqTargets.push(o),this._add(this._makeCopperEnd(-2.71,s.z,!1)),this._add(this._makeCopperEnd(2.71,s.z,!1)),this._add(this._makeTermEnd(-2.7,s.z,.14)),this._add(this._makeTermEnd(2.7,s.z,.14));const i=ne(s.hex,s.lbl);i.position.set(0,.1,s.z),this._add(i);const a=e.focus;a&&a!==s.id&&(o.material.opacity=.2,o.material.transparent=!0),a===s.id&&(o.material.emissive=new L(s.col),o.material.emissiveIntensity=.25)})),t==="wt_slots"){const s=new f({color:662058,roughness:.9,transparent:!0,opacity:.6});Fe.forEach((o,i)=>{const a=(i-2)*1.1,n=new p(new k(.23,.23,5.6,24),s);n.rotation.z=Math.PI/2,n.position.set(a,-.35,0),this._add(n);const r=ne("#334455",o.lbl);r.position.set(a,.12,0),this._add(r)})}if(t==="wt_show"){const s=e.active??-1;Fe.forEach((o,i)=>{const a=(i-2)*1.1,n=i===s;let r;if(o.shape==="armored"){r=new A;const l=new p(new k(o.r,o.r,5.8,20),new f({color:5592405,roughness:.5,metalness:.6}));r.add(l),this._makeArmorRings(r,o.r,n?24:14),r.rotation.z=Math.PI/2,r.position.set(a,-.35,0),r.castShadow=!0,l.userData.wireId=o.id,this._cqTargets.push(l),this._add(r)}else{const l=new k(o.r,o.r,5.8,24),c=new f({color:o.col,roughness:.65,metalness:.05,transparent:!n,opacity:n?1:.22}),d=new p(l,c);d.rotation.z=Math.PI/2,d.position.set(a,-.35,0),d.castShadow=!0,d.userData.wireId=o.id,this._add(d),n&&(c.emissive=new L(o.col),c.emissiveIntensity=.2)}if(n){const l=ne(o.hex,o.lbl);l.position.set(a,.18,0),this._add(l);const c=this._el.querySelector("#wtl-wt-badge");this._el.querySelector("#wtl-wt-name").textContent=o.lbl,this._el.querySelector("#wtl-wt-tag").textContent=o.tag,c.classList.add("show")}this._add(this._makeCopperEnd(a-2.91,0)),this._add(this._makeCopperEnd(a+2.91,0)),this._add(this._makeTermEnd(a-2.9,0,o.r)),this._add(this._makeTermEnd(a+2.9,0,o.r))})}if(t==="awg_pair"){const s=e.hl;[{id:"awg14",r:.11,col:8934826,hex:"#8855aa",x:-1.1,lbl:"AWG 14"},{id:"awg12",r:.155,col:13395456,hex:"#cc6600",x:1.1,lbl:"AWG 12"}].forEach(i=>{const a=s===i.id||!s,n=new f({color:i.col,roughness:.6,metalness:.05,transparent:!a,opacity:a?1:.25}),r=new p(new k(i.r,i.r,5.4,22),n);r.rotation.z=Math.PI/2,r.position.set(i.x,-.35,0),r.castShadow=!0,a&&(n.emissive=new L(i.col),n.emissiveIntensity=s?.25:0),this._add(r);const l=ne(i.hex,i.lbl);l.position.set(i.x,.12,0),this._add(l),this._add(this._makeCopperEnd(i.x-2.71,0)),this._add(this._makeCopperEnd(i.x+2.71,0))})}if(t==="awg_fire"){const s=new f({color:8934826,roughness:.6,metalness:.05}),o=new p(new k(.11,.11,5.4,22),s);o.rotation.z=Math.PI/2,o.position.set(0,-.35,0),o.castShadow=!0,this._add(o),this._fireObjs.push({mesh:o,mat:s,t:0}),this._el.querySelector("#wtl-scene").classList.add("fire-anim");const i=ne("#ff4400","AWG 14");i.position.set(0,.12,0),this._add(i)}if(t!=="bench_clean"&&(t==="wt_all"&&Fe.forEach((s,o)=>{const i=(o-2)*1.25,a=new f({color:s.col,roughness:.65,metalness:s.shape==="armored"?.7:.05}),n=new p(new k(s.r,s.r,5.4,22),a);n.rotation.z=Math.PI/2,n.position.set(i,-.35,0),n.castShadow=!0,this._add(n);const r=ne(s.hex,s.lbl);r.position.set(i,.12,0),this._add(r),a.emissive=new L(s.col),a.emissiveIntensity=.15}),t==="quiz"||t==="quiz_intro")){const s=e.qi;if(s==null)return;const i=Ue[s].vis;let a=Fe.find(r=>r.id.toLowerCase()===i),n=ht.find(r=>r.id===i);if(i==="awg"){const r=new f({color:13395456,roughness:.6,metalness:0}),l=new p(new k(.155,.155,5.4,22),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,this._add(l);const c=ne("#cc6600","AWG 12");c.position.set(0,.12,0),this._add(c)}else if(a){const r=new f({color:a.col,roughness:.65,metalness:a.shape==="armored"?.7:.05}),l=new p(new k(a.r,a.r,5.4,22),r);if(l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,a.shape==="armored"){const d=new A;d.add(l),this._makeArmorRings(d,a.r,22),d.rotation.z=Math.PI/2,d.children[0].rotation.z=0,d.position.set(0,-.35,0),this._add(d)}else r.emissive=new L(a.col),r.emissiveIntensity=.15,this._add(l);const c=ne(a.hex,a.lbl);c.position.set(0,.18,0),this._add(c)}else if(n){const r=new f({color:n.col,roughness:.6,metalness:.05}),l=new p(new k(.14,.14,5.4,24),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,r.emissive=new L(n.col),r.emissiveIntensity=.2,this._add(l);const c=ne(n.hex,n.lbl);c.position.set(0,.12,0),this._add(c)}else if(i==="outdoor"){const r=new f({color:5075008,roughness:.7,metalness:0}),l=new p(new k(.22,.22,5.4,22),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,r.emissive=new L(5075008),r.emissiveIntensity=.2,this._add(l);const c=ne("#4d7040","UF-B");c.position.set(0,.12,0),this._add(c)}else if(i==="neutral"){const r=new f({color:14211288,roughness:.6,metalness:.05}),l=new p(new k(.14,.14,5.4,24),r);l.rotation.z=Math.PI/2,l.position.set(0,-.35,0),l.castShadow=!0,this._add(l);const c=ne("#d8d8d8","WHITE");c.position.set(0,.12,0),this._add(c)}}}}_updateThree(){if(!this._three)return;const{camera:e,lamp:t}=this._three,s=performance.now()*.001,o=oe[this._step],i=o.cam,a=new v(...i.p),n=new v(...i.t);this._camPos.lerp(a,.042),this._camTarget.lerp(n,.042),e.position.copy(this._camPos),e.lookAt(this._camTarget),t.intensity=1.5+Math.sin(s*4.1)*.07;for(const r of this._dropObjs){const l=r.mesh.position.y-r.target;Math.abs(l)<.01&&Math.abs(r.vel)<.002?r.mesh.position.y=r.target:(r.vel+=-.018*l-.18*r.vel,r.mesh.position.y+=r.vel)}for(const r of this._sceneObjs)r.userData&&r.userData.floatIdx!==void 0&&(r.position.y=r.userData.baseY+Math.sin(s*.55+r.userData.floatIdx*1.1)*.018);for(const r of this._fireObjs){r.t+=.04;const l=(Math.sin(r.t*3.1)+1)*.5;r.mat.emissive=new L(16729088),r.mat.emissiveIntensity=.4+l*.6,r.mat.color=new L(16720384)}if(this._sparks=this._sparks.filter(r=>(r.life-=.024,r.life<=0?(this._three.scene.remove(r.mesh),!1):(r.vel.y-=.005,r.mesh.position.addScaledVector(r.vel,1),r.mesh.material.opacity=r.life,!0))),o.t==="color"||o.t==="cquiz"||o.t==="color_sum"){for(const r of this._sceneObjs)if(r.isMesh&&r.userData.wireId&&!r.material.transparent){const l=ht.find(c=>c.id===r.userData.wireId);if(l&&this._cqActive){const c=this._cqTargetId===l.id;r.material.emissive=new L(l.col),r.material.emissiveIntensity=c?.08+Math.sin(s*3)*.08:0}}}}_spawnSparks(e){if(this._three)for(let t=0;t<16;t++){const s=new j({color:[16763904,16737792,16777215][t%3],transparent:!0,opacity:1}),o=new p(new Ee(.032,4,4),s);o.position.copy(e),this._three.scene.add(o),this._sparks.push({mesh:o,life:.7+Math.random()*.6,vel:new v((Math.random()-.5)*.09,.05+Math.random()*.09,(Math.random()-.5)*.09)})}}_showFeedback(e){const t=this._el.querySelector("#wtl-feedback");this._el.querySelector("#wtl-fb").textContent=e,t.classList.add("show"),setTimeout(()=>t.classList.remove("show"),800)}_startColorQuiz(){this._cqIdx=0,this._cqCorrect=0,this._cqActive=!0,this._renderColorQuizRound(),this._el.querySelector("#wtl-next").disabled=!0}_renderColorQuizRound(){const e=[{id:"red",role:"HOT",hex:"#cc2222"},{id:"white",role:"NEUTRAL",hex:"#d8d8d8"},{id:"green",role:"GROUND",hex:"#1a9e44"}],t=e[this._cqIdx];this._cqTargetId=t.id;const s=Math.round(this._step/(oe.length-1)*100);this._el.querySelector("#wtl-dialog").innerHTML=`
      <div class="wtl-cquiz-inline" id="wtl-cq-inline">
        <div class="wtl-cquiz-inline-label">TAP THE CORRECT WIRE</div>
        <div class="wtl-cquiz-inline-role" style="color:${t.hex}">${t.role}</div>
        <div class="wtl-cquiz-inline-prog">${e.map((o,i)=>`<div class="wtl-cquiz-pip ${i<this._cqIdx?"done":i===this._cqIdx?"active":""}"></div>`).join("")}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${s}%"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct">${s}%</span>
      </div>`,this._el.querySelector("#wtl-tap-hint").style.display="block"}_onColorTap(e,t){if(this._cqActive)if(e===this._cqTargetId)if(this._showFeedback("✅"),this._spawnSparks(t),this._cqCorrect++,this._cqIdx++,this._cqIdx>=3){this._cqActive=!1,this._el.querySelector("#wtl-tap-hint").style.display="none",this._el.querySelector("#wtl-next").disabled=!1,this._el.querySelector("#wtl-next").textContent="NEXT CHAPTER";const s=Math.round(this._step/(oe.length-1)*100);this._el.querySelector("#wtl-dialog").innerHTML=`
          <div class="wtl-cquiz-inline">
            <div class="wtl-cquiz-inline-role" style="color:#2dc653">ALL CORRECT ✓</div>
            <div class="wtl-cquiz-inline-label">Tap NEXT CHAPTER to continue</div>
          </div>
          <div class="wtl-progress-row">
            <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog" style="width:${s}%"></div></div>
            <span class="wtl-prog-pct" id="wtl-pct">${s}%</span>
          </div>`}else setTimeout(()=>this._renderColorQuizRound(),450);else{this._showFeedback("❌");const s=this._el.querySelector("#wtl-cq-inline");s&&(s.classList.remove("shake"),s.offsetWidth,s.classList.add("shake"))}}_renderQuiz(e){const t=Ue[e],s=this._el.querySelector("#wtl-dialog");s.innerHTML=`
      <div class="wtl-quiz-area">
        <p class="wtl-quiz-q">${t.q}</p>
        <div class="wtl-quiz-opts">
          ${t.opts.map((o,i)=>`
            <button class="wtl-opt" data-idx="${i}">${o}</button>
          `).join("")}
        </div>
        <div class="wtl-quiz-hint" id="wtl-quiz-hint">${t.hint}</div>
      </div>
      <div class="wtl-progress-row">
        <div class="wtl-prog-bar"><div class="wtl-prog-fill" id="wtl-prog"></div></div>
        <span class="wtl-prog-pct" id="wtl-pct"></span>
      </div>`,s.querySelectorAll(".wtl-opt").forEach(o=>{o.addEventListener("click",()=>this._onQuizAnswer(e,parseInt(o.dataset.idx)))})}_onQuizAnswer(e,t){if(this._quizDone)return;const s=Ue[e];if(this._el.querySelectorAll(".wtl-opt").forEach((i,a)=>{i.style.pointerEvents="none",a===s.ans?i.classList.add("correct"):a===t&&i.classList.add("wrong")}),t===s.ans)this._showFeedback("✅"),this._quizDone=!0,this._el.querySelector("#wtl-next").disabled=!1;else{this._showFeedback("❌");const i=this._el.querySelector("#wtl-quiz-hint");i&&i.classList.add("show"),setTimeout(()=>{this._quizDone=!0,this._el.querySelector("#wtl-next").disabled=!1},900)}}_render(){const e=oe[this._step],t=oe.length,s=Math.round(this._step/(t-1)*100);this._el.querySelector("#wtl-ch-lbl").textContent=e.chLbl||"",this._el.querySelector("#wtl-step-num").textContent=`${this._step+1}/${t}`;const o=this._el.querySelector("#wtl-dots");o.innerHTML=oe.map((n,r)=>`<div class="wtl-dot ${r<this._step?"done":r===this._step?"active":""}"></div>`).join("");const i=this._el.querySelector("#wtl-next"),a=this._el.querySelector("#wtl-prev");if(a.style.visibility=this._step===0?"hidden":"visible",e.t==="quiz")this._quizDone=!1,i.disabled=!0,i.textContent="NEXT →",this._renderQuiz(e.qi),requestAnimationFrame(()=>{const n=this._el.querySelector("#wtl-prog"),r=this._el.querySelector("#wtl-pct");n&&(n.style.width=s+"%"),r&&(r.textContent=s+"%")});else{this._el.querySelector("#wtl-bubble")||(this._el.querySelector("#wtl-dialog").innerHTML=`
          <div class="wtl-bubble" id="wtl-bubble">
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
          </div>`,this._el.querySelector("#wtl-bubble-tap").addEventListener("click",()=>this._onNext())),this._el.querySelector("#wtl-text").textContent=e.text||"",this._el.querySelector("#wtl-prog").style.width=s+"%",this._el.querySelector("#wtl-pct").textContent=s+"%";const n=e.t==="cquiz",r=!n&&!e.btn;this._el.querySelector("#wtl-bubble-tap").style.display=r?"block":"none",i.disabled=n,i.textContent=e.btn||"NEXT →";const l=this._el.querySelector("#wtl-avatar");l&&(e.mascotIn?(l.classList.remove("entered"),requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add("entered")))):l.classList.add("entered")),n&&this._startColorQuiz()}}_gotoStep(e){this._step=Math.max(0,Math.min(oe.length-1,e));const t=oe[this._step];this._applyScene(t),this._render()}_onNext(){if(oe[this._step].t==="done"){const t=C.getLearnStage("wireTypes");C.completeLesson("wireTypes"),C.saveLearnStage("wireTypes"),t||C.addXP(100),this.state.setState("stagesHub");return}this._step<oe.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}onShow(){this._step=0,this._camPos.set(4,3,8),this._camTarget.set(0,0,0),this._sparks=[],this._render(),setTimeout(()=>this._initThree(),80)}onHide(){this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._three&&(this._clearSceneObjs(),this._three.renderer.dispose(),this._three=null),this._sparks=[]}}const ve=[{q:"What is fish tape used for?",opts:["Measuring wire resistance","Threading wire through installed conduit","Bending wire into terminal hooks","Cutting conduit to length"],a:1,vis:"fishtape",hint:"Fish tape is pushed through conduit first, then wire is attached to the end and pulled back through."},{q:"An electrician switches off the breaker. Before touching exposed conductors they should:",opts:["Proceed — breaker off means no power","Test with a voltage tester first","Check the wire color only","Use rubber gloves only"],a:1,vis:"tester",hint:"The breaker being off is not enough — always verify with a voltage tester before touching any conductor."},{q:"A crowded junction box needs wires bent into tight loops. The best tool is:",opts:["Lineman's pliers — wider jaw","Long nose pliers — narrow jaw fits tight spaces","Diagonal cutters — cut the excess","Conduit bender — bends the wire"],a:1,vis:"longnose",hint:"Long nose pliers have a narrow tapered jaw that reaches into tight spaces where lineman's cannot fit."},{q:"A screwdriver has a visible crack in its insulated handle. You should:",opts:["Tape it up and continue","Use it only on low-voltage work","Replace it immediately","Wrap with electrical tape"],a:2,vis:"flathead",hint:"A damaged handle offers no insulation protection between your hand and a live conductor. Replace immediately."},{q:"You suspect a wire break inside insulation with no visible damage. Which tool finds it?",opts:["Voltage tester — checks for live voltage","Fish tape — locates breaks mechanically","Multimeter in continuity mode — beeps when connected","Measuring tape — confirms wire length"],a:2,vis:"multimeter",hint:"Multimeter continuity mode sends a tiny test signal — no beep means the circuit path is broken."},{q:"Which tool bends rigid metal conduit to an accurate angle?",opts:["Lineman's pliers — strong enough to force it","Conduit bender — built specifically for this","Long nose pliers — precise control","Measuring tape — guides the bend angle"],a:1,vis:"conduitbender",hint:"The conduit bender's curved head and angle markings ensure accurate kink-free bends every time."}],Ge=[{id:"lineman",name:"LINEMAN'S PLIERS",col:13378082,row:0,xi:0,displayRz:0},{id:"dykes",name:"DIAGONAL CUTTERS",col:3364266,row:0,xi:1,displayRz:0},{id:"knife",name:"UTILITY KNIFE",col:5592422,row:0,xi:2,displayRz:0},{id:"longnose",name:"LONG NOSE PLIERS",col:8947848,row:0,xi:3,displayRz:0},{id:"conduitbender",name:"CONDUIT BENDER",col:8930304,row:0,xi:4,displayRz:0},{id:"flathead",name:"FLATHEAD SCREWDRIVER",col:16755234,row:0,xi:5,displayRz:Math.PI/2},{id:"phillips",name:"PHILLIPS SCREWDRIVER",col:16746496,row:1,xi:0,displayRz:Math.PI/2},{id:"tape",name:"ELECTRICAL TAPE",col:1118481,row:1,xi:1,displayRz:0},{id:"tester",name:"VOLTAGE TESTER",col:16772608,row:1,xi:2,displayRz:Math.PI/2},{id:"multimeter",name:"MULTIMETER",col:3355443,row:1,xi:3,displayRz:0},{id:"fishtape",name:"FISH TAPE",col:16737792,row:1,xi:4,displayRz:0},{id:"measuringtape",name:"MEASURING TAPE",col:16763904,row:1,xi:5,displayRz:0}],J=[{t:"info",scene:"bench_clean",chLbl:"INTRO",title:"ELECTRICIAN'S TOOLS",text:"Meet the 12 tools every electrician uses! Learn what each one does, how to use it, and how to stay safe.",btn:"START →"},{t:"info",scene:"all_tools",chLbl:"OVERVIEW",title:"12 ESSENTIAL TOOLS",text:`Six categories:
✦ Cutting — wire and conduit
✦ Gripping — bending and holding
✦ Fastening — terminals and fittings
✦ Testing — safety first!
✦ Measuring — get it right
✦ Protection — electrical tape`,btn:"LET'S START →"},{t:"chap",scene:"cutting_group",ch:1,chLbl:"CH.1 CUTTING",title:"CUTTING TOOLS",text:"Three cutting tools — each for a different job. Always use the right one!"},{t:"tool",scene:"show_lineman",chLbl:"CH.1 CUTTING",toolName:"LINEMAN'S PLIERS",about:"The main tool for PH electrical work. Twists wires together, cuts thick conductors, and pulls wire through conduit.",features:[["✂","Cuts AWG 8–12"],["⟳","Wire Twisting"],["🛡","VDE 1000V"]],howTo:["Grip the wire in the serrated jaw.","Twist both handles to join wires.","Use the notch near the pivot to cut thick wire."],tip:"Always twist clockwise — it makes a tighter, stronger splice."},{t:"tool",scene:"show_dykes",chLbl:"CH.1 CUTTING",toolName:"DIAGONAL CUTTERS",about:"Angled jaws cut flush to the surface — great for clean, close cuts at terminals.",features:[["→","Flush Cut"],["🎯","Tight Spaces"],["✂","AWG 14–22"]],howTo:["Place the angled jaw flat against the surface.","Squeeze to shear the wire.","Cut zip ties at the base for a clean finish."],tip:"Cleaner cut than straight jaws — less fraying, less risk of a hot spot."},{t:"tool",scene:"show_knife",chLbl:"CH.1 CUTTING",toolName:"UTILITY KNIFE",about:"Scores the outer cable jacket only — never the wires inside. Always cut lengthwise, never in a ring.",features:[["|","Score Only"],["↩","Retractable"],["⚠","Away From Body"]],howTo:["Extend the blade carefully.","Score along the jacket lengthwise — not in a circle.","Bend the cable to open the cut and peel the jacket off."],tip:"Never cut in a ring — it will nick the wires underneath!"},{t:"chap",scene:"gripping_group",ch:2,chLbl:"CH.2 GRIPPING",title:"GRIPPING TOOLS",text:"Two tools: one for detail work, one for bending conduit."},{t:"tool",scene:"show_longnose",chLbl:"CH.2 GRIPPING",toolName:"LONG NOSE PLIERS",about:"Narrow jaws reach into tight spots. Great for bending wire ends and positioning wires inside boxes.",features:[["↔","Tight Reach"],["⌒","Hook Bending"],["◆","Precise Grip"]],howTo:["Hold the wire tip with the narrow jaws.","Bend gently to the angle you need.","Make a J-hook shape for screw terminals."],tip:"Move gently — forcing it can crush soft copper wire."},{t:"tool",scene:"show_conduitbender",chLbl:"CH.2 GRIPPING",toolName:"CONDUIT BENDER",about:"Bends rigid conduit to exact angles. The angle marks and foot step help you bend without kinking.",features:[["📐","Angle Marks"],["⚙","No Kinks"],["⬇","Foot Step"]],howTo:["Hook the head onto the conduit at the bend mark.","Press down on the foot step steadily.","Stop exactly at the angle marker you need."],tip:"Never bend by hand — a kink blocks wires from passing through forever."},{t:"chap",scene:"fastening_group",ch:3,chLbl:"CH.3 FASTENING",title:"FASTENING TOOLS",text:"Use the right screwdriver tip — wrong tips damage screws and can be dangerous."},{t:"tool",scene:"show_flathead",chLbl:"CH.3 FASTENING",toolName:"FLATHEAD SCREWDRIVER",about:"Fits slotted screws on outlets, switches, and breakers. The tip must match the slot exactly — too narrow and it slips.",features:[["—","Slotted Tip"],["⚡","Panel Ready"],["🛡","VDE Handle"]],howTo:["Match the tip width to the slot.","Press down firmly while turning.","Snug tight only — overtightening cracks the terminal."],tip:"A slipping tip can cause arc flash — always match it before turning!"},{t:"tool",scene:"show_phillips",chLbl:"CH.3 FASTENING",toolName:"PHILLIPS SCREWDRIVER",about:"Cross tip for Phillips screws on boxes and cover plates. It self-centers — safer near live parts.",features:[["✚","Cross Tip"],["🎯","Self-Centers"],["📦","Box Mount"]],howTo:["Place the tip on the screw — it seats itself.","Press down and turn.","Match the tip size (#1, #2, #3) to the screw."],tip:"If the tip feels loose, switch sizes — a stripped head is very hard to remove."},{t:"chap",scene:"testing_group",ch:4,chLbl:"CH.4 TESTING",title:"TESTING & MEASURING",text:"Use these before touching any wire — they keep you safe."},{t:"tool",scene:"show_tester",chLbl:"CH.4 TESTING",toolName:"VOLTAGE TESTER",about:"Detects live voltage without touching bare wire. Beeps and lights up the moment it senses power. The most important safety tool you own.",features:[["🔴","NCV Sensor"],["🔔","Beep Alert"],["🛡","No Contact"]],howTo:["Hold the tip near the wire — no touching needed.","Beep + red light = live wire — do not touch!","Test every wire, even after the breaker is off."],tip:"Test on a live outlet first — a dead tester gives no warning at all."},{t:"tool",scene:"show_multimeter",chLbl:"CH.4 TESTING",toolName:"MULTIMETER",about:"Measures voltage, continuity, and resistance. Use it to check outlets, test for unbroken wires, and find loose connections.",features:[["V","Voltage"],["~","Continuity"],["Ω","Resistance"]],howTo:["Turn the dial to the right mode (V, Ω, or continuity).","BLACK probe to COM, RED to measurement port.","Beep in continuity mode = wire is unbroken!"],tip:"Always connect the BLACK probe first — it avoids a short on first touch."},{t:"tool",scene:"show_fishtape",chLbl:"CH.4 TESTING",toolName:"FISH TAPE",about:"Flexible steel tape on a reel. Push it through conduit first, hook your wire to the end, then pull it back through.",features:[["🌀","Reel Feed"],["↩","Hook End"],["💧","Lube Compatible"]],howTo:["Feed the tape into the conduit and push it through.","Hook your wire to the end at the far opening.","Wind the reel to pull the wire back through."],tip:"Use lubricant on runs over 5m — it stops the wire jacket from overheating."},{t:"tool",scene:"show_measuringtape",chLbl:"CH.4 TESTING",toolName:"MEASURING TAPE",about:"Measure conduit runs and cut wire to length. Always add 15–20% extra — short wire inside a wall can't be fixed.",features:[["📏","Accurate"],["📌","Box Locate"],["➕","Add 15–20%"]],howTo:["Extend and lock the blade at your measurement.","Mark your cut point on the wire or conduit.","Add 15–20% extra for bends and tails."],tip:"Add length for every bend — short wire in conduit can never be extended."},{t:"chap",scene:"show_tape",ch:5,chLbl:"CH.5 PROTECTION",title:"ELECTRICAL TAPE",text:"Covers exposed wire — used in almost every connection."},{t:"tool",scene:"show_tape",chLbl:"CH.5 PROTECTION",toolName:"ELECTRICAL TAPE",about:"Vinyl tape rated 600V. Stretchy enough to wrap tightly with no gaps — overlap each layer by half.",features:[["⚡","600V Rated"],["🌡","80°C Max"],["🔄","Self-Sealing"]],howTo:["Stretch it as you wrap — tension seals it tight.","Overlap each wrap by half the width.","Extend 10mm past the bare copper on each side."],tip:"Tape is not a connector — always use wire nuts first, then tape over."},{t:"chap",scene:"all_tools",ch:6,chLbl:"CH.6 SAFETY",title:"TOOL SAFETY",text:"Four rules — follow them every single time."},{t:"info",scene:"all_tools",chLbl:"CH.6 SAFETY",title:"RULES FOR SAFE TOOL USE",text:`1. INSPECT — Check handles and jaws before every job.
2. RIGHT TOOL — Never use pliers as a hammer.
3. VDE RATED — All handles must be VDE 1000V rated.
4. STORE PROPERLY — Keep tools separate — nicked jaws cause hot spots.`,btn:"START QUIZ →"},{t:"quiz",qi:0,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:1,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:2,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:3,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:4,scene:"quiz",chLbl:"QUIZ"},{t:"quiz",qi:5,scene:"quiz",chLbl:"QUIZ"},{t:"done",scene:"all_tools",cam:{p:[0,5,13],t:[0,0,0]},chLbl:"COMPLETE",title:"MODULE COMPLETE",text:`You know your tools! 12 tools down — their purpose and the rules that keep you safe.

Next: Wire Stripping — time to put them to work!`,btn:"FINISH"}],_s=`
/* ── LESSON WRAPPER ─────────────────────────────────────── */
.etl{position:absolute;inset:0;display:flex;flex-direction:column;background:#060a14;font-family:'Barlow Condensed',sans-serif;overflow:hidden;}

/* ── TOP BAR ────────────────────────────────────────────── */
.etl-top{
  height:calc(50px + env(safe-area-inset-top));flex-shrink:0;
  background:linear-gradient(180deg,rgba(2,5,14,.98) 0%,rgba(4,8,20,.9) 100%);
  border-bottom:1px solid rgba(0,212,255,.14);
  box-shadow:0 2px 16px rgba(0,0,0,.6);
  display:flex;align-items:flex-end;padding:env(safe-area-inset-top) 12px 10px;gap:8px;
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

/* ── MAIN SPLIT LAYOUT ───────────────────────────────────── */
.etl-main{flex:1;display:flex;flex-direction:row;min-height:0;overflow:hidden;}

/* ── 3D SCENE ────────────────────────────────────────────── */
.etl-scene{
  flex:1;
  position:relative;background:#060a14;overflow:hidden;
}
.etl-canvas{display:block;width:100%;height:100%;}

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
@keyframes etlDialogIn{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
.etl-dialog{
  width:38%;flex-shrink:0;
  background:linear-gradient(180deg,rgba(4,8,20,.98) 0%,rgba(6,10,24,.98) 100%);
  border-right:1px solid rgba(0,212,255,.14);
  padding:12px 14px;
  display:flex;flex-direction:column;gap:8px;
  overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
  animation:etlDialogIn .32s cubic-bezier(.25,.46,.45,.94) both;
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
.etl-rich{display:flex;flex-direction:column;gap:6px;flex:1;overflow:hidden;}
.etl-rich-col{display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
.etl-rich-hd{font-size:8px;font-weight:800;letter-spacing:2px;color:#00d4ff;display:flex;align-items:center;gap:4px;}
.etl-rich-hd-icon{width:13px;height:13px;border-radius:50%;border:1.5px solid rgba(0,212,255,.6);display:flex;align-items:center;justify-content:center;font-size:7px;flex-shrink:0;}
.etl-about-text{font-size:11px;color:rgba(255,255,255,.75);line-height:1.45;}
.etl-feat-row{display:flex;flex-wrap:wrap;gap:3px;}
.etl-feat-item{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:5px;padding:3px 6px;}
.etl-feat-icon{font-size:10px;flex-shrink:0;}
.etl-feat-label{font-size:9px;font-weight:700;color:rgba(255,255,255,.55);}
.etl-howto-steps{display:flex;flex-direction:column;gap:3px;}
.etl-step{display:flex;align-items:flex-start;gap:5px;}
.etl-step-num{width:14px;height:14px;border-radius:4px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#00d4ff;flex-shrink:0;margin-top:1px;}
.etl-step-text{font-size:10px;color:rgba(255,255,255,.68);line-height:1.4;}
.etl-tip-box{background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.12);border-radius:7px;padding:5px 8px;flex-shrink:0;}
.etl-tip-head{font-size:8px;font-weight:800;letter-spacing:1.5px;color:#00d4ff;margin-bottom:2px;}
.etl-tip-text{font-size:10px;color:rgba(255,255,255,.55);line-height:1.4;}

/* ── BOTTOM NAV BAR ─────────────────────────────────────── */
.etl-bottom{
  height:calc(62px + env(safe-area-inset-bottom));flex-shrink:0;
  background:rgba(4,8,18,.98);border-top:1px solid rgba(0,212,255,.1);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 16px env(safe-area-inset-bottom);gap:10px;
}
.etl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.etl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.etl-dot.done{background:#2dc653;}
.etl-dot.active{background:#00d4ff;width:14px;border-radius:3px;}
.etl-nav-prev{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:0 18px;height:44px;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,.6);cursor:pointer;min-width:72px;-webkit-tap-highlight-color:transparent;transition:transform .1s;touch-action:manipulation;}
.etl-nav-prev:active{transform:scale(.93);}
.etl-nav-next{background:linear-gradient(135deg,#00d4ff,#2dc653);border:none;border-radius:10px;padding:0 18px;height:44px;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:900;color:#000;cursor:pointer;min-width:96px;letter-spacing:1px;box-shadow:0 0 12px rgba(0,212,255,.2);transition:transform .1s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
.etl-nav-next:active{transform:scale(.93);}
`;function ys(){if(document.querySelector("#etl-css"))return;const u=document.createElement("style");u.id="etl-css",u.textContent=_s,document.head.appendChild(u)}class ks{constructor(e){this.state=e,this._step=0,this._renderer=null,this._raf=null,this._toolMeshes={},this._quizAnswered=!1,this._quizScore=0,this._targetCam=null,this._camTarget=new v,this._camPos=new v,this.container=this._build()}_build(){ys();const e=document.createElement("div");e.className="screen screen-hidden",e.innerHTML=`
      <div class="etl">
        <header class="etl-top">
          <button class="etl-back">← BACK</button>
          <span class="etl-chlbl" id="etl-chlbl">TOOLS</span>
          <span class="etl-prog" id="etl-prog"></span>
        </header>
        <div class="etl-main">
          <div class="etl-dialog" id="etl-dialog"></div>
          <div class="etl-scene" id="etl-scene">
            <canvas id="etl-canvas" class="etl-canvas"></canvas>
            <div class="etl-tool-overlay" id="etl-tool-overlay"></div>
          </div>
        </div>
        <div class="etl-bottom" id="etl-bottom"></div>
      </div>`;const t=e.querySelector(".etl-back"),s=()=>this.state.setState("stagesHub");return t.addEventListener("click",s),t.addEventListener("touchend",o=>{o.preventDefault(),s()}),this._el=e,e}_initThree(){if(this._renderer)return;const e=this._el.querySelector("#etl-canvas"),t=this._el.querySelector("#etl-scene"),s=t.offsetWidth,o=t.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}this._renderer=new Me({canvas:e,antialias:!0,alpha:!1}),this._renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this._renderer.setSize(s,o),this._renderer.setClearColor(395796),this._renderer.shadowMap.enabled=!0,this._renderer.shadowMap.type=Pe,this._renderer.toneMapping=qe,this._renderer.toneMappingExposure=1.3,this._scene=new we,this._scene.background=new L(395796),this._scene.fog=new Ne(395796,.018),this._camera=new Ce(52,s/o,.1,100);const i=J[0].cam??{p:[0,3,8],t:[0,0,0]};this._camera.position.set(...i.p),this._camTarget.set(...i.t),this._camera.lookAt(this._camTarget),this._targetCam=i,it(this._scene),st(this._scene,{benchY:-.07,benchW:15,benchD:5}),this._toolSpot=new Je(16772829,5.5),this._toolSpot.position.set(1.8,4.5,2.2),this._toolSpot.target.position.set(0,.1,0),this._toolSpot.angle=.38,this._toolSpot.penumbra=.55,this._toolSpot.decay=1.4,this._toolSpot.castShadow=!0,this._toolSpot.shadow.mapSize.set(1024,1024),this._toolSpot.shadow.bias=-.002,this._scene.add(this._toolSpot),this._scene.add(this._toolSpot.target),this._rimLight=new de(3368703,.55),this._rimLight.position.set(-3,3,-4),this._scene.add(this._rimLight);for(const a of Ge){const n=this[`_build_${a.id}`](a);n.visible=!1,this._scene.add(n),this._toolMeshes[a.id]=n,n.userData.baseY=n.position.y,n.userData.baseRx=n.rotation.x,n.userData.baseScale=n.scale.x,n.userData.displayRz=a.displayRz??0}this._resizeObs=new ResizeObserver(()=>{const a=t.offsetWidth,n=t.offsetHeight;!a||!n||(this._camera.aspect=a/n,this._camera.updateProjectionMatrix(),this._renderer.setSize(a,n))}),this._resizeObs.observe(t),this._tick(),J[this._step]&&this._applyScene(J[this._step].scene,J[this._step])}_mat(e,t=.2,s=.65){return new f({color:e,metalness:t,roughness:s})}_build_lineman(){const e=new A,t=new f({color:7237230,roughness:.22,metalness:.88}),s=new f({color:3355443,roughness:.35,metalness:.8}),o=new f({color:11184810,roughness:.12,metalness:.95}),i=new f({color:13373713,roughness:.78,metalness:0}),a=new f({color:1118481,roughness:.76,metalness:0}),n=new f({color:10030606,roughness:.85,metalness:0}),r=new f({color:1710618,roughness:.85,metalness:0}),l=new A,c=new A,d=new p(new y(.62,.052,.16),t);d.position.set(.2,.66-.47,0),l.add(d);for(let x=0;x<9;x++){const T=new p(new y(.042,.022,.163),s);T.position.set(-.16+x*.065,.686-.47,0),l.add(T)}const h=new p(new y(.058,.28,.13),t);h.position.set(-.045,.33-.47,0),l.add(h);const g=new p(new ae(.052,.55,6,14),i);g.position.set(-.092,.05-.47,0),g.rotation.z=.24,l.add(g);for(let x=0;x<6;x++){const T=new p(new N(.054,.008,6,18),n);T.position.set(-.092+Math.sin(.24)*(-.1+x*.065),.2-.47-x*.075,0),T.rotation.set(Math.PI/2,0,.24),l.add(T)}const b=new p(new y(.08,.042,.082),s);b.position.set(-.07,.475-.47,.041),l.add(b);const w=new p(new y(.62,.052,.16),t);w.position.set(.2,.604-.47,0),c.add(w);for(let x=0;x<9;x++){const T=new p(new y(.042,.022,.163),s);T.position.set(-.16+x*.065,.583-.47,0),c.add(T)}const m=new p(new y(.058,.28,.13),t);m.position.set(.045,.33-.47,0),c.add(m);const _=new p(new ae(.052,.55,6,14),a);_.position.set(.092,.05-.47,0),_.rotation.z=-.24,c.add(_);for(let x=0;x<6;x++){const T=new p(new N(.054,.008,6,18),r);T.position.set(.092+Math.sin(-.24)*(-.1+x*.065),.2-.47-x*.075,0),T.rotation.set(Math.PI/2,0,-.24),c.add(T)}const E=new p(new y(.08,.042,.082),s);E.position.set(-.07,.475-.47,-.041),c.add(E),l.position.y=.47,c.position.y=.47;const M=new p(new k(.048,.048,.19,6),o);M.rotation.x=Math.PI/2,M.position.set(0,.47,0),e.add(M);const S=new p(new k(.044,.044,.008,6),s);return S.rotation.x=Math.PI/2,S.position.set(0,.47,.098),e.add(S),e.add(l),e.add(c),e.userData.armA=l,e.userData.armB=c,e.position.y=.08,e}_build_dykes(){const e=new A,t=this._mat(6710886,.8,.3),s=new A,o=new A,i=new p(new y(.13,.032,.07),t);i.position.set(-.04,.4-.28,0),i.rotation.z=-.32,s.add(i);const a=new p(new ae(.032,.36,4,8),this._mat(3364266));a.position.set(.05,.04-.28,0),a.rotation.z=.18,s.add(a);const n=new p(new y(.13,.032,.07),t);n.position.set(.04,.4-.28,0),n.rotation.z=.32,o.add(n);const r=new p(new ae(.032,.36,4,8),this._mat(1710638));r.position.set(-.05,-.15-.28,0),r.rotation.z=-.18,o.add(r),s.position.y=.28,o.position.y=.28;const l=new p(new k(.022,.022,.11,8),t);return l.rotation.x=Math.PI/2,l.position.y=.28,e.add(l),e.add(s),e.add(o),e.userData.armA=s,e.userData.armB=o,e.position.y=.08,e}_build_knife(){const e=new A,t=new p(new y(.1,.17,.52),this._mat(5592422));t.position.y=.085,e.add(t);const s=new p(new y(.006,.072,.28),this._mat(13158600,.9,.2));s.position.set(0,.12,-.34),e.add(s);const o=new p(new y(.006,.04,.06),this._mat(13158600,.9,.2));o.position.set(0,.09,-.45),o.rotation.x=.4,e.add(o);const i=new p(new y(.042,.058,.042),this._mat(3355460));return i.position.set(.073,.13,-.08),e.add(i),e.position.y=.085,e}_build_longnose(){const e=new A,t=new f({color:8026746,roughness:.2,metalness:.9}),s=new f({color:3355443,roughness:.35,metalness:.8}),o=new f({color:12303291,roughness:.1,metalness:.96}),i=new f({color:14492194,roughness:.76,metalness:0}),a=new f({color:1118481,roughness:.76,metalness:0}),n=new A,r=new A,l=new p(new y(.048,.8,.1),t);l.position.set(.022,.72-.22,0),l.rotation.z=.03,n.add(l);for(let w=0;w<7;w++){const m=new p(new y(.012,.044,.102),s);m.position.set(.01,.42-.22+w*.065,0),n.add(m)}const c=new p(new ae(.042,.5,5,12),i);c.position.set(.068,-.08-.22,0),c.rotation.z=.15,n.add(c);for(let w=0;w<5;w++){const m=new p(new N(.044,.007,6,16),new f({color:11145489,roughness:.85}));m.position.set(.068+Math.sin(.15)*(-.05+w*.058),-.02-.22-w*.068,0),m.rotation.set(Math.PI/2,0,.15),n.add(m)}const d=new p(new y(.048,.8,.1),t);d.position.set(-.022,.72-.22,0),d.rotation.z=-.03,r.add(d);for(let w=0;w<7;w++){const m=new p(new y(.012,.044,.102),s);m.position.set(-.01,.42-.22+w*.065,0),r.add(m)}const h=new p(new ae(.042,.5,5,12),a);h.position.set(-.068,-.08-.22,0),h.rotation.z=-.15,r.add(h);for(let w=0;w<5;w++){const m=new p(new N(.044,.007,6,16),new f({color:2236962,roughness:.85}));m.position.set(-.068+Math.sin(-.15)*(-.05+w*.058),-.02-.22-w*.068,0),m.rotation.set(Math.PI/2,0,-.15),r.add(m)}n.position.y=.22,r.position.y=.22;const g=new p(new k(.036,.036,.15,6),o);g.rotation.x=Math.PI/2,g.position.set(0,.22,0),e.add(g);const b=new A;for(let w=0;w<8;w++){const m=w/7*Math.PI,_=new p(new y(.012,.012,.012),new f({color:11184810,roughness:.3,metalness:.85}));_.position.set(Math.cos(m)*.055,.02,Math.sin(m)*.055),b.add(_)}return e.add(b),e.add(n),e.add(r),e.userData.armA=n,e.userData.armB=r,e.userData.spring=b,e.position.y=.08,e}_build_conduitbender(){const e=new A,t=this._mat(14505216,.3,.7),s=this._mat(8947848,.8,.3),o=[];for(let l=0;l<=20;l++){const c=l/20*(Math.PI*.6)-.12;o.push(new v(Math.sin(c)*.88,Math.cos(c)*.88,0))}const i=new p(new Ze(new Qe(o),20,.044,8,!1),t);i.position.set(0,.08,0),e.add(i);const a=new p(new k(.024,.024,1.45,8),s);a.position.set(0,-.68,0),e.add(a);const n=new p(new y(.14,.04,.09),t);n.position.set(-.34,.07,0),e.add(n);const r=new p(new y(.022,.022,.065),this._mat(16772608,0,1));return r.position.set(-.61,.73,.05),e.add(r),e.scale.setScalar(.85),e.position.y=.1,e}_build_flathead(){const e=new A,t=new f({color:10066329,roughness:.18,metalness:.92}),s=new f({color:13421772,roughness:.1,metalness:.96}),o=new f({color:16750848,roughness:.72,metalness:0}),i=new f({color:13399808,roughness:.82,metalness:0});for(let h=0;h<3;h++){const g=h/3*Math.PI*2,b=new p(new k(.052,.044,.46,10),o);b.position.set(Math.cos(g)*.02,.44,Math.sin(g)*.02),e.add(b)}const a=new p(new k(.058,.058,.028,14),i);a.position.y=.685,e.add(a);const n=new p(new k(.04,.035,.045,14),s);n.position.y=.195,e.add(n);for(let h=0;h<5;h++){const g=new p(new N(.056,.007,6,16),i);g.position.y=.6-h*.072,g.rotation.x=Math.PI/2,e.add(g)}const r=new p(new k(.018,.018,.18,6),t);r.position.y=.085,e.add(r);const l=new p(new k(.013,.013,.24,10),t);l.position.y=-.075,e.add(l);const c=new p(new y(.095,.01,.018),s);c.position.y=-.215,e.add(c);const d=new p(new y(.095,.005,.012),s);return d.position.y=-.222,e.add(d),e.position.y=.23,e}_build_phillips(){const e=new A,t=new f({color:10066329,roughness:.18,metalness:.92}),s=new f({color:13421772,roughness:.1,metalness:.96}),o=new f({color:16737792,roughness:.72,metalness:0}),i=new f({color:13386752,roughness:.82,metalness:0});for(let d=0;d<3;d++){const h=d/3*Math.PI*2,g=new p(new k(.052,.044,.46,10),o);g.position.set(Math.cos(h)*.02,.44,Math.sin(h)*.02),e.add(g)}const a=new p(new k(.058,.058,.028,14),i);a.position.y=.685,e.add(a);const n=new p(new k(.04,.035,.045,14),s);n.position.y=.195,e.add(n);for(let d=0;d<5;d++){const h=new p(new N(.056,.007,6,16),i);h.position.y=.6-d*.072,h.rotation.x=Math.PI/2,e.add(h)}const r=new p(new k(.018,.018,.18,6),t);r.position.y=.085,e.add(r);const l=new p(new k(.013,.013,.24,10),t);l.position.y=-.075,e.add(l),[0,1].forEach(d=>{const h=new p(new y(.082,.012,.016),s);h.position.y=-.212,h.rotation.y=d*Math.PI/2,e.add(h)});const c=new p(new Ke(.014,.028,8),s);return c.position.y=-.232,c.rotation.x=Math.PI,e.add(c),e.position.y=.23,e}_build_tape(){const e=new A,t=new p(new N(.27,.09,12,32),this._mat(1118481,.1,.9));t.rotation.x=Math.PI/2,e.add(t);const s=new p(new k(.17,.17,.18,16),this._mat(2761240,.1,.9));return e.add(s),e.scale.setScalar(.8),e.position.y=.22,e}_build_tester(){const e=new A,t=new f({color:16763904,roughness:.6,metalness:.1}),s=new f({color:1118481,roughness:.8,metalness:0}),o=new f({color:16777215,roughness:.1,transmission:.9,transparent:!0,opacity:.5}),i=new f({color:15658734,roughness:.4,metalness:.4}),a=new p(new k(.045,.038,.65,16),t);a.position.y=.12,e.add(a);const n=new p(new k(.04,.03,.28,16),s);n.position.y=-.34,e.add(n);for(let _=0;_<4;_++){const E=new p(new N(.042-_*.002,.005,6,16),s);E.position.y=-.25-_*.06,E.rotation.x=Math.PI/2,e.add(E)}const r=new p(new k(.015,.026,.22,12),i);r.position.y=-.59,e.add(r);const l=new p(new Ke(.015,.04,12),i);l.position.y=-.72,l.rotation.x=Math.PI,e.add(l);const c=new p(new k(.045,.045,.06,16),s);c.position.y=.47,e.add(c);const d=new p(new Ee(.035,12,12,0,Math.PI*2,0,Math.PI/2),o);d.position.y=.5,e.add(d);const h=new p(new Ee(.018,8,8),new f({color:16720384,emissive:16720384,emissiveIntensity:1.2}));h.position.set(0,.49,0),e.add(h);const g=new p(new y(.05,.02,.06),s);g.position.set(-.04,.45,0),e.add(g);const b=new p(new y(.015,.4,.03),s);b.position.set(-.06,.25,0),e.add(b);const w=new p(new y(.022,.02,.03),s);w.position.set(-.055,.05,0),e.add(w);const m=new p(new y(.018,.06,.03),s);return m.position.set(.042,.2,0),e.add(m),e.scale.setScalar(.88),e.position.y=.45,e}_build_multimeter(){const e=new A,t=new f({color:1710618,roughness:.65,metalness:0}),s=new f({color:16755200,roughness:.85,metalness:0}),o=new f({color:13373713,roughness:.5,metalness:.2}),i=new f({color:1118481,roughness:.5,metalness:.2}),a=new p(new y(.38,.6,.08),t);e.add(a);const n=new p(new y(.44,.64,.09),s);n.position.z=-.01,e.add(n);const r=document.createElement("canvas");r.width=128,r.height=64;const l=r.getContext("2d");l.fillStyle="#a1b5a5",l.fillRect(0,0,128,64),l.fillStyle="#111111",l.font="bold 42px monospace",l.fillText("120.4",8,48),l.font="14px sans-serif",l.fillText("V~",104,48);const c=new he(r),d=new p(new y(.28,.16,.02),new f({map:c,roughness:.2,metalness:.1}));d.position.set(0,.16,.041),e.add(d);const h=new p(new y(.3,.18,.015),t);h.position.set(0,.16,.04),e.add(h);const g=new p(new k(.11,.11,.015,24),t);g.rotation.x=Math.PI/2,g.position.set(0,-.06,.04),e.add(g);const b=new p(new k(.08,.08,.03,16),t);b.rotation.x=Math.PI/2,b.position.set(0,-.06,.05),e.add(b);for(let m=0;m<8;m++){const _=m/8*Math.PI*2,E=new p(new y(.02,.035,.025),t);E.position.set(Math.cos(_)*.08,-.06+Math.sin(_)*.08,.05),e.add(E)}const w=new p(new y(.012,.08,.035),new f({color:16777215}));return w.position.set(0,-.02,.05),e.add(w),[-.1,0,.1].forEach((m,_)=>{const E=new p(new k(.02,.02,.02,12),_===0?i:o);E.rotation.x=Math.PI/2,E.position.set(m,-.24,.042),e.add(E);const M=new p(new k(.012,.012,.022,12),new f({color:0}));M.rotation.x=Math.PI/2,M.position.set(m,-.24,.044),e.add(M)}),e.scale.setScalar(.78),e.position.y=.24,e}_build_fishtape(){const e=new A,t=this._mat(16737792,.2,.7),s=new p(new k(.32,.32,.14,20),t);e.add(s),[-.08,.08].forEach(a=>{const n=new p(new k(.35,.35,.02,20),this._mat(14500864,.2,.7));n.position.y=a,e.add(n)});const o=new p(new ae(.028,.22,4,8),this._mat(3355443,.1,.8));o.position.set(.36,.14,0),o.rotation.z=Math.PI/2,e.add(o);const i=new p(new y(.24,.012,.018),this._mat(8947848,.8,.3));return i.position.set(.34,0,0),e.add(i),e.rotation.x=Math.PI/2,e.scale.setScalar(.85),e.position.y=.27,e}_build_measuringtape(){const e=new A,t=new p(new y(.38,.22,.28),this._mat(16763904,.1,.7));e.add(t);for(let i=0;i<4;i++){const a=new p(new y(.005,.22,.28),this._mat(14526976,.1,.8));a.position.x=-.15+i*.1,e.add(a)}const s=new p(new y(.42,.018,.022),this._mat(14540253,.6,.4));s.position.set(.4,.06,.06),e.add(s);const o=new p(new y(.018,.26,.02),this._mat(5592405,.7,.4));return o.position.set(-.2,.02,.15),e.add(o),e.scale.setScalar(.85),e.position.y=.1,e}_applyScene(e,t){var n,r,l;for(const c of Object.values(this._toolMeshes))c.visible=!1,c.rotation.set(0,0,0),c.scale.setScalar(1);const s=(t==null?void 0:t.cam)??{p:[0,3,8],t:[0,0,0]};if(this._targetCam=s,e==="bench_clean")return;if(e==="all_tools"){Ge.forEach(c=>{const d=this._toolMeshes[c.id];d.visible=!0,d.position.set(-2.5+c.xi*1.02,.08,-.65+c.row*1.32),d.rotation.set(-Math.PI/2,0,0),d.scale.setScalar(.65)});return}const o={cutting_group:["lineman","dykes","knife"],gripping_group:["longnose","conduitbender"],fastening_group:["flathead","phillips"],testing_group:["tester","multimeter","fishtape","measuringtape"]};if(o[e]){const c=o[e],d=(c.length-1)*1.65;c.forEach((h,g)=>{const b=this._toolMeshes[h];b.visible=!0,b.position.set(-d/2+g*1.65,.08,0),b.rotation.set(-Math.PI/2,0,0),b.scale.setScalar(.85)});return}this._animProps&&(this._scene.remove(this._animProps),this._animProps=null);const i=e.startsWith("show_")||e.startsWith("anim_")||e==="quiz";if(this._toolSpot&&(this._toolSpot.intensity=i?5.5:0),this._rimLight&&(this._rimLight.intensity=i?.55:.18),e.startsWith("show_")||e==="quiz"?this._targetCam={p:[.35,1.5,2.8],t:[0,1,0]}:e.startsWith("anim_")&&(this._targetCam={p:[0,1.5,3],t:[0,1,0]}),i){const c=e==="quiz"?((n=ve[t==null?void 0:t.qi])==null?void 0:n.vis)??null:e.split("_")[1],d=c?this._toolMeshes[c]:null;if(d){d.visible=!0;const g=(d.userData.baseScale??1)*2;d.scale.setScalar(g);const b=Ge.find(E=>E.id===c),w=(b==null?void 0:b.displayRz)??0;d.rotation.set(d.userData.baseRx??0,.42,w),d.position.set(0,100,.1),d.updateMatrixWorld(!0);const m=new Xe().setFromObject(d),_=100.02-m.min.y;if(d.position.y=_,d.userData.displayY=_,this._toolSpot){const E=_-100,M=(m.min.y+m.max.y)*.5+E,S=m.max.y+E;this._toolSpot.target.position.set(.1,M,.1),this._toolSpot.target.updateMatrixWorld(),this._toolSpot.position.set(1.6,S+3.2,2)}}const h=(r=this._el)==null?void 0:r.querySelector("#etl-tool-overlay");if(h&&d&&c){const g=Ge.find(b=>b.id===c);h.textContent=(g==null?void 0:g.name)??"",h.classList.toggle("show",!!g&&e!=="quiz")}else h&&h.classList.remove("show");if(e.startsWith("anim_")){if(this._animProps=new A,this._animProps.position.set(0,(d==null?void 0:d.userData.displayY)??.2,.1),this._scene.add(this._animProps),c==="lineman"||c==="dykes"){const g=new p(new k(.038,.038,1.6,12),this._mat(13382451,.1,.7));g.rotation.z=Math.PI/2,g.position.set(.1,.18,0),this._animProps.add(g);const b=new p(new k(.028,.028,.12,8),this._mat(14252101,.1,.85));b.rotation.z=Math.PI/2,b.position.set(.82,.18,0),this._animProps.add(b)}else if(c==="flathead"||c==="phillips"){const g=new p(new k(.09,.07,.12,12),this._mat(8947848,.8,.3));g.position.set(0,-.22,0),this._animProps.add(g);const b=new p(new k(.07,.07,.6,12),this._mat(5592405,.5,.5));b.position.set(0,-.58,0),this._animProps.add(b)}else if(c==="tester"){const g=new p(new k(.038,.038,1.6,12),this._mat(1118481,.1,.7));g.rotation.z=Math.PI/2,g.position.set(.2,-.3,0),this._animProps.add(g)}}return}const a=(l=this._el)==null?void 0:l.querySelector("#etl-tool-overlay");a&&a.classList.remove("show")}_gotoStep(e){this._step=e,this._quizAnswered=!1;const t=J[e];this._el.querySelector("#etl-chlbl").textContent=t.chLbl??"TOOLS",this._el.querySelector("#etl-prog").textContent=`${e+1}/${J.length}`,this._el.querySelector(".etl").classList.toggle("etl--quiz",t.t==="quiz"),this._applyScene(t.scene,t),this._renderDialog(t),this._renderNav(t)}_renderDialog(e){const t=this._el.querySelector("#etl-dialog");if(e.t==="chap"){t.innerHTML=`
        <div class="etl-chap-wrap">
          <div class="etl-chap-num">CHAPTER ${e.ch}</div>
          <div class="etl-chap-title">${e.title}</div>
          <div class="etl-chap-body">${e.text}</div>
        </div>`;return}if(e.t==="quiz"){const s=ve[e.qi],o=ve.map((i,a)=>`<div class="etl-quiz-pip ${a<e.qi?"done":a===e.qi?"active":""}"></div>`).join("");t.innerHTML=`
        <div class="etl-quiz-header">
          <span class="etl-quiz-hd-label">Question ${e.qi+1} / ${ve.length}</span>
          <span class="etl-quiz-hd-score">${this._quizScore} correct</span>
        </div>
        <div class="etl-quiz-prog">${o}</div>
        <div class="etl-quiz-q">${s.q}</div>
        <div class="etl-quiz-opts">
          ${s.opts.map((i,a)=>`<button class="etl-quiz-opt" data-i="${a}">${i}</button>`).join("")}
        </div>`,t.querySelectorAll(".etl-quiz-opt").forEach(i=>{i.addEventListener("click",()=>this._onQuizAnswer(parseInt(i.dataset.i)))});return}if(e.t==="done"){const s=this._quizScore>=5?"#2dc653":this._quizScore>=3?"#ffaa22":"#ff4444";t.innerHTML=`
        <div class="etl-dlg-title">${e.title}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:${s};letter-spacing:2px;">QUIZ: ${this._quizScore}/${ve.length} CORRECT</div>
        <div class="etl-dlg-body">${e.text}</div>`;return}if(e.t==="tool"){const s=e.features.map(([i,a])=>`
        <div class="etl-feat-item">
          <span class="etl-feat-icon">${i}</span>
          <span class="etl-feat-label">${a}</span>
        </div>`).join(""),o=e.howTo.map((i,a)=>`
        <div class="etl-step">
          <div class="etl-step-num">${a+1}</div>
          <div class="etl-step-text">${i}</div>
        </div>`).join("");t.innerHTML=`
        <div class="etl-rich">
          <div class="etl-rich-col">
            <div class="etl-rich-hd"><div class="etl-rich-hd-icon">i</div> ABOUT THE TOOL</div>
            <div class="etl-about-text">${e.about}</div>
            <div class="etl-feat-row">${s}</div>
          </div>
          <div class="etl-rich-col">
            <div class="etl-rich-hd">HOW TO USE</div>
            <div class="etl-howto-steps">${o}</div>
          </div>
          <div class="etl-tip-box">
            <div class="etl-tip-head">💡 TIP</div>
            <div class="etl-tip-text">${e.tip}</div>
          </div>
        </div>`;return}t.innerHTML=`
      ${e.title?`<div class="etl-dlg-title">${e.title}</div>`:""}
      <div class="etl-dlg-body">${e.text??""}</div>`}_renderNav(e){var n,r;const t=this._el.querySelector("#etl-bottom");if(!t)return;const s=this._step,o=J.map((l,c)=>`<div class="etl-dot ${c<s?"done":c===s?"active":""}"></div>`).join("");if(e.t==="quiz"){t.innerHTML=`<div class="etl-dots">${o}</div>`;return}const i=s>0?'<button class="etl-nav-prev" id="etl-prev">← BACK</button>':'<div style="min-width:72px"></div>',a=e.btn??"NEXT →";t.innerHTML=`
      ${i}
      <div class="etl-dots">${o}</div>
      <button class="etl-nav-next" id="etl-next">${a}</button>`,(n=t.querySelector("#etl-next"))==null||n.addEventListener("click",()=>this._onNext()),(r=t.querySelector("#etl-prev"))==null||r.addEventListener("click",()=>this._onPrev())}_onNext(){if(J[this._step].t==="done"){const t=C.getLessonProgress().electricianTools;C.completeLesson("electricianTools"),C.saveLearnStage("electricianTools"),t||C.addXP(100+this._quizScore*25),this.state.setState("stagesHub");return}this._step<J.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}_onQuizAnswer(e){if(this._quizAnswered)return;this._quizAnswered=!0;const t=ve[J[this._step].qi];e===t.a&&this._quizScore++,this._el.querySelectorAll(".etl-quiz-opt").forEach((a,n)=>{a.disabled=!0,n===t.a?a.classList.add("correct"):n===e&&e!==t.a&&a.classList.add("wrong")});const s=this._el.querySelector("#etl-dialog"),o=document.createElement("div");o.className="etl-quiz-hint",o.textContent=t.hint,s.appendChild(o);const i=document.createElement("button");i.className="etl-quiz-next",i.textContent="NEXT →",i.addEventListener("click",()=>{this._step<J.length-1&&this._gotoStep(this._step+1)}),s.appendChild(i)}_tick(){var i,a;if(!this._renderer)return;this._raf=requestAnimationFrame(()=>this._tick());const e=performance.now()*.001;if(this._targetCam){const[n,r,l]=this._targetCam.p,[c,d,h]=this._targetCam.t;this._camera.position.x+=(n-this._camera.position.x)*.06,this._camera.position.y+=(r-this._camera.position.y)*.06,this._camera.position.z+=(l-this._camera.position.z)*.06,this._camTarget.x+=(c-this._camTarget.x)*.06,this._camTarget.y+=(d-this._camTarget.y)*.06,this._camTarget.z+=(h-this._camTarget.z)*.06,this._camera.lookAt(this._camTarget)}const t=J[this._step],s=(i=t==null?void 0:t.scene)==null?void 0:i.startsWith("anim_");if(((a=t==null?void 0:t.scene)==null?void 0:a.startsWith("show_"))||(t==null?void 0:t.scene)==="quiz"){for(const n of Object.values(this._toolMeshes)){if(!n.visible)continue;const r=n.userData.displayRz??0;n.rotation.y=.42+Math.sin(e*.32)*.5,n.rotation.z=r+Math.sin(e*.2)*.025;const l=n.userData.displayY??.2;n.position.y=l+Math.sin(e*.52)*.018}this._toolSpot&&(this._toolSpot.intensity=5.2+Math.sin(e*.7)*.4)}else if(s){const n=t.scene.split("_")[1],r=this._toolMeshes[n];if(r){const l=e*2.8,c=r.userData.displayY??.2;if(r.position.y=c+Math.sin(e*.52)*.016,n==="lineman"||n==="dykes"||n==="longnose"){r.rotation.y=.55+Math.sin(e*.3)*.3;const d=(Math.sin(l)*.5+.5)*.22;r.userData.armA&&(r.userData.armA.rotation.z=d),r.userData.armB&&(r.userData.armB.rotation.z=-d)}else if(n==="flathead"||n==="phillips")r.rotation.y=e*1.8,r.rotation.z=.12+Math.sin(l*.5)*.06;else if(n==="knife")r.rotation.y=.55+Math.sin(e*.4)*.5,r.rotation.z=.12+Math.sin(l*.5)*.18;else if(n==="tester"){r.rotation.y=.55+Math.sin(e*.3)*.35;const d=r.children.find(h=>{var g;return(g=h.material)==null?void 0:g.emissive});d&&(d.material.emissiveIntensity=.8+Math.sin(e*14)*.8)}else n==="conduitbender"?(r.rotation.y=.55,r.rotation.z=.12+Math.sin(l*.45)*.28):n==="tape"?r.rotation.y=e*1.4:r.rotation.y=.55+Math.sin(e*.3)*.5;this._toolSpot&&(this._toolSpot.intensity=5.2+Math.sin(e*.7)*.4)}}this._renderer.render(this._scene,this._camera)}onShow(){this._quizScore=0,this._gotoStep(0),setTimeout(()=>this._initThree(),80)}onHide(){this._raf&&(cancelAnimationFrame(this._raf),this._raf=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._renderer&&(this._renderer.dispose(),this._renderer=null,this._scene=null,this._camera=null,this._toolMeshes={},this._toolSpot=null,this._rimLight=null,this._animProps=null)}}const ft=[{q:"Which tool automatically adjusts to any wire gauge without notch selection?",opts:["Manual Stripper","Automatic Stripper","Utility Knife","Rotary Stripper"],a:1,hint:"Automatic strippers have self-adjusting jaws — no notch selection, no gauge matching required."},{q:"What is the correct technique when using a utility knife to strip wire insulation?",opts:["Score around the wire in a circle","Score along the length of the wire","Press the blade straight down","Spin the knife around the wire"],a:1,hint:"Scoring lengthwise cannot nick the conductor below. A circular score almost always does."},{q:"Which tool is best for removing the outer jacket of NM-B (Romex) cable?",opts:["Manual Wire Stripper","Rotary Stripper","Utility Knife","Automatic Stripper"],a:2,hint:"The outer NM-B sheath is too large for manual strippers. The utility knife scored lengthwise along the jacket is correct."},{q:"What happens when you use the wrong notch size on a manual wire stripper?",opts:["The insulation tears cleanly","The conductor strands get crushed or nicked","Nothing — it self-adjusts","The tool breaks"],a:1,hint:"Too small a notch crushes the copper strands inside. Always match the notch AWG marking to the wire gauge."},{q:"What is the correct exposed conductor length for most standard terminal connections?",opts:["2–3 mm","6–10 mm","15–20 mm","25–30 mm"],a:1,hint:"6–10 mm is the standard for most terminals. More creates a shock hazard; less means poor contact."}],Mt=[{q:"You are stripping 50 pieces of 14 AWG THHN on a job site. Speed matters most.",a:"automatic"},{q:"Removing the outer jacket from a length of NM-B (Romex) cable.",a:"knife"},{q:"Inside a distribution panel — one conductor, one precision ring cut needed.",a:"rotary"},{q:"Quick home repair: stripping a single 12 AWG TW wire at an outlet box.",a:"manual"},{q:"Preparing coaxial cable for a CCTV security camera installation.",a:"rotary"}],pt=[{id:"manual",name:"MANUAL STRIPPER",col:13378048,hex:"#cc2200",x:-2.8},{id:"automatic",name:"AUTO STRIPPER",col:1136076,hex:"#1155cc",x:-.9},{id:"knife",name:"UTILITY KNIFE",col:5592422,hex:"#666677",x:.9},{id:"rotary",name:"ROTARY STRIPPER",col:16755200,hex:"#ffaa00",x:2.8}],U=[{t:"intro",ch:0,chLbl:"WIRE STRIPPING",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",mascotIn:!0,text:`Before any wire can make a connection, it must be stripped. Use the wrong tool — or wrong technique — and you damage the conductor. That means heat, faults, and fire.

This lesson teaches you the four stripping tools used in Philippine electrical work.`,btn:"NEXT"},{t:"info",ch:0,chLbl:"WIRE STRIPPING",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:`Five chapters:
1 — Why tool choice matters
2 — The four stripping tools
3 — Tool selection challenge
4 — Strip quality standards
5 — Tool care and maintenance`,btn:"LET'S START"},{t:"chap",ch:1,chLbl:"CH.1 TOOL CHOICE",cam:{p:[0,2,6],t:[0,-.1,0]},scene:"bench_clean",text:"Three methods you will see on job sites — each one wrong. Understanding why helps you remember the correct approach.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_teeth",text:"TEETH — Never strip wire with your teeth. You nick the conductor at the bite point, creating a high-resistance stress spot that heats up under load. Illegal in all professional electrical installations.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_crush",text:"WRONG NOTCH — Too-small a notch on a manual stripper crushes the copper strands inside. Crushed strands have higher resistance. Under load that section heats up and melts the surrounding insulation from the inside.",btn:"NEXT"},{t:"bad",ch:1,chLbl:"CH.1 BAD METHODS",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"bad_nick",text:"DEEP KNIFE CUT — Scoring around the wire with a knife too deeply nicks the copper. Even a small nick concentrates stress — under load or repeated bending, the wire can break inside the wall where you cannot inspect it.",btn:"NEXT"},{t:"info",ch:1,chLbl:"CH.1 THE STANDARD",cam:{p:[0,1.8,5],t:[0,-.2,0]},scene:"good_strip",text:`A correct strip has three things:
✓ Clean 90° insulation edge — no tearing
✓ Zero nicks on the copper — smooth surface
✓ Correct length — 6 to 10 mm for most terminals

Every time. No exceptions.`,btn:"NEXT CHAPTER"},{t:"chap",ch:2,chLbl:"CH.2 THE 4 TOOLS",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",text:"Four tools. Each one has a specific strength. Each one has specific use cases. You need to know all four.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_manual",text:"MANUAL WIRE STRIPPER — the most common tool on Philippine job sites. Multiple notches for different AWG gauges. Squeeze the handles — the jaws grip and cut the insulation at the exact depth without touching the copper.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_manual",text:"Position the wire in the correct notch. Squeeze firmly and rotate 360°. Pull — the insulation sleeve slides off cleanly. The copper is untouched.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 MANUAL",toolId:"manual",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_manual",text:"BEST FOR: THHN, TW, NM-B individual conductors in 12–14 AWG. Fast for single wires in everyday installations. Always match the notch label to the wire's AWG gauge.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_automatic",text:"AUTOMATIC WIRE STRIPPER — self-adjusting jaws detect the wire gauge and grip automatically. One squeeze action cuts and pulls simultaneously. No notch selection, no rotation. Faster than manual.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_automatic",text:"Insert the wire into the front port. Squeeze the trigger — the self-adjusting jaws clamp, cut, and pull in a single motion. The wire drops out stripped in one second.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 AUTOMATIC",toolId:"automatic",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_automatic",text:"BEST FOR: high-volume work, stranded wires, 10–26 AWG. More expensive than manual, but essential on large installations where you strip hundreds of wires per job.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_knife",text:"UTILITY KNIFE — standard box cutter used with the correct technique. Key rule: score LENGTHWISE, not around the wire. A lengthwise score cannot reach the conductor below. A circular cut almost always does.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_knife",text:"Score along the insulation lengthwise on two sides. Light pressure — let the blade's sharpness do the work. Peel back the scored sections and strip off the insulation.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 KNIFE",toolId:"knife",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_knife",text:"BEST FOR: NM-B outer sheath, BX jacket, UF-B jacket — large cables where manual strippers are too small. Not recommended for individual conductors; the nick risk is too high for most skill levels.",btn:"NEXT"},{t:"tool",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_rotary",text:"ROTARY WIRE STRIPPER — a circular blade scores a perfect ring around the insulation as you rotate the tool. Produces the cleanest, most consistent strip. Common in panel work and coaxial cable installations.",btn:"NEXT"},{t:"demo",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.8,5.5],t:[0,-.1,0]},scene:"anim_rotary",text:"Clamp the tool at the strip mark. Rotate 2 to 3 full turns — the circular blade scores all the way around. Pull the insulation sleeve off cleanly.",btn:"NEXT"},{t:"when",ch:2,chLbl:"CH.2 ROTARY",toolId:"rotary",cam:{p:[0,1.2,3.5],t:[0,0,0]},scene:"show_rotary",text:"BEST FOR: coaxial cable, THHN in panels, any wire needing a precision ring cut. The blade depth is preset by the tool — you physically cannot cut too deep.",btn:"NEXT CHAPTER"},{t:"chap",ch:3,chLbl:"CH.3 TOOL QUIZ",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",text:"Chapter 3. Five scenarios. Tap the correct tool on the bench for each job. All four tools are in front of you.",btn:"START"},{t:"tselect",ch:3,chLbl:"CH.3 — Q1/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:0},{t:"tselect",ch:3,chLbl:"CH.3 — Q2/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:1},{t:"tselect",ch:3,chLbl:"CH.3 — Q3/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:2},{t:"tselect",ch:3,chLbl:"CH.3 — Q4/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:3},{t:"tselect",ch:3,chLbl:"CH.3 — Q5/5",cam:{p:[0,2.5,8],t:[0,-.3,0]},scene:"all_tools",qIdx:4},{t:"chap",ch:4,chLbl:"CH.4 STRIP QUALITY",cam:{p:[0,1.8,5.5],t:[0,-.2,0]},scene:"quality_good",text:"Chapter 4. Strip quality. Not all strips are equal. Learn to identify good and bad — this is how you inspect your own work before it goes into a terminal.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"nick",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_nick",text:"FAIL — NICKED COPPER. The blade cut too deep and scored the conductor. At the nick, current concentrates and heats the wire. Insulation softens and cracks from the inside. A fire risk hidden in the wall.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"long",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_long",text:"FAIL — TOO LONG. Too much exposed conductor beyond the terminal creates a live shock hazard. PEC requires bare conductor to be limited to terminal contact only.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — FAIL",qType:"ragged",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_ragged",text:"FAIL — RAGGED EDGE. The insulation was torn, not cut cleanly. Individual strands may be broken inside the insulation where you cannot see them. Use a sharp tool, not force.",btn:"NEXT"},{t:"quality",ch:4,chLbl:"CH.4 — PASS",qType:"good",cam:{p:[0,1.6,4.5],t:[0,-.1,0]},scene:"quality_good",text:"PASS — CLEAN STRIP. 90° edge, no nicks, 6–10 mm exposed. This is the professional standard. Every strip you make — on a repair or a new installation — should look exactly like this.",btn:"NEXT CHAPTER"},{t:"chap",ch:5,chLbl:"CH.5 TOOL CARE",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"Chapter 5. Tool maintenance. A clean, sharp tool strips cleanly. A dirty or dull tool damages wires.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 CLEAN",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"CLEAN AFTER EVERY JOB. Insulation debris in notches changes the effective cut depth. A plugged notch means you are using the wrong size without knowing it. Wipe blades dry. Use a small brush on notch channels.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 BLADES",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"BLADE SHARPNESS. When a utility knife drags instead of cutting, replace the blade — pressing harder increases nick risk. Dull rotary stripper blades should be replaced, not forced. Manual stripper jaws can be honed with a flat jeweler's file.",btn:"NEXT"},{t:"info",ch:5,chLbl:"CH.5 STORAGE",cam:{p:[0,2.5,7.5],t:[0,-.3,0]},scene:"bench_tools",text:"STORAGE. Always retract utility knife blades before storing. Moisture rusts blades and stiffens springs in manual strippers — a stiff spring means inconsistent closing force, which means inconsistent cut depth.",btn:"NEXT CHAPTER"},{t:"qintro",ch:6,chLbl:"KNOWLEDGE CHECK",cam:{p:[0,2.5,7],t:[0,-.3,0]},scene:"bench_clean",text:"Five questions. Take your time — you have covered all of this.",btn:"START QUIZ"},...ft.map((u,e)=>({t:"quiz",ch:6,chLbl:`QUESTION ${e+1}/5`,cam:{p:[0,2.5,7],t:[0,-.3,0]},scene:"bench_clean",qi:e})),{t:"done",ch:7,chLbl:"COMPLETE",cam:{p:[0,2.8,8],t:[0,-.2,0]},scene:"bench_tools",text:`Wire Stripping complete.

You know the four tools, when each one is correct, what a quality strip looks like, and how to maintain your tools. Apply this every time you pick up a wire.`,btn:"FINISH"}],Ts=`
.wsl{position:absolute;inset:0;display:flex;flex-direction:column;background:#07101f;font-family:'Exo 2',sans-serif;overflow:hidden;}

.wsl-top{height:calc(48px + env(safe-area-inset-top));background:rgba(4,8,18,.98);border-bottom:1px solid rgba(255,165,0,.15);display:flex;align-items:flex-end;padding:env(safe-area-inset-top) 12px 8px;gap:10px;flex-shrink:0;}
.wsl-back{background:rgba(255,165,0,.08);border:1px solid rgba(255,165,0,.28);color:#ffaa00;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.wsl-top-center{flex:1;text-align:center;}
.wsl-ch-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:#ffaa00;display:block;}
.wsl-ch-step{font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(255,255,255,.35);}

.wsl-main{flex:1;display:flex;flex-direction:row;min-height:0;overflow:hidden;}
.wsl-scene{flex:1;position:relative;background:#07101f;overflow:hidden;}
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

@keyframes wslDialogIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
.wsl-dialog{width:38%;flex-shrink:0;display:flex;flex-direction:column;padding:8px 12px;gap:6px;overflow:hidden;border-right:1px solid rgba(255,170,0,.1);}
.wsl-bubble{background:rgba(8,18,42,.98);border:1px solid rgba(255,170,0,.18);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;flex:1;overflow:hidden;animation:wslDialogIn .3s cubic-bezier(.25,.46,.45,.94) both;}
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

.wsl-bottom{height:calc(62px + env(safe-area-inset-bottom));background:rgba(4,8,18,.98);border-top:1px solid rgba(255,170,0,.1);display:flex;align-items:center;justify-content:space-between;padding:0 12px env(safe-area-inset-bottom);gap:10px;flex-shrink:0;}
.wsl-dots{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;overflow:hidden;}
.wsl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s;flex-shrink:0;}
.wsl-dot.done{background:#2dc653;}
.wsl-dot.active{background:#ffaa00;width:14px;border-radius:3px;}
.wsl-nav{display:flex;align-items:center;justify-content:center;padding:0 18px;height:44px;border-radius:12px;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;border:none;font-family:'Exo 2',sans-serif;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .2s;}
.wsl-nav:active{transform:scale(.93);}
.wsl-nav-back{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);min-width:72px;}
.wsl-nav-next{background:linear-gradient(135deg,#ffaa00,#ff6600);color:#000;min-width:96px;}
.wsl-nav-next:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.18);cursor:not-allowed;transform:none;}
`;function Ss(){if(document.querySelector("#wsl-css"))return;const u=document.createElement("style");u.id="wsl-css",u.textContent=Ts,document.head.appendChild(u)}function _e(u,e){const t=document.createElement("canvas");t.width=160,t.height=50;const s=t.getContext("2d");s.fillStyle="rgba(4,10,24,0.9)",s.beginPath(),s.roundRect(2,2,156,46,9),s.fill(),s.strokeStyle=u,s.lineWidth=2,s.beginPath(),s.roundRect(2,2,156,46,9),s.stroke(),s.fillStyle=u,s.font="bold 17px monospace",s.textAlign="center",s.textBaseline="middle",s.fillText(e,80,25);const o=new he(t),i=new It({map:o,transparent:!0,depthTest:!1}),a=new At(i);return a.scale.set(.82,.27,1),a}function Ae(u){return u<.5?2*u*u:-1+(4-2*u)*u}class Es{constructor(e){this.state=e,this._step=0,this._three=null,this._animId=null,this._sceneObjs=[],this._dropObjs=[],this._tsGroups=[],this._tsActive=!1,this._tsAnswered=!1,this._animObjs={},this._animT=0,this._animScene=null,this._lastTime=0,this._sparks=[],this._quizDone=!1,this._camPos=new v(0,2.5,7.5),this._camTarget=new v(0,-.3,0),this.container=this._build()}_build(){Ss();const e=document.createElement("div");return e.className="screen screen-hidden",e.innerHTML=`
      <div class="wsl">
        <header class="wsl-top">
          <button class="wsl-back">← MENU</button>
          <div class="wsl-top-center">
            <span class="wsl-ch-label" id="wsl-ch-lbl">WIRE STRIPPING</span>
          </div>
          <span class="wsl-ch-step" id="wsl-step-num">1/${U.length}</span>
        </header>

        <div class="wsl-main">
          <div class="wsl-dialog" id="wsl-dialog">
            <div class="wsl-bubble" id="wsl-bubble">
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
        </div>

        <div class="wsl-bottom">
          <button class="wsl-nav wsl-nav-back" id="wsl-prev">← BACK</button>
          <div class="wsl-dots" id="wsl-dots"></div>
          <button class="wsl-nav wsl-nav-next" id="wsl-next">NEXT →</button>
        </div>
      </div>`,e.querySelector(".wsl-back").addEventListener("click",()=>this.state.setState("stagesHub")),e.querySelector("#wsl-next").addEventListener("click",()=>this._onNext()),e.querySelector("#wsl-prev").addEventListener("click",()=>this._onPrev()),e.querySelector("#wsl-bubble-tap").addEventListener("click",()=>this._onNext()),this._el=e,e}_initThree(){if(this._three)return;const e=this._el.querySelector("#wsl-canvas"),t=this._el.querySelector("#wsl-scene"),s=t.offsetWidth,o=t.offsetHeight;if(!s||!o){setTimeout(()=>this._initThree(),60);return}const i=new Me({canvas:e,antialias:!0,powerPreference:"high-performance"});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Pe,i.toneMapping=qe,i.toneMappingExposure=1.1;const a=new we;a.background=new L(658968),a.fog=new Ne(658968,.025);const n=new Ce(50,s/o,.1,80);n.position.copy(this._camPos),n.lookAt(this._camTarget),it(a);const{lampFill:r}=st(a,{benchY:-.64,benchW:12,benchD:5.5}),l=r,c=new bt,d=new tt,h=b=>{if(!this._tsActive)return;b.preventDefault();const w=e.getBoundingClientRect(),m=b.touches?b.changedTouches[0]:b;d.x=(m.clientX-w.left)/w.width*2-1,d.y=-((m.clientY-w.top)/w.height)*2+1,c.setFromCamera(d,n);const _=c.intersectObjects(this._tsGroups,!0);if(_.length){let E=_[0].object,M=E.userData.toolId;for(;!M&&E.parent;)E=E.parent,M=E.userData.toolId;M&&this._onToolTap(M,_[0].point)}};e.addEventListener("pointerdown",h),this._resizeObs=new ResizeObserver(()=>{const b=t.offsetWidth,w=t.offsetHeight;!b||!w||(i.setSize(b,w),n.aspect=b/w,n.updateProjectionMatrix())}),this._resizeObs.observe(t),this._three={renderer:i,scene:a,camera:n,lamp:l},this._lastTime=performance.now()*.001;const g=()=>{this._animId=requestAnimationFrame(g),this._updateThree(),i.render(a,n)};g()}_clearSceneObjs(){if(!this._three)return;for(const t of this._sceneObjs)this._three.scene.remove(t);this._sceneObjs=[],this._dropObjs=[],this._tsGroups=[],this._tsActive=!1,this._tsAnswered=!1,this._animObjs={},this._animScene=null,this._el.querySelector("#wsl-tool-badge").classList.remove("show");const e=this._el.querySelector("#wsl-quality-badge");e.className="wsl-quality-badge",this._el.querySelector("#wsl-tap-hint").style.display="none"}_add(e){return this._three.scene.add(e),this._sceneObjs.push(e),e}_tagMeshes(e,t){e.userData.toolId=t,e.traverse(s=>{s.isMesh&&(s.userData.toolId=t)})}_buildManual(e=1){const t=new A,s=new f({color:13373713,roughness:.75,metalness:0}),o=new f({color:7237230,roughness:.22,metalness:.88}),i=new f({color:2236962,roughness:.35,metalness:.8}),a=new f({color:11184810,roughness:.12,metalness:.95}),n=new f({color:16755200,roughness:.8,metalness:0}),r=new A,l=new p(new ae(.08*e,.72*e,6,14),s);l.position.set(-.52*e,.16*e,0),l.rotation.z=.35,r.add(l);for(let x=0;x<8;x++){const T=new p(new N(.082*e,.015*e,6,18),new f({color:10030606}));T.position.set(-.52*e+Math.sin(.35)*(-.16+x*.09)*e,.16*e-Math.cos(.35)*(-.16+x*.09)*e,0),T.rotation.set(Math.PI/2,0,.35),r.add(T)}const c=new p(new y(.25*e,.08*e,.12*e),o);c.position.set(-.1*e,.04*e,0),c.rotation.z=.15,r.add(c);const d=new p(new y(.56*e,.065*e,.16*e),o);d.position.set(.38*e,-.065*e,0),r.add(d);const h=new p(new y(.12*e,.05*e,.16*e),i);h.position.set(.12*e,-.02*e,0),r.add(h);const g=new A,b=new p(new ae(.08*e,.72*e,6,14),s);b.position.set(-.52*e,-.16*e,0),b.rotation.z=-.35,g.add(b);for(let x=0;x<8;x++){const T=new p(new N(.082*e,.015*e,6,18),new f({color:10030606}));T.position.set(-.52*e+Math.sin(-.35)*(-.16+x*.09)*e,-.16*e-Math.cos(-.35)*(-.16+x*.09)*e,0),T.rotation.set(Math.PI/2,0,-.35),g.add(T)}const w=new p(new y(.25*e,.08*e,.12*e),o);w.position.set(-.1*e,-.04*e,0),w.rotation.z=-.15,g.add(w);const m=new p(new y(.56*e,.065*e,.16*e),o);m.position.set(.38*e,.065*e,0),g.add(m);const _=new p(new y(.12*e,.05*e,.16*e),i);_.position.set(.12*e,.02*e,0),g.add(_);const E=new p(new k(.065*e,.065*e,.22*e,6),a);E.rotation.x=Math.PI/2;for(let x=0;x<8;x++){const T=x/7*Math.PI,I=new p(new y(.015*e,.015*e,.015*e),a);I.position.set(-.32*e,Math.cos(T)*.1*e,Math.sin(T)*.06*e),t.add(I)}[.26,.36,.46,.56].forEach((x,T)=>{const I=(.045-T*.008)*e,z=new p(new k(I,I,.18*e,12),i);z.rotation.x=Math.PI/2,z.position.set(x*e,0,0),t.add(z);const R=new p(new y(.025*e,.04*e,.17*e),n);R.position.set(x*e,.04*e,0),g.add(R)});const M=new p(new y(.08*e,.03*e,.16*e),o);M.position.set(.62*e,-.01*e,0),r.add(M);const S=new p(new y(.08*e,.03*e,.16*e),o);S.position.set(.62*e,.01*e,0),g.add(S);for(let x=0;x<4;x++){const T=new p(new y(.015*e,.01*e,.16*e),i);T.position.set((.59+x*.02)*e,.01*e,0),r.add(T);const I=new p(new y(.015*e,.01*e,.16*e),i);I.position.set((.59+x*.02)*e,-.01*e,0),g.add(I)}return t.add(r),t.add(g),t.add(E),t.userData.armA=r,t.userData.armB=g,t}_buildAutomatic(e=1){const t=new A,s=new f({color:1136076,roughness:.6}),o=new f({color:666214,roughness:.7}),i=new f({color:8947848,roughness:.25,metalness:.9}),a=new f({color:1118481,roughness:.5}),n=new p(new y(1.1*e,.36*e,.28*e),s.clone());n.position.set(0,.05*e,0),t.add(n);const r=new p(new y(.9*e,.06*e,.24*e),o.clone());r.position.set(-.05*e,.26*e,0),t.add(r);const l=new p(new ae(.11*e,.52*e,5,14),s.clone());l.position.set(.05*e,-.36*e,0),l.rotation.z=.22,t.add(l);const c=new p(new y(.06*e,.26*e,.12*e),o.clone());c.position.set(.14*e,-.14*e,0),c.rotation.z=.18,t.add(c);const d=new p(new y(.28*e,.32*e,.26*e),i.clone());d.position.set(.6*e,.05*e,0),t.add(d);const h=new p(new k(.065*e,.065*e,.3*e,14),a.clone());h.rotation.z=Math.PI/2,h.position.set(.6*e,.05*e,0),t.add(h);for(let g=0;g<3;g++){const b=new p(new y(.26*e,.025*e,.3*e),new f({color:17578,roughness:.8}));b.position.set(.6*e,(-.05+g*.06)*e,0),t.add(b)}return t.userData.trigger=c,t}_buildKnife(e=1){const t=new A,s=new f({color:5592422,roughness:.72}),o=new f({color:2236979,roughness:.8}),i=new f({color:13421772,roughness:.18,metalness:.92});new f({color:1118481,roughness:.6});const a=new p(new y(.88*e,.22*e,.2*e),s.clone());a.position.set(-.18*e,0,0),t.add(a);for(let b=0;b<5;b++){const w=new p(new y(.025*e,.225*e,.21*e),new f({color:3355460,roughness:.85}));w.position.set((-.48+b*.13)*e,0,0),t.add(w)}const n=new p(new y(.28*e,.2*e,.22*e),o.clone());n.position.set(.44*e,.01*e,0),t.add(n);const r=new p(new y(.56*e,.048*e,.018*e),i.clone());r.position.set(.48*e,.09*e,0),t.add(r);const l=new Ht,c=new Float32Array([0,0,0,.14*e,0,0,.14*e,-.04*e,0,0,0,.018*e,.14*e,0,.018*e,.14*e,-.04*e,.018*e]);l.setAttribute("position",new Bt(c,3)),l.setIndex([0,1,2,3,5,4,0,3,1,1,3,4,1,4,2,2,4,5]),l.computeVertexNormals();const d=new p(l,i.clone());d.position.set(.76*e,.09*e,0),t.add(d);const h=new p(new y(.12*e,.1*e,.22*e),o.clone());h.position.set(-.12*e,.16*e,0),t.add(h);const g=new p(new y(.035*e,.72*e,.035*e),i.clone());return g.position.set(-.18*e,0,.12*e),t.add(g),t.userData.blade=r,t}_buildRotary(e=1){const t=new A,s=new f({color:16755200,roughness:.6}),o=new f({color:6710903,roughness:.42,metalness:.5}),i=new f({color:12303308,roughness:.18,metalness:.9}),a=new f({color:1118481,roughness:.6}),n=new f({color:3355460,roughness:.7}),r=new p(new k(.095*e,.1*e,.85*e,18),s.clone());r.position.set(0,-.525*e,0),t.add(r);for(let b=0;b<4;b++){const w=new p(new N(.1*e,.01*e,6,18),n.clone());w.position.set(0,(-.25-b*.16)*e,0),w.rotation.x=Math.PI/2,t.add(w)}const l=new p(new k(.125*e,.125*e,.14*e,18),o.clone());l.position.set(0,-.045*e,0),t.add(l);const c=new p(new k(.175*e,.175*e,.4*e,20),o.clone());c.position.set(0,.255*e,0),t.add(c);const d=new p(new N(.115*e,.018*e,7,22),i.clone());d.position.set(0,.32*e,0),d.rotation.x=Math.PI/2,t.add(d);const h=new p(new k(.175*e,.175*e,.06*e,20),n.clone());h.position.set(0,.485*e,0),t.add(h);const g=new p(new k(.06*e,.06*e,.1*e,14),a.clone());g.position.set(0,.5*e,0),t.add(g);for(let b=0;b<8;b++){const w=b/8*Math.PI*2,m=new p(new y(.025*e,.35*e,.025*e),n.clone());m.position.set(Math.cos(w)*.175*e,.255*e,Math.sin(w)*.175*e),t.add(m)}return t}_buildStrippedWire(e=.55,t={}){const s=new A,o=new f({color:t.insColor||1710638,roughness:.35,metalness:.05,clearcoat:.8,clearcoatRoughness:.2}),i=new f({color:13928762,roughness:.15,metalness:.95,emissive:t.glowCopper?new L(13928762):new L(0),emissiveIntensity:t.glowCopper?.4:0}),a=t.insLen||2.8,n=new p(new k(.13,.13,a,24),o);n.rotation.z=Math.PI/2,n.position.x=-(a/2+e/2),s.add(n);const r=new p(new k(.065,.13,.08,24),o);r.rotation.z=Math.PI/2,r.position.x=-(e/2)-.04,s.add(r);const l=new p(new k(.065,.065,e,20),i);l.rotation.z=Math.PI/2,s.add(l);for(let c=0;c<7;c++){const d=c/7*Math.PI*2,h=new p(new k(.015,.015,e,8),i);h.rotation.z=Math.PI/2,h.position.set(0,Math.cos(d)*.06,Math.sin(d)*.06),s.add(h)}return s.userData.copMesh=l,s.userData.copMat=i,s.userData.insMat=o,s}_applyScene(e){if(this._clearSceneObjs(),!this._three)return;const t=e.scene,s=(i,a,n=0)=>{i.position.set(a,-.38+n,.2),i.rotation.set(0,0,Math.PI/2),this._add(i)},o=(i,a,n=0)=>{i.position.set(a,-.38+n,.2),i.rotation.set(Math.PI/2,0,0),this._add(i)};if(t!=="bench_clean"){if(t==="bench_tools"){const i=this._buildManual(.55);this._tagMeshes(i,"manual"),s(i,-2.8);const a=this._buildAutomatic(.55);this._tagMeshes(a,"automatic"),s(a,-.9);const n=this._buildKnife(.55);this._tagMeshes(n,"knife"),s(n,.9);const r=this._buildRotary(.55);this._tagMeshes(r,"rotary"),o(r,2.8);return}if(t==="all_tools"){pt.forEach(i=>{let a;i.id==="manual"&&(a=this._buildManual(.68)),i.id==="automatic"&&(a=this._buildAutomatic(.68)),i.id==="knife"&&(a=this._buildKnife(.68)),i.id==="rotary"&&(a=this._buildRotary(.68)),this._tagMeshes(a,i.id),i.id==="rotary"?o(a,i.x,.12):s(a,i.x,.12);const n=_e(i.hex,i.name);n.position.set(i.x,.42,.2),this._add(n),this._tsGroups.push(a)}),e.t==="tselect"&&(this._tsActive=!0,this._el.querySelector("#wsl-tap-hint").style.display="block");return}if(t==="show_manual"){const i=this._buildManual(1.1);i.position.set(0,0,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="MANUAL STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="AWG NOTCH SELECTION",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(t==="show_automatic"){const i=this._buildAutomatic(1.1);i.position.set(0,.1,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="AUTOMATIC STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="SELF-ADJUSTING JAWS",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(t==="show_knife"){const i=this._buildKnife(1.1);i.position.set(0,0,0),i.rotation.set(.15,-.5,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="UTILITY KNIFE",this._el.querySelector("#wsl-badge-tag").textContent="SCORE LENGTHWISE ONLY",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(t==="show_rotary"){const i=this._buildRotary(1.1);i.position.set(0,0,0),i.rotation.set(.3,-.4,0),this._add(i);const a=this._el.querySelector("#wsl-tool-badge");this._el.querySelector("#wsl-badge-name").textContent="ROTARY STRIPPER",this._el.querySelector("#wsl-badge-tag").textContent="CIRCULAR BLADE — RING CUT",a.classList.add("show"),this._animScene="float",this._animObjs={pivot:i};return}if(t==="anim_manual"||t==="anim_automatic"||t==="anim_knife"||t==="anim_rotary"){const i=t.replace("anim_",""),a=new f({color:1710638,roughness:.65}),n=new p(new k(.13,.13,3.2,20),a);n.rotation.z=Math.PI/2,n.position.set(-1,-.35,0),n.castShadow=!0,this._add(n);const r=new f({color:1710638,roughness:.65,transparent:!0,opacity:1}),l=new p(new k(.132,.132,1.1,20),r);l.rotation.z=Math.PI/2,l.position.set(.9,-.35,0),this._add(l);const c=new f({color:12088115,roughness:.22,metalness:.85,emissive:new L(12088115),emissiveIntensity:0,transparent:!0,opacity:0}),d=new p(new k(.065,.065,1.1,16),c);d.rotation.z=Math.PI/2,d.position.set(.9,-.35,0),this._add(d);const h=new f({color:12088115,roughness:.22,metalness:.85}),g=new p(new k(.065,.065,.14,14),h);g.rotation.z=Math.PI/2,g.position.set(-2.67,-.35,0),this._add(g);let b;i==="manual"&&(b=this._buildManual(.9)),i==="automatic"&&(b=this._buildAutomatic(.9)),i==="knife"&&(b=this._buildKnife(.9)),i==="rotary"&&(b=this._buildRotary(.9)),i==="rotary"?(b.rotation.set(Math.PI/2,0,0),b.position.set(.9,1.8,0)):(b.rotation.set(0,0,Math.PI/2),b.position.set(.9,1.8,0)),this._add(b),this._animScene=`strip_${i}`,this._animT=0,this._animObjs={tool:b,sleeve:l,sleeveMat:r,copper:d,copMat:c,armA:b.userData.armA||null,armB:b.userData.armB||null};return}if(t==="bad_teeth"){const i=new f({color:1710638,roughness:.65}),a=new p(new k(.13,.13,5,20),i);a.rotation.z=Math.PI/2,a.position.set(0,-.35,0),a.castShadow=!0,this._add(a);const n=new f({color:4456448,roughness:.9}),r=new p(new k(.135,.135,.18,20),n);r.rotation.z=Math.PI/2,r.position.set(0,-.35,0),this._add(r);const l=new f({color:3346688,roughness:.95}),c=new p(new y(.24,.1,.2),l);c.position.set(0,-.35,0),this._add(c);const d=_e("#ff4444","⚠ NEVER DO THIS");d.scale.set(1.1,.38,1),d.position.set(0,.28,0),this._add(d);return}if(t==="bad_crush"){const i=new f({color:2250171,roughness:.65}),a=new p(new k(.13,.13,4.8,20),i);a.rotation.z=Math.PI/2,a.position.set(0,-.35,0),a.castShadow=!0,this._add(a);const n=new f({color:1718920,roughness:.85}),r=new p(new k(.13,.08,.22,12),n);r.rotation.z=Math.PI/2,r.scale.y=.45,r.position.set(.3,-.35,0),this._add(r);const l=new f({color:14496512,roughness:.5,emissive:new L(4456448),emissiveIntensity:.5});for(let d=0;d<5;d++){const h=new p(new k(.008,.008,.28,6),l.clone());h.rotation.z=Math.PI/2,h.position.set(.3,-.35+(d-2)*.025,(d-2)*.018),this._add(h)}const c=_e("#ff4444","⚠ WRONG NOTCH");c.scale.set(1.1,.38,1),c.position.set(0,.28,0),this._add(c);return}if(t==="bad_nick"){const i=new f({color:1710638,roughness:.65}),a=new p(new k(.13,.13,3.2,20),i);a.rotation.z=Math.PI/2,a.position.set(-.85,-.35,0),a.castShadow=!0,this._add(a);const n=new f({color:12088115,roughness:.22,metalness:.85}),r=new p(new k(.065,.065,1,16),n);r.rotation.z=Math.PI/2,r.position.set(.75,-.35,0),this._add(r);const l=new f({color:5570560,roughness:.9,emissive:new L(2228224),emissiveIntensity:.5}),c=new p(new N(.067,.02,6,16),l);c.rotation.y=Math.PI/2,c.position.set(.38,-.35,0),this._add(c);const d=new D(16720384,2,.5);d.position.set(.38,-.35,0),this._add(d);const h=_e("#ff4444","⚠ NICKED COPPER");h.scale.set(1.1,.38,1),h.position.set(0,.28,0),this._add(h);return}if(t==="good_strip"){const i=new f({color:1710638,roughness:.65}),a=new p(new k(.13,.13,3.2,20),i);a.rotation.z=Math.PI/2,a.position.set(-.9,-.35,0),a.castShadow=!0,this._add(a);const n=new f({color:12088115,roughness:.22,metalness:.85,emissive:new L(4465152),emissiveIntensity:.35}),r=new p(new k(.065,.065,.72,16),n);r.rotation.z=Math.PI/2,r.position.set(.58,-.35,0),this._add(r);const l=new f({color:2999891,roughness:.5,emissive:new L(2999891),emissiveIntensity:.6}),c=new p(new N(.133,.012,8,20),l);c.rotation.y=Math.PI/2,c.position.set(.22,-.35,0),this._add(c);const d=new D(2999891,1.5,1.2);d.position.set(.58,-.2,0),this._add(d);const h=_e("#2dc653","✓ CORRECT STRIP");h.scale.set(1.1,.38,1),h.position.set(0,.28,0),this._add(h);return}if(t==="quality_nick"){const i=this._buildStrippedWire(.65);i.position.set(.35,-.35,0),this._add(i);const a=new f({color:5570560,roughness:.9,emissive:new L(3342336),emissiveIntensity:.6}),n=new p(new N(.067,.022,6,16),a);n.rotation.y=Math.PI/2,n.position.set(.35,-.35,0),this._add(n);const r=new D(16720384,1.5,.7);r.position.set(.35,-.2,0),this._add(r);const l=this._el.querySelector("#wsl-quality-badge");l.textContent="FAIL ✗",l.className="wsl-quality-badge fail";return}if(t==="quality_long"){const i=this._buildStrippedWire(1.8,{insLen:1.6});i.position.set(.65,-.35,0),this._add(i);const a=new D(16729088,1.2,1.5);a.position.set(.65,-.25,0),this._add(a),this._animScene="quality_pulse_red",this._animObjs={mat:i.userData.copMat};const n=this._el.querySelector("#wsl-quality-badge");n.textContent="FAIL ✗",n.className="wsl-quality-badge fail";return}if(t==="quality_ragged"){const i=new f({color:1710638,roughness:.65}),a=new p(new k(.13,.13,2.8,20),i);a.rotation.z=Math.PI/2,a.position.set(-.65,-.35,0),this._add(a);const n=new f({color:12088115,roughness:.22,metalness:.85}),r=new p(new k(.065,.065,.65,16),n);r.rotation.z=Math.PI/2,r.position.set(.58,-.35,0),this._add(r);const l=new f({color:2763322,roughness:.9});[.1,-.08,.13,-.05,.09].forEach((g,b)=>{const w=new p(new y(.06,.1,.05),l.clone());w.position.set(.22,-.35+g,(b-2)*.04),w.rotation.z=g,this._add(w)});const d=_e("#ff8800","⚠ RAGGED EDGE");d.scale.set(1,.36,1),d.position.set(0,.26,0),this._add(d);const h=this._el.querySelector("#wsl-quality-badge");h.textContent="FAIL ✗",h.className="wsl-quality-badge fail";return}if(t==="quality_good"){const i=this._buildStrippedWire(.7,{glowCopper:!0});i.position.set(.35,-.35,0),this._add(i);const a=new f({color:2999891,roughness:.5,emissive:new L(2999891),emissiveIntensity:.55}),n=new p(new N(.133,.012,8,20),a);n.rotation.y=Math.PI/2,n.position.set(.35,-.35,0),this._add(n);const r=new D(2999891,1.4,1.4);r.position.set(.35,-.22,.3),this._add(r);const l=this._el.querySelector("#wsl-quality-badge");l.textContent="PASS ✓",l.className="wsl-quality-badge pass",this._animScene="quality_pulse_green",this._animObjs={mat:i.userData.copMat};return}}}_updateThree(){if(!this._three)return;const{camera:e,lamp:t}=this._three,s=performance.now()*.001,o=Math.min(s-this._lastTime,.05);this._lastTime=s;const a=U[this._step].cam;this._camPos.lerp(new v(...a.p),.044),this._camTarget.lerp(new v(...a.t),.044),e.position.copy(this._camPos),e.lookAt(this._camTarget),t.intensity=1.6+Math.sin(s*4)*.08;for(const n of this._dropObjs){const r=n.mesh.position.y-n.target;Math.abs(r)<.008&&Math.abs(n.vel)<.002?n.mesh.position.y=n.target:(n.vel+=-.018*r-.18*n.vel,n.mesh.position.y+=n.vel)}if(this._sparks=this._sparks.filter(n=>(n.life-=.025,n.life<=0?(this._three.scene.remove(n.mesh),!1):(n.vel.y-=.005,n.mesh.position.addScaledVector(n.vel,1),n.mesh.material.opacity=n.life,!0))),this._animScene==="float"){const n=this._animObjs.pivot;n&&(n.rotation.y=Math.sin(s*.55)*.35)}if(this._animScene&&this._animScene.startsWith("strip_")&&(this._animT=(this._animT+o*.22)%1,this._updateStripAnim(this._animT)),this._animScene==="quality_pulse_red"){const n=this._animObjs.mat;n&&(n.emissive=new L(16720384),n.emissiveIntensity=.3+Math.sin(s*3.5)*.25)}if(this._animScene==="quality_pulse_green"){const n=this._animObjs.mat;n&&(n.emissiveIntensity=.3+Math.sin(s*2)*.18)}for(const n of this._tsGroups)n&&(n.position.y=-.26+Math.sin(s*1.2+n.position.x*.8)*.025)}_updateStripAnim(e){const{tool:t,sleeve:s,sleeveMat:o,copper:i,copMat:a,armA:n,armB:r}=this._animObjs;if(!t)return;const l=this._animScene.replace("strip_","");if(e<.35){const c=Ae(e/.35);t.position.y=$e.lerp(1.8,.12,c),t.position.x=.9,o&&(o.opacity=1),a&&(a.opacity=0),n&&(n.rotation.z=.32),r&&(r.rotation.z=-.32)}else if(e<.52){const c=Ae((e-.35)/.17);t.position.y=.12,n&&(n.rotation.z=$e.lerp(.32,.055,c)),r&&(r.rotation.z=$e.lerp(-.32,-.055,c)),l==="rotary"&&(t.rotation.z=c*Math.PI*2),l==="automatic"&&t.userData.trigger&&(t.userData.trigger.rotation.z=$e.lerp(.18,.55,c))}else if(e<.82){const c=Ae((e-.52)/.3),d=c*1.55;t.position.x=.9+d,t.position.y=.12,s&&(s.position.x=.9+d),o&&(o.opacity=1-Ae(c)),a&&(a.opacity=Ae(c)),l==="rotary"&&(t.rotation.z=Math.PI*2+c*Math.PI*4),l==="knife"&&t.rotation.set(0,0,Math.PI/2-.25)}else{const c=(e-.82)/.18;a&&(a.opacity=1,a.emissiveIntensity=.4+Math.sin(c*Math.PI*4)*.3),e>.96&&(t.position.set(.9,1.8,0),s&&(s.position.x=.9),n&&(n.rotation.z=.32),r&&(r.rotation.z=-.32),l==="rotary"?t.rotation.set(Math.PI/2,0,0):t.rotation.set(0,0,Math.PI/2),l==="automatic"&&t.userData.trigger&&(t.userData.trigger.rotation.z=.18),this._animT=0)}}_spawnSparks(e){if(this._three)for(let t=0;t<14;t++){const s=new j({color:[16763904,16746496,16777215][t%3],transparent:!0,opacity:1}),o=new p(new Ee(.03,4,4),s);o.position.copy(e),this._three.scene.add(o),this._sparks.push({mesh:o,life:.65+Math.random()*.5,vel:new v((Math.random()-.5)*.09,.05+Math.random()*.09,(Math.random()-.5)*.09)})}}_showFeedback(e){const t=this._el.querySelector("#wsl-feedback");this._el.querySelector("#wsl-fb").textContent=e,t.classList.add("show"),setTimeout(()=>t.classList.remove("show"),820)}_onToolTap(e,t){var n,r;if(!this._tsActive||this._tsAnswered)return;const s=U[this._step];if(s.t!=="tselect")return;const o=Mt[s.qIdx].a;this._tsAnswered=!0,this._tsActive=!1,this._el.querySelector("#wsl-tap-hint").style.display="none";const i=this._el.querySelector(".wsl-ts-result");(n=pt.find(l=>l.id===e))!=null&&n.name||e.toUpperCase();const a=((r=pt.find(l=>l.id===o))==null?void 0:r.name)||o.toUpperCase();e===o?(this._showFeedback("✅"),this._spawnSparks(t),i&&(i.textContent=`✓ Correct! ${a} is the right choice.`,i.className="wsl-ts-result ok")):(this._showFeedback("❌"),i&&(i.textContent=`✗ Incorrect. The right tool is the ${a}.`,i.className="wsl-ts-result fail")),setTimeout(()=>{this._el.querySelector("#wsl-next").disabled=!1},500)}_renderQuiz(e){const t=ft[e],s=this._el.querySelector("#wsl-dialog"),o=Math.round(this._step/(U.length-1)*100);s.innerHTML=`
      <div class="wsl-quiz-area">
        <p class="wsl-quiz-q">${t.q}</p>
        <div class="wsl-quiz-opts">
          ${t.opts.map((i,a)=>`<button class="wsl-opt" data-idx="${a}">${i}</button>`).join("")}
        </div>
        <div class="wsl-quiz-hint" id="wsl-quiz-hint">${t.hint}</div>
      </div>
      <div class="wsl-progress-row">
        <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${o}%"></div></div>
        <span class="wsl-prog-pct" id="wsl-pct">${o}%</span>
      </div>`,s.querySelectorAll(".wsl-opt").forEach(i=>{i.addEventListener("click",()=>this._onQuizAnswer(e,parseInt(i.dataset.idx)))})}_onQuizAnswer(e,t){if(this._quizDone)return;const s=ft[e];if(this._el.querySelectorAll(".wsl-opt").forEach((i,a)=>{i.style.pointerEvents="none",a===s.a?i.classList.add("correct"):a===t&&i.classList.add("wrong")}),t===s.a)this._showFeedback("✅"),this._quizDone=!0,this._el.querySelector("#wsl-next").disabled=!1;else{this._showFeedback("❌");const i=this._el.querySelector("#wsl-quiz-hint");i&&i.classList.add("show"),setTimeout(()=>{this._quizDone=!0,this._el.querySelector("#wsl-next").disabled=!1},900)}}_render(){const e=U[this._step],t=U.length,s=Math.round(this._step/(t-1)*100);this._el.querySelector("#wsl-ch-lbl").textContent=e.chLbl||"",this._el.querySelector("#wsl-step-num").textContent=`${this._step+1}/${t}`;const o=this._el.querySelector("#wsl-dots");o.innerHTML=U.map((r,l)=>`<div class="wsl-dot ${l<this._step?"done":l===this._step?"active":""}"></div>`).join("");const i=this._el.querySelector("#wsl-next"),a=this._el.querySelector("#wsl-prev");if(a.style.visibility=this._step===0?"hidden":"visible",e.t==="quiz"){this._quizDone=!1,i.disabled=!0,i.textContent="NEXT →",this._renderQuiz(e.qi);return}if(e.t==="tselect"){this._tsAnswered=!1,i.disabled=!0,i.textContent="NEXT →";const r=Mt[e.qIdx],l=this._el.querySelector("#wsl-dialog");l.innerHTML=`
        <div class="wsl-ts-area">
          <div class="wsl-ts-label">SCENARIO ${e.qIdx+1} / 5</div>
          <p class="wsl-ts-q">${r.q}</p>
          <div class="wsl-ts-hint">👆 TAP THE CORRECT TOOL ON THE BENCH</div>
          <div class="wsl-ts-result"></div>
        </div>
        <div class="wsl-progress-row">
          <div class="wsl-prog-bar"><div class="wsl-prog-fill" id="wsl-prog" style="width:${s}%"></div></div>
          <span class="wsl-prog-pct" id="wsl-pct">${s}%</span>
        </div>`,this._tsActive=!0,this._el.querySelector("#wsl-tap-hint").style.display="block";return}this._el.querySelector("#wsl-bubble")||(this._el.querySelector("#wsl-dialog").innerHTML=`
        <div class="wsl-bubble" id="wsl-bubble">
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
        </div>`,this._el.querySelector("#wsl-bubble-tap").addEventListener("click",()=>this._onNext())),this._el.querySelector("#wsl-text").textContent=e.text||"",this._el.querySelector("#wsl-prog").style.width=s+"%",this._el.querySelector("#wsl-pct").textContent=s+"%",i.disabled=!1,i.textContent=e.btn||"NEXT →",this._el.querySelector("#wsl-bubble-tap").style.display=e.btn?"none":"block";const n=this._el.querySelector("#wsl-avatar");n&&(e.mascotIn?(n.classList.remove("entered"),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("entered")))):n.classList.add("entered"))}_gotoStep(e){this._step=Math.max(0,Math.min(U.length-1,e));const t=U[this._step];this._applyScene(t),this._render()}_onNext(){if(U[this._step].t==="done"){const t=C.getLearnStage("wireStripping");C.completeLesson("wireStripping"),C.saveLearnStage("wireStripping"),t||C.addXP(100),this.state.setState("stagesHub");return}this._step<U.length-1&&this._gotoStep(this._step+1)}_onPrev(){this._step>0&&this._gotoStep(this._step-1)}onShow(){this._step=0,this._animT=0,this._sparks=[],this._camPos.set(0,2.5,7.5),this._camTarget.set(0,-.3,0),this._render(),setTimeout(()=>{if(this._initThree(),this._three){const e=U[this._step];this._applyScene(e)}else setTimeout(()=>{this._applyScene(U[this._step])},200)},80)}onHide(){this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._three&&(this._clearSceneObjs(),this._three.renderer.dispose(),this._three=null),this._sparks=[],this._animScene=null}}const ye=[{key:"wireTypes",state:"wireTypes",num:"01",title:`UNDERSTAND
THE BASICS`,short:"Understand the Basics",desc:"Learn what wires are, their types, colors, and basic functions.",icon:"wire",color:"#00d4ff",img:"https://images.unsplash.com/photo-1597766370173-a14200ec0b42?w=400&q=70&auto=format"},{key:"electricianTools",state:"electricianTools",num:"02",title:`LEARN
THE TOOLS`,short:"Learn the Tools",desc:"Get familiar with electrical tools and their proper use.",icon:"tools",color:"#f59e0b",img:"https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=400&q=70&auto=format"},{key:"wireStripping",state:"wireStripping",num:"03",title:`WIRE
STRIPPING`,short:"Wire Stripping",desc:"Learn how to strip wires safely and correctly.",icon:"strip",color:"#22c55e",img:"https://images.pexels.com/photos/5853935/pexels-photo-5853935.jpeg?auto=compress&cs=tinysrgb&w=400"},{key:"learnOutlet",state:"learnOutlet",num:"04",title:`BASIC
CONNECTIONS`,short:"Basic Connections",desc:"Learn basic wiring connections using PH standard.",icon:"outlet",color:"#ef4444",img:"https://images.unsplash.com/photo-1565049981953-379c9c2a5d48?w=400&q=70&auto=format"},{key:"switchInstallation",state:"switchInstallation",num:"05",title:`SCENARIO
CHALLENGES`,short:"Scenario Challenges",desc:"Apply your knowledge in real-life electrical scenarios.",icon:"scenario",color:"#3b82f6",img:"https://images.unsplash.com/photo-1566417110090-6b15a06ec800?w=400&q=70&auto=format"},{key:"ways",state:"explore",num:"06",title:`ADVANCED
MASTERY`,short:"Advanced Mastery",desc:"Advanced projects and become a wiring master!",icon:"trophy",color:"#f59e0b",img:"https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=400&q=70&auto=format"}];function Ms(u,e){const t=`stroke="${e}" stroke-width="1.5"`;switch(u){case"wire":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><path d="M2 12h4l3-7 4 14 3-7h6"/></svg>`;case"tools":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;case"strip":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><path d="M6 3v18M6 12h6m0-9v18"/><path d="M14 8l4-5M14 16l4 5"/></svg>`;case"outlet":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="8" x2="9" y2="12"/><line x1="15" y1="8" x2="15" y2="12"/><path d="M9 15h6"/></svg>`;case"scenario":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;case"trophy":return`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" ${t}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;default:return""}}const Cs=`
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
.sh-card:not(.sh-locked):hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 0 1px rgba(0,212,255,.15);}
.sh-card:not(.sh-locked):active{transform:scale(.95);}
.sh-card.sh-locked{opacity:.45;cursor:not-allowed;}
.sh-card.sh-done{border-color:rgba(34,197,94,.28);}
.sh-card.sh-active{border-color:rgba(0,212,255,.5);box-shadow:0 0 20px rgba(0,212,255,.14);}
.sh-card:nth-child(1){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .04s both;}
.sh-card:nth-child(2){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .10s both;}
.sh-card:nth-child(3){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .17s both;}
.sh-card:nth-child(4){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .24s both;}
.sh-card:nth-child(5){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .31s both;}
.sh-card:nth-child(n+6){animation:cardEntrance .42s cubic-bezier(.34,1.56,.64,1) .36s both;}

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
`;function Ls(){if(document.querySelector("#sh-css"))return;const u=document.createElement("style");u.id="sh-css",u.textContent=Cs,document.head.appendChild(u)}class Is{constructor(e){this.state=e,this.container=this._build()}_build(){Ls();const e=document.createElement("div");return e.className="screen screen-hidden",e.innerHTML=`
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
          </div>
        </div>
      </div>`,e.querySelector(".sh-back").addEventListener("click",()=>this.state.setState("menu")),this._el=e,e}_render(){const e=ye.filter(d=>C.getLearnStage(d.key)).length,t=ye.length,s=Math.round(e/t*100),o=ye.findIndex(d=>!C.getLearnStage(d.key));this._el.querySelector("#sh-pct").textContent=s+"%",this._el.querySelector("#sh-pct2").textContent=s+"%";const i=2*Math.PI*23;this._el.querySelector("#sh-circ").style.strokeDashoffset=i-s/100*i;const a=["Just Started","Keep Going!","Good Progress","Half Way!","Almost Done!","Almost Done!","Complete! 🎉"];this._el.querySelector("#sh-head").textContent=a[e]||"Complete!",this._el.querySelector("#sh-sub").textContent=e===t?"All stages complete!":`${e} of ${t} done`;const n=this._el.querySelector("#sh-scroll");let r="";ye.forEach((d,h)=>{const g=C.getLearnStage(d.key),b=C.isLearnStageUnlocked(d.key),w=h===o&&b,m=!b,_=g?"sh-b-done":w?"sh-b-prog":b?"sh-b-avail":"sh-b-lock",E=g?"COMPLETED":w?"IN PROGRESS":b?"AVAILABLE":"LOCKED",M=`sh-card ${g?"sh-done":w?"sh-active":m?"sh-locked":""}`,S=g?"sh-btn-done":w?"sh-btn-cont":b?"sh-btn-start":"sh-btn-lock",x=g?"✓  REVIEW":w?"CONTINUE →":b?"START →":"🔒  LOCKED",T=d.title.split(`
`).join("<br>");r+=`
        <div class="${M}" data-state="${d.state}">
          <div class="sh-card-img">
            <div class="sh-card-img-bg" style="background:linear-gradient(160deg,${d.color}44 0%,rgba(4,8,20,.85) 100%),url('${d.img}') center/cover no-repeat;"></div>
            <div class="sh-stage-num" style="color:${d.color}">STAGE ${d.num}</div>
            <div class="sh-badge ${_}">${E}</div>
            <span style="position:relative;z-index:3">${Ms(d.icon,d.color)}</span>
          </div>
          <div class="sh-card-body">
            <div class="sh-card-title">${T}</div>
            <div class="sh-card-desc">${d.desc}</div>
          </div>
          <button class="sh-card-btn ${S}" ${m?"disabled":""}>${x}</button>
        </div>`,h<ye.length-1&&(r+=`<div class="sh-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>`)}),n.innerHTML=r,n.querySelectorAll(".sh-card:not(.sh-locked)").forEach(d=>{d.addEventListener("click",()=>{const h=d.dataset.state;h&&this.state.setState(h)})});let l="";ye.forEach((d,h)=>{const g=C.getLearnStage(d.key),b=h===o&&C.isLearnStageUnlocked(d.key);C.isLearnStageUnlocked(d.key),l+=`
        <div class="sh-chk">
          <div class="sh-chk-dot ${g?"d-done":b?"d-active":"d-lock"}"></div>
          <div class="sh-chk-name ${g?"done":b?"active":""}">${d.num.replace(/^0/,"")}. ${d.short}</div>
          ${g?'<div class="sh-chk-tick">✓</div>':""}
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
`;function zs(){if(document.querySelector("#ol-css"))return;const u=document.createElement("style");u.id="ol-css",u.textContent=As,document.head.appendChild(u)}function ee(u,e,t,s,o=.7,i=.1){return new p(new y(u,e,t),new f({color:s,roughness:o,metalness:i}))}function ze(u,e,t,s,o,i=.5,a=.3){return new p(new k(u,e,t,s),new f({color:o,roughness:i,metalness:a}))}function ke(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}class Rs{constructor(e){rt(this,"_$",e=>this._el.querySelector(`#${e}`));this.state=e,this._animId=null,this._renderer=null,this._timerIv=null,this.container=this._build()}_build(){zs();const e=document.createElement("div");return e.className="screen screen-hidden",e.innerHTML=`
      <div class="ol">
        <canvas class="ol-canvas" id="ol-canvas"></canvas>

        <div class="ol-top">
          <button class="ol-back" id="ol-back">← STAGES</button>
          <span class="ol-top-title">⚡ OUTLET REPAIR</span>
          <div class="ol-timer-box">⏱ <span id="ol-timer">05:00</span></div>
        </div>

        <div class="ol-mission">
          <div class="ol-mission-hd">🔧 Broken Outlet</div>
          ${[1,2,3,4,5,6,7,8].map(t=>`<div class="ol-task ${t===1?"active":""}" id="ol-t${t}"><div class="ol-dot"></div>${["Turn OFF breaker","Remove cover screw","Open outlet cover","Inspect wires","Reconnect wires","Close outlet","Turn ON breaker","Test with multimeter"][t-1]}</div>`).join("")}
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
          ${["brown","blue","green"].map(t=>{const o={brown:{bg:"#92400e",bc:"#b45309",lbl:"BROWN (L)",tLbl:"L"},blue:{bg:"#1d4ed8",bc:"#3b82f6",lbl:"BLUE (N)",tLbl:"N"},green:{bg:"#166534",bc:"#22c55e",lbl:"GREEN (E)",tLbl:"E"}}[t];return`<div class="ol-wire-row">
              <div class="ol-wire-drag" id="ol-wd-${t}" style="background:${o.bg};border-color:${o.bc}" draggable="true">${o.lbl}</div>
              <div class="ol-wire-line" style="background:${o.bc};opacity:.5"></div>
              <div class="ol-wire-term" id="ol-wt-${t}" style="border-color:${o.bc};color:${o.bc}">${o.tLbl}</div>
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
      </div>`,e.querySelector("#ol-back").addEventListener("click",()=>{this._cleanup(),this.state.setState("stagesHub")}),e.querySelector("#ol-so-btn").addEventListener("click",()=>{this._cleanup(),this.state.setState("stagesHub")}),e.querySelectorAll(".ol-tool").forEach(t=>{t.addEventListener("click",()=>{const s=t.id.replace("ol-tool-","");this._selectTool(s)})}),this._setupDragDrop(e),this._el=e,e}_initThree(){if(this._renderer)return;const e=this._el.querySelector("#ol-canvas"),t=this._el.querySelector(".ol"),s=t.offsetWidth||window.innerWidth,o=t.offsetHeight||window.innerHeight;if(!s||!o){setTimeout(()=>this._initThree(),80);return}const i=new Me({canvas:e,antialias:!0});i.setPixelRatio(Math.min(devicePixelRatio,2)),i.setSize(s,o),i.shadowMap.enabled=!0,i.shadowMap.type=Pe,i.toneMapping=qe,i.toneMappingExposure=1.15;const a=new we;a.background=new L(1710100),a.fog=new zt(1710100,10,22);const n=new Ce(42,s/o,.1,100);n.position.set(1.2,.8,6.5),n.lookAt(0,0,0),a.add(new Ve(16777215,.35));const r=new Je(16774368,2.8,22,Math.PI*.16,.25);r.position.set(1,7,6),r.castShadow=!0,a.add(r),a.add(r.target);const l=new de(4491519,.25);l.position.set(-4,2,-3),a.add(l);const c=new de(16768426,.15);c.position.set(3,-2,4),a.add(c),a.add(Object.assign(new de(16777215,.45),{position:new v(-6,3,5)}));const d=new D(16729088,0,2.5);d.position.set(0,-.35,.25),a.add(d);const h=new p(new Se(14,9),new Wt({color:2762272}));h.position.z=-1.2,h.receiveShadow=!0,a.add(h);const{outletRoot:g,faceGroup:b,facePlate:w,screwGroup:m,screwHead:_,washer:E,internalGroup:M,terminalMeshes:S,wireMeshes:x,looseWirePts:T,jBox:I,bkHandle:z,bkHandleMat:R,bkLEDMat:O,HANDLE_ON_Y:se,HANDLE_OFF_Y:ge}=this._buildOutlet(a),V=new bt,re=new tt;e.addEventListener("click",$=>this._onClick($,V,re,n,w,_,E,z,I)),e.addEventListener("pointermove",$=>{re.x=$.clientX/s*2-1,re.y=-($.clientY/o)*2+1,V.setFromCamera(re,n);const W=this._gameState;let F="default";((W==="breaker_off"||W==="breaker_on")&&V.intersectObjects([z],!0).length||W==="screw"&&V.intersectObjects([_,E],!0).length||(W==="open"||W==="test")&&V.intersectObject(w,!1).length||W==="rescrew")&&(F="pointer"),e.style.cursor=F}),this._resizeObs=new ResizeObserver(()=>{const $=t.offsetWidth,W=t.offsetHeight;!$||!W||(i.setSize($,W),n.aspect=$/W,n.updateProjectionMatrix())}),this._resizeObs.observe(t),this._renderer=i,this._three={scene:a,camera:n,renderer:i,damageLight:d,outletRoot:g,faceGroup:b,facePlate:w,screwGroup:m,screwHead:_,washer:E,internalGroup:M,terminalMeshes:S,wireMeshes:x,looseWirePts:T,jBox:I,bkHandle:z,bkHandleMat:R,bkLEDMat:O,HANDLE_ON_Y:se,HANDLE_OFF_Y:ge,raycaster:V,ptr:re,camFrom:new v,camTo:new v,camLookFrom:new v,camLookTo:new v,camTweening:!1,camT:0,camDur:0,camCB:null},this._startLoop()}_buildOutlet(e){const t=new A;e.add(t);const s=.7,o=ee(2.4,2.4,s,5914656,.9,.05);o.position.z=-1.2+s/2-.05,t.add(o);const i=ee(2.1,2.1,.05,1708040,.95,0);i.position.z=-1.2+s-.03,t.add(i);const a=new p(new y(2.6,2.6,.06),new f({color:8947848,roughness:.4,metalness:.6}));a.position.z=-1.2+s,t.add(a),[-.7,.7].forEach(B=>{const q=ee(.22,.14,.08,6710886,.5,.5);q.position.set(B,.95,-1.2+s+.02),t.add(q)});const n=new A;n.position.set(0,-.9,0),t.add(n);const r=ee(2,1.85,.14,14012614,.65,.05);r.position.set(0,.925,0),r.castShadow=!0,n.add(r),[-.65,.65].forEach(B=>{[-.7,.7].forEach(q=>{const K=ze(.055,.055,.16,12,11184810,.3,.5);K.rotation.x=Math.PI/2,K.position.set(B,q+.925,.07),n.add(K)})});const l=new f({color:1118481,roughness:.9});[-.32,.32].forEach(B=>{const q=new p(new y(.14,.35,.18),l);q.position.set(B,1.08,.07),n.add(q)});const c=new p(new k(.11,.11,.18,20),l);c.rotation.x=Math.PI/2,c.position.set(0,.72,.07),n.add(c);const d=new A;d.position.set(0,.925,0),n.add(d);const h=ze(.115,.095,.07,24,11579568,.2,.7);h.rotation.x=Math.PI/2,h.position.z=.11,d.add(h);const g=ze(.13,.13,.015,24,8947848,.4,.5);g.rotation.x=Math.PI/2,g.position.z=.075,d.add(g);const b=new f({color:3355443,roughness:.8});for(let B=0;B<2;B++){const q=new p(new y(.2,.025,.03),b);q.rotation.z=B*Math.PI/2,q.position.z=.15,d.add(q)}const w=ze(.045,.05,.5,12,10066329,.3,.6);w.rotation.x=Math.PI/2,w.position.z=-.18,d.add(w);const m=new A;m.visible=!1,t.add(m);const _=ee(2,.22,.12,5592405,.7,.3);_.position.set(0,0,-.52),m.add(_);const E=ee(1.7,.55,.18,3815994,.85,.1);E.position.set(0,0,-.45),m.add(E);const M=[{x:-.52,color:11817737},{x:0,color:3900150},{x:.52,color:2278750}],S=[];M.forEach(({x:B,color:q})=>{const K=ee(.28,.42,.22,q,.6,.2);K.position.set(B,0,-.38),m.add(K);const Q=ze(.08,.08,.06,16,11184810,.2,.7);Q.rotation.x=Math.PI/2,Q.position.set(B,0,-.27),m.add(Q);const fe=ee(.26,.04,.02,2236962,1,0);fe.position.set(B,.22,-.37),m.add(fe),S.push({x:B,color:q,glowMesh:fe})});const x=-3.05,T=.28,I=-1.06,z=ee(1.02,1.65,.22,4342338,.72,.38);z.position.set(x,T,I+.11),e.add(z);const R=ee(.84,1.44,.04,2894892,.88,.05);R.position.set(x,T,I+.235),e.add(R);const O=ee(.84,.055,.05,16106776,.65,.1);O.position.set(x,T+.72,I+.24),e.add(O);const se=ee(.34,.64,.03,1579032,.9,0);se.position.set(x,T,I+.256),e.add(se);const ge=new f({color:2278750,roughness:.42,metalness:.28}),V=T+.16,re=T-.16,$=new p(new y(.24,.3,.16),ge);$.position.set(x,V,I+.31),e.add($);const W=new f({color:2278750,roughness:.28,metalness:.5,emissive:new L(2278750),emissiveIntensity:1}),F=new p(new k(.048,.048,.055,12),W);F.rotation.x=Math.PI/2,F.position.set(x+.27,T+.54,I+.245),e.add(F);const pe=[11817737,3900150,2278750],He=[[new v(-.52,0,-.42),new v(-.6,-.3,-.1),new v(-.8,-.85,.2),new v(-.55,-1.35,.05)],[new v(0,0,-.42),new v(.1,-.28,-.1),new v(.05,-.9,.18),new v(.1,-1.4,.08)],[new v(.52,0,-.42),new v(.62,-.28,-.1),new v(.75,-.88,.2),new v(.55,-1.3,.04)]],Be=pe.map((B,q)=>{const K=new Qe(He[q]),Q=new p(new Ze(K,32,.042,8,!1),new f({color:B,roughness:.58,metalness:.04}));return Q.visible=!1,t.add(Q),Q});return{outletRoot:t,faceGroup:n,facePlate:r,screwGroup:d,screwHead:h,washer:g,internalGroup:m,terminalMeshes:S,wireMeshes:Be,looseWirePts:He,jBox:o,bkHandle:$,bkHandleMat:ge,bkLEDMat:W,HANDLE_ON_Y:V,HANDLE_OFF_Y:re}}_resetState(){this._gameState="breaker_off",this._selectedTool=null,this._wiresState={brown:!1,blue:!1,green:!1},this._completedTasks=0,this._timerVal=300,this._timerRunning=!1,this._screwRemoving=!1,this._screwSpinT=0,this._screwReattach=!1,this._screwReattachT=0,this._coverOpening=!1,this._coverOpenT=0,this._coverClosing=!1,this._coverCloseT=0,this._bkAnimating=!1,this._bkAnimT=0,this._bkGoingOff=!1,this._bkCB=null,this._inspecting=!1,this._inspectT=0,this._idleT=0,this._damageLightT=0,this._tutTarget=null}_completeTask(e,t){this._completedTasks++;const s=this._$(`ol-t${e}`);s&&(s.classList.remove("active"),s.classList.add("done"));const o=this._$(`ol-t${e+1}`);o&&o.classList.add("active"),this._$("ol-done-count").textContent=this._completedTasks,this._setPct(t)}_setPct(e){this._$("ol-prog-bar").style.width=e+"%",this._$("ol-pct").textContent=e}_setInstr(e){const t=this._$("ol-instr");t.style.display="block",t.innerHTML=e}_selectTool(e){this._selectedTool=e,this._el.querySelectorAll(".ol-tool").forEach(s=>s.classList.remove("active"));const t=this._$(`ol-tool-${e}`);t&&t.classList.add("active")}_enableTool(e){const t=this._$(`ol-tool-${e}`);t&&t.classList.remove("disabled")}_showToast(e,t){const s=this._$("ol-toast");s.textContent=e,s.className=`ol-toast show ${t}`,clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>s.classList.remove("show"),2800)}_setTut(e,t="TAP HERE"){this._tutTarget=e,this._$("ol-tgt-lbl").textContent=t}_updateTutorial(){const e=this._gameState,t=this._tutTarget&&e!=="animating"&&e!=="inspect"&&e!=="wires"&&e!=="done",s=this._$("ol-tgt-ring"),o=this._$("ol-tgt-pulse"),i=this._$("ol-tgt-lbl");if(!t||!this._three){s.style.display="none",o.style.display="none",i.style.display="none";return}const{camera:a}=this._three,n=this._el.querySelector(".ol"),r=n.offsetWidth,l=n.offsetHeight,c=new v;this._tutTarget.getWorldPosition(c);const d=c.clone().project(a);if(d.z>1){s.style.display="none",o.style.display="none",i.style.display="none";return}const h=(d.x+1)/2*r,g=(-d.y+1)/2*l;[s,o].forEach(b=>{b.style.display="block",b.style.left=h+"px",b.style.top=g+"px"}),i.style.display="block",i.style.left=h+"px",i.style.top=g+46+"px"}_onClick(e,t,s,o,i,a,n,r,l){const c=this._gameState;if(c==="animating"||c==="inspect"||c==="done")return;const h=this._el.querySelector(".ol").getBoundingClientRect();if(s.x=(e.clientX-h.left)/h.width*2-1,s.y=-((e.clientY-h.top)/h.height)*2+1,t.setFromCamera(s,o),c==="breaker_off")t.intersectObjects([r],!0).length?this._doBreaker(!0):this._showToast("Find the breaker panel on the left and tap it!","err");else if(c==="screw")if(t.intersectObjects([a,n],!0).length){if(this._selectedTool!=="screwdriver"){this._showToast("Select the Screwdriver first!","err");return}this._doRemoveScrew()}else this._showToast("Click the screw at the center of the outlet!","err");else if(c==="open")t.intersectObject(i,!1).length?this._doOpenCover():this._showToast("Click the outlet cover plate to open it","err");else if(c==="rescrew")this._doCloseCover();else if(c==="breaker_on")t.intersectObjects([r],!0).length?this._doBreaker(!1):this._showToast("Tap the breaker panel to switch it back ON!","err");else if(c==="test"){if(this._selectedTool!=="multimeter"){this._showToast("Select the Multimeter tool first!","err");return}t.intersectObject(i,!1).length?this._doTest():this._showToast("Point the multimeter at the outlet and tap","err")}}_animateCam(e,t,s,o){const{camera:i,camFrom:a,camTo:n,camLookFrom:r,camLookTo:l}=this._three;a.copy(i.position),n.copy(e);const c=new v(0,0,-1).applyQuaternion(i.quaternion);r.copy(i.position).addScaledVector(c,5),l.copy(t),this._three.camT=0,this._three.camDur=s,this._three.camCB=o,this._three.camTweening=!0}_doBreaker(e){this._gameState="animating",this._setTut(null),this._showToast(e?"Switching breaker OFF...":"Switching breaker back ON...","ok"),this._animateCam(new v(-1.4,.55,5.6),new v(this._three.bkHandle.position.x,this._three.bkHandle.position.y,0),900,()=>{this._bkGoingOff=e,this._bkAnimT=0,this._bkAnimating=!0,this._bkCB=e?()=>this._afterBreakerOff():()=>this._afterBreakerOn()})}_afterBreakerOff(){this._completeTask(1,12),this._showToast("Breaker OFF — Safe to work! Now remove the cover screw.","ok"),this._setInstr('<span class="ol-snum">STEP 2</span>Select <span>Screwdriver</span> then tap the center <span>screw</span> on the outlet'),this._enableTool("screwdriver"),this._selectTool("screwdriver"),this._setTut(this._three.screwHead,"TAP SCREW"),this._animateCam(new v(1.2,.8,6.5),new v(0,0,0),800,()=>{this._gameState="screw"})}_afterBreakerOn(){this._completeTask(7,88),this._showToast("Breaker ON! Test the outlet with the multimeter.","ok"),this._setInstr('<span class="ol-snum">STEP 8</span>Select <span>Multimeter</span> then tap the <span>outlet</span> to test voltage'),this._enableTool("multimeter"),this._selectTool("multimeter"),this._setTut(this._three.facePlate,"TAP OUTLET"),this._animateCam(new v(1.2,.8,6.5),new v(0,0,0),800,()=>{this._gameState="test"})}_doRemoveScrew(){this._gameState="animating",this._setTut(null),this._showToast("Removing cover screw...","ok"),this._animateCam(new v(.3,1.1,3.2),new v(0,.92,0),900,()=>{this._screwRemoving=!0,this._screwSpinT=0})}_doOpenCover(){this._gameState="animating",this._setTut(null),this._showToast("Opening outlet cover...","ok"),this._animateCam(new v(-3.5,2.2,4),new v(0,.2,0),1100,()=>{this._coverOpening=!0,this._coverOpenT=0})}_doCloseCover(){this._gameState="animating",this._setTut(null),this._showToast("Closing outlet cover...","ok"),this._animateCam(new v(-2.8,1.8,4.2),new v(0,.3,0),900,()=>{this._coverClosing=!0,this._coverCloseT=0})}_doTest(){this._gameState="animating",this._setTut(null),this._animateCam(new v(.3,.3,3.5),new v(0,.2,0),700,()=>{const e=this._$("ol-reading"),t=this._$("ol-rd-val");e.classList.add("show"),t.textContent="---";const s=["---","12V","85V","154V","199V","216V","220V"];let o=0;const i=setInterval(()=>{o<s.length&&(t.textContent=s[o],o++),o>=s.length&&(clearInterval(i),setTimeout(()=>{e.classList.remove("show"),this._completeTask(8,100),this._gameState="done",this._timerRunning&&(clearInterval(this._timerIv),this._timerRunning=!1),this._showToast("220V AC — Outlet working perfectly!","ok"),this._animateCam(new v(1.2,.8,6.5),new v(0,0,0),1200,()=>{setTimeout(()=>{C.saveLearnStage("outlet"),C.completeLesson("outlet"),this._$("ol-success").classList.add("show")},700)})},700))},220)})}_setupDragDrop(e){const t=["brown","blue","green"];let s=null;t.forEach(i=>{const a=e.querySelector(`#ol-wd-${i}`);a&&(a.addEventListener("dragstart",r=>{r.dataTransfer.setData("text/plain",i),s=i}),a.addEventListener("dragend",()=>{s=null}));const n=e.querySelector(`#ol-wt-${i}`);n&&(n.addEventListener("dragover",r=>r.preventDefault()),n.addEventListener("drop",r=>{r.preventDefault();const l=r.dataTransfer.getData("text/plain");this._connectWire(l,i)}),n.addEventListener("click",()=>{s&&(this._connectWire(s,i),s=null)}))});let o=null;t.forEach(i=>{const a=e.querySelector(`#ol-wd-${i}`);a&&a.addEventListener("click",()=>{this._wiresState[i]||(o=i,e.querySelectorAll(".ol-wire-drag").forEach(r=>r.style.outline=""),a.style.outline="2px solid #F5C518")});const n=e.querySelector(`#ol-wt-${i}`);n&&n.addEventListener("click",()=>{o&&(this._connectWire(o,i),o=null,e.querySelectorAll(".ol-wire-drag").forEach(r=>r.style.outline=""))})})}_connectWire(e,t){if(e!==t){const w=this._$(`ol-wt-${t}`);w&&(w.classList.add("reject"),setTimeout(()=>w.classList.remove("reject"),400)),this._showToast("Wrong terminal! Match the wire color to the terminal.","err");return}if(this._wiresState[e])return;this._wiresState[e]=!0;const s=this._$(`ol-wd-${e}`);s&&s.classList.add("used");const o=this._$(`ol-wt-${e}`);if(o){const w={brown:"#92400e",blue:"#1d4ed8",green:"#166534"};o.style.background=w[e],o.style.color="#fff",o.style.borderStyle="solid",o.textContent="✓"}const i=["brown","blue","green"],a=[11817737,3900150,2278750],n=i.indexOf(e),{outletRoot:r,terminalMeshes:l,wireMeshes:c}=this._three,d=l[n].x;r.remove(c[n]);const h=[new v(d,0,-.42),new v(d,-.25,-.2),new v(d+(Math.random()-.5)*.3,-.7,.05),new v(d+(Math.random()-.5)*.2,-1.2,0)],g=new p(new Ze(new Qe(h),32,.038,8,!1),new f({color:a[n],roughness:.55,metalness:.05}));r.add(g),c[n]=g,l[n].glowMesh.material.color.setHex(a[n]),l[n].glowMesh.material.emissive=new L(a[n]),l[n].glowMesh.material.emissiveIntensity=.8;const b={brown:54,blue:62,green:70};this._showToast(`${e.charAt(0).toUpperCase()+e.slice(1)} wire connected ✓`,"ok"),this._setPct(b[e]),this._three.damageLight.intensity=Math.max(0,.9-Object.values(this._wiresState).filter(Boolean).length*.3),this._wiresState.brown&&this._wiresState.blue&&this._wiresState.green&&(this._three.damageLight.intensity=0,setTimeout(()=>{this._completedTasks++;const w=this._$("ol-t5");w&&(w.classList.remove("active"),w.classList.add("done"));const m=this._$("ol-t6");m&&m.classList.add("active"),this._$("ol-done-count").textContent=this._completedTasks,this._setPct(75),this._$("ol-wire-panel").style.display="none",this._$("ol-wire-panel").classList.remove("hi"),this._setInstr('<span class="ol-snum">STEP 6</span>All wires connected! Tap the <span>outlet area</span> to close the cover'),this._setTut(this._three.jBox,"TAP TO CLOSE"),this._gameState="rescrew",this._animateCam(new v(.8,.4,5.5),new v(0,.2,0),700,()=>{})},900))}_startLoop(){const{renderer:e,scene:t,camera:s}=this._three;let o=performance.now();const i=()=>{if(!this._renderer)return;this._animId=requestAnimationFrame(i);const a=performance.now(),n=Math.min((a-o)*.001,.05);o=a,this._idleT=(this._idleT||0)+n,this._damageLightT=(this._damageLightT||0)+n,this._update(n),e.render(t,s)};i()}_update(e){const t=this._three;if(!t)return;const{outletRoot:s,faceGroup:o,internalGroup:i,wireMeshes:a,screwGroup:n,damageLight:r,bkHandle:l,bkHandleMat:c,bkLEDMat:d,HANDLE_ON_Y:h,HANDLE_OFF_Y:g,camera:b,camFrom:w,camTo:m,camLookFrom:_,camLookTo:E}=t;if(s.position.y=Math.sin(this._idleT*.55)*.035,s.rotation.z=Math.sin(this._idleT*.35)*.006,s.rotation.x=Math.sin(this._idleT*.28)*.005+.04,i.visible&&r.intensity>0){const M=.5+.5*Math.sin(this._damageLightT*3.5);r.intensity=.9*M,r.color.setHSL(.06-M*.04,1,.5)}if(t.camTweening){t.camT+=e*1e3;const M=ke(Math.min(t.camT/t.camDur,1));if(b.position.lerpVectors(w,m,M),b.lookAt(new v().lerpVectors(_,E,M)),t.camT>=t.camDur&&(t.camTweening=!1,t.camCB)){const S=t.camCB;t.camCB=null,S()}}if(this._bkAnimating){this._bkAnimT+=e*2.8;const M=ke(Math.min(this._bkAnimT,1)),S=this._bkGoingOff?h:g,x=this._bkGoingOff?g:h;if(l.position.y=S+(x-S)*M,this._bkAnimT>=1&&(this._bkAnimating=!1,l.position.y=x,this._bkGoingOff?(c.color.setHex(15680580),d.color.setHex(15680580),d.emissive.setHex(8917265),d.emissiveIntensity=.55):(c.color.setHex(2278750),d.color.setHex(2278750),d.emissive.setHex(2278750),d.emissiveIntensity=1),this._bkCB)){const T=this._bkCB;this._bkCB=null,T()}}if(this._screwRemoving&&(this._screwSpinT+=e*5.5,n.rotation.z=this._screwSpinT,n.position.z=this._screwSpinT*.09,n.position.y=this._screwSpinT*.03,this._screwSpinT>Math.PI*5&&(this._screwRemoving=!1,n.visible=!1,this._completeTask(2,24),this._showToast("Screw removed! Now tap the outlet cover to open it.","ok"),this._setInstr('<span class="ol-snum">STEP 3</span>Tap the <span>outlet cover</span> to open it'),this._setTut(t.facePlate,"TAP COVER"),this._animateCam(new v(-1.8,1.4,5.2),new v(0,.4,0),700,()=>{this._gameState="open"}))),this._coverOpening){this._coverOpenT+=e*1.4;const M=Math.min(this._coverOpenT,1);o.rotation.x=ke(M)*1.95,this._coverOpenT>=1&&(this._coverOpening=!1,o.visible=!1,i.visible=!0,a.forEach(S=>S.visible=!0),r.intensity=.9,this._damageLightT=0,this._completeTask(3,36),this._showToast("Cover open! Inspecting wiring...","ok"),this._setInstr('<span class="ol-snum">STEP 4</span>Inspecting wires — connections are <span>damaged</span>'),this._setTut(null),this._inspecting=!0,this._inspectT=0,this._animateCam(new v(.2,.5,3.6),new v(0,-.25,0),1e3,()=>{}))}if(this._inspecting&&(this._inspectT+=e,this._inspectT>.8&&this._inspectT<.82&&this._animateCam(new v(-.1,-.4,2.6),new v(0,-.5,0),900,()=>{}),this._inspectT>=2.5&&(this._inspecting=!1,this._completeTask(4,48),this._showToast("Wires disconnected — match wire color to terminal.","info"),this._$("ol-wire-panel").style.display="block",this._$("ol-wire-panel").classList.add("hi"),this._$("ol-instr").style.display="none",this._gameState="wires",this._animateCam(new v(.3,2.2,5),new v(0,-.1,0),900,()=>{}))),this._coverClosing){this._coverCloseT+=e*1.2;const M=Math.min(this._coverCloseT,1);o.visible=!0,o.rotation.x=(1-ke(M))*1.95,this._coverCloseT>=1&&(this._coverClosing=!1,o.rotation.x=0,o.position.set(0,-.9,0),i.visible=!1,a.forEach(S=>S.visible=!1),r.intensity=0,n.visible=!0,n.position.set(0,.925,.6),n.rotation.z=Math.PI*9,this._screwReattach=!0,this._screwReattachT=0,this._animateCam(new v(.2,.95,3),new v(0,.92,0),600,()=>{}))}if(this._screwReattach){this._screwReattachT+=e*4;const M=Math.min(this._screwReattachT/3.5,1);n.rotation.z=(1-ke(M))*Math.PI*9,n.position.z=(1-ke(M))*.6,n.position.y=.925,this._screwReattachT>=3.5&&(this._screwReattach=!1,n.rotation.z=0,n.position.set(0,.925,0),this._completeTask(6,82),this._showToast("Outlet closed! Turn the breaker back ON.","ok"),this._setInstr('<span class="ol-snum">STEP 7</span>Find the <span>breaker panel</span> on the left — switch it back <span>ON</span>'),this._setTut(l,"TAP BREAKER"),this._animateCam(new v(1.2,.8,6.5),new v(0,0,0),1200,()=>{this._gameState="breaker_on"}))}this._updateTutorial()}_startTimer(){this._timerRunning||(this._timerRunning=!0,this._timerIv=setInterval(()=>{if(!this._timerRunning){clearInterval(this._timerIv);return}this._timerVal=Math.max(0,this._timerVal-1);const e=Math.floor(this._timerVal/60).toString().padStart(2,"0"),t=(this._timerVal%60).toString().padStart(2,"0"),s=this._$("ol-timer");s&&(s.textContent=e+":"+t)},1e3))}onShow(){this._resetState(),this._initDOMReset(),setTimeout(()=>this._initThree(),80),this._startTimer()}_initDOMReset(){this._setPct(0),this._$("ol-done-count").textContent="0";for(let e=1;e<=8;e++){const t=this._$(`ol-t${e}`);t&&(t.classList.remove("done","active"),e===1&&t.classList.add("active"))}this._$("ol-wire-panel").style.display="none",this._$("ol-wire-panel").classList.remove("hi"),this._$("ol-instr").style.display="block",this._$("ol-instr").innerHTML='<span class="ol-snum">STEP 1</span>Find the <span>breaker panel</span> on the left wall — tap to switch it <span>OFF</span> before working',this._$("ol-success").classList.remove("show"),this._$("ol-reading").classList.remove("show"),["screwdriver","multimeter"].forEach(e=>{const t=this._$(`ol-tool-${e}`);t&&(t.classList.add("disabled"),t.classList.remove("active"))}),["brown","blue","green"].forEach(e=>{const t=this._$(`ol-wd-${e}`);t&&t.classList.remove("used");const s=this._$(`ol-wt-${e}`);if(s){const o={brown:"#b45309",blue:"#3b82f6",green:"#22c55e"}[e],i={brown:"L",blue:"N",green:"E"}[e];s.style.background="",s.style.color=o,s.style.borderStyle="dashed",s.textContent=i}}),this._$("ol-timer").textContent="05:00"}_cleanup(){this._timerIv&&(clearInterval(this._timerIv),this._timerIv=null,this._timerRunning=!1),this._animId&&(cancelAnimationFrame(this._animId),this._animId=null),this._resizeObs&&(this._resizeObs.disconnect(),this._resizeObs=null),this._renderer&&(this._renderer.dispose(),this._renderer=null,this._three=null)}onHide(){this._cleanup()}}const Os=`
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
`;let Ct=!1;function Ps(){if(Ct)return;Ct=!0;const u=document.createElement("style");u.id="hls-css",u.textContent=Os,document.head.appendChild(u)}class ut{constructor(e,t){this.state=e,this.cfg=t,this.container=this._build()}_build(){Ps();const e=document.createElement("div");e.className="screen screen-hidden",e.innerHTML=`
      <div class="hls">
        <button class="hls-fab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          BACK
        </button>
        <iframe class="hls-frame" id="hls-frame" allowfullscreen></iframe>
      </div>`;const t=()=>this.state.setState(this.cfg.backState||"stagesHub");return e.querySelector(".hls-fab").addEventListener("click",t),e.querySelector(".hls-fab").addEventListener("touchend",s=>{s.preventDefault(),t()}),this._msgHandler=s=>{var o,i;((o=s.data)==null?void 0:o.type)==="complete"&&this._complete(),((i=s.data)==null?void 0:i.type)==="back"&&t()},this._el=e,e}_complete(){const e=C.getLearnStage(this.cfg.key);C.saveLearnStage(this.cfg.key),e||C.addXP(100)}onShow(){window.addEventListener("message",this._msgHandler);const e=this._el.querySelector("#hls-frame");e.src=this.cfg.src}onHide(){window.removeEventListener("message",this._msgHandler);const e=this._el.querySelector("#hls-frame");e.src="about:blank"}}const Re=0,P=4.2,Y=.22,Ye=1.72,Lt=new v(0,Ye,5),qs=Math.PI,Ns=[{id:1,pos:new v(-7.97,1.2,3),label:"Entrance West"},{id:2,pos:new v(7.97,1.2,0),label:"Entrance East"},{id:3,pos:new v(-7.97,1.2,-8),label:"Workshop A West"},{id:4,pos:new v(7.97,1.2,-14),label:"Workshop A East"},{id:5,pos:new v(0,1.2,-31.97),label:"Workshop B North"},{id:6,pos:new v(-7.97,1.2,-20),label:"Workshop B West"},{id:7,pos:new v(7.97,1.2,-28),label:"Workshop B East"}],Hs=[{id:1,pos:new v(-7.97,1.5,-5),label:"Workshop A Station 1"},{id:2,pos:new v(7.97,1.5,-22),label:"Workshop B Station 2"},{id:3,pos:new v(-7.97,1.5,-28),label:"Workshop B Station 3"},{id:4,pos:new v(7.97,1.5,-2),label:"Entrance Station 4"},{id:5,pos:new v(-7.97,1.5,-20),label:"Workshop B Station 5"}];class Bs{constructor(e,t,s=null){this.state=e,this.root=t,this._guide=s,this._raf=null,this._listeners=[];const o=C.getExploreProgress();this._player={pos:Lt.clone(),yaw:qs,pitch:0,yawVel:0,pitchVel:0,vel:new v,vy:0,grounded:!1},this._keys={},this._joy={x:0,y:0},this._joyId=-1,this._lookTouches={},this._pointerLocked=!1,this._repairOpen=!1,this._bobT=0,this._bobAmt=0,this._outlets=Ns.map(i=>({...i,fixed:!!o.outlets[i.id]})),this._switches=Hs.map(i=>({...i,fixed:!!o.switches[i.id]})),this._nearest=null,this._guideTipsFired={},this._colBoxes=[],this._isMob=navigator.maxTouchPoints>0,this._htmlRepairEl=null,G.init(),this._initThree(),this._buildWorld(),this._buildInteractables(),this._setupInput(),this._startLoop(),this._updateScoreHUD(),G.startAmbient()}_initThree(){const e=this.root.querySelector("#ex-canvas"),t=this._isMob;if(this._renderer=new Me({canvas:e,antialias:!t,powerPreference:"high-performance"}),this._renderer.setPixelRatio(Math.min(devicePixelRatio,t?1.5:2)),this._renderer.outputColorSpace=$t,this._renderer.toneMapping=qe,this._renderer.toneMappingExposure=t?2.6:2.2,this._renderer.shadowMap.enabled=!t,this._renderer.shadowMap.type=Pe,this._scene=new we,this._scene.background=new L(923172),t?this._scene.fog=new zt(923172,22,52):this._scene.fog=new Ne(923172,.016),!t)try{const s=new Dt(this._renderer);s.compileCubemapShader();const o=new we,i=(n,r,l,c,d,h,g)=>{const b=new p(new y(n,r,l),new j({color:c}));b.position.set(d,h,g),o.add(b)};i(120,2,120,658970,0,0,0),i(120,2,120,658970,0,20,0),i(2,60,2,1714756,18,0,-10),i(120,2,120,528398,0,-20,0);const a=s.fromScene(o);this._scene.environment=a.texture,s.dispose()}catch{}this._camera=new Ce(72,1,.1,t?40:120),this._camera.position.copy(Lt),this._clock=new jt,this._ro=new ResizeObserver(()=>this._onResize()),this._ro.observe(this.root),this._onResize()}_onResize(){const e=this.root.clientWidth,t=this.root.clientHeight;!e||!t||(this._renderer.setSize(e,t),this._camera.aspect=e/t,this._camera.updateProjectionMatrix())}_mkTex(e){const t=new he(e);return t.wrapS=t.wrapT=et,t.minFilter=Ft,t.magFilter=Gt,t.anisotropy=this._isMob?8:16,t}_heightToNormal(e,t=3){const s=e.width,o=e.height,i=e.getContext("2d").getImageData(0,0,s,o).data,a=document.createElement("canvas");a.width=s,a.height=o;const n=a.getContext("2d"),r=n.createImageData(s,o),l=(c,d)=>i[((d%o+o)%o*s+(c%s+s)%s)*4]/255;for(let c=0;c<o;c++)for(let d=0;d<s;d++){const h=-l(d-1,c-1)+l(d+1,c-1)+(-2*l(d-1,c)+2*l(d+1,c))+(-l(d-1,c+1)+l(d+1,c+1)),g=-l(d-1,c-1)-2*l(d,c-1)-l(d+1,c-1)+(l(d-1,c+1)+2*l(d,c+1)+l(d+1,c+1));let b=h*t,w=g*t,m=1;const _=Math.sqrt(b*b+w*w+m*m),E=(c*s+d)*4;r.data[E]=(b/_*.5+.5)*255|0,r.data[E+1]=(w/_*.5+.5)*255|0,r.data[E+2]=(m/_*.5+.5)*255|0,r.data[E+3]=255}return n.putImageData(r,0,0),this._mkTex(a)}_makeFloorTex(){const e=document.createElement("canvas");e.width=e.height=512;const t=e.getContext("2d");t.fillStyle="#18202e",t.fillRect(0,0,512,512);for(let a=0;a<2e3;a++){const n=Math.random()*512,r=Math.random()*512,c=30+(Math.random()-.5)*14|0;t.fillStyle=`rgba(${c},${c+2},${c+4},.22)`,t.fillRect(n,r,1+Math.random()*2,1+Math.random()*2)}const s=128,o=2;for(let a=0;a<4;a++)for(let n=0;n<4;n++){const r=n*s+o,l=a*s+o,c=s-o*2,d=s-o*2,g=28+(Math.random()-.5)*8|0;t.fillStyle=`rgb(${g},${g+3},${g+8})`,t.fillRect(r,l,c,d);const b=t.createRadialGradient(r+c/2,l+d/2,4,r+c/2,l+d/2,c*.6);b.addColorStop(0,"rgba(0,212,255,.04)"),b.addColorStop(1,"rgba(0,0,0,0)"),t.fillStyle=b,t.fillRect(r,l,c,d)}t.strokeStyle="rgba(0,212,255,.28)",t.lineWidth=o;for(let a=0;a<=512;a+=s)t.beginPath(),t.moveTo(a,0),t.lineTo(a,512),t.stroke(),t.beginPath(),t.moveTo(0,a),t.lineTo(512,a),t.stroke();t.fillStyle="rgba(0,212,255,.45)";for(let a=0;a<=512;a+=s)for(let n=0;n<=512;n+=s)t.beginPath(),t.arc(a,n,2.5,0,Math.PI*2),t.fill();const i=this._mkTex(e);return i.repeat.set(8,8),i}_makeWallTex(){const e=document.createElement("canvas");e.width=e.height=512;const t=e.getContext("2d");t.fillStyle="#1c2535",t.fillRect(0,0,512,512);const s=128,o=256,i=3;for(let n=0;n*s<512;n++)for(let r=0;r*o<512;r++){const l=r*o+i,c=n*s+i,d=o-i*2,h=s-i*2,b=30+(Math.random()-.5)*8|0;t.fillStyle=`rgb(${b},${b+4},${b+10})`,t.fillRect(l,c,d,h);const w=t.createLinearGradient(l,c,l,c+h);w.addColorStop(0,"rgba(255,255,255,.06)"),w.addColorStop(.5,"rgba(0,0,0,0)"),w.addColorStop(1,"rgba(0,0,0,.05)"),t.fillStyle=w,t.fillRect(l,c,d,h),t.strokeStyle="rgba(0,212,255,.10)",t.lineWidth=1,t.strokeRect(l+.5,c+.5,d-1,h-1)}t.fillStyle="#101520";for(let n=0;n*s<=512;n++)t.fillRect(0,n*s,512,i);for(let n=0;n*o<=512;n++)t.fillRect(n*o,0,i,512);t.strokeStyle="rgba(0,212,255,.30)",t.lineWidth=1,t.beginPath(),t.moveTo(0,1),t.lineTo(512,1),t.stroke(),t.beginPath(),t.moveTo(0,511),t.lineTo(512,511),t.stroke();const a=this._mkTex(e);return a.repeat.set(4,2),a}_makeCeilTex(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d");t.fillStyle="#161e2c",t.fillRect(0,0,256,256);const s=64;for(let i=0;i<4;i++)for(let a=0;a<4;a++){const n=a*s+1,r=i*s+1,l=s-2,c=s-2,h=24+(Math.random()-.5)*6|0;t.fillStyle=`rgb(${h},${h+3},${h+7})`,t.fillRect(n,r,l,c)}t.strokeStyle="rgba(0,212,255,.20)",t.lineWidth=1.5;for(let i=0;i<=256;i+=s)t.beginPath(),t.moveTo(i,0),t.lineTo(i,256),t.stroke(),t.beginPath(),t.moveTo(0,i),t.lineTo(256,i),t.stroke();t.fillStyle="rgba(0,212,255,.35)";for(let i=0;i<=256;i+=s)for(let a=0;a<=256;a+=s)t.beginPath(),t.arc(i,a,2,0,Math.PI*2),t.fill();const o=this._mkTex(e);return o.repeat.set(8,8),o}_makeConcrTex(){const e=document.createElement("canvas");e.width=e.height=512;const t=e.getContext("2d");t.fillStyle="#0f141e",t.fillRect(0,0,512,512);for(let o=0;o<3e3;o++){const i=Math.random()*512,a=Math.random()*512,r=18+(Math.random()-.5)*12|0;t.fillStyle=`rgba(${r},${r},${r},.22)`,t.fillRect(i,a,1+Math.random()*3,1+Math.random()*3)}t.strokeStyle="rgba(0,30,60,.55)",t.lineWidth=1.5;for(let o=0;o<512;o+=128)t.beginPath(),t.moveTo(0,o),t.lineTo(512,o),t.stroke();for(let o=0;o<512;o+=128)t.beginPath(),t.moveTo(o,0),t.lineTo(o,512),t.stroke();const s=this._mkTex(e);return s.repeat.set(4,2),s}_makeMetalTex(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createLinearGradient(0,0,0,256);s.addColorStop(0,"#b0bcc8"),s.addColorStop(.5,"#d0dce8"),s.addColorStop(1,"#9aacbc"),t.fillStyle=s,t.fillRect(0,0,256,256),t.strokeStyle="rgba(255,255,255,.25)",t.lineWidth=1;for(let i=0;i<256;i+=4)t.beginPath(),t.moveTo(0,i),t.lineTo(256,i),t.stroke();const o=this._mkTex(e);return o.repeat.set(2,2),o}_buildWorld(){const e=this._isMob,t=this._scene,s=this._makeFloorTex(),o=this._makeWallTex(),i=this._makeCeilTex(),a=this._makeConcrTex(),n=this._makeMetalTex();let r=null,l=null,c=null;if(!e){const S=document.createElement("canvas");S.width=S.height=512;const x=S.getContext("2d");x.fillStyle="#666",x.fillRect(0,0,512,512);for(let z=0;z<=512;z+=128)x.strokeStyle="rgba(0,0,0,.5)",x.lineWidth=3,x.beginPath(),x.moveTo(z,0),x.lineTo(z,512),x.stroke(),x.beginPath(),x.moveTo(0,z),x.lineTo(512,z),x.stroke();r=this._heightToNormal(S,2.5),r.repeat.set(8,8);const T=document.createElement("canvas");T.width=T.height=512;const I=T.getContext("2d");I.fillStyle="#888",I.fillRect(0,0,512,512);for(let z=0;z*48<512;z++){const R=z%2===0?0:64;for(let O=-1;O*128+R<512;O++)I.fillStyle="rgba(0,0,0,.35)",I.fillRect(O*128+R,z*48,4,48),I.fillRect(O*128+R,z*48,128,4)}l=this._heightToNormal(T,3),l.repeat.set(4,2),c=this._makeMetalTex(),c.repeat.set(2,2)}const d=(S,x)=>new tt(S,x);this._M={floor:new f({map:s,roughness:.75,metalness:.2,envMapIntensity:.6}),wall:new f({map:o,roughness:.88,metalness:.05,envMapIntensity:.3}),ceil:new f({map:i,roughness:.85,metalness:.15,envMapIntensity:.25}),concrete:new f({map:a,color:2635848,roughness:.92,metalness:.05,envMapIntensity:.25}),door:new f({color:1716304,roughness:.55,metalness:.55,envMapIntensity:.6}),doorFrame:new f({map:n,color:3824248,roughness:.14,metalness:.95,envMapIntensity:.9}),panel:new f({color:924718,roughness:.48,metalness:.45,envMapIntensity:.6}),panelGrey:new f({map:n,color:1977404,roughness:.38,metalness:.58,envMapIntensity:.7}),yellow:new f({color:15777888,emissive:new L(15777888),emissiveIntensity:1.6,roughness:.45}),red:new f({color:14500915,emissive:new L(14500915),emissiveIntensity:1.8,roughness:.4}),green:new f({color:65416,emissive:new L(65416),emissiveIntensity:2,roughness:.4}),orange:new f({color:16746547,emissive:new L(16746547),emissiveIntensity:1.6,roughness:.45}),bench:new f({color:1845818,roughness:.82,metalness:.18,envMapIntensity:.3}),black:new f({color:658968,roughness:.72,metalness:.22,envMapIntensity:.4}),chrome:new f({map:n,color:9089228,roughness:.04,metalness:1,envMapIntensity:1.6}),pipe:new f({map:n,color:2771560,roughness:.12,metalness:.98,envMapIntensity:1.4}),copper:new f({color:14252101,roughness:.18,metalness:.96,envMapIntensity:1.2}),eWhite:new j({color:54527}),eBlue:new j({color:26367}),eGreen:new j({color:65416}),eRed:new j({color:16724770}),eYellow:new j({color:16772608}),window:new f({color:6192,emissive:new L(6208),emissiveIntensity:.35,transparent:!0,opacity:.38,roughness:.02,metalness:.12,envMapIntensity:.6,side:gt}),winFrame:new f({color:1714748,roughness:.35,metalness:.55,envMapIntensity:.7})};const h=this._M;e?Object.values(h).forEach(S=>{S.isMeshStandardMaterial&&(S.normalMap=null,S.envMapIntensity=0,S.metalness=0,S.roughness=Math.max(S.roughness,.7))}):(h.floor.normalMap=r,h.floor.normalScale=d(1.6,1.6),h.wall.normalMap=l,h.wall.normalScale=d(2.2,2.2),h.concrete.normalMap=l,h.concrete.normalScale=d(1.4,1.4),h.doorFrame.normalMap=c,h.doorFrame.normalScale=d(.8,.8),h.panelGrey.normalMap=c,h.panelGrey.normalScale=d(.6,.6),h.chrome.normalMap=c,h.chrome.normalScale=d(.5,.5),h.pipe.normalMap=c,h.pipe.normalScale=d(.7,.7));const g=new f({map:o,color:2240574,roughness:.88,metalness:.08,envMapIntensity:.3}),b=new f({map:o,color:1976888,roughness:.9,metalness:.08,envMapIntensity:.25});e&&(g.normalMap=null,b.normalMap=null,g.envMapIntensity=0,b.envMapIntensity=0),this._roomLightSets={},t.add(new Ve(3821680,e?2:1.5)),e?t.add(new Ve(2107456,1.2)):t.add(new Xt(3164778,1054752,1));const w=new de(12638448,e?3:3.5);w.position.set(4,18,2),w.target.position.set(0,0,-12),t.add(w),t.add(w.target),e||(w.castShadow=!0,w.shadow.mapSize.width=w.shadow.mapSize.height=2048,w.shadow.camera.near=.5,w.shadow.camera.far=65,w.shadow.camera.left=w.shadow.camera.bottom=-20,w.shadow.camera.right=w.shadow.camera.top=20,w.shadow.bias=-.0015,w.shadow.normalBias=.03,w.shadow.radius=3.5);const m=new de(6322320,e?1.2:1.6);m.position.set(-10,6,-5),m.target.position.set(0,0,-10),t.add(m),t.add(m.target);const _=(S,x,T,I,z)=>{const R=new D(I,z,22,1.3);R.position.set(S,x,T),t.add(R)};_(0,3.6,2,13691135,e?3.8:2.4),_(-2,3.6,-8,13691135,e?3.5:2.2),_(3,3.6,-14,13691135,e?3.5:2.2),_(0,3.6,-22,13691135,e?3.2:2),_(0,3.6,-28,13691135,e?3.2:2),e&&(_(-3,2,0,11585768,2),_(3,2,-13,11585768,2),_(-3,2,-25,11585768,2));const E=(S,x,T,I)=>{const R=this._mkBox(T,.16,I,h.floor);R.position.set(S,Re-.16/2,x),R.castShadow=!1,R.receiveShadow=!e,t.add(R),this._addCol(S,Re-.16/2,x,T,.16,I);const O=this._mkBox(T,.16,I,h.ceil);O.position.set(S,P+.16/2,x),t.add(O)};E(0,3,16,10),E(0,-10,16,16),E(0,-25,16,14);const M=P/2;this._mkWall(8.11,M,3,Y,P,10.22,h.concrete),this._mkWall(8.11,M,-10,Y,P,16.22,g),this._mkWall(8.11,M,-25,Y,P,14.22,b),this._mkWall(-8.11,M,3,Y,P,10.22,h.concrete),this._mkWall(-8.11,M,-10,Y,P,16.22,g),this._mkWall(-8.11,M,-25,Y,P,14.22,b),this._mkWall(0,M,8.11,16.22,P,Y,h.concrete),this._mkWall(0,M,-32.11,16.22,P,Y,b),this._wallDoor(-2,-8,8,0,1.8,h.concrete),this._wallDoor(-18,-8,8,0,1.8,g),this._addWindow(8.06,2.4,4,3.2,1.8,!0),this._addWindow(8.06,2.2,-6,3.4,2,!0),this._addWindow(8.06,2.2,-14,3.4,2,!0),this._addWindow(-8.06,2.2,-6,3.4,2,!0),this._addWindow(-8.06,2.2,-14,3.4,2,!0),this._addWindow(-4,2.2,-32.06,3.2,1.8,!1),this._addWindow(4,2.2,-32.06,3.2,1.8,!1),this._addWindow(8.06,2.2,-25,3.4,2,!0),this._addWindow(-8.06,2.2,-25,3.4,2,!0),this._doors=[this._mkDoor(1,0,-2),this._mkDoor(2,0,-18)],this._mkLight(0,P-.2,3,16777215,5.5,"entrance"),this._mkLight(0,P-.2,-10,16777215,6,"workshop"),this._mkLight(0,P-.2,-18,16777215,5.5,"workshop"),this._mkLight(0,P-.2,-28,16777215,5.2,"workshop");{const S=this._mkBox(16,.08,.38,h.panelGrey);S.position.set(0,P-.45,-10),t.add(S),[-1,1].forEach(x=>{const T=this._mkBox(16,.1,.04,h.panelGrey);T.position.set(0,P-.39,-10+x*.16),t.add(T)})}this._place(this._mkBox(.03,1.5,1.1,new f({color:660520,roughness:.9})),-7.97,2,2),this._place(this._mkBox(.02,1.58,1.18,new f({color:6192,roughness:.5})),-7.96,2,2),[16724770,54527,65416].forEach((S,x)=>{this._place(this._mkBox(.02,.01,.82,new j({color:S})),-7.95,1.7+x*.28,2)}),this._place(this._mkBox(2.2,1.3,.03,new f({color:594984,roughness:.9,emissive:new L(6192),emissiveIntensity:.4})),-2,2.2,7.97);{const S=new p(new k(.07,.08,.52,8),h.red);S.position.set(-7.5,.26,-1),t.add(S)}if(!e){const S=new p(new vt(.22,24),new f({color:660520,emissive:new L(6192),emissiveIntensity:.5,roughness:.8}));S.rotation.y=Math.PI/2,S.position.set(7.88,2.4,7),t.add(S);const x=new p(new N(.22,.025,8,24),new f({color:54527,emissive:new L(54527),emissiveIntensity:.8,roughness:.3,metalness:.9}));x.rotation.y=Math.PI/2,x.position.set(7.87,2.4,7),t.add(x)}{const T=new f({color:1714240,roughness:.6,metalness:.45}),I=new f({color:989740,roughness:.7,metalness:.4});if(this._place(this._mkBox(2.4,.07,.9,T),-4,.82,3.5),this._addCol(-4,.42,3.5,2.4,.82,.9),this._place(this._mkBox(2.4,.78,.05,I),-4,.41,3.5+.43),this._place(this._mkBox(.05,.82,.9,I),-4-1.18,.41,3.5),this._place(this._mkBox(.05,.82,.9,I),-4+1.18,.41,3.5),!e){const z=new f({color:663354,emissive:new L(1388640),emissiveIntensity:1.3}),R=new p(new Se(.62,.38),z);R.position.set(-4,1.26,3.5-.196),t.add(R);const O=new D(2254591,.7,3);O.position.set(-4,1.2,3.5-.2),t.add(O)}}{const T=new f({color:924720,roughness:.85}),I=new f({color:1385528,roughness:.82});this._place(this._mkBox(1.9,.45,.75,T),-5,.225,1.2),this._addCol(-5,.225,1.2,1.9,.45,.75),[-.46,.46].forEach(z=>this._place(this._mkBox(.88,.12,.68,I),-5+z,.5,1.2)),this._place(this._mkBox(1.9,.62,.12,T),-5,.76,1.2+.35),[-.97,.97].forEach(z=>this._place(this._mkBox(.12,.58,.75,T),-5+z,.54,1.2))}if(this._place(this._mkBox(.48,1.1,.52,h.panelGrey),6.6,.55,7),this._addCol(6.6,.55,7,.48,1.1,.52),this._place(this._mkBox(.9,1.85,.32,h.panelGrey),-6.5,.925,6.8),this._addCol(-6.5,.925,6.8,.9,1.85,.32),!e){[.38,.8,1.22,1.58].forEach(x=>this._place(this._mkBox(.88,.03,.3,h.bench),-6.5,x,6.8));const S=[13378048,2245836,2263074,16746547,8921804,2263176];[0,1,2].forEach(x=>S.forEach((T,I)=>{I<4&&this._place(this._mkBox(.1,.22,.24,new f({color:T,roughness:.9})),-6.88+I*.12,.38+x*.42+.12,6.8)}))}this._workbench(-4,-7),this._chair(-4,-7.9,!0),this._workbench(4,-7),this._chair(4,-7.9,!0),this._workbench(-4,-13),this._chair(-4,-13.9,!0),this._workbench(4,-13),this._chair(4,-13.9,!0),this._workbench(-4,-22),this._chair(-4,-22.9,!0),this._workbench(4,-22),this._chair(4,-22.9,!0),this._workbench(-4,-28),this._chair(-4,-28.9,!0),this._workbench(4,-28),this._chair(4,-28.9,!0);{const S=this._mkBox(1.2,1.6,.55,h.panelGrey);S.position.set(-5.5,.8,-31.5),t.add(S),this._addCol(-5.5,.8,-31.5,1.2,1.6,.55)}this._place(this._mkBox(1.6,1.1,.03,new f({color:663354,roughness:.9})),4,2,-31.97),this._buildBreakerPanel(7.91,0,-8,Math.PI/2,6),this._buildRoomLife();{const S=new j({color:54527,transparent:!0,opacity:.55,side:gt,depthWrite:!1});[{x:7.9,z:-2,len:10},{x:-7.9,z:-2,len:10},{x:7.9,z:-18,len:16},{x:-7.9,z:-18,len:16},{x:7.9,z:-28,len:14},{x:-7.9,z:-28,len:14}].forEach(({x:T,z:I,len:z})=>{const R=new p(new Se(.04,z),S);R.rotation.y=Math.PI/2,R.position.set(T,.05,I),t.add(R);const O=new D(43212,.5,9,2);O.position.set(T>0?T-.3:T+.3,.15,I),t.add(O)})}}_mkBox(e,t,s,o){const i=new p(new y(e,t,s),o);return i.castShadow=!this._isMob,i.receiveShadow=!this._isMob,i}_mkCyl(e,t,s,o=16){return new p(new k(e,e,t,o),s)}_place(e,t,s,o){return e.position.set(t,s,o),this._scene.add(e),e}_mkWall(e,t,s,o,i,a,n){const r=this._mkBox(o,i,a,n||this._M.wall);return r.position.set(e,t,s),this._scene.add(r),this._addCol(e,t,s,o,i,a),r}_wallDoor(e,t,s,o,i,a){const n=o-i/2,r=o+i/2,l=2.6,c=P-l,d=l+c/2,h=P/2,g=[];n>t&&g.push([t,n,!1]),g.push([n,r,!0]),r<s&&g.push([r,s,!1]),g.forEach(([b,w,m])=>{const _=w-b,E=(b+w)/2;if(m){const M=this._mkBox(_,c,Y,a);M.position.set(E,d,e),this._scene.add(M),this._addCol(E,d,e,_,c,Y)}else{const M=this._mkBox(_,P,Y,a);M.position.set(E,h,e),this._scene.add(M),this._addCol(E,h,e,_,P,Y)}})}_mkDoor(e,t,s){const o=new A;o.position.set(t-.9,0,s);const i=new p(new y(1.8,2.6,.06),this._M.door);i.position.set(.9,1.3,0),i.userData={type:"door",id:e},i.castShadow=!this._isMob,i.receiveShadow=!this._isMob,o.add(i),this._scene.add(o);const a=new Xe(new v(t-.9,0,s-.08),new v(t+.9,2.6,s+.08));return{id:e,pivot:o,mesh:i,open:!1,targetRot:0,x:t,z:s,closedBox:a}}_addWindow(e,t,s,o,i,a){const n=this._M,r=Y+.04,l=.09;a?(this._place(new p(new y(r,i,o),n.window),e,t,s),this._place(this._mkBox(r+.02,l,o+.12,n.winFrame),e,t+i/2+l/2,s),this._place(this._mkBox(r+.02,l,o+.12,n.winFrame),e,t-i/2-l/2,s),this._place(this._mkBox(r+.02,i+.12,l,n.winFrame),e,t,s-o/2-l/2),this._place(this._mkBox(r+.02,i+.12,l,n.winFrame),e,t,s+o/2+l/2)):(this._place(new p(new y(o,i,r),n.window),e,t,s),this._place(this._mkBox(o+.12,l,r+.02,n.winFrame),e,t+i/2+l/2,s),this._place(this._mkBox(o+.12,l,r+.02,n.winFrame),e,t-i/2-l/2,s),this._place(this._mkBox(l,i+.12,r+.02,n.winFrame),e-o/2-l/2,t,s),this._place(this._mkBox(l,i+.12,r+.02,n.winFrame),e+o/2+l/2,t,s))}_mkLight(e,t,s,o,i,a){const n=this._isMob,r=new Je(o||16774368,n?i*1.4:i*1.2,n?16:22,Math.PI/3.8,.38,1.8);r.position.set(e,t,s),r.target.position.set(e,0,s),this._scene.add(r),this._scene.add(r.target),!n&&a&&(this._roomLightSets[a]||(this._roomLightSets[a]=[]),this._roomLightSets[a].push(r)),n||(r.castShadow=!0,r.shadow.mapSize.width=r.shadow.mapSize.height=512,r.shadow.bias=-.003);const l=this._mkBox(.18,.05,1.58,this._M.panelGrey);l.position.set(e,t+.05,s),this._scene.add(l);const c=new f({color:16777215,emissive:new L(15792383),emissiveIntensity:n?5:6,roughness:1}),d=new p(new k(.042,.042,1.48,8),c);d.rotation.z=Math.PI/2,d.position.set(e,t-.01,s),this._scene.add(d);const h=new p(new vt(.24,12),c);h.rotation.x=Math.PI/2,h.position.set(e,t-.055,s),this._scene.add(h)}_workbench(e,t){const s=this._M;if(this._place(this._mkBox(2.2,.07,.9,s.bench),e,.965,t),this._place(this._mkBox(2.2,1,.05,s.panelGrey),e,.5,t+.44),[[-1.05,-.38],[-1.05,.38],[1.05,-.38],[1.05,.38]].forEach(([r,l])=>this._place(this._mkBox(.06,1,.06,s.chrome),e+r,.5,t+l)),this._addCol(e,.5,t,2.2,1,.9),this._isMob)return;this._place(this._mkBox(2,.04,.7,s.bench),e,.34,t),this._place(this._mkBox(2.2,.55,.03,new f({color:7031838,roughness:.92})),e,1.27,t+.44);const o=new p(new N(.062,.022,6,14),s.copper);o.rotation.x=Math.PI/2,o.position.set(e+.65,1,t-.05),this._scene.add(o);const i=e+.92,a=t+.38;this._place(this._mkCyl(.04,.03,s.panelGrey,8),i,.988,a),this._place(this._mkCyl(.012,.3,s.chrome,6),i,1.14,a),this._place(this._mkBox(.1,.03,.08,new f({color:16777164,emissive:new L(16772744),emissiveIntensity:1.4})),i,1.3,a-.06);const n=new D(16771248,1.2,1.8,2.2);n.position.set(i,1.26,a-.08),this._scene.add(n)}_chair(e,t,s=!1){const o=this._M,i=new f({color:1718876,roughness:.88}),a=s?-.27:.27;this._place(this._mkBox(.58,.07,.58,i),e,.55,t),this._place(this._mkBox(.58,.64,.07,i),e,.98,t+a);const n=this._mkCyl(.05,.52,o.chrome,8);n.position.set(e,.27,t),this._scene.add(n),!this._isMob&&[-.3,.3].forEach(r=>{this._place(this._mkBox(.06,.05,.38,o.panelGrey),e+r,.74,t+a*.15),this._place(this._mkBox(.1,.03,.32,i),e+r,.775,t+a*.1)})}_buildRoomLife(){const e=this._M,t=this._scene,s=this._isMob,o=new f({color:791840,roughness:.75,metalness:.55}),i=new f({color:1318704,roughness:.6,metalness:.65});[[6.1,-26],[6.1,-30],[-6.1,-24],[-6.1,-30]].forEach(([a,n])=>{this._place(this._mkBox(.72,2.1,.82,o),a,1.05,n),this._addCol(a,1.05,n,.72,2.1,.82),this._place(this._mkBox(.7,2.08,.04,i),a,1.05,n+(a>0?-.38:.38));for(let r=0;r<5;r++)this._place(this._mkBox(.66,.018,.04,new f({color:66e4})),a,.38+r*.38,n+(a>0?-.37:.37));if(!s){[[65348,0],[65348,.06],[16720384,.12],[54527,.18]].forEach(([l,c])=>{const d=new f({color:l,emissive:new L(l),emissiveIntensity:3});this._place(this._mkBox(.03,.025,.04,d),a+(a>0?-.2:.2),1.82+c,n+(a>0?-.37:.37))});const r=new D(54527,.35,3,2);r.position.set(a+(a>0?-.5:.5),1.2,n),t.add(r)}});{const a=new f({color:924718,roughness:.72,metalness:.4});if(this._place(this._mkBox(.62,.92,.5,a),3.5,.46,-31.5),this._addCol(3.5,.46,-31.5,.62,.92,.5),!s){const n=new f({color:6696,emissive:new L(43588),emissiveIntensity:1.4});this._place(this._mkBox(.28,.15,.04,n),3.5,.66,-31.22);const r=new D(43588,.5,2,2);r.position.set(3.5,.7,-31.2),t.add(r)}}{const a=new f({color:858922,roughness:.78,metalness:.5});this._place(this._mkBox(.55,1.6,.55,a),6.8,.8,-10),this._addCol(6.8,.8,-10,.55,1.6,.55),s||[[54527,0],[65348,.08],[16746496,.16]].forEach(([n,r])=>{const l=new f({color:n,emissive:new L(n),emissiveIntensity:2.5});this._place(this._mkBox(.03,.025,.04,l),6.54,1.4+r,-10)})}{const a=new f({color:1384238,roughness:.9}),n=new p(new k(.14,.12,.36,8),a);n.position.set(5.5,.18,-9),t.add(n)}{const a=this._mkBox(16,.08,.38,e.panelGrey);a.position.set(0,P-.45,-26),t.add(a),[-1,1].forEach(n=>{const r=this._mkBox(16,.1,.04,e.panelGrey);r.position.set(0,P-.39,-26+n*.16),t.add(r)})}s||[[7.95,2.2,-21,Math.PI/2],[-7.95,2.2,-22,-Math.PI/2]].forEach(([a,n,r,l])=>{const c=new f({color:6702,emissive:new L(8772),emissiveIntensity:.7,roughness:.9}),d=this._mkBox(.04,.62,.92,c);d.position.set(a,n,r),d.rotation.y=l,t.add(d),[[54527,.18],[65348,-.06],[16746496,-.28]].forEach(([g,b])=>{const w=new j({color:g}),m=this._mkBox(.04,.04,.26,w);m.position.set(a,n+.14,r+b),m.rotation.y=l,t.add(m)});const h=new D(17544,.55,3.2,2);h.position.set(a>0?a-.4:a+.4,n,r),t.add(h)});{const a=new j({color:16755200,transparent:!0,opacity:.3,depthWrite:!1}),n=new j({color:1118481,transparent:!0,opacity:.25,depthWrite:!1});[-17.9,-1.9].forEach(r=>{for(let l=-8;l<8;l++){const c=new p(new Se(.9,.48),l%2===0?a:n);c.rotation.x=-Math.PI/2,c.position.set(l+.5,.003,r),t.add(c)}})}{const a=new f({color:792616,roughness:.8,metalness:.4});if(this._place(this._mkBox(.04,.55,1.1,a),-7.95,2.6,-26),!s){for(let r=0;r<8;r++){const l=new f({color:1716304,roughness:.7});this._place(this._mkBox(.04,.06,.06,l),-7.93,2.42,-25.35+r*.12)}const n=new D(17578,.3,2.5,2);n.position.set(-7.6,2.4,-26),t.add(n)}}}_buildBreakerPanel(e,t,s,o,i=8){const a=this._M,n=new A,r=this._mkBox(1.05,1.55,.18,a.panel);r.position.set(0,1.78,0),n.add(r);const l=this._mkBox(1.07,1.57,.14,a.panelGrey);l.position.set(0,1.78,.02),n.add(l),C.getExploreProgress();const c=C.load().exploreBreakerFixed;this._breakerBreakers=[];for(let h=0;h<i;h++){const g=Math.floor(h/2),b=h%2,w=!c&&h===2,m=w?!1:h<Math.floor(i*.75),_=this._mkBox(.16,.28,.07,w?a.red:m?a.green:a.panelGrey);_.position.set(-.23+b*.46,2.3-g*.32,.12),_.userData={type:"breaker",index:h,tripped:w},n.add(_),w&&(this._breakerInteractMesh=_),this._breakerBreakers.push({mesh:_,tripped:w})}const d=this._mkBox(1,1.5,.1,new j({visible:!1}));d.position.set(0,1.78,.14),d.userData={type:"breaker",id:1},n.add(d),this._breakerHit=d,n.position.set(e,t,s),n.rotation.y=o,this._scene.add(n),this._breakerGroup=n,this._breakerFixed=c}_buildInteractables(){const e=this._M;this._outletMeshes=this._outlets.map(t=>{const s=new A,o=new p(new y(.12,.1,.04),t.fixed?e.green:new f({color:3359846,roughness:.55}));o.userData={type:"outlet",id:t.id},s.add(o);const i=new p(new y(.02,.03,.05),new j({color:0}));i.position.set(-.025,.015,.01),s.add(i);const a=i.clone();a.position.set(.025,.015,.01),s.add(a);const n=i.clone();if(n.position.set(0,-.022,.01),s.add(n),!t.fixed){const r=new D(16720384,1.4,2.2);r.position.set(0,0,.3),s.add(r),s.userData._glow=r;const l=new p(new y(.015,.025,.06),new f({color:16737792,emissive:new L(16729088),emissiveIntensity:8,roughness:1}));l.position.set(.03,.03,.02),s.add(l),s.userData._spark=l}return s.position.copy(t.pos),Math.abs(t.pos.x)>7&&(s.rotation.y=t.pos.x>0?-Math.PI/2:Math.PI/2),this._scene.add(s),{id:t.id,group:s,plate:o}}),this._switchMeshes=this._switches.map(t=>{const s=new A,o=new p(new y(.1,.12,.04),t.fixed?e.green:new f({color:16448250,roughness:.6}));o.userData={type:"switch",id:t.id},s.add(o);const i=new p(new y(.025,.06,.05),new f({color:t.fixed?3355392:6710886}));return i.position.set(0,t.fixed?.018:-.018,.02),i.rotation.z=t.fixed?.3:-.3,s.add(i),s.position.copy(t.pos),Math.abs(t.pos.x)>7&&(s.rotation.y=t.pos.x>0?-Math.PI/2:Math.PI/2),this._scene.add(s),{id:t.id,group:s,box:o}}),this._interactMeshes=[...this._outletMeshes.map(t=>({mesh:t.plate,type:"outlet",id:t.id})),...this._switchMeshes.map(t=>({mesh:t.box,type:"switch",id:t.id})),...this._doors.map(t=>({mesh:t.mesh,type:"door",id:t.id})),...this._breakerHit?[{mesh:this._breakerHit,type:"breaker",id:1}]:[]]}_addCol(e,t,s,o,i,a){this._colBoxes.push(new Xe(new v(e-o/2,t-i/2,s-a/2),new v(e+o/2,t+i/2,s+a/2)))}_checkCol(e){const t=new Xe(new v(e.x-.32,e.y-1.65,e.z-.32),new v(e.x+.32,e.y+.12,e.z+.32));if(this._colBoxes.some(s=>s.intersectsBox(t)))return!0;if(this._doors){for(const s of this._doors)if(!s.open&&Math.abs(s.pivot.rotation.y)<.15&&s.closedBox.intersectsBox(t))return!0}return!1}_setupInput(){const e=this._isMob,t=this.root.querySelector("#ex-canvas"),s=i=>{this._keys[i.code]=!0},o=i=>{this._keys[i.code]=!1};if(this._on(window,"keydown",s),this._on(window,"keyup",o),this._on(window,"keydown",i=>{i.code==="KeyE"&&!this._repairOpen&&this._doInteract()}),!e)this._on(t,"click",()=>{!this._pointerLocked&&!this._repairOpen&&t.requestPointerLock()}),this._on(document,"pointerlockchange",()=>{this._pointerLocked=document.pointerLockElement===t;const i=this.root.querySelector("#ex-ptr-msg");i&&(i.style.display=this._pointerLocked?"none":"block")}),this._on(document,"mousemove",i=>{this._pointerLocked&&(this._player.yawVel-=i.movementX*.0022,this._player.pitchVel-=i.movementY*.0022)});else{const i=this.root.querySelector("#ex-joy-outer"),a=this.root.querySelector("#ex-joy-inner");if(i){this._on(i,"touchstart",d=>{if(d.preventDefault(),this._joyId!==-1)return;const h=d.changedTouches[0];this._joyId=h.identifier;const g=i.getBoundingClientRect();this._joyCX=g.left+g.width*.5,this._joyCY=g.top+g.height*.5,this._joyR=g.width*.5,i.classList.add("joy-active")},{passive:!1}),this._on(document,"touchmove",d=>{if(this._joyId!==-1)for(const h of d.changedTouches){if(h.identifier!==this._joyId)continue;const g=h.clientX-this._joyCX,b=h.clientY-this._joyCY,w=Math.hypot(g,b),m=this._joyR*.72,_=Math.min(w,m),E=Math.atan2(b,g);a&&(a.style.transform=`translate(calc(-50% + ${Math.cos(E)*_}px),calc(-50% + ${Math.sin(E)*_}px))`);const M=.18;if(w<this._joyR*M)this._joy.x=0,this._joy.y=0;else{const S=Math.max(0,(_/m-M)/(1-M))*.75;this._joy.x=g/w*S,this._joy.y=b/w*S}}},{passive:!0});const c=d=>{for(const h of d.changedTouches)h.identifier===this._joyId&&(this._joyId=-1,this._joy.x=0,this._joy.y=0,a&&(a.style.transform="translate(-50%,-50%)"),i.classList.remove("joy-active"))};this._on(document,"touchend",c,{passive:!0}),this._on(document,"touchcancel",c,{passive:!0})}const n=this.root.querySelector("#ex-look-zone");if(n){this._on(n,"touchstart",d=>{if(!this._repairOpen){d.preventDefault();for(const h of d.changedTouches)this._lookTouches[h.identifier]={x:h.clientX,y:h.clientY}}},{passive:!1}),this._on(n,"touchmove",d=>{if(this._repairOpen)return;d.preventDefault();const h=.0032;for(const g of d.changedTouches)if(this._lookTouches[g.identifier]){const b=g.clientX-this._lookTouches[g.identifier].x,w=g.clientY-this._lookTouches[g.identifier].y;this._player.yawVel-=b*h,this._player.pitchVel-=w*h,this._lookTouches[g.identifier]={x:g.clientX,y:g.clientY}}},{passive:!1});const c=d=>{for(const h of d.changedTouches)delete this._lookTouches[h.identifier]};this._on(n,"touchend",c,{passive:!1}),this._on(n,"touchcancel",c,{passive:!1})}const r=this.root.querySelector("#ex-btn-interact");r&&this._on(r,"touchstart",c=>{c.preventDefault(),this._repairOpen||this._doInteract()},{passive:!1});const l=this.root.querySelector("#ex-btn-jump");if(l){const c=h=>{h.preventDefault(),this._keys.Space=!0},d=h=>{h.preventDefault(),this._keys.Space=!1};this._on(l,"touchstart",c,{passive:!1}),this._on(l,"touchend",d,{passive:!1})}}}_on(e,t,s,o){e.addEventListener(t,s,o),this._listeners.push([e,t,s,o])}_startLoop(){let e=0;const t=()=>{this._raf=requestAnimationFrame(t);const s=Math.min(this._clock.getDelta(),.05);e+=s,this._repairOpen||this._updatePlayer(s),this._animateDoors(s),this._pulseInteractables(e),this._updateInteractPrompt(),this._drawMinimap(),this._renderer.render(this._scene,this._camera)};this._raf=requestAnimationFrame(t)}_pulseInteractables(e){for(const t of this._outletMeshes){const s=t.group.userData._glow;s&&(s.intensity=.4+Math.sin(e*3.5)*.3);const o=t.group.userData._spark;o&&(o.material.emissiveIntensity=5+Math.sin(e*7.2)*2)}}_animateDoors(e){for(const t of this._doors){const s=t.targetRot-t.pivot.rotation.y;Math.abs(s)>.004?t.pivot.rotation.y+=s*Math.min(1,e*10):t.pivot.rotation.y=t.targetRot}}_updatePlayer(e){const t=this._player,o=this._isMob?.14:.38;t.yaw+=t.yawVel,t.pitch+=t.pitchVel,t.yawVel*=o,t.pitchVel*=o,Math.abs(t.yawVel)<8e-5&&(t.yawVel=0),Math.abs(t.pitchVel)<8e-5&&(t.pitchVel=0),t.pitch=Math.max(-1.38,Math.min(1.38,t.pitch)),this._camera.rotation.order="YXZ",this._camera.rotation.y=t.yaw,this._camera.rotation.x=t.pitch;const i=4.5,a=Math.sin(t.yaw),n=Math.cos(t.yaw),r=new v(-a,0,-n),l=new v(n,0,-a);let c=this._joy.x,d=this._joy.y;(this._keys.KeyW||this._keys.ArrowUp)&&(d=-1),(this._keys.KeyS||this._keys.ArrowDown)&&(d=1),(this._keys.KeyA||this._keys.ArrowLeft)&&(c=-1),(this._keys.KeyD||this._keys.ArrowRight)&&(c=1);const h=new v;if(h.addScaledVector(r,-d).addScaledVector(l,c),h.lengthSq()>0&&h.normalize(),h.lengthSq()>0)t.vel.addScaledVector(h,22*e),t.vel.length()>i&&t.vel.normalize().multiplyScalar(i);else{const _=t.vel.length();_>.01?t.vel.multiplyScalar(Math.max(0,1-18*e/_)):t.vel.set(0,0,0)}t.grounded=t.pos.y<=Re+Ye+.12,t.grounded?(t.vy<0&&(t.vy=0),this._keys.Space&&(t.vy=7,t.grounded=!1)):t.vy-=22*e,t.pos.y+=t.vy*e,t.pos.y<Re+Ye&&(t.pos.y=Re+Ye,t.vy=0,t.grounded=!0);const g=t.pos.clone().addScaledVector(t.vel,e);if(g.x=Math.max(-7.5,Math.min(7.5,g.x)),g.z=Math.max(-31.5,Math.min(7.5,g.z)),!this._checkCol(g))t.pos.copy(g);else{const _=new v(g.x,t.pos.y,t.pos.z);this._checkCol(_)||(t.pos.x=g.x,t.vel.z=0);const E=new v(t.pos.x,t.pos.y,g.z);this._checkCol(E)||(t.pos.z=g.z,t.vel.x=0)}const b=t.vel.length();b>.2?(this._bobT+=e*7*(b/i),this._bobAmt=Math.min(1,this._bobAmt+e*7),G.play("footstep",e)):this._bobAmt=Math.max(0,this._bobAmt-e*6);const m=Math.sin(this._bobT)*.04*this._bobAmt;this._camera.position.set(t.pos.x,t.pos.y+m,t.pos.z)}_updateInteractPrompt(){var h,g,b,w;const t=this._player.pos;let s=null,o=1/0;for(const m of this._interactMeshes){const _=new v;m.mesh.getWorldPosition(_);const E=t.distanceTo(_);E<2.4&&E<o&&(o=E,s=m)}this._nearest=s;let i="",a=!1;if(s)if(a=!0,s.type==="door"){const m=this._doors.find(_=>_.id===s.id);i=m!=null&&m.open?"🚪 CLOSE DOOR":"🚪 OPEN DOOR"}else if(s.type==="outlet"){const m=(h=this._outlets.find(_=>_.id===s.id))==null?void 0:h.fixed;i=m?"✅ OUTLET OK":"🔧 FIX OUTLET",a=!m}else if(s.type==="switch"){const m=(g=this._switches.find(_=>_.id===s.id))==null?void 0:g.fixed;i=m?"✅ SWITCH OK":"💡 WIRE SWITCH",a=!m}else s.type==="breaker"&&(i=this._breakerFixed?"✅ PANEL OK":"⚠️ RESET BREAKER",a=!this._breakerFixed);s&&!this._repairOpen&&this._guide&&(s.type==="outlet"&&!((b=this._outlets.find(m=>m.id===s.id))!=null&&b.fixed)&&!this._guideTipsFired.outlet?(this._guideTipsFired.outlet=!0,this._guide.show("near_outlet")):s.type==="switch"&&!((w=this._switches.find(m=>m.id===s.id))!=null&&w.fixed)&&!this._guideTipsFired.switch?(this._guideTipsFired.switch=!0,this._guide.show("near_switch")):s.type==="breaker"&&!this._breakerFixed&&!this._guideTipsFired.breaker&&(this._guideTipsFired.breaker=!0,this._guide.show("near_breaker")));const n=this.root.querySelector("#ex-prompt");n&&(n.style.display=s?"block":"none",s&&(n.textContent=i+(this._isMob?"":" [E]")));const r=this.root.querySelector("#ex-btn-interact");if(r){r.classList.toggle("ex-btn-interact--active",a),r.style.display=this._isMob?"flex":"none";const m=r.querySelector(".ex-btn-interact-icon");m&&(m.textContent=s?s.type==="door"?"🚪":s.type==="outlet"?"🔧":"💡":"⚡");const _=this.root.querySelector("#ex-btn-label");_&&(_.textContent=i,_.classList.toggle("show",!!(i&&a)))}const l=this.root.querySelector("#ex-room");if(l){const m=this._player.pos.z;l.textContent=m>=-2?"ENTRANCE":m>=-18?"WORKSHOP A":"WORKSHOP B"}const c=this.root.querySelector("#ex-crosshair");c&&c.classList.toggle("ex-crosshair--hit",!!s);const d=this.root.querySelector("#ex-btn-label");d&&(d.textContent=i,d.classList.toggle("show",a))}_doInteract(){if(!this._nearest)return;const{type:e,id:t}=this._nearest;if(e==="door")this._toggleDoor(t);else if(e==="outlet"){const s=this._outlets.find(o=>o.id===t);if(s!=null&&s.fixed){this._notify("Outlet already fixed!","ok");return}this._openOutletRepair(t)}else if(e==="switch"){const s=this._switches.find(o=>o.id===t);if(s!=null&&s.fixed){this._notify("Switch already installed!","ok");return}this._openSwitchRepair(t)}else e==="breaker"&&this._doFixBreaker()}_doFixBreaker(){if(this._breakerFixed){this._notify("⚡ Breaker panel OK","ok");return}this._openBreakerRepair()}_openBreakerRepair(){if(this._breakerFixed)return;this._repairOpen=!0,document.exitPointerLock&&document.exitPointerLock();const e=this.root.querySelector("#brk-overlay");if(e){e.style.display="flex";const t=e.querySelector("#brk-tripped");t&&(t.onclick=()=>this._fixBreaker(e))}}_fixBreaker(e){if(e&&(e.style.display="none"),this._repairOpen=!1,this._breakerFixed=!0,C.saveExploreBreaker(),C.addXP(100),this._breakerBreakers){const t=this._breakerBreakers.find(s=>s.tripped);t&&(t.mesh.material=this._M.green,t.tripped=!1)}G.play("breaker_click"),G.play("xp_gain"),this._notify("✅ Breaker reset! +100 XP","ok"),this._updateScoreHUD(),this._guide&&this._guide.show("after_fix")}_toggleDoor(e){const t=this._doors.find(s=>s.id===e);t&&(t.open=!t.open,t.targetRot=t.open?-Math.PI/2:0,G.play("door"),this._notify(t.open?"🚪 Door opened":"🚪 Door closed","info"))}_openHtmlRepair(e,t){if(this._htmlRepairEl)return;this._repairOpen=!0,document.exitPointerLock&&document.exitPointerLock();const s=document.createElement("div");s.style.cssText="position:absolute;inset:0;z-index:80;background:#060a14;display:flex;flex-direction:column;";const o=document.createElement("div");o.style.cssText="position:absolute;top:0;left:0;z-index:90;padding:8px;",o.innerHTML=`<button style="background:rgba(4,8,20,.9);border:1px solid rgba(0,212,255,.35);color:#00d4ff;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border-radius:9px;cursor:pointer;letter-spacing:1px;display:flex;align-items:center;gap:6px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>BACK
    </button>`;const i=document.createElement("iframe");i.style.cssText="flex:1;border:none;width:100%;height:100%;",i.src=e;const a=()=>{window.removeEventListener("message",n),s.remove(),this._htmlRepairEl=null,this._repairOpen=!1},n=r=>{var l,c;((l=r.data)==null?void 0:l.type)==="complete"&&(a(),t()),((c=r.data)==null?void 0:c.type)==="back"&&a()};window.addEventListener("message",n),o.querySelector("button").addEventListener("click",a),o.querySelector("button").addEventListener("touchend",r=>{r.preventDefault(),a()}),s.appendChild(i),s.appendChild(o),this.root.appendChild(s),this._htmlRepairEl=s}_openOutletRepair(e){this._openHtmlRepair("./learn-outlet.html",()=>{var o;C.saveExploreOutlet(e),C.addXP(150),(o=this._guide)==null||o.show("after_fix");const t=this._outlets.find(i=>i.id===e);t&&(t.fixed=!0);const s=this._outletMeshes.find(i=>i.id===e);if(s){s.plate.material=this._M.green;const i=s.group.userData._glow;i&&(i.intensity=0,i.color.set(4521864));const a=s.group.userData._spark;a&&(a.visible=!1)}this._updateScoreHUD(),G.play("success"),G.play("xp_gain"),this._notify("⚡ +150 XP — Outlet Fixed!","ok")})}closeRepair(){this._repairOpen=!1,this._htmlRepairEl&&(this._htmlRepairEl.remove(),this._htmlRepairEl=null)}_openSwitchRepair(e){this._openHtmlRepair("./switch_installation.html",()=>{var o;C.saveExploreSwitch(e),C.addXP(200),(o=this._guide)==null||o.show("after_fix");const t=this._switches.find(i=>i.id===e);t&&(t.fixed=!0);const s=this._switchMeshes.find(i=>i.id===e);s&&(s.box.material=new f({color:65416,roughness:.6,emissive:new L(65416),emissiveIntensity:.8})),G.play("success"),G.play("xp_gain"),this._notify(`✅ Switch #${e} installed! +200 XP`,"ok"),this._updateScoreHUD()})}_drawMinimap(){const e=this.root.querySelector("#ex-minimap");if(!e)return;const t=e.getContext("2d"),s=e.width,o=e.height;t.clearRect(0,0,s,o);const i=h=>(h+8)*(s/16),a=h=>(h+32)*(o/40);t.fillStyle="rgba(7,16,31,.9)",t.fillRect(0,0,s,o),[{x:-8,z:-2,w:16,d:10,color:"rgba(0,212,255,.12)"},{x:-8,z:-18,w:16,d:16,color:"rgba(42,111,168,.18)"},{x:-8,z:-32,w:16,d:14,color:"rgba(31,90,140,.18)"}].forEach(h=>{t.fillStyle=h.color,t.fillRect(i(h.x),a(h.z),h.w*(s/16),h.d*(o/40))}),this._outlets.forEach(h=>{t.fillStyle=h.fixed?"#2dc653":"#ff5544",t.beginPath(),t.arc(i(h.pos.x),a(h.pos.z),3,0,Math.PI*2),t.fill()}),this._switches.forEach(h=>{t.fillStyle=h.fixed?"#ffdd44":"#ff9900",t.fillRect(i(h.pos.x)-3,a(h.pos.z)-3,6,6)});const n=i(this._player.pos.x),r=a(this._player.pos.z);t.fillStyle="#00d4ff",t.beginPath(),t.arc(n,r,4,0,Math.PI*2),t.fill();const l=this._player.yaw,c=n+Math.sin(-l)*7,d=r+Math.cos(-l)*7;t.strokeStyle="#00d4ff",t.lineWidth=1.5,t.beginPath(),t.moveTo(n,r),t.lineTo(c,d),t.stroke()}_updateScoreHUD(){const e=this._outlets.length+this._switches.length+1,t=this._outlets.filter(o=>o.fixed).length+this._switches.filter(o=>o.fixed).length+(this._breakerFixed?1:0),s=this.root.querySelector("#ex-score");if(s&&(s.textContent=`${t}/${e}`),t>=e&&e>0){const o=this.root.querySelector("#ex-stage-complete");if(o&&!o.classList.contains("show")){const i=this.root.querySelector("#ex-sc-score");i&&(i.textContent=`${t}/${e} Objectives`),setTimeout(()=>o.classList.add("show"),1200),setTimeout(()=>G.play("complete"),1e3),C.saveLearnStage("ways"),this._guide&&this._guide.show("all_done")}}}_notify(e,t="info"){const s=this.root.querySelector("#ex-notify");if(!s)return;const o=document.createElement("div");o.className="ex-notif"+(t==="ok"?" ok":""),o.textContent=e,s.prepend(o),setTimeout(()=>o.remove(),3200)}destroy(){var e;cancelAnimationFrame(this._raf),this._raf=null,(e=this._ro)==null||e.disconnect();for(const[t,s,o,i]of this._listeners)t.removeEventListener(s,o,i);this._listeners=[],document.exitPointerLock&&document.exitPointerLock(),this._htmlRepairEl&&(this._htmlRepairEl.remove(),this._htmlRepairEl=null),this._scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material.forEach(s=>s.dispose()):t.material.dispose())}),this._renderer.dispose()}}const Ws=[{title:"Welcome to the Control Room!",text:"I'm <b>Electro</b>, your guide! Your mission: find and fix every broken outlet and light switch in this facility."},{title:"How to Move",textDesktop:"Click the screen to lock your mouse.<br><b>W A S D</b> — walk &nbsp;|&nbsp; <b>Mouse</b> — look<br><b>Space</b> — jump",textMobile:"<b>Joystick</b> (bottom-left) — walk<br>Drag screen — look around<br><b>▲</b> button — jump"},{title:"How to Interact",textDesktop:"Walk up to a glowing outlet or switch.<br>When the label appears, press <b>E</b> to interact.",textMobile:"Walk up to a glowing outlet or switch.<br>When <b>⚡ ACT</b> lights up, tap it to interact."},{title:"What to Look For",text:"🔴 <b>Red sparks</b> — broken outlet, repair it!<br>🔵 <b>Blue glow</b> — switch that needs wiring!<br>⚡ Fix them all to complete the stage!"}],$s={near_outlet:"Broken outlet detected! Press E (or tap ACT) to repair it.",near_switch:"Switch offline! Press E (or tap ACT) to install it.",near_breaker:"Tripped breaker panel! Press E (or tap ACT) to reset the circuit.",after_fix:"System restored! Keep scanning — find all the faults!",all_done:"ALL SYSTEMS ONLINE! You fixed everything! You're a certified tech! ⚡",door:"Tip: Get close to a door and press E to open it."},Ds=`
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

/* ── CENTER TIP OVERLAY ─────────────────────────────────────── */
.mg-tip{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  z-index:55;pointer-events:auto;
  background:rgba(0,4,14,.72);
  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
  animation:mg-fade-in .28s ease both;
}
.mg-tip.hiding{animation:mg-fade-out .2s ease both;}

.mg-tip-card{
  display:flex;flex-direction:row;align-items:stretch;
  background:linear-gradient(135deg,rgba(4,14,36,.99) 0%,rgba(2,8,24,.99) 100%);
  border:1px solid rgba(0,212,255,.38);
  border-radius:20px;
  max-width:400px;width:calc(100% - 48px);
  box-shadow:0 0 0 1px rgba(0,212,255,.08),0 0 50px rgba(0,212,255,.15),0 20px 50px rgba(0,0,0,.7);
  overflow:hidden;
}
.mg-tip-left{
  flex:1;display:flex;flex-direction:column;justify-content:center;
  padding:22px 20px 20px 22px;
}
.mg-tip-right{
  width:110px;flex-shrink:0;
  display:flex;align-items:flex-end;justify-content:center;
  background:linear-gradient(180deg,rgba(0,212,255,.04) 0%,rgba(0,212,255,.10) 100%);
  border-left:1px solid rgba(0,212,255,.14);
  padding:10px 6px 0;
}
.mg-tip-mascot{
  width:100px;height:auto;object-fit:contain;
  filter:drop-shadow(0 0 12px rgba(0,212,255,.5));
  animation:mg-float 2.8s ease-in-out infinite;
}
.mg-tip-name{
  font-family:'Barlow Condensed',sans-serif;
  font-size:9px;font-weight:800;letter-spacing:.18em;
  color:#00d4ff;text-transform:uppercase;margin-bottom:8px;
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.3);
  border-radius:20px;padding:3px 10px;width:fit-content;
}
.mg-tip-text{
  font-family:'Barlow Condensed',sans-serif;
  font-size:14px;font-weight:600;line-height:1.6;
  color:rgba(255,255,255,.9);margin-bottom:16px;
}
.mg-tip-got-btn{
  font-family:'Barlow Condensed',sans-serif;
  font-size:13px;font-weight:800;letter-spacing:.1em;
  color:#000;background:linear-gradient(135deg,#00d4ff 0%,#0096cc 100%);
  border:none;border-radius:10px;padding:10px 22px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  box-shadow:0 0 18px rgba(0,212,255,.45),0 4px 10px rgba(0,0,0,.4);
  transition:transform .14s;text-transform:uppercase;width:100%;
}
.mg-tip-got-btn:active{transform:scale(.93);}
`;class js{constructor(e){this._root=e,this._tipEl=null,this._tipTimer=null,this._tutEl=null,this._shown=null,this._isMob=navigator.maxTouchPoints>0,this._injectCSS()}_injectCSS(){if(document.querySelector("#mg-css"))return;const e=document.createElement("style");e.id="mg-css",e.textContent=Ds,document.head.appendChild(e)}showTutorial(e){if(this._tutEl)return;let t=0;const s=Ws,o=s.length,i=document.createElement("div");i.className="mg-tutorial";const a=Array.from({length:o},(w,m)=>`<div class="mg-dot${m===0?" active":""}"></div>`).join("");i.innerHTML=`
      <div class="mg-card">
        <div class="mg-card-left">
          <div class="mg-volt-badge">⚡ ELECTRO — Your Guide</div>
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
          <img class="mg-mascot-img" src="/Mascot.png" alt="Electro" />
        </div>
      </div>
    `;const n=i.querySelector(".mg-next-btn"),r=i.querySelector(".mg-skip-btn"),l=i.querySelector(".mg-step-title"),c=i.querySelector(".mg-step-text"),d=i.querySelector(".mg-step-counter"),h=i.querySelectorAll(".mg-dot"),g=()=>{const w=s[t];d.textContent=`Step ${t+1} of ${o}`,l.textContent=w.title,c.innerHTML=w.text||(this._isMob?w.textMobile:w.textDesktop)||"",h.forEach((m,_)=>m.classList.toggle("active",_===t)),n.textContent=t===o-1?"Let's Go ⚡":"Next →"},b=()=>{i.classList.add("hiding"),setTimeout(()=>{i.remove(),this._tutEl=null},260),e==null||e()};n.addEventListener("click",()=>{t<o-1?(t++,g()):b()}),r.addEventListener("click",b),g(),this._root.appendChild(i),this._tutEl=i}show(e){const t=$s[e];if(!t||this._shown===e)return;clearTimeout(this._tipTimer),this._tipEl&&(this._tipEl.remove(),this._tipEl=null),this._shown=e;const s=document.createElement("div");s.className="mg-tip",s.innerHTML=`
      <div class="mg-tip-card">
        <div class="mg-tip-left">
          <div class="mg-tip-name">⚡ ELECTRO</div>
          <div class="mg-tip-text">${t}</div>
          <button class="mg-tip-got-btn">Got It!</button>
        </div>
        <div class="mg-tip-right">
          <img class="mg-tip-mascot" src="/Mascot.png" alt="Electro" />
        </div>
      </div>
    `;const o=()=>this.hide();s.querySelector(".mg-tip-got-btn").addEventListener("click",o),s.querySelector(".mg-tip-got-btn").addEventListener("touchend",a=>{a.preventDefault(),o()}),this._root.appendChild(s),this._tipEl=s;const i=e==="all_done"?14e3:8e3;this._tipTimer=setTimeout(()=>this.hide(),i)}hide(){if(!this._tipEl)return;this._tipEl.classList.add("hiding");const e=this._tipEl;this._tipEl=null,this._shown=null,clearTimeout(this._tipTimer),setTimeout(()=>e.remove(),280)}destroy(){var e,t;clearTimeout(this._tipTimer),(e=this._tipEl)==null||e.remove(),(t=this._tutEl)==null||t.remove(),this._tipEl=null,this._tutEl=null}}const Fs=`
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
`;function Gs(){if(document.querySelector("#ex-css"))return;const u=document.createElement("style");u.id="ex-css",u.textContent=Fs,document.head.appendChild(u)}class Xs{constructor(e){this.state=e,this._scene=null,this.container=this._build()}_build(){Gs();const e=navigator.maxTouchPoints>0,t=document.createElement("div");t.className="screen screen-hidden",t.innerHTML=`
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
        ${e?"":'<div id="ex-crosshair"></div>'}

        <!-- Desktop hint -->
        ${e?"":'<div id="ex-ptr-msg">CLICK TO LOOK · WASD MOVE · E INTERACT</div>'}


        <!-- Mobile controls -->
        ${e?`
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

      </div>`,t.querySelector(".ex-hud-back").addEventListener("click",()=>{var o;(o=this._scene)==null||o.destroy(),this._scene=null,this.state.setState("stagesHub")});const s=t.querySelector("#ex-mob-menu");return s&&s.addEventListener("touchstart",o=>{var i;o.preventDefault(),(i=this._scene)==null||i.destroy(),this._scene=null,this.state.setState("stagesHub")},{passive:!1}),t.querySelector("#or-back-btn").addEventListener("click",()=>{var o;(o=this._scene)==null||o.closeRepair()}),t.querySelector("#sw-back-btn").addEventListener("click",()=>{var o;(o=this._scene)==null||o.closeRepair()}),t.querySelector("#ex-sc-btn").addEventListener("click",()=>{var o,i;(o=this._scene)==null||o.destroy(),this._scene=null,(i=this._guide)==null||i.destroy(),this._guide=null,this.state.setState("stagesHub")}),t.querySelector("#brk-cancel").addEventListener("click",()=>{t.querySelector("#brk-overlay").style.display="none",this._scene&&(this._scene._repairOpen=!1)}),this._el=t,t}onShow(){if(!this._scene){const e=this._el.querySelector(".ex-wrap");this._guide=new js(e),this._scene=new Bs(this.state,e,this._guide),this._guide.showTutorial()}}onHide(){var e,t;(e=this._scene)==null||e.destroy(),this._scene=null,(t=this._guide)==null||t.destroy(),this._guide=null}}const Us={splash:"splash",loading:"loading",nameEntry:"nameEntry",menu:"menu",settings:"settings",achievements:"achievements",tools:"tools",credits:"credits",wireLearn:"wireLearn",wireTypes:"wireTypes",electricianTools:"electricianTools",wireStripping:"wireStripping",stagesHub:"stagesHub",outletLesson:"outletLesson",learnOutlet:"learnOutlet",ways:"ways",switchInstallation:"switchInstallation",explore:"explore",game:null};class Ys{constructor(e){this.state=e,this.root=null,this.screens={},this.currentScreen=null,this._busy=!1}init(){this.root=document.getElementById("ui-root"),this.screens={splash:new Qt(this.state),loading:new Zt(this.state),nameEntry:new Jt(this.state),menu:new ts(this.state),settings:new is(this.state),achievements:new ns(this.state),tools:new as(this.state),credits:new ds(this.state),wireLearn:new us(this.state),wireTypes:new vs(this.state),electricianTools:new ks(this.state),wireStripping:new Es(this.state),stagesHub:new Is(this.state),outletLesson:new Rs(this.state),learnOutlet:new ut(this.state,{key:"learnOutlet",src:"/learn-outlet.html",title:"FIX THE FAULTS",backState:"stagesHub"}),ways:new ut(this.state,{key:"ways",src:"/ways.html",title:"SWITCH WAYS",backState:"stagesHub"}),switchInstallation:new ut(this.state,{key:"switchInstallation",src:"/switch_installation.html",title:"SWITCH INSTALLATION",backState:"stagesHub"}),explore:new Xs(this.state)};for(const e of Object.values(this.screens))this.root.appendChild(e.container);this.state.on("stateChange",({from:e,to:t,payload:s})=>this._onChange(e,t,s))}_onChange(e,t,s){const o=Us[t];if(t==="game"){this.currentScreen&&(this._hide(this.currentScreen),this.currentScreen=null);return}o!==void 0&&this._go(o,s)}_go(e,t){var s,o;if(!this._busy){if(!this.currentScreen){this._show(e,t);return}if(this.currentScreen===e){(o=(s=this.screens[e])==null?void 0:s.onShow)==null||o.call(s,t);return}this._busy=!0,this._hide(this.currentScreen,()=>{this._show(e,t),this._busy=!1})}}_show(e,t){var o;const s=this.screens[e];s&&((o=s.onShow)==null||o.call(s,t),s.container.classList.remove("screen-hidden","screen-exit"),s.container.offsetWidth,s.container.classList.add("screen-visible"),this.currentScreen=e)}_hide(e,t){const s=this.screens[e];if(!s){t==null||t();return}s.container.classList.remove("screen-visible"),s.container.classList.add("screen-exit");let o=!1;const i=()=>{var n;o||(o=!0,clearTimeout(a),s.container.classList.remove("screen-exit"),s.container.classList.add("screen-hidden"),(n=s.onHide)==null||n.call(s),t==null||t())};s.container.addEventListener("transitionend",i,{once:!0});const a=setTimeout(i,380)}}class Vs{constructor(e,t,s){this.renderer=e,this.loop=t,this.state=s,this._scene=null,this._camera=null,this._active=!1,this._hud=null,this._levelData=null,this._t=0,this._lampFill=null}init(){this._buildScene(),this._buildHUD(),window.addEventListener("resize",()=>this._onResize()),this.state.on("stateChange",({to:e,payload:t})=>{this._active=e==="game",this._hud.style.display=this._active?"flex":"none",this._active&&t&&(this._levelData=t)})}_buildScene(){this._scene=new we,this._scene.background=new L(658968),this._scene.fog=new Ne(658968,.022),this._camera=new Ce(58,window.innerWidth/window.innerHeight,.1,100),this._camera.position.set(0,2.8,6.5),this._camera.lookAt(0,-.4,0),it(this._scene);const{lampFill:e}=st(this._scene,{benchY:-.64,benchW:12,benchD:5.5});this._lampFill=e;const t=-.49;[13378082,14211288,1744452,2250171].forEach((r,l)=>{const c=new p(new k(.055,.055,2.4,20),new f({color:r,roughness:.55,metalness:.05,emissive:r,emissiveIntensity:.04}));c.rotation.z=Math.PI/2,c.position.set(-1.5+l*1,t+.055,.4),c.castShadow=!0,this._scene.add(c),[-1,1].forEach(d=>{const h=new p(new k(.038,.038,.14,12),new f({color:13928762,roughness:.15,metalness:.95,emissive:13928762,emissiveIntensity:.12}));h.rotation.z=Math.PI/2,h.position.set(-1.5+l*1+d*1.27,t+.055,.4),this._scene.add(h)})});const o=document.createElement("canvas");o.width=256,o.height=160;const i=o.getContext("2d");i.fillStyle="#0d3320",i.fillRect(0,0,256,160),i.strokeStyle="#00aa44",i.lineWidth=1.5,[[20,20,200,20],[20,20,20,140],[200,20,200,60],[20,60,120,60],[120,60,120,140],[120,100,200,100]].forEach(([r,l,c,d])=>{i.beginPath(),i.moveTo(r,l),i.lineTo(c,d),i.stroke()}),i.fillStyle="#00ff66",[[20,20],[200,20],[20,60],[120,60],[200,100],[120,140]].forEach(([r,l])=>{i.beginPath(),i.arc(r,l,4,0,Math.PI*2),i.fill()});const a=new he(o),n=new p(new y(2.2,.04,1.4),new f({map:a,color:865056,roughness:.7,metalness:.15}));n.position.set(2.5,t+.02,-.8),n.castShadow=!0,this._scene.add(n)}_buildHUD(){this._hud=document.createElement("div"),this._hud.id="game-hud",this._hud.style.display="none",this._hud.innerHTML=`
      <div class="hud-top">
        <button class="hud-btn" id="hud-menu">${H.back} MENU</button>
        <div class="hud-progress">
          <div class="hud-bar-track">
            <div class="hud-bar-fill" id="hud-fill" style="width:60%"></div>
          </div>
          <span id="hud-pct">60%</span>
        </div>
        <button class="hud-btn" id="hud-pause">${H.pause}</button>
      </div>
      <div class="hud-task">
        <div class="hud-task-title">TASK</div>
        <p class="hud-task-text">
          Connect the <strong>yellow wire</strong> from the battery
          <strong>positive (+)</strong> to the switch.
        </p>
      </div>
    `,document.getElementById("ui-root").appendChild(this._hud),this._hud.querySelector("#hud-menu").addEventListener("click",()=>{this.state.setState("menu")})}update(e){this._active&&(this._t+=e,this._lampFill&&(this._lampFill.intensity=.65+Math.sin(this._t*3.1)*.04),this.renderer.instance.render(this._scene,this._camera))}_onResize(){this._camera&&(this._camera.aspect=window.innerWidth/window.innerHeight,this._camera.updateProjectionMatrix())}}class Ks{constructor(){this.state=new Ut,this.loop=new Yt,this.renderer=new Vt,this.input=new Kt,this.ui=new Ys(this.state),this.scene=new Vs(this.renderer,this.loop,this.state),this.db=C}init(){this.renderer.init(),this.input.init(),this.ui.init(),this.scene.init(),this.state.on("stateChange",({from:e,to:t})=>{t==="game"?(this.renderer.show(),this.loop.start()):e==="game"&&(this.renderer.hide(),this.loop.stop())}),this.loop.add(e=>this.scene.update(e)),this.state.setState("splash")}}G.init();const Qs=new Ks;Qs.init();
