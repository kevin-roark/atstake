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
            init: function(options){
                var w = playerImg.naturalWidth;
                var h = playerImg.naturalHeight;
                var verts = [
                    {x: 0, y: 0},
                    {x: w, y: 0},
                    {x: w, y: h},
                    {x: 0, y: h}
                ];
                options.vertices = verts; // set up rectangle vertices

                parent.init.call(this, options); // call main constructor for body

                this.view = playerImg; // set the rendering image

                this.walking = false;
            },

            walk: function(amount){
                var self = this;
                var world = this._world;
                if (!world || self.kicking){
                    return self;
                }

                //var scratch = Physics.scratchpad();
                //var xVel = amount * 0.1;
                //var yVel = 0;
                //var v = scratch.vector().set(xVel, yVel);
                //this.state.vel = v;
                //scratch.done();

                if (amount) {
                    self.state.vel.set(amount * 0.1, 0);
                    this.walking = true;
                }
                else {
                    this.walking = false;
                }

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

            // moves the player right and left real fast
            kick: function() {
              var self = this;
              var world = this._world;
              if (!world){
                  return self;
              }

              var initVel = 1.5;

              self.kicking = true;
              self.state.vel.set(initVel, 0);

              var $v = $('canvas');
              $v.css('-webkit-filter', 'blur(40px)');
              $v.css('-moz-filter', 'blur(40px)');
              $v.css('-ms-filter', 'blur(40px)');
              $v.css('-o-filter', 'blur(40px)');
              $v.css('filter', 'blur(40px)');

              setTimeout(function() {
                self.state.vel.set(-initVel * 2, 0);
                setTimeout(function() {
                  self.state.vel.set(initVel, 0);
                  setTimeout(function() {
                    self.state.vel.set(0, 0);
                    self.kicking = false;

                    $v.css('-webkit-filter', 'none');
                    $v.css('-moz-filter', 'none');
                    $v.css('-ms-filter', 'none');
                    $v.css('-o-filter', 'none');
                    $v.css('filter', 'none');
                  }, 100);
                }, 100);
              }, 100);
            },

            fallDown: function() {
              var self = this;
              var world = this._world;
              if (!world){
                  return self;
              }

              self.state.angular.acc = 0.04;
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
