var groupCheck = groupCheck || (function() {
	'use strict';
	var version = '0.3.1',
    commandOutput = ``,
    // Config Start
	// Attribute list is for D&D 5E Shaped sheet
	
	attrList = {
		'Strength Save': 'strength_saving_throw_mod',
		'Dexterity Save': 'dexterity_saving_throw_mod',
		'Constitution Save': 'constitution_saving_throw_mod',
		'Intelligence Save': 'intelligence_saving_throw_mod',
		'Wisdom Save': 'wisdom_saving_throw_mod',
		'Charisma Save': 'charisma_saving_throw_mod',
//		'Fortitude Save': 'fortitude_saving_throw_mod',
//		'Reflex Save': 'reflex_saving_throw_mod',
//		'Will Save': 'will_saving_throw_mod',
		'Strength Check': 'strength_check_mod_formula',
		'Dexterity Check': 'dexterity_check_mod_formula',
		'Constitution Check': 'constitution_check_mod_formula',
		'Intelligence Check': 'intelligence_check_mod_formula',
		'Wisdom Check': 'wisdom_check_mod_formula',
		'Charisma Check': 'charisma_check_mod_formula',
		'Acrobatics': 'repeating_skill_$0_formula',
		'Animal Handling': 'repeating_skill_$1_formula',
		'Arcana': 'repeating_skill_$2_formula',
		'Athletics': 'repeating_skill_$3_formula',
		'Deception': 'repeating_skill_$4_formula',
		'History': 'repeating_skill_$5_formula',
		'Insight': 'repeating_skill_$6_formula',
		'Intimidation': 'repeating_skill_$7_formula',
		'Investigation': 'repeating_skill_$8_formula',
		'Medicine': 'repeating_skill_$9_formula',
		'Nature': 'repeating_skill_$10_formula',
		'Perception': 'repeating_skill_$11_formula',
		'Performance': 'repeating_skill_$12_formula',
		'Persuasion': 'repeating_skill_$13_formula',
		'Religion': 'repeating_skill_$14_formula',
		'Sleight of Hand': 'repeating_skill_$15_formula',
		'Stealth': 'repeating_skill_$16_formula',
		'Survival': 'repeating_skill_$17_formula'
	},
	
	die = "d20",			// standard die to add to modifier
	whisperToGM = false,    // whisper results to GM or make them public
	useTokenName = true,	// Uses name of the token if true, character name if false.
	rollTwice = false,		// Always roll twice to use 5E advantage/disadvantage
    
	// Config End
	
	checkInstall = function() {
		commandOutput += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
		commandOutput += `<h3>Available commands:</h3>`;
		for (var s in attrList) {
			commandOutput += `[${s}](!group-check --${s})`
		}
		commandOutput += `</div>`;
		log('groupSaves v'+version+' is ready!');
	},
	
	printHelp = function(who) {
		var helpString;
		helpString = "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
		helpString += "<h2>groupCheck Help</h2>";
		helpString += "<p> Usage: !group-check [--GM|Public] --Check Name</p>";
		helpString += "";
		helpString += "<p>The following checks are available:<br>";
		for (var s in attrList) {
			helpString += `<b>${s}</b>, `
		}
		helpString += "</p></div>";
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
		var args, opts, token, character, characterId, attr, attrMod, name, dieUsed;
	
		if (msg.type !== "api") {
			return;
		}
	
		args = msg.content.split(/\s+--/);
		switch(args.shift()) {
			case '!group-check':
				opts = {};
				for (var arg in args) {
					opts[args[arg]] = true;
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
                    sendChat(msg.who, commandOutput);
					return;
				}
				
				var output = ``;
				if ((whisperToGM || opts.GM) && !opts.Public) {
					output += `/w GM `;
				}
				output += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
				output += `<h3>${attr}:</h3>`;
                output += `<br>`;
                
                dieUsed = die;
                if (opts.adv) {
                    dieUsed = "2d20kh1";
                    output += `Rolls are at advantage.<br>`;
                } else if (opts.disadv) {
                    dieUsed = "2d20kl1";
                    output += `Rolls are at disadvantage.<br>`;
                }
                
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
						if (opts.roll2 || rollTwice) {
							output += `<p><b>${name}:</b> [[0d0 + ${dieUsed} + @{${character.get("name")}|${attrMod}}]]`;
							output += ` | [[0d0 + ${dieUsed} + @{${character.get("name")}|${attrMod}}]]</p>`;
						} else {
							output += `<p><b>${name}:</b> [[0d0 + ${dieUsed} + @{${character.get("name")}|${attrMod}}]]</p>`;
						}
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
