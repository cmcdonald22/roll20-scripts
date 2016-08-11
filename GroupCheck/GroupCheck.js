var groupCheck = groupCheck || (function() {
    'use strict';
    var version = '0.6.2',
	// Config Start
	// Attribute list is for D&D 5E Shaped sheet

	die = "d20",			// Standard die to add to modifier. If constant, add 0d0 to
							// work around sendChat bug. E.g. 0d0 + 10.
	die_adv = "2d20kh1",	// Die for advantage
	die_dis = "2d20kl1",	// Die for disadvantage
	whisperToGM = false,	// Whisper results to GM or make them public by default.
	useTokenName = true,	// Uses name of the token if true, character name if false.
	alwaysRoll2 = false,	// Always roll two dice.
	useRollSetting = false, // Use 5E Shaped integrated roll setting. If both this and
							// rollTwice are true, we will default to rollTwice.
	hideBonus = false,		// Hide boni to rolls and only display the final result.

	attrList = {
		'Strength Save': ['strength_saving_throw_mod'],
		'Dexterity Save': ['dexterity_saving_throw_mod'],
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
		sendChat(who, helpString);
	},

	handleError = function(who, errorMsg, opts) {
		var output = `/w ${who} `;
		output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
		output += "<h4>Error</h4>";
		output += "<p>"+errorMsg+"</p>";
		output += "Input was: <p>" + JSON.stringify(opts) + "</p>";
		output += "</div>";
		sendChat(who, output);
	},

	printCommandMenu = function(who, opts) {
		// create options
		var optsCommand,commandOutput;
		optsCommand = '';
		for (var s in opts) {
			if (opts.s === true) {
				optsCommand += `--${s} `;
			} else {
				optsCommand += `--${s} ${opts.s} `
			}
		}
		commandOutput = `/w ${who} `;
		commandOutput += `<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">`;
		commandOutput += `<h3>Available commands:</h3>`;
		for (var s in attrList) {
			commandOutput += `[${s}](!group-check ${optsCommand}--${s})`;
		}
		commandOutput += `</div>`;
		sendChat(who, commandOutput);
		return;
	},

	addCharacterToOutput = function(tokenId, rollSetting, roll2, dieUsed, attrMods, rollAppendix, rollPre, rollPost, fallback, globalMod) {
		var token, character, characterId, roll2Once = false, name, totalMod = ``, output = ``;
		token = getObj('graphic', tokenId);
		if (token) {
			characterId = token.get("represents");
			if (characterId) {
				character = getObj("character", characterId);
				if (rollSetting) {
					switch(getAttrByName(characterId,"roll_setting")) {
						case "{{ignore=[[0" :
							break;
						case "adv {{ignore=[[0":
							dieUsed = die_adv;
							rollAppendix = ` (Advantage)`;
							break;
						case "dis {{ignore=[[0" :
							dieUsed = die_dis;
							rollAppendix = ` (Disadvantage)`;
							break;
						default:
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
				if (globalMod) {
					totalMod += ` + ${globalMod}[global modifier]`;
				}

				if (roll2 || roll2Once) {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}`;
					output += ` | ${rollPre}${dieUsed} ${totalMod}${rollPost}</p>`;
				} else {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}${rollAppendix}</p>`;
				}
			}
			else if (fallback) {					// Do this if token does not represent a character and fallback is active
				if (token.get("name") !== '') {
					name = token.get("name");
				} else {
					name = `<img src='${token.get("imgsrc")}' height="35" width="35">`;
				}
				if (globalMod) {
					fallback += ` + ${globalMod}[global modifier]`;
				}
				if (roll2) {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} + ${fallback}${rollPost}`;
					output += ` | ${rollPre}${dieUsed} + ${fallback}${rollPost}</p>`;
				} else {
					output += `<p><b>${name}:</b> ${rollPre}${dieUsed} + ${fallback}${rollPost}${rollAppendix}</p>`;
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
				// Read options
				for (var k in args) {
					var kv = args[k].split(/\s(.+)/);
					if (kv[1] && (kv[0] === 'fallback' || kv[0] === 'custom' || kv[0] === 'die' || kv[0] === 'globalmod')) {
						opts[kv[0]] = kv[1];
					} else {
						opts[args[k]] = true;
					}
				}

				// Help
				if (opts.help) {
					printHelp(msg.who);
					return;
				}

				// Look for attribute supplied
				for (var s in attrList) {
					if (opts[s]) {
						attr = s;
						attrMods = attrList[s];
					}
				}

				// Handle custom modifier
				if (opts.custom) {
					var kv = opts.custom.split(/\s*,\s*/);
					if (kv.length < 2) {
						handleError(msg.who,"Custom roll format invalid", args);
						return;
					}
					attr = kv.shift();
					attrMods = kv;
				}

				// Print menu if we don't know what to roll
				if (!attr && !opts.custom) {
					printCommandMenu(msg.who,opts);
					return;
				}

				// Whisper output if desired
				if ((whisperToGM || opts.GM) && !opts.Public) {
					output += `/w GM `;
				}

				// Output preamble
				output += `<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">`;
				output += `<h3>${attr}</h3>`;
				output += `<br>`;

				// Handle custom die. Ignored if rolling with advantage or disadvantage.
				if (opts.die) {
					dieUsed = opts.die;
				}

				// Handle advantage and disadvantage.
				if (opts.adv && !opts.roll2) {
					dieUsed = die_adv;
					rollAppendix = " (Advantage)";
				} else if (opts.disadv && !opts.roll2) {
					dieUsed = die_dis;
					rollAppendix = " (Disadvantage)";
				}

				// Handle bonus hiding
				if ((hideBonus && !opts.showbonus) || opts.hidebonus) {
					rollPre= '[[[[';
					rollPost= ']]]]';
				}

				var rollSetting = (useRollSetting || opts.rollsetting) && !opts.roll2 && !opts.disadv && !opts.adv;
				var roll2 = opts.roll2 || (alwaysRoll2 && !opts.rollsetting && !opts.adv && !opts.disadv);

				if (msg.selected && msg.selected.length) {
					for (var sel in msg.selected) {
						output += addCharacterToOutput(msg.selected[sel]._id, rollSetting, roll2, dieUsed, attrMods, rollAppendix, rollPre, rollPost, opts.fallback, opts.globalmod);
					}
				}

				output += `</div>`;
				sendChat(msg.who, output);
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
