/*
 * Mirador Loader
 * https://github.com/2sc1815j/mirador-loader
 * 
 * Copyright 2018 2SC1815J
 */
(function() {
    'use strict';

    var manifestUri;
    var canvasUri;
    var windowObjects = [];

    var match = location.search.match(/(?:&|\?)manifest=(.+?)(?:&|$)/);
    if (match) {
        manifestUri = decodeURIComponent(match[1]);
        match = location.search.match(/(?:&|\?)canvas=(.+?)(?:&|$)/);
        if (match) {
            canvasUri = decodeURIComponent(match[1]);
        }
    }
    if (manifestUri) {
        $.getJSON(manifestUri, function(manifest) {
            var canvasId;
            if (canvasUri) {
                var canvasUri_ = canvasUri.replace(/^https?:/, '');
                try {
                    for (var i = 0; i < manifest.sequences[0].canvases.length; i++) {
                        if (manifest.sequences[0].canvases[i]['@id'].replace(/^https?:/, '') === canvasUri_) {
                            canvasId = canvasUri;
                            break;
                        }
                    }
                } catch (e) {
                    //
                }
            }
            var windowObject = {};
            windowObject.loadedManifest = manifestUri;
            if (canvasId) {
                windowObject.canvasID = canvasId;
            }
            windowObject.viewType = 'ImageView';
            windowObjects.push(windowObject);
            Mirador({
                id: 'viewer',
                layout: '1x1',
                buildPath: 'http://projectmirador.org/demo/',
                data: [{ manifestUri: manifestUri, location: '' }],
                windowObjects: windowObjects,
                annotationEndpoint: {
                    name: 'Local Storage',
                    module: 'LocalStorageEndpoint'
                }
            });
            if (history && history.replaceState && history.state !== undefined) {
                var newUrl = '?manifest=' + manifestUri;
                history.replaceState(null, document.title, newUrl);
            }
        });
    }
})();