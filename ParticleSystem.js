var particleEffect = {
  x: 0, y: 0,
  allParticles: [],
  maxParticles: 100,
  duration: 4,
  preFilled: false,
  isLoop: false,

  minSize: 1,
  maxSize: 6,
  minSpeed: 50,
  maxSpeed: 100,
  minAngle: 0,
  maxAngle: Math.PI * 2,

  gravity: 0,
  friction: 1,

  // TODO: BIRTH RATE CAN BE ADDED TOO :D)DF)JD
  // Reminder:: preRandomized
  // create object and set its default or passed value & return
  create: function(x, y, maxParticles, duration, preFilled, isLoop, minSize, maxSize, minSpeed, maxSpeed, minAngle, maxAngle, gravity, friction, width, height){
    var pObject = Object.create(this);
    pObject.x = x;
    pObject.y = y;
    pObject.allParticles = [];
    pObject.maxParticles = maxParticles != undefined ? maxParticles : this.maxParticles;
    pObject.duration = duration != undefined ? duration : this.duration;
    pObject.preFilled = preFilled != undefined ? preFilled : this.preFilled;
    pObject.isLoop = isLoop != undefined ? isLoop : this.isLoop;

    pObject.minSize = minSize || this.minSize;
    pObject.maxSize = maxSize || this.maxSize;
    pObject.minSpeed = minSpeed != undefined ? minSpeed : this.minSpeed;
    pObject.maxSpeed = maxSpeed != undefined ? maxSpeed : this.maxSpeed;
    pObject.minAngle = minAngle != undefined ? minAngle : this.minAngle;
    pObject.maxAngle = maxAngle != undefined ? maxAngle : this.maxAngle;

    pObject.gravity = gravity != undefined ? gravity : this.gravity;
    pObject.friction = friction != undefined ? friction : this.friction;

    pObject.width = width || 0;
    pObject.height = height || 0;

    if(pObject.preFilled){
      pObject.fill();
    }


    // for(var i = 0; i < pObject.maxParticles; i++){
    //   var p = ParticlePool.newParticle();
    //   var speed = utils.randomRange(pObject.minSpeed, pObject.maxSpeed);
    //   var direction = utils.randomRange(pObject.minAngle, pObject.maxAngle);
    //
    //   if(pObject.preRandomized){
    //     p.internalTime = utils.randomRange(0, pObject.duration);
    //     p.x = pObject.x + Math.cos(direction) * speed * p.internalTime;
    //     p.y = pObject.y + Math.sin(direction) * speed * p.internalTime;
    //     p.radius = utils.randomRange(pObject.minSize, pObject.maxSize);
    //     p.mass = p.radius;
    //     p.setSpeedDirection(speed, direction);
    //
    //   } else {
    //     p.x = pObject.x;
    //     p.y = pObject.y;
    //     p.internalTime = 0;
    //   }
    //   p.radius = utils.randomRange(pObject.minSize, pObject.maxSize);
    //   p.mass = p.radius;
    //   p.setSpeedDirection(speed, direction);
    //
    //   pObject.allParticles.push(p);
    // }

    return pObject;
  },

  fill: function(){
    for(var i = 0; i < this.maxParticles; i++){
      var p = ParticlePool.newParticle();
      var speed = utils.randomRange(this.minSpeed, this.maxSpeed);
      var direction = utils.randomRange(this.minAngle, this.maxAngle);

      p.x = this.x + utils.randomRange(0, this.width);
      p.y = this.y + utils.randomRange(0, this.height);
      p.internalTime = 0;

      p.radius = utils.randomRange(this.minSize, this.maxSize);
      p.mass = p.radius;
      p.setSpeedDirection(speed, direction);

      p.gravity = this.gravity;
      p.friction = this.friction;

      this.allParticles.push(p);
    }
  },

  randomizePosDur: function(){
    for(var i = this.allParticles.length - 1; i >= 0; i--){
      var p = this.allParticles[i];
      var speed = utils.randomRange(this.minSpeed, this.maxSpeed);
      var direction = utils.randomRange(this.minAngle, this.maxAngle);

      p.internalTime = utils.randomRange(0, this.duration);
      p.x = this.x + Math.cos(direction) * speed * p.internalTime * p.friction;
      p.y = this.y + Math.sin(direction) * speed * p.internalTime * p.friction;

      p.setSpeedDirection(speed, direction);

    }
  },

  update: function(deltaTime){
    for(var i = this.allParticles.length - 1; i >= 0; i--){
      var p = this.allParticles[i];
      p.internalTime += deltaTime;
      p.update(deltaTime);
      var dx = p.x - this.x;
      var dy = p.y - this.y;
      if(p.internalTime > this.duration){
        if(this.isLoop){
          this.resetParticle(p);
        } else {
          ParticlePool.recycleParticle(this.allParticles.splice(i, 1)[0]);
        }
      }
      // To Recycle based on distance
      // if((dx * dx + dy * dy) > this.duration * this.duration){
      //   if(this.isLoop){this.resetParticle(p);} else {
      //     ParticlePool.recycleParticle(this.allParticles.splice(i, 1)[0]);
      //   }
      // }
    }
  },

  applyForce: function(ax, ay){
    for(var i = this.allParticles.length -1; i>=0; i--){
      var p = this.allParticles[i];
      p.applyForce(ax, ay);
    }
  },

  setGravity: function(gravity){
    this.gravity = gravity;
    for(var i = this.allParticles.length -1; i>=0; i--){
      var p = this.allParticles[i];
      p.gravity = gravity;
    }
  },

  setFriction: function(friction){
    this.friction = friction;
    for(var i = this.allParticles.length -1; i>=0; i--){
      var p = this.allParticles[i];
      p.friction = friction;
    }
  },

  resetParticle: function(p){
    p.x = this.x;
    p.y = this.y;
    p.setSpeedDirection(utils.randomRange(this.minSpeed, this.maxSpeed),
    utils.randomRange(this.minAngle, this.maxAngle));

    p.internalTime = 0;
    p.radius = utils.randomRange(this.minSize, this.maxSize);
    p.mass = p.radius;

    p.gravity = this.gravity;
    p.friction = this.friction;
  },

  resetEffect: function(x, y){
    this.x = x || this.x;
    this.y = y || this.y;
    if(!this.preFilled) return;
    for(var currentNumParticles = this.allParticles.length; currentNumParticles < this.maxParticles; currentNumParticles++){
      var p = ParticlePool.newParticle();
      this.allParticles.push(p);
    }
    for(var i = this.allParticles.length - 1; i >= 0; i--){
      this.resetParticle(this.allParticles[i]);
    }
  },

  isFinished: function(){
    if(this.isLoop) return false;
    return (this.allParticles.length == 0);
  }

};


var ParticlePool = {

  allParticles: [],
  freeParticles: [],
  maxSize: 100000,

  init: function(){
    for(var i = 0; i < this.maxSize; i++){
      this.freeParticles.push(particle.create(0, 0, 10, 0));
    }
  },

  newParticle: function(){
    if(this.freeParticles.length > 0){
      return this.freeParticles.pop();
    } else {
      return particle.create();
    }
  },

  recycleParticle: function(p){
    if(this.freeParticles.length < this.maxSize){
      this.freeParticles.push(p);
    }
  }

};
