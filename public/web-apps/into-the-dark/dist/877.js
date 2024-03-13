"use strict";(self.webpackChunk_explorables_into_the_dark=self.webpackChunk_explorables_into_the_dark||[]).push([[877,141,836,581,38],{1877:(t,e,a)=>{a.r(e),a.d(e,{default:()=>u});var s=a(8882),r=a(4038),i=a(141),n=a(8508),l=a(1263),d=a(1836),o=a(7126),h=a(3555),c=a(3581);class p extends s.Z{constructor(t,e){const a=l.Z.mode5;a.alignment_radius=a.al_def,a.dark_al=a.al_def,a.attraction_radius=a.ar_def,a.dark_ar=a.ar_def,a.speed_in_the_dark=a.speed_def,a.speed_in_the_light=a.speed_def,super(a),this.params=a,this.params=a,this.mean_hidden=0,this.best_score=0,this.data=new Array(1e3).fill(0),this.ticks=1,this.start=o.ou.now(),this.duration=o.nL.fromObject({seconds:0}),this.avg_ar=2,this.avg_al=1,this.avg_s=2,this.trialNumber=1;const s=document.cookie.replace(/(?:(?:^|.*;\s*)res\s*\=\s*([^;]*).*$)|^.*$/,"$1");s?(this.results=JSON.parse(decodeURIComponent(s)),this.trialNumber=this.results[this.results.length-1][0]):this.results=[],n.Ys("#controls").select("svg").style("width","100%").attr("viewBox",`0 0 ${t.width} ${t.height}`),n.Ys("#controls").classed("svg-classes",!1),this.sliders=(0,r.default)(this.params),n.Ys("#control-text").classed("notsim5",!1),(0,i.setup_chart)(this,e),(0,c.setupScores)(this),(0,d.default)()}soft_reset(t){this.total=0,this.mean_hidden=0,this.best_score=0,this.ticks=1,this.duration=o.nL.fromObject({seconds:0}),this.start={},this.data=new Array(1e3).fill(0),n.Ys("#line").datum(this.data),this.updateSliderAverages(),this.playing=!1,document.getElementById("playpause").src="./play.svg"}reset(t){this.total=0,this.mean_hidden=0,this.best_score=0,this.ticks=1,this.updateSliderAverages(),this.duration=o.nL.fromObject({seconds:0}),this.start={},this.data=new Array(1e3).fill(0),n.Ys("#line").datum(this.data),this.sliders.speed_slider.value(2),this.sliders.al_slider.value(1),this.sliders.ar_slider.value(2),t.alignment_radius=t.al_def,t.dark_al=t.al_def,t.attraction_radius=t.ar_def,t.dark_ar=t.ar_def,t.speed_in_the_dark=t.speed_def,t.speed_in_the_light=t.speed_def,this.avg_ar=2,this.avg_al=1,this.avg_s=2,this.playing=!1,document.getElementById("playpause").src="./play.svg",this.initialize(this.params)}updateSliderAverages(){let t=2,e=2,a=1;this.sliders&&(t=this.sliders.speed_slider.value(),e=this.sliders.ar_slider.value(),a=this.sliders.al_slider.value()),this.avg_s=(0,h.tD)(this.avg_s,t,this.ticks),this.avg_ar=(0,h.tD)(this.avg_ar,e,this.ticks),this.avg_al=(0,h.tD)(this.avg_al,a,this.ticks)}trial_finish(){if(this.timer.stop){const t=n.BYU().domain([0,4]).range([-1,1]);this.timer.stop(),this.results.push([this.trialNumber,t(this.avg_s).toFixed(1),t(2*this.avg_al).toFixed(1),t(this.avg_ar).toFixed(1),Math.round(1e3*this.mean_hidden)/1e3]),(0,c.updateTable)(this.results);const e=encodeURIComponent(JSON.stringify(this.results));document.cookie="res="+e+"; Max-Age=1704085200; path=/",this.soft_reset(this.params)}}go(){const t=o.nL.fromObject({seconds:30});0===this.duration.seconds&&(0!=this.results.length&&(this.trialNumber++,n.Ys("#trialNum").text(`Trial: ${this.trialNumber}`)),n.Ys("#timeLeft").text("Time Left: 30s"),this.initialize(this.params));const e=o.ou.now(),a=this.duration.plus(e.diff(this.start,"seconds"));if(Math.floor(a.seconds)>Math.floor(this.duration.seconds)&&n.Ys("#timeLeft").text(`Time Left: ${30-Math.floor(a.seconds)}s`),this.duration=a,this.start=e,this.duration>=t)return void this.trial_finish(this);super.go();const s=this.agents.reduce(((t,e)=>t+e.ishidden),0)/this.params.N;this.mean_hidden=(0,h.tD)(this.mean_hidden,s,this.ticks),this.ticks+=1,this.updateSliderAverages(),(0,i.chart_tick)(this,s),this.best_score=Math.max(this.best_score,this.mean_hidden)}}function u(){document.getElementById("sim").innerHTML="";const t=window.innerWidth<=999?{width:500,height:350}:{width:795,height:325},e=window.innerWidth<=999?{width:415,height:180}:{width:650,height:180};return new p(t,e)}},141:(t,e,a)=>{a.r(e),a.d(e,{chart_tick:()=>p,setup_chart:()=>c});var s=a(8508);const r=s.WUZ(".0%"),i={top:10,right:30,bottom:20,left:60},n=420-i.left-i.right,l=150-i.top-i.bottom,d=s.BYU().domain([0,999]).range([0,n]),o=s.BYU().domain([0,1]).range([l,0]),h=s.jvg().x((function(t,e){return d(e)})).y((function(t,e){return o(t)})).curve(s.c_6);function c(t,e){const a=s.Ys("#control-text").classed("notsim5",!1).append("svg").attr("id","#chart").attr("viewBox",`0 0 ${e.width} ${e.height}`),r=a.append("g").attr("transform",`translate(${i.left}, ${i.top+15})`);r.append("defs").append("clipPath").attr("id","clip").append("rect").attr("width",n).attr("height",l+5).attr("y",-2),r.append("g").attr("class","axis axis--x").attr("transform","translate(0,"+o(0)+")").call(s.LLu(d).ticks(0)),r.append("g").attr("class","axis axis--y").call(s.y4O(o).ticks(5).tickFormat(s.WUZ(".0%"))),r.append("g").attr("clip-path","url(#clip)").append("path").datum(t.data).attr("id","line").transition().duration(500).ease(s.Nyw),r.append("line").attr("id","avg-line").style("stroke-width",2).style("stroke","darkgray").attr("x1",1).attr("y1",o(0)).attr("x2",n).attr("y2",o(0)),r.append("line").attr("id","best-line").style("stroke-width",2).style("stroke","#cb1f83").attr("x1",1).attr("y1",o(0)).attr("x2",n).attr("y2",o(0)),a.append("text").attr("id","y-label").attr("x",0).attr("y",10).text("% fish in the dark").style("font-size","16px").attr("transform","translate(2,140)rotate(270)");a.append("line").style("stroke-width",2).style("stroke","#cb1f83").attr("x1",295).attr("y1",165).attr("x2",305).attr("y2",165),a.append("text").attr("id","high").attr("x",307).attr("y",170).text("High: 0%"),a.append("line").style("stroke-width",2).style("stroke","darkgray").attr("x1",170).attr("y1",165).attr("x2",180).attr("y2",165),a.append("text").attr("id","running-avg").attr("x",182).attr("y",170).text("Average: 0%"),a.append("line").style("stroke-width",2).style("stroke","rgb(63, 120, 168)").attr("x1",45).attr("y1",165).attr("x2",55).attr("y2",165),a.append("text").attr("id","current").attr("x",57).attr("y",170).text("Current: 0%"),a.append("text").attr("id","trialNum").attr("x",68).attr("y",30).text(`Trial: ${t.trialNumber}`).style("font-size","12px"),a.append("text").attr("id","timeLeft").attr("x",68).attr("y",40).text("Time Left: 30s").style("font-size","12px")}function p(t,e){const a=t.mean_hidden,i=t.best_score,n=t.data;n.push(e),s.Ys("#line").attr("d",h).attr("transform",null).transition().attr("transform","translate("+d(-1)+",0)"),a>i&&(s.Ys("#best-line").attr("y1",o(a)).attr("y2",o(a)),s.Ys("#high").text(`High: ${r(a.toFixed(2))}`)),s.Ys("#avg-line").attr("y1",o(a)).attr("y2",o(a)),s.Ys("#running-avg").text(`Average: ${r(a.toFixed(2))}`),s.Ys("#current").text(`Current: ${r(e.toFixed(2))}`),n.shift()}},1836:(t,e,a)=>{function s(){const t=document.getElementById("sim"),e=document.createElement("div");e.id="modal",e.className="ba bw1",e.style.display="block";const a=t.appendChild(e),s=document.getElementById("overlay");s.style.display="block",a.innerHTML="\n    <div class=\"modal-content\">\n      <span class=\"close\">&times;</span>\n      <h1 style='color:rgb(38, 34, 144)'>Part 5: Let's run an experiment!</h1>\n      Now that you think you know what variable(s) control how a       school of fish finds its way to the dark and stays there, let's put it to the test.       <p>Goal: Maximize the percentage of fish in the dark. </p>      <p>Steps: </p>      <ol><li>When you press play, a 30 second trial will start. At the end, the average settings       and % Fish in the Dark will be added to the table. </li>      <li>Sliders can be adjusted throughout a trial. Use the running average plot to understand       how the sliders affect fish behavior.</li>\n      <li>Run several trials to try to maximize the % of fish in the dark!</li>\n      <li>See how your high score compares to others in your group.</li></ol>\n    </div>",document.getElementsByClassName("close")[0].onclick=function(){a.style.display="none",s.style.display="none"},window.onclick=function(t){t.target==s&&(a.style.display="none",s.style.display="none")};const r=document.createElement("div");r.textContent="Info",r.className="ph3 pv1 ba info-btn",r.style.cursor="pointer",r.style.display="inline-block",r.onclick=function(){a.style.display="block",s.style.display="block"},document.getElementById("button-container").append(r)}a.r(e),a.d(e,{default:()=>s})},3581:(t,e,a)=>{a.r(e),a.d(e,{setupScores:()=>r,updateTable:()=>i});const s=(0,a(8508).WUZ)(".0%");function r(t){const e=document.createElement("div");e.setAttribute("id","scoreTable"),document.getElementById("controls").appendChild(e);const a=document.cookie.replace(/(?:(?:^|.*;\s*)res\s*\=\s*([^;]*).*$)|^.*$/,"$1"),r=a?JSON.parse(decodeURIComponent(a)):[];let i=document.createElement("table"),n=["Trial Number","Avg Speed","Avg Alignment","Avg Attraction","Avg % In The Dark"],l=document.createElement("thead");n.forEach((t=>{let e=document.createElement("th");e.textContent=t,l.appendChild(e)})),i.appendChild(l);const d=document.createElement("tbody");if(i.appendChild(d),0!=r.length)for(let t=0;t<r.length;t++){let e=r[t],a=document.createElement("tr");for(let t=0;t<n.length;t++){let r=document.createElement("td");t==n.length-1?r.textContent=s(+e[t]):r.textContent=+e[t],a.appendChild(r)}d.appendChild(a)}else{let t=document.createElement("tr");for(let e=0;e<n.length;e++){let e=document.createElement("td");e.textContent=" ",t.appendChild(e)}d.appendChild(t)}e.appendChild(i);const o=document.createElement("div");o.textContent="Clear results",o.className="ph3 pv1 ba mt-2",o.style.cursor="pointer",o.onclick=function(){document.cookie="res=; Max-Age=-99999999;",document.cookie="res=; Max-Age=1704085200; path=/;",t.results=[];const e=document.getElementsByTagName("tbody")[0];e.innerHTML="";let a=document.createElement("tr");for(let t=0;t<n.length;t++){let t=document.createElement("td");t.textContent=" ",a.appendChild(t)}e.appendChild(a)},e.append(o)}function i(t){let e=document.getElementsByTagName("tbody")[0];const a=t[t.length-1];if(t.length>1){let t=document.createElement("tr");for(let e=0;e<5;e++){let r=document.createElement("td");r.textContent=4==e?s(a[e]):a[e],t.appendChild(r)}e.appendChild(t)}else{const t=document.getElementsByTagName("td");for(let e=0;e<5;e++)t[e].textContent=4==e?s(a[e]):a[e]}}},4038:(t,e,a)=>{a.r(e),a.d(e,{default:()=>i});var s=a(8508),r=a(8662);const i=t=>{const e=100,a=s.Ys("#controls").select("svg").append("g").attr("id","sliders").attr("transform","translate(15, 50)"),i=["Much Greater","Equal","Much Greater"];for(let t=0;t<3;t++){a.append("rect").attr("width",480).attr("height",40).attr("x",-10).attr("y",e*t).attr("fill","url(#svgGradient)");for(let s=0;s<5;s++)a.append("line").style("stroke-width",1).style("stroke","darkgray").attr("x1",460*s/4).attr("y1",e*t+40).attr("x2",460*s/4).attr("y2",e*t+50);a.append("text").text("Light").attr("x",0).attr("y",e*t+18).attr("text-anchor","start"),a.append("text").text("Dark").attr("x",462).attr("y",e*t+18).attr("text-anchor","end").attr("fill","white"),a.append("text").text(i[0]).attr("x",10).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","start"),a.append("text").text(i[1]).attr("x",230).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","middle"),a.append("text").text(i[2]).attr("x",450).attr("y",e*t+65).style("font-size","12px").attr("text-anchor","end"),a.append("text").text("-1").attr("x",-5).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","start"),a.append("text").text("-0.5").attr("x",113).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","middle").attr("fill","black"),a.append("text").text("0").attr("x",231).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","middle").attr("fill","black"),a.append("text").text("+0.5").attr("x",354).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","end").attr("fill","white"),a.append("text").text("+1").attr("x",464).attr("y",e*t+33).style("font-size","12px").attr("text-anchor","end").attr("fill","white");const s=["Relative Speed","Relative Alignment Radius","Relative Attraction Radius"];a.append("text").text(s[0]).attr("x",230).attr("y",-5).attr("text-anchor","middle"),a.append("text").text(s[1]).attr("x",230).attr("y",95).attr("text-anchor","middle"),a.append("text").text(s[2]).attr("x",230).attr("y",195).attr("text-anchor","middle")}var n=a.append("defs").append("linearGradient").attr("id","svgGradient").attr("x1","0%").attr("x2","100%").attr("y1","100%").attr("y2","100%");n.append("stop").attr("class","start").attr("offset","0%").attr("stop-color","white").attr("stop-opacity",0),n.append("stop").attr("class","end").attr("offset","100%").attr("stop-color","black").attr("stop-opacity",1);const l=(0,r.Ao)().min(0).max(4).step(1).width(460).value(2).displayValue(!1).tickValues([]).on("onchange",(e=>{t.speed_in_the_light=1.5-e/4,t.speed_in_the_dark=.5+e/4})),d=(a.append("g").call(l).attr("transform","translate(0, 40)"),(0,r.Ao)().min(0).max(2).step(.5).width(460).tickValues([]).value(1).displayValue(!1).on("onchange",(e=>{e<1?(t.alignment_radius=4,t.dark_al=0+(e-1)/1*4):e>1?(t.alignment_radius=4-(e-1)/1*4,t.dark_al=4):(t.alignment_radius=4,t.dark_al=4)}))),o=(a.append("g").call(d).attr("transform","translate(0, 140)"),80),h=(0,r.Ao)().min(0).max(4).step(1).width(460).tickValues([]).value(2).displayValue(!1).on("onchange",(e=>{e<=2?(t.attraction_radius=o,t.dark_ar=5+e/2*75):e>=2?(t.attraction_radius=o-(e-2)/2*75,t.dark_ar=o):(t.attraction_radius=o,t.dark_ar=o)}));return a.append("g").call(h).attr("transform","translate(0, 240)"),{speed_slider:l,ar_slider:h,al_slider:d}}}}]);