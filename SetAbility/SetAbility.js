// setAbility version 1.0
var setAbility = setAbility || (function () {
	'use strict';
	const version = '1.1',
		replacers = [
			['[[', /\\\[/g],
			[']]', /\\\]/g],
			['-', /\~/g],
			['?', /\\q/g],
			['@', /\\at/g],
			['%', /\\p/g],
			['&', /\\amp/g],
			['#', /\\h/g]
		],
		checkInstall = function () {
			log(`-=> SetAbility v${version} <=-`);
		},
		isDef = function (value) {
			return !_.isUndefined(value);
		},
		getWhisperPrefix = function (playerid) {
			let player = getObj('player', playerid);
			if (player && player.get('_displayname')) {
				return '/w "' + player.get('_displayname') + '" ';
			}
			else {
				return '/w GM ';
			}
		},
		sendChatMessage = function (msg) {
			sendChat('setAbility', msg, null, {
				noarchive: true
			});
		},
		handleErrors = function (whisper, errors) {
			if (errors.length) {
				let output = whisper + '<div style="border:1px solid black;' +
					`background-color:#FFBABA;padding:3px"><h4>Errors</h4>` +
					`<p>${errors.join('<br>')}</p></div>`;
				sendChatMessage(output);
				errors.splice(0, errors.length);
			}
		},
		getCharNameById = function (id) {
			let character = getObj('character', id);
			return (character) ? character.get('name') : '';
		},
		htmlReplace = function (str) {
			let entities = {
				'<': 'lt',
				'>': 'gt',
				"'": '#39',
				'*': '#42',
				'@': '#64',
				'{': '#123',
				'|': '#124',
				'}': '#125',
				'[': '#91',
				']': '#93',
				'_': '#95',
				'"': 'quot'
			};
			return str.split('')
				.map(c => (entities[c]) ? ('&' + entities[c] + ';') : c)
				.join('');
		},
		processInlinerolls = function (msg) {
			if (msg['inlinerolls']) {
				return _.chain(msg.inlinerolls)
					.reduce(function (m, v, k) {
						let ti = _.reduce(v.results.rolls, function (m2, v2) {
								if (_.has(v2, 'table')) {
									m2.push(_.reduce(v2.results, function (m3, v3) {
											m3.push(v3.tableItem.name);
											return m3;
										}, [])
										.join(', '));
								}
								return m2;
							}, [])
							.join(', ');
						m['$[[' + k + ']]'] = (ti.length && ti) || v.results.total || 0;
						return m;
					}, {})
					.reduce((m, v, k) => m.replace(k, v), msg.content)
					.value();
			}
			else {
				return msg.content;
			}
		},
		getAbilities = function (list, abilityNames, errors, createMissing, deleteMode, getAll) {
			let abilityNamesUpper = abilityNames.map(x => x.toUpperCase()),
				allAbilities = {};
			list.forEach(charid => {
				allAbilities[charid] = {};
				findObjs({
					_type: 'ability',
					_characterid: charid
				}).forEach(o => {
					if (getAll) {
						allAbilities[charid][o.get('_id')] = o;
					}
					else {
						let nameIndex = abilityNamesUpper.indexOf(o.get('name').toUpperCase());
						if (nameIndex !== -1) {
							allAbilities[charid][abilityNames[nameIndex]] = o;
						}
					}
				});
				if (!getAll) {
					abilityNames.filter(x => !Object.keys(allAbilities[charid]).includes(x))
						.forEach(key => {
							if (createMissing) {
								allAbilities[charid][key] = createObj('ability', {
									characterid: charid,
									name: key
								});
							}
							else if (!deleteMode) {
								errors.push(`Missing ability ${key} not created for` +
									` character ${getCharNameById(charid)}.`);
							}
						});
				}
			});
			return allAbilities;
		},
		delayedSetAbilities = function (whisper, list, setting, errors, allAbilities, fillIn, opts) {
			let cList = [...list],
				feedback = [],
				dWork = function (charid) {
					setCharAbilities(charid, setting, errors, feedback, allAbilities[charid],
						fillIn, opts);
					if (cList.length) {
						_.delay(dWork, 50, cList.shift());
					}
					else {
						if (!opts.mute) handleErrors(whisper, errors);
						if (!opts.silent) sendFeedback(whisper, feedback);
					}
				}
			dWork(cList.shift());
		},
		setCharAbilities = function (charid, setting, errors, feedback, abilities, fillIn, opts) {
			let charFeedback = {};
			Object.entries(abilities).forEach(([abilityName, ability]) => {
				let newValue = fillIn[abilityName] ? fillInAttrValues(charid, setting[abilityName]) : setting[abilityName];
				if (opts.evaluate) {
					try {
						let parsed = eval(newValue);
						if (_.isString(parsed) || _.isFinite(parsed) || _.isBoolean(parsed)) {
							newValue = parsed.toString();
						}
					}
					catch (err) {
						errors.push(`Something went wrong with --evaluate` +
							` for the character ${getCharNameById(charid)}.` +
							` You were warned. The error message was: ${err}.` +
							` Ability ${abilityName} left unchanged.`);
						return;
					}
				}
				let finalValue = {};
				if (opts.token) finalValue.istokenaction = true;
				if (newValue + '' === newValue) finalValue.action = newValue;
				charFeedback[abilityName] = newValue;
				ability.set(finalValue);
			});
			// Feedback
			if (!opts.silent) {
				charFeedback = Object.entries(charFeedback).map(([name, value]) => {
						if (value !== false) return `${name} to ${htmlReplace(value) || '<i>(empty)</i>'}`;
						else return null;
					})
					.filter(x => !!x);
				if (charFeedback.length) {
					feedback.push(`Setting abilities ${charFeedback.join(', ')} for` +
						` character ${getCharNameById(charid)}.`);
				}
				else if (opts.token) {
					feedback.push(`Changing token action status for character ${getCharNameById(charid)}.`);
				}
				else {
					feedback.push(`Nothing to do for character ${getCharNameById(charid)}.`);
				}
			}
			return;
		},
		fillInAttrValues = function (charid, expression) {
			let match = expression.match(/%%(\S.*?)(?:_(max))?%%/),
				replacer;
			while (match) {
				replacer = getAttrByName(charid, match[1], match[2] || 'current') || '';
				expression = expression.replace(/%%(\S.*?)(?:_(max))?%%/, replacer);
				match = expression.match(/%%(\S.*?)(?:_(max))?%%/);
			}
			return expression;
		},
		deleteAbilities = function (whisper, allAbilities, silent, deleteall) {
			let feedback = {};
			Object.entries(allAbilities).forEach(([charid, charAbilities]) => {
				feedback[charid] = [];
				Object.entries(charAbilities).forEach(([name, ability]) => {
					feedback[charid].push(deleteall ? ability.get('name') : name);
					ability.remove();
				});
			});
			if (!silent) sendDeleteFeedback(whisper, feedback);
		},
		// These functions parse the chat input.
		parseOpts = function (content, hasValue) {
			// Input:	content - string of the form command --opts1 --opts2  value --opts3.
			//					values come separated by whitespace.
			//			hasValue - array of all options which come with a value
			// Output:	object containing key:true if key is not in hasValue. and containing
			//			key:value otherwise
			return content.replace(/<br\/>\n/g, ' ')
				.replace(/\s*$/g, '')
				.replace(/({{(.*?)\s*}}$)/g, '$2')
				.split(/\s+--/)
				.slice(1)
				.reduce((m, arg) => {
					let kv = arg.split(/\s(.+)/);
					if (hasValue.includes(kv[0])) {
						m[kv[0]] = kv[1];
					}
					else {
						m[arg] = true;
					}
					return m;
				}, {});
		},
		parseAbilities = function (args, fillIn, replace) {
			return args.map(str => {
					let split = str.split('#');
					return [split.shift(), split.join('#')];
				})
				.reduce((m, c) => {
					if (c[0] && c[1] !== undefined) {
						let str = c[1];
						fillIn[c[0]] = str.search(/%%(\S.*?)(?:_(max))?%%/) !== -1;
						if (replace) {
							replacers.forEach(rep => {
								str = str.replace(rep[1], rep[0]);
							});
						}
						m[c[0]] = str;
					}
					else if (c[0]) {
						m[c[0]] = false;
					}
					return m;
				}, {});
		},
		// These functions are used to get a list of character ids from the input,
		// and check for permissions.
		checkPermissions = function (list, errors, playerid, isGM) {
			return list.filter(id => {
				let character = getObj('character', id);
				if (character) {
					let control = character.get('controlledby').split(/,/);
					if (!(isGM || control.includes('all') || control.includes(playerid))) {
						errors.push(`Permission error for character ${character.get('name')}.`);
						return false;
					}
					else return true;
				}
				else {
					errors.push(`Invalid character id ${id}.`);
					return false;
				}
			});
		},
		getIDsFromTokens = function (selected) {
			return selected.map(obj => getObj('graphic', obj._id))
				.filter(x => !!x)
				.map(token => token.get('represents'))
				.filter(id => getObj('character', id || ''));
		},
		getIDsFromNames = function (charNames, errors) {
			return charNames.split(/\s*,\s*/)
				.map(name => {
					let character = findObjs({
						_type: 'character',
						name: name
					}, {
						caseInsensitive: true
					})[0];
					if (character) {
						return character.id;
					}
					else {
						errors.push(`No character named ${name} found.`);
						return null;
					}
				})
				.filter(x => !!x);
		},
		sendFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Setting abilities</h3><p>' +
				(feedback.join('<br>') || 'Nothing to do.') + '</p></div>';
			sendChatMessage(output);
		},
		sendDeleteFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Deleting abilities</h3><p>';
			output += _.chain(feedback)
				.omit(arr => arr.length === 0)
				.map(function (arr, charid) {
					return `Deleting abilities(s) ${arr.join(', ')} for character` +
						` ${getCharNameById(charid)}.`;
				})
				.join('<br>')
				.value() || 'Nothing to do.';
			output += '</p></div>';
			sendChatMessage(output);
		},
		// Main function, called after chat message input
		handleInput = function (msg) {
			if (msg.type !== 'api') {
				return;
			}
			const mode = msg.content.match(/^!(set|del|)ability\b/),
				whisper = getWhisperPrefix(msg.playerid);
			if (!mode) return;
			// Parsing input
			let charIDList = [],
				fillIn = {},
				errors = [];
			const hasValue = ['charid', 'name'],
				optsArray = ['all', 'allgm', 'charid', 'name', 'allplayers', 'sel',
					'replace', 'nocreate', 'evaluate', 'silent', 'mute', 'token', 'deleteall'
				],
				opts = parseOpts(processInlinerolls(msg), hasValue),
				deleteMode = (mode[1] === 'del'),
				setting = parseAbilities(_.chain(opts)
					.omit(optsArray)
					.keys()
					.value(),
					fillIn, opts.replace),
				isGM = msg.playerid === 'API' || playerIsGM(msg.playerid);
			opts.silent = opts.silent || opts.mute;
			opts.token = opts.token || false;
			if (opts.evaluate && !isGM) {
				if (!opts.mute) handleErrors(whisper, ['The --evaluate option is only available to the GM.']);
				return;
			}
			// Get list of character IDs
			if (opts.all && isGM) {
				charIDList = findObjs({
					_type: 'character'
				}).map(c => c.id);
			}
			else if (opts.allgm && isGM) {
				charIDList = findObjs({
						_type: 'character'
					}).filter(c => c.get('controlledby') === '')
					.map(c => c.id);
			}
			else if (opts.allplayers && isGM) {
				charIDList = findObjs({
						_type: 'character'
					}).filter(c => c.get('controlledby') !== '')
					.map(c => c.id);
			}
			else {
				(opts.charid) ? charIDList.push(...opts.charid.split(/\s*,\s*/)): null;
				(opts.name) ? charIDList.push(...getIDsFromNames(opts.name, errors)): null;
				(opts.sel) ? charIDList.push(...getIDsFromTokens(msg.selected)): null;
				charIDList = checkPermissions(_.uniq(charIDList), errors, msg.playerid, isGM);
			}
			if (_.isEmpty(charIDList)) {
				errors.push('No target characters. You need to supply one of --all, --allgm, --sel,' +
					' --allplayers, --charid, or --name.');
			}
			if (_.isEmpty(setting) && !(deleteMode && opts.deleteall)) {
				errors.push('No abilities supplied.');
			}
			// Get abilities
			let allAbilities = getAbilities(charIDList, Object.keys(setting), errors, !opts.nocreate && !deleteMode, deleteMode, deleteMode && opts.deleteall);
			if (!opts.mute) handleErrors(whisper, errors);
			// Set or delete abilities
			if (!(charIDList.length === 0) && (!_.isEmpty(setting) || (deleteMode && opts.deleteall))) {
				if (deleteMode) {
					deleteAbilities(whisper, allAbilities, opts.silent, opts.deleteall);
				}
				else {
					delayedSetAbilities(whisper, charIDList, setting, errors, allAbilities,
						fillIn, _.pick(opts, optsArray));
				}
			}
			return;
		},
		registerEventHandlers = function () {
			on('chat:message', handleInput);
		};
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());
on('ready', function () {
	'use strict';
	setAbility.CheckInstall();
	setAbility.RegisterEventHandlers();
});
