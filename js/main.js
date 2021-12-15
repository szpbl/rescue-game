function start() {

    $("#start").hide();

    $("#gameBackground").append("<div id='player' class='animate1'></div>");
    $("#gameBackground").append("<div id='enemy1' class='animate2'></div>");
    $("#gameBackground").append("<div id='enemy2'></div>");
    $("#gameBackground").append("<div id='friend' class='animate3'></div>");
    $("#gameBackground").append("<div id='score'></div>");
    $("#gameBackground").append("<div id='energy'></div>");

    let canShoot = true;
    let gameOver = false;
    let points = 0;
    let saved = 0;
    let lost = 0; 
    let currentEnergy = 3;
    const game = {};
    let speed = 5;
    let yPosition = parseInt(Math.random() * 330)
    const KEY = {
        W: 87,
        S: 83,
        D: 68
    }

    let shotSound=document.getElementById("shotSound");
    let explosionSound=document.getElementById("explosionSound");
    let music=document.getElementById("music");
    let gameOverSound=document.getElementById("gameOverSound");
    let lostSound=document.getElementById("lostSound");
    let rescuedSound=document.getElementById("rescuedSound");

    music.addEventListener("ended", function() { music.currentTime = 0; music.play(); }, false);
    music.play();

    game.pressed = [];

    $(document).keydown(function(e){
        game.pressed[e.which] = true;
    });

    $(document).keyup(function(e) {
        game.pressed[e.which] = false;
    });

    game.timer = setInterval(loop, 30);

    function loop() {

        moveBackground();
        movePlayer();
        moveEnemy1();
        moveEnemy2();
        moveFriend();
        collide();
        scoreBoard();
        energy();

    }

    function moveBackground() {
        let left = parseInt($("#gameBackground").css("background-position"));
        $("#gameBackground").css("background-position",left-3);
    }

    function movePlayer() {
        let top = parseInt($("#player").css("top"));

        if (game.pressed[KEY.W] && top > 10) {
            
            $("#player").css("top", top - 10);
        }

        if (game.pressed[KEY.S] && top < 420) {
    
            $("#player").css("top", top + 10);
        }

        if (game.pressed[KEY.D]){
            shoot();
        }
    }

    function moveEnemy1() {
        let xPosition = parseInt($("#enemy1").css("left"));
        $("#enemy1").css("left", xPosition - speed);
        $("#enemy1").css("top", yPosition);

        if (xPosition <= 0) {
            resetEnemy1();
        }
    }

    function moveEnemy2() {
        let xPosition = parseInt($("#enemy2").css("left"));
        $("#enemy2").css("left", xPosition - (speed - 2));

        if (xPosition <= 0) {
            $("#enemy2").css("left", 775);
        }
    }

    function moveFriend() {
        let xPosition = parseInt($("#friend").css("left"));
        $("#friend").css("left", xPosition + (speed - 4));

        if (xPosition > 906) {
            $("#friend").css("left", 0);
        }
    }

    function endGame(){
        gameOver = true;
        music.pause();
        gameOverSound.play();

        window.clearInterval(game.timer);
        game.time = null;

        $("#player").remove();
        $("#enemy1").remove();
        $("#enemy2").remove();
        $("#friend").remove();

        $("#gameBackground").append("<div id='end'></div>");

        $("#end").html("<h1> Game Over </h1> Your score was: " + points + "</p>" + "<div id='restart' onClick=restartGame()><h3>Play again</h3></div>")

    }

    function shoot(){

        shotSound.play();

        if (canShoot == true) {

            canShoot = false;

            let top = parseInt($("#player").css("top"));
            let xPosition = parseInt($("#player").css("left"));
            let xShot = xPosition + 190;
            let shotTop = top + 37;
            $("#gameBackground").append("<div id='shot'></div>");
            $("#shot").css("top", shotTop);
            $("#shot").css("left", xShot); 

            let shotTime = window.setInterval(executeShot, 30);
       
            function executeShot() {
                let xPosition = parseInt($("#shot").css("left"));
                $("#shot").css("left", xPosition + 15);
                
                if (xPosition > 900) {
                    window.clearInterval(shotTime);
                    shotTime = null;
                    $("#shot").remove();
                    canShoot = true;
                }
            }
        }
    }

    function collide() {
        let collision1 = ($("#player").collision($("#enemy1")));
        let collision2 = ($("#player").collision($("#enemy2")));
        let collision3 = ($("#shot").collision($("#enemy1")));
        let collision4 = ($("#shot").collision($("#enemy2")));
        let collision5 = ($("#player").collision($("#friend")));
        let collision6 = ($("#enemy2").collision($("#friend")));

        if (collision1.length > 0) {
            
            currentEnergy--;

            let enemy1X = parseInt($("#enemy1").css("left"));
            let enemy1Y = parseInt($("#enemy1").css("top"));
            explosion1(enemy1X, enemy1Y);

            resetEnemy1();
        }

        if (collision2.length > 0) {

            currentEnergy--;

            let enemy2X = parseInt($("#enemy2").css("left"));
            let enemy2Y = parseInt($("#enemy2").css("top"));
            explosion2(enemy2X, enemy2Y);

            $("#enemy2").remove();

            repositionEnemy2();
        }

        if (collision3.length > 0) {

            points += 100;

            speed += 0.3;

            let enemy1X = parseInt($("#enemy1").css("left"));
            let enemy1Y = parseInt($("#enemy1").css("top"));

            explosion1(enemy1X, enemy1Y);
            $("#shot").css("left", 950);

            resetEnemy1();
        }

        if (collision4.length > 0) {

            points += 50;
            
            let enemy2X = parseInt($("#enemy2").css("left"));
            let enemy2Y = parseInt($("#enemy2").css("top"));
            $("#enemy2").remove();

            explosion2(enemy2X, enemy2Y);
            $("#shot").css("left", 950);

            repositionEnemy2();
        }

        if (collision5.length > 0) {


            rescuedSound.play();

            saved++;

            repositionFriend();
            $("#friend").remove();
        }

        if (collision6.length > 0) {

            lost++;

            let xFriend = parseInt($("#friend").css("left"));
            let yFriend = parseInt($("#friend").css("top"));
            explosion3(xFriend, yFriend);
            $("#friend").remove();

            repositionFriend();
        }

        function explosion1(enemy1X, enemy1Y) {
            explosionSound.play();
            $("#gameBackground").append("<div id='explosion1'></div>");
            $("#explosion1").css("background-image", "url(../imgs/explosion.png)");
            let div = $("#explosion1");
            div.css("top", enemy1Y);
            div.css("left", enemy1X);
            div.animate({width:200, opacity:0}, "slow");

            let explosionTime = window.setInterval(removeExplosion, 1000);

            function removeExplosion() {
                div.remove();
                window.clearInterval(explosionTime);
                explosionTime = null;
            }
        }

        
        function explosion2(enemy2X, enemy2Y) {
            explosionSound.play();
            $("#gameBackground").append("<div id='explosion2'></div>");
            $("#explosion2").css("background-image", "url(../imgs/explosion.png)");
            let div2 = $("#explosion2");
            div2.css("top", enemy2Y);
            div2.css("left", enemy2X);
            div2.animate({width:200, opacity:0}, "slow");

            let explosion2Time = window.setInterval(removeExplosion2, 500);

            function removeExplosion2() {
                div2.remove();
                window.clearInterval(explosion2Time);
                explosion2Time = null;
            }
        }

        function explosion3(friendX, friendY) {
            
            lostSound.play();

            $("#gameBackground").append("<div id='explosion3' class='animate4'></div>");
            $("#explosion3").css("top", friendY);
            $("#explosion3").css("left", friendX);

            let explosion3Time = window.setInterval(removeExplosion3, 500);
            

            function removeExplosion3() {
                $("#explosion3").remove();
                window.clearInterval(explosion3Time);
                explosionTime2 = null;
            }
        }


        function repositionEnemy2() {
            let collisionTime4 = window.setInterval(reposition4, 5000);

            function reposition4() {
                window.clearInterval(collisionTime4);
                collisionTime4 = null;

                if (gameOver == false) {
                    $("#gameBackground").append("<div id='enemy2'></div>")
                }
            }
        }

        function repositionFriend() {
            let friendTime = window.setInterval(reposition6, 6000);

            function reposition6() {
                window.clearInterval(friendTime);
                friendTime = null;

                if (gameOver == false) {
                    $("#gameBackground").append("<div id='friend' class='animate3'></div>")
                }
            }
        }




    }
            
    function scoreBoard() {
        $("#score").html("<h2> Points: " + points + " Saved: " + saved + " Lost: " + lost + "</h2>");
    }

    function energy() {


        
        switch (currentEnergy) {
            case 3:
                $("#energy").css("background-image", "url(imgs/energy3.png)");
                break;
            case 2:
                $("#energy").css("background-image", "url(../imgs/energy2.png)");
                break;
            case 1:
                $("#energy").css("background-image", "url(../imgs/energy1.png)");
                break;
            case 0:
                $("#energy").css("background-image", "url(../imgs/energy0.png)");
                
                endGame();
                break;

        }

        
    }

    function resetEnemy1(){
        yPosition = parseInt(Math.random() * 334);
        $("#enemy1").css("left", 694);
        $("#enemy1").css("top", yPosition);
    }



}

function restartGame() {
    gameOverSound.pause();
    $("#end").remove();
    start();
}