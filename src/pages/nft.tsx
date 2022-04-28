
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { Device, NFT } from '../models';
import { encodeParameters } from '../chain';
import { devices } from '../models/device';
import { Spin } from 'antd';
import { DeviceItem } from '../components/deviceItem';
import { Carousel, Modal } from 'antd-mobile';
import IconFont from '../components/icon_font';
// import { changeLanguage } from '../util/i18next';
import { withTranslation } from 'react-i18next';
import { BindDeviceCarousel } from '../components/carousel';
import '../css/index.scss';

const tp = require('tp-js-sdk');

// const { t } = Translation(); //把使用方法结构
type ICarouselType = 'imToken' | 'TokenPocket' | 'MateMask';



class DeviceList extends NavPage {

	title = '我的NFT';

	_NftAdd = () => {
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFT) {
		this.pushPage({ url: `/nft_details`, params: { id: e.id } });
	}

	state = { nft: [] as NFT[], device: [] as Device[], loading: true, visible: false, carouselType: 'MateMask' as ICarouselType };

	async triggerLoad() {
		var hex = encodeParameters(['address'], ['0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391']);
		console.log(hex);
		// var owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		// this.setState({ nft: await models.nft.methods.getNFTByOwner({ owner }) });
		this.getDeviceList();
		// changeLanguage('EN');
	}

	async triggerShow() {
		this.getDeviceList();
	}

	async getDeviceList() {
		let device = await devices();
		this.setState({ device, loading: false });
	}

	// 添加设备
	async addDevice() {


		let carouselType = '';
		let userAgent = navigator.userAgent
		// if ()
		if (userAgent.includes('imToken')) {
			carouselType = 'imToken';
		} else if (userAgent.includes('TokenPocket')) {
			carouselType = 'TokenPocket';

			tp.invokeQRScanner().then((href: string) => {
				if (href.startsWith('http')) location.href = href;
			});
			return
		} else {
			carouselType = 'MateMask';
		}
		this.setState({ visible: true, carouselType });
	}

	render() {
		const { device, loading } = this.state;
		const { t } = this;
		return (
			<div className="index device_list_page">
				{/* <Header title="我的NFT" page={this} /> */}
				<div className="page_title" style={localStorage.getItem('language') != 'ZH' ? { letterSpacing: 0 } : {}}>{t('智能数字收藏品')}</div>
				<div className="device_list">
					<div className="list_title" >{t("全部设备")}</div>
					<div className="list_top_extra">
						<div className="bind_device_btn" onClick={this.addDevice.bind(this)}>
							<img className="add_icon" src={require('../assets/add_icon.png')} alt="+" /> {t("绑定新设备")}
						</div>
					</div>
					<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} />
					{device.map(item => {
						return <DeviceItem isCopy={false} key={item.sn} deviceInfo={item} onClick={() => {
							this.pushPage({ url: `/device_info`, params: { ...item } });
						}} />
					})}
				</div>

				<Modal visible={this.state.visible}
					transparent
					title={t("扫码绑定设备")}
					footer={[{ text: t('我知道了'), onPress: () => this.setState({ visible: false }) }]}
				>
					<BindDeviceCarousel />
				</Modal>

			</div>
		);
	}

}

export default withTranslation('translations', { withRef: true })(DeviceList);