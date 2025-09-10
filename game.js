let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let playBtn = document.getElementById("playBtn");

let birdX = 50, birdY = 200, birdSize = 20, gravity = 0.32, velocity = 0, jump = -6.5; // dari -8.5 ke -6.5 agar lompatan lebih rendah
let pipes = [], pipeWidth = 50, pipeGap = 200, pipeSpeed = 1.7;
let score = 0;
let gameRunning = false;
let animationId;
let started = false; // <-- status baru
let maxVelocity = 8; // <-- batas kecepatan maksimal

// Buat pipa awal
function createPipe() {
    let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 50)) + 20;
    pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + pipeGap, passed: false });
}

function resetGame() {
    birdX = 50;
    birdY = 200;
    velocity = 0;
    pipes = [];
    score = 0;
    started = false; // <-- reset status
    createPipe();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Burung
    if (started) {
        velocity += gravity;
        if (velocity > maxVelocity) velocity = maxVelocity;
        birdY += velocity;
    }
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(birdX, birdY, birdSize, 0, Math.PI * 2);
    ctx.fill();

    // Pipa
    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        if (started) p.x -= pipeSpeed;

        ctx.fillStyle = "green";
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height);

        // Skor
        if (!p.passed && p.x + pipeWidth < birdX) {
            score++;
            p.passed = true;
        }

        // Cek tabrakan
        if (started &&
            birdX + birdSize > p.x && birdX - birdSize < p.x + pipeWidth &&
            (birdY - birdSize < p.top || birdY + birdSize > p.bottom)
        ) {
            gameOver();
            return;
        }
    }

    // Hapus pipa keluar
    if (started && pipes[0].x + pipeWidth < 0) pipes.shift();

    // Tambah pipa baru
    if (started && pipes[pipes.length - 1].x < canvas.width - 220) createPipe(); // jarak antar pipa lebih jauh

    // Cek jatuh
    if (started && birdY + birdSize > canvas.height) {
        gameOver();
        return;
    }

    // Skor
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    animationId = requestAnimationFrame(update);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // Buat popup skor
    let popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "#fff";
    popup.style.padding = "32px 40px";
    popup.style.borderRadius = "18px";
    popup.style.boxShadow = "0 8px 32px rgba(44,130,201,0.18)";
    popup.style.textAlign = "center";
    popup.style.fontSize = "1.3rem";
    popup.style.zIndex = 9999;
    popup.innerHTML = `
        <b>Game Over!</b><br>
        Skor kamu: <span style="color:#1976d2">${score}</span><br><br>
        <button id="closePopup" style="margin-top:12px;padding:8px 28px;background:#4fc3f7;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">OK</button>
    `;
    document.body.appendChild(popup);

    document.getElementById("closePopup").onclick = function() {
        popup.remove();
        playBtn.style.display = "block";
        canvas.style.display = "none";
    };
}

// Kontrol
document.addEventListener("keydown", function(e) {
    if (!gameRunning) return;
    if (!started) {
        started = true;
        velocity = jump; // <-- langsung lompat saat mulai
        return;
    }
    velocity = jump;
});
canvas.addEventListener("touchstart", function(e) {
    if (!gameRunning) return;
    if (!started) {
        started = true;
        velocity = jump; // <-- langsung lompat saat mulai
        return;
    }
    e.preventDefault();
    velocity = jump;
});

// Play button event
playBtn.onclick = function() {
    resetGame();
    playBtn.style.display = "none";
    canvas.style.display = "block";
    gameRunning = true;
    update();
};
