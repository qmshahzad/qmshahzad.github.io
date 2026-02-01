// Animated numbers
document.querySelectorAll('.count').forEach(el => {
  let target = +el.dataset.target;
  let current = 0;
  let interval = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 20);
});


// Neural network background
const canvas = document.getElementById('neural-bg');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let nodes = Array.from({length: 80}, () => ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  vx: (Math.random()-0.5)*0.5,
  vy: (Math.random()-0.5)*0.5
}));

function animate() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if(n.x<0||n.x>canvas.width) n.vx*=-1;
    if(n.y<0||n.y>canvas.height) n.vy*=-1;
    ctx.fillStyle='#6ae3ff';
    ctx.fillRect(n.x,n.y,2,2);

    nodes.forEach(m => {
      let d = Math.hypot(n.x-m.x,n.y-m.y);
      if(d<120){
        ctx.strokeStyle='rgba(106,227,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(n.x,n.y);
        ctx.lineTo(m.x,m.y);
        ctx.stroke();
      }
    });
  });
  requestAnimationFrame(animate);
}
animate();
