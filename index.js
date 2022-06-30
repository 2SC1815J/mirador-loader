/*
 * Mirador Loader
 * https://github.com/2sc1815j/mirador-loader
 * 
 * Copyright 2018 2SC1815J
 */
(function() {
    'use strict';

    var windowsInfo = [];
    var canvases = [];
    var result;
    var reg = new RegExp(/(?:&|\?)canvas([0-9]+)?=(.+?)(?=&|$)/g);
    while ((result = reg.exec(location.search)) !== null) {
        if (result[2]) {
            canvases[parseInt(result[1] || 0, 10)] = decodeURIComponent(result[2]);
        }
    }
    reg = new RegExp(/(?:&|\?)manifest([0-9]+)?=(.+?)(?=&|$)/g);
    while ((result = reg.exec(location.search)) !== null) {
        if (result[2]) {
            var index = parseInt(result[1] || 0, 10);
            windowsInfo.push({
                index: index,
                manifestId: decodeURIComponent(result[2]),
                canvasId: canvases[index]
            });
        }
    }
    windowsInfo.sort(function(a, b) {
        return a.index - b.index;
    });
    Mirador.viewer({
        id: 'mirador',
        windows: windowsInfo,
    });
})();