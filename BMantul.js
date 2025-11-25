let gameScreen = 0;
let ballX, ballY;
let ballSize = 20;
let ballColor;
let gravity = 1;
let ballSpeedVert = 0;
let airFriction = 0.0001;
let friction = 0.1;

let racketColor;
let racketWidth = 100;
let racketHeight = 10;
let racketBounceRate = 20;

let ballSpeedHorizon = 10;
let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallColors;

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;
let scoreVal = 0;

let wallRadius = 50;
let walls = [];

function setup() {
  createCanvas(500, 500);
  ballColor = color(0);
  racketColor = color(0);
  wallColors = color(255,0,0);
  ballX = width / 4;
  ballY = height / 5;
}

function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) gameScreenDisplay();
  else if (gameScreen === 2) gameOverScreen();
}

function initScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  text("Click untuk mulai", width / 2, height / 2);
}

function gameScreenDisplay() {
  background(255);
  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(15);
  text("Click to Restart", width / 2, height / 2 + 10);
  printScore();
}

function mousePressed() {
  if (gameScreen === 0) startGame();
  else if (gameScreen === 2) restart();
}

function startGame() {
  gameScreen = 1;
}

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airFriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + abs(overhead)) {
      makeBounceBottom(mouseY);
      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
      ballSpeedHorizon = (ballX - mouseX) / 5;
    }
  }
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airFriction;
}

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let gapHeight = int(random(minGapHeight, maxGapHeight));
    let gapY = int(random(0, height - gapHeight));

    walls.push({
      x: width,
      y: gapY,
      w: wallWidth,
      h: gapHeight,
      scored: false
    });

    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
    if (walls[i].x + walls[i].w <= 0) walls.splice(i, 1);
  }
}

function wallMover(i) {
  walls[i].x -= wallSpeed;
}

function wallDrawer(i) {
  let wall = walls[i];
  rectMode(CORNER);
  fill(255, 0, 0);

  rect(wall.x, 0, wall.w, wall.y);
  rect(wall.x, wall.y + wall.h, wall.w, height - (wall.y + wall.h));
}

function watchWallCollision(i) {
  let wall = walls[i];

  let inX =
    ballX + ballSize / 2 > wall.x &&
    ballX - ballSize / 2 < wall.x + wall.w;

  let hitTop = inX && ballY - ballSize / 2 < wall.y;
  let hitBottom =
    inX && ballY + ballSize / 2 > wall.y + wall.h;

  if (hitTop || hitBottom) decreaseHealth();

  if (ballX > wall.x + wall.w / 2 && !wall.scored) {
    wall.scored = true;
    score();
  }
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) gameScreen = 2;
}

function drawHealthBar() {
  noStroke();
  rectMode(CORNER);
  fill(230);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  rect(
    ballX - healthBarWidth / 2,
    ballY - 30,
    (healthBarWidth * health) / maxHealth,
    5
  );
}

function score() {
  scoreVal++;
}

function printScore() {
  textAlign(CENTER);

  if (gameScreen === 1) {
    fill(0);
    textSize(30);
    text(scoreVal, width / 2, height / 2 - 100);
  } else if (gameScreen === 2) {
    fill(255);
    textSize(30);
    text("Score: " + scoreVal, width / 2, height / 2 + 80);
  }
}

function restart() {
  scoreVal = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  walls = [];
  lastAddTime = 0;
  gameScreen = 0;
}