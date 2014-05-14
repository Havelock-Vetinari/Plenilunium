"use strict";
var logger = process.mainModule.exports._logger;
var slides_manager = process.mainModule.exports.slidesManager;
var settings_manager = process.mainModule.exports.settingsManager;
var gui = require('nw.gui');

var listenForSlides = function () {
    slides_manager.on(
        'next_slide',
        function (event) {
            var image = $('#slide_image');
            image.attr('src', event.path);
        }
    );
    if (slides_manager.getCurrentSlide()) {
        var image = $('#slide_image');
        image.attr('src', slides_manager.getCurrentSlide().path);
    }
};

var handleDragAndDrop = function () {
    window.ondragover = function (e) {
        e.preventDefault();
        return false;
    };
    window.ondrop = function (e) {
        e.preventDefault();
        return false;
    };

    var holder = $('body');
    holder.on('dragover', function () {
        return false;
    });
    holder.on('dragend', function () {
        return false;
    });
    holder.on('drop', function (e) {
        e.preventDefault();
        var draggedFiles = e.originalEvent.dataTransfer.files;
        if (draggedFiles.length !== 1) {
            return false;
        }
        var path = draggedFiles[0].path;
        slides_manager.stop();
        if (slides_manager.watchFolder(path)) {
            settings_manager.slidesDirectory = path;
            settings_manager.saveToStorage();
        }
        slides_manager.start();
        return false;
    });

};

var Menu = function () {
    var menu = new gui.Menu();
    var win = gui.Window.get();
    var fullscreen = new gui.MenuItem({
        label: "Toggle Full Screen", click: function () {
            var state = !settings_manager.fullScreen;
            win.toggleFullscreen();
        }
    });
    var quit = new gui.MenuItem({
        label: "Quit",
        click: function () {
            gui.App.quit();
        }
    });

    menu.append(fullscreen);
    menu.append(quit);

    return menu;
};

var handleContextMenu = function () {
    var menu = new Menu();
    $(document).on("contextmenu", function (e) {
        e.preventDefault();
        menu.popup(e.originalEvent.x, e.originalEvent.y);
    });
};

var handleFullscreen = function () {
    var win = gui.Window.get();
    win.on('enter-fullscreen', function () {
        settings_manager.fullScreen = true;
        settings_manager.saveToStorage();
        $('body').addClass('no-cursor');
    });
    win.on('leave-fullscreen', function () {
        settings_manager.fullScreen = false;
        settings_manager.saveToStorage();
        $('body').removeClass('no-cursor');
    });
    win.isFullscreen = settings_manager.fullScreen;
};


$(document).ready(function (event) {
    listenForSlides();
    handleDragAndDrop();
    handleContextMenu();
    handleFullscreen();
});
