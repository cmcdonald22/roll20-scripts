// Example Usage:	!setattr --Str | 14, AC|12, HP | 50 --Juice |12
// or				!setattr --charid @{John|character_id}, @{Mark|character_id} --Wits| 15, Perception|27 
//
// Set feedback to false to disable output (except for error messages).

var chatSetAttr = chatSetAttr || (function() {
    'use strict';
	
	var version = '0.4',
	feedback = true,
	
	checkInstall = function() {
		log(` -=> ChatSetAttr v${version} <=-`);
	},

	handleError = function(who, errorMsg, cmd) {
		var output = "/w " + who;
		output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
		output += "<h4>Error</h4>";
		output += "<p>"+errorMsg+"</p>";
		output += "Input was: <p>" + cmd + "</p>";
		output += "</div>";
		sendChat(who, output);
	},
	
	myGetAttrByName = function(character_id, attribute_name, attribute_default_current, attribute_default_max) {
		// Returns attribute object by name
		attribute_default_current = attribute_default_current || '';
		attribute_default_max = attribute_default_max || '';

		var attribute = findObjs({
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
		list.forEach(function(c) {
			_.each(setting, function(s,t) {
				myGetAttrByName(c,t).set("current",s);
			});
		});
		return;
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

	parseAttributes = function(args) {
		// Input:	args - array containing comma-separated list of strings, every one of which contains
		// 			an expression of the form key|value
		// Output:	Object containing key|value for all expressions.
		return _.chain(args)
		.map(function(str){return str.split(/\s*,\s*/);})
		.flatten()
		.map(function(str){return str.split(/\s*\|\s*/);})
		.object()
		.value();
	},

	handleInput = function(msg) {
		var charIDList = [], opts, setting;
		var optsArray = ['charid'];
		
		if (msg.type === "api" && msg.content.match(/^!setattr\b/)) {
			
			// Parse input
			opts = processOpts(processInlinerolls(msg), optsArray);
			setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value());
			
			if (_.isEmpty(setting)) {
				handleError(msg.who, "No options supplied.", msg.content);
				return;
			}

			// Get characters, either from charid or from selected tokens
			if (opts.charid) {
				charIDList = opts.charid.split(/\s*,\s*/);
				let control, character;
				for (var k in charIDList) {
					character = getObj("character",charIDList[k]);
					if (character) {
						control = character.get('controlledby').split(/,/);
						if(!(playerIsGM(msg.playerid) || _.contains(control,'all') || _.contains(control,msg.playerid))) {
							charIDList.splice(k,1);
							handleError(msg.who, "Permission error.", msg.content);
						}
					} else {
						charIDList.splice(k,1);
						handleError(msg.who, "Invalid character id.", msg.content);
					}	
				}
			} else if (msg.selected && msg.selected.length) {
				let characterId, token;
				for (var sel in msg.selected) {						   
					token = getObj('graphic', msg.selected[sel]._id);
					if (token) {
						characterId = token.get("represents");
						if (characterId) {
							charIDList.push(characterId);	
						}
					}
				}
			} else {
				handleError(msg.who,"No tokens selected.", msg.content);
				return;
			}			
			
			// Set attributes
			setAttributes(charIDList,setting);
			
			// Output
			if (feedback && !opts.silent) {
				var charNames = charIDList.map(function(id) {return getAttrByName(id, "character_name")}).join(", ");
				var output = `/w ${msg.who}` +
					`<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">` +
					`<p>Setting ${_.keys(setting).join(", ")} to ${_.values(setting).join(", ")} ` +
					`for characters ${charNames}.</p></div>`;
				sendChat(msg.who, output);
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