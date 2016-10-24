var groupCheck = groupCheck || (function() {
    'use strict';
    const version = '0.8.1', stateVersion = 2,
    // Configure roll appearance
    boxstyle = (header,content) => '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">'
    	+ header + '<p>' + content +'</p></div>',
    tablestyle = content => '<table style="padding: 3px; border-collapse: separate; width: 100%">'+content+'</table>',
    headerstyle = text => '<h3><div style="text-align:center">'+text+'</div></h3>',
    rowstyle = (name, roll) => '<tr style="padding 2px;">'+name+roll+'</tr>',
    namestyle = name => '<td style="padding: 2px; border-bottom: 1px solid #ddd"><b>'+name+'</b></td>',
    rollstyle = (formula, boundary, appendix) => '<td style="text-align:center; padding: 2px; border-bottom: 1px solid #ddd">'+boundary[0]+formula+boundary[1]+appendix+'</td>',
    roll2style = (f,b,a) => rollstyle(f,b,a) + rollstyle(f,b,a),

	// Data variables
	importData = {
		'5E-Shaped' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : 'd20 + %strength_saving_throw_mod%' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : 'd20 + %dexterity_saving_throw_mod%' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : 'd20 + %constitution_saving_throw_mod%' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : 'd20 + %intelligence_saving_throw_mod%' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : 'd20 + %wisdom_saving_throw_mod%' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : 'd20 + %charisma_saving_throw_mod%' },
//			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : 'd20 + %fortitude_saving_throw_mod%' },
//			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : 'd20 + %reflex_saving_throw_mod%' },
//			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : 'd20 + %will_saving_throw_mod%' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : 'd20 + %strength_check_mod_formula%' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : 'd20 + %dexterity_check_mod_formula%' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : 'd20 + %constitution_check_mod_formula%' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : 'd20 + %intelligence_check_mod_formula%' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : 'd20 + %wisdom_check_mod_formula%' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : 'd20 + %charisma_check_mod_formula%' },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'formula' : 'd20 + %repeating_skill_$0_formula%' },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'formula' : 'd20 + %repeating_skill_$1_formula%' },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'formula' : 'd20 + %repeating_skill_$2_formula%' },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'formula' : 'd20 + %repeating_skill_$3_formula%' },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'formula' : 'd20 + %repeating_skill_$4_formula%' },
			'History': { 'name' : 'Intelligence (History) Check', 'formula' : 'd20 + %repeating_skill_$5_formula%' },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'formula' : 'd20 + %repeating_skill_$6_formula%' },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'formula' : 'd20 + %repeating_skill_$7_formula%' },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'formula' : 'd20 + %repeating_skill_$8_formula%' },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'formula' : 'd20 + %repeating_skill_$9_formula%' },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'formula' : 'd20 + %repeating_skill_$10_formula%' },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'formula' : 'd20 + %repeating_skill_$11_formula%' },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'formula' : 'd20 + %repeating_skill_$12_formula%' },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'formula' : 'd20 + %repeating_skill_$13_formula%' },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'formula' : 'd20 + %repeating_skill_$14_formula%' },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'formula' : 'd20 + %repeating_skill_$15_formula%' },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'formula' : 'd20 + %repeating_skill_$16_formula%' },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'formula' : 'd20 + %repeating_skill_$17_formula%' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '0d0 + %AC%'}
		},
		'Pathfinder' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : 'd20 + %Fort%' },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : 'd20 + %Ref%' },
			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : 'd20 + %Will%' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : 'd20 + %STR-mod% + %checks-cond%' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : 'd20 + %DEX-mod% + %checks-cond%' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : 'd20 + %CON-mod% + %checks-cond%' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : 'd20 + %INT-mod% + %checks-cond%' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : 'd20 + %WIS-mod% + %checks-cond%' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : 'd20 + %CHA-mod% + %checks-cond%' },
			'Perception': { 'name' : 'Perception Check', 'formula' : 'd20 + %Perception%'},
			'Stealth' : { 'name' : 'Stealth Check', 'formula' : 'd20 + %Stealth%'},
			'AC' : { 'name' : 'Armor Class', 'formula' : '0d0+ %AC%'}
		},
		'5E-OGL' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : 'd20 + %strength_save_bonus% + %globalsavemod%' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : 'd20 + %dexterity_save_bonus% + %globalsavemod%' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : 'd20 + %constitution_save_bonus% + %globalsavemod%' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : 'd20 + %intelligence_save_bonus% + %globalsavemod%' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : 'd20 + %wisdom_save_bonus% + %globalsavemod%' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : 'd20 + %charisma_save_bonus% + %globalsavemod%' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : 'd20 + %strength_mod%' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : 'd20 + %dexterity_mod%' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : 'd20 + %constitution_mod%' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : 'd20 + %intelligence_mod%' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : 'd20 + %wisdom_mod%' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : 'd20 + %charisma_mod%' },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'formula' : 'd20 + %acrobatics_bonus%' },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'formula' : 'd20 + %animal_handling_bonus%' },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'formula' : 'd20 + %arcana_bonus%' },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'formula' : 'd20 + %athletics_bonus%' },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'formula' : 'd20 + %deception_bonus%' },
			'History': { 'name' : 'Intelligence (History) Check', 'formula' : 'd20 + %history_bonus%' },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'formula' : 'd20 + %insight_bonus%' },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'formula' : 'd20 + %intimidation_bonus%' },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'formula' : 'd20 + %investigation_bonus%' },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'formula' : 'd20 + %medicine_bonus%' },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'formula' : 'd20 + %nature_bonus%' },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'formula' : 'd20 + %perception_bonus%' },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'formula' : 'd20 + %performance_bonus%' },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'formula' : 'd20 + %persuasion_bonus%' },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'formula' : 'd20 + %religion_bonus%' },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'formula' : 'd20 + %sleight_of_hand_bonus%' },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'formula' : 'd20 + %stealth_bonus%' },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'formula' : 'd20 + %survival_bonus%' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '0d0 + %AC%' }
		},
		'3.5' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : 'd20 + %fortitude%' },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : 'd20 + %reflex%' },
			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : 'd20 + %wisdom%' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : 'd20 + %str-mod%' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : 'd20 + %dex-mod%' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : 'd20 + %con-mod%' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : 'd20 + %int-mod%' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : 'd20 + %wis-mod%' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : 'd20 + %cha-mod%' },
			'Hide' : { 'name' : 'Hide Check', 'formula' : 'd20 + %hide%' },
			'Listen': { 'name' : 'Listen Check', 'formula' : 'd20 + %listen%' },
			'Move Silently' : { 'name' : 'Move Silently Check', 'formula' : 'd20 + %movesilent%' },
			'Spot': { 'name' : 'Spot Check', 'formula' : 'd20 + %spot%' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '0d0 + %armorclass%' }
		}
	},

	defaultOptions = {
		'die_adv': '2d20kh1',
		'die_dis': '2d20kl1',
		'ro': 'roll1',
		'whisper': false,
		'usetokenname': true,
		'hideformula': false
	},

	rollOptions = ['roll1', 'roll2', 'adv', 'dis', 'rollsetting'],

	// Setup
	checkInstall = function() {
		if (!state.groupCheck) {
			initializeState();
		}
		else if (state.groupCheck.version < stateVersion) {
			updateState();
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

	updateState = function() {
		if (state.groupCheck.version == 1) {
			_.each(state.groupCheck.checkList, function(check) {
				let die = check.die || state.groupCheck.options.die;
				check.formula = _.union([die], _.map(check.mod, str => '%'+str+'%')).join(' + ');
				delete check.mod;
			});
			delete state.groupCheck.options.die;
			state.groupCheck.options.hideformula = state.groupCheck.options.hidebonus;
			delete state.groupCheck.options.hidebonus;
			state.groupCheck.version = 2;
			log('-=> groupCheck has updated to a new data format. Please make sure your list of checks has converted correctly.<=-');
		}
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
		sendChat(who, string);
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
		let output = '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Current Options</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Name</b></td><td><b>Value</td></b></tr>';
		_.each(state.groupCheck.options, function(value, key) {
			output += '<tr><td>'+key+'</td><td>'+value+'</td></tr>';
		});
		output += '</table></div><br>';

		output += '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Checks</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Command</b></td><td><b>Name</td></b><td><b>Formula</b></td></tr>';
		_.each(state.groupCheck.checkList, function(value, key) {
			output += '<tr><td>'+key+'</td><td>'+value.name+'</td><td>'+value.formula+'</td></tr>';
		});
		output += '</table></div>';
		return output;
	},

	getRollOption = function(charid) {
		if (charid) {
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
		}
		return 'roll2';
	},

	addCharacterToOutput = function(selected, checkFormula, rollOption, opts, rollBoundary) {
		let output, displayName, computedFormula, rollAppendix = '', charName,
			token = getObj('graphic', selected._id),
			characterId = token.get('represents'),
			ro = rollOption(characterId),
			character = getObj('character', characterId);

		if (character) {
			charName = character.get('name');
			if (opts.usetokenname) {
				displayName = token.get('name');
			}
			else {
				displayName = charName;
			}
			computedFormula = checkFormula.replace(/\%(\S.*?)\%/g,
				'@{' + charName + '|' + '$1' + '}');
		}
		else if (opts.fallback) {
			displayName = token.get('name') || `<img src="${token.get('imgsrc')}" height="35" width="35">`;
			computedFormula = checkFormula.replace(/\%(\S.*?)\%/,opts.fallback)
				.replace(/\%(\S.*?)\%/g,'0');
		}
		else {
			return '';
		}

		if (opts.globalmod) {
				computedFormula += ` + ${opts.globalmod}[global modifier]`;
		}

		switch(ro) {
			case 'adv' :
				computedFormula = computedFormula.replace(/d20/,opts['die_adv']);
				rollAppendix = ' (Advantage)';
				break;
			case 'dis' :
				computedFormula = computedFormula.replace(/d20/,opts['die_dis']);
				rollAppendix = ' (Disadvantage)';
				break;
		}

		if (ro !== 'roll2') {
			output = rowstyle(namestyle(displayName),
				rollstyle(computedFormula,rollBoundary,rollAppendix));
		}
		else {
			output = rowstyle(namestyle(displayName),
				roll2style(computedFormula,rollBoundary,rollAppendix));
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
		const valueOptions = ['fallback','die_adv','die_dis','globalmod'];
		const booleanOptions = ['whisper', 'usetokenname', 'hideformula'];
		const booleanOptionsNegative = ['public', 'usecharname', 'showformula'];
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
					if (!(_.isObject(value) && _.has(value, 'name') && _.has(value,'formula') && _.isString(value.formula))) {
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
				if (kv[0] === 'showformula') kv[0] = 'hideformula';
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
		const hasValue = ['fallback','custom','die_adv','die_dis','globalmod','ro','multi'];
		let checkCmd, checkName, checkFormula, output, rollBoundary;
		let who = getPlayerName(msg.who), charOutput, rollText = '';

		// Options processing
		let opts = processOpts(msg.content, hasValue);
		checkCmd = _.intersection(_.keys(state.groupCheck.checkList), _.keys(opts))[0];
		if (checkCmd) {
			checkFormula = state.groupCheck.checkList[checkCmd].formula;
			checkName = state.groupCheck.checkList[checkCmd].name;
		}
		if (opts.showformula) {
			opts.hideformula = false;
			delete opts.showformula;
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

		opts.multi = (opts.multi > 1 ) ? parseInt(opts.multi):1;
		rollBoundary = (opts.hideformula) ? ['[[[[',']]]]'] : ['[[',']]'];
		if (opts.noboundary) {
			rollBoundary = ['',''];
		}

		if (_.indexOf(rollOptions, opts.ro) === -1) {
			handleError(who,'Roll option ' + opts.ro + ' is invalid, sorry.');
			return;
		}
		// Handle custom modifier
		if (opts.custom) {
			let kv = opts.custom.split(/,\s?/);
			if (kv.length < 2) {
				handleError(who,"Custom roll format invalid");
				return;
			}
			checkName = kv.shift();
			checkFormula = kv.join();
			checkCmd = true;
		}

		// Print menu if we don't know what to roll
		if (!checkCmd) {
			printCommandMenu(who,opts);
			return;
		}

		// Output
		output = opts.whisper ? '/w GM ' : '';

		let rollOption = (opts.ro === 'rollsetting') ? getRollOption : ( (charid) => opts.ro);

		if (msg.selected) {
			msg.selected.forEach(function(obj) {
				if (obj._type === 'graphic') {
					charOutput = addCharacterToOutput(obj, checkFormula, rollOption, opts, rollBoundary);
					for (let i=0; i < opts.multi; i++) {
						rollText += charOutput;
					}
				}
			});
		}

		output += boxstyle(headerstyle(checkName), tablestyle(rollText));

		try {
			sendChat(who, output);
		}
		catch(err) {
			output = 'Something went wrong with the roll. The command you tried was:<br>'
				+ msg.content + '<br> The error message generated by Roll20 is:<br>'
				+ err;
			handleError(who, output);
		}
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
