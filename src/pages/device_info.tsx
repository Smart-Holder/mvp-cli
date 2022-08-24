import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { DeviceItem } from '../components/deviceItem';
import { Device, devices } from '../models/device';
import models, { NFT } from '../models';
import NftCard from '../components/nft_card';
import somes from '../../deps/webpkit/deps/somes';
import chain from '../chain';
import nft_proxy, { proxyAddress } from '../chain/nftproxy';
import Loading from 'webpkit/lib/loading';
import { alert, getDistinguishNftList } from '../util/tools';
import { ArrayToObj, IDisabledKey, removeNftDisabledTimeItem, setNftActionLoading, setNftDisabledTime, showModal } from '../util/tools';
import Header from '../util/header';
import * as device from '../models/device';
import { INftItem } from './interface';
import { withTranslation } from 'react-i18next';
import { Tabs, NoticeBar } from 'antd-mobile';

import { Empty } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { getNFTByOwnerPage, IGetNFTByOwnerPageProps } from '../models/nft';
import '../css/device_info.scss';

const tp = require('tp-js-sdk');


class DeviceInfo extends NavPage<Device> {

	state = {
		nftList: [] as INftItem[],
		nftList1: [] as INftItem[],
		nftList2: [] as INftItem[],
		tabIndex: 0,
		deviceInfo: this.params,
		loading: false,
		alert_id: {},
		dsq_id: 0,
		isRefresh: false,
		showToTop: false,
		page: 1,
		hasMore: true
	}

	async triggerLoad() {
		let owner = this.params.address;
		this.getNFTList(owner);
		window.addEventListener('scroll', this.handleScroll.bind(this), true);
		models.msg.addEventListener('UpdateNFT', e => {
			let data: NFT = e.data;
			if (data.ownerBase === owner) {
				console.log(e, "--------ws-------");
				removeNftDisabledTimeItem(data, "drawNftDisabledTime");
				this.getNFTList(owner);
			}
		}, this);
	}

	handleScroll(e: any) {
		if (e.target.className !== 'device_info_page_content') return false;
		let { showToTop } = this.state;
		if (e.target.scrollTop > 200) {
			!showToTop && this.setState({ showToTop: true });
		} else {
			showToTop && this.setState({ showToTop: false });
		}
	}


	triggerRemove() {
		window.removeEventListener('scroll', this.handleScroll.bind(this), true);

		clearInterval(this.state.dsq_id);
		models.msg.removeEventListenerWithScope(this);
	}

	// 获取设备信息
	async getDeviceInfo(address: string) {
		let device = await devices();
		let deviceObj = ArrayToObj(device, 'address');
		this.setState({ deviceInfo: deviceObj[address] });
	}

