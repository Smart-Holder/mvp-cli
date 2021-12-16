import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const defaultLanguage: LanguageType = localStorage.getItem('language') as LanguageType || 'ZH'; //默认英语

type LanguageType = 'ZH' | 'EN';

i18n
	.use(initReactI18next) //使用
	.init({ //初始化
		// resources: languages,
		resources: {
			EN: {
				translations: require("./en-US.json"),
			},
			CN: {
				translations: require("./zh-CN.json"),
			},
		},
		lng: defaultLanguage,
		fallbackLng: defaultLanguage,
		ns: ["translations"],
		defaultNS: "translations",
		interpolation: {
			escapeValue: false,
		},
		react: {
			wait: true,
		},
	})
	.then(t => {
		console.log('18n ready');
	});

const changeLanguage = (lng: LanguageType) => { //定义多语言的change
	i18n.changeLanguage(lng); //i18n会通过这个方法去改变它的语言
	localStorage.setItem('language', lng);
};

export { changeLanguage }; //导出