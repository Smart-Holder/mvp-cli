
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
			{ title: t('1.通过管理密钥列表找到绑定设备的密钥,点击"设备管理"'), img: require('../../assets/wallet_step1.png') },
			{ title: <div>{t('2.在设备管理页面点击"绑定新设备",调用扫一扫功能,扫描设备绑定二维码即可')}</div>, img: require('../../assets/wallet_step2.png') },
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