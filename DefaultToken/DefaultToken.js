var defaultToken = defaultToken || (function() {
    'use strict';
    const version = '1.0',
    feedback = true,

	checkInstall = function() {
		log('-=> DefaultToken v'+version+' <=-');
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		if (match) {
			return match[1];
		} else {
			return who;
		}
	},

	setDefaultTokenForList = function (list) {
		list.forEach(function (pair) {
			setDefaultTokenForCharacter(pair[0], pair[1]);
		});
	},
	
	parseOpts = function(content, hasValue) {
		let args, kv, opts = {};
		args = _.rest(content.split(/\s+--/));
		for (let k in args) {
			kv = args[k].split(/\s(.+)/);
			if (_.contains(hasValue, kv[0])) {
				opts[kv[0]] = kv[1];
			} else {
				opts[args[k]] = true;
			}
		}
		return opts;
	},

	handleInput = function(msg) {
		if (msg.type === 'api' && msg.content.search(/^!default-token\b/) !== -1 && msg.selected) {
			const tokensAndChars = _.chain(msg.selected)
				.map(a => getObj('graphic', a._id))
				.filter(o => o.get('_subtype') === 'token')
				.map(o => [o.get('represents'), o])
				.map(a => [getObj('character', a[0]), a[1]])
				.filter(a => a[0])
				.value();
				
			const opts = _.defaults(parseOpts(msg.content, ['wait']), {wait: '0'});

			_.delay(setDefaultTokenForList, opts.wait, tokensAndChars);

			if (feedback) {
				let output = '/w "' + getPlayerName(msg.who) +
					'" Default tokens set for characters ' +
					_.map(tokensAndChars, a => a[0].get('name')).join(', ') + '.'
				sendChat('API', output);
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
	defaultToken.CheckInstall();
	defaultToken.RegisterEventHandlers();
});
