let pipePeriod = 3000;
// board
let board;
let boardWidth = 360;
let boardHeight = 640;

// used to draw on canvas
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

//object for the bird
let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

//physics (units are px per frame in this case -2pix each frame)
let velocityX = -2;
let velocityY = 0; // jump speed of the bird
let gravity = 0.4;

let gameOver = false;
let score = 0;

// when window loads call function
window.onload = function () {
  //assign board to document.getElementById (remember in the html file the canvas tag has the id of board)
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used to draw on the page

  // drawing the flappy bird
  //   context.fillStyle = "green";
  //   context.fillRect(bird.x, bird.y, bird.width, bird.height);

  // load Images
  birdImg = new Image();
  birdImg.src = "./images/flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  // load pipe images
  topPipeImg = new Image();
  topPipeImg.src = "./images/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./images/bottompipe.png";

  requestAnimationFrame(update);

  // calls the function placePipes every 1500 milliseconds
  setInterval(placePipes, pipePeriod);
  //listens for a key down and then calls the moveBird function
  document.addEventListener("keydown", moveBird);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //bird
  // adding velocityY coordinates to bird.y coordinates
  velocityY += gravity;
  bird.y = Math.max((bird.y += velocityY), 0);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    // ends the game if the bird falls below the canvas
    gameOver = true;
  }

  // Pipes
  // this for loop uses the variable i as a counter. i starts as 0 if i is < pipeArray.length ++ (increment by 1)
  for (let i = 0; i < pipeArray.length; i++) {
    // sets the pipe array to whatever value i is at
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // 0.5 because there are two pipes and score is counted twice each time
      pipe.passed = true;
    }
    // console.log(i);
    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  //clear pipes (if we do not clear the pipes after they leave the screen over time the array of pipes will get massive and cause memory issues)
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) pipeArray.shift(); //removes first element from the array

  // score
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("GAME OVER", 5, 90);
  }
}

function placePipes() {
  if (gameOver) {
    return;
  }
  //Math.random returns a value of 0-1
  // 0 = y-128 the value stays the same as we have set it by default
  // 1 = y-128 - y256 the pipe height ((512/2)/1)
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let gap = board.height / 4;

  // pipe object
  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  // pushes the pipe object into the pipe array
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + gap,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  // if parameter e (keyEvent) is = to space or arrow up
  if (e.code == "Space" || e.code == "ArrowUp") {
    // jump
    velocityY = -6;

    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //left edge of a is to the left of the right edge of b
    a.x + a.width > b.x && //right edge of rect1 is to the right of the left edge of rect2
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
