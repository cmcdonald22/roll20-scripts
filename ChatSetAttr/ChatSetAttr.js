var chatSetAttr = chatSetAttr || (function() {
    'use strict';

	const version = '0.6',
	feedback = true,

	checkInstall = function() {
		log(`-=> ChatSetAttr v${version} <=-`);
	},

	handleError = function(who, errorMsg, cmd) {
		let output = "/w " + who
			+ "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">"
			+ "<h4>Error</h4>"
			+ "<p>"+errorMsg+"</p>"
			+ "Input was: <p>" + cmd + "</p>"
			+ "</div>";
		sendChat(who, output);
	},

	myGetAttrByName = function(character_id, attribute_name, attribute_default_current, attribute_default_max) {
		// Returns attribute object by name
		attribute_default_current = attribute_default_current || '';
		attribute_default_max = attribute_default_max || '';

		let attribute = findObjs({
			type: 'attribute',
			characterid: character_id,
			name: attribute_name
		}, {caseInsensitive: true})[0];
		if (!attribute) {
			attribute = createObj('attribute', {
				characterid: character_id,
				name: attribute_name,
				current: attribute_default_current,
				max: attribute_default_max
			});
		}
		return attribute;
	},

	processInlinerolls = function (msg) {
		// Input:	msg - chat message
		// Output:	msg.content, with all inline rolls evaluated
		if (_.has(msg, 'inlinerolls')) {
			return _.chain(msg.inlinerolls)
					.reduce(function(previous, current, index) {
						previous['$[[' + index + ']]'] = current.results.total || 0;
						return previous;
					},{})
					.reduce(function(previous, current, index) {
						return previous.replace(index, current);
					}, msg.content)
					.value();
		} else {
			return msg.content;
		}
	},

	setAttributes = function(list, setting) {
		// Input:	list - array of valid character IDs
		//			setting - object containing attribute names and desired values
		// Output:	null. Attribute values are changed.
		let attr;
		list.forEach(function(c) {
			_.each(setting, function(s,t) {
				attr = myGetAttrByName(c,t);
				if (s.current !== undefined) attr.set('current',s.current);
				if (s.max !== undefined) attr.set('max',s.max);
			});
		});
		return;
	},

	parseOpts = function(content, hasValue) {
		// Input:	content - string of the form command --opts1 --opts2  value --opts3.
		//					values come separated by whitespace.
		//			hasValue - array of all options which come with a value
		// Output:	object containing key:true if key is not in hasValue. and containing
		//			key:value otherwise
		let args, kv, opts = {};
		args = _.rest(content.split(/\s+--/));
		for (let k in args) {
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

	parseAttributes = function(args) {
		// Input:	args - array containing comma-separated list of strings, every one of which contains
		// 			an expression of the form key|value
		// Output:	Object containing key|value for all expressions.
		//
		// It can deal with empty values
		return _.chain(args)
		.map(str => str.split(/\s*,\s*/))
		.flatten()
		.map(str => str.split(/\s*\|\s*/))
		.reject(a => a.length === 0)
		.map(sanitizeAttributeArray)
		.object()
		.value();
	},

	sanitizeAttributeArray = function (arr) {
		if (arr.length === 1)
			return [arr[0],{current : ''}];
		if (arr.length === 2)
			return [arr[0],{current : arr[1].replace(/'/g,'')}];
		if (arr.length === 3 && arr[1] === '')
			return [arr[0], {max : arr[2].replace(/'/g,'')}];
		if (arr.length === 3 && arr[1] === "''")
			return [arr[0], {current : '', max : arr[2].replace(/'/g,'')}];
		else if (arr.length === 3)
			return [arr[0], {current : arr[1].replace(/'/g,''), max : arr[2].replace(/'/g,'')}];
		if (arr.length > 4) return sanitizeAttributeArray(_.first(arr,3));
	},

	checkPermissions = function (list, playerid, who) {
		let control, character;
		for (let k in list) {
			character = getObj("character",list[k]);
			if (character) {
				control = character.get('controlledby').split(/,/);
				if(!(playerIsGM(playerid) || _.contains(control,'all') || _.contains(control,playerid))) {
					list.splice(k,1);
					handleError(who, "Permission error.", "Name: " + character.get('name'));
				}
			}
			else {
				handleError(who, "Invalid character id.", "Id: " + list[k]);
				list.splice(k,1);
			}
		}
		return list;
	},

	getIDsFromTokens = function (selected) {
		let charIDList = [], characterId, token;
		selected.forEach(function(a) {
			token = getObj('graphic', a._id);
			if (token) {
				characterId = token.get("represents");
				if (characterId) {
					charIDList.push(characterId);
				}
			}
		});
		return charIDList;
	},

	getIDsFromNames = function(charNames, playerid, who) {
		let charIDList = _.chain(charNames.split(/\s*,\s*/))
			.map(function (n) {
				let character = findObjs({type: 'character', name: n}, {caseInsensitive: true})[0];
				if (character) return character.id;
				else return '';})
			.compact()
			.value();
		return checkPermissions(charIDList, playerid, who);
	},

	getIDsFromList = function(charid, playerid, who) {
		return checkPermissions(charid.split(/\s*,\s*/), playerid, who);
	},

	sendFeedback = function (who, list, setting) {
		let charNames = list.map(id => getAttrByName(id, "character_name")).join(", ");
		let values = _.chain(setting).values()
			.map(function (o) {
				if (o.max !== undefined && o.current !== undefined)	return `${o.current} / ${o.max}`;
				if (o.max === undefined) return o.current;
				if (o.current === undefined) return `${o.max} (max)`;
				return '';})
			.value()
			.join(", ");
		let output = `/w ${who}` +
			`<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">` +
			`<p>Setting ${_.keys(setting).join(", ")} to ${values} ` +
			`for characters ${charNames}.</p></div>`;
		sendChat(who, output);
	},

	handleInput = function(msg) {
		if (msg.type === "api" && msg.content.match(/^!setattr\b/)) {
			// Parsing
			let charIDList;
			const hasValue = ['charid','name'],
				optsArray = ['all','allgm','charid','name','silent','sel'],
				opts = parseOpts(processInlinerolls(msg), hasValue),
				setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value());

			if (_.isEmpty(setting)) {
				handleError(msg.who, "No attributes supplied.", msg.content);
				return;
			}

			// Get list of character IDs
			if (opts.all && playerIsGM(msg.playerid)) {
				charIDList = _.map(findObjs({_type: 'character'}), c => c.id);
			}
			else if (opts.allgm && playerIsGM(msg.playerid)) {
				charIDList = _.chain(findObjs({_type: 'character'}))
							.filter(c => c.get('controlledby') === '')
							.map(c => c.id)
							.value();
			}
			else if (opts.charid) {
				charIDList = getIDsFromList(opts.charid, msg.playerid, msg.who);
			}
			else if (opts.name) {
				charIDList = getIDsFromNames(opts.name, msg.playerid, msg.who);
			}
			else if (opts.sel && msg.selected) {
				charIDList = getIDsFromTokens(msg.selected);
			}
			else {
				handleError(msg.who,"Don't know what to do.", msg.content);
				return;
			}

			// Set attributes
			setAttributes(charIDList, setting);

			// Output
			if (feedback && !opts.silent && !_.isEmpty(charIDList)) {
				sendFeedback(msg.who, charIDList, setting);
			}
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

	chatSetAttr.CheckInstall();
	chatSetAttr.RegisterEventHandlers();
});
