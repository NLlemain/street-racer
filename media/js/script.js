let backgroundAudio = null;
function isTransparent(pixelData) {
    return pixelData[3] === 0;
}

function checkTransparency(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (isTransparent(data.subarray(i, i + 4))) {
            console.log(`Pixel at index ${i / 4} is transparent.`);
        }
    }
}
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
        obs1.src = 'media/img/obs1.png';
        obs2.src = 'media/img/obs2.png';
        obs3.src = 'media/img/obs3.png';
        obs4.src = 'media/img/obs.png';
        bg.src = 'media/img/road2.png';
        
        // Function to select car color
        function selectCarColor() {
            const color = prompt("Choose your car color: red, blue, orange, yellow, or pink.");
            switch (color.toLowerCase()) {
                case 'red':
                    mycar.src = 'media/img/mycar_red.png';
                    break;
                case 'blue':
                    mycar.src = 'media/img/mycar_blue.png';
                    break;
                case 'orange':
                    mycar.src = 'media/img/mycar_orange.png';
                    break;
                case 'yellow':
                    mycar.src = 'media/img/mycar_yellow.png';
                    break;
                case 'pink':
                    mycar.src = 'media/img/mycar_pink.png';
                    break;
                default:
                    alert("Invalid color selected, defaulting to red.");
                    mycar.src = 'media/img/mycar_red.png';
            }
        }

        var loadedImages = 0;
        var playerScore = 0.0;
        var carsPassed = 0;

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
        var crashes = 0;
        var cooldown = false;
        var hearts = 3;
        var lastHeartScore = 0;

        var maxSpeed = 10;
        var maxSpeed_2 = 20;

        for (var i = 0; i < carCount; i++) {
            obstacles.push(new Obstacles(i));
        }

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

        function newHP() {
            var heartsHtml = "❤️".repeat(hearts);
            document.getElementById('hearts').innerHTML = heartsHtml;
        }

        function startGame() {
            console.log('Game startedd');
            backgroundAudio = new Audio('media/sounds/background.mp3');
            backgroundAudio.play();
            selectCarColor();
            document.getElementById('start').style.display = 'none';
            document.getElementById('game').style.display = 'flex';
            newHP();
            animate();
        }

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
                        backgroundAudio.pause();
                        alert("Je bent af!\nStatistieken:\n========\nScore: " + parseInt(playerScore) +
                            "\nAuto's gepasseerd: " + carsPassed);
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            update();
        }
