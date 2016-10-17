const groupAbility = groupAbility || (function() {
    'use strict';
    const version = '1',

	// Init
	checkInstall = function() {
		log('-=> groupAbility v'+version+' <=-');
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
		sendChatNoarchive('GroupAbility', output);
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

	callAbilitiesForToken = function(who, selected, commands, opts) {
		let token, characterId, character, name, output;
		if (selected._type === 'graphic') {
			token = getObj('graphic', selected._id);
			if (token) {
				characterId = token.get('represents');
				character = getObj('character', characterId);
				if (character) {
					name = character.get('name');
					let suffix = opts.suffix.replace(/%%NAME%%/g, token.get('name'));
					_.each(_.keys(commands), function (cmd) {
						output = `${opts.prefix} %{${name}|${cmd}} ${suffix}`;
						for (let i=0; i < opts.multi; i++) {
							sendChat(name, output);
						}

					});
				}
			}
		}
	},

	processOutput = function (msg) {
		const hasValue = ['prefix', 'suffix', 'multi'],
			optsDefault = { 'prefix' : '', 'suffix' : ''},
			who = getPlayerName(msg.who);

		// Options processing
		let opts = _.defaults(processOpts(msg.content, hasValue),optsDefault),
			commands = _.omit(opts, hasValue);

		opts.multi = (opts.multi > 1 ) ? parseInt(opts.multi):1;

		if (msg.selected) {
			msg.selected.forEach(function(obj) {
				callAbilitiesForToken(who, obj, commands, opts);
			});
		}
		return;
	},

	handleInput = function(msg) {
		if (msg.type === "api" && msg.content.search(/^!ga\b/) !== -1) {
			processOutput(msg);
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

	groupAbility.CheckInstall();
	groupAbility.RegisterEventHandlers();
});
