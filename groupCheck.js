var groupCheck = groupCheck || (function() {
	'use strict';
	var version = '0.5.3',
	// Config Start
	// Attribute list is for D&D 5E Shaped sheet
	
	die = "d20",			// Standard die to add to modifier. If constant, add 0d0 to
							// work around sendChat bug. E.g. 0d0 + 10.
	whisperToGM = false,	// Whisper results to GM or make them public by default.
	useTokenName = true,	// Uses name of the token if true, character name if false.
	alwaysRoll2 = false,	// Always roll two dice.
	useRollSetting = false, // Use 5E Shaped integrated roll setting. If both this and
							// rollTwice are true, we will default to rollTwice.
	hideBonus = false,		// Hide boni to rolls and only display the final result.

	attrList = {
		'Strength Save': ['strength_saving_throw_mod'],
		'Dexterity Save': ['strength_saving_throw_mod'],
		'Constitution Save': ['constitution_saving_throw_mod'],
		'Intelligence Save': ['intelligence_saving_throw_mod'],
		'Wisdom Save': ['wisdom_saving_throw_mod'],
		'Charisma Save': ['charisma_saving_throw_mod'],
//		'Fortitude Save': ['fortitude_saving_throw_mod'],
//		'Reflex Save': ['reflex_saving_throw_mod'],
//		'Will Save': ['will_saving_throw_mod'],
		'Strength Check': ['strength_check_mod_formula'],
		'Dexterity Check': ['dexterity_check_mod_formula'],
		'Constitution Check': ['constitution_check_mod_formula'],
		'Intelligence Check': ['intelligence_check_mod_formula'],
		'Wisdom Check': ['wisdom_check_mod_formula'],
		'Charisma Check': ['charisma_check_mod_formula'],
		'Acrobatics': ['repeating_skill_$0_formula'],
		'Animal Handling': ['repeating_skill_$1_formula'],
		'Arcana': ['repeating_skill_$2_formula'],
		'Athletics': ['repeating_skill_$3_formula'],
		'Deception': ['repeating_skill_$4_formula'],
		'History': ['repeating_skill_$5_formula'],
		'Insight': ['repeating_skill_$6_formula'],
		'Intimidation': ['repeating_skill_$7_formula'],
		'Investigation': ['repeating_skill_$8_formula'],
		'Medicine': ['repeating_skill_$9_formula'],
		'Nature': ['repeating_skill_$10_formula'],
		'Perception': ['repeating_skill_$11_formula'],
		'Performance': ['repeating_skill_$12_formula'],
		'Persuasion': ['repeating_skill_$13_formula'],
		'Religion': ['repeating_skill_$14_formula'],
		'Sleight of Hand': ['repeating_skill_$15_formula'],
		'Stealth': ['repeating_skill_$16_formula'],
		'Survival': ['repeating_skill_$17_formula']
	},	
	
	// Config End
	
	checkInstall = function() {
		if (alwaysRoll2 && useRollSetting) {
			useRollSetting = false;
			log('groupCheck: Both rollTwice and useRollSetting are set to true. Defaulting to roll2.');
		}
		log('-=> groupCheck v'+version+' <=-');
	},
	
	printHelp = function(who) {
		var helpString;
		helpString = `/w ${who} `;
		helpString += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
		helpString += "<h2>groupCheck Help</h2>";
		helpString += "<p> Usage: !group-check [--GM|Public] --Check Name</p>";
		helpString += "";
		helpString += "<p>The following checks are available:<br>";
		for (var s in attrList) {
			helpString += `<b>${s}</b>, `
		}
		helpString += "</p></div>";
		sendChat(who, helpString, null, {noarchive:true});
	},
	
	handleError = function(who, errorMsg, opts) {
		var output = `/w ${who} `;
		output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
		output += "<h4>Error</h4>";
		output += "<p>"+errorMsg+"</p>";
		output += "Input was: <p>" + JSON.stringify(opts) + "</p>";
		output += "</div>";
		sendChat(who, output, null, {noarchive:true});
	},

	printCommandMenu = function(who, opts) {
		// create options
		var optsCommand,commandOutput;
		optsCommand = '';
		for (var s in opts) {
			optsCommand += `--${s} `; 
		}
		commandOutput = `/w ${who} `;
		commandOutput += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
		commandOutput += `<h3>Available commands:</h3>`;
		for (var s in attrList) {
			commandOutput += `[${s}](!group-check ${optsCommand}--${s})`;
		}
		commandOutput += `</div>`;
		sendChat(who, commandOutput, null, {noarchive:true});
		return;
	},
	
	addCharacterToOutput = function(id, rollSetting, roll2, dieUsed, attrMods, rollAppendix, rollPre, rollPost) {
	
		var token, character, characterId, roll2Once = false, name, totalMod = ``, output = ``;
		
		token = getObj('graphic', id);
		if (token) {
			characterId = token.get("represents");
			if (characterId) {
				character = getObj("character", characterId);
				if (rollSetting) {
					switch(getAttrByName(characterId,"roll_setting")) {
						case "{{ignore=[[0" :
							dieUsed = die;
							rollAppendix = ``;
							break;
						case "adv {{ignore=[[0":
							dieUsed = "2d20kh1";
							rollAppendix = ` (Advantage)`;
							break;
						case "dis {{ignore=[[0" :
							dieUsed = "2d20kl1";
							rollAppendix = ` (Disadvantage)`;
							break;
						default:
							dieUsed = die;
							rollAppendix = ``;
							roll2Once = true;
					} 
				}
				if (useTokenName) {
					name = token.get("name");
				}
				else {
					name = character.get("name");
				}
			
				for (var s in attrMods) {
					totalMod += ` + @{${character.get("name")}|${attrMods[s]}}`;
				}
		
				if (roll2 || roll2Once) {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}`;
					output += ` | ${rollPre}${dieUsed} ${totalMod}${rollPost}</p>`;
					roll2Once = false;
				} else {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}${rollAppendix}</p>`;
				}
			}
		}
		return output;
	},
	
	handleInput = function(msg) {
		var args, opts = {}, attr, attrMods, dieUsed = die, rollAppendix = ``, output = ``;
		var rollPre = '[[', rollPost = ']]';
		
		if (msg.type !== "api") {
			return;
		}
	
		args = msg.content.split(/\s+--/);
		switch(args.shift()) {
			case '!group-check':
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
						attrMods = attrList[s];
					}
				}
				
				if (!attr) {
					printCommandMenu(msg.who,opts);
					return;
				}
				
				if ((whisperToGM || opts.GM) && !opts.Public) {
					output += `/w GM `;
				}
				
				output += `<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">`;
				output += `<h3>${attr}</h3>`;
				output += `<br>`;
				
				if (opts.adv && !opts.roll2) {
					dieUsed = "2d20kh1";
					rollAppendix = " (Advantage)";
					
				} else if (opts.disadv && !opts.roll2) {
					dieUsed = "2d20kl1";
					rollAppendix = " (Disadvantage)";
				}
				
				if ((hideBonus && !opts.showbonus) || opts.hidebonus) {
					rollPre= '[[[[';
					rollPost= ']]]]';
				}
				
				var rollSetting = (useRollSetting || opts.rollsetting) && !opts.roll2 && !opts.disadv && !opts.adv;
				var roll2 = opts.roll2 || (alwaysRoll2 && !opts.rollsetting && !opts.adv && !opts.disadv);
				
				if (msg.selected && msg.selected.length) {
					for (var sel in msg.selected) {						   
						output += addCharacterToOutput(msg.selected[sel]._id, rollSetting, roll2, dieUsed, attrMods, rollAppendix, rollPre, rollPost);
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
