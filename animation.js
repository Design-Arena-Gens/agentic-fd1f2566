const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

let animationFrame = 0;
let isPlaying = false;
let animationId = null;

// Animation states
const STATES = {
    PLAYING: 'playing',
    LION_EATING: 'eating',
    FINISHED: 'finished'
};

let currentState = STATES.PLAYING;
let stateTimer = 0;

// Character positions and properties
let monkey = {
    x: 250,
    y: 350,
    size: 40,
    armAngle: 0,
    jumping: false,
    jumpOffset: 0,
    visible: true
};

let lion = {
    x: 500,
    y: 350,
    size: 80,
    tailAngle: 0,
    tailSwing: 0,
    mouthOpen: 0,
    annoyed: 0
};

// Draw grass
function drawGrass() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 450, 800, 150);

    // Draw grass blades
    ctx.strokeStyle = '#196F19';
    ctx.lineWidth = 2;
    for (let i = 0; i < 800; i += 20) {
        for (let j = 0; j < 3; j++) {
            const x = i + Math.random() * 20;
            const y = 450 + Math.random() * 30;
            ctx.beginPath();
            ctx.moveTo(x, y + 20);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}

// Draw sun
function drawSun() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(700 + Math.cos(angle) * 50, 80 + Math.sin(angle) * 50);
        ctx.lineTo(700 + Math.cos(angle) * 70, 80 + Math.sin(angle) * 70);
        ctx.stroke();
    }
}

// Draw monkey
function drawMonkey() {
    if (!monkey.visible) return;

    const x = monkey.x;
    const y = monkey.y - monkey.jumpOffset;
    const size = monkey.size;

    // Body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.7, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.6, size * 0.35, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.75, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.75, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(x, y - size * 0.6, size * 0.2, 0, Math.PI);
    ctx.stroke();

    // Arms
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;

    // Left arm reaching for tail
    const armReach = Math.sin(monkey.armAngle) * 30;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y);
    ctx.lineTo(x + armReach + 80, y + 20);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, y);
    ctx.lineTo(x + size * 0.5, y + size * 0.4);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y + size * 0.5);
    ctx.lineTo(x - size * 0.2, y + size * 0.9);
    ctx.moveTo(x + size * 0.2, y + size * 0.5);
    ctx.lineTo(x + size * 0.2, y + size * 0.9);
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y + size * 0.3);
    ctx.quadraticCurveTo(x + size * 0.8, y - size * 0.5, x + size * 0.6, y - size);
    ctx.stroke();
}

// Draw lion
function drawLion() {
    const x = lion.x;
    const y = lion.y;
    const size = lion.size;

    // Tail
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 8;
    const tailX = x + size * 0.8;
    const tailY = y + size * 0.2;
    const tailEndX = tailX + Math.cos(lion.tailAngle) * 80;
    const tailEndY = tailY + Math.sin(lion.tailAngle) * 60;

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.quadraticCurveTo(
        tailX + 40, tailY - 30 + lion.tailSwing,
        tailEndX, tailEndY
    );
    ctx.stroke();

    // Tail tuft
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(tailEndX, tailEndY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.2, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Mane
    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * size * 0.5,
            y - size * 0.2 + Math.sin(angle) * size * 0.5,
            size * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Face details
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.1, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes - show annoyance
    ctx.fillStyle = '#000';
    const eyeSlant = lion.annoyed * 0.1;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.15, y - size * 0.25, size * 0.08, size * 0.08, eyeSlant, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.15, y - size * 0.25, size * 0.08, size * 0.08, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (angry when annoyed)
    if (lion.annoyed > 0) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.25, y - size * 0.3);
        ctx.lineTo(x - size * 0.1, y - size * 0.35);
        ctx.moveTo(x + size * 0.25, y - size * 0.3);
        ctx.lineTo(x + size * 0.1, y - size * 0.35);
        ctx.stroke();
    }

    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (lion.mouthOpen > 0) {
        // Open mouth eating
        ctx.arc(x, y - size * 0.05, size * 0.15 + lion.mouthOpen * 20, 0, Math.PI);
        // Teeth
        ctx.fillStyle = '#FFF';
        for (let i = -1; i <= 1; i++) {
            ctx.fillRect(x + i * 10 - 3, y - size * 0.05, 6, 12);
        }
    } else {
        ctx.arc(x, y, size * 0.15, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.15);
    ctx.lineTo(x - 5, y - size * 0.2);
    ctx.lineTo(x + 5, y - size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(x - size * 0.3, y + size * 0.4, size * 0.2, size * 0.5);
    ctx.fillRect(x - size * 0.05, y + size * 0.4, size * 0.2, size * 0.5);
    ctx.fillRect(x + size * 0.5, y + size * 0.4, size * 0.2, size * 0.5);
    ctx.fillRect(x + size * 0.75, y + size * 0.4, size * 0.2, size * 0.5);
}

// Animation loop
function animate() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawSun();
    drawGrass();

    animationFrame++;
    stateTimer++;

    if (currentState === STATES.PLAYING) {
        // Monkey playing with tail - first 300 frames (10 seconds)
        if (stateTimer < 300) {
            // Monkey jumping animation
            monkey.jumpOffset = Math.abs(Math.sin(animationFrame * 0.1)) * 20;

            // Monkey reaching for tail
            monkey.armAngle = animationFrame * 0.1;

            // Lion tail swinging
            lion.tailAngle = Math.sin(animationFrame * 0.05) * 0.5;
            lion.tailSwing = Math.sin(animationFrame * 0.08) * 20;

            // Lion getting annoyed
            lion.annoyed = Math.min(stateTimer / 100, 3);
        } else {
            // Transition to eating
            currentState = STATES.LION_EATING;
            stateTimer = 0;
        }
    } else if (currentState === STATES.LION_EATING) {
        // Lion turns and eats monkey - 100 frames (3.3 seconds)
        if (stateTimer < 100) {
            // Lion opens mouth
            lion.mouthOpen = Math.min(stateTimer / 30, 1);

            // Monkey gets closer to lion's mouth
            if (stateTimer > 30) {
                monkey.x += 3;
                monkey.y -= 1;
                monkey.size *= 0.97;
            }

            // Monkey disappears
            if (stateTimer > 70) {
                monkey.visible = false;
            }
        } else {
            // Close mouth
            lion.mouthOpen = Math.max(1 - (stateTimer - 100) / 20, 0);

            if (stateTimer > 120) {
                currentState = STATES.FINISHED;
                isPlaying = false;
                playBtn.textContent = 'Play Again';
                playBtn.disabled = false;
            }
        }
    }

    drawLion();
    drawMonkey();

    if (isPlaying) {
        animationId = requestAnimationFrame(animate);
    }
}

// Reset animation
function resetAnimation() {
    isPlaying = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animationFrame = 0;
    stateTimer = 0;
    currentState = STATES.PLAYING;

    monkey = {
        x: 250,
        y: 350,
        size: 40,
        armAngle: 0,
        jumping: false,
        jumpOffset: 0,
        visible: true
    };

    lion = {
        x: 500,
        y: 350,
        size: 80,
        tailAngle: 0,
        tailSwing: 0,
        mouthOpen: 0,
        annoyed: 0
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSun();
    drawGrass();
    drawLion();
    drawMonkey();

    playBtn.textContent = 'Play Animation';
    playBtn.disabled = false;
}

// Event listeners
playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        playBtn.disabled = true;
        playBtn.textContent = 'Playing...';
        animate();
    }
});

resetBtn.addEventListener('click', resetAnimation);

// Initial draw
resetAnimation();
