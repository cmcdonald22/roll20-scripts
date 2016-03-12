var edist = edist || (function() {
    'use strict';
    
    var version = '0.1.0',
        
    checkInstall = function() {
        log('Euclidean Distance v'+version+' is ready!');
    },
    
    colourHeight = {
        'red': -30,
        'blue': -20,
        'green': -10,
        'brown': 0,
        'purple': 10,
        'pink': 20,
        'yellow': 30
    },
    
    printHelp = function(who) {
        var helpString;
        helpString = "<div style=\"border: 1px solid black; background-color: white; padding: 3px 3px; font-weight: bold;\">";
        helpString += "<h3>Euclidean Distance Script<br />Help</h3>";
        helpString += "<h4>Usage</h4>";
        helpString += '<div style="padding-left: 10px;padding-right:20px">'+
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist --vdist {x-y-plane distance} --hdist {z-axis distance}'+
                        '</pre>'+
                    '</div>';
        helpString += "<b>or</b>";
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += "<i>Select 2 tokens and run</i>";
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!edist'+
                        '</pre>'+
                    '</div>';
        helpString += "<h4>Heights</h4><ul>";
        for (var c in colourHeight) {
            helpString += "<li style=\"color: "+c+"\">" + colourHeight[c] + " ("+c+")</li>"
        }
        helpString += "</ul></div>"
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

    heightForToken = function(token) {
        var markers, height = 0;
        markers = token.get("statusmarkers").split(/,/);
        for (var i in markers) {
            var marker = markers[i];
            var parts = marker.split(/@/);
            log("Checking marker " + marker + "...split into " + JSON.stringify(parts));
            if (parts[0] in colourHeight) {
                log("Found value for colour height at "+marker+": " + colourHeight[parts[0]]);
                height = colourHeight[parts[0]];
                return height;
            }
        }
        return height;
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
        
                if (msg.selected && msg.selected.length) {
                    if (msg.selected.length == 2) {
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
                
                opts = {};
                for (var arg in args) {
                    var kv = args[arg].split(/\s+/);
                    if (kv[1]) {
                        opts[kv[0]] = kv[1];
                    } else {
                        opts[kv[0]] = true;
                    }
                }
                    //handleError(msg.who, JSON.stringify(opts));
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