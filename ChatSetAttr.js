var chatSetAttr = chatSetAttr || (function() {
	'use strict';
	
	var version = '0.2.0',
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
		sendChat(who, output, null, {noarchive:true});
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
		if (msg.type !== "api") {
			return;
		}
		var args, attr, cmd, character, characterId, output = '', setting={}, settingNames='', settingValues='', token;

		cmd = msg.content.split(/\s(.+)/);
		if (cmd.shift() === '!setattr') {
			if (!cmd[0]) {
				handleError(msg.who, "No options supplied.", {});
				return;
			}
			
			args = cmd[0].split(/\s*,\s*/);		
			for (var k in args) {
				attr = args[k].split(/\s*=\s*/);
				if (!attr || attr.length != 2) {
					handleError(msg.who, "There was a problem with the input.", cmd[0]);
					return;
				}
				setting[attr[0]] = attr[1];
				if (k < args.length - 1) {
					settingNames += `${attr[0]}, `;
					settingValues += `${attr[1]}, `;
				}
				else {
					settingNames += `${attr[0]}`;
					settingValues += `${attr[1]}`;
				}
			}

			
			if (msg.selected && msg.selected.length) {
				output += `/w ${msg.who}`;
				output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
				output += `<p>Set ${settingNames} to ${settingValues} for characters `;
				
				for (var sel in msg.selected) {						   
					token = getObj('graphic', msg.selected[sel]._id);
					if (token) {
						characterId = token.get("represents");
						if (characterId) {
							character = getObj("character", characterId);
							for (var k in setting) {
								attr = myGetAttrByName(character.id, k);
								attr.set("current", setting[k]);
							}
							output += `${character.get("name")}`;
							if (sel < msg.selected.length - 1) {
								output += ", ";
							}
						}
					}
				}
				output += ".</p></div>";
				if (feedback) {
					sendChat(msg.who, output, null, {noarchive:true});
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