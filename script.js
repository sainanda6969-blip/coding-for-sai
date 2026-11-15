// Simple Pong game
// Left paddle is player-controlled (mouse + arrow keys). Right paddle is computer AI.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreboard = {
  player: document.getElementById('playerScore'),
  computer: document.getElementById('computerScore')
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 10;
const PLAYER_X = PADDLE_MARGIN;
const COMPUTER_X = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
const PADDLE_SPEED = 6; // for keyboard movement

// Ball settings
const BALL_RADIUS = 8;
const BALL_SPEED_START = 5;
const BALL_SPEED_INCREMENT = 0.3;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 degrees

// State
let playerScore = 0;
let computerScore = 0;
let paused = false;

// Entities
const player = {
  x: PLAYER_X,
  y: (HEIGHT - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const computer = {
  x: COMPUTER_X,
  y: (HEIGHT - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  maxSpeed: 5
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  r: BALL_RADIUS,
  speed: BALL_SPEED_START,
  dx: 0,
  dy: 0
};

// Initialize ball direction
function resetBall(servingToPlayer = false) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.speed = BALL_SPEED_START;
  // randomize initial angle, but ensure not too steep
  const angle = (Math.random() * 2 - 1) * (Math.PI / 4);
  // serve to the side that lost the point (so if servingToPlayer==true, ball moves left)
  const dir = servingToPlayer ? -1 : (Math.random() < 0.5 ? -1 : 1);
  ball.dx = dir * Math.cos(angle);
  ball.dy = Math.sin(angle);
}

// Score update
function updateScore() {
  scoreboard.player.textContent = playerScore;
  scoreboard.computer.textContent = computerScore;
}

// Draw helpers
function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = '#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = 'rgba(200,200,200,0.06)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background subtle panel
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Net
  drawNet();

  // Paddles
  drawRect(player.x, player.y, player.width, player.height, '#00e0a1');
  drawRect(computer.x, computer.y, computer.width, computer.height, '#66d9b2');

  // Ball
  drawCircle(ball.x, ball.y, ball.r, '#e6eef8');

  // If paused overlay
  if (paused) {
    ctx.fillStyle = 'rgba(3,6,12,0.5)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '22px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused — Press Space to Resume', WIDTH / 2, HEIGHT / 2);
  }
}

// Collision detection between ball and paddle
function paddleCollision(p, b) {
  // AABB vs Circle (approx)
  const nearestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
  const nearestY = Math.max(p.y, Math.min(b.y, p.y + p.height));
  const dx = b.x - nearestX;
  const dy = b.y - nearestY;
  return (dx * dx + dy * dy) <= (b.r * b.r);
}

// Update physics
function update() {
  if (paused) return;

  // Move player by keyboard input
  player.y += player.dy;
  // Keep player in bounds
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
