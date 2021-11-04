var Animation = {

  animSpeed: 0,
  textureRegions: null,
  isLoop: false,

  create: function(animSpeed, allFrames, isLoop){
    var obj = Object.create(this);
    obj.animSpeed = animSpeed;
    obj.textureRegions = allFrames;
    obj.isLoop = isLoop || false;
    return obj;
  },

  getFrame: function(stateTime){
    var frameIndex = Math.floor(stateTime / this.animSpeed);
    if(this.isLoop){
      frameIndex %= (this.textureRegions.length);
    } else {
      frameIndex = Math.min(frameIndex, this.textureRegions.length - 1);
    }
    return this.textureRegions[frameIndex];
  }

};
