import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import chain, { encodeParameters } from '../chain';
import models, { AssetType, Device, NFT } from '../models';
import NftCard from '../components/nft_card';
import { show } from 'webpkit/lib/dialog';
import { devices } from '../models/device';
import { Modal } from 'antd-mobile';
import * as nftproxy from '../chain/nftproxy';
import erc721 from '../chain/erc721';
import { contracts } from '../../config';
import erc1155 from '../chain/erc1155';
import { Empty } from 'antd';
import { removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime } from '../util/tools';
import '../css/my.scss';
import Loading from '../../deps/webpkit/lib/loading';



export interface INftItem extends NFT {
	btn_disabled?: boolean
}

export default class extends NavPage {

	state = { nft: [] as INftItem[], device: [] as Device[], loading: true, currNFT: {} as NFT, currDevice: {} as Device, visible: false, from: '', };


	async triggerLoad() {
		let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		this.setState({ from: owner });
		this.getNFTList(owner);

		models.msg.addEventListener('UpdateNFT', (e) => {
			let data: NFT = e.data;
			console.log(e.data, "--------ws-------");
			if (!data.ownerBase) {
				removeNftDisabledTimeItem(data, "nftDisabledTime");
				this.getNFTList(owner);
			}
		}, this);

	}

	triggerRemove() {
		models.msg.removeEventListenerWithScope(this);
	}

	// 获取nft列表
	async getNFTList(owner: string) {
		let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });

		nftList = setNftActionLoading(nftList, "nftDisabledTime");

		this.setState({ nft: nftList });
	}

	// 存入设备按钮点击
	async saveNftOfDeviceClick(nft: NFT) {
		let device = await devices() as Device[];
		let visible = true;
		if (device.length === 1) {
			visible = false;
			this.selectDeviceModalok(device[0], nft);
		}
		this.setState({ device, visible, currNFT: nft });
	}

	// 选择设备弹框确认按钮点击事件
	async selectDeviceModalok(deviceItem?: Device, nftItem?: NFT) {
		let { currDevice, currNFT, nft } = this.state;
		// 进行存入操作的设备
		let device = deviceItem || currDevice;
		// 进行操作的nft
		let nftInfo = nftItem || currNFT;

		let index = nft.findIndex((item) => item.tokenId === nftInfo.tokenId);
		let newNftItem = { ...nft[index] };
		let newNftList = [...nft];
		newNftItem.btn_disabled = true;
		newNftList[index] = newNftItem;

		var l = await Loading.show(' ');
		try {
			if (device?.address) {
				this.setState({ visible: false, nft: newNftList });
				await this._transferToDevice(device.address, nftInfo);
			}

		} catch (error: any) {
			removeNftDisabledTimeItem(nftInfo, "nftDisabledTime");
			// let errorText = error;
			newNftItem.btn_disabled = false;
			newNftList[index] = newNftItem;
			this.setState({ nft: newNftList });
			// if (error?.code == 4001) errorText = '已取消存储操作';
			show({ text: <div className="tip_box"><img className="tip_icon" src={require('../assets/error.jpg')} alt="" /> 已取消存储操作</div>, buttons: { '我知道了': () => { } } });
		} finally {
			l.close();
		}

		this.setState({ visible: false });
	}

	// 将nft存入设备
	private async _transferToDevice(device_address: string, nft: NFT) {
		var from = this.state.from;
		let showTip = () => show({
			buttons: { '我知道了': this.getNFTList.bind(this, from) },
			title: 'NFT存入已发起申请', text: <div className="transferToDeviceTipBox">
				<div>请耐心等待，交易进行中...请您刷新页面进行获取最新交易进程。</div>
				<div className="tip_img_box">

					<div className="tip_img_box_text">请点击页面右下角“…”
						找到   “重新加载”更新
						该页面</div>
					<img src={require("../assets/ref_bg.png")} alt="" />
				</div>
			</div>
		});

		return new Promise(async (resolve, reject) => {

			if (!nft.type) { nft.type = (nft as any).mode + 1 };
			try {

				if (nft.type == AssetType.ERC721) { // erc721
					setNftDisabledTime(nft, "nftDisabledTime", this.getNFTList.bind(this, from));
					if (nft.ownerBase) {
						await nftproxy.proxy721.transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(1));
					} else {
						await erc721.safeTransferToProxy( // 转移给代理协约
							nft.token, [device_address], BigInt(nft.tokenId), contracts.ERC721Proxy);
					}
					showTip();
					resolve(nft);
				} else if (nft.type == AssetType.ERC1155) {
					setNftDisabledTime(nft, "nftDisabledTime", this.getNFTList.bind(this, from));
					if (nft.ownerBase) {
						await nftproxy.proxy1155.transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(nft.count));
					} else {
						await erc1155.safeTransferToProxy( // 转移给代理协约
							nft.token, [device_address], BigInt(nft.tokenId), BigInt(nft.count), contracts.ERC1155Proxy);
					}
					showTip();
					resolve(nft);
				} else {
					reject('暂时不支持这种类型的NFT存入到设备');
				}
			} catch (error) {
				reject(error);
			}
		})
	}





	render() {
		let { nft, currDevice, visible, device } = this.state;

		return <div className="my_page">

			<div className="my_page_title">我的NFT</div>

			<div className="my_page_content">

				{nft.map(item => <NftCard key={item.id} btnClick={this.saveNftOfDeviceClick.bind(this, item)} nft={item} btnText="存入到设备" btnLoadingText="正在存入设备中" />)}

				{!nft.length && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description='暂无NFT，请添加NFT至钱包' />}
			</div>
			<Modal
				onClose={() => {
					this.setState({ visible: false });
				}}
				closable
				visible={visible}
				transparent
				title="选择设备"
				footer={[{ text: '确定', onPress: this.selectDeviceModalok.bind(this) }]}
				className="select_device"
			>
				<div style={{ maxHeight: '7rem', overflow: 'scroll' }}>

					<div style={{ width: "100%", }}>

						{device.map(item => {
							return <div key={item.sn} className={`alert_device_list ${currDevice.sn === item.sn && 'active_item'}`} onClick={() => {
								this.setState({ currDevice: currDevice.sn === item.sn ? {} : item });
							}}>
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
				</div>
			</Modal>
		</div>

	}
}