define(
[
    'require',
    'physicsjs',
    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon'
],
function(
    require,
    Physics
){
    // extend the circle body
    Physics.body('player', 'convex-polygon', function( parent ){
        // private helpers
        var deg = Math.PI/180;
        var playerImg = new Image();
        var flippedPlayerImg = new Image();
        playerImg.src = require.toUrl('images/beach_player.png');
        flippedPlayerImg.src = require.toUrl('images/beach_player_flipped.png');

        return {
            // we want to do some setup when the body is created
            // so we need to call the parent's init method
            // on "this"
            init: function(options){
                var w = playerImg.naturalWidth;
                var h = playerImg.naturalHeight;
                var verts = [
                    {x: 0, y: 0},
                    {x: h, y: 0},
                    {x: h, y: h},
                    {x: 0, y: h}
                ];
                options.vertices = verts; // set up rectangle vertices

                parent.init.call(this, options); // call main constructor

                this.view = playerImg; // set the rendering image
            },
            walk: function(amount){
                var self = this;
                var world = this._world;
                if (!world){
                    return self;
                }

                //var scratch = Physics.scratchpad();
                //var xVel = amount * 0.1;
                //var yVel = 0;
                //var v = scratch.vector().set(xVel, yVel);
                //this.state.vel = v;
                //scratch.done();

                if (amount)
                    this.state.vel._[0] = amount * 0.1;

                if (amount < 0) {
                    this.view = flippedPlayerImg;
                } else if (amount > 0) {
                    this.view = playerImg;
                }
                
                return self;
            },

            jump: function() {
                var self = this;
                var world = self._world;
                if (!world)
                  return self;

                self.state.vel.set(0, -0.3);
            },

            // this will create a projectile (little circle)
            // that travels away from the ship's front.
            // It will get removed after a timeout
            shoot: function(){
                var self = this;
                var world = this._world;
                if (!world){
                    return self;
                }
                var angle = this.state.angular.pos;
                var cos = Math.cos( angle );
                var sin = Math.sin( angle );
                var r = this.geometry.radius + 5;
                // create a little circle at the nose of the ship
                // that is traveling at a velocity of 0.5 in the nose direction
                // relative to the ship's current velocity
                var laser = Physics.body('circle', {
                    x: this.state.pos.get(0) + r * cos,
                    y: this.state.pos.get(1) + r * sin,
                    vx: (0.5 + this.state.vel.get(0)) * cos,
                    vy: (0.5 + this.state.vel.get(1)) * sin,
                    radius: 2
                });
                // set a custom property for collision purposes
                laser.gameType = 'laser';

                // remove the laser pulse later
                setTimeout(function(){
                    world.removeBody( laser );
                    laser = undefined;
                }, 1500);
                world.add( laser );
                return self;
            },
            // 'splode! This will remove the ship
            // and replace it with a bunch of random
            // triangles for an explosive effect!
            blowUp: function(){
                var self = this;
                var world = this._world;
                if (!world){
                    return self;
                }
                var scratch = Physics.scratchpad();
                var rnd = scratch.vector();
                var pos = this.state.pos;
                var n = 40; // create 40 pieces of debris
                var r = 2 * this.geometry.radius; // circumference
                var size = 8 * r / n; // rough size of debris edges
                var mass = this.mass / n; // mass of debris
                var verts;
                var d;
                var debris = [];

                // create debris
                while ( n-- ){
                    verts = rndPolygon( size, 3, 1.5 ); // get a random polygon
                    if ( Physics.geometry.isPolygonConvex( verts ) ){
                        // set a random position for the debris (relative to player)
                        rnd.set( Math.random() - 0.5, Math.random() - 0.5 ).mult( r );
                        d = Physics.body('convex-polygon', {
                            x: pos.get(0) + rnd.get(0),
                            y: pos.get(1) + rnd.get(1),
                            // velocity of debris is same as player
                            vx: this.state.vel.get(0),
                            vy: this.state.vel.get(1),
                            // set a random angular velocity for dramatic effect
                            angularVelocity: (Math.random()-0.5) * 0.06,
                            mass: mass,
                            vertices: verts,
                            // not tooo bouncy
                            restitution: 0.8
                        });
                        d.gameType = 'debris';
                        debris.push( d );
                    }
                }

                // add debris
                world.add( debris );
                // remove player
                world.removeBody( this );
                scratch.done();
                return self;
            }
        };
    });


});
