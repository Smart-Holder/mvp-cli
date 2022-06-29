import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import models, { AssetType, Device, NFT } from '../models';
// import models from '../sdk';
import { CloseOutlined } from '@ant-design/icons';
import chain from '../chain';
import NftCard from '../components/nft_card';
import { show } from 'webpkit/lib/dialog';
import { alert } from '../util/tools'
import { devices } from '../models/device';
import { Modal } from 'antd-mobile';
import nftproxy, { proxyAddress } from '../chain/nftproxy';
import erc721 from '../chain/erc721';
import erc1155 from '../chain/erc1155';
import { Empty, Spin } from 'antd';
import { Tabs, NoticeBar } from 'antd-mobile';
import { IDisabledKey, removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime, getDistinguishNftList } from '../util/tools';
import Loading from '../../deps/webpkit/lib/loading';
import { INftItem } from './interface';
import { withTranslation } from 'react-i18next';
import { BindDeviceCarousel } from '../components/carousel';
import '../css/my.scss';
import InfiniteScroll from 'react-infinite-scroll-component';


class My extends NavPage {

	state = {
		nft: [] as INftItem[],
		nftList1: [] as INftItem[],
		nftList2: [] as INftItem[],
		tabIndex: 0,
		device: [] as Device[],
		loading: true,
		currNFT: {} as NFT,
		currDevice: {} as Device,
		visible: false,
		from: '',
		bindDeviceTipVisible: false,
		carouselIndex: 0,
		dsq_id: 0,
		alert_id: {},
		page:1
	};


	async triggerShow() {
		let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		this.setState({ from: owner });
		this.getNFTList(owner);

		models.msg.addEventListener('UpdateNFT', (e) => {
			let data: NFT = e.data;
			if (!data.ownerBase) {
				console.log(e.data, "--------ws-------");
				removeNftDisabledTimeItem(data, "nftDisabledTime");
				this.getNFTList(owner);
			}
		}, this);

	}

	triggerRemove() {
		console.log('清除clearInterval' + this.state.dsq_id);

		clearInterval(this.state.dsq_id);
		models.msg.removeEventListenerWithScope(this);
	}

