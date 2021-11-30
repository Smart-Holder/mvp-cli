import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { DeviceItem } from '../components/deviceItem';
import { Device } from '../models/device';
import '../css/device_info.scss';
import Button from '../components/button';
import models from '../models';


export default class extends NavPage<Device> {

	state = {
		nftList: []
	}

	async triggerLoad() {
		let nftList = await models.nft.methods.getNFTByOwner({ owner: this.params.address })
		this.setState({ nftList });
	}

	render() {
		return <div className="device_info_page">
			<div className="device_info_page_title">设备列表</div>

			<div className="device_info_page_content">


				<div className="device_card_box">
					<DeviceItem deviceInfo={this.params} showArrow={false} showActionBtn={true} />
				</div>


				<div className="device_card_box">
					<div className="nft_box">
						<div className="nft_info_box">
							<div className="nft_img_box">
								<img src={require('../assets/home_bg.png')} alt="" />
							</div>

							<div className="nft_address_box">
								<div className="nft_address_title">Address</div>
								<div className="nft_address textNoWrap">12as1d32as21da3s2d1a3s1d3212as1d32as21da3s2d1a3s1d32</div>
							</div>

							<div className="nft_hash_box">
								<div className="nft_hash_title">Hash</div>
								<div className="nft_hash textNoWrap">12as1d32as21da3s2d1a3s1d3212as1d32as21da3s2d1a3s1d32</div>
							</div>
						</div>

						<div className="action_btn_box">
							<Button type="primary">取出到钱包</Button>
						</div>

					</div>
				</div>
			</div>

		</div>
	}
}