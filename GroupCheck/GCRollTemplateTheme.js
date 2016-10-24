// REMARK: Does not work with --multi, or when there are multiple tokens with the same names/character names
	boxstyle = (header,content) => '&{template:default}'+ header + content,
	tablestyle = content => content,
	headerstyle = text => '{{name='+text+'}}',
	rowstyle = (name,roll) => name+roll,
	namestyle = name => '{{'+name+'=',
	rollstyle = (f,b,a) => b[0]+f+b[1]+a+'}}',
	roll2style = (f,b,a) => b[0]+f+b[1]+'|'+b[0]+f+b[1]+'}}',
