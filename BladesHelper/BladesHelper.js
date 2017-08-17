// BladesHelper v1.1
//
// Credit for the stress and trauma tokens goes to Sven Düsterwald
//
// CONFIGURATION
//
// 1) The position variable stores the x-y coordinates of the point where the clocks will appear.
//    Change it to put them somewhere else.
//
// 2) You can change the URLs in the clockData and barData variables to use different graphics.
//    Due to Roll20 restrictions, they need to be images uploaded to your Roll20 library,
//    and it needs to be the "thumb" size variant.
//
// USAGE
//
// * Adding a clock to a character sheet and naming it will automatically create a linked
//   clock on the tabletop. Be careful to set the size first, and then the name, since the
//   size will be locked in once the name has been entered.
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
// * !blades-helper clear
//   Clears all links between tokens and attributes.

var bladesHelper = bladesHelper || (function () {
	'use strict';
	const position = [300, 200],
		sendChatNoArchive = function (content) {
			sendChat('API', content, null, {
				noarchive: true
			});
		},
		clockData = {
			'4': [
				"https://s3.amazonaws.com/files.d20.io/images/35514005/KGnvHj8rXV9e_ptSAGiDFw/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514004/X6W9TBuJuUNI3pNyTX5H8w/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514006/oLpG5gx3pedx7AS6IfuxLQ/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514003/3oqSNO0k82HDxjfXzlbd5A/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514007/FTMqqS_IMjUJcCUAZB4sgA/thumb.png?1499238433"
			],
			'6': [
				"https://s3.amazonaws.com/files.d20.io/images/35514008/x4VQqGYDED0-R_M7xowR2A/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514010/H_L8trySbMhcGci5IR2pGQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514013/PWmtubH-YwptGm0BoHFI3g/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514011/8spAob5xL2yzG4TY-LNzow/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514009/cEDUJu3j6C3kGGKf0oC4KA/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514014/xukjwxESXN4TIzVvIm4Alw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514012/NypxonvUPhqO0NYnqG3O7g/thumb.png?1499238434"
			],
			'8': [
				"https://s3.amazonaws.com/files.d20.io/images/35514015/mJwweMb2l7N_m45gP5Cxwg/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514016/7CL1Ai2a1VZIb7ytiCbXrw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514017/37g3r5OzCxtrtTkSdhUmPw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514020/ooGYGtaWzwcwQR0vn1hK8Q/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514019/0jx-6XziI1mKsZzYhSmzIQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514018/H1p9Y0UL_FSUEHoU8Me2YQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514022/9Vqzn1KRu5UnbBpnNGZoiA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514021/5AU5vJ2GBwwyNsyYvbUeew/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514023/fXzMAd9R3rt4hfCpcmeemg/thumb.png?1499238435"
			],
			'12': [
				"https://s3.amazonaws.com/files.d20.io/images/35514024/DhHigc3JKGXcdYHcdkIFyQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514025/R7vypCgyZurdCBwqvWS9gg/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514026/a8CcyRWolBPvXA28QYJWeA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514027/lCUt7GWZZu7QharPaVCqXQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514028/G36Y2fgYBK6toXNKXdVKOQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514029/XyjxG9F8NVSBFOGj4P2Nhg/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514031/HD4WyjEc3_kSo-1_B49Tng/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514030/QV6CYmr01UGtjrMdgeBqog/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514032/1mMD24lOUreGnq91dzb-qA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514035/2l3zSg_w_PgLwBNIv5SjPw/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514033/SB4yYBrs_yYn2uhTvzqK6g/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514034/4iOvfBjI6CyTPLc8S8Br5Q/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514036/9ohiSWYdqynOutaZBwbPiQ/thumb.png?1499238436"
			],
		},
		barData = {
			stress: [
				"https://s3.amazonaws.com/files.d20.io/images/35195597/vO5OicwTX5q0iH1s8yOSrg/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195594/ULZopRDQRDelAPT-GVjUeQ/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195599/FI7az9eTLjeD8b3U7Oxe1A/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195598/O0rDdD_pZRW6FCyslpfMYg/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195595/SCndaFzRf0M273nKlbr3fg/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195596/WL7s6zWxkQNym7J1B_fvgg/thumb.png?1498658809",
				"https://s3.amazonaws.com/files.d20.io/images/35195600/Gl9dSZ9DOZR3epeSBeVn5A/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195601/qPbAvsrImE4W7J_v8BED7Q/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195602/h75QakzNUuMcqSz1O3uHPQ/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195604/2x603iVUh7TCMpCAH037_Q/thumb.png?1498658810"
			],
			trauma: [
				"https://s3.amazonaws.com/files.d20.io/images/35195603/G1svSbSWR3FUC_64IN5ZIg/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195605/bLHn4acHfeLgbP1u4y_8dw/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195609/IiXyk1ULveb5_l6Plqdstg/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195608/CfR_8yXi88y5qshbYUacsw/thumb.png?1498658810",
				"https://s3.amazonaws.com/files.d20.io/images/35195607/8dwUW46sa4_1aIClmvypMw/thumb.png?1498658810"
			]
		},
		showHelp = function (whisper) {
			let output = whisper + '<div style="border:1px solid #888;border-radius:5px;' +
				'background-color:#FFFFFF;padding:1px 3px;margin-left:-42px;">' +
				'BladesHelper v1.1<br><br>Credit for the stress and trauma tokens goes to Sven Düsterwald.<br><br>**CONFIGURATION OPTIONS**<br><br>1) The position variable stores the x-y coordinates of the point where the clocks will appear. Change it to put them somewhere else.<br><br>2) You can change the URLs in the clockData and barData variables to use different graphics. Due to Roll20 restrictions, they need to be images uploaded to your Roll20 library, and it needs to be the "thumb" size variant.<br><br>**USAGE**<br><br> Adding a clock to a character sheet and naming it will automatically create a linked clock on the tabletop. Be careful to set the size first, and then the name, since the size will be locked in once the name has been entered.<br><br> **!blades-helper add-clock &lt;size&gt; none &lt;name&gt;**<br>Creates a new clock of size &lt;size&gt; with name &lt;name&gt; on the tabletop. This clock is not linked to any clock on a character sheet. Example:<br> !blades-helper add-clock 8 none Drive off the Red Sashes gang<br><br>**!blades-helper add-clock &lt;size&gt; char &lt;charid&gt; &lt;name&gt;**<br>Creates a new clock of size &lt;size&gt; on the tabletop, linked to the character with id &lt;charid&gt;, with name &lt;name&gt;. If the sheet is a character sheet, it will be put on the character page, if it is a crew sheet, it will be put on the crew page. "Linked" means that changes in either of the clocks will effect changes in the other one. Example:<br> !blades-helper add-clock 6 char @{Silver|character_id} Research demon binding<br><br>**!blades-helper add-stress-bar &lt;charid&gt; &lt;attrname&gt;**<br>Creates a new stress bar on the tabletop, linked to the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br> !blades-helper add-stress-bar @{Canter Haig|character_id} stress<br>!blades-helper add-stress-bar @{Bloodletters|character_id} heat<br><br>**!blades-helper add-trauma-bar &lt;charid&gt; &lt;attrname&gt;**<br>Creates a new trauma bar on the tabletop, linked to the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br> !blades-helper add-trauma-bar @{Canter Haig|character_id} trauma<br> !blades-helper add-stress-bar @{Bloodletters|character_id} wanted<br><br>**!blades-helper add-by-token &lt;attrname&gt;**<br>Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character that the rollable table token represents. Example:<br> !blades-helper add-by-token stress<br> !blades-helper add-by-token trauma<br><br>**!blades-helper add-by-id &lt;charid&gt; &lt;attrname&gt;**<br>Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br> !blades-helper add-by-id @{Silver|character_id} stress<br> !blades-helper add-by-id @{Silver|character_id} trauma<br><br>**!blades-helper show**<br>Shows all currently active links between tokens and character atributes.<br><br>**!blades-helper remove**<br>Removes any link for the currently selected tokens.<br><br>**!blades-helper clear**<br>Clears all links between tokens and attributes.' + '</div>';
			sendChatNoArchive(output);
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
				data: []
			});
			state.BladesHelper.data = state.BladesHelper.data.filter(v => {
				return (getObj('graphic', v.token) && getObj('character', v.character));
			});
			log('BladesHelper active.');
		},
		getWhisperPrefix = function (playerid) {
			const player = getObj('player', playerid);
			if (player && player.get('_displayname')) {
				return '/w "' + player.get('_displayname') + '" ';
			}
			else {
				return '/w GM ';
			}
		},
		getGenericTokenData = name => ({
			currentSide: 0,
			showplayers_name: true,
			showname: true,
			name: name,
			_pageid: Campaign().get('playerpageid'),
			isdrawing: true,
			layer: 'objects',
			left: position[0],
			top: position[1]
		}),
		getClockTokenData = function (size, label, charID, playerid) {
			const data = Object.assign(getGenericTokenData(label), {
				imgsrc: clockData[size][0],
				sides: clockData[size].map(encodeURIComponent).join('|'),
				width: 52,
				height: 52
			});
			if (charID) data.represents = charID;
			else data.controlledby = playerid;
			return data;
		},
		getStressTokenData = function (charID) {
			return Object.assign(getGenericTokenData(getObj('character', charID).get('name')), {
				imgsrc: barData.stress[0],
				sides: barData.stress.map(encodeURIComponent).join('|'),
				represents: charID,
				width: 288,
				height: 40
			});
		},
		getTraumaTokenData = function (charID) {
			return Object.assign(getGenericTokenData(getObj('character', charID).get('name')), {
				imgsrc: barData.trauma[0],
				sides: barData.trauma.map(encodeURIComponent).join('|'),
				represents: charID,
				width: 100,
				height: 40
			});
		},
		handleInput = function (msg) {
			if (msg.type === 'api' && msg.content.match(/^!blades-helper/)) {
				const args = msg.content.split(' ').slice(1) || [''],
					whisper = getWhisperPrefix(msg.playerid);
				let character, control;
				switch (args.shift()) {
				case 'add-by-id':
					if (args[0] && args[1] && msg.selected) {
						msg.selected.forEach(o => {
							const token = getObj('graphic', o._id),
								character = getObj('character', args[0]),
								control = character && character.get('controlledby').split(/,/);
							if (!playerIsGM(msg.playerid) && control && !control.includes('all') && !control.includes(msg.playerid)) {
								sendChatNoArchive(`${whisper} Permission denied.`);
								return;
							}
							if (token && token.get('sides') && character) {
								state.BladesHelper.data.push({
									character: args[0],
									token: token.id,
									attribute: args[1].toLowerCase()
								});
								sendChatNoArchive(`${whisper} Synchronization added for attribute ${args[1]} and character ${character.get('name')}.`);
							}
						});
					}
					break;
				case 'add-by-token':
					if (args[0]) {
						msg.selected.forEach(o => {
							const token = getObj('graphic', o._id);
							if (!token || !token.get('sides')) return;
							const character = getObj('character', token.get('represents'));
							if (!character) return;
							state.BladesHelper.data.push({
								character: token.get('represents'),
								token: token.id,
								attribute: args[0].toLowerCase()
							});
							sendChatNoArchive(`${whisper} Synchronization added for attribute ${args[0]} and character ${character.get('name')}.`);
						});
					}
					break;
				case 'add-stress-bar':
					if (getObj('character', args[0]) && args[1]) {
						character = getObj('character', args[0]);
						control = character && character.get('controlledby').split(/,/);
						if (!playerIsGM(msg.playerid) && control && !control.includes('all') && !control.includes(msg.playerid)) {
							sendChatNoArchive(`${whisper} Permission denied.`);
							return;
						}
						const token = createObj('graphic', getStressTokenData(args[0]));
						state.BladesHelper.data.push({
							character: args[0],
							token: token.id,
							attribute: args[1].toLowerCase()
						});
						sendChatNoArchive(`${whisper} Stress bar added for attribute ${args[1]} and character ${character.get('name')}.`);
					}
					break;
				case 'add-trauma-bar':
					if (getObj('character', args[0]) && args[1]) {
						character = getObj('character', args[0]);
						control = character && character.get('controlledby').split(/,/);
						if (!playerIsGM(msg.playerid) && control && !control.includes('all') && !control.includes(msg.playerid)) {
							sendChatNoArchive(`${whisper} Permission denied.`);
							return;
						}
						const token = createObj('graphic', getTraumaTokenData(args[0]));
						state.BladesHelper.data.push({
							character: args[0],
							token: token.id,
							attribute: args[1].toLowerCase()
						});
						sendChatNoArchive(`${whisper} Trauma bar added for attribute ${args[1]} and character ${character.get('name')}.`);
					}
					break;
				case 'add-clock':
					const size = args[0],
						target = args[1],
						charID = (target === 'char') ? args[2] : null,
						label = args.slice((target === 'char') ? 3 : 2).join(' ');
					if (clockData[size] && (charID ? getObj('character', charID) : true)) {
						if (charID) {
							character = getObj('character', charID);
							control = character && character.get('controlledby').split(/,/);
							if (!playerIsGM(msg.playerid) && control && !control.includes('all') && !control.includes(msg.playerid)) {
								sendChatNoArchive(`${whisper} Permission denied.`);
								return;
							}
						}
						const token = createObj('graphic', getClockTokenData(size, label, charID, msg.playerid));
						if (charID) {
							const rowID = generateRowID(),
								sectionName = (getAttrByName(charID, 'sheet_type') === 'crew') ? 'crewclock' : 'clock',
								attrName = `repeating_${sectionName}_${rowID}_progress`;
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
							sendChatNoArchive(`${whisper} New ${size}-clock added for ${getObj('character', charID).get('name')}.`);
						}
						else {
							sendChatNoArchive(`${whisper} New ${size}-clock added.`);
						}
					}
					break;
				case 'remove':
					if (!msg.selected) return;
					const selectedIDs = msg.selected.map(o => o._id);
					state.BladesHelper.data = state.BladesHelper.data.filter(function (v) {
						if (selectedIDs.includes(v.token)) {
							const charName = getObj('character', v.character).get('name');
							sendChatNoArchive(`${whisper} Synchronization removed for attribute ${v.attribute} and character ${charName}.`);
							return false;
						}
						else return true;
					})
					break;
				case 'show':
					const output = whisper + '<div style="border:1px solid black;background-color:#FFFFFF;padding:3px">' +
						'<h4>Synchronisation data:</h4><br><table style="margin:3px;">' +
						'<tr><td><b>Character</b></td><td><b>Attribute name</b></tr>' +
						state.BladesHelper.data.map(v => `<tr><td>${getObj('character', v.character).get('name')}</td><td>${v.attribute}</td></tr>`).join('') +
						'</table></div>';
					sendChatNoArchive(output);
					break;
				case 'help':
				case '':
					showHelp(whisper);
					break;
				case 'clear':
					if (!playerIsGM(msg.playerid)) {
						sendChatNoArchive(`${whisper} Permission denied.`);
						return;
					}
					state.BladesHelper = {
						data: []
					};
					sendChatNoArchive(whisper + 'Synchronisation data cleared.');
				}
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
				whisper = getWhisperPrefix(getObj('character', charID).get('controlledby'));
			if (match) {
				const size = getAttrByName(charID, match[1] + '_size');
				if (clockData[size]) {
					const token = createObj('graphic', getClockTokenData(size, attribute.get('current'), charID, 0));
					state.BladesHelper.data.push({
						character: charID,
						token: token.id,
						attribute: `${match[1]}_progress`.toLowerCase()
					});
					if (!findObjs({
							type: 'attribute',
							characterid: charID,
							name: `${match[1]}_progress`
						})[0]) createObj('attribute', {
						characterid: charID,
						name: `${match[1]}_progress`
					});
					sendChatNoArchive(`${whisper} New ${size}-clock added for ${getObj('character', charID).get('name')}.`);
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
