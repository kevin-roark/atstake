require(
  {
    baseUrl: '',
    packages: [{
      name: 'physicsjs',
      location: 'js/physicsjs/',
      main: 'physicsjs-0.5.2.min'
    }]
  },
  [
  'require',
  'physicsjs',
  
  // custom extensions
  'js/camera',
  'js/player',
  'js/player-behavior',
  'js/trash',
  'js/jquery.min',

  // drawing
  'physicsjs/renderers/canvas',
  'physicsjs/bodies/circle',
  'physicsjs/bodies/convex-polygon',

  // physics styles
  'physicsjs/behaviors/sweep-prune',
  'physicsjs/behaviors/constant-acceleration',
  'physicsjs/behaviors/edge-collision-detection',
  'physicsjs/behaviors/body-collision-detection',
  'physicsjs/behaviors/body-impulse-response'
], function(
  require,
  Physics
){
  var Z_CODE = 90;

  document.body.className = 'before-game';

  var bounds;
  function set_bounds() {
    bounds = {
      width: window.innerWidth,
      height: Math.min(700, window.innerHeight)
    };
  }
  set_bounds();

  var inGame = false;

  document.addEventListener('keydown', function(e){
    if (!inGame && e.keyCode === Z_CODE) {
      document.body.className = 'in-game';
      inGame = true;
      newGame();
    }
  });
  
  var renderer = Physics.renderer('canvas', {
    el: 'viewport',
    width: bounds.width,
    height: bounds.height,
    // meta: true,
    // debug:true,
    styles: {
      'circle': {
        strokeStyle: 'rgb(0, 30, 0)',
        lineWidth: 1,
        fillStyle: 'rgb(100, 200, 50)',
        angleIndicator: false
      },
      'convex-polygon' : {
        strokeStyle: 'rgb(60, 0, 0)',
        lineWidth: 1,
        fillStyle: 'rgb(60, 16, 11)',
        angleIndicator: false
      }
    }
  });
  
  window.addEventListener('resize', function(){
    set_bounds();
    renderer.el.width = bounds.width;
    renderer.el.height = bounds.height;
  });
  
  var init = function init(world, Physics){
    var worldBounds = Physics.aabb(-bounds.width * 2, 0, bounds.width * 4, bounds.height);

    var player = Physics.body('player', {
      x: 100,
      y: bounds.height,
      restitution: 0.1,
      mass: 5
    });
    var playerBehavior = Physics.behavior('player-behavior', { player: player });

    // create trash
    var trash = [];
    for (var i = 0, l = 20; i < l; i++) {
        var ang = 4 * (Math.random() - 0.5) * Math.PI;
        var r = 700 + 100 * Math.random() + i * 10;

        trash.push(Physics.body('trash', {
            x: -bounds.width*2 + (Math.random() * worldBounds.width),
            y: 0,
            radius: 50,
            mass: 1,
            restitution: 1.0
        }));
    }

    // handle collisons!!
    world.subscribe('collisions:detected', function( data ){
        var collisions = data.collisions;
    });

    // custom rendering like minimap drawing
    world.subscribe('render', function( data ){
        
    });
    
    // render on every step
    world.subscribe('step', function(){
      // middle of canvas
      var middle = { 
          x: 0.5 * window.innerWidth, 
          y: 0.75 * window.innerHeight
      };
      // follow player with camera
      //renderer.options.offset.clone( middle ).vsub( player.state.pos );
      world.render();
    });
    
    // add things to the world
    world.add([
      player,
      playerBehavior,
      Physics.behavior('edge-collision-detection', {
        aabb: worldBounds,
        restitution: 0.3,
        cof: 0.99
      }),
      Physics.behavior('sweep-prune'),
      Physics.behavior('body-collision-detection', {
        restitution: 0.9
      }),
      Physics.behavior('constant-acceleration'),
      Physics.behavior('body-impulse-response'),
      renderer
    ]);
    world.add(trash);
  };
  
  var world = null;
  var newGame = function newGame(){
    
    if (world){
      world.destroy();
    }
    
    world = Physics(init);
    world.subscribe('lose-game', function(){
      document.body.className = 'lose-game';
      inGame = false;
    });
    world.subscribe('win-game', function(){
      world.pause();
      document.body.className = 'win-game';
      inGame = false;
    });
  };
  
  // subscribe to ticker and start looping
  Physics.util.ticker.subscribe(function( time ){
    if (world){
      world.step(time); 
    }
  }).start();
});
