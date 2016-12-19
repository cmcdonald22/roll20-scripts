var Scriptlets = Scriptlets || function () {
  'use strict';
  const bar = '3',
    checkInstall = function () {
      registerWithTokenMod();
    },
    registerWithTokenMod = function () {
      try {
        TokenMod.ObserveTokenChange(function (token, prev) {
          if (token.get(`bar${bar}_value`) !== prev[`bar${bar}_value`]) {
            handleHPBarChange(token);
          }
        });
      }
      catch (e) {}
    },
    // Remove NPC token from the turn order if bar${bar}_value is nonpositive
    // Add dead marker to token whose bar${bar}_value is nonpositive, remove it
    // if it becomes positive
    handleHPBarChange = function (token) {
      if (token.get(`bar${bar}_value`) <= 0) {
        token.set('status_dead', true);
        let character = getObj('character', token.get('represents')) || token;
        if (_.isEmpty(character.get('controlledby'))) {
          let turnorder = _.reject(JSON.parse(Campaign().get('turnorder') || '[]'),
            i => (token.id === i.id));
          Campaign().set('turnorder', JSON.stringify(turnorder));
        }
      }
      else {
        token.set('status_dead', false);
      }
    },
    registerEventHandlers = function () {
      on(`change:graphic:bar${bar}_value`, handleHPBarChange);
    };
  return {
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers
  }
}();
on('ready', function () {
  scriptlets.CheckInstall();
  scriptlets.RegisterEventHandlers();
});
