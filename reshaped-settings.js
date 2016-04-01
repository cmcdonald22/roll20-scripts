var reshapedSettings = reshapedSettings || (function() {
    'use strict';
    
    var version = '0.2.0',
    sheetVersion = '2.2.19+',
    defaultSettings = {
        'output_option': '@{output_to_all}', // can be @{output_to_gm} or @{output_to_all}
        'death_save_output_option': '@{output_to_gm}', // can be @{output_to_gm} or @{output_to_all}
        'initiative_output_option': '@{output_to_gm}', // can be @{output_to_gm} or @{output_to_all}
        'show_character_name': '@{show_character_name_yes}', // can be @{show_character_name_yes} or @{show_character_name_no}
        'roll_setting': '@{roll_1}', // can be @{roll_1}, @{roll_advantage}, @{roll_disadvantage}, or @{roll_2}
        'initiative_roll': '@{normal_initiative}', // can be @{normal_initiative}, @{advantage_on_initiative}, or @{disadvantage_on_initiative}
        'initiative_tie_breaker': '', // can be @{initiative_tie_breaker_var} or empty ('')
        'initiative_to_tracker': '@{initiative_to_tracker_yes}', // can be @{initiative_to_tracker_yes} or @{initiative_to_tracker_no}
        'attacks_vs_target_ac': '@{attacks_vs_target_ac_no}', // can be @{attacks_vs_target_ac_yes} or @{attacks_vs_target_ac_no}
        'attacks_vs_target_name': '@{attacks_vs_target_name_no}', // can be @{attacks_vs_target_name_yes} or @{attacks_vs_target_name_no}
        'edit_mode': '0',
        'hide_attack': '@{hide_attack_var}',
        'hide_damage': '@{hide_damage_var}',
        'hide_saving_throw_failure': '@{hide_saving_throw_failure_var}',
        'hide_saving_throw_success': '@{hide_saving_throw_success_var}',
        'hide_recharge': '@{hide_recharge_var}',
        'hide_saving_throw_dc': '@{hide_saving_throw_dc_var}',
        'hide_spell_content': '@{hide_spell_content_var}',
        'hide_action_freetext': '@{hide_action_freetext_var}'
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
