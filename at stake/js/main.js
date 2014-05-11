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

  'js/lib/jquery.min',

  // custom extensions
  'js/camera',
  'js/player',
  'js/player-behavior',
  'js/trash',

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
  document.body.className = 'before-game';

  var bounds;
  function set_bounds() {
    bounds = {
      width: window.innerWidth * 3,
      height: window.innerHeight - 60
    };
  }
  set_bounds();

  var inGame = false;
  var zoomTimer;
  var zoomAmt = 1;
  var player;

  var songActive = true;

  var song = document.querySelector('#song');
  var $song = $(song);
  var songSource, songContext;
  var songFilter1;
  song.volume = 0.9;
  song.loop = true;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  try {
     songContext = new AudioContext();
  } catch(e) {
    songContext = null;
  }

  var noise = document.querySelector('#noise');
  var $noise = $(noise);
  noise.volume = 0.05;
  noise.loop = true;

  song.addEventListener('canplaythrough', function() {
    song.currentTime = 4.2;

    if (songContext) {
      songSource = songContext.createMediaElementSource(song);
      songFilter1 = songContext.createBiquadFilter();

      songSource.connect(songFilter1);

      songFilter1.connect(songContext.destination);

      songFilter1.type = 0; // Low-pass filter. See BiquadFilterNode docs
      songFilter1.frequency.value = 20000;
    }

    $('.start-button').fadeIn();
  });

  $('.start-button').click(function() {
    $(this).fadeOut();
    $('.instructions').fadeOut();
    setTimeout(function() {
      $('.at-stake').fadeIn(200, function() {
        song.play();
        noise.pause();
        setTimeout(function() {
          $('.at-stake').fadeOut(1500, function() {
            startGame();
          });
        }, 2500);
      });
    }, 800);
  });

  function startGame() {
    document.body.className = 'in-game';
    $('.eow-timer').show();
    startTimer();
    inGame = true;
    newGame();

    setTimeout(function() {
      warpAudio();
    }, 46666);
  }

  function warpAudio() {
    songActive = true;
    changeTime();
    changeFilter();

    setTimeout(function() {
      normalize();
      setTimeout(function() {
        warpAudio();
      }, Math.floor(Math.random() * 6666 + 5000))
    }, Math.floor(Math.random() * 14666 + 5000));

    function changeTime() {
      if (!songActive) return;

      var p = Math.random();
      if (p < 0.5) { // slow
        var rate = (Math.random() * 0.4) + 0.5;
      } else { // fast
        var rate = (Math.random()) + 1.0;
      }

      song.playbackRate = rate;

      var next = Math.floor(Math.random() * 6000 + 2000);
      setTimeout(changeTime, next);
    }

    function changeFilter() {
      if (!songActive) return;

      var p = Math.random();
      if (p < 0.5) {
        var t = 0;  // low-pass
        var f = Math.floor(Math.random() * 800) + 20;
      } else {
        var t = 1; // high-pass
        var f = Math.floor(Math.random() * 6500) + 500;
      }

      songFilter1.type = t;
      songFilter1.frequency.value = f;

      var next = Math.floor(Math.random() * 2000 + 200);
      if (songActive) setTimeout(changeFilter, next);
    }

    function normalize() {
      songActive = false;

      songFilter1.type = 0;
      songFilter1.frequency.value = 20000;

      song.playbackRate = 1.0;
    }

  }

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

  var init = function init(world, Physics) {
    var worldX = -bounds.width * 2;
    var worldY = 0;
    var worldWidth = bounds.width * 4;
    var worldHeight = bounds.height;
    var worldBounds = Physics.aabb(worldX, worldY, worldWidth, worldHeight);
    var playerX = 100;

    player = Physics.body('player', {
      x: playerX,
      y: bounds.height - 250,
      restitution: 0.1,
      mass: 1
    });
    var playerBehavior = Physics.behavior('player-behavior', { player: player });

    // create trash
    var trash = [];
    for (var i = 0, l = 30; i < l; i++) {
        var x = playerX;
        while (Math.abs(x - playerX) < 200) {
          x = worldX + (Math.random() * worldWidth);
        }

        trash.push(Physics.body('trash', {
            x: x,
            y: bounds.height - 75,
            radius: 75,
            mass: 0.0001,
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

    // end of the game
    world.subscribe('endgame', function() {
      player.fallDown();
      noise.volume = 0.05;
      noise.play();

      zoomTimer = setInterval(function() {
        zoom(zoomAmt);
        zoomAmt *= 0.999;
        noise.volume *= 0.9993;
        song.volume *= 0.9993;
      }, 20);
    });

    function zoom(amt) {
      var $v = $('body');
      var trans = 'scale(' + amt + ',' + amt + ')';
      $v.css('-webkit-transform', trans);
      $v.css('-moz-transform', trans);
      $v.css('-ms-transform', trans);
      $v.css('-o-transform', trans);
      $v.css('transform', trans);
    }

    // render on every step
    world.subscribe('step', function(){
      // middle of canvas
      var middle = {
          x: 0.5 * window.innerWidth,
          y: 0.75 * window.innerHeight
      };
      var oldY = renderer.options.offset._[1];
      // follow player with camera
      renderer.options.offset.clone( middle ).vsub(player.state.pos);
      // reset the y
      renderer.options.offset._[1] = oldY;
      world.render();
    });

    // add things to the world
    world.add([
      player,
      playerBehavior,
      Physics.behavior('edge-collision-detection', {
        aabb: worldBounds,
        restitution: 0.1,
        cof: 0.99
      }),
      Physics.behavior('sweep-prune'),
      Physics.behavior('body-collision-detection', {
        restitution: 0.1
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

    setTimeout(function() {
      world.publish('endgame');
    }, (180) * 1000);
  };

  function startTimer() {
    var timerDiv = $('.eow-timer');
    var timeLeft = 180;

    function setTimeDisplay(seconds) {
        var m = Math.floor(seconds / 60);
        var s = '' + (seconds % 60);
        if (s.length <= 1) {
            s = '0' + s;
        }

        timerDiv.html(m + ':' + s);
    }

    var eowTimer = setInterval(function() {
        timeLeft -= 1;
        setTimeDisplay(timeLeft);
        if (timeLeft == 60) {
            timerDiv.css('color', 'rgba(250, 20, 20, 1)');
        }
        else if (timeLeft <= 0) {
            clearInterval(eowTimer);
        }
    }, 1000);
  }

  // subscribe to ticker and start looping
  Physics.util.ticker.subscribe(function( time ){
    if (world){
      world.step(time);
    }
  }).start();
});
