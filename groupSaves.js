var groupSaves = groupSaves || (function() {
    'use strict';
    
    var version = '0.1.0',
    sheetVersion = '5.0.0+',
   
    attrList = {
        'Strength': 'strength_saving_throw_mod',
        'Dexterity': 'dexterity_saving_throw_mod',
        'Constitution': 'constitution_saving_throw_mod',
        'Intelligence': 'intelligence_saving_throw_mod',
        'Wisdom': 'wisdom_saving_throw_mod',
        'Charisma': 'charisma_saving_throw_mod',
        'Fortitude': 'fortitude_saving_throw_mod',
        'Reflex': 'reflex_saving_throw_mod',
        'Will': 'will_saving_throw_mod'
    },
    
    var die = "d20",
    
    var whisper = true,
    
    checkInstall = function() {
        log('groupSaves v'+version+' for D&D 5E Reshaped '+sheetVersion+' is ready!');
    },

    escapeAttr = function(text) {
        return text.replace("{", "{").replace("@", "@").replace("}", "}")
    },
    
    printHelp = function(who) {
        var helpString;
         helpString = "Help not available currently."
        sendChat(who, "/w " + who + " " + helpString);
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
        var args, opts, token, character, characterId, attr, attrMod;
    
        if (msg.type !== "api") {
            return;
        }
    
        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!group-saves':            
                
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
    			
				for (var s in attrList) {
					if (opts[s]) {
						attr = s;
						attrMod = attrList[s];
					}
                }
                if (!attr) {
                	handleError(msg.who, "No argument supplied", opts);
                    return;
                }
				
				var output = ``;
                if (whisper) {
                    output += `/w GM `;
                }
        		output += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
        		output += `<h4> ${attr} Saves</h4>`;

        
                if (msg.selected && msg.selected.length) {
                    for (var sel in msg.selected) {                        
                        token = getObj('graphic', msg.selected[sel]._id);
                        //log('Selected token ' + JSON.stringify(token));
                        characterId = token.get("represents");
                        if (characterId) {
                            character = getObj("character", characterId);
                 		    output += `<p><b>${character.get("name")}:</b> [[0d0 + ${die} + @{${character.get("name")}|${attrMod}}]]</p>`; 
                        } 
                    }
                }
                
                //Summary output here.
                output += `</div>`;
                sendChat(msg.who, output);
            	return;
        } 
        return; 
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

    groupSaves.CheckInstall();
    groupSaves.RegisterEventHandlers();
});
