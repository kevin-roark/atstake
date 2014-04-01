define(
[
    'require',
    'physicsjs',
    'physicsjs/bodies/circle'
],
function(
    require,
    Physics
){
    var TRASH_IMAGES = [
        'images/trash/1.png',
        'images/trash/2.png',
        'images/trash/3.png',
        'images/trash/4.png'
    ];

    Physics.body('trash', 'circle', function( parent ){

        return {
            init: function( options ){
                parent.init.call(this, options);

                var im = new Image();
                var im_path = TRASH_IMAGES[(Math.ceil(Math.random() * TRASH_IMAGES.length) - 1)];
                im.src = require.toUrl(im_path);
                this.view = im;

                this.gameType = 'trash';
            },
            getKicked: function(collisionDetails) {

                var self = this;
                var world = self._world;
                if (!world) {
                    return self;
                }

                var accel = 0.05;
                var angle;
                if (self === collisionDetails.bodyA) {
                    angle = Math.atan2(collisionDetails.norm.y, -collisionDetails.norm.x);
                }
                else {
                    angle = Math.atan2(collisionDetails.norm.y, collisionDetails.norm.x);
                }

                var scratch = Physics.scratchpad();
                var accelerationVector = scratch.vector().set(accel * Math.cos(angle), accel * Math.sin(angle));

                self.accelerate(accelerationVector);
                scratch.done();
                
                return this;
            }
        };
    });
});
