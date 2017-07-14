// Create a handout when sending !handout <me|all> <handout name>
on('chat:message', function(msg) {
	'use strict';
	if (msg.type === 'api' && msg.content.indexOf('!handout') === 0) {
		let args = msg.content.split(' ').slice(1),
			target = (args.shift() === 'me') ? msg.playerid : 'all';
		createObj('handout', {
			name: args.join(' ') || 'Notes',
			inplayerjournals: target,
			controlledby: target
		});
	}
});
