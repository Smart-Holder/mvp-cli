import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { DeviceItem } from '../components/deviceItem';
import { Device, devices } from '../models/device';
import models, { NFT } from '../models';
import NftCard from '../components/nft_card';
import { INftItem } from './my';
import somes from '../../deps/webpkit/deps/somes';
import chain from '../chain';
import { contracts, env } from '../../config';
import nft_proxy from '../chain/nftproxy';
import Loading from 'webpkit/lib/loading';
import { alert, show } from 'webpkit/lib/dialog';
import { ArrayToObj, removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime, showModal } from '../util/tools';
import Header from '../util/header';
import * as device from '../models/device';
import '../css/device_info.scss';


export default class extends NavPage<Device> {

	state = {
		nftList: [] as INftItem[],
		deviceInfo: this.params,
		loading: false
	}

	async triggerLoad() {
		let owner = this.params.address;
		this.getNFTList(owner);
		models.msg.addEventListener('UpdateNFT', e => {
			let data: NFT = e.data;
			if (data.ownerBase === owner) {
				console.log(e, "--------ws-------");
				removeNftDisabledTimeItem(data, "drawNftDisabledTime");
				this.getNFTList(owner);
			}
		}, this);
	}


	triggerRemove() {
		models.msg.removeEventListenerWithScope(this);
	}

	// 获取设备信息
	async getDeviceInfo(address: string) {
		let device = await devices();
		let deviceObj = ArrayToObj(device, 'address');
		this.setState({ deviceInfo: deviceObj[address] })
	}

	// 获取nft列表
	async getNFTList(owner: string) {
		let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });
		nftList = setNftActionLoading(nftList, "drawNftDisabledTime");
		this.setState({ nftList });
		this.getDeviceInfo(owner);
	}

	async takeAwayNftOfDeviceClick(nft: NFT) {
		try {
			setNftDisabledTime(nft, "drawNftDisabledTime", this.getNFTList.bind(this, this.params.address));
			await this._Withdraw(nft);
			alert('取出到钱包成功,数据显示可能有所延时,请稍后刷新数据显示', () => this.getNFTList(this.params.address));
		} catch (error) {
			alert(String(error));

		}
	}

	_Withdraw = async (nft: NFT) => {
		var to = await chain.getDefaultAccount();
		var from = nft.ownerBase || '';
		somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持代理取出
		somes.assert(nft.owner == contracts.ERC721Proxy ||
			nft.owner == contracts.ERC1155Proxy, '#device_nft#_Withdraw: BAD_NFT_PROXY');

		var l = await Loading.show(' ');
		return new Promise(async (resolve, reject) => {
			try {
				await nft_proxy.New(nft.owner as string)
					.withdrawFrom(from, to, nft.token, BigInt(nft.tokenId), BigInt(nft.count)); // 取出一个
				resolve(nft);
			} catch (err: any) {
				removeNftDisabledTimeItem(nft, "drawNftDisabledTime");
				console.error(err);

				// if (env == 'dev') alert(err.message);
				reject('已取消取出到钱包');
			} finally {
				l.close();
			}

		})
	};

	// 解绑设备
	async onUnbindDevice() {
		// let instance = await show({
		// 	id: 'bind_device', title: <div>是否解绑设备 <CloseOutlined onClick={() => { instance?.close(); this.setState({ loading: false });}} /> </div>, text: "请确认是否解绑设备，确认则解除对设备解绑。", buttons: {
		// 		'取消': () => this.setState({ loading: false }), '@确认解绑': async () => {
		// 			try {
		// 				await device.unbind(this.state.deviceInfo.address);
		// 				alert('解绑设备成功', () => window.history.back());
		// 			} catch (error: any) {
		// 				alert(error.message)
		// 			} finally {
		// 				this.setState({ loading: false });
		// 			}

		// 		}
		// 	}
		// });
		showModal({
			id: 'bind_device', title: "是否解绑设备", text: "请确认是否解绑设备，确认则解除对设备解绑。", buttons: {
				'取消': () => this.setState({ loading: false }), '@确认解绑': async () => {
					try {
						this.setState({ loading: true });
						await device.unbind(this.state.deviceInfo.address);
						alert('解绑设备成功', () => window.history.back());
					} catch (error: any) {
						alert(error.message);
					} finally {
						this.setState({ loading: false });
					}

				}
			}
		})
	}

	render() {
		let { nftList, loading } = this.state;
		return <div className="device_info_page">
			{/* <div className="device_info_page_title">设备列表</div> */}
			<Header title="设备列表" page={this} />


			<div className="device_info_page_content">


				<div className="device_card_box">
					<DeviceItem loading={loading} onUnbindDevice={this.onUnbindDevice.bind(this)} onOk={() => { this.pushPage({ url: "/device_set_carousel", params: this.state.deviceInfo }) }} deviceInfo={this.state.deviceInfo} showArrow={false} showActionBtn={true} />
				</div>


				{nftList.map(item => <NftCard key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item)} nft={item} btnText="取出到钱包" btnLoadingText="正在取出到钱包" />)}

				{/* <div className="nft_box">
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

					</div> */}
			</div>

		</div>
	}
}