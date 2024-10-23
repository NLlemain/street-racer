let backgroundAudio = null;

// Canvas sizes
var canvas = document.getElementById("canvas");
canvas.width = innerWidth / 2;
canvas.height = innerHeight;
var c = canvas.getContext('2d');

var keys = [];
addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
});
addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

var mycar = new Image();
var obs1 = new Image();
var obs2 = new Image();
var obs3 = new Image();
var obs4 = new Image();
var bg = new Image();

// Store background images in an array
let backgroundImages = [
    'media/img/road1.png',
    'media/img/road2.png',
    'media/img/road3.png',
    'media/img/road4.png',
    'media/img/road5.png'
];

bg.src = backgroundImages[0]; // Start with the first background

obs1.src = 'media/img/obs1.png';
obs2.src = 'media/img/obs2.png';
obs3.src = 'media/img/obs3.png';
obs4.src = 'media/img/obs.png';

// Function to select car color
function selectCarColor() {
    const color = prompt("Choose your car color: red, blue, orange, yellow, or pink.");
    switch (color.toLowerCase()) {
        case 'red':
            mycar.src = 'media/img/mycar_red.png'; break;
        case 'blue':
            mycar.src = 'media/img/mycar_blue.png'; break;
        case 'orange':
            mycar.src = 'media/img/mycar_orange.png'; break;
        case 'yellow':
            mycar.src = 'media/img/mycar_yellow.png'; break;
        case 'pink':
            mycar.src = 'media/img/mycar_pink.png'; break;
        default:
            alert("Invalid color selected, defaulting to red.");
            mycar.src = 'media/img/mycar_red.png';
    }
}

var loadedImages = 0;
var playerScore = 0.0;
var carsPassed = 0;
var level = 1; // Initialize level

function imageLoaded() {
    loadedImages++;
}

mycar.onload = imageLoaded;
bg.onload = imageLoaded;
obs1.onload = imageLoaded;
obs2.onload = imageLoaded;
obs3.onload = imageLoaded;
obs4.onload = imageLoaded;

var carCount = 4;
var obsSpeed = 2;
var obstacles = [];
var cooldown = false;
var hearts = 3;
var lastHeartScore = 0;

var maxSpeed = 12;
var maxSpeed_2 = 18;

for (var i = 0; i < carCount; i++) {
    obstacles.push(new Obstacles(i));
}

// New variables for invulnerability and speed management
var isInvulnerable = false;
var invulnerabilityDuration = 3500; // 3.5 seconds
var speedRecoveryDuration = 2500; // 2.5 seconds for full recovery
var originalSpeed = 4; // Base speed
var speed = originalSpeed;
var recoveryStartTime = null;

function Obstacles(order) {
    this.order = order;
    this.x = (Math.random() * (canvas.width - 100)) + 50;
    this.y = -250 * this.order - 300;

    var obstacleImages = [obs1, obs2, obs3, obs4];
    this.image = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
    
    this.draw = function () {
        this.y += obsSpeed;
        if (this.y >= canvas.height) {
            carsPassed++;
            this.resetPosition();
        }
        c.drawImage(this.image, this.x, this.y, 100, 200);
    }

    this.resetPosition = function() {
        this.x = (Math.random() * (canvas.width - 100)) + 50;
        this.y = -300;
    }
}

var bgy1 = 0;
var bgy2 = -canvas.height;
var dbgy = 10;
var myCarX = canvas.width / 2 - 50;

function newHP() {
    var heartsHtml = "❤️".repeat(hearts);
    document.getElementById('hearts').innerHTML = heartsHtml;
}

function startGame() {
    console.log('Game started');
    backgroundAudio = new Audio('media/sounds/background.mp3');
    backgroundAudio.play();
    selectCarColor();
    document.getElementById('start').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    newHP();
    animate();
}