	// 获取nft列表
	async getNFTList(owner: string, curPage?: number, tabIndex?: number) {
		curPage = curPage || 1;
		// let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });
		let params: IGetNFTByOwnerPageProps = { owner, curPage: curPage || 1, pageSize: 10 };
		let { nftList1, nftList2 } = this.state;
		let preNftList = !tabIndex ? nftList1 : nftList2;

		params[tabIndex ? 'other_chain' : 'chain'] = chain.chain;

		let nftList: INftItem[] = await getNFTByOwnerPage(params);

		let newNftList = [...(curPage != 1 ? preNftList : []), ...nftList];

		newNftList = setNftActionLoading(newNftList, "drawNftDisabledTime");
		// let { nftList1, nftList2 } = getDistinguishNftList(nftList);
		let list_key = tabIndex ? 'nftList2' : 'nftList1';

		clearInterval(this.state.dsq_id);
		this.setState({ nftList: newNftList, [list_key]: newNftList, page: curPage, hasMore: Boolean(nftList.length && nftList.length >= 10) });
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
			this.setState({ nftList: newNftList, ...getDistinguishNftList(newNftList) });

			let to = toAddress || await chain.getDefaultAccount();
			setNftDisabledTime(nft, "drawNftDisabledTime", getNFTList);
			await this._Withdraw(nft, to);

			alert({ text: <div className="tip_box"><img style={{ width: ".5rem" }} src={require('../assets/success.jpg')} alt="" /> {t('取出到钱包成功,数据显示可能有所延时,请稍后刷新数据显示.')}</div> }, async () => {
				await getNFTList();
				let dsq_id = setTimeout(async () => {
					let alert_id = this.state.alert_id as any;
					alert_id.close && alert_id.close();
					console.log(alert_id, dsq_id);
					let l = await alert(t('数据正在运行中，请耐心等待...'), getNFTList);
					this.setState({ alert_id: l });
				}, 20000);
				this.setState({ dsq_id });
			});
		} catch (error: any) {
			let errorText = error;
			let errorCode = error.msg || error.message || error.description;

			if (error?.code == 4001 || error.errno == -30000) errorText = t('已取消取出到钱包');
			(error?.code != 4001 && errorCode !== 'cancel') && (errorText += errorCode);

			if (error?.errno == 100400) errorText = '请切换至对应链的钱包';
			// window.alert((Object.keys(error)));
			removeNftDisabledTimeItem(newNftItem, "drawNftDisabledTime");
			newNftItem[disabledKey] = false;
			alert({ text: <div className="tip_box"><img className="tip_icon" src={require('../assets/error.jpg')} alt="" /> {String(t(errorText))}</div> });

		} finally {
			newNftList[index] = newNftItem;
			this.setState({ nftList: newNftList, ...getDistinguishNftList(newNftList) });

		}
	}

	_Withdraw = async (nft: NFT, to: string) => {
		const { t } = this;
		var from = nft.ownerBase || '';
		var l = await Loading.show(t('正在取出到您的钱包中,请勿操作'));
		return new Promise(async (resolve, reject) => {
			try {

				somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持代理取出
				// debugger
				proxyAddress(nft.type, nft.chain, '#device_nft#_Withdraw: BAD_NFT_PROXY');

				chain.assetChain(nft.chain, '请切换至对应链的钱包');
				await nft_proxy.New(nft.owner, nft.chain)
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
						// await device.set_screen_save(address, { time: 10, data: [{ token: '', tokenId: '' } as any] }, 'single', true);
						await device.unbind(address);

						alert(t('解绑设备成功'), () => this.replacePage('/device'));
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

	// 触底加载
	async loadMoreData() {
		console.log('loadmore');
		let { tabIndex, page } = this.state;
		this.getNFTList(this.params.address, page + 1, tabIndex);
	}

	// 切换tab
	async tabOnChange(item: any, index: number) {
		this.setState({ tabIndex: index, nftList1: [], nftList2: [], page: 1 }, () => {
			this.getNFTList(this.params.address, 1, index);
		});
	}

	render() {
		let { loading, nftList1, nftList2, tabIndex, showToTop, hasMore } = this.state;
		const { t } = this;

		let loader = <div className="bottom_box" > <LoadingOutlined className="loading_icon" /></div>;
		let endMessage = <div className="bottom_box">{t('已经是全部数据了')}</div>;


		return <div className="device_info_page">
			<Header title={t("设备列表")} page={this} />

			{showToTop && <div className="back_top" onClick={() => {
				let ele = document.querySelector('.device_info_page_content');
				let scrollEle = document.querySelector('.list_box');
				if (!ele || !scrollEle) return false;
				ele.scrollTop = 0;
				scrollEle.scrollTop = 0;
			}}> <img style={{ width: '.62rem' }} src={require('../assets/back_top.png')} /> </div>}

			<div className="device_info_page_content">
				<div className="device_card_box">
					<DeviceItem loading={loading} onUnbindDevice={this.onUnbindDevice.bind(this)} onOk={() => { this.pushPage({ url: "/device_set_carousel", params: this.state.deviceInfo }) }} deviceInfo={this.state.deviceInfo} showArrow={false} showActionBtn={true} />
				</div>


				<Tabs tabBarUnderlineStyle={{ border: 0, width: "30%", marginLeft: ".66rem", bottom: '15%', height: '3px', background: 'linear-gradient(90deg, #4881FA, #6ED6F5)', borderRadius: '3px' }} tabBarBackgroundColor={'#131425'} tabs={
					[{ title: this.t('本网络NFT'), index: 0 }, { title: this.t('其他网络NFT'), index: 1 }]
				}
					onChange={this.tabOnChange.bind(this)}
					initialPage={0}
				>
					<div className="list_box" id="scrollableDiv">
						<InfiniteScroll
							key={"scrollableDiv"}
							dataLength={nftList1.length}
							next={this.loadMoreData.bind(this)}
							hasMore={hasMore}
							loader={loader}
							endMessage={nftList1.length ? endMessage : ''}
							scrollableTarget={"scrollableDiv"}
						>
							{(nftList1.length) ? nftList1.map(item => <NftCard page={this} showTransferBtn={false} showChain={chain.chain !== item.chain} key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item, '')} nft={item} btnText={t("取出到钱包")} btnLoadingText={t("取出到钱包")} />) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}
						</InfiniteScroll>
						{/* {tabIndex == 0 && <NftList page={this} owner={this.params.address} isRefresh={isRefresh} listType='chain' />} */}
					</div>
					<div className="list_box" id="scrollableDiv2">
						{tabIndex === 1 && <NoticeBar mode="closable" action={<CloseOutlined style={{ color: '#a1a1a1', }} />}>
							{t("您只能查看在其他网络的NFT，不能进行任何操作，若您想把其他网络的NFT取出到钱包，需切换到该NFT所在的网络后才可以将该NFT取出到钱包")}
						</NoticeBar>}
						<InfiniteScroll
							key={"scrollableDiv2"}
							dataLength={nftList2.length}
							next={this.loadMoreData.bind(this)}
							hasMore={hasMore}
							loader={loader}
							endMessage={nftList2.length ? endMessage : ''}
							scrollableTarget={"scrollableDiv2"}
						>
							{(nftList2.length) ? nftList2.map(item => <NftCard page={this} showTransferBtn={false} showChain={chain.chain !== item.chain} key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item, '')} nft={item} btnText={t("取出到钱包")} btnLoadingText={t("取出到钱包")} />) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}
						</InfiniteScroll>
						{/* {tabIndex == 1 && <NftList page={this} owner={this.params.address} isRefresh={isRefresh} id="scrollableDiv" listType='other_chain' />} */}
					</div>
				</Tabs>

				{/* {nftList.map(item => <NftCard showTransferBtn={false} key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item, '')} nft={item} btnText={t("取出到钱包")} btnLoadingText={t("取出到钱包")} />)} */}
			</div>

		</div>
	}
}

export default withTranslation('translations', { withRef: true })(DeviceInfo);
