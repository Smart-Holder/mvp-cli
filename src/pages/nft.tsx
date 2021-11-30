
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/index.scss';
import models, { Device, NFT } from '../models';
import chain, { encodeParameters } from '../chain';
import { devices } from '../models/device';
import { Spin, Button } from 'antd';
import { DeviceItem } from '../components/deviceItem';

export default class extends NavPage {

	title = '我的NFT';

	_NftAdd = () => {
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFT) {
		this.pushPage({ url: `/nft_details`, params: { id: e.id } });
	}

	state = { nft: [] as NFT[], device: [] as Device[], loading: true };

	async triggerLoad() {
		var hex = encodeParameters(['address'], ['0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391']);
		console.log(hex);
		// var owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		// this.setState({ nft: await models.nft.methods.getNFTByOwner({ owner }) });
		this.getDeviceList();
	}

	async triggerShow() {
		this.getDeviceList();
	}

	async getDeviceList() {
		let device = await devices();
		this.setState({ device, loading: false });
	}

	render() {
		const { device, loading } = this.state;
		return (
			<div className="index device_list_page">

				{/* <Header title="我的NFT" page={this} /> */}
				<div className="device_list">
					<div className="list_title">全部设备</div>
					<div className="list_top_extra">
						<div className="bind_device_btn">
							<img className="add_icon" src={require('../assets/add_icon.png')} alt="+" /> 绑定新设备
						</div>
					</div>
					<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} />
					{device.map(item => {
						return <DeviceItem deviceInfo={item} onClick={() => {
							this.pushPage({ url: `/device_info`, params: { ...item } });
						}} />
					})}



				</div>

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