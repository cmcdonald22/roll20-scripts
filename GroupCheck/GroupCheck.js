var groupCheck = groupCheck || (function() {
    'use strict';
    const version = '0.7.1', stateVersion = 1,

	// Data variables
	importData = {
		'5E-Shaped' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'mod' : ['strength_saving_throw_mod'] },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'mod' : ['dexterity_saving_throw_mod'] },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'mod' : ['constitution_saving_throw_mod'] },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'mod' : ['intelligence_saving_throw_mod'] },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'mod' : ['wisdom_saving_throw_mod'] },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'mod' : ['charisma_saving_throw_mod'] },
//			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'mod' : ['fortitude_saving_throw_mod'] },
//			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'mod' : ['reflex_saving_throw_mod'] },
//			'Will Save': { 'name' : 'Will Saving Throw', 'mod' : ['will_saving_throw_mod'] },
			'Strength Check': { 'name' : 'Strength Check', 'mod' : ['strength_check_mod_formula'] },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'mod' : ['dexterity_check_mod_formula'] },
			'Constitution Check': { 'name' : 'Constitution Check', 'mod' : ['constitution_check_mod_formula'] },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'mod' : ['intelligence_check_mod_formula'] },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'mod' : ['wisdom_check_mod_formula'] },
			'Charisma Check': { 'name' : 'Charisma Check', 'mod' : ['charisma_check_mod_formula'] },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'mod' : ['repeating_skill_$0_formula'] },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'mod' : ['repeating_skill_$1_formula'] },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'mod' : ['repeating_skill_$2_formula'] },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'mod' : ['repeating_skill_$3_formula'] },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'mod' : ['repeating_skill_$4_formula'] },
			'History': { 'name' : 'Intelligence (History) Check', 'mod' : ['repeating_skill_$5_formula'] },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'mod' : ['repeating_skill_$6_formula'] },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'mod' : ['repeating_skill_$7_formula'] },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'mod' : ['repeating_skill_$8_formula'] },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'mod' : ['repeating_skill_$9_formula'] },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'mod' : ['repeating_skill_$10_formula'] },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'mod' : ['repeating_skill_$11_formula'] },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'mod' : ['repeating_skill_$12_formula'] },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'mod' : ['repeating_skill_$13_formula'] },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'mod' : ['repeating_skill_$14_formula'] },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'mod' : ['repeating_skill_$15_formula'] },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'mod' : ['repeating_skill_$16_formula'] },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'mod' : ['repeating_skill_$17_formula'] },
			'AC' : { 'name' : 'Armor Class', 'mod' : ['AC'], 'die' : '0d0'}
		},
		'Pathfinder' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'mod' : ['Fort'] },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'mod' : ['Ref'] },
			'Will Save': { 'name' : 'Will Saving Throw', 'mod' : ['Will'] },
			'Strength Check': { 'name' : 'Strength Check', 'mod' : ['STR-mod','checks-cond'] },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'mod' : ['DEX-mod','checks-cond'] },
			'Constitution Check': { 'name' : 'Constitution Check', 'mod' : ['CON-mod','checks-cond'] },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'mod' : ['INT-mod','checks-cond'] },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'mod' : ['WIS-mod','checks-cond'] },
			'Charisma Check': { 'name' : 'Charisma Check', 'mod' : ['CHA-mod','checks-cond'] },
			'Perception': { 'name' : 'Perception Check', 'mod' : ['Perception']},
			'Stealth' : { 'name' : 'Stealth Check', 'mod' : ['Stealth']},
			'AC' : { 'name' : 'Armor Class', 'mod' : ['AC'], 'die' : '0d0'}
		},
		'5E-OGL' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'mod' : ['strength_save_bonus','globalsavemod'] },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'mod' : ['dexterity_save_bonus','globalsavemod'] },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'mod' : ['constitution_save_bonus','globalsavemod'] },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'mod' : ['intelligence_save_bonus','globalsavemod'] },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'mod' : ['wisdom_save_bonus','globalsavemod'] },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'mod' : ['charisma_save_bonus','globalsavemod'] },
			'Strength Check': { 'name' : 'Strength Check', 'mod' : ['strength_mod'] },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'mod' : ['dexterity_mod'] },
			'Constitution Check': { 'name' : 'Constitution Check', 'mod' : ['constitution_mod'] },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'mod' : ['intelligence_mod'] },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'mod' : ['wisdom_mod'] },
			'Charisma Check': { 'name' : 'Charisma Check', 'mod' : ['charisma_mod'] },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'mod' : ['acrobatics_bonus'] },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'mod' : ['animal_handling_bonus'] },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'mod' : ['arcana_bonus'] },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'mod' : ['athletics_bonus'] },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'mod' : ['deception_bonus'] },
			'History': { 'name' : 'Intelligence (History) Check', 'mod' : ['history_bonus'] },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'mod' : ['insight_bonus'] },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'mod' : ['intimidation_bonus'] },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'mod' : ['investigation_bonus'] },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'mod' : ['medicine_bonus'] },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'mod' : ['nature_bonus'] },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'mod' : ['perception_bonus'] },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'mod' : ['performance_bonus'] },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'mod' : ['persuasion_bonus'] },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'mod' : ['religion_bonus'] },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'mod' : ['sleight_of_hand_bonus'] },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'mod' : ['stealth_bonus'] },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'mod' : ['survival_bonus'] },
			'AC' : { 'name' : 'Armor Class', 'mod' : ['AC'], 'die' : '0d0'}
		},
		'3.5' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'mod' : ['fortitude'] },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'mod' : ['reflex'] },
			'Will Save': { 'name' : 'Will Saving Throw', 'mod' : ['wisdom'] },
			'Strength Check': { 'name' : 'Strength Check', 'mod' : ['str-mod'] },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'mod' : ['dex-mod'] },
			'Constitution Check': { 'name' : 'Constitution Check', 'mod' : ['con-mod'] },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'mod' : ['int-mod'] },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'mod' : ['wis-mod'] },
			'Charisma Check': { 'name' : 'Charisma Check', 'mod' : ['cha-mod'] },
			'Hide' : { 'name' : 'Hide Check', 'mod' : ['hide']},
			'Listen': { 'name' : 'Listen Check', 'mod' : ['listen']},
			'Move Silently' : { 'name' : 'Move Silently Check', 'mod' : ['movesilent']},
			'Spot': { 'name' : 'Spot Check', 'mod' : ['spot']},
			'AC' : { 'name' : 'Armor Class', 'mod' : ['armorclass'], 'die' : '0d0'}
		}
	},

	defaultOptions = {
		'die': 'd20',
		'die_adv': '2d20kh1',
		'die_dis': '2d20kl1',
		'ro': 'roll1',
		'whisper': false,
		'usetokenname': true,
		'hidebonus': false
	},

	rollOptions = ['roll1', 'roll2', 'adv', 'dis', 'rollsetting'],

	// Setup
	checkInstall = function() {
		if (!state.groupCheck) {
			initializeState();
		}
		log('-=> groupCheck v'+version+' <=-');
	},

	initializeState = function() {
		state.groupCheck = {
			'checkList' : {},
			'options' : defaultOptions,
			'version' : stateVersion
		};
		log('-=> groupCheck initialized with default settings!<=-');
	},

	// Utility functions
	safeReadJSON = function (string) {
	    try {
        	let o = JSON.parse(string);
        	if (o && typeof o === 'object') {
            	return o;
        	}
    	}
    	catch (e) { }
   		return false;
	},

	sendChatNoarchive = function(who, string) {
		sendChat(who, string, null, {noarchive:true});
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		if (match) {
			return match[1];
		} else {
			return who;
		}
	},

	handleError = function(who, errorMsg) {
		let output = '/w "' + who +
			'" <div style="border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;">' +
			'<h4>Error</h4><p>' + errorMsg + '</p></div>';
		sendChatNoarchive('GroupCheck', output);
	},

	// TODO: Make the help actually useful.
	printHelp = function(who) {
		let helpString = '/w "' + who + '" No help, sorry. Please refer to the documentation.';
		sendChatNoarchive('GroupCheck', helpString);
	},

	printConfigHelp = function(who) {
		let helpString = '/w "' + who + '" No help, sorry. Please refer to the documentation.';
		sendChatNoarchive('GroupCheck', helpString);
	},

	printCommandMenu = function(who, opts) {
		// create options
		let optsCommand = '',commandOutput;
		_.each(opts, function (value, key) {
			if (typeof value === 'boolean') {
				optsCommand += `--${key} `;
			}
			if (typeof value === 'string') {
				optsCommand += `--${key} ${value} `;
			}
		});
		commandOutput = '/w "' + who;
		commandOutput += '" <div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">';
		commandOutput += '<h3>Available commands:</h3>';
		for (let s in state.groupCheck.checkList) {
			commandOutput += `[${s}](!group-check ${optsCommand} --${s})`;
		}
		commandOutput += '</div>';
		sendChatNoarchive('GroupCheck', commandOutput);
		return;
	},

	getConfigTable = function() {
		let die, name, mod;
		let output = '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Current Options</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Name</b></td><td><b>Value</td></b></tr>';
		_.each(state.groupCheck.options, function(value, key) {
			output += '<tr><td>'+key+'</td><td>'+value+'</td></tr>';
		});
		output += '</table></div><br>';

		output += '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Checks</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Command</b></td><td><b>Name</td></b><td><b>Modifiers</b></td><td><b>Die</b></td></tr>';
		_.each(state.groupCheck.checkList, function(value, key) {
			name = value.name;
			mod = value.mod.join(', ');
			if (value.die) {
				die = value.die;
			} else {
				die = '';
			}
			output += '<tr><td>'+key+'</td><td>'+name+'</td><td>'+mod+'</td><td>'+die+'</td></tr>';
		});
		output += '</table></div>';
		return output;
	},

	getRollOption = function(charid) {
		switch(getAttrByName(charid,"roll_setting")) {
			case "{{ignore=[[0" :
				return 'roll1';
				break;
			case "adv {{ignore=[[0":
				return 'adv';
				break;
			case "dis {{ignore=[[0" :
				return 'dis';
				break;
		}
		return 'roll2';
	},

	addCharacterToOutput = function(selected, checkMods, opts, rollPre, rollPost) {
		let token, character, characterId, output = '', name, rollOption,
			totalMod = '', dieUsed, rollAppendix = '', charName;
		if (selected._type === 'graphic') {
			token = getObj('graphic', selected._id);
			characterId = token.get('represents');

			if (opts.ro === 'rollsetting') {
				if (characterId !== '') {
					rollOption = getRollOption(characterId);
				} else {
					rollOption = 'roll2';
				}
			} else {
				rollOption = opts.ro;
			}
			switch(rollOption) {
				case 'roll2' :
					dieUsed = opts.die;
					break;
				case 'adv' :
					dieUsed = opts.die_adv;
					rollAppendix = ' (Advantage)';
					break;
				case 'dis' :
					dieUsed = opts.die_dis;
					rollAppendix = ' (Disadvantage)';
					break;
				case 'roll1' :
					dieUsed = opts.die;
					break;
			}

			character = getObj('character', characterId);
			if (character) {
				charName = character.get('name');
				if (opts.usetokenname) {
					name = token.get('name');
				}
				else {
					name = charName;
				}
				checkMods.forEach(function (mod) {
					totalMod += ` + @{${charName}|${mod}}`;
				});
			}
			else if (opts.fallback) {
				name = token.get('name') || `<img src="${token.get('imgsrc')}" height="35" width="35">`;
				totalMod = ` +(${opts.fallback}[fallback])`;
			}
			else {
				return '';
			}

			if (opts.globalmod) {
					totalMod += ` + ${opts.globalmod}[global modifier]`;
			}
			if (rollOption !== 'roll2') {
					output = `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}${rollAppendix}</p>`;
			}
			else {
				output = `<p><b>${name}:</b> ${rollPre}${dieUsed} ${totalMod}${rollPost}`
					+ ` | ${rollPre}${dieUsed} ${totalMod}${rollPost}</p>`;
			}
		}
		return output;
	},

	processOpts = function(content, hasValue) {
		// Input:	content - string of the form command --opts1 --opts2  value --opts3.
		//					values come separated by whitespace.
		//			hasValue - array of all options which come with a value
		// Output:	object containing key:true if key is not in hasValue. and containing
		//			key:value otherwise
		var args, kv, opts = {};
		args = _.rest(content.split(/\s+--/));
		for (var k in args) {
			kv = args[k].split(/\s(.+)/);
			if (_.contains(hasValue, kv[0])) {
				opts[kv[0]] = kv[1];
			}
			else {
				opts[args[k]] = true;
			}
		}
		return opts;
	},

	handleConfig = function (msg) {
		const hasValueConfig = ['import','add','delete','set'];
		const valueOptions = ['fallback','die','die_adv','die_dis','globalmod'];
		const booleanOptions = ['whisper', 'usetokenname', 'hidebonus'];
		const booleanOptionsNegative = ['public', 'usecharname', 'showbonus'];
		let opts = processOpts(msg.content, hasValueConfig);
		let who = getPlayerName(msg.who), output;

		if (!playerIsGM(msg.playerid)) {
			sendChatNoarchive('GroupCheck', whisper + 'Permission denied.');
			return;
		}

		if (opts.import) {
			if (_.has(importData,opts.import)) {
				_.extend(state.groupCheck.checkList, importData[opts.import]);
				output = 'Data set ' + opts.import + ' imported.';
			} else {
				handleError(who, 'Dataset ' + opts.import + ' not found.');
			}
		}
		else if (opts.add) {
			let data = safeReadJSON(opts.add);
			if (_.isObject(data)) {
				_.each(data, function (value, key) {
					if (!(_.isObject(value) && _.has(value, 'name') && _.has(value,'mod') && _.isArray(value.mod))) {
						delete data[key];
					}
				});
				_.extend(state.groupCheck.checkList, data);
				output = 'Checks added. The imported JSON was ' + JSON.stringify(data);
			} else {
				handleError(who, 'Error reading input.');
			}
		}
		else if (opts.delete) {
			if (_.has(state.groupCheck.checkList, opts.delete)) {
				delete state.groupCheck.checkList[opts.delete];
				output = 'Check ' + opts.delete + ' deleted.';
			} else {
				handleError(who, 'Check called ' + opts.delete+ ' not found.');
			}
		}
		else if (opts.clear) {
			state.groupCheck.checkList = {};
			output = 'All checks cleared.';
		}
		else if (opts.set) {
			const kv = opts.set.split(/\s(.+)/);
			if (_.indexOf(valueOptions, kv[0]) !== -1) {
				state.groupCheck.options[kv[0]] = kv[1];
				output = 'Option ' + kv[0] + ' set to ' + kv[1] + '.';
			}
			else if (kv[0] === 'ro') {
				if (_.indexOf(rollOptions, kv[1]) !== -1) {
					state.groupCheck.options.ro = kv[1];
					output = 'Option ' + kv[0] + ' set to ' + kv[1] + '.';
				} else {
					handleError(who, 'Roll option ' + kv[1] + ' is invalid, sorry.');
					return;
				}
			}
			else if (_.indexOf(booleanOptions, kv[0]) !== -1) {
				state.groupCheck.options[kv[0]] = true;
				output = 'Option ' + kv[0] + ' set to ' + state.groupCheck.options[kv[0]] + '.';
			}
			else if (_.indexOf(booleanOptionsNegative, kv[0]) !== -1) {
				if (kv[0] === 'public') kv[0] = 'whisper';
				if (kv[0] === 'showbonus') kv[0] = 'hidebonus';
				if (kv[0] === 'usecharname') kv[0] = 'usetokenname';
				state.groupCheck.options[kv[0]] = false;
				output = 'Option ' + kv[0] + ' set to ' + state.groupCheck.options[kv[0]] + '.';
			}
			else {
				handleError(who, 'Command not understood.');
			}
		}
		else if (opts.defaults) {
			state.groupCheck.options = defaultOptions;
			output = 'All options reset to defaults.';
		}
		else if (opts.reset) {
			initializeState();
			output = 'Everything is reset to factory settings.';
		}
		else if (opts.show) {
			output = getConfigTable();
		}
		else {
			printConfigHelp(who);
		}

		if (output) {
			sendChatNoarchive('GroupCheck', '/w "' + who + '" ' + output);
		}

		return;
	},

	handleOutput = function (msg) {
		const hasValue = ['fallback','custom','die','die_adv','die_dis','globalmod','ro'];
		let checkCmd, checkName, checkMods, output = '', rollPre, rollPost;
		let who = getPlayerName(msg.who);

		// Options processing
		let opts = processOpts(msg.content, hasValue);
		checkCmd = _.intersection(_.keys(state.groupCheck.checkList), _.keys(opts))[0];
		if (checkCmd) {
			checkMods = state.groupCheck.checkList[checkCmd].mod;
			opts.die = opts.die || state.groupCheck.checkList[checkCmd].die;
			checkName = state.groupCheck.checkList[checkCmd].name;
		}
		if (opts.showbonus) {
			opts.hidebonus = false;
			delete opts.showbonus;
		}
		if (opts.usecharname) {
			opts.usetokenname = false;
			delete opts.usecharname;
		}
		if (opts.public) {
			opts.whisper = false;
			delete opts.public;
		}
		opts = _.defaults(opts, state.groupCheck.options);

		// Help
		if (opts.help) {
			printHelp(who);
			return;
		}

		if (_.indexOf(rollOptions, opts.ro) === -1) {
			handleError(who,'Roll option ' + opts.ro + ' is invalid, sorry.');
			return;
		}
		// Handle custom modifier
		if (opts.custom) {
			let kv = opts.custom.split(/\s*,\s*/);
			if (kv.length < 2) {
				handleError(who,"Custom roll format invalid");
				return;
			}
			checkName = kv.shift();
			checkMods = kv;
			checkCmd = true;
		}

		// Print menu if we don't know what to roll
		if (!checkCmd) {
			printCommandMenu(who,opts);
			return;
		}

		// Output
		if (opts.whisper) {
			output += '/w GM ';
		}

		if (opts.hidebonus) {
				rollPre = '[[[['; rollPost = ']]]]';
			}
		else {
				rollPre = '[['; rollPost = ']]';
		}


		output += '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">'
		+ '<h3>'+ checkName +'</h3>'
		+ '<br>';
		if (msg.selected) {
			msg.selected.forEach(function(obj) {
					output += addCharacterToOutput(obj, checkMods, opts, rollPre, rollPost);
			});
		}

		output += '</div>';
		sendChat(who, output);
	},

	handleInput = function(msg) {
		if (msg.type === "api" && msg.content.search(/^!group-check\b/) != -1 && msg.content.search(/^!group-check-config\b/) == -1) {
			handleOutput(msg);
		}
		else if (msg.type === "api" && msg.content.search(/^!group-check-config\b/) != -1) {
			handleConfig(msg);
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
