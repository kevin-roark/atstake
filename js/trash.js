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
        'images/trash/2.png',
        'images/trash/3.png',
        'images/trash/4.png',
        'images/trash/5.png',
        'images/trash/6.png',
        'images/trash/7.png',
        'images/trash/8.png'
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

                var accel = 0.044;
                var angle;
                if (self === collisionDetails.bodyA) {
                    angle = Math.atan2(collisionDetails.norm.y, -collisionDetails.norm.x);
                }
                else {
                    angle = Math.atan2(collisionDetails.norm.y, collisionDetails.norm.x);
                }

                // lets make it upwards a bit
                if (angle < 0) {
                  angle += 0.8;
                } else {
                  angle -= 0.8;
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
