"use strict";(self.webpackChunk_explorables_into_the_dark=self.webpackChunk_explorables_into_the_dark||[]).push([[231,85,22],{5231:(t,e,a)=>{a.r(e),a.d(e,{default:()=>o});var r=a(8882),n=a(9022),s=a(2085),i=a(8508),l=a(1263);class d extends r.Z{constructor(){const t=l.Z.mode4;t.alignment_radius=t.al_def,t.dark_al=t.al_def,t.attraction_radius=t.ar_def,t.dark_ar=t.ar_def,t.speed_in_the_dark=t.speed_def,t.speed_in_the_light=t.speed_def,super(t),this.params=t,i.Ys("#controls").select("svg").style("width","100%").attr("viewBox","0 0 500 350"),i.Ys("#overhead-text").html("<b>Question</b>:             <p>How can you configure the sliders below to maximize             the time in the dark for an average fish?"),i.Ys("#control-text").html("<b>Question</b>:             <p>How can you configure the sliders below to maximize             the time in the dark for an average fish?"),this.sliders=(0,n.default)(t),(0,s.default)()}reset(t){this.sliders.speed_slider.value(2),this.sliders.al_slider.value(1),this.sliders.ar_slider.value(2),t.alignment_radius=t.al_def,t.dark_al=t.al_def,t.attraction_radius=t.ar_def,t.dark_ar=t.ar_def,t.speed_in_the_dark=t.speed_def,t.speed_in_the_light=t.speed_def,this.initialize(this.params)}}function o(){return document.getElementById("sim").innerHTML="",new d}},2085:(t,e,a)=>{function r(){const t=document.getElementById("sim"),e=document.createElement("div");e.id="modal",e.className="ba bw1",e.style.display="block";const a=t.appendChild(e),r=document.getElementById("overlay");r.style.display="block",a.innerHTML='\n    <div class="modal-content">\n      <span class="close">&times;</span>\n      <h1 style=\'color:rgb(38, 34, 144)\'>Part 4: Dark</h1>\n      <p>Hiding in the dark is a common strategy for prey to avoid being eaten.       But <i>how does a school of fish find its way into the dark?</i> Each fish only has       a small, partial field of view and a little control over where the school is       going. (it is effectively leaderless).</p>\n      <p><b>Hypothesis:</b> Scientists have proposed that fish schools might be found more       in the dark than the light if the behavioral rules controlling their movement       are consistently different in the light versus the dark.</p>\n    </div>',document.getElementsByClassName("close")[0].onclick=function(){a.style.display="none",r.style.display="none"},window.onclick=function(t){t.target==r&&(a.style.display="none",r.style.display="none")};const n=document.createElement("div");n.textContent="Info",n.className="ph3 pv1 ba mv3 ma3",n.style.cursor="pointer",n.style.display="inline-block",n.onclick=function(){a.style.display="block",r.style.display="block"},document.getElementById("button-container").append(n)}a.r(e),a.d(e,{default:()=>r})},9022:(t,e,a)=>{a.r(e),a.d(e,{default:()=>s});var r=a(8508),n=a(8662);const s=t=>{const e=100,a=r.Ys("#controls").select("svg").append("g").attr("id","sliders").attr("transform","translate(15, 50)"),s=["Much Greater","Equal","Much Greater"];for(let t=0;t<3;t++){a.append("rect").attr("width",480).attr("height",40).attr("x",-10).attr("y",e*t).attr("fill","url(#svgGradient)");for(let r=0;r<5;r++)a.append("line").style("stroke-width",1).style("stroke","darkgray").attr("x1",460*r/4).attr("y1",e*t+40).attr("x2",460*r/4).attr("y2",e*t+50);a.append("text").text("Light").attr("x",0).attr("y",e*t+18).attr("text-anchor","start"),a.append("text").text("Dark").attr("x",462).attr("y",e*t+18).attr("text-anchor","end").attr("fill","white"),a.append("text").text(s[0]).attr("x",10).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","start"),a.append("text").text(s[1]).attr("x",230).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","middle"),a.append("text").text(s[2]).attr("x",450).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","end"),a.append("text").text("-1").attr("x",-5).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","start"),a.append("text").text("-0.5").attr("x",113).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","middle").attr("fill","black"),a.append("text").text("0").attr("x",231).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","middle").attr("fill","black"),a.append("text").text("+0.5").attr("x",354).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","end").attr("fill","white"),a.append("text").text("+1").attr("x",464).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","end").attr("fill","white");const r=["Relative Speed","Relative Alignment Radius","Relative Attraction Radius"];a.append("text").text(r[0]).attr("x",230).attr("y",-5).attr("text-anchor","middle"),a.append("text").text(r[1]).attr("x",230).attr("y",95).attr("text-anchor","middle"),a.append("text").text(r[2]).attr("x",230).attr("y",195).attr("text-anchor","middle")}var i=a.append("defs").append("linearGradient").attr("id","svgGradient").attr("x1","0%").attr("x2","100%").attr("y1","100%").attr("y2","100%");i.append("stop").attr("class","start").attr("offset","0%").attr("stop-color","white").attr("stop-opacity",0),i.append("stop").attr("class","end").attr("offset","100%").attr("stop-color","black").attr("stop-opacity",1);const l=(0,n.Ao)().min(0).max(4).step(1).width(460).value(2).displayValue(!1).tickValues([]).on("onchange",(e=>{t.speed_in_the_light=1.5-e/4,t.speed_in_the_dark=.5+e/4})),d=(a.append("g").call(l).attr("transform","translate(0, 40)"),(0,n.Ao)().min(0).max(2).step(.5).width(460).tickValues([]).value(1).displayValue(!1).on("onchange",(e=>{e<1?(t.alignment_radius=4,t.dark_al=0+(e-1)/1*4):e>1?(t.alignment_radius=4-(e-1)/1*4,t.dark_al=4):(t.alignment_radius=4,t.dark_al=4)}))),o=(a.append("g").call(d).attr("transform","translate(0, 140)"),80),p=(0,n.Ao)().min(0).max(4).step(1).width(460).tickValues([]).value(2).displayValue(!1).on("onchange",(e=>{e<=2?(t.attraction_radius=o,t.dark_ar=5+e/2*75):e>=2?(t.attraction_radius=o-(e-2)/2*75,t.dark_ar=o):(t.attraction_radius=o,t.dark_ar=o)}));return a.append("g").call(p).attr("transform","translate(0, 240)"),{speed_slider:l,al_slider:d,ar_slider:p}}}}]);