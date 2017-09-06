// BladesHelper for Scum And Villainy v1.2
//
// CONFIGURATION
//
// 1) You can change the URLs in the clockData and barData variables to use different graphics.
//    Due to Roll20 restrictions, they need to be images uploaded to your Roll20 library,
//    and it needs to be the "thumb" size variant.
//
// 2) You can configure the script via the following commands:
//  a) !blades-helper config autoclock [on|off] will turn automatic creation of clocks on
//     the tabletop on or off, respectively (if one is created in a character sheet)
//  b) !blades-helper config position [x] [y] will set the position of newly created tokens
//     to the specified [x] and [y] coordinates. Defaults to 200 and 300.
//
// USAGE
//
// * Any tokens created by this command will be created on the page you are currently on
//   (if a GM), or on the page the player badge is currently on (otherwise).
//
// * Adding a clock to a character sheet and naming it will automatically create a linked
//   clock on the tabletop. Be careful to set the size first, and then the name, since the
//   size will be locked in once the name has been entered. You can turn this behaviour
//   off via the config command above.
//
// * !blades-helper help
//   Show help on available commands.
//
// * !blades-helper add-clock <size> none <name>
//   Creates a new clock of size <size> with name <name> on the tabletop. This clock is not
//   linked to any clock on a character sheet. Example:
//     !blades-helper add-clock 8 none Drive off the Red Sashes gang
//
// * !blades-helper add-clock <size> char <charid> <name>
//   Creates a new clock of size <size> on the tabletop, linked to the character with id <charid>,
//   with name <name>. If the sheet is a character sheet, it will be put on the character page,
//   if it is a crew sheet, it will be put on the crew page. "Linked" means that changes in
//   either of the clocks will effect changes in the other one. Example:
//     !blades-helper add-clock 6 char @{Silver|character_id} Research demon binding
//
// * !blades-helper add-stress-bar <charid> <attrname>
//   Creates a new stress bar on the tabletop, linked to the attribute <attrname> of
//	 the character with id <charid>. Example:
//     !blades-helper add-stress-bar @{Canter Haig|character_id} stress
//     !blades-helper add-stress-bar @{Bloodletters|character_id} heat
//
// * !blades-helper add-trauma-bar <charid> <attrname>
//   Creates a new trauma bar on the tabletop, linked to the attribute <attrname> of
//	 the character with id <charid>. Example:
//     !blades-helper add-trauma-bar @{Canter Haig|character_id} trauma
//     !blades-helper add-stress-bar @{Bloodletters|character_id} wanted
//
// * !blades-helper add-by-token <attrname>
//   Starts to link the selected rollable table side with the attribute <attrname>
//   of the character that the rollable table token represents. Example:
//     !blades-helper add-by-token stress
//     !blades-helper add-by-token trauma
//
// * !blades-helper add-by-id <charid> <attrname>
//   Starts to link the selected rollable table side with the attribute <attrname>
//   of the character with id <charid>. Example:
//     !blades-helper add-by-id @{Silver|character_id} stress
//     !blades-helper add-by-id @{Silver|character_id} trauma
//
// * !blades-helper show
//   Shows all currently active links between tokens and character atributes.
//
// * !blades-helper remove
//   Removes any link for the currently selected tokens.
//
// * !blades-helper reset
//   Clears all links between tokens and attributes. Resets all configuration options to their defaults.
var bladesHelper = bladesHelper || (function () {
	'use strict';
	const sendChatMessage = function (playerid, content) {
			const getWhisperPrefix = id => {
					const player = getObj('player', id);
					if (player && player.get('_displayname')) {
						return '/w "' + player.get('_displayname') + '" ';
					}
					else return '/w GM ';
				},
				whisper = playerid ? getWhisperPrefix(playerid) : '';
			sendChat('API', whisper + content, null, {
				noarchive: true
			});
		},
		clockData = {
			'4': [
				"https://s3.amazonaws.com/files.d20.io/images/38674763/Gx3r0f8MeZTyGK_c6Y4N1Q/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674760/b05hMKgakMvkJcUDli2okw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674761/sear3S8sM23hQJGhQ5Lg2g/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674762/P-uOCoQE9s8O5Jdnjq2sDQ/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674767/J698zLFEc6EIxOprka53aQ/thumb.png?1504597550"
			],
			'6': [
				"https://s3.amazonaws.com/files.d20.io/images/38674765/uXhCP2fHuwSVi3mgFxT41g/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674764/rsNXvhUTAcH48G0Sk0l0Nw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674770/Jr3S6Cz7j1BbPBXeSBjyNQ/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674771/J8RRGaFtbBxvSTaGSt6jHg/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674766/DcvRTw52sPxtqAWdjmhMLA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674772/lw5fKB22O6UILnQR1r48-Q/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674773/a-npjmNlXf3DEVbTVnyKNg/thumb.png?1504597550"
			],
			'8': [
				"https://s3.amazonaws.com/files.d20.io/images/38674769/0QydJI-Jipvt11HVdxBmxg/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674774/zo5BZgCZHsXwglsXUg1uGQ/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674768/RAigxqUSV1di3qGQV2XRAw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674775/oxdh2HxyHdgMb_cjP-aJdw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674776/ksX4abAfgHF-2_Dke39dkA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674791/FeeuoLGW2eu1Vwxr1QVQ1A/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674777/lJ1gX08x1y4hMIQW31FsRw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674779/eS8U_4ayShpU6_gLNJ5igw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674778/Ig_Xh6HjDXJUUO04RK_d2A/thumb.png?1504597550"
			],
			'12': [
				"https://s3.amazonaws.com/files.d20.io/images/38674782/K1BrwHhXWWHoshivWQoV_A/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674784/Yx5_gV3_MjbHekvI0hxR7Q/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674780/0A0uz18Z1CUo_AbCKcWQyw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674783/c07ZgXI6otoYf05PoYzuJg/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674781/twbGflSCK5F5PH3h8DZrrA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674786/xg5mO9xMVWzIG0hcRw0ftw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674785/rjJ3UKRfglm_FPbU-gnA-A/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674788/N7qjTyAfX-8y1YwW0C_agA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674787/c2NMD2NNCPb15PkJH6NZfA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674789/WVxD-QOiWR1WqFjEJxPsOA/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674790/jQCsFYD1JTAQiXnsMLzb5w/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674792/4JE63ejsnrmunnaQbdOzaw/thumb.png?1504597550",
				"https://s3.amazonaws.com/files.d20.io/images/38674793/DKyKMaozsAF4-SFk5wLHyw/thumb.png?1504597550"
			]
		},
		barData = {
			stress: [
				"https://s3.amazonaws.com/files.d20.io/images/38675809/V5nERCth1C_wlLHYeX76_g/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675817/r4GLBWjw1Jnd94nYe8dV6g/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675816/tGLiljvaw02kAS19Li9csg/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675808/xkmXsioMiY_coSh4SSxLXQ/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675811/C5hh8RiPWK6scp3QnEKi0Q/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675813/sFRvm75tJAsVZKr9l9cXpA/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675810/7e4kJFdKOw3IqX4FYGmZqA/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675814/MX-MfWLSC4yr7eWsVmsJOw/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675812/ps4A_xG1s8RyOSrEfmryYQ/thumb.png?1504601438",
				"https://s3.amazonaws.com/files.d20.io/images/38675815/E3l5or2GpT1dkCu8OmxUkw/thumb.png?1504601438"
			],
			trauma: [
				"https://s3.amazonaws.com/files.d20.io/images/38675806/bCJ-RJYIEC7oav-FpPv6fA/thumb.png?1504601430",
				"https://s3.amazonaws.com/files.d20.io/images/38675854/-ONS5apbjB_t9nmkbwu6oQ/thumb.png?1504601675",
				"https://s3.amazonaws.com/files.d20.io/images/38675840/9-Rgsnnl3pmc4jj4UrW3tw/thumb.png?1504601614",
				"https://s3.amazonaws.com/files.d20.io/images/38675804/FLBCtN5xIsH1GRtbmDTI2g/thumb.png?1504601430",
				"https://s3.amazonaws.com/files.d20.io/images/38675805/QJqzxX7n3lJlXkUApdJxKw/thumb.png?1504601430"
			]
		},
		defaultConfig = {
			autoclock: true,
			position: [200, 300]
		},
		showHelp = function (playerid) {
			let output = '<div style="border:1px solid #888;border-radius:5px;background-color:#fff;padding:1px 3px;margin-left:-42px;">' +
				'BladesHelper for Scum & Villainy v1.1<br><br>' +
				'Credit for the stress and trauma tokens goes to Sven Düsterwald.<br><br>' +
				'**CONFIGURATION OPTIONS**<br><br>' +
				'1) You can change the URLs in the clockData and barData variables to use different graphics. Due to Roll20 restrictions, they need to be images uploaded to your Roll20 library, and it needs to be the "thumb" size variant.<br><br>' +
				'2) You can configure the script via the following commands:<br>' +
				'a) **!blades-helper config autoclock [on|off]** will turn automatic creation of clocks on the tabletop on or off, respectively (if one is created in a character sheet)<br>' +
				'b) **!blades-helper config position [x] [y]** will set the position of newly created tokens to the specified [x] and [y] coordinates. Defaults to 200 and 300.<br><br>' +
				'**USAGE**<br><br>' +
				'Any tokens created by this command will be created on the page you are currently on (if a GM), or on the page the player badge is currently on (otherwise).<br><br>' +
				'Adding a clock to a character sheet and naming it will automatically create a linked clock on the tabletop. Be careful to set the size first, and then the name, since the size will be locked in once the name has been entered. You can turn this behaviour off via the config command above.<br><br>' +
				'**!blades-helper add-clock &lt;size&gt; none &lt;name&gt;**<br>' +
				'Creates a new clock of size &lt;size&gt; with name &lt;name&gt; on the tabletop. This clock is not linked to any clock on a character sheet. Example:<br>' +
				'!blades-helper add-clock 8 none Drive off the Red Sashes gang<br><br>' +
				'**!blades-helper add-clock &lt;size&gt; char &lt;charid&gt; &lt;name&gt;**<br>Creates a new clock of size &lt;size&gt; on the tabletop, linked to the character with id &lt;charid&gt;, with name &lt;name&gt;. If the sheet is a character sheet, it will be put on the character page, if it is a crew sheet, it will be put on the crew page. "Linked" means that changes in either of the clocks will effect changes in the other one. Example:<br>' +
				'!blades-helper add-clock 6 char &#64;{Silver|character_id} Research demon binding<br><br>' +
				'**!blades-helper add-stress-bar &lt;charid&gt; &lt;attrname&gt;**<br>Creates a new stress bar on the tabletop, linked to the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br>' +
				'!blades-helper add-stress-bar &#64;{Canter Haig|character_id} stress<br>' +
				'!blades-helper add-stress-bar &#64;{Bloodletters|character_id} heat<br><br>' +
				'**!blades-helper add-trauma-bar &lt;charid&gt; &lt;attrname&gt;**<br>' +
				'Creates a new trauma bar on the tabletop, linked to the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br>' +
				'!blades-helper add-trauma-bar &#64;{Canter Haig|character_id} trauma<br>' +
				'!blades-helper add-stress-bar &#64;{Bloodletters|character_id} wanted<br><br>' +
				'**!blades-helper add-by-token &lt;attrname&gt;**<br>' +
				'Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character that the rollable table token represents. Example:<br>' +
				'!blades-helper add-by-token stress<br>' +
				'!blades-helper add-by-token trauma<br><br>**!blades-helper add-by-id &lt;charid&gt; &lt;attrname&gt;**<br>' +
				'Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br>' +
				'!blades-helper add-by-id &#64;{Silver|character_id} stress<br>' +
				'!blades-helper add-by-id &#64;{Silver|character_id} trauma<br><br>' +
				'**!blades-helper show**<br>' +
				'Shows all currently active links between tokens and character atributes.<br><br>' +
				'**!blades-helper remove**<br>' +
				'Removes any link for the currently selected tokens.<br><br>' +
				'**!blades-helper reset**<br>' +
				'Clears all links between tokens and attributes.' +
				'</div>';
			sendChatMessage(playerid, output);
		},
		generateUUID = function () {
			"use strict";
			var a = 0,
				b = [];
			return function () {
				var c = (new Date()).getTime() + 0,
					d = c === a;
				a = c;
				for (var e = new Array(8), f = 7; 0 <= f; f--) {
					e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
					c = Math.floor(c / 64);
				}
				c = e.join("");
				if (d) {
					for (f = 11; 0 <= f && 63 === b[f]; f--) {
						b[f] = 0;
					}
					b[f]++;
				}
				else {
					for (f = 0; 12 > f; f++) {
						b[f] = Math.floor(64 * Math.random());
					}
				}
				for (f = 0; 12 > f; f++) {
					c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
				}
				return c;
			};
		}(),
		generateRowID = function () {
			"use strict";
			return generateUUID().replace(/_/g, "Z");
		},
		checkInstall = function () {
			state.BladesHelper = (state.BladesHelper || {
				data: [],
				config: Object.assign({}, defaultConfig)
			});
			state.BladesHelper.data = state.BladesHelper.data.filter(v => {
				return (getObj('graphic', v.token) && getObj('character', v.character));
			});
			// Upgrade from pre-config versions
			if (!('config' in state.BladesHelper)) {
				state.BladesHelper.config = Object.assign({}, defaultConfig);
			}
			log('BladesHelper v1.2 active.');
		},
		checkPermission = function (playerid, character) {
			const control = character && character.get('controlledby').split(/,/);
			if (!playerIsGM(playerid) && control && !control.includes('all') && !control.includes(playerid)) {
				sendChatMessage(playerid, 'Permission denied.');
				return false;
			} else {
				return true;
			}
		},
		getClockAttributeFromSize = size => {
			const data = {
				'4': 'clock1',
				'6': 'clock2',
				'8': 'clock3',
				'12': 'clock4'
			};
			return data[size];
		},
		getGenericTokenData = function (playerid) {
			const data = {
				currentSide: 0,
				showplayers_name: true,
				showname: true,
				isdrawing: true,
				layer: 'objects',
				left: state.BladesHelper.config.position[0],
				top: state.BladesHelper.config.position[1]
			};
			data._pageid = playerIsGM(playerid) ? getObj('player', playerid).get('_lastpage') :
				Campaign().get('playerpageid');
			return data;
		},
		getClockTokenData = function (size, label, charID, playerid) {
			const data = Object.assign(getGenericTokenData(playerid), {
				imgsrc: clockData[size][0],
				name: label,
				sides: clockData[size].map(encodeURIComponent).join('|'),
				width: 44,
				height: 44
			});
			if (charID) data.represents = charID;
			else data.controlledby = playerid;
			return data;
		},
		getStressTokenData = function (charID, playerid) {
			return Object.assign(getGenericTokenData(playerid), {
				imgsrc: barData.stress[0],
				name: getObj('character', charID).get('name'),
				sides: barData.stress.map(encodeURIComponent).join('|'),
				represents: charID,
				width: 250,
				height: 50
			});
		},
		getTraumaTokenData = function (charID, playerid) {
			return Object.assign(getGenericTokenData(playerid), {
				imgsrc: barData.trauma[0],
				name: getObj('character', charID).get('name'),
				sides: barData.trauma.map(encodeURIComponent).join('|'),
				represents: charID,
				width: 100,
				height: 50
			});
		},
		handleInput = function (msg) {
			if (msg.type === 'api' && msg.content.match(/^!blades-helper/)) {
				const args = msg.content.split(' ').slice(1) || [''];
				let errorsExist = false;
				switch (args.shift()) {
				case 'config':
					if (args[0] === 'autoclock') {
						if (args[1] === 'on') {
							state.BladesHelper.config.autoclock = true;
							sendChatMessage(msg.playerid, 'Automatic clock creation turned <strong>on</strong>.');
						}
						else if (args[1] === 'off') {
							state.BladesHelper.config.autoclock = false;
							sendChatMessage(msg.playerid, 'Automatic clock creation turned <strong>off</strong>.');
						}
						else errorsExist = true;
					}
					else if (args[0] === 'position') {
						const x = parseInt(args[1]),
							y = parseInt(args[2]);
						if (isFinite(x) && isFinite(y)) {
							state.BladesHelper.config.position = [x, y];
							sendChatMessage(msg.playerid, `New default position for tokens is [${x},${y}].`);
						}
						else errorsExist = true;
					}
					else errorsExist = true;
					break;
				case 'add-by-id':
					if (args[0] && args[1] && msg.selected) {
						msg.selected.forEach(o => {
							const token = getObj('graphic', o._id),
								character = getObj('character', args[0]);
							if (checkPermission(msg.playerid, character) && token && token.get('sides') && character) {
								state.BladesHelper.data.push({
									character: args[0],
									token: token.id,
									attribute: args[1].toLowerCase()
								});
								sendChatMessage(msg.playerid, `Synchronization added for attribute ${args[1]} and character ${character.get('name')}.`);
							}
							else errorsExist = true;
						});
					}
					else errorsExist = true;
					break;
				case 'add-by-token':
					if (args[0]) {
						msg.selected.forEach(o => {
							const token = getObj('graphic', o._id);
							if (token && token.get('sides') && getObj('character', token.get('represents'))) {
								state.BladesHelper.data.push({
									character: token.get('represents'),
									token: token.id,
									attribute: args[0].toLowerCase()
								});
								sendChatMessage(msg.playerid, `Synchronization added for attribute ${args[0]} and character ${getObj('character', token.get('represents')).get('name')}.`);
							}
							else errorsExist = true;
						});
					}
					else errorsExist = true;
					break;
				case 'add-stress-bar':
					if (getObj('character', args[0]) && args[1]) {
						const character = getObj('character', args[0]);
						if (checkPermission(msg.playerid, character)) {
							const token = createObj('graphic', getStressTokenData(args[0]));
							state.BladesHelper.data.push({
								character: args[0],
								token: token.id,
								attribute: args[1].toLowerCase()
							});
							sendChatMessage(msg.playerid, `Stress bar added for attribute ${args[1]} and character ${character.get('name')}.`);
						}
					}
					else errorsExist = true;
					break;
				case 'add-trauma-bar':
					if (getObj('character', args[0]) && args[1]) {
						const character = getObj('character', args[0]);
						if (checkPermission(msg.playerid, character)) {
							const token = createObj('graphic', getTraumaTokenData(args[0]));
							state.BladesHelper.data.push({
								character: args[0],
								token: token.id,
								attribute: args[1].toLowerCase()
							});
							sendChatMessage(msg.playerid, `Trauma bar added for attribute ${args[1]} and character ${character.get('name')}.`);
						}
					}
					else errorsExist = true;
					break;
				case 'add-clock':
					const size = args[0],
						target = args[1],
						charID = (target === 'char') ? args[2] : null,
						label = args.slice((target === 'char') ? 3 : 2).join(' ');
					if (clockData[size] && (charID ? getObj('character', charID) : true)) {
						if (charID && !checkPermission(msg.playerid, getObj('character', charID))) return;
						const token = createObj('graphic', getClockTokenData(size, label, charID, msg.playerid));
						if (charID) {
							const rowID = generateRowID(),
								sectionName = (getAttrByName(charID, 'sheet_type') === 'crew') ? 'crewclock' : 'clock',
								attrName = `repeating_${sectionName}_${rowID}_${getClockAttributeFromSize(size)}`;
							createObj('attribute', {
								characterid: charID,
								name: `repeating_${sectionName}_${rowID}_size`,
								current: size
							});
							createObj('attribute', {
								characterid: charID,
								name: attrName,
								current: '0'
							});
							createObj('attribute', {
								characterid: charID,
								name: `repeating_${sectionName}_${rowID}_name`,
								current: label
							});
							state.BladesHelper.data.push({
								character: charID,
								token: token.id,
								attribute: attrName.toLowerCase()
							});
							sendChatMessage(msg.playerid, `New ${size}-clock added for ${getObj('character', charID).get('name')}.`);
						}
						else {
							sendChatMessage(msg.playerid, `New ${size}-clock added.`);
						}
					}
					else errorsExist = true;
					break;
				case 'remove':
					if (!msg.selected) return;
					const selectedIDs = msg.selected.map(o => o._id);
					state.BladesHelper.data = state.BladesHelper.data.filter(function (v) {
						if (selectedIDs.includes(v.token)) {
							const charName = getObj('character', v.character).get('name');
							sendChatMessage(msg.playerid, `Synchronization removed for attribute ${v.attribute} and character ${charName}.`);
							return false;
						}
						else return true;
					})
					break;
				case 'show':
					const output = '<div style="border:1px solid black;background-color:#FFFFFF;padding:3px">' +
						'<h4>Synchronisation data:</h4><br><table style="margin:3px;">' +
						'<tr><td><b>Character</b></td><td><b>Attribute name</b></tr>' +
						state.BladesHelper.data.map(v => `<tr><td>${getObj('character', v.character).get('name')}</td><td>${v.attribute}</td></tr>`).join('') +
						'</table><h4>Configuration:</h4><br><table style="margin:3px;">' +
						Object.entries(state.BladesHelper.config)
							.map(([k,v]) => `<tr><td style="padding-right: 10px"><b>${k}</b>:</td><td>${v}</td></tr>`).join('') +
						'</table></div>';
					sendChatMessage(msg.playerid, output);
					break;
				case 'reset':
					if (!playerIsGM(msg.playerid)) {
						sendChatMessage(msg.playerid, 'Permission denied.');
						return;
					}
					state.BladesHelper = {
						data: [],
						config: Object.assign({}, defaultConfig)
					};
					sendChatMessage(msg.playerid, 'State cleared, everything reset to default.');
					break;
				case 'help':
				default:
					showHelp(msg.playerid);
				}
				if (errorsExist) sendChatMessage(msg.playerid, 'Something went wrong with your command.');
			}
		},
		handleSideChange = function (token) {
			state.BladesHelper.data.filter(v => (v.token === token.id)).forEach(function (data) {
				const attr = findObjs({
					type: 'attribute',
					characterid: data.character,
					name: data.attribute
				}, {
					caseInsensitive: true
				})[0] || createObj({
					type: 'attribute',
					characterid: data.character,
					name: data.attribute
				});
				attr.set('current', token.get('currentSide'));
			});
		},
		handleAttrChange = function (attr) {
			state.BladesHelper.data.filter(v => {
				return (v.character === attr.get('characterid')) && (v.attribute === attr.get('name').toLowerCase());
			}).forEach(function (data) {
				const current = parseInt(attr.get('current')) || 0,
					token = getObj('graphic', data.token);
				if (!token) return;
				const sides = token.get('sides').split('|');
				token.set({
					currentSide: current,
					imgsrc: decodeURIComponent(sides[current] || sides[sides.length - 1]).replace('max', 'thumb')
				});
			});
		},
		handleAttrCreate = function (attribute) {
			const match = attribute.get('name').match(/^(repeating_(?:clock|crewclock)_(?:[A-Za-z0-9-]+?))_name/),
				charID = attribute.get('characterid'),
				charName = getObj('character', charID).get('name');
			if (state.BladesHelper.config.autoclock && match) {
				const size = getAttrByName(charID, match[1] + '_size');
				if (clockData[size]) {
					const token = createObj('graphic', getClockTokenData(size, attribute.get('current'), charID, 0));
					state.BladesHelper.data.push({
						character: charID,
						token: token.id,
						attribute: `${match[1]}_${getClockAttributeFromSize(size)}`.toLowerCase()
					});
					if (!findObjs({
							type: 'attribute',
							characterid: charID,
							name: `${match[1]}_${getClockAttributeFromSize(size)}`
						})[0]) createObj('attribute', {
						characterid: charID,
						name: `${match[1]}_${getClockAttributeFromSize(size)}`
					});
					sendChatMessage(null, `/w ${charName.split(' ')[0]} New ${size}-clock added for ${charName}.`);
				}
			}
		},
		handleTokenRemove = function (token) {
			state.BladesHelper.data = state.BladesHelper.data.filter(v => (v.token !== token.id));
		},
		handleCharRemove = function (character) {
			state.BladesHelper.data = state.BladesHelper.data.filter(v => (v.character !== character.id));
		},
		handleAttrRemove = function (attribute) {
			state.BladesHelper.data = state.BladesHelper.data.filter(v => (v.character !== attribute.characterid || v.attribute !== attribute.name.toLowerCase()));
		},
		registerEventHandlers = function () {
			on('chat:message', handleInput);
			on('change:graphic:currentSide', handleSideChange);
			on('change:attribute', handleAttrChange);
			on('add:attribute', handleAttrChange);
			on('destroy:graphic', handleTokenRemove);
			on('destroy:character', handleCharRemove);
			on('destroy:attribute', handleAttrRemove);
			on('add:attribute', handleAttrCreate);
		};
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());
on('ready', function () {
	'use strict';
	bladesHelper.CheckInstall();
	bladesHelper.RegisterEventHandlers();
});
