// Haal de canvas element op
var canvas = document.getElementById("canvas");

// Stel de juiste hoogte en breedte van de canvas in
canvas.width = innerWidth / 2;
canvas.height = innerHeight;

// Geef aan dat de canvas 2d is
var c = canvas.getContext('2d');

// Voeg eventlisteners toe voor de movement (pijltjes)
var keys = [];
addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
});
addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

// Geef alle afbeeldingen aan die uiteindelijk geladen worden
// Per image maak je een nieuwe var aan en src 
// .src = de uiteindelijke afbeelding die verschijnt.
var mycar = new Image();
var obs1 = new Image();
var obs2 = new Image();
var obs3 = new Image();
var obs4 = new Image();
var bg = new Image();
obs1.src = 'media/img/obs1.png';
obs2.src = 'media/img/obs2.png';
obs3.src = 'media/img/obs3.png';
obs4.src = 'media/img/obs.png';
bg.src = 'media/img/road2.png';
mycar.src = 'media/img/mycar.png';

// Geef aan hoeveel images geladen zijn 
// Geef aan de default van de playerscore is zodat dit later aangegeven kan worden via code
// Geef aan dat de carsPassed default 0 is
var loadedImages = 0;
var playerScore = 0.0;
var carsPassed = 0;

// Laad alle afbeeldingen
// Wanneer een afbeelding is geladen wordt de loadedImages var verhoogd
function imageLoaded() {
    loadedImages++;
}

mycar.onload = imageLoaded;
bg.onload = imageLoaded;
obs1.onload = imageLoaded;
obs2.onload = imageLoaded;
obs3.onload = imageLoaded;
obs4.onload = imageLoaded;

// Geef aan dat er 4 auto's als obstakels zijn
var carCount = 4;
// Geef aan dat de snelheid van de obstakels 2 is
var obsSpeed = 2;
// Maak een array aan voor de obstakels
var obstacles = [];

// Geef een default aan voor de crashes zodat dit later via code veranderd kan worden
var crashes = 0;
var cooldown = false;
var hearts = 3;
var lastHeartScore = 0;

var maxSpeed = 10;
var maxSpeed_2 = 20;


for (var i = 0; i < carCount; i++) {
    obstacles.push(new Obstacles(i));
}

// Maak een functie aan voor de obstakels op de weg
// Order 

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
            while (true) {
                this.x = (Math.random() * (canvas.width - 100)) + 50;
                this.y = -400 * Math.random() - 300;
                var overlapping = false;
                for (var i = 0; i < carCount; i++) {
                    if (i != this.order) {
                        if ((Math.abs(obstacles[i].x - this.x) < 100) &&
                            (Math.abs(obstacles[i].y - this.y) < 200)) {
                            overlapping = true;
                            break;
                        }
                    }
                }
                if (!overlapping) {
                    break;
                }
            }
        }
        c.drawImage(this.image, this.x, this.y, 100, 200);
    }
}

var bgy1 = 0;
var bgy2 = -canvas.height;
var dbgy = 3;
var myCarX = canvas.width / 2 - 50;

// Indien de HP is geupdate wordt dit hier dus geupdate in de HTML als het gecalled wordt
// In eerdere code wordt aangegeven hoeveel hearts die moet mee sturen
function newHP() {
    var heartsHtml = "❤️".repeat(hearts);
    document.getElementById('hearts').innerHTML = heartsHtml;
}

function startGame() {
    document.getElementById('start').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    // Start de game, als dit wordt gecalled begint de weg te komen en je hp wordt dan ingeladen
    newHP();
    animate();

}

// Maak een functie aan voor de update
function update() {
    if (loadedImages == 6) {
        bgy1 += dbgy;
        bgy2 += dbgy;
        if (keys[37] && myCarX > 0) {
            myCarX -= 4 * (dbgy / 3);
        }
        if (keys[39] && myCarX < canvas.width - 100) {
            myCarX += 4 * (dbgy / 3);
        }
        c.clearRect(0, 0, canvas.width, canvas.height);
        playerScore += 0.1 * (dbgy / 3);
        if (Math.floor(playerScore) % 200 === 0 && Math.floor(playerScore) != lastHeartScore && hearts < 3) {
            hearts++;
            lastHeartScore = Math.floor(playerScore);
            newHP();
        }
        if (playerScore > 50 && dbgy < maxSpeed) {
            dbgy += 0.05;
            obsSpeed += 0.05;
        }
        if (playerScore > 350 && dbgy < maxSpeed_2) {
            dbgy += 0.05;
            obsSpeed += 0.05;
        }
        document.getElementById('score').innerHTML = "Score: " + parseInt(playerScore);
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
        var overlapping = false;
        for (var i = 0; i < carCount; i++) {
            if ((Math.abs(obstacles[i].x - myCarX) < 95) &&
                (obstacles[i].y >= canvas.height - 400)) {
                overlapping = true;
                break;
            }
        }
        if (overlapping) {
            if (!cooldown && hearts > 0) {
                var audio = new Audio(obstacles[i].image === obs2 ? 'media/sounds/drift.mp3' : 'media/sounds/crash.mp3');
                audio.play();
                hearts--;
                cooldown = true;
                newHP();
                setTimeout(() => {
                    cooldown = false;
                }, 1500);
            }
            if (hearts <= 0) {
                loadedImages = -1;
                cancelAnimationFrame(animate);
                alert("Je bent af!\nStatistieken:\n========\nScore: " + parseInt(playerScore) +
                    "\nAuto's gepasseerd: " + carsPassed);
            }
        }
    }
}

// Indien je dit called wordt de game telkens geupdate, de road en de auto's worden geladen en zullen zich herhalen
function animate() {
    requestAnimationFrame(animate);
    update();
}
