import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { DeviceItem } from '../components/deviceItem';
import { Device, devices } from '../models/device';
import models, { NFT } from '../models';
import NftCard from '../components/nft_card';
import somes from '../../deps/webpkit/deps/somes';
import chain from '../chain';
import { contracts } from '../../config';
import nft_proxy, { proxyAddress } from '../chain/nftproxy';
import Loading from 'webpkit/lib/loading';
import { alert } from 'webpkit/lib/dialog';
import { ArrayToObj, IDisabledKey, removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime, showModal } from '../util/tools';
import Header from '../util/header';
import * as device from '../models/device';
import { INftItem } from './interface';
import { withTranslation } from 'react-i18next';
import '../css/device_info.scss';
const tp = require('tp-js-sdk');


class DeviceInfo extends NavPage<Device> {

	state = {
		nftList: [] as INftItem[],
		deviceInfo: this.params,
		loading: false,
		alert_id: {},
		dsq_id: 0
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
		clearInterval(this.state.dsq_id);
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
		clearInterval(this.state.dsq_id);
		this.setState({ nftList });
		this.getDeviceInfo(owner);
	}

	// 转出nft按钮点击
	async transferBtnClick(nftItem: NFT) {
		tp.invokeQRScanner().then((res: string) => {
			this.takeAwayNftOfDeviceClick(nftItem, res);
		});
	}

	async takeAwayNftOfDeviceClick(nft: NFT, toAddress: string = '') {
		const { t } = this;
		const getNFTList = this.getNFTList.bind(this, this.params.address)
		const { nftList } = this.state;

		let newNftList = [...nftList];

		let index = nftList.findIndex((item) => item.tokenId === nft.tokenId);
		let newNftItem = { ...nftList[index] };

		let disabledKey: IDisabledKey = toAddress ? 'transfer_btn_disabled' : 'btn_disabled';

		try {
			newNftItem[disabledKey] = true;
			newNftList[index] = newNftItem;

			this.setState({ nftList: newNftList });

			let to = toAddress || await chain.getDefaultAccount();
			setNftDisabledTime(nft, "drawNftDisabledTime", getNFTList);
			await this._Withdraw(nft, to);

			alert({ text: <div className="tip_box"><img style={{ width: ".5rem" }} src={require('../assets/success.jpg')} alt="" /> {t('取出到钱包成功,数据显示可能有所延时,请稍后刷新数据显示.')}</div> }, async () => {
				await getNFTList();
				let dsq_id = setInterval(async () => {
					let alert_id = this.state.alert_id as any;
					alert_id.close && alert_id.close();
					console.log(alert_id, dsq_id);
					let l = await alert('数据正在运行中，请耐心等待...', getNFTList);
					this.setState({ alert_id: l });
				}, 5000);
				this.setState({ dsq_id });
			});
		} catch (error: any) {
			let errorText = error;
			if (error?.code == 4001 || error.errno == -30000) errorText = t('已取消取出到钱包');
			if (error?.errno == 100400) errorText = '请切换至对应链的钱包';
			// window.alert((Object.keys(error)));

			newNftItem[disabledKey] = false;
			alert({ text: <div className="tip_box"><img className="tip_icon" src={require('../assets/error.jpg')} alt="" /> {String(errorText)}</div> });

		} finally {
			newNftList[index] = newNftItem;
			this.setState({ nftList: newNftList });

		}
	}

	_Withdraw = async (nft: NFT, to: string) => {

		const { t } = this;
		var from = nft.ownerBase || '';
		somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持代理取出
		proxyAddress(nft.type, nft.contract?.chain, '#device_nft#_Withdraw: BAD_NFT_PROXY');

		var l = await Loading.show(t('正在取出到您的钱包中,请勿操作'));
		return new Promise(async (resolve, reject) => {
			try {
				chain.assetChain(nft.contract?.chain, '请切换至对应链的钱包');
				await nft_proxy.New(nft.owner, nft.contract?.chain)
					.withdrawFrom(from, to, nft.token, BigInt(nft.tokenId), BigInt(nft.count)); // 取出一个
				resolve(nft);
			} catch (err: any) {
				removeNftDisabledTimeItem(nft, "drawNftDisabledTime");
				console.error(err);
				reject(err);
			} finally {
				l.close();
			}

		})
	};

	// 解绑设备
	async onUnbindDevice() {
		const { t } = this;
		let cancel = t('取消');
		let confim = t('确认解绑');
		showModal({
			id: 'bind_device', title: t("是否解绑设备"), text: t("请确认是否解绑设备，确认则解除对设备解绑。"), buttons: {
				[cancel]: () => this.setState({ loading: false }), ['@' + confim]: async () => {
					try {
						this.setState({ loading: true });
						const address = this.state.deviceInfo.address;
						await device.set_screen_save(address, { time: 10, data: [{ token: '', tokenId: '' }] }, 'single');
						await device.unbind(address);

						alert(t('解绑设备成功'), () => window.history.back());
					} catch (error: any) {
						console.log(error);

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
		const { t } = this;

		return <div className="device_info_page">
			{/* <div className="device_info_page_title">设备列表</div> */}
			<Header title={t("设备列表")} page={this} />


			<div className="device_info_page_content">


				<div className="device_card_box">
					<DeviceItem loading={loading} onUnbindDevice={this.onUnbindDevice.bind(this)} onOk={() => { this.pushPage({ url: "/device_set_carousel", params: this.state.deviceInfo }) }} deviceInfo={this.state.deviceInfo} showArrow={false} showActionBtn={true} />
				</div>

				{nftList.map(item => <NftCard showTransferBtn={false} key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item, '')} nft={item} btnText={t("取出到钱包")} btnLoadingText={t("取出到钱包")} />)}
			</div>

		</div>
	}
}

export default withTranslation('translations', { withRef: true })(DeviceInfo);
