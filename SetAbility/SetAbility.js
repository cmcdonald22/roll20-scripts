// setAbility version 1.0
var setAbility = setAbility || (function () {
	'use strict';
	const version = '1.0',
		replacers = [
			['<', '[', /</g, /\[/g],
			['>', ']', />/g, /\]/g],
			['~', '-', /\~/g, /\-/g],
			[';', '?', /\;/g, /\?/g],
			['`', '@', /`/g, /@/g]
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
		escapeRegExp = function (str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
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
			return _.chain(str.split(''))
				.map(c => (_.has(entities, c)) ? ('&' + entities[c] + ';') : c)
				.value()
				.join('');
		},
		processInlinerolls = function (msg) {
			if (_.has(msg, 'inlinerolls')) {
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
		getAbilities = function (list, abilityNames, errors, createMissing, deleteMode) {
			let abilityNamesUpper = abilityNames.map(x => x.toUpperCase()),
				nameIndex, allAbilities = {};
			_.each(list, charid => (allAbilities[charid] = {}));
			_.each(list, function (charid) {
				_.each(findObjs({
					_type: 'ability',
					_characterid: charid
				}), function (o) {
					nameIndex = _.indexOf(abilityNamesUpper, o.get('name')
						.toUpperCase());
					if (nameIndex !== -1) {
						allAbilities[charid][abilityNames[nameIndex]] = o;
					}
				});
				_.each(_.difference(abilityNames, _.keys(allAbilities[charid])), function (key) {
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
			});
			return allAbilities;
		},
		delayedSetAbilities = function (whisper, list, setting, errors, allAbilities, fillIn, opts) {
			let cList = _.clone(list),
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
			_.each(abilities, function (ability, abilityName) {
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
				charFeedback[abilityName] = newValue;
				ability.set({
					action: newValue,
					istokenaction: opts.token
				});
			});
			// Feedback
			if (!opts.silent) {
				charFeedback = _.chain(charFeedback)
					.map(function (value, name) {
						if (value || value === '') return `${name} to ${htmlReplace(value) || '<i>(empty)</i>'}`;
						else return null;
					})
					.compact()
					.value();
				if (!_.isEmpty(charFeedback)) {
					feedback.push(`Setting ${charFeedback.join(', ')} for` +
						` character ${getCharNameById(charid)}.`);
				}
				else {
					feedback.push(`Nothing to do for character` +
						` ${getCharNameById(charid)}.`);
				}
			}
			return;
		},
		fillInAttrValues = function (charid, expression) {
			let match = expression.match(/%(\S.*?)(?:_(max))?%/),
				replacer;
			while (match) {
				replacer = getAttrByName(charid, match[1], match[2] || 'current') || '';
				expression = expression.replace(/%(\S.*?)(?:_(max))?%/, replacer);
				match = expression.match(/%(\S.*?)(?:_(max))?%/);
			}
			return expression;
		},
		deleteAbilities = function (whisper, allAbilities, silent) {
			let feedback = {};
			_.each(allAbilities, function (charAbilities, charid) {
				feedback[charid] = [];
				_.each(charAbilities, function (ability, name) {
					ability.remove();
					feedback[charid].push(name);
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
			let opts = {};
			let args = _.rest(content.replace(/<br\/>\n/g, ' ')
				.replace(/\s*$/g, '')
				.replace(/({{(.*?)\s*}}$)/g, '$2')
				.split(/\s+--/));
			_.each(args, function (arg) {
				let kv = arg.split(/\s(.+)/);
				if (_.contains(hasValue, kv[0])) {
					opts[kv[0]] = kv[1];
				}
				else {
					opts[arg] = true;
				}
			});
			return opts;
		},
		parseAbilities = function (args, replace, fillIn) {
			// Input:	args - array containing comma-separated list of strings, every one of which contains
			//				an expression of the form key|value or key|value|maxvalue
			//			replace - true if characters from the replacers array should be replaced
			// Output:	Object containing key|value for all expressions.
			let setting = args.map(function (str) {
					return str.split(/(\\?(?:#|\|))/g)
						.reduce(function (m, s) {
							if ((s === '#' || s === '|')) m[m.length] = '';
							else if ((s === '\\#' || s === '\\|')) m[m.length - 1] += s.slice(-1);
							else m[m.length - 1] += s;
							return m;
						}, ['']);
				})
				.filter(v => !!v)
				.reduce((p, c) => {
					p[c[0]] = c[1] || '';
					return p;
				}, {});
			if (replace) {
				setting = _.mapObject(setting, function (str) {
					_.each(replacers, function (rep) {
						str = str.replace(rep[2], rep[1]);
					});
					return str;
				});
			}
			_.extend(fillIn, _.mapObject(setting, str => str.search(/%(\S.*?)(?:_(max))?%/) !== -1));
			return setting;
		},
		// These functions are used to get a list of character ids from the input,
		// and check for permissions.
		checkPermissions = function (list, errors, playerid, isGM) {
			let control, character;
			_.each(list, function (id, k) {
				character = getObj('character', id);
				if (character) {
					control = character.get('controlledby')
						.split(/,/);
					if (!(isGM || _.contains(control, 'all') || _.contains(control, playerid))) {
						list[k] = null;
						errors.push(`Permission error for character ${character.get('name')}.`);
					}
				}
				else {
					errors.push(`Invalid character id ${id}.`);
					list[k] = null;
				}
			});
			return _.compact(list);
		},
		getIDsFromTokens = function (selected) {
			return _.chain(selected)
				.map(obj => getObj('graphic', obj._id))
				.compact()
				.map(token => token.get('represents'))
				.compact()
				.filter(id => getObj('character', id))
				.value();
		},
		getIDsFromNames = function (charNames, errors) {
			return _.chain(charNames.split(/\s*,\s*/))
				.map(function (name) {
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
						errors.push('No character named ' + name + ' found.');
						return null;
					}
				})
				.compact()
				.value();
		},
		sendFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Setting attributes</h3><p>' +
				(feedback.join('<br>') || 'Nothing to do.') + '</p></div>';
			sendChatMessage(output);
		},
		sendDeleteFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Deleting abilities</h3><p>';
			output += _.chain(feedback)
				.omit(arr => _.isEmpty(arr))
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
					'replace', 'nocreate', 'evaluate', 'silent', 'mute', 'token'
				],
				opts = parseOpts(processInlinerolls(msg), hasValue),
				setting = parseAbilities(_.chain(opts)
					.omit(optsArray)
					.keys()
					.value(),
					opts.replace, fillIn),
				deleteMode = (mode[1] === 'del'),
				isGM = msg.playerid === 'API' || playerIsGM(msg.playerid);
			opts.silent = opts.silent || opts.mute;
			opts.token = opts.token || false;
			if (opts.evaluate && !isGM) {
				if (!opts.mute) handleErrors(whisper, ['The --evaluate option is only available to the GM.']);
				return;
			}
			// Get list of character IDs
			if (opts.all && isGM) {
				charIDList = _.map(findObjs({
					_type: 'character'
				}), c => c.id);
			}
			else if (opts.allgm && isGM) {
				charIDList = _.chain(findObjs({
						_type: 'character'
					}))
					.filter(c => c.get('controlledby') === '')
					.map(c => c.id)
					.value();
			}
			else if (opts.allplayers && isGM) {
				charIDList = _.chain(findObjs({
						_type: 'character'
					}))
					.filter(c => c.get('controlledby') !== '')
					.map(c => c.id)
					.value();
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
			if (_.isEmpty(setting)) {
				errors.push('No abilities supplied.');
			}
			// Get abilities
			let allAbilities = getAbilities(charIDList, _.keys(setting), errors, !opts.nocreate && !deleteMode, deleteMode);
			if (!opts.mute) handleErrors(whisper, errors);
			// Set or delete abilities
			if (!_.isEmpty(charIDList) && !_.isEmpty(setting)) {
				if (deleteMode) {
					deleteAbilities(whisper, allAbilities, opts.silent);
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
