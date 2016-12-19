var scriptlets = scriptlets || function () {
  'use strict';
  const bar = '3',
    checkInstall = function () {
      registerWithTokenMod();
    },
    registerWithTokenMod = function () {
      if (TokenMod && TokenMod.ObserveTokenChange) {
        TokenMod.ObserveTokenChange(function () {
          if (obj.get(`bar${bar}_value`) !== prev[`bar${bar}_value`]) {
            handleHPBarChange(obj);
          }
        });
      }
    },
    // Remove NPC token from the turn order if bar${bar}_value is nonpositive
    // Add dead marker to token whose bar${bar}_value is nonpositive, remove it
    // if it becomes positive
    handleHPBarChange = function (obj) {
      if (obj.get(`bar${bar}_value`) <= 0) {
        obj.set('status_dead', true);
        if (_.isEmpty((getObj('character', obj.get('represents')) || {
            get: s => obj.get(s)
          }).get('controlledby'))) {
          Campaign().set('turnorder',
            JSON.stringify(_.reject(JSON.parse(Campaign().get('turnorder') || '[]'),
              i => (obj.id === i.id)))
          );
        }
      }
      else {
        obj.set('status_dead', false);
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
