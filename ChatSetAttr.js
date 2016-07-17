var chatSetAttr = chatSetAttr || (function() {
	'use strict';
	
	var version = '0.1.0',
	feedback = true,
	
	checkInstall = function() {
		log(` -=> ChatSetAttr v${version} <=-`);
	},

	handleError = function(who, errorMsg, args) {
		var output = "/w " + who;
		output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
		output += "<h4>Error</h4>";
		output += "<p>"+errorMsg+"</p>";
		output += "Input was: <p>" + JSON.stringify(args) + "</p>";
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

	handleInput = function(msg) {
		var args, token, character, characterId, attr, output = '';
	
		if (msg.type !== "api") {
			return;
		}

		args = msg.content.split(/\s+/);
		switch(args.shift()) {
			case '!setattr':
					
				if (args.length != 2) {
					handleError(msg.who,'The number of arguments was wrong.',args);
					return;
				}

				if (msg.selected && msg.selected.length) {
					output += `/w ${msg.who}`;
					output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
					output += `<p>Set ${args[0]} to ${args[1]} for characters `;
					
					for (var sel in msg.selected) {						   
						token = getObj('graphic', msg.selected[sel]._id);
						if (token) {
							characterId = token.get("represents");
							if (characterId) {
								character = getObj("character", characterId);
								attr = myGetAttrByName(character.id, args[0]);
								attr.set("current", args[1]);
								output += `${character.get("name")}`;
								if (sel < msg.selected.length - 1) {
									output += ", ";
								}
							}
						}
					}
					output += ".</p></div>";
					if (feedback) {
						sendChat(msg.who, output);
					}
					return;
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