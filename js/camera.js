define(
[
    'require',
    'js/lib/jquery.min'
],
function(require, Physics) {
  $(function() {

    var LEFT_CODE = 37;
    var RIGHT_CODE = 39;
    var Z_CODE = 90;

    var body = $('.overlay');
    var background = new Image();
    background.src = require.toUrl('images/country_bg.png');

    var maxWidth = background.width;
    var curBackgroundX = 0;

    var currentKey;
    var timer;

    function moveBackground(xDiff) {
      curBackgroundX += xDiff;
      if (curBackgroundX >= maxWidth) {
        curBackgroundX = 0;
      }
      else if (curBackgroundX < 0) {
        curBackgroundX = maxWidth;
      }
      var backgroundStyle = curBackgroundX + 'px 0px';
      body.css('background-position', backgroundStyle);
    };

    $(document).keydown(function(e) {
      if (!currentKey) {
        switch (e.keyCode) {
          case LEFT_CODE:
            currentKey = LEFT_CODE;
            timer = setInterval(function() {
              moveBackground(1);
            }, 25);
            break;
          case RIGHT_CODE:
            currentKey = RIGHT_CODE;
            timer = setInterval(function() {
              moveBackground(-1);
            }, 25);
            break;
          case Z_CODE:
            var amt = 10;
            currentKey = 'garbage you cant stop it';
            clearInterval(timer);
            timer = setInterval(function() {
              moveBackground(amt)
            }, 5);
            setTimeout(function() {
              clearInterval(timer);
              timer = setInterval(function() {
                moveBackground(-2 * amt);
              }, 5);
              setTimeout(function() {
                clearInterval(timer);
                timer = setInterval(function() {
                  moveBackground(amt);
                }, 5);
                setTimeout(function() {
                  clearInterval(timer);
                  timer = null;
                  currentKey = null;
                }, 100);
              }, 100);
            }, 100);
            break;
        }
      }
    });

    $(document).keyup(function(e) {
      if (currentKey == e.keyCode) {
        clearInterval(timer);
        timer = null;
        currentKey = null;
      }
    });

  });
});
