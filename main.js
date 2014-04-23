"use strict";

var logger = exports._logger = require('winston');
logger.level = 'debug';
var slidesManager = require('./lib/slides_manager');
var settingsManager = require('./lib/settings_manager');

settingsManager = new settingsManager.SettingsManager(logger);

slidesManager = new slidesManager.SlidesManager(logger);
slidesManager.watchFolder(settingsManager.slidesDirectory);
slidesManager.start();

exports.slidesManager = slidesManager;
exports.settingsManager = settingsManager;