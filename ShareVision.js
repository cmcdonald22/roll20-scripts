// Quick documentation:	Use !sharevision to toggle shared vision state
// 						Option --add to only add shared vision
//						Option --del to only delete shared vision
//						Option --show to print current state
// Note: make sure not to use this script while you have a token with 

var ShareVision = ShareVision || (function() {
    'use strict';
    
    var visionURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
    schemaVersion = 0.2,
    lastUpdate = 1430571841,
    version = '0.1.4',
    
    checkInstall = function() {
        log('-=> ShareVision v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'ShareVision') || state.ShareVision.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.ShareVision && state.ShareVision.version) {
                case 0:
                default:
                    state.ShareVision = {
                        version: schemaVersion,
                        vision: {}
                    };
                    break;
            }
        }
    },
    
    ch = function (c) {
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    },
    
    outputUpdate = function(msg, tokenName) {
        var output = "/w GM ";
        output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
        output += "<p> ShareVision turned " + msg + " for</p>";
        output += "<p><b>Token: </b>" + tokenName + "</p>";
        output += "</div>";
        sendChat("GM", output);
    },
    
    outputState = function(msg, tokenName) {
        var output = "/w GM ";
        output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
        output += "<p> ShareVision is currently turned " + msg + " for</p>";
        output += "<p><b>Token: </b>" + tokenName + "</p>";
        output += "</div>";
        sendChat("GM", output);
    },

    getVisionPair = function(id) {
        var vision;
        _.find(state.ShareVision.vision,function(slaveid,masterid){
            if(id === masterid || id === slaveid) {
                vision = {
                    master: getObj('graphic',masterid),
                    slave: getObj('graphic',slaveid)
                };
                vision.attribute = findObjs({
                    type: 'attribute',
                    name: 'vision',
                    characterid: vision.master && vision.master.get('represents')
                })[0] || {set:function(){}};

                return true;
            }
            return false;
        });
        return vision;
    },

    getVision = function(id) {
        var vision;
        _.find(state.ShareVision.vision,function(slaveid,masterid){
            if(id === masterid){
                vision = getObj('graphic',slaveid);
                return true;
            } 
            if(id === slaveid) {
                vision = getObj('graphic',masterid);
                return true;
            } 
            return false;
        });
        return vision;
    },

    createVision = function(id) {
        // get root obj
        var master = getObj('graphic',id),
            slave = getVision(id),
            layer,
            dim;
        if(!slave && master) {
            layer=( 'gmlayer' === master.get('layer') ? 'gmlayer' : 'objects');
            dim=(Math.max(master.get('height'),master.get('width')));
            slave = createObj('graphic',{
                imgsrc: visionURL,
                layer: layer,
                pageid: master.get('pageid'),
                top: master.get('top'),
                left: master.get('left'),
                height: dim,
                width: dim,
                controlledby: 'all',
                light_hassight: true,
                light_radius: master.get('light_radius'),
                light_dimradius: master.get('light_dimradius')
            });
            
            if('gmlayer' === layer || 'objects' === layer) {
                toBack(master);
            } else {
                toFront(master);
            }
            state.ShareVision.vision[master.id]=slave.id;
            outputUpdate("on",master.get('name'));
        }
    },

    removeVision = function(id) {
        var pair=getVisionPair(id);
        if (pair) {
            if(id === pair.master.id ) {
                pair.slave.remove();
                var master = getObj('graphic',pair.master.id);
            	outputUpdate("off",master.get('name'));
            }
            delete state.ShareVision.vision[pair.master.id];
        }
    },

    handleRemoveToken = function(obj) {
        removeVision(obj.id);
    },
    
    handleTokenChange = function(obj,prev) {
        var pair = getVisionPair(obj.id),
        layer,
        dim;
            if(pair) {
                if(pair.master.id === obj.id) {
                    layer=( 'gmlayer' === pair.master.get('layer') ? 'gmlayer' : 'objects');
                    dim=(Math.max(pair.master.get('height'),pair.master.get('width')));
                    pair.slave.set({
                        layer: layer,
                        top: pair.master.get('top'),
                        left: pair.master.get('left'),
                        height: dim,
                        width: dim
                    });
                    if('gmlayer' === layer || 'objects' === layer) {
                        toBack(pair.slave);
                    } 
                    else {
                        toFront(pair.slave);
                    }
                } 
                else {
                    if (pair.slave) {
                    	pair.slave.set({
							width: prev.width,
							height: prev.height,
							top: prev.top,
							left: prev.left,
							layer: prev.layer,
							flipv: prev.flipv,
							fliph: prev.fliph
						});
					}
					else {
						log('Funny. I tried to move a slave token, but it does not seem to exist anymore.');
						log('The offending token\'s name is' + pair.master.get('name'));
						log('Resetting vision status on master token');
						delete state.ShareVision.vision[pair.master.id];
					}
                }
            }
    },
    
    handleInput = function(msg) {
        var args, opts, token, character, characterId, attr, setting;
    
        if (msg.type !== "api") {
            return;
        }
    
        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!sharevision':            
                
                opts = {};
                for (var arg in args) {
                    var kv = args[arg].split(/\s+/);
                    if (kv[1]) {
                        opts[kv[0]] = kv[1];
                    } else {
                        opts[kv[0]] = true;
                    }
                }
                
                if (msg.selected && msg.selected.length) {
                    for (var sel in msg.selected) {
                    	var obj = getObj('graphic', msg.selected[sel]._id);
                    	if (obj) {
                    		// Ignore slave tokens.
							if (visionURL != obj.get('imgsrc')) {
								var pair = getVisionPair(obj.id);
								if (!pair && !opts.del && !opts.show) {
									createVision(obj.id);
								}
								if (pair && !opts.add && !opts.show) {
									removeVision(obj.id);
								}
								if (opts.show) {
									if(pair) {
										outputState("on",obj.get('name'));
									}
									else {
										outputState("off",obj.get('name'));
									}  
								}
							}
						}                     
                    }
                    return;
                }

        }  
    },
    
    registerEventHandlers = function() {
		on('chat:message', handleInput);
        on('change:graphic', handleTokenChange);
        on('destroy:graphic', handleRemoveToken);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';
    ShareVision.CheckInstall();
    ShareVision.RegisterEventHandlers();
});