function update() {
    if (loadedImages === 6) { // Ensure all images are loaded
        bgy1 += dbgy;
        bgy2 += dbgy;

        // Handle car movement
        if (keys[37] && myCarX > 0) {
            myCarX -= speed * (dbgy / 3);
        }
        if (keys[39] && myCarX < canvas.width - 100) {
            myCarX += speed * (dbgy / 3);
        }

        c.clearRect(0, 0, canvas.width, canvas.height);
        playerScore += 0.1 * (dbgy / 3);

        // Update level based on score
        let previousLevel = level;

        if (playerScore < 400) {
            level = 1;
        } else if (playerScore < 800) {
            level = 2;
        } else if (playerScore < 1200) {
            level = 3;
        } else if (playerScore < 1600) {
            level = 4;
        } else {
            level = 5;
        }

        // Change background when level changes
        if (level !== previousLevel) {
            showLoadingScreen(); // Show loading screen
            bg.src = backgroundImages[level - 1];
            bg.onload = () => {
                hideLoadingScreen(); // Hide loading screen when loaded
                c.drawImage(bg, 0, bgy1, canvas.width, canvas.height);
                c.drawImage(bg, 0, bgy2, canvas.width, canvas.height);
            };
        }

        if (Math.floor(playerScore) % 500 === 0 && Math.floor(playerScore) !== lastHeartScore && hearts < 5) {
            hearts++;
            lastHeartScore = Math.floor(playerScore);
            newHP();
        }

        // Speed up 
        if (playerScore > 50 && dbgy < maxSpeed) {
            dbgy += 0.05;
            obsSpeed += 0.05;
        }
        if (playerScore > 350 && dbgy < maxSpeed_2) {
            dbgy += 0.05;
            obsSpeed += 0.05;
        }

        // Obstacles and score and level
        document.getElementById('score').innerHTML = "Score: " + parseInt(playerScore) + " | Level: " + level;

        // Background scrolling
        if (bgy2 >= 0) {
            bgy1 = 0;
            bgy2 = -canvas.height;
        }

        c.drawImage(bg, 0, bgy1, canvas.width, canvas.height);
        c.drawImage(bg, 0, bgy2, canvas.width, canvas.height);
        c.drawImage(mycar, myCarX, canvas.height - 220, 100, 200);
        
        for (var i = 0; i < carCount; i++) {
            obstacles[i].draw();
        }

        // Collision detection
        var overlapping = false;
        for (var i = 0; i < carCount; i++) {
            if ((Math.abs(obstacles[i].x - myCarX) < 95) &&
                (obstacles[i].y >= canvas.height - 400)) {
                overlapping = true;
                break;
            }
        }

        // Handle collision
        if (overlapping) {
            if (!cooldown && hearts > 0) {
                var audio = new Audio(obstacles[i].image === obs2 ? 'media/sounds/drift.mp3' : 'media/sounds/crash.mp3');
                audio.play();
                hearts--;
                cooldown = true;
                newHP();
                if (!isInvulnerable) {
                    activateInvulnerability();
                }
                // Change cooldown duration to 1000 milliseconds (1 seconds)
                setTimeout(() => {
                    cooldown = false;
                }, 1000); // Updated cooldown duration
            }
            if (hearts <= 0) { // If hearts = 0, game ends and redirect
                loadedImages = -1;
                cancelAnimationFrame(animate);
                backgroundAudio.pause();
                window.location.href = "youlost.html";
            }
        }

        // Speed recovery after invulnerability
        if (isInvulnerable) {
            if (recoveryStartTime === null) {
                recoveryStartTime = Date.now();
                speed = originalSpeed * 0.5; // Set speed to 50%
            }

            let elapsed = Date.now() - recoveryStartTime;

            if (elapsed < invulnerabilityDuration) {
                // Still in invulnerability period
                return; // Skip the rest of the update
            } else {
                // End of invulnerability period, start speed recovery
                isInvulnerable = false;
                recoveryStartTime = null;
                speed = originalSpeed * 0.5; // Ensure speed starts from 50%
                recoverSpeed();
            }
        }
    }
}

function activateInvulnerability() {
    isInvulnerable = true;
    setTimeout(() => {
        isInvulnerable = false;
        speed = originalSpeed; // Restore original speed
    }, invulnerabilityDuration);
}

function recoverSpeed() {
    let recoveryStartTime = Date.now();
    const recoveryIncrement = (originalSpeed - (originalSpeed * 0.5)) / (speedRecoveryDuration / 100); // Speed recovery increment

    function recover() {
        let elapsed = Date.now() - recoveryStartTime;
        if (elapsed < speedRecoveryDuration) {
            speed += recoveryIncrement;
            requestAnimationFrame(recover);
        } else {
            speed = originalSpeed; // Ensure final speed is max
        }
    }
    recover();
}

function animate() {
    requestAnimationFrame(animate);
    update();
}

// Loading Screen Functions
function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
}
