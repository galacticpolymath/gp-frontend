"use strict";(self.webpackChunk_explorables_into_the_dark=self.webpackChunk_explorables_into_the_dark||[]).push([[581],{3581:(e,t,n)=>{n.r(t),n.d(t,{setupScores:()=>o,updateTable:()=>d});const l=(0,n(8508).WUZ)(".0%");function o(e){const t=document.createElement("div");t.setAttribute("id","scoreTable"),document.getElementById("controls").appendChild(t);const n=document.cookie.replace(/(?:(?:^|.*;\s*)res\s*\=\s*([^;]*).*$)|^.*$/,"$1"),o=n?JSON.parse(decodeURIComponent(n)):[];let d=document.createElement("table"),c=["Trial Number","Avg Speed","Avg Alignment","Avg Attraction","Avg % In The Dark"],a=document.createElement("tr");c.forEach((e=>{let t=document.createElement("th");t.textContent=e,a.appendChild(t)})),d.appendChild(a);const r=document.createElement("tbody");if(d.appendChild(r),0!=o.length)for(let e=0;e<o.length;e++){let t=o[e],n=document.createElement("tr");for(let e=0;e<c.length;e++){let o=document.createElement("td");e==c.length-1?o.textContent=l(+t[e]):o.textContent=+t[e],n.appendChild(o)}r.appendChild(n)}else{let e=document.createElement("tr");for(let t=0;t<c.length;t++){let t=document.createElement("td");t.textContent=" ",e.appendChild(t)}r.appendChild(e)}t.appendChild(d);const m=document.createElement("div");m.textContent="Clear results",m.className="ph3 pv1 ba mv3",m.style.cursor="pointer",m.onclick=function(){document.cookie="res=; Max-Age=-99999999;",document.cookie="res=; Max-Age=1704085200; path=/;",e.results=[];const t=document.getElementsByTagName("tbody")[0];t.innerHTML="";let n=document.createElement("tr");for(let e=0;e<c.length;e++){let e=document.createElement("td");e.textContent=" ",n.appendChild(e)}t.appendChild(n)},t.append(m)}function d(e){let t=document.getElementsByTagName("tbody")[0];const n=e[e.length-1];if(e.length>1){let e=document.createElement("tr");for(let t=0;t<5;t++){let o=document.createElement("td");o.textContent=4==t?l(n[t]):n[t],e.appendChild(o)}t.appendChild(e)}else{const e=document.getElementsByTagName("td");for(let t=0;t<5;t++)e[t].textContent=4==t?l(n[t]):n[t]}}}}]);