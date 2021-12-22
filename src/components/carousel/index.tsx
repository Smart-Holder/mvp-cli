
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



export const BindDeviceCarousel = (props: IbindDeviceCarouselProps) => {
	const { t } = useTranslation();


	let carouselSetupTypeConfig = {
		TokenPocket: [
			{ title: t('第一步：进入钱包主页，点击右上角扫一扫'), img: require('../../assets/tp_setp_1.jpg') },
			{ title: <div>{t('第二步：扫码绑定成功')}</div>, img: require('../../assets/step_3.png') },
		],
		MateMask: [
			{ title: <div>{t('第一步：请点击左上角')}“<IconFont type="icon-danchuangicon1" />”{t('选择')}“<IconFont type="icon-danchuangicon2" />”</div>, img: require('../../assets/step_1.png') },
			{ title: <div>{t('第二步：进入钱包后请点击右上角')} <br />“<IconFont type="icon-danchuangicon3" />”{t('按钮')}</div>, img: require('../../assets/step_2.png') },
			{ title: <div>{t('第三步：扫码绑定成功')}</div>, img: require('../../assets/step_3.png') },
		],
		imToken: [
			{ title: t('第一步：进入钱包主页，点击右上角扫一扫'), img: require('../../assets/imtoken_setp_1.1.jpg') },
			{ title: <div>{t('第二步：扫码绑定成功')}</div>, img: require('../../assets/step_3.png') },
		],
	};

	let carouselType: ICarouselType = 'TokenPocket';
	let userAgent = navigator.userAgent
	if (userAgent.includes('imToken')) {
		carouselType = 'imToken';
	} else if (userAgent.includes('TokenPocket')) {
		carouselType = 'TokenPocket';
	} else {
		carouselType = 'MateMask';
	}

	props.pageType === 'device' && carouselSetupTypeConfig[carouselType].unshift({ title: t('您还未绑定任何设备，请右翻查看绑定设备操作步骤'), img: require('../../assets/empty_device_box.jpg') })

	const { carouselSetupType = carouselSetupTypeConfig, afterChange } = props;


	return <Carousel afterChange={afterChange} className="add_device_carousel" dotActiveStyle={{ backgroundColor: "#1677FF" }}>
		{carouselSetupType[carouselType]?.map((item, key) => {
			return <div key={key} className="setp_box">
				<div className="setp_title">{item.title}</div>
				<img style={{ width: '100%' }} src={(item.img)} alt="" />
			</div>
		})}
	</Carousel>;
}