"use strict";

var events = require('events');
var util = require('util');
var chokidar = require('chokidar');
var sprintf = require("sprintf-js").sprintf;
var path = require("path");
var validExtensions = ['.jpg', '.jpeg', '.gif', '.png', '.tif', '.tiff', '.svg'];
Object.defineProperty(
    Array.prototype,
    'removeElement',
    {
        value: function (element) {
            var i;
            while ((i = this.indexOf(element)) !== -1) {
                this.splice(i, 1);
            }
        }
    }
);
var SlidesManager = exports.SlidesManager = function (logger) {
    events.EventEmitter.call(this);
    this._logger = logger || console;
    this._watcher = null;
    this._files = [];
    this._slideTime = 10000;
    this._timeoutId = -1;
    this._slideShowRunning = false;
    this._currentIndex = undefined;
    this._isReady = false;
    this._currentSlide = null;
};

util.inherits(SlidesManager, events.EventEmitter);

SlidesManager.prototype.addFile = function (file) {
    this._files.unshift(file);
};

SlidesManager.prototype.removeFile = function (file) {
    this._files.removeElement(file);
};

SlidesManager.prototype.getNextSlide = function () {
    function getRandomInt(min, max, last) {
        var random;
        while (last === (random = Math.floor(Math.random() * (max - min)) + min)) {
        }
        return random;
    }

    var index = getRandomInt(0, this._files.length, this._currentIndex);
    this._currentIndex = index;
    this._logger.debug(sprintf('current image(%d): %s', index, this._files[index]));
    this._currentSlide = {path: this._files[index]};

};

SlidesManager.prototype.sendSlide = function () {
    this.getNextSlide();
    this._timeoutId = setTimeout(this.sendSlide.bind(this), this._slideTime);
    this._logger.debug('sending slide', this._currentSlide);
    this.emit('next_slide', this._currentSlide);
};

SlidesManager.prototype.getCurrentSlide = function () {
    return this._currentSlide;
};


SlidesManager.prototype.start = function () {
    if (this.isRunning()) {
        this._logger.debug('was running');
        return;
    }
    this._logger.debug('starting...');
    if (this.isReady()) {
        this._logger.debug('started');
        this._slideShowRunning = true;
        this.sendSlide();
    } else {
        this._logger.debug('waiting to get ready...');
        this.once('ready', this.start.bind(this));
    }
};

SlidesManager.prototype.stop = function () {
    this._logger.debug('stopping');
    this.removeListener('ready', this.start.bind(this));
    clearTimeout(this._timeoutId);
    this._timeoutId = -1;
    this._slideShowRunning = false;
};

SlidesManager.prototype.isRunning = function () {
    return this._slideShowRunning;
};

SlidesManager.prototype.isReady = function () {
    return this._isReady;
};

SlidesManager.prototype.watchFolder = function (path) {
    if (!path) {
        return false;
    }
    if (this._watcher) {
        try {
            this._watcher.close();
            this._watcher = null;
        } catch (error) {
        }
    }
    this._isReady = false;
    this._watcher = chokidar.watch(path, {persistent: false});
    this._watcher.on(
        'add',
        function (event) {
            if (this._isFileValid(event)) {
                this._logger.debug('added', event);
                this.addFile(event);
                this._makeReady();
            } else {
                this._logger.debug('invalid: ' + event);
            }
        }.bind(this)
    );
    this._watcher.on(
        'unlink',
        function (event) {
            this._logger.debug('removed', event);
            this.removeFile(event);
        }.bind(this)
    );
    return true;
};

SlidesManager.prototype._makeReady = function () {
    if (!this.isReady()) {
        this._isReady = true;
        this.emit('ready');
    }
};

SlidesManager.prototype._isFileValid = function (filePath) {
    return (validExtensions.indexOf(path.extname(filePath)) !== -1);
};
