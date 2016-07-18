# GroupCheck
A roll20 API script for rolling multiple checks at once.

## Basic usage
The script is preloaded to come with commands for the D&D 5E Shaped Sheet. See the next chapter to learn how you can supply the necessary info to run it with another character sheet. The basic syntax is 

		!group-check [--options] [--Check Name]
		
Here, you can supply zero or more options (see below for specifics) that modify what exactly is rolled. **Check Name** is the name of the check as supplied in the **attrList** variable. If no valid **Check Name** is supplied, a list of valid checks (in the form of API buttons) is instead output to chat, allowing you to press them to roll the corresponding check.
**Check Name** will then be rolled once for every selected token that represents a character, and the result will be output to chat.

### Example
Suppose that we are using D&D 5E, and want to roll a Dexterity saving throw for every selected token, outputting the result to the GM only. The command would be

		!group-check --GM --Dexterity Save 
This refers to the line

		'Dexterity Save' : ['dexterity_saving_throw_mod'],
in the **attrList** variable.
If you have two tokens selected, representing the characters **Sarah** and **Mark**, the script will output (with default settings)

**Sarah:** [[d20 + @{Sarah|dexterity\_saving\_throw\_mod}]]

**Mark:** [[d20 + @{Mark|dexterity\_saving\_throw\_mod}]]

## Configuration options
The script is designed to be easily configured to your specific system's needs.

### Modifying attributes
The standard list of checks and corresponding modifiers is contained in the **attrList** variable at the beginning of the script. Modify it to adapt the script to your needs. The basic format is

		attrList = {
			'Check_1 Name' : ['check_1_mod_1', ... , 'check_1_mod_n'],
			...
			'Check_m Name' : ['check_m_mod_1', ... , 'check_m_mod_l']
		},

The names both serve both as titles for the roll output and as options needed to run these checks. The mods are names of character attributes; all attributes of the selected characters with these names are added together to get the final modifier to the **die** roll. The following strings are not available as check names, because they're used as command line options: **Public, GM, adv, disadv, rollsetting, roll2, showbonus,** and **hidebonus**. Similarly, check names may not start with any of **fallback, custom, die,** or **globalmod**, followed by a space. (and naturally, they may not contain double dashes (**--**), although this is unlikely to be a problem).

### Roll options
There are two ways of customising the way the script runs: through static config variables set at the start of the script's code, or via command line options. Command line options, if supplied, always override the behaviour set in the config variables.

* The variables **die**, **die_adv**, and **die_dis** control the basic dice used for normal rolling, disadvantage, and advantage. Supplying the option **--die [dieSize]** will use **[dieSize]** instead the default die; this is ignored when rolling with advantage or disadvantage.

* The variable **whisperToGM** controls if rolls are whispered to the GM or output publicly. The corresponding command line options are **--Public** and **--GM**.

* The variable **useTokenName** controls if the name of the token or the name of the character is displayed in front of the roll result. You can use e.g. the TokenNameNumber script to give different tokens for the same character different (numbered) names, allowing you to discern which of the tokens rolled which roll, even if there are several tokens representing the same character. This is active by default.

* It is possible to alter the specific way rolls are made. There are 5 options: roll normally, roll with advantage, roll with disadvantage, always roll 2 times for every token, or (for the 5E shaped sheet only) respect the roll setting on the sheet for selected tokens. The corresponding config options are 
*alwaysRoll2* and *useRollSetting*, the command line options are **--adv**, **--disadv**, **--rollsetting**, and **--roll2**.

* The option **--globalmod [mod]** will add **[mod]** as a modifier to all rolls made. Here **[mod]** can be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things.

* It is possible to hide the bonus on rolls and only show the final result of the roll. This is controlled via **hideBonus** and the command line options **--showbonus** and **--hidebonus**.

* You can supply a fallback value. When the option **--fallback [value]** is given, a roll will be made even for tokens not linked to a character; for these tokens, **[value]** is used instead of a character's attribute as modifier to the roll. **[value]** may be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things. If also using **--globalmod**, the global modifier is applied in addition to the fallback mod.

* It is possible to supply a custom roll not present in **attrList**. The syntax to do this is **--custom CheckName, mod\_1, ..., mod\_n**. This will roll a check with title **CheckName** and modifiers **mod\_1**, **mod\_2**, and so on. This works exactly as if there was an extra line in **attrList** as follows.

		'CheckName' : ['mod_1', 'mod_2', ... 'mod_n'],
