count = 0;
const colors = ["#97b2de", "#929e82", "#d9a384"];
function chBackcolor() {
    document.body.style.background = colors[count%length(colors)];
 }