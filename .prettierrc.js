module.exports = {
	printWidth: 120, //单行长度
	tabWidth: 2, //缩进长度
	useTabs: false, //使用空格代替tab缩进
	semi: true, //句末使用分号
	singleQuote: false, //使用单引号
	quoteProps: "as-needed", //仅在必需时为对象的key添加引号
	trailingComma: "all", //多行时尽可能打印尾随逗号
	bracketSpacing: true, //在对象前后添加空格-eg: { foo: bar }
	jsxBracketSameLine: true, //多属性html标签的‘>’折行放置
	requirePragma: false, //无需顶部注释即可格式化
	insertPragma: false, //在已被preitter格式化的文件顶部加上标注
	proseWrap: "preserve", //markdown字符数超过保持原样
	htmlWhitespaceSensitivity: "ignore", //对HTML全局空白不敏感
	vueIndentScriptAndStyle: false, //不对vue中的script及style标签缩进
	endOfLine: "lf", //结束行形式
	embeddedLanguageFormatting: "auto", //对引用代码进行格式化
};
