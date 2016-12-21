var Scriptlets = Scriptlets || function () {
  'use strict';
  const hpBar = '3',
    checkInstall = function () {
      log('-=> Extra scriptlets installed. <=-');
      registerWithTokenMod();
    },
    registerWithTokenMod = function () {
      try {
        TokenMod.ObserveTokenChange(function (token, prev) {
          if (token.get(`bar${hpBar}_value`) !== prev[`bar${bar}_value`]) {
            handleHPBarChange(token);
          }
        });
      } catch (e) {}
    },
    // Utility functions
    processInlinerolls = function (msg) {
      if (_.has(msg, 'inlinerolls')) {
        return _.chain(msg.inlinerolls)
          .reduce(function (m, v, k) {
            let ti = _.reduce(v.results.rolls, function (m2, v2) {
              if (_.has(v2, 'table')) {
                m2.push(_.reduce(v2.results, function (m3, v3) {
                  m3.push(v3.tableItem.name);
                  return m3;
                }, []).join(', '));
              }
              return m2;
            }, []).join(', ');
            m['$[[' + k + ']]'] = (ti.length && ti) || v.results.total || 0;
            return m;
          }, {})
          .reduce((m, v, k) => m.replace(k, v), msg.content)
          .value();
      } else {
        return msg.content;
      }
    },
    parseOpts = function (content, hasValue) {
      return _.chain(content.replace(/<br\/>\n/g, ' ')
          .replace(/({{(.*?)\s*}}\s*$)/g, '$2')
          .split(/\s+--/))
        .rest()
        .reduce(function (opts, arg) {
          let kv = arg.split(/\s(.+)/);
          (_.contains(hasValue, kv[0])) ? (opts[kv[0]] = (kv[1] || '')) :
          (opts[arg] = true);
          return opts;
        }, {})
        .value();
    },
    getWhisperPrefix = function (playerid) {
      let player = getObj('player', playerid);
      if (player && player.get('_displayname')) {
        return '/w "' + player.get('_displayname') + '" ';
      } else {
        return '/w GM ';
      }
    },
    handleError = function (whisper, error) {
      if (error) {
        let output = whisper + '<div style="border:1px solid black;' +
          'background-color:#FFBABA;padding:3px"><h4>Errors</h4>' +
          `<p>${error}</p></div>`;
        sendChat('API', output);
      }
    },
    // Remove NPC token from the turn order if bar${bar}_value is nonpositive
    // Add dead marker to token whose bar${bar}_value is nonpositive, remove it
    // if it becomes positive
    handleHPBarChange = function (token) {
      if (token.get(`bar${hpBar}_value`) <= 0) {
        token.set('status_dead', true);
        let character = getObj('character', token.get('represents')) || token;
        if (_.isEmpty(character.get('controlledby'))) {
          let turnoOrder = _.reject(JSON.parse(Campaign().get('turnorder')) || [],
            i => (token.id === i.id));
          Campaign().set('turnorder', JSON.stringify(turnOrder));
        }
      } else {
        token.set('status_dead', false);
      }
    },
    // Manually add items to turnorder
    handleAddToTracker = function (msg) {
      let turnOrder,
        optsList = {
          delta: {
            type: 'string',
            def: -1
          },
          init: {
            type: 'string',
            def: 0
          },
          name: {
            type: 'string',
            def: 'Effect'
          }
        },
        hasValue = _.chain(optsList).pick(o => o.type === 'string').keys().value(),
        defaultOpts = _.chain(optsList).pick(o => _.has(o, 'def'))
        .mapObject(o => o.def).value(),
        opts = parseOpts(processInlinerolls(msg), hasValue);
      turnOrder = JSON.parse(Campaign().get('turnorder')) || [];
      opts.delta = parseFloat(opts.delta);
      _.isNaN(opts.delta) || _.isNull(opts.delta) ? opts.delta = defaultOpts.delta : null;
      opts.init = _.has(opts, 'init') ? parseFloat(opts.init) :
      	(turnOrder.length ? turnOrder[0]['pr'] : null);
      opts.init = opts.init || defaultOpts.init;
      opts.name = opts.name || defaultOpts.name;
      turnOrder.push({
        id: '-1',
        pr: opts.init,
        formula: opts.delta,
        custom: opts.name
      });
      try {
        Campaign().set('turnorder', JSON.stringify(turnOrder));
      } catch (e) {
        handleError(getWhisperPrefix(msg.playerid), 'Something went wrong when trying ' +
          'to add the item to the tracker. The error message was ' + e);
      }
    },
    handleInput = function (msg) {
      if (msg.type === 'api') {
        let match = msg.content.match(/^!(tracker)\b/);
        if (match && match[1] === 'tracker' && playerIsGM(msg.playerid)) {
          handleAddToTracker(msg);
        }
      }
    },
    registerEventHandlers = function () {
      on(`change:graphic:bar${hpBar}_value`, handleHPBarChange);
      on('chat:message', handleInput);
    };
  return {
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers
  }
}();
on('ready', function () {
  Scriptlets.CheckInstall();
  Scriptlets.RegisterEventHandlers();
});
