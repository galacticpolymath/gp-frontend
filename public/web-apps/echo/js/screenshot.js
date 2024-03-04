export default function download_network(e) {
    var svgEl = document.getElementById("sim-svg");
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  
    var serializer = new XMLSerializer();
    var svgStr = serializer.serializeToString(svgEl); // svgEl (an XML) -> str
    var svgBlob = new Blob([svgStr], {type:"image/svg+xml;charset=utf-8"}); // -> blob
    var svgUrl = URL.createObjectURL(svgBlob); 
  
    var img = new Image();
    img.src = svgUrl;
  
    var canvas = document.createElement("canvas");
    canvas.width = 

    img.onload = function() {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
  
      var pngDataUrl = canvas.toDataURL("image/png");
      var downloadLink = document.createElement("a");
      downloadLink.href = pngDataUrl;
      downloadLink.download = 'network.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
  }