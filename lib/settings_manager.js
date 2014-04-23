"use strict";

var path = require('path-extra');
var nconf = require('nconf');
var mkdirp = require('mkdirp');
var appSettings = require('../package.json');

var SettingsManager = exports.SettingsManager = function (logger) {
    Object.defineProperty(
        this,
        "logger",
        {value: logger, writable: true, enumerable: false, configurable: false}
    );
    Object.defineProperty(
        this,
        "configPath",
        {
            value: path.join(path.datadir(appSettings.name), 'settings.json'),
            writable: false,
            enumerable: false,
            configurable: false
        }
    );
    Object.seal(this);
    this.loadFromStorage();
};

SettingsManager.prototype = {
    get slidesDirectory() {
        return nconf.get('slidesDirectory');
    },
    set slidesDirectory(value) {
        nconf.set('slidesDirectory', value);
    },
    get slideTime() {
        return nconf.get('slideTime');
    },
    set slideTime(value) {
        nconf.set('slideTime', value);
    },
    get fullScreen() {
        return nconf.get('fullScreen') || false;
    },
    set fullScreen(value) {
        nconf.set('fullScreen', value);
    }
};

SettingsManager.prototype.loadFromStorage = function () {
    mkdirp.sync(path.dirname(this.configPath));
    nconf.file({
        file: this.configPath
    });

};

SettingsManager.prototype.saveToStorage = function () {
    nconf.save();
};

