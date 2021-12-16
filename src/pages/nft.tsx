
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
import '../css/index.scss';
// const { t } = Translation(); //把使用方法结构
class DeviceList extends NavPage {

	title = '我的NFT';

	_NftAdd = () => {
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFT) {
		this.pushPage({ url: `/nft_details`, params: { id: e.id } });
	}

	state = { nft: [] as NFT[], device: [] as Device[], loading: true, visible: false };

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
		this.setState({ visible: true });
	}

	render() {
		const { device, loading } = this.state;
		return (
			<div className="index device_list_page">

				{/* <Header title="我的NFT" page={this} /> */}
				<div className="device_list">
					<div className="list_title">全部设备</div>
					<div className="list_top_extra">
						<div className="bind_device_btn" onClick={this.addDevice.bind(this)}>
							<img className="add_icon" src={require('../assets/add_icon.png')} alt="+" /> 绑定新设备
						</div>
					</div>
					<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} />
					{device.map(item => {
						return <DeviceItem key={item.sn} deviceInfo={item} onClick={() => {
							this.pushPage({ url: `/device_info`, params: { ...item } });
						}} />
					})}
				</div>

				<Modal visible={this.state.visible}
					transparent
					title='扫码绑定设备'
					footer={[{ text: '我知道了', onPress: () => this.setState({ visible: false }) }]}
				>
					<Carousel className="add_device_carousel" dotActiveStyle={{ backgroundColor: "#1677FF" }}>
						<div className="setp_box">
							<div className="setp_title">第一步：请点击左上角“<IconFont type="icon-danchuangicon1" />”选择“<IconFont type="icon-danchuangicon2" />”</div>
							<img style={{ width: '100%', objectFit: "contain", maxHeight: 300 }} src={require('../assets/step_1.png')} alt="" />
						</div>

						<div className="setp_box">
							<div className="setp_title">第二步：进入钱包后请点击右上角 <br />
								“<IconFont type="icon-danchuangicon3" />”按钮</div>
							<img style={{ width: '100%' }} src={require('../assets/step_2.png')} alt="" />
						</div>

						<div className="setp_box">
							<div className="setp_title">第三步：扫码绑定成功</div>
							<img style={{ width: '100%' }} src={require('../assets/step_3.png')} alt="" />
						</div>
					</Carousel>
				</Modal>

				{/* <div className="list">
					{this.state.nft.map((e, j) =>
						<div className="b" onClick={() => this._NftDetails(e)} key={j}>
							<div className="more">More...</div>
							<div className="txt1">Address:</div>
							<div className="txt2">{e.token}</div>
							<div className="txt1">Hash:</div>
							<div className="txt2">{e.tokenId}</div>
						</div>
					)}
				</div> */}
			</div>
		);
	}

}

export default withTranslation('translations')(DeviceList);