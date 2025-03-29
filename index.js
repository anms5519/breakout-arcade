const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = {
    width: 100,
    height: 20,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    dx: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: -4
};

const bricks = [];
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let level = 1;
let score = 0;
let lives = 3;
let powerUps = [];

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.speed;
    }

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy *= -1;
                    b.status = 0;
                    score += 10;
                    if (score === brickRowCount * brickColumnCount * 10) {
                        levelComplete();
                    }
                }
            }
        }
    }

    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (!lives) {
            gameOver();
        } else {
            resetBallAndPaddle();
        }
    }

    // Power-ups logic
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy;
        if (powerUp.y + powerUp.height > canvas.height) {
            powerUps.splice(index, 1);
        } else if (powerUp.y + powerUp.height > paddle.y && powerUp.x > paddle.x && powerUp.x < paddle.x + paddle.width) {
            applyPowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();
    drawBricks();
    movePaddle();
    moveBall();
    drawScore();
    drawLevel();
    drawPowerUps();
    requestAnimationFrame(draw);
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLevel() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Level: ' + level, canvas.width - 65, 20);
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.beginPath();
        ctx.rect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        ctx.fillStyle = powerUp.color;
        ctx.fill();
        ctx.closePath();
    });
}

function levelComplete() {
    level++;
    resetBricks();
    resetBallAndPaddle();
    document.getElementById('levelComplete').style.display = 'block';
    setTimeout(() => {
        document.getElementById('levelComplete').style.display = 'none';
        draw();
    }, 2000);
}

function gameOver() {
    document.getElementById('gameOver').style.display = 'block';
    setTimeout(() => {
        document.getElementById('gameOver').style.display = 'none';
        document.location.reload();
    }, 2000);
}

function resetBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
}

function resetBallAndPaddle() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = canvas.width / 2 - paddle.width / 2;
}

function applyPowerUp(type) {
    switch (type) {
        case 'expandPaddle':
            paddle.width *= 1.5;
            setTimeout(() => {
                paddle.width /= 1.5;
            }, 10000);
            break;
        case 'shrinkPaddle':
            paddle.width /= 1.5;
            setTimeout(() => {
                paddle.width *= 1.5;
            }, 10000);
            break;
        case 'extraLife':
            lives++;
            break;
        case 'slowBall':
            ball.speed /= 1.5;
            setTimeout(() => {
                ball.speed *= 1.5;
            }, 10000);
            break;
        case 'fastBall':
            ball.speed *= 1.5;
            setTimeout(() => {
                ball.speed /= 1.5;
            }, 10000);
            break;
    }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

let rightPressed = false;
let leftPressed = false;

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

draw();
