"use strict";(self.webpackChunk_explorables_into_the_dark=self.webpackChunk_explorables_into_the_dark||[]).push([[737,955,894],{8737:(t,e,a)=>{a.r(e),a.d(e,{default:()=>d});var n=a(8882),s=a(7894),i=a(4955),l=a(8508),o=a(1263);class r extends n.Z{constructor(){const t=o.Z.mode2;t.N=t.N_def,t.attraction_radius=t.ar_def,super(t),this.params=t,this.N=t.N,l.Ys("#controls").select("svg").style("width","100%").attr("viewBox","0 0 500 168"),l.Ys("#control-text").html("\n            <div class='new-var-container-wrapper'>\n                <h4>New Variables</h4>\n                <section class='d-flex flex-column'>\n                    <span>• <b>N</b>: Number of fish </span>\n                    <span>• <b>Attraction Radius</b>: maximum distance between a fish and its </span>\n                </section>\n                <h4>Questions for your exploration</h4>\n                    <ol>\n                <li>\n                    How many fish are in a school? Is there a \"magic number\" N for which schooling behavior emerges? \n                </li>                \n                <li>\n                    How does Attraction Radius affect schooling behavior?\n                </li>                \n            </ol>\n            </div>\n        "),this.sliders=(0,s.default)(t),(0,i.default)()}go(){if(this.N!=this.params.N)return this.N=this.params.N,void this.initialize(this.params);super.go()}reset(){this.sliders.n_slider.value(1),this.sliders.ar_slider.value(0),this.params.N=this.params.N_def,this.params.attraction_radius=this.params.ar_def,this.N=this.params.N,this.initialize(this.params)}}function d(){return document.getElementById("sim").innerHTML="",new r}},4955:(t,e,a)=>{function n(){const t=document.getElementById("sim"),e=document.createElement("div");e.id="modal",e.className="ba bw1",e.style.display="block";const a=t.appendChild(e),n=document.getElementById("overlay");n.style.display="block",a.innerHTML='\n    <div class="modal-content">\n      <span class="close">&times;</span>\n      <h1 style=\'color:rgb(38, 34, 144)\'>Part 2: Groups</h1>\n      <p>So far, the fish have all been moving randomly on their own.       We can simulate group behavior by introducing 2 new variables and       changing the algorithm (simulation rules). On this page, each fish (i)       will follow its nearest neighbor if it falls within the defined attraction radius.</p> \n      <p><b>Play with the sliders, explore, and observe!</b></p>\n    </div>',document.getElementsByClassName("close")[0].onclick=function(){a.style.display="none",n.style.display="none"},window.onclick=function(t){t.target==n&&(a.style.display="none",n.style.display="none")};const s=document.createElement("div");s.textContent="Info",s.className="ph3 pv1 ba ma3",s.style.cursor="pointer",s.style.display="inline-block",s.onclick=function(){a.style.display="block",n.style.display="block"},document.getElementById("button-container").append(s)}a.r(e),a.d(e,{default:()=>n})},7894:(t,e,a)=>{a.r(e),a.d(e,{default:()=>i});var n=a(8508),s=a(8662);const i=t=>{const e=n.Ys("#controls").select("svg"),a=(0,s.Ao)().min(1).max(30).step(1).width(460).tickValues([1,15,30]).value(1).on("onchange",(e=>{t.N=e}));e.append("g").call(a).attr("transform","translate(15, 40)"),e.append("text").text("N").attr("x",240).attr("text-anchor","middle").attr("y",20);const i=(0,s.Ao)().min(0).max(10).step(1).width(460).tickValues([0,5,10]).value(0).on("onchange",(e=>{t.attraction_radius=4*e}));return e.append("g").call(i).attr("transform","translate(15, 130)"),e.append("text").text("Attraction Radius").attr("x",240).attr("text-anchor","middle").attr("y",110),{n_slider:a,ar_slider:i}}}}]);