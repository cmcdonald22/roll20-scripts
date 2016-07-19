// Example Usage:	!setattr --Str : 14, AC:12, HP : 50
// or				!setattr --charid @{John|character_id} --Wits: 15, Perception: 27
//
// Set feedback to false to disable output (except for error messages).

var chatSetAttr = chatSetAttr || (function() {
    'use strict';
	
	var version = '0.3',
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

	myGetAttrByName = function(character_id, attribute_name,attribute_default_current, attribute_default_max) {
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

	setAttributes = function(character_id, setting) {
		for (var k in setting) {
			 myGetAttrByName(character_id, k).set("current", setting[k]);
		}
		return;
	},
		
	handleInput = function(msg) {
		if (msg.type !== "api") {
			return;
		}
		var args, attr, cmd, character, characterId, opts={}, output = '', setting={}, settingNames='', settingValues='', token;

		cmd = msg.content.split(/\s+--/);
		if (cmd.shift() === '!setattr') {
			
			// Some options should be provided.
			if (!cmd[0]) {
				handleError(msg.who, "No options supplied.", msg.content);
				return;
			}
			
			// Getting options
			for (var k in cmd) {
				if (k < cmd.length -1) {
					var kv = cmd[k].split(/\s+/);
					if (kv[1]) {
						opts[kv[0]] = kv[1];
					} else {
						opts[kv[0]] = true;
					}
				}		
			}	
			
			// Getting all the attributes we have to set
			args = cmd[cmd.length - 1].split(/\s*,\s*/);		
			for (var k in args) {
				attr = args[k].split(/\s*:\s*/);
				if (!attr || attr.length != 2) {
					handleError(msg.who, "There was a problem with the input.", msg.content);
					return;
				}
				setting[attr[0]] = attr[1];
				if (feedback) {
					if (k < args.length - 1) {
						settingNames += `${attr[0]}, `;
						settingValues += `${attr[1]}, `;
					}
					else {
						settingNames += `${attr[0]}`;
						settingValues += `${attr[1]}`;
					}
				}
			}

			
			if (opts.charid || (msg.selected && msg.selected.length)) {
				if (feedback) {
					output += `/w ${msg.who}`;
					output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
					output += `<p>Set ${settingNames} to ${settingValues} for characters `;
				}
			
				if (opts.charid) {
					var allowed = playerIsGM(msg.playerid);
					var character = getObj("character",opts.charid);
					if (!character) {
						handleError(msg.who, "A character with this id does not exist.", msg.content);
						return;
					}
					if (!allowed) {
						var contr = character.get("controlledby").split(/\s*,\s*/);
						for (var k in contr) {
							if (contr[k] === msg.playerid || contr[k] === 'all') allowed = true;
						}
					}
					if (allowed) {
						setAttributes(opts.charid, setting);
						output += character.get("name");
					}
					else {
						handleError(msg.who, "You do not have permission.", msg.content);
						return;
					}
				} else {
					for (var sel in msg.selected) {						   
						token = getObj('graphic', msg.selected[sel]._id);
						if (token) {
							characterId = token.get("represents");
							if (characterId) {
								setAttributes(characterId, setting);
								if (feedback) {
									if (sel < msg.selected.length - 1) {
										output += getAttrByName(characterId, "character_name") + ", ";
									} else {
										output += getAttrByName(characterId, "character_name");
									}
								}
							}
						}
					}
				}
				
				if (feedback) {
					output += ".</p></div>";
					sendChat(msg.who, output);
				}
			}
			else {
				handleError(msg.who,"No tokens selected", msg.content);
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