import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
let locLanguage = navigator.language || localStorage.getItem('language');
if (locLanguage === 'zh-CN') locLanguage = 'zh';
const defaultLanguage: LanguageType = locLanguage?.toLocaleUpperCase() as LanguageType || 'EN'; //默认英语

export type LanguageType = 'ZH' | 'EN' | 'DE';

i18n
	.use(initReactI18next) //使用
	.init({ //初始化
		// resources: languages,
		resources: {
			EN: {
				translations: require("./localization/en-US.json"),
			},
			DE: {
				translations: require("./localization/de.json"),
			},
			ZH: {
				translations: require("./localization/zh-CN.json"),
			},
		},
		lng: defaultLanguage,
		fallbackLng: defaultLanguage,
		ns: ["translations"],
		defaultNS: "translations",
		interpolation: {
			escapeValue: false,
		},

	})
	.then(t => {
		console.log('18n ready', defaultLanguage);
	});

const changeLanguage = (lng: LanguageType) => { //定义多语言的change
	i18n.changeLanguage(lng); //i18n会通过这个方法去改变它的语言
	localStorage.setItem('language', lng);
};

export { changeLanguage }; //导出