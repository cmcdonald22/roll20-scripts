var edist = edist || (function() {
    'use strict';
    
    var version = '0.2.0',
        
    checkInstall = function() {
        log('Euclidean Distance v'+version+' is ready!');
    },
    
    posHeightColour = {
        100: 'yellow',
        10: 'brown',
        1: 'red'
    },
    negHeightColour = {
        100: 'pink',
        10: 'purple',
        1: 'blue'
    },
    
    printHelp = function(who) {
        var helpString;
        helpString = "<div style=\"border: 1px solid black; background-color: white; padding: 3px 3px; font-weight: normal;\">";
        helpString += "<h3>Euclidean Distance Script<br />Help</h3>";
        helpString += "<h4>Usage</h4>";
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += '<i>To get the current height above (or below) grid of a selected token run</i>';
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist --get'+
                        '</pre>'+
                    '</div>';
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += '<i>To change the current height above (or below) grid of a selected token run</i>';
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist --set {new height}'+
                        '</pre>'+
                    '</div>';
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += '<i>To get the rounded (5ft grid) 3D euclidean distance from a vertical and horizontal distance run</i>';
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist --hdist {x-y-plane distance} --vdist {z-axis distance}'+
                        '</pre>'+
                    '</div>';
        helpString += "<b>or</b>";
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += "<i>Select 2 tokens and run the following to get the distance between the tokens (left upper corner each)</i>";
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist'+
                        '</pre>'+
                    '</div>';
        helpString += "</div>"
        sendChat(who, "/w " + who + " " + helpString);
    },

    calcGridDist = function(page, top1, left1, top2, left2) {
        var xDif, yDif, dist, scale_number, scale_units, diagonaltype;
        scale_number = page.get("scale_number");
        scale_units = page.get("scale_units");
        diagonaltype = page.get("diagonaltype");
        //Calculates distance for square grids                
        yDif = Math.abs(top1/70 - top2/70);
        xDif = Math.abs(left1/70 - left2/70);
        log("Using " + diagonaltype + " with scale " + scale_number + scale_units + " on x=" + xDif + ", y=" + yDif);
        switch(diagonaltype) {
            case "foure": 
                var straight, diag;
                if (xDif < yDif) {
                    straight = yDif - xDif;
                    diag = xDif;
                } else {
                    straight = xDif - yDif;
                    diag = yDif;
                }
                dist = straight*scale_number + diag*scale_number;
                break;
            case "pythagorean": 
                dist = Math.round(Math.sqrt(xDif*xDif + yDif*yDif))*scale_number;
                break;
            case "threefive":
                var straight, diag;
                if (xDif < yDif) {
                    straight = yDif - xDif;
                    diag = xDif;
                } else {
                    straight = xDif - yDif;
                    diag = yDif;
                }
                dist = straight*scale_number + Math.floor(diag * 1.5)*scale_number;
                break;
            case "manhattan":
                dist = (xDif+yDif)*scale_number;
                break;
        }
        return dist;
    },

    calcED = function(x, y) {
        var dist, modDiff;
        dist = Math.round(Math.sqrt(x*x + y*y));
        modDiff = dist % 5;
        if (modDiff < 2.5) {
            modDiff = -modDiff;
        } else {
            modDiff = 5-modDiff;
        }
        return dist + modDiff;
    },
    
    calcEDist = function(who, vdist, hdist) {
        var rdist = calcED(vdist, hdist);
        sendChat(who, "/w " + who + " Distance is: " + rdist + "ft");
    },

    extractHeightMarkers = function(markers) { // side effect on markers!
        var height = {0: 1}, numHeight = 0;
        for (var i in markers) {
            var marker = markers[i];
            var parts = marker.split(/@/);
            for (var digit in posHeightColour) {
                if (parts[0] === posHeightColour[digit]) {
                    markers[i] = ''; // remove value
                    if (parts[1]) {
                        height[digit] = parts[1];
                    } else {
                        height[digit] = 0;
                    }
                }
            }
            for (var digit in negHeightColour) {
                if (parts[0] === negHeightColour[digit]) {
                    markers[i] = ''; // remove value
                    height[0] = -1;
                    if (parts[1]) {
                        height[digit] = parts[1];
                    } else {
                        height[digit] = 0;
                    }
                }
            }
        }
        for (var digit in height) {
            if (digit !== 0) {
                numHeight += digit*height[digit];
            }
        }
        return numHeight*height[0];
    },

    heightForToken = function(token) {
        var markers, height = 0;
        markers = token.get("statusmarkers").split(/,/);
        return extractHeightMarkers(markers);
    },

    setTokenHeight = function(who, token, height) {
        var markers, updated = false, height100, height10, height1, heightAbs;
        heightAbs = Math.abs(height);
        height100 = Math.floor(heightAbs/100);
        height10 = Math.floor((heightAbs-height100*100)/10);
        height1 = heightAbs-height100*100-height10*10;
        log("height100: "+height100+" height10: " + height10 + " height1: " + height1);
        markers = token.get("statusmarkers").split(/,/);
        extractHeightMarkers(markers);
        if (height > 0) {
            if ((height100 !== 0) || (height10 !== 0) || (height1 !== 0)) {
                markers.push(posHeightColour[1]+"@"+height1);
            }
            if ((height100 !== 0) || (height10 !== 0)) {
                markers.push(posHeightColour[10]+"@"+height10);
            }
            if (height100 !== 0) {
                markers.push(posHeightColour[100]+"@"+height100);
            }
        } else if (height < 0) {
            if ((height100 !== 0) || (height10 !== 0) || (height1 !== 0)) {
                markers.push(negHeightColour[1]+"@"+height1);
            }
            if ((height100 !== 0) || (height10 !== 0)) {
                markers.push(negHeightColour[10]+"@"+height10);
            }
            if (height100 !== 0) {
                markers.push(negHeightColour[100]+"@"+height100);
            }
        }
        token.set("statusmarkers", markers.join());
        sendChat(who, "/w " + who + " Set height for "+token.get("name")+" to " + height + "ft.");
    },

    calcTokenDist = function(who, token1, token2) {
        var rdist, vdist, hdist, currentPage;
        currentPage = getObj("page", token1.get("_pageid"));
        if (!currentPage) {
            handleError(who, "Token does not appear to be on any page.", token1);
            return;
        }
        vdist = calcGridDist(currentPage, token1.get("top"), token1.get("left"), token2.get("top"), token2.get("left"));
        log("Token grid dist: " + vdist);
        hdist = Math.abs(heightForToken(token1) - heightForToken(token2));
        log("Token height diff: " + hdist);
        rdist = calcED(vdist, hdist);
        sendChat(who, "/w " + who + " Distance between "+token1.get("name")+" and "+token2.get("name")+" is: " + rdist + "ft");
    },
    
    handleError = function(who, errorMsg, opts) {
        var output = "/w " + who;
        output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
        output += "<h4>Error</h4>";
        output += "<p>"+errorMsg+"</p>";
        output += "Input was: <p>" + JSON.stringify(opts) + "</p>";
        output += "</div>";
        sendChat(who, output);
    },
    
    handleInput = function(msg) {
        var args, opts, token1, token2;
    
        if (msg.type !== "api") {
            return;
        }
    
        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!edist':            
        
                opts = {};
                for (var arg in args) {
                    var kv = args[arg].split(/\s+/);
                    if (kv[1]) {
                        opts[kv[0]] = kv[1];
                    } else {
                        opts[kv[0]] = true;
                    }
                }

                if (opts.help) {
                    printHelp(msg.who);
                    return;
                }

                if (opts.vdist && opts.hdist) {
                    var vdist, hdist;
                    vdist = parseInt(opts.vdist);
                    hdist = parseInt(opts.hdist);
                    if ((vdist >= 0) && (hdist >= 0)) {
                        calcEDist(msg.who, vdist, hdist);
                    } else {
                        handleError(msg.who, "Distances must not be negative!", opts);
                    }
                    return;
                }

                if (msg.selected && msg.selected.length) {
                    if (msg.selected.length == 1) {
                        if (opts.set) {
                            vdist = parseInt(opts.set);
                            token1 = getObj('graphic', msg.selected[0]._id);
                            if (token1.get("_subtype") === "token") {
                                setTokenHeight(msg.who, token1, vdist);
                                return;
                            } else {
                                handleError(msg.who, "Selected item must be a token.", {"selected": msg.selected, "token": token1});
                            }
                        } else if (opts.get) {
                            token1 = getObj('graphic', msg.selected[0]._id);
                            if (token1.get("_subtype") === "token") {
                                vdist = heightForToken(token1);
                                sendChat(msg.who, "/w " + msg.who + " Height for "+token1.get("name")+" is " + vdist + "ft.");
                                return;
                            } else {
                                handleError(msg.who, "Selected item must be a token.", {"selected": msg.selected, "token": token1});
                            }
                        } else {
                            handleError(msg.who, "Give a height with --set {height} to set token height.", msg.selected);
                            return;
                        }
                    } else if (msg.selected.length == 2) {
                        token1 = getObj('graphic', msg.selected[0]._id);
                        token2 = getObj('graphic', msg.selected[1]._id);
                         if ((token1.get("_subtype") === "token") && (token2.get("_subtype") === "token")) {
                            calcTokenDist(msg.who, token1, token2);
                        } else {
                            handleError(msg.who, "Selected items must be tokens.", {"selected": msg.selected, "token1": token1, "token2": token2});
                        }
                        return;
                    } else if (msg.selected.length > 2) {
                        handleError(msg.who, "Can't deal with more than two tokens at this time.", msg.selected);
                        return;
                    } // else just ignore the token and try to parse normally
                }
                
                handleError(msg.who, "Don't know what to do!", opts);
                break;
        }  
    },
    
    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready',function() {
    'use strict';

    edist.CheckInstall();
    edist.RegisterEventHandlers();
});