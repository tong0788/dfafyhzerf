// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let gameStarted = false;
let gameEnded = false;
let score = 0;
let startTime;
let targetX, targetY; // 目標圓圈的位置
let targetRadius = 30; // 目標圓圈的半徑
let gameDuration = 30000; // 遊戲持續時間（30 秒）

function preload() {
  // 初始化 HandPose 模型
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 開始偵測手勢
  handPose.detectStart(video, gotHands);

  // 建立開始按鈕
  let startButton = createButton("開始遊戲");
  startButton.position(width / 2 - 40, height / 2 - 20);
  startButton.size(100, 40);
  startButton.style("background-color", "#A6E1FA");
  startButton.style("color", "#001C55");
  startButton.style("font-size", "18px");
  startButton.style("border", "none");
  startButton.style("cursor", "pointer");

  startButton.mousePressed(() => {
    gameStarted = true;
    startTime = millis();
    score = 0;
    generateNewTarget();
    startButton.hide();
  });
}

function draw() {
  background(220);
  image(video, 0, 0);

  // 繪製手勢關鍵點
  drawHandKeypoints();

  if (!gameStarted) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("請按下按鈕開始遊戲", width / 2, height / 2 - 50);
    return;
  }

  if (gameEnded) {
    displayGameOver();
    return;
  }

  // 檢查遊戲時間是否結束
  if (millis() - startTime > gameDuration) {
    gameEnded = true;
    return;
  }

  // 繪製目標
  drawTarget();

  // 檢查手指是否碰到目標
  checkTargetCollision();
}

function drawHandKeypoints() {
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          fill(hand.handedness === "Left" ? "magenta" : "yellow");
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  }
}

function drawTarget() {
  fill(255, 0, 0);
  noStroke();
  ellipse(targetX, targetY, targetRadius * 2);
}

function generateNewTarget() {
  targetX = random(targetRadius, width - targetRadius);
  targetY = random(targetRadius, height - targetRadius);
}

function checkTargetCollision() {
  if (hands.length > 0) {
    let hand = hands[0];
    let indexFinger = hand.annotations.indexFinger[3]; // 食指尖端座標

    let d = dist(indexFinger[0], indexFinger[1], targetX, targetY);
    if (d < targetRadius) {
      score++;
      generateNewTarget(); // 生成新的目標
    }
  }
}

function displayGameOver() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(`遊戲結束！總分：${score} 分`, width / 2, height / 2 - 20);
  text(`感謝遊玩！`, width / 2, height / 2 + 20);
}
