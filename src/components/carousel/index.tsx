
import { Carousel } from 'antd-mobile';
import { useTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import IconFont from '../icon_font';
import "./index.scss";
type ICarouselType = 'imToken' | 'TokenPocket' | 'MateMask';


interface IbindDeviceCarouselProps {
	carouselSetupType?: {
		'TokenPocket': { img: string, title: string }[]
		'MateMask': { img: string, title: string }[]
		'imToken': { img: string, title: string }[]
	}
	pageType?: 'home' | 'device';
	afterChange?: (index: number) => void;
}

// const setUpImageConfig = {
// 	'ZH-CN': {
// 		TokenPocket: {
// 			step_1: '../../assets/tp_setp_1.jpg',
// 			step_3: '../../assets/step_3.jpg',
// 		}
// 	},
// 	'EN': {
// 		TokenPocket: {
// 			step_1: '../../assets/tp_setp_1.jpg',
// 			step_3: '../../assets/step_3.jpg',
// 		}
// 	}
// }



export const BindDeviceCarousel = (props: IbindDeviceCarouselProps) => {
	const { t } = useTranslation();

	let locLanguage = navigator.language?.toLocaleUpperCase();

	console.log(locLanguage,"locLanguage");
	let isZhCn = locLanguage === 'ZH-CN';

	// let carouselSetupTypeConfig:any = {
	// 	TokenPocket: [
	// 		{ title: t('第一步：进入钱包主页，点击右上角扫一扫'), img: require(`../../assets/tp_setp_1${isZhCn ?'' :'_en'}.jpg`) },
	// 		{ title: <div>{t('第二步：扫码绑定成功')}</div>, img: require(`../../assets/step_3${isZhCn ?'' :'_en'}.png`) },
	// 	],
	// 	MateMask: [
	// 		// { title: <div>{t('第一步：请点击左下角')}“<IconFont type="icon-danchuangicon1" />”{t('选择')}“<IconFont type="icon-danchuangicon2" />”</div>, img: require(`../../assets/step_1${isZhCn ? '':'_en' }.png`) },
	// 		{ title: <div>{t('第一步：请点击左下角')}“<IconFont type="icon-danchuangicon2" />”</div>, img: require(`../../assets/step_1_1${isZhCn ? '':'_en' }.jpg`) },
	// 		{ title: <div>{t('第二步：进入钱包后请点击右上角')} <br />“<IconFont type="icon-danchuangicon3" />”{t('按钮')}</div>, img: require(`../../assets/step_2_2${isZhCn ? '':'_en' }.jpg`) },
	// 		{ title: <div>{t('第三步：扫码绑定成功')}</div>, img: require(`../../assets/step_3${isZhCn ? '':'_en' }.png`) },
	// 	],
	// 	imToken: [
	// 		{ title: t('第一步：进入钱包主页，点击右上角扫一扫'), img: require(`../../assets/imtoken_setp_1${isZhCn ? '' : '_en' }.png`) },
	// 		{ title: <div>{t('第二步：扫码绑定成功')}</div>, img: require(`../../assets/step_3${isZhCn ? '' : '_en' }.png`) },
	// 	],
	// };

	let carouselSetupTypeConfig:any = {
		TokenPocket: [
			{ title: <div>{t('设备端：通过【菜单】-【Dapp二维码】调出绑定所需二维码')} {t('手机端：进入钱包，找到扫一扫功能，扫描设备端显示的二维码即可绑定')}</div> },
		],
		MateMask: [
			{ title: <div>{t('设备端：通过【菜单】-【Dapp二维码】调出绑定所需二维码')} {t('手机端：进入钱包，找到扫一扫功能，扫描设备端显示的二维码即可绑定')}</div> },
		],
		imToken: [
			{ title: <div>{t('设备端：通过【菜单】-【Dapp二维码】调出绑定所需二维码')} {t('手机端：进入钱包，找到扫一扫功能，扫描设备端显示的二维码即可绑定')}</div> },
		],
		
	};

	let carouselType: any = 'TokenPocket';
	let userAgent = navigator.userAgent;
	if (userAgent.includes('imToken')) {
		carouselType = 'imToken';
	} else if (userAgent.includes('TokenPocket')) {
		carouselType = 'TokenPocket';
	} else {
		carouselType = 'MateMask';
	}

	props.pageType === 'device' && carouselSetupTypeConfig[carouselType].unshift({ title: t('您还未绑定任何设备，请右翻查看绑定设备操作步骤'), img: require(`../../assets/empty_device_box${isZhCn ? '' : '_en'}.jpg`) })

	const { carouselSetupType = carouselSetupTypeConfig, afterChange } = props;

	// console.log(carouselSetupType[carouselType], 'carouselSetupType[carouselType]', carouselType);

	// return <Carousel afterChange={afterChange} className="add_device_carousel" dotActiveStyle={{ backgroundColor: "#1677FF" }}>
	// 	{carouselSetupType[carouselType]?.map((item:any, key:any) => {
	// 		return <div key={key} className="setp_box">
	// 			<div className="setp_title">{item.title}</div>
	// 			<img style={{ width: '100%' }} src={(item.img)} alt="" />
	// 		</div>
	// 	})}

	return <div className='add_device_carousel'>
			<div className="setp_box">
				<div className="setp_title">{t('设备端：通过【菜单】-【Dapp二维码】调出绑定所需二维码')}</div>
				<div className="setp_title">{t('手机端：进入钱包，找到扫一扫功能，扫描设备端显示的二维码即可绑定')}</div>
			</div>
		</div>
}