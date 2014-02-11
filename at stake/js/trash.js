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
    var TRASH_IMAGES = ['images/ufo.png'];

    Physics.body('trash', 'circle', function( parent ){
        var ast1 = new Image();
        ast1.src = require.toUrl('images/ufo.png');

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
                /*
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
                */
                return this;
            }
        };
    });
});
