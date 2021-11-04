window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;

  var startTime = new Date();

  ParticlePool.init();

  var allParticleEffects = [];

  update();


  function update(){
    context.clearRect(0, 0, width, height);

    var deltaTime = (new Date() - startTime)/1000;
    startTime = new Date();

    if(deltaTime > 0.1){
      deltaTime = 0.1;
    }

    for(var i = allParticleEffects.length - 1; i >= 0; i--){
      var currentEffect = allParticleEffects[i];
      if(currentEffect.isFinished()){
        allParticleEffects.splice(i, 1);
        continue;
      }
      currentEffect.update(deltaTime);
    }

    for(var i = 0; i < allParticleEffects.length; i++){
      var particleSet = allParticleEffects[i].allParticles;
      for(var j = 0; j < particleSet.length; j++){
        var p = particleSet[j];
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        context.fill();
      }
    }

    debugTextY = 20;
    requestAnimationFrame(update);
  }

  var debugTextY = 20;

  function drawDebugObject(object){
    context.fillStyle = "black";
    context.textAlign = "center";
    context.font = "" + 20 + "px Times New Roman";
    var text = JSON.stringify(object);
    // console.log(splittedStrings);
    // var splittedStrings = text.split("(.{20})\w+");
    context.fillText(JSON.stringify(object), width/2, debugTextY);
    debugTextY += 20;
  }

  document.body.addEventListener("click", function(e){
    var pEffect = particleEffect.create(e.clientX, e.clientY, 1000, 1, 10, 0, 1000, 0, Math.PI * 2, 1000);
    var len = pEffect.allParticles.length;
    for(var i = 0; i < len; i++){
      pEffect.allParticles[i].color = "rgba(" + Math.floor(255 * Math.random()) + ", " + Math.floor(255 * (i/len)) + ", " + Math.floor(255 * (i/len)) + " , " + Math.random() + ")";
    }
    allParticleEffects.push(pEffect);
  }, false);

};
