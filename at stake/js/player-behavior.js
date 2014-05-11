define(
[
    'physicsjs'
],
function(
    Physics
){

    var UP_CODE = 38;
    var DOWN_CODE = 40;
    var LEFT_CODE = 37;
    var RIGHT_CODE = 39;
    var Z_CODE = 90;
    var SPACE_CODE = 32;

    return Physics.behavior('player-behavior', function( parent ){

        var zeroAngularVel = {pos: 0, vel: 0, acc: 0};

        return {
            init: function( options ){
                var self = this;
                self.jumpLevel = 0;

                parent.init.call(this, options);
                // the player will be passed in via the config options
                // so we need to store the player
                var player = self.player = options.player;
                self.gameover = false;

                // events
                document.addEventListener('keydown', function( e ){
                    if (self.gameover) {
                        return;
                    }
                    switch (e.keyCode){
                        case RIGHT_CODE:
                            self.movePlayer('r');
                            break;
                        case LEFT_CODE:
                            self.movePlayer('l');
                            break;
                        case UP_CODE:
                            self.jump();
                            break;
                        case Z_CODE:
                            player.kick();
                            break;
                    }
                    return false;
                });
                document.addEventListener('keyup', function( e ){
                    if (self.gameover) {
                        return;
                    }
                    switch (e.keyCode){
                        case RIGHT_CODE:
                            self.movePlayer(false);
                            break;
                        case LEFT_CODE:
                            self.movePlayer(false);
                            break;
                        case SPACE_CODE:
                            break;
                    }
                    return false;
                });
            },

            // this is automatically called by the world
            // when this behavior is added to the world
            connect: function(world){

                // we want to subscribe to world events
                world.subscribe('collisions:detected', this.checkPlayerCollision, this);
                world.subscribe('integrate:positions', this.behave, this);
            },

            // this is automatically called by the world
            // when this behavior is removed from the world
            disconnect: function(world){

                // we want to unsubscribe from world events
                world.unsubscribe('collisions:detected', this.checkPlayerCollision);
                world.unsubscribe('integrate:positions', this.behave);
            },

            // check to see if the player has collided
            checkPlayerCollision: function(data){

                var self = this
                    ,world = self._world
                    ,collisions = data.collisions
                    ,col
                    ,player = this.player
                    ;

                for (var i = 0, l = collisions.length; i < l; ++i){
                    col = collisions[i];

                    // if one event is trash and the other is player
                    if ((col.bodyA.gameType === 'trash' && col.bodyB === player) ||
                        (col.bodyA === player && col.bodyB.gameType === 'trash')
                    ) {
                        if (col.bodyA === player) {
                            col.bodyB.getKicked(col);
                        }
                        else {
                            col.bodyA.getKicked(col);
                       }
                    }
                }
            },

            // toggle player motion
            movePlayer: function(direction){
                if (!direction || this.jumpLevel > 1) {
                    this.playerMove = 0;
                }
                else if (direction == 'l') {
                    this.playerMove = -1;
                }
                else if (direction == 'r') {
                    this.playerMove = 1;
                }
            },

            // do a little jump
            jump: function() {
                var self = this;
                if (self.jumpLevel < 2) {
                  self.jumpLevel += 1;
                  self.player.jump();
                  setTimeout(function() {
                    self.jumpLevel -= 1;
                  }, 1350);
                }
            },

            behave: function(data){
                this.player.walk(this.playerMove);
                this.player.state.angular = zeroAngularVel;
                this.player.state.old.angular = zeroAngularVel;
            }
        };
    });
});
