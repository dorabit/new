const fs = require("fs-extra");
const log = require("../logger/log.js");
const path = require("path");

// تحديد ملف اللغة العربية
let pathLanguageFile = `${__dirname}/ar.lang`;

// التحقق من وجود الملف
if (!fs.existsSync(pathLanguageFile)) {
	log.warn("LANGUAGE", `لم يتم العثور على ملف اللغة ar.lang، سيتم استخدام الملف الافتراضي en.lang`);
	pathLanguageFile = `${__dirname}/en.lang`; // احتياطي فقط، يمكنك حذفه إذا أردت اعتماد العربية فقط
}

// قراءة الملف وتحويله إلى كائن
const readLanguage = fs.readFileSync(pathLanguageFile, "utf-8");
const languageData = readLanguage
	.split(/\r?\n|\r/)
	.filter(line => line && !line.trim().startsWith("#") && !line.trim().startsWith("//") && line != "");

global.language = convertLangObj(languageData);

// تحويل النصوص إلى كائنات منظمة
function convertLangObj(languageData) {
	const obj = {};
	for (const sentence of languageData) {
		const getSeparator = sentence.indexOf('=');
		const itemKey = sentence.slice(0, getSeparator).trim();
		const itemValue = sentence.slice(getSeparator + 1).trim();
		const head = itemKey.slice(0, itemKey.indexOf('.'));
		const key = itemKey.replace(head + '.', '');
		const value = itemValue.replace(/\\n/gi, '\n');
		if (!obj[head])
			obj[head] = {};
		obj[head][key] = value;
	}
	return obj;
}

// دالة لاسترجاع النصوص من ملف اللغة
function getText(head, key, ...args) {
	const langObj = global.language;
	if (!langObj[head]?.hasOwnProperty(key))
		return `لم يتم العثور على النص: "${head}.${key}"`;

	let text = langObj[head][key];
	for (let i = args.length - 1; i >= 0; i--)
		text = text.replace(new RegExp(`%${i + 1}`, 'g'), args[i]);

	return text;
}

module.exports = getText;
