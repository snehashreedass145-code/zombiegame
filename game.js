const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 3,
  hp: 100
};

// Game variables
let bullets = [];
let zombies = [];
let score = 0;
let ammo = 30;
let level = 1;
let gameOver = false;

// Load sounds
const sounds = {
  shoot: new Audio("shoot.wav"),
  zombieDeath: new Audio("zombieDeath.wav"),
  bgMusic: new Audio("bgMusic.wav")
};

sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.4;
sounds.bgMusic.play();

// Aiming with mouse
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  player.angle = Math.atan2(my - player.y, mx - player.x);
});

// Movement
let keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Shooting
document.addEventListener("click", () => {
  if (ammo > 0 && !gameOver) {
    bullets.push({
      x: player.x,
      y: player.y,
      angle: player.angle
    });
    ammo--;
    playSound("shoot");
  }
});

function playSound(name) {
  sounds[name].currentTime = 0;
  sounds[name].play();
}

// Spawn zombies
function spawnZombie() {
  zombies.push({
    x: Math.random() < 0.5 ? 0 : canvas.width,
    y: Math.random() * canvas.height,
    hp: 50 + level * 10,
    speed: 1 + level * 0.3
  });
}

setInterval(spawnZombie, 1500);

function movePlayer() {
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;
}

// GAME LOOP
function update() {
  if (gameOver) return;

  movePlayer();

  // Move bullets
  bullets.forEach((b, i) => {
    b.x += Math.cos(b.angle) * 8;
    b.y += Math.sin(b.angle) * 8;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  // Zombie movement + collisions
  zombies.forEach((z, zi) => {
    let angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.x += Math.cos(angle) * z.speed;
    z.y += Math.sin(angle) * z.speed;

    // bullet hit
    bullets.forEach((b, bi) => {
      if (Math.hypot(b.x - z.x, b.y - z.y) < 25) {
        z.hp -= 40;
        bullets.splice(bi, 1);

        if (z.hp <= 0) {
          zombies.splice(zi, 1);
          score++;
          playSound("zombieDeath");
          if (score % 10 === 0) level++;
        }
      }
    });

    // zombie hits player
    if (Math.hypot(player.x - z.x, player.y - z.y) < 35) {
      player.hp -= 1;
      if (player.hp <= 0) gameOver = true;
    }
  });

  draw();
  requestAnimationFrame(update);
}

// DRAW EVERYTHING
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player emoji 🧍
  ctx.font = "30px Arial";
  ctx.fillText("🧍", player.x - 15, player.y + 10);

  // Bullets 🔴
  ctx.font = "20px Arial";
  bullets.forEach((b) => {
    ctx.fillText("🔴", b.x, b.y);
  });

  // Zombies 🧟
  zombies.forEach((z) => {
    ctx.fillText("🧟", z.x, z.y);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("HP: " + player.hp, 20, 55);
  ctx.fillText("Ammo: " + ammo, 20, 80);

  // GAME OVER SCREEN
  if (gameOver) drawGameOver();
}

// GAME OVER SCREEN
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", 330, 200);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Final Score: " + score, 370, 240);
  ctx.fillText("Press ENTER to Restart", 330, 280);
}

// Restart
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && gameOver) restartGame();
});

function restartGame() {
  player.hp = 100;
  ammo = 30;
  score = 0;
  level = 1;
  zombies = [];
  bullets = [];
  gameOver = false;
}

update();
