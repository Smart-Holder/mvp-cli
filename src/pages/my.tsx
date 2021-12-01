import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import chain from '../chain';
import models, { Device, NFT } from '../models';
import NftCard from '../components/nft_card';
import { alert, show } from 'webpkit/lib/dialog';
import '../css/my.scss';
import { devices } from '../models/device';

export default class extends NavPage {

	state = { nft: [] as NFT[], device: [] as Device[], loading: true };


	async triggerLoad() {
		let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		this.setState({ nft: await models.nft.methods.getNFTByOwner({ owner }) });
	}


	async saveNftOfDeviceClick() {
		let deviceList = await devices() as Device[];

		deviceList[1] = deviceList[0];
		deviceList[2] = deviceList[0];
		deviceList[3] = deviceList[0];
		deviceList[4] = deviceList[0];
		deviceList[5] = deviceList[0];
		// show({
		// 	title: "选择设备", text: '56666',id:'', buttons: {
		// 		class: () => '你看看',
		// 		onclick: () => {
		// 			console.log(666);

		// 		}
		// 	}
		// });
		alert({
			id: 'select_device', title: "选择设备", text:
				<div style={{ width: "100%", maxHeight: '7rem', overflow: "auto" }}>
					{deviceList.map(item => {
						return <div key={item.sn} className="alert_device_list">
							<div className="left_box">
								<img src={require('../assets/test_device.png')} alt="" />
							</div>

							<div className="right_box">
								<div className="sn_box">
									<div className="sn_title">SN</div>
									<div className="sn textNoWrap">{item.sn}</div>
								</div>
								<div className="address_box">
									<div className="address_title">Address</div>
									<div className="address textNoWrap">{item.address}</div>
								</div>
							</div>

						</div>
					})}
				</div>
		});
	}

	render() {
		let { nft } = this.state;

		return <div className="my_page">
			<div className="my_page_title">我的NFT</div>

			<div className="my_page_content">

				{nft.map(item => <NftCard key={item.id} saveNftOfDeviceClick={this.saveNftOfDeviceClick} nft={item} />)}
			</div>
		</div>

	}
}