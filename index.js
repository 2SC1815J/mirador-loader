/*
 * Mirador Loader
 * https://github.com/2sc1815j/mirador-loader
 * 
 * Copyright 2018 2SC1815J
 */
(function() {
    'use strict';

    processParams();

    function processParams() {
        var documentsInfo = [];
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
                documentsInfo.push({
                    index: index,
                    manifestUri: decodeURIComponent(result[2]),
                    canvasUri: canvases[index]
                });
            }
        }
        documentsInfo.sort(function(a, b) {
            return a.index - b.index;
        });
        if (canvases.length > 0) {
            getManifests(documentsInfo);
        } else {
            prepareMirador(documentsInfo);
        }
    }

    function getManifests(documentsInfo) {
        if (documentsInfo.length > 0) {
            var deferreds = [];
            for (var i = 0; i < documentsInfo.length; i++) {
                deferreds.push($.getJSON(documentsInfo[i].manifestUri));
            }
            $.when.apply($, deferreds).done(function() {
                var manifests = [];
                if (deferreds.length === 1 && arguments[1] === 'success') {
                    manifests.push(arguments[0]);
                } else {
                    for (i = 0; i < deferreds.length; i++) {
                        if (arguments[i][1] === 'success') {
                            manifests.push(arguments[i][0]);
                        }
                    }
                }
                if (documentsInfo.length === manifests.length) {
                    prepareMirador(documentsInfo, manifests);
                } else {
                    prepareMirador(documentsInfo);
                }
            }).fail(function() {
                prepareMirador(documentsInfo);
            });
        } else {
            prepareMirador(documentsInfo);
        }
    }

    function prepareMirador(documentsInfo, manifests) {
        var data = [];
        var windowObjects = [];
        for (var i = 0; i < documentsInfo.length; i++) {
            data.push({
                manifestUri: documentsInfo[i].manifestUri,
                location: ''
            });
            var windowObject = {
                loadedManifest: documentsInfo[i].manifestUri,
                viewType: 'ImageView',
                sidePanelVisible: false
            };
            if (documentsInfo[i].canvasUri && manifests) {
                var canvasUri_ = documentsInfo[i].canvasUri.replace(/^https:/, 'http:');
                try {
                    for (var j = 0; j < manifests[i].sequences[0].canvases.length; j++) {
                        if (manifests[i].sequences[0].canvases[j]['@id'].replace(/^https:/, 'http:') === canvasUri_) {
                            windowObject.canvasID = documentsInfo[i].canvasUri;
                            break;
                        }
                    }
                } catch (e) {
                    //
                }
            }
            windowObjects.push(windowObject);
        }
        showMirador(data, windowObjects);
    }

    function showMirador(data_, windowObjects_) {
        var data = data_ || [];
        var windowObjects = windowObjects_ || [];
        Mirador({
            id: 'viewer',
            layout: '1x' + (windowObjects.length || 1),
            buildPath: 'http://projectmirador.org/demo/',
            data: data,
            windowObjects: windowObjects,
            annotationEndpoint: {
                name: 'Local Storage',
                module: 'LocalStorageEndpoint'
            }
        });
        var match = location.search.match(/(?:&|\?)title=(.+?)(?:&|$)/);
        if (match) {
            var title = decodeURIComponent(match[1]);
            $('title').text(title + ' - Miradow Viewer');
        }
    }
})();