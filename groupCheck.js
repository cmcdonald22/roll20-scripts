var groupCheck = groupCheck || (function() {
	'use strict';
	var version = '0.2',
    	
    	// Config Start
	// Attribute list is for D&D 5E Shaped sheet
	
	attrList = {
		'Strength Save': 'strength_saving_throw_mod',
		'Dexterity Save': 'dexterity_saving_throw_mod',
		'Constitution Save': 'constitution_saving_throw_mod',
		'IntelligenceS Save': 'intelligence_saving_throw_mod',
		'Wisdom Save': 'wisdom_saving_throw_mod',
		'Charisma Save': 'charisma_saving_throw_mod',
		'Fortitude Save': 'fortitude_saving_throw_mod',
		'Reflex Save': 'reflex_saving_throw_mod',
		'Will Save': 'will_saving_throw_mod'
	},
	
	die = "d20",				// standard die to add to modifier
	whisperToGM = false,    	// whisper results to GM or make them public
	useTokenName = true,        // Uses name of the token if true, character name if false.
	
	// Config End
	
	checkInstall = function() {
		log('groupSaves v'+version+' is ready!');
	},
	
	printHelp = function(who) {
		var helpString;
		helpString = "Help not available currently. Sorry."
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
		var args, opts, token, character, characterId, attr, attrMod, name;
	
		if (msg.type !== "api") {
			return;
		}
	
		args = msg.content.split(/\s+--/);
		switch(args.shift()) {
			case '!group-check':
				if (args.length > 1) {
					handleError(msg.who, "Do not supply more than one argument.", args);
					return;
				}
				opts = {};
				opts[args[0]] = true;

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
					handleError(msg.who, "No valid argument supplied", opts);
					return;
				}
				
				var output = ``;
				if (whisperToGM) {
					output += `/w GM `;
				}
				output += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
				output += `<h3>${attr}s:</h3>`;
                		output += `<br>`;

				if (msg.selected && msg.selected.length) {
					for (var sel in msg.selected) {						   
						token = getObj('graphic', msg.selected[sel]._id);
						characterId = token.get("represents");
						
						if (characterId) {
							character = getObj("character", characterId);
							if (useTokenName) {
								name = token.get("name");
							}
							else {
								name = character.get("name");
							}
							output += `<p><b>${name}:</b> [[0d0 + ${die} + @{${character.get("name")}|${attrMod}}]]</p>`;
						} 
					}
				}
				
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
	
	groupCheck.CheckInstall();
	groupCheck.RegisterEventHandlers();
});
