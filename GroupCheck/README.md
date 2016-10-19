# GroupCheck
This is an API script meant to run checks for several tokens at once. You can specify the type of check to run and it will roll it once for every selected token. Note that you **will** have to configure the script and import the right types of checks before you can use it.

## Basic usage
Having configured some checks, you can call the script using the following syntax

		!group-check [--options] --Check Command
		
Here, you can supply zero or more options (see the section on options for specifics) that modify what exactly is rolled. **Check Command** is the command associated to the check you want to run. If no valid **Check Command** is supplied, a list of valid commands (in the form of API buttons) is instead output to chat, allowing you to press them to roll the corresponding check.
**Check Command** will then be rolled once for every selected token that represents a character, and the result will be output to chat.

### Example
Suppose that we are using D&D 5E, and want to roll a Dexterity saving throw for every selected token, outputting the result to the GM only. The command would be

		!group-check --whisper --Dexterity Save 
Note that this only works after having imported the right data for the sheet you are using.

If you have two tokens selected, representing the characters **Sarah** and **Mark**, the script will output (with default settings)

**Sarah:** [[d20 + @{Sarah|dexterity\_saving\_throw\_mod}]]

**Mark:** [[d20 + @{Mark|dexterity\_saving\_throw\_mod}]]

Internally, any check must be of the form **die + (list of modifiers)**, where the modifiers are some characer attributes. Unfortunately, systems that handle dice rolls in other ways - e.g. dice pool systems - are currently not supported.
## Configuration
The script is designed to be easily configured to your specific system's needs. You can configure the script using the **!group-check-config** command. **!group-check-config** accepts the following options:

### Show options

* **!group-check-config --show** will display the current list of checks and the default options for GroupCheck.

### Manipulating the check database
* **!group-check-config --import [Name]** imports a predefined set of checks and adds them to the list. Currently, the available choices for **[Name]** are **5E-Shaped**, **5E-OGL**, **Pathfinder**, and **3.5**. 

* **!group-check-config --add [JSON]**  adds a check, or several checks, to the list of checks in the database. **[JSON]** must be valid JSON in the following format: 

		{ "Check Command" : { "name" : "Check Name", "mod" : ["mod1","mod2", ..., "modn"]}}
Optionally, a "die" key may be added in addition to "name" and "mod" to specify that a custom die should be used for this check, overriding the default die. The array under "mod" is a list of attribute names: they will all be added together to determine the final bonus.

* **!group-check-config --delete [Command]** will delete the check called **Command** from the database.

* **!group-check-config --clear** will empty the list of checks in the database.

### Manipulating default options

* **!group-check-config --set option value** will set **option** to **value**. The following options are available: **ro**, **die**, **die_adv**, **die_dis**, **fallback**, and **globalmod**. To find out more about what these options do, consult the Options sections.

* **!group-check-config --set option** will set **option** (this is the variant for options which can be either true or false. The following options are available: **showbonus**, **hidebonus**, **whisper**, **public**, **usecharname**, and **usetokenname**. To find out more about what these options do, consult the Options sections.

* **!group-check-config --defaults** will reset all options to the factory defaults.

## Options
Most of the following options can be supplied in two ways: you can either supply them on the command line, or change the defaults via !group-check-config. Most of the time, it is probably advisable to do the latter.

### List of options

* The options **die**, **die_adv**, and **die_dis** control the basic dice used for normal rolling, disadvantage, and advantage. Supplying the option **--die [dieSize]** will use **[dieSize]** instead the default die for this roll only, and correspondingly for **die_adv** or **die_dis**.

* The options **whisper**, resp. **public**, control if rolls are whispered to the GM or output publicly.

* The option **usecharname**, resp. **usetokenname**, control if the name of the token or the name of the character is displayed in front of the roll result. You can use e.g. the TokenNameNumber script to give different tokens for the same character different (numbered) names, allowing you to discern which of the tokens rolled which roll, even if there are several tokens representing the same character. This is active by default.

* It is possible to alter the specific way rolls are made. There are 5 options: roll normally, roll with advantage, roll with disadvantage, always roll 2 times for every token, or (for the 5E shaped sheet only) respect the roll setting on the sheet for selected tokens. You can control this via the option **--ro [Setting]**, where **[Setting]** can be one of roll1, roll2, adv, dis, rollsetting, respectively.

* The option **--globalmod [mod]** will add **[mod]** as a modifier to all rolls made. Here **[mod]** can be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things.

* It is possible to hide the bonus on rolls and only show the final result of the roll. This is controlled via the options **--showbonus** and **--hidebonus**.

* You can use **--multi [n]** to run every check **[n]** times instead of once, with a minimum of 1 time.

* You can supply a fallback value. When the option **--fallback [value]** is given, a roll will be made even for tokens not linked to a character; for these tokens, **[value]** is used instead of a character's attribute as modifier to the roll. **[value]** may be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things. If also using **--globalmod**, the global modifier is applied in addition to the fallback mod.

* It is possible to supply a custom roll not present in the checks database. The syntax to do this is **--custom CheckName, mod\_1, ..., mod\_n**. This will roll a check with title **CheckName** and modifiers **mod\_1**, **mod\_2**, and so on.
