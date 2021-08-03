var Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        clearTimeout(timerId);
        remaining -= Date.now() - start;
        console.log(remaining)
    };

    this.resume = function() {
        start = Date.now();
        clearTimeout(timerId);
        timerId = setTimeout(callback, remaining);
    };

    this.resume();
};

module.exports = Timer;