	// 获取nft列表
	async getNFTList(owner: string, curPage?: number) {
		this.setState({ loading: true })
		// let nftList: INftItem[] = await models.nft.methods.getNFTByOwnerPage({ owner, curPage: curPage || 1,pageSize:10 });
		let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });

		nftList = setNftActionLoading(nftList, "nftDisabledTime");

		let { nftList1, nftList2 } = getDistinguishNftList(nftList);

		this.setState({ nft: nftList, nftList1, nftList2, loading: false });
		clearInterval(this.state.dsq_id);
	}


	// 存入设备按钮点击
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


	// 转出nft按钮点击
	async transferBtnClick(nft: NFT) {
		let { token, tokenId } = nft;
		this.pushPage({ url: '/transfer_nft', params: { token, tokenId } })
	}

	// 选择设备弹框确认按钮点击事件
	async selectDeviceModalok(deviceItem?: Device | { address: string }, nftItem?: NFT, isWithdraw?: boolean) {
		let { currDevice, currNFT, nft } = this.state;
		// 进行存入操作的设备
		let device = deviceItem || currDevice;
		// 进行操作的nft
		let nftInfo = nftItem || currNFT;

		const { t } = this;

		let index = nft.findIndex((item) => item.tokenId === nftInfo.tokenId);
		let newNftItem = { ...nft[index] };
		let newNftList = [...nft];

		let disabledKey: IDisabledKey = isWithdraw ? 'transfer_btn_disabled' : 'btn_disabled';
		newNftItem[disabledKey] = true;

		newNftList[index] = newNftItem;

		var l = await Loading.show(isWithdraw ? t('正在取出到您的钱包中,请勿操作') : t('正在存入到您的设备中,请勿操作'));
		try {
			if (device?.address) {
				this.setState({ visible: false, nft: newNftList, ...getDistinguishNftList(newNftList) });
				await this._transferToDevice(device.address, nftInfo, isWithdraw);
			}

		} catch (error: any) {
			removeNftDisabledTimeItem(nftInfo, "nftDisabledTime");
			newNftItem[disabledKey] = false;

			newNftList[index] = newNftItem;
			this.setState({ nft: newNftList, ...getDistinguishNftList(newNftList) });
			let errorText = error;
			let errorCode = error.msg || error.message || error.description;
			if (error?.code == 4001 || error.errno == -30000) { errorText = t('已取消存储操作') }
			(error?.code != 4001 && errorCode !== 'cancel') && (errorText += ' ' + errorCode);

			if (error?.errno == 100400) errorText = error.description;
			if (error?.code == -32000) errorText = 'Gas费用不足，请充值';


			let btnText = t('我知道了');
			show({ text: <div className="tip_box"><img className="tip_icon" src={require('../assets/error.jpg')} alt="" /> {t(errorText)}</div>, buttons: { [btnText]: () => { } } });
		} finally {
			l.close();
		}

		this.setState({ visible: false });
	}

	// 将nft存入设备
	private async _transferToDevice(device_address: string, nft: NFT, isWithdraw?: boolean) {
		const { t } = this;
		const from = this.state.from;
		const getNFTList = this.getNFTList.bind(this, from);

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
			title: t('NFT存入已发起申请'), text: <div className="transferToDeviceTipBox">
				<div>{t('请耐心等待，交易进行中...请您刷新页面进行获取最新交易进程。')}</div>
				<div className="tip_img_box">

					<div className="tip_img_box_text">{t('请点击页面右下角“…”找到“重新加载”更新该页面')}</div>
					<img src={localStorage.getItem('language') === 'ZH' ? require("../assets/ref_bg.png") : require("../assets/ref_bg_en.jpg")} alt="" />
				</div>
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
						chain.assetChain(nft.chain, '请切换至对应链的钱包');
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
						chain.assetChain(nft.chain, '请切换至对应链的钱包');
						await erc1155.safeTransferToProxy( // 转移给代理协约
							nft.token, [device_address], BigInt(nft.tokenId), BigInt(nft.count), proxyAddress(AssetType.ERC1155, nft.chain));
					}
					showTip();
					resolve(nft);
				} else {
					reject(t('暂时不支持这种类型的NFT存入到设备'));
				}

			} catch (error) {
				reject(error);
			}
		})
	}


	// 触底加载
	async loadMoreData() {
		console.log('loadmore');
		let { page, from} = this.state;
		this.setState({ page: page + 1 });
		this.getNFTList(from, page + 1);
	}


	render() {
		let { currDevice, visible, device, loading, nftList1, nftList2, tabIndex, carouselIndex } = this.state;
		const { t } = this;
		return <div className="my_page">
			{loading && <Spin style={{ maxHeight: 'none', height: "100%", }} spinning={loading} tip='loading' delay={500} />}


			{/* <div className="my_page_title">{t('我的NFT')}</div> */}

			<div className="my_page_content">
				<Tabs tabBarUnderlineStyle={{ backgroundColor: '#1677ff', color: '#1677ff', borderColor: '#1677ff' }} tabBarBackgroundColor={'#f5f5f5'} tabBarActiveTextColor={'#1677ff'} tabs={
					[{ title: this.t('本网络NFT'), index: 0 }, { title: this.t('其他网络NFT'), index: 1 }]
				}
					onChange={(item, index) => {
						this.setState({ tabIndex: index })
					}}
					initialPage={0}
				>
					{/* <div className="list_box"> */}
					<div id="scrollableDiv" style={{
						height: '100%',
						overflow: 'auto',
						marginTop: '.1rem'
					}} >
					<InfiniteScroll
						dataLength={nftList1.length}
						next={this.loadMoreData.bind(this)}
						hasMore={true}
						loader={'666'}
						endMessage={"It is all, nothing more 🤐"}
						scrollableTarget="scrollableDiv"
					>
						{(nftList1.length) ? nftList1.map(item => <NftCard page={this} showChain={chain.chain !== item.chain} key={item.id} transferBtnClick={this.transferBtnClick.bind(this, item)} btnClick={this.saveNftOfDeviceClick.bind(this, item)} nft={item} btnText={t("存入到设备")} btnLoadingText={t("存入到设备")} />) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}
						</InfiniteScroll>
					</div>
					{/* </div> */}
					<div className="list_box">
						{tabIndex === 1 && <NoticeBar mode="closable" action={<CloseOutlined style={{ color: '#a1a1a1', }} />}>
							{t("您只能查看在其他网络的NFT，不能进行任何操作，若您想把其他网络的NFT绑定到设备，需切换到该NFT所在的网络后才可以将该NFT绑定到设备")}
						</NoticeBar>}
						{(nftList2.length) ? nftList2.map(item => <NftCard page={this} showChain={chain.chain !== item.chain} key={item.id} transferBtnClick={this.transferBtnClick.bind(this, item)} btnClick={this.saveNftOfDeviceClick.bind(this, item)} nft={item} btnText={t("存入到设备")} btnLoadingText={t("存入到设备")} />) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}
					</div>
				</Tabs>


				{/* // {(!nft.length && !loading) && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />} */}
			</div>
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
									<img src={(item).screen <= 1 ? require('../assets/screen_icon.jpg') : require('../assets/test_device.png')} alt="" />
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

export default withTranslation('translations', { withRef: true })(My);