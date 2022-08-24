import InfiniteScroll from 'react-infinite-scroll-component';
import { Component, React } from 'webpkit/mobile';
import { useState, useEffect } from 'react';
import models, { AssetType, NFT } from '../../models';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chain from '../../chain';
import { Empty } from 'antd';
import { getNFTByOwnerPage, IGetNFTByOwnerPageProps } from '../../models/nft';
import { INftItem } from '../../pages/interface';
import { getDistinguishNftList, IDisabledKey, removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime } from '../../util/tools';
import './index.scss';
import NftCard from '../nft_card';
import NavPage from '../../nav';
import { Device, devices } from '../../models/device';
import { show, alert } from 'webpkit/lib/dialog';
import Loading from '../../../deps/webpkit/lib/loading';
import nftproxy, { proxyAddress } from '../../chain/nftproxy';
import erc721 from '../../chain/erc721';
import erc1155 from '../../chain/erc1155';
import { Modal } from 'antd-mobile';
import { BindDeviceCarousel } from '../carousel';

interface INftListItemProps {
	// listItem: JSX.Element;
	// renderItem: (item: NFT) => void;
	listType: 'chain' | 'other_chain';
	id?: string;
	isRefresh?: boolean;
	deviceAddress?: string;
	owner: string;
	page: NavPage;
	btnText?: string
}



class NftList extends Component<INftListItemProps> {
	state = {
		hasMore: true,
		loading: false,
		nftList: [] as INftItem[],
		page: 1,
		currDevice: {} as Device,
		currNFT: {} as INftItem,
		alert_id: {},
		dsq_id: 0,
		visible: false,
		device: [] as Device[],
		bindDeviceTipVisible: false,
		carouselIndex: 0
	}

	async componentDidMount() {
		// this.setState({ nftList: [], hasMore: true, page: 1 });
		// setnftList([]);
		// sethasMore(true);
		// setpage(1);
		this.getNFTList();

		models.msg.addEventListener('UpdateNFT', (e) => {
			let data: NFT = e.data;
			if (!data.ownerBase) {
				console.log(e.data, "--------ws-------");
				removeNftDisabledTimeItem(data, "nftDisabledTime");
				this.getNFTList(1);
			}
		}, this);
	}

	componentWillUnmount() {
		console.log('清除clearInterval' + this.state.dsq_id);
		clearInterval(this.state.dsq_id);
		models.msg.removeEventListenerWithScope(this.props.page);
	}


	async getNFTList(curPage?: number) {
		let { listType, owner } = this.props;
		// let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'

		let { nftList } = this.state;
		this.setState({ loading: true });

		// let owner = deviceAddress || from || await (await wallet_ui.currentKey()).address; // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'

		curPage = curPage || 1;
		let params: IGetNFTByOwnerPageProps = { owner, curPage: curPage || 1, pageSize: 10 };
		params[listType] = chain.chain;

		let list: INftItem[] = await getNFTByOwnerPage(params);

		list = setNftActionLoading(list, "nftDisabledTime");

		let newNftList = [...(curPage != 1 ? nftList : []), ...list];
		// setfrom(owner);
		// setnftList(newNftList);
		// setloading(false);
		this.setState({ nftList: newNftList, loading: false, hasMore: Boolean(list.length && list.length >= 10), page: curPage });
		// if (!list.length) sethasMore(false);
	}

	loadMoreData() {
		let { page } = this.state;
		let newPage = page + 1;
		// setpage(newPage);
		// getNFTList(newPage);
		// this.setState({ page: newPage });
		this.getNFTList(newPage);
	}

	async saveNftOfDeviceClick(nft: NFT) {

		let device = await devices() as Device[];
		let visible = true;
		let bindDeviceTipVisible = false;

		if (device.length === 1) {
			visible = false;
			this.selectDeviceModalok(device[0], nft);
		} else if (!device.length) {
			bindDeviceTipVisible = true;
			visible = false;

		}
		// alert(nft);
		this.setState({ device, visible, currNFT: nft, bindDeviceTipVisible });
	}

	async selectDeviceModalok(deviceItem?: Device | { address: string }, nftItem?: NFT, isWithdraw?: boolean) {
		let { currDevice, currNFT, nftList } = this.state;
		// 进行存入操作的设备
		let device = deviceItem || currDevice;
		// 进行操作的nft
		let nftInfo = nftItem || currNFT;

		const { t } = this.props.page;

		let index = nftList.findIndex((item) => item.tokenId === nftInfo.tokenId);
		let newNftItem = { ...nftList[index] };
		let newNftList = [...nftList];

		let disabledKey: IDisabledKey = isWithdraw ? 'transfer_btn_disabled' : 'btn_disabled';
		newNftItem[disabledKey] = true;

		newNftList[index] = newNftItem;

		var l = await Loading.show(isWithdraw ? t('正在取出到您的钱包中,请勿操作') : t('正在存入到您的设备中,请勿操作'));
		try {
			if (device?.address) {
				this.setState({ visible: false, nftList: newNftList, ...getDistinguishNftList(newNftList) });
				await this._transferToDevice(device.address, nftInfo, isWithdraw);
			}

		} catch (error: any) {
			removeNftDisabledTimeItem(nftInfo, "nftDisabledTime");
			newNftItem[disabledKey] = false;

			newNftList[index] = newNftItem;
			this.setState({ nftList: newNftList, ...getDistinguishNftList(newNftList) });
			let errorText = error;
			let errorCode = error.msg || error.message || error.description;
			if (error?.code == 4001 || error.errno == -30000) { errorText = t('已取消存储操作') }
			(error?.code != 4001 && errorCode !== 'cancel') && (errorText += ' ' + errorCode);

			if (error?.errno == 100400) errorText = error.description;
			if (error?.code == -32000) errorText = 'Gas费用不足，请充值';


			let btnText = t('我知道了');
			show({ text: <div className="tip_box"><img className="tip_icon" src={require('../../assets/error.jpg')} alt="" /> {t(errorText)}</div>, buttons: { [btnText]: () => { } } });
		} finally {
			l.close();
		}

		this.setState({ visible: false });
	}

