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

        return {
            init: function( options ){
                var self = this;
                parent.init.call(this, options);
                // the player will be passed in via the config options
                // so we need to store the player
                var player = self.player = options.player;
                self.gameover = false;

                // events
                document.addEventListener('keydown', function( e ){
                    if (self.gameover){
                        return;
                    }
                    switch ( e.keyCode ){
                        case UP_CODE:
                            self.movePlayer(true);
                            break;
                        case DOWN_CODE:
                            break;
                        case LEFT_CODE:
                            player.turn( -1 );
                            break;
                        case RIGHT_CODE:
                            player.turn( 1 );
                            break;
                        case Z_CODE:
                            player.shoot();
                            break;
                    }
                    return false;
                });
                document.addEventListener('keyup', function( e ){
                    if (self.gameover){
                        return;
                    }
                    switch ( e.keyCode ){
                        case UP_CODE:
                            self.movePlayer(false);
                            break;
                        case DOWN_CODE:
                            break;
                        case LEFT_CODE:
                            player.turn( 0 );
                            break;
                        case RIGHT_CODE:
                            player.turn( 0 );
                            break;
                        case SPACE_CODE:
                            break;
                    }
                    return false;
                });
            },

            // this is automatically called by the world
            // when this behavior is added to the world
            connect: function( world ){

                // we want to subscribe to world events
                world.subscribe('collisions:detected', this.checkPlayerCollision, this);
                world.subscribe('integrate:positions', this.behave, this);
            },

            // this is automatically called by the world
            // when this behavior is removed from the world
            disconnect: function( world ){

                // we want to unsubscribe from world events
                world.unsubscribe('collisions:detected', this.checkPlayerCollision);
                world.unsubscribe('integrate:positions', this.behave);
            },

            // check to see if the player has collided
            checkPlayerCollision: function( data ){

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
            movePlayer: function(active){
                if ( active === false ){
                    this.playerMove = false;
                    return;
                }
                this.playerMove = true;
            },

            behave: function(data){
                // activate thrusters if playerMove is true
                this.player.thrust( this.playerMove ? 1 : 0 );
            }
        };
    });
});