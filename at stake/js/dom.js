$(function() {

    var INIT_WAIT = 4000;

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

    setTimeout(function() {
        var eowTimer = setInterval(function() {
            timeLeft -= 1;
            setTimeDisplay(timeLeft);
            if (timeLeft == 60) {
                timeLeft.css('color', 'rgba(250, 20, 20, 1)');
            }
            else if (timeLeft <= 0) {
                clearInterval(eowTimer);
            }
        }, 1000);
    }, INIT_WAIT);
    

});