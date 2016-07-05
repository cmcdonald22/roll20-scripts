var reshapedSettings = reshapedSettings || (function() {
    'use strict';
    
    var version = '0.3.0',
    sheetVersion = '5.0.0+',
    defaultSettings = {
        'output_option': '', // can be '' or '/w GM'
        'death_save_output_option': '', // can be @{output_option} or '/w GM' or ''
        'initiative_output_option': '', // can be @{output_option} or '/w GM' or ''
        'show_character_name': '{{show_character_name=1}}', // can be '' or {{show_character_name=1}}
        'initiative_roll': '@{normal_initiative}', // can be @{normal_initiative}, @{advantage_on_initiative}, or @{disadvantage_on_initiative}
        'initiative_to_tracker': '@{selected|initiative_formula} &{tracker}', // can be @{initiative_formula} (NO) or @{selected|initiative_formula} &{tracker} (YES)
        'initiative_tie_breaker': '0', // can be 0 or [[@{initiative} / 100]][tie breaker]
        'attacks_vs_target_ac': '', // can be '' or [[@{target|AC}]]
        'attacks_vs_target_name': '', // can be '' or @{target|token_name}
        'edit_mode': '0', // can be 0 or on
        'saving_throws_half_proficiency': '0', // can be 0 or on
        'hide_ability_checks': '0', // can be 0 or {{hide_ability_checks=1}}
        'hide_saving_throws': '0', // can be 0 or {{hide_saving_throws=1}}
        'hide_attack': '0', // can be 0 or {{hide_attack=1}}
        'hide_damage': '0', // can be 0 or {{hide_damage=1}}
        'hide_saving_throw_dc': '0', // can be 0 or {{hide_saving_throw_dc=1}}
        'hide_saving_throw_failure': '{{hide_saving_throw_failure=1}}', // can be 0 or {{hide_saving_throw_failure=1}}
        'hide_saving_throw_success': '{{hide_saving_throw_success=1}}', // can be 0 or {{hide_saving_throw_success=1}}
        'hide_recharge': '{{hide_recharge=1}}', // can be 0 or {{hide_recharge=1}}
        'hide_spell_content': '{{hide_spell_content=1}}', // can be 0 or {{hide_spell_content=1}}
        'hide_action_freetext': '{{hide_freetext=1}}', // can be 0 or {{hide_freetext=1}}
        'shaped_d20': '10d1cf0' // whatever will be rolled instead of a d20
//        'roll_setting': '{{ignore=[[0', // can be {{ignore=[[0 OR  adv {{ignore=[[0 OR dis {{ignore=[[0 OR {{roll2=[[d20@{d20_mod}

    },
    defaultSettingsAlt = {
        'output_option': '', // can be '' or '/w GM'
        'death_save_output_option': '', // can be @{output_option} or '/w GM' or ''
        'initiative_output_option': '', // can be @{output_option} or '/w GM' or ''
        'show_character_name': '{{show_character_name=1}}', // can be '' or {{show_character_name=1}}
        'initiative_roll': '@{normal_initiative}', // can be @{normal_initiative}, @{advantage_on_initiative}, or @{disadvantage_on_initiative}
        'initiative_to_tracker': '@{selected|initiative_formula} &{tracker}', // can be @{initiative_formula} (NO) or @{selected|initiative_formula} &{tracker} (YES)
        'initiative_tie_breaker': '0', // can be 0 or [[@{initiative} / 100]][tie breaker]
        'attacks_vs_target_ac': '', // can be '' or [[@{target|AC}]]
        'attacks_vs_target_name': '', // can be '' or @{target|token_name}
        'edit_mode': '0', // can be 0 or on
        'saving_throws_half_proficiency': '0', // can be 0 or on
        'hide_ability_checks': '0', // can be 0 or {{hide_ability_checks=1}}
        'hide_saving_throws': '0', // can be 0 or {{hide_saving_throws=1}}
        'hide_attack': '0', // can be 0 or {{hide_attack=1}}
        'hide_damage': '0', // can be 0 or {{hide_damage=1}}
        'hide_saving_throw_dc': '0', // can be 0 or {{hide_saving_throw_dc=1}}
        'hide_saving_throw_failure': '{{hide_saving_throw_failure=1}}', // can be 0 or {{hide_saving_throw_failure=1}}
        'hide_saving_throw_success': '{{hide_saving_throw_success=1}}', // can be 0 or {{hide_saving_throw_success=1}}
        'hide_recharge': '{{hide_recharge=1}}', // can be 0 or {{hide_recharge=1}}
        'hide_spell_content': '{{hide_spell_content=1}}', // can be 0 or {{hide_spell_content=1}}
        'hide_action_freetext': '{{hide_freetext=1}}', // can be 0 or {{hide_freetext=1}}
        'shaped_d20': '10d1cs0cf0' // whatever will be rolled instead of a d20
//        'roll_setting': '{{ignore=[[0', // can be {{ignore=[[0 OR  adv {{ignore=[[0 OR dis {{ignore=[[0 OR {{roll2=[[d20@{d20_mod}
    },
    cleanExclusionList = ['version', 'is_npc', 'tab', 'edit_mode'],
        
    checkInstall = function() {
        log('Reshaped Sheet Default Settings v'+version+' for D&D 5E Reshaped '+sheetVersion+' is ready! Default Settings are: \n'+JSON.stringify(defaultSettings));
    },

    escapeAttr = function(text) {
        return text.replace("{", "&#123;").replace("@", "&#64;").replace("}", "&#125;")
    },
    
    printHelp = function(who) {
        var helpString;
        helpString = "<div style=\"border: 1px solid black; background-color: white; padding: 3px 3px; font-weight: normal;\">";
        helpString += "<h3>Reshaped Sheet Default Settings<br />Help</h3>";
        helpString += "<h4>Usage</h4>";
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += "<i>Select a number of tokens representing a character and run the following to apply default settings:</i>";
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!rsettings '+
                        '</pre>'+
                    '</div>';
        helpString += '<b>or</b>';
        helpString += '<div style="padding-left: 10px;padding-right:20px">';
        helpString += "<i>Select a number of tokens representing a character and run the following to delete all sheet state:</i>";
        helpString += '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!rsettings --clean'+
                        '</pre>'+
                    '</div>';
        helpString += "<h4>Settings</h4>";
        helpString += '<ul style="list-style-type: none;">';
        for (var s in defaultSettings) {
            helpString += "<li>"+s+'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+escapeAttr(defaultSettings[s])+"</pre></li>";
        }
        helpString += "</ul>";
        helpString += "</div>";
        sendChat(who, "/w " + who + " " + helpString);
    },
    
    handleError = function(who, errorMsg, opts) {
        var output = "/w " + who;
        output += "<div style=\"border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;\">";
        output += "<h4>Error</h4>";
        output += "<p>"+errorMsg+"</p>";
        output += "Input was: <p>" + JSON.stringify(opts) + "</p>";
        output += "</div>";
        sendChat(who, output);
    },

    outputUpdate = function(who, msg, characterName) {
        var output = "/w " + who;
        output += "<div style=\"border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;\">";
        output += "<h4>Success</h4>";
        output += "<p>" + msg + "</p>";
        output += "<p><b>Character: </b>" + characterName + "</p>";
        output += "</div>";
        sendChat(who, output);
    },

    myGetAttrByName = function(character_id,
                         attribute_name,
                         attribute_default_current,
                         attribute_default_max) {
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

    cleanCharacter = function(who, characterId) {
        var attr, attrI, attrName, attrs, deleted = "Deleted: ";
        attrs = findObjs({type:'attribute', characterid:characterId});

        for (attrI in attrs) {
            attr = attrs[attrI];
            attrName = attr.get('name');
            if (!_.contains(cleanExclusionList, attrName)) {
                deleted += attrName + ", ";
                attr.remove();
            }
        }
        outputUpdate(who, "Cleaned character sheet.<br />"+deleted, characterId);
    },
    
    handleInput = function(msg) {
        var args, opts, token, character, characterId, attr, setting;
    
        if (msg.type !== "api") {
            return;
        }
    
        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!rsettings':            
                
                opts = {};
                for (var arg in args) {
                    var kv = args[arg].split(/\s+/);
                    if (kv[1]) {
                        opts[kv[0]] = kv[1];
                    } else {
                        opts[kv[0]] = true;
                    }
                }

                if (opts.help) {
                    printHelp(msg.who);
                    return;
                }

                if (msg.selected && msg.selected.length) {
                    for (var sel in msg.selected) {                        
                        token = getObj('graphic', msg.selected[sel]._id);
                        //log('Selected token ' + JSON.stringify(token));
                        characterId = token.get("represents");
                        if (characterId) {
                            if (opts.clean) {
                                cleanCharacter(msg.who, characterId);
                            } 
                            if (opts.alt) {
                                character = getObj("character", characterId);
                                for (var s in defaultSettingsAlt) {
                                    setting = defaultSettingsAlt[s];
                                    attr = myGetAttrByName(character.id, s);
                                    attr.set("current", setting);
                                    //log("Setting "+s+" to "+setting+" in "+JSON.stringify(attr));
                                }
                            } else {
                                character = getObj("character", characterId);
                                for (var s in defaultSettings) {
                                    setting = defaultSettings[s];
                                    attr = myGetAttrByName(character.id, s);
                                    attr.set("current", setting);
                                    //log("Setting "+s+" to "+setting+" in "+JSON.stringify(attr));
                                }
                                outputUpdate(msg.who, "Updated character settings.", character.get("name"));
                            }
                        } else {
                            handleError(msg.who, "Token does not represent a character!", token);
                        }
                    }
                    return;
                }
                
                handleError(msg.who, "Don't know what to do!", opts);
        }  
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

    reshapedSettings.CheckInstall();
    reshapedSettings.RegisterEventHandlers();
});