	// 将nft存入设备
	private async _transferToDevice(device_address: string, nft: NFT, isWithdraw?: boolean) {
		const { t } = this.props.page;
		// const from = this.state.from;
		const getNFTList = this.getNFTList.bind(this);

		let btnText = t('我知道了');

		let showTip = () => show({
			buttons: {
				[btnText]: async () => {
					await getNFTList();
					let dsq_id = setTimeout(async () => {
						let { alert_id } = this.state;
						(alert_id as any).close && (alert_id as any).close();
						console.log(alert_id, dsq_id);
						let l = await alert(t('数据正在运行中，请耐心等待...'), getNFTList);
						this.setState({ alert_id: l });
					}, 20000);
					this.setState({ dsq_id });
				}
			},
			title: t('数字藏品存入已发起申请'), text: <div className="transferToDeviceTipBox">
				<div>{t('请耐心等待，交易进行中...请您刷新页面进行获取最新交易进程。')}</div>
			</div>
		});

		return new Promise(async (resolve, reject) => {

			if (!nft.type) { nft.type = (nft as any).mode + 1 };
			try {
				if (nft.type == AssetType.ERC721) { // erc721
					setNftDisabledTime(nft, "nftDisabledTime", getNFTList);
					if (nft.ownerBase) {
						await nftproxy.New(nft.owner, nft.chain).transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(1));
					} else {
						chain.assetChain(nft.chain, '请切换至对应链的密钥');
						await erc721.safeTransferToProxy( // 转移给代理协约
							nft.token, [device_address], BigInt(nft.tokenId), proxyAddress(AssetType.ERC721, nft.chain));
					}
					showTip();
					resolve(nft);
				} else if (nft.type == AssetType.ERC1155) {
					setNftDisabledTime(nft, "nftDisabledTime", getNFTList);
					if (nft.ownerBase) {
						await nftproxy.New(nft.owner, nft.chain).transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(nft.count));
					} else {
						chain.assetChain(nft.chain, '请切换至对应链的密钥');
						await erc1155.safeTransferToProxy( // 转移给代理协约
							nft.token, [device_address], BigInt(nft.tokenId), BigInt(nft.count), proxyAddress(AssetType.ERC1155, nft.chain));
					}
					showTip();
					resolve(nft);
				} else {
					reject(t('暂时不支持这种类型的数字藏品存入到设备'));
				}

			} catch (error) {
				reject(error);
			}
		})
	}

	render() {
		let { t } = this.props.page;
		let { id, btnText } = this.props;
		let { nftList, hasMore, loading, visible, device, currDevice, bindDeviceTipVisible, carouselIndex } = this.state;
		let loader = <div className="bottom_box" > <LoadingOutlined className="loading_icon" /></div>;

		let endMessage = <div className="bottom_box">{t('已经是全部数据了')}</div>;
		return <div id={id || "scrollableDiv2"} className="scroll_box">
			<InfiniteScroll
				key={id || "scrollableDiv2"}
				dataLength={nftList.length}
				next={this.loadMoreData.bind(this)}
				hasMore={hasMore}
				loader={loader}
				endMessage={nftList.length ? endMessage : ''}
				scrollableTarget={id || "scrollableDiv2"}
			>
				{/* {(nftList.length) ? nftList.map(item => renderItem(item)) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)} */}
				{(nftList.length) ? nftList.map((item: NFT) => <NftCard showTransferBtn={false} page={this.props.page} showChain={chain.chain !== item.chain} key={item.id} btnClick={this.saveNftOfDeviceClick.bind(this, item)} nft={item} btnText={t(btnText || "存入到设备")} btnLoadingText={t(btnText || "存入到设备")} />) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}


			</InfiniteScroll>


			<Modal
				onClose={() => {
					this.setState({ visible: false });
				}}
				closable
				visible={visible}
				transparent
				title={t("选择设备")}
				footer={[{ text: t('确定'), onPress: this.selectDeviceModalok.bind(this) }]}
				className="select_device"
			>
				<div style={{ maxHeight: '7rem', overflow: 'scroll' }}>

					<div style={{ width: "100%", }}>

						{device.map(item => {
							return <div key={item.address} className={`alert_device_list ${currDevice.address === item.address && 'active_item'}`} onClick={() => {
								this.setState({ currDevice: currDevice.address === item.address ? {} : item });
							}}>
								<div className="left_box">
									<img src={(item).screen <= 1 ? require('../../assets/screen_icon.jpg') : require('../../assets/test_device.png')} alt="" />
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


			<Modal visible={this.state.bindDeviceTipVisible}
				transparent
				title={!carouselIndex ? t("未绑定设备") : t("扫码绑定设备")}
				footer={[{ text: t('我知道了'), onPress: () => this.setState({ bindDeviceTipVisible: false }) }]}
			>
				<BindDeviceCarousel afterChange={(index) => {
					this.setState({ carouselIndex: index });
				}} pageType='device' />
			</Modal>
		</div>
	}
}

export default NftList;