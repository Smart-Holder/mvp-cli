import { React } from 'webpkit/mobile';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../util/i18next';
const { useEffect } = React;
export default function TextFC() {
	// useEffect(() => {
	// 	changeLanguage(res.lang)
	// }, [])
	const { t } = useTranslation();
	return <div>{t('你好')}</div> //这里使用上对应的映射值 使用结果跟{t('hello')} 一样
	//打印出来的结果如下所示
}