window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;
  context.imageSmoothingEnabled = false;

  const RUNNING = 0,
      PAUSED = 1,
      GAMEOVER = 2;

  var currentGameState = RUNNING;
  var startTime = new Date();

  var camera = {
    x: 0, y: 0,
    width: width, height: height,
    zoomFactor: 1,
  };
  var gameWorld = {
    x: 0, y: 0,
    width: 5000, height: 5000
  };

  var Wind = {
    x: 0,
    y: 0,
    targetx: 0,
    targety: 0,
    rangeValue: 50,
    tLerpValue: 0,
    tTime: 0,
    timeRange: 5,
    stormRange: 0.05,

    update: function(deltaTime){
      this.tLerpValue += (1/this.tTime) * deltaTime; //1 is the distance of lerp
      if(this.tLerpValue <= 1){
        this.x = utils.lerp(this.tLerpValue, this.x, this.targetx);
        this.y = utils.lerp(this.tLerpValue, this.y, this.targety);
      } else {
        if(Math.random() * 1 < this.stormRange){
          this.targetx = utils.randomRange(-this.rangeValue * 3, this.rangeValue * 3);
          this.targety = utils.randomRange(-this.rangeValue * 3, this.rangeValue * 3);
          this.tLerpValue = 0;
          this.tTime = utils.randomRange(0, this.timeRange/3);
        } else {
          this.targetx = utils.randomRange(-this.rangeValue, this.rangeValue);
          this.targety = utils.randomRange(-this.rangeValue, this.rangeValue);
          this.tLerpValue = 0;
          this.tTime = utils.randomRange(2, this.timeRange);
        }
      }
    }

  };



  var allAssets = [];
  var loadedAssets = [];

  var birdSprite = document.createElement("img");
  allAssets.push(birdSprite);
  birdSprite.addEventListener("load", loadHandler, false);
  birdSprite.src = "assets/bird.png";

  var birdLeftFrames = [];
  for(var i = 0; i < 1; i++){
    birdLeftFrames.push({texture: birdSprite, x: 2 * 32, y: 0, width: 32, height: 32});
  }
  var birdLeftAnim = Animation.create(0.5, birdLeftFrames, true);

  var birdRightFrames = [];
  for(var i = 0; i < 1; i++){
    birdRightFrames.push({texture: birdSprite, x: 3 * 32, y: 0, width: 32, height: 32});
  }
  var birdRightAnim = Animation.create(0.5, birdRightFrames, true);

  var birdAdvanceFrames = [];
  for(var i = 0; i < 1; i++){
    birdAdvanceFrames.push({texture: birdSprite, x: 0 * 32, y: 0, width: 32, height: 32});
  }
  var birdAdvanceAnim = Animation.create(0.5, birdAdvanceFrames, true);
  // console.log(birdAdvanceAnim.getFrame(0));



  //TODO:: I am creating this states focusing on animation process but i actually need to do states for AI but i think it can do both :D(fjdaso)
  //I am not expert. I am doing what works for me best.
  const BIRD_ADVANCE = 0,
        BIRD_LEFT = 1,
        BIRD_RIGHT = 2,
        BIRD_SHOOT = 3,
        BIRD_IDLE = 4;

  var Bird = {
    x: 0, y: 0,
    width: 64, height: 64,
    angle: 0,
    vx: 0, vy: 0,
    ax: 0, ay: 0,
    friction: 0.98,
    thrust: 350,
    turnSpeed: Math.PI,

    health: 100,
    damagePower: 10,
    bulletRange: 300,
    bulletSpeed: 300,

    currentState: BIRD_IDLE,
    internalStateTime: 0,


    update: function(deltaTime){
      this.vx += this.ax * deltaTime;
      this.vy += this.ay * deltaTime;
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.x  += this.vx * deltaTime;
      this.y  += this.vy * deltaTime;
      this.internalStateTime += deltaTime;

      if(this.currentState == BIRD_SHOOT && this.internalStateTime >= 1){
        this.idle();
      }
      this.ax = 0; this.ay = 0;
    },

    shoot: function(bullet){
      var scalarSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      bullet.x = bullet.startx = this.x + this.width/2;
      bullet.y = bullet.starty = this.y + this.height/2;
      bullet.friction = 0.9;
      bullet.setSpeedDirection(this.bulletSpeed + scalarSpeed, this.angle);
      bullet.range = this.bulletRange;
      bullet.from = this;
      if(this.currentState != BIRD_SHOOT){
        this.currentState = BIRD_SHOOT;
        this.internalStateTime = 0;
      }
      return bullet;
    },

    advance: function(){
      this.ax += Math.cos(this.angle) * this.thrust;
      this.ay += Math.sin(this.angle) * this.thrust;
      //Reminder:: If it hasn't been already in BIRD_ADVANCE state and is currently in BIRD_IDLE state
      //I will be on advance or else think about another situation where first bird is in BIRD_LEFT state
      //and we call advance(), we will get all the movement things but we will not change to BIRD_ADVANCE
      //state and Animation BIRD_LEFT will be on::  Well I am hoping what I explained helds true
      //but it didn't go that way
      if(this.currentState != BIRD_ADVANCE ){
        this.currentState = BIRD_ADVANCE;
        this.internalStateTime = 0;
      }
    },

    applyForce: function(ax, ay){
      ax /= 20;
      ay /= 20;
      this.ax += ax;
      this.ay += ay;
    },

    idle: function(){
      if(this.currentState != BIRD_IDLE){
        this.ax = 0; this.ay = 0;
        this.currentState = BIRD_IDLE;
        this.internalStateTime = 0;
      }
    },

    turnLeft: function(deltaTime){
      this.angle -= this.turnSpeed * deltaTime;
      if(this.currentState != BIRD_LEFT){
        this.currentState = BIRD_LEFT;
        this.internalStateTime = 0;
      }
    },

    turnRight: function(deltaTime){
      this.angle += this.turnSpeed * deltaTime;
      if(this.currentState != BIRD_RIGHT){
        this.currentState = BIRD_RIGHT;
        this.internalStateTime = 0;
      }
    },

    isAlive: function(){
      return (this.health <= 0);
    }

  };

  var myBird = Object.create(Bird);

  //AI Enemy Initialization
  var allEnemies = [];
  var allWaves = [];
  var wave = {
    totalWaveEnemies: 20,
    activeEnemies: 10,
    thrust: 200,
    turnSpeed: Math.PI/2,
    damagePower: 10,
    bulletSpeed: 200,
    spawnPosition: {x: gameWorld.width/2 + 200, y:gameWorld.height/2 + 200}
  };
  allWaves.push(wave);
  var currentWaveIndex = 0;
  var currentWave = allWaves[currentWaveIndex];

  for(var i = 0; i < currentWave.activeEnemies; i++){
    var enemyBird = Object.create(Bird);
    enemyBird.x = currentWave.spawnPosition.x;
    enemyBird.y = currentWave.spawnPosition.y;
    enemyBird.thrust = currentWave.thrust;
    enemyBird.turnSpeed = currentWave.turnSpeed;
    enemyBird.damagePower = currentWave.damagePower;
    enemyBird.bulletSpeed = currentWave.bulletSpeed;
    enemyBird.stateChangeTime = utils.randomRange(2, 6);
    allEnemies.push(enemyBird);
  }




  var allBullets = [];
  var allParticleEffects = [];
  var allTreeAnim = [];

  for(var i = 0; i < 8; i++){
    var treeAnimFrames = [];
    for(var j = 0; j < 4; j++){
      var img = document.createElement("img");
      img.addEventListener("load", loadHandler);
      img.src = "assets/trees-blackland/tree" + (i+1) +"/tree" + (i+1) + "_0" + j+".png";
      allAssets.push(img);
      treeAnimFrames.push(img);
    }
    var animation = Animation.create(0.5, treeAnimFrames, true);
    allTreeAnim.push(animation);
  }


  var allTrees = [];
  var numTrees = 1000;
  for(var i = 0; i < numTrees; i++){
    //Reminder:: here x, y, width, height is bounding box,
    //and drawX ... are render coordinates..
    var type = utils.randomInt(0, allTreeAnim.length - 1);
    var drawWidth = utils.randomInt(200, 250);
    var drawHeight = utils.randomInt(200, 250);
    var drawX = utils.randomRange(0, gameWorld.width);
    var drawY = utils.randomRange(0, gameWorld.height);
    allTrees.push({
      x: drawX + drawWidth * 0.1,
      y: drawY + drawHeight * 0.1,
      drawX: drawX,
      drawY: drawY,
      type: type,
      internalStateTime: utils.randomRange(0, 1),
      width: drawWidth * 0.5,
      height: drawHeight * 0.5,
      drawWidth: drawWidth,
      drawHeight: drawHeight
    });
  }

  function loadHandler(){
    loadedAssets++;
    if(loadedAssets == allAssets.length){
      update();
    }
  }

  //INPUT
  var pressing_left = false,
      pressing_right = false,
      pressing_up = false,
      pressing_down = false,
      pressing_fire = false,
      is_fired = false,
      pressing_special = false;

  document.addEventListener("keydown", function(event){
    switch(event.keyCode){
    case 37: //left
    case 65: // a
      pressing_left = true;
      break;
    case 38: //up
    case 87: // w
      pressing_up = true;
      break;
    case 39: //right
    case 68: // d
      pressing_right = true;
      break;
    case 40: //down
    case 83: // s
      pressing_down = true;
      break;
      case 32:
      pressing_fire = true;
      break;
    }
  }, false);

  document.addEventListener("keyup", function(event){
    switch(event.keyCode){
    case 37:
    case 65:
      pressing_left = false;
      break;
    case 38:
    case 87:
      pressing_up = false;
      break;
    case 39:
    case 68:
      pressing_right = false;
      break;
    case 40:
    case 83:      
      pressing_down = false;
      break;
      case 32:
      pressing_fire = false;
      is_fired = false;
      break;
    }
  }, false);

  //DEBUG
  var debugTextY = 10;

  init();


  function init(){
    camera.x = (gameWorld.x + gameWorld.width/2) - camera.width/2;
    camera.y = (gameWorld.y + gameWorld.height/2) - camera.height/2;
    myBird.x = (gameWorld.x + gameWorld.width/2) - myBird.width/2;
    myBird.y = (gameWorld.y + gameWorld.height/2) - myBird.height/2;

    ParticlePool.init();

    for(var i = 0; i < numTrees; i++){
      for(var j = 0; j < numTrees; j++){
        if(allTrees[i] > allTrees[i+1]){
          var tempTree = allTrees[i];
          allTrees[i] = allTrees[i+1];
          allTrees[i+1] = tempTree;
        }
      }
    }

  }



  function update(){
    var deltaTime = (new Date() - startTime)/1000;
    startTime = new Date();

    if(deltaTime > 0.1){
      deltaTime = 0.1;
    }


    updateGame(deltaTime);
    renderGame(deltaTime);

    requestAnimationFrame(update);
  }

  function updateGame(deltaTime){
    //handleinputs
    handleinputs(deltaTime);
    Wind.update(deltaTime);
    updateMyBird(deltaTime);
    updateCamera(deltaTime);
    updateAllEnemyBirds(deltaTime);
    updateBullets(deltaTime);
    updateTrees(deltaTime);
    updateAllParticleEffects(deltaTime);

  }

  function handleinputs(deltaTime){
    if(pressing_up && !pressing_down){
      myBird.advance();
    } else {
      myBird.idle();
    }
    if(pressing_down && !pressing_up){
      //What should down arrow do ??? Nothing?
    }
    if(pressing_left && !pressing_right){
      myBird.turnLeft(deltaTime);
    }
    if(pressing_right && !pressing_left){
      myBird.turnRight(deltaTime);
    }
    if(pressing_fire && !is_fired){
      is_fired = true;
      // TODO: Instead of instantiating, make ObjectPool to reuse objects;
      var bullet = ParticlePool.newParticle();
      allBullets.push(myBird.shoot(bullet));
    }

  }

  function updateCamera(){
    //handling camera
    var length = Math.sqrt(myBird.vx * myBird.vx + myBird.vy * myBird.vy);
    if(length > 400) length = 400
    camera.zoomx = camera.zoomy = length/700;


    camera.width = Math.floor(width / (1 - camera.zoomx));
    camera.height = Math.floor(height / (1 - camera.zoomy));
    camera.x = Math.max(0, Math.min(gameWorld.width - camera.width, myBird.x  + (myBird.width/2) - (camera.width /2 )));
    camera.y = Math.max(0, Math.min(gameWorld.height - camera.height, myBird.y + (myBird.height/2) - (camera.height/2 )));

    // TODO: Add more cool camera techniques :(
    // if(myBird.x < camera.x + camera.width * 0.25){
    //   camera.x = Math.max(0, Math.min(myBird.x - camera.width * 0.25, gameWorld.width - camera.width));
    // }
    // if(myBird.x > camera.x + camera.width * 0.75){
    //   camera.x = Math.max(0, Math.min(gameWorld.width - camera.width, myBird.x - camera.width * 0.75));
    // }
    // if(myBird.y < camera.y + camera.height * 0.25){
    //   camera.y = Math.max(0, Math.min(gameWorld.height - camera.height, myBird.y - camera.height * 0.25));
    // }
    // if(myBird.y > camera.y + camera.height * 0.75){
    //   camera.y = Math.max(0, Math.min(gameWorld.height - camera.height, myBird.y - camera.height * 0.75));
    // }
  }

  function updateMyBird(deltaTime){
    myBird.applyForce(Wind.x, Wind.y);
    myBird.update(deltaTime);
    myBird.x = Math.max(myBird.width/2, Math.min(gameWorld.width - myBird.width, myBird.x));
    myBird.y = Math.max(myBird.height/2, Math.min(gameWorld.height - myBird.height, myBird.y));
  }

  function updateAllEnemyBirds(deltaTime){
    // for(var i = allEnemies.length - 1; i >= 0; i--){
    //   var enemyBird = allEnemies[i];
    //   enemyBird.update(deltaTime);
    // }
  }

  function updateBullets(deltaTime){
    for(var i = allBullets.length - 1; i >= 0; i--){
      var bullet = allBullets[i];
      bullet.update(deltaTime);
      if(bullet.x < camera.x || bullet.x > camera.x + camera.width ||
         bullet.y < camera.y || bullet.y > camera.y + camera.height ){
           ParticlePool.recycleParticle(allBullets.splice(i, 1)[0]);
      }
      var dx = bullet.x - bullet.startx,
          dy = bullet.y - bullet.starty;
      if((dx * dx + dy * dy) >= bullet.range * bullet.range){
        ParticlePool.recycleParticle(allBullets.splice(i, 1)[0]);
      }
    }
  }


  function updateTrees(deltaTime){
    for(var i = allTrees.length - 1; i >= 0; i--){
      var tree = allTrees[i];
      tree.internalStateTime += deltaTime;
      // utils.blockRectangles(myBird, tree);
      for(var j = allBullets.length - 1; j >= 0; j--){
        var bullet = allBullets[j];
        if(utils.rectCircleIntersect(tree, bullet)){
          var explosion = particleEffect.create(tree.x, tree.y, 200, 6, true, false, 1, 2,
            0, bullet.getSpeed()/15, bullet.getHeading() - Math.PI/4, bullet.getHeading() + Math.PI/4, 0, 1,
            tree.width, tree.height);
          explosion.applyForce(Math.cos(bullet.getHeading()) * 100, Math.sin(bullet.getHeading()) * 100);
          allParticleEffects.push(explosion);
          ParticlePool.recycleParticle(allBullets.splice(j, 1)[0]);
          break;
        }
      }
    }
  }

  function updateAllParticleEffects(deltaTime){
    for(var i = allParticleEffects.length - 1; i >= 0; i--){
      var currentEffect = allParticleEffects[i];
      currentEffect.applyForce(Wind.x, Wind.y);
      if(currentEffect.isFinished()){
        allParticleEffects.splice(i, 1);
        continue;
      }
      currentEffect.update(deltaTime);
    }
  }


  function renderGame(deltaTime){
    context.clearRect(0, 0, width, height);

    context.save();
    context.scale( 1 - camera.zoomx, 1 - camera.zoomy);
    context.translate(-camera.x, -camera.y);
    // context.scale((1 - camera.zoomFactor), (1 - camera.zoomFactor));
    context.clearRect(camera.x, camera.y, camera.width, camera.height);
    renderBackground();
    renderTrees();
    renderBullets();
    renderMyBird();
    renderAllEnemyBirds();
    renderAllParticleEffects();
    // renderDebug();
    context.restore();
  }

  function renderBackground(){
    context.fillStyle = "green";
    context.fillRect(0, 0, gameWorld.width, gameWorld.height);
  }

  function renderTrees(){
    for(var i = 0; i < allTrees.length; i++){
      var tree = allTrees[i];
      var img = allTreeAnim[tree.type].getFrame(tree.internalStateTime);
      context.drawImage(img, tree.drawX, tree.drawY, tree.drawWidth, tree.drawHeight);
      // context.strokeStyle = "black";
      // context.beginPath();
      // context.rect(tree.x, tree.y, tree.width, tree.height);
      // context.stroke();
      // context.strokeStyle = "red";
      // context.beginPath();
      // context.rect(tree.drawX, tree.drawY, tree.drawWidth, tree.drawHeight);
      // context.stroke();
    }
  }

  function renderBullets(){
    context.fillStyle = "yellow";
    for(var i = 0; i < allBullets.length; i++){
      context.beginPath();
      context.arc(allBullets[i].x, allBullets[i].y, 10, 0, Math.PI * 2, false);
      context.fill();
    }
  }

  function renderMyBird(){
    context.fillStyle = "blue";
    context.save();
    context.translate(myBird.x + myBird.width/2, myBird.y + myBird.height/2);
    context.rotate(myBird.angle);
    var frame = undefined;
    switch(myBird.currentState){
      case BIRD_LEFT:
      frame = birdLeftAnim.getFrame(myBird.internalStateTime);
      break;
      case BIRD_RIGHT:
      frame = birdRightAnim.getFrame(myBird.internalStateTime);
      break;
      case BIRD_ADVANCE:
      frame = birdAdvanceAnim.getFrame(myBird.internalStateTime);
      break;
      default:
      frame = birdAdvanceAnim.getFrame(myBird.internalStateTime);
      break;
    }
    context.drawImage(frame.texture, frame.x, frame.y, frame.width, frame.height, -myBird.width/2, -myBird.height/2, myBird.width, myBird.height);
    // context.fillRect(-myBird.width/2, -myBird.height/2, myBird.width, myBird.height);
    context.restore();
  }

  function renderAllEnemyBirds(){
    context.fillStyle = "red";
    for(var i = allEnemies.length - 1; i >= 0; i--){
      var enemyBird = allEnemies[i];
      context.save();
      context.translate(enemyBird.x + enemyBird.width/2, enemyBird.y + enemyBird.height/2);
      context.rotate(enemyBird.angle);
      context.fillRect(-enemyBird.width/2, -enemyBird.height/2, enemyBird.width, enemyBird.height);
      context.restore();
    }
  }

  function renderAllParticleEffects(){
    for(var i = 0; i < allParticleEffects.length; i++){
      var particleSet = allParticleEffects[i].allParticles;
      for(var j = 0; j < particleSet.length; j++){
        var p = particleSet[j];
        context.fillStyle = "rgba(255, 255, 0, " + Math.round((1 - p.internalTime / allParticleEffects[i].duration) * 100)/100 + ")";
        context.beginPath();
        context.rect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        context.fill();
      }
    }
  }

  function renderDebug(){
    // context.fillText(JSON.stringify(myBird), camera.x + camera.width/2, camera.y + 20);
    drawDebugObject(myBird.currentState);
    drawDebugObject(myBird.internalStateTime);
    context.lineWidth = 4;
    context.globalAlpha = 0.6;
    context.strokeStyle = "black";
    context.beginPath();
    context.rect(camera.x  , camera.y, camera.width , camera.height);
    context.stroke();
    context.beginPath();
    context.arc(camera.x + camera.width   /2, camera.y + camera.height /2, 200, 0, Math.PI * 2, false);
    context.stroke();
    context.globalAlpha = 1;
    debugTextY = 20;
  }

  function drawDebugObject(object){
    context.fillStyle = "black";
    context.textAlign = "center";
    context.font = "" + 20 + "px Times New Roman";
    var text = JSON.stringify(object);
    context.fillText(JSON.stringify(object), camera.x + camera.width/2, camera.y + debugTextY);
    debugTextY += 20;
  }

};
