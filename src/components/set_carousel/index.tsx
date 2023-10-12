import models, { NFT } from "../../models";
import { React, Component } from 'webpkit/mobile';
import { Tabs, NoticeBar } from 'antd-mobile';
import NavPage from "../../nav";
import * as device from '../../models/device';
import { ArrayToObj, showModal } from "../../util/tools";
import Button from '../../components/button';
import { Empty, Image } from 'antd';
import { withTranslation } from 'react-i18next';
import { clearShadow, getScreenSettings, timeMultiImage } from "../../models/device";
import { alert } from '../../util/tools'
import chain from "../../chain";
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../../../deps/webpkit/lib/loading';

import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { getNFTByOwnerPage } from "../../models/nft";
import './index.scss';

const intervalTimeConfig = [
	{ label: "5s", value: 5 },
	{ label: "10s", value: 10 },
	{ label: "15s", value: 15 },
	{ label: "20s", value: 20 },
	{ label: "30s", value: 30 },
];


const modeConfig = {
	normal: {
		get_screen_save: device.get_screen_save,
		set_screen_save: device.set_screen_save,
	},

	shadow: {
		get_screen_save: device.get_shadow_screen_save,
		set_screen_save: device.set_shadow_screen_save,
	}
}

interface ISetCarouselProps {
	page: NavPage<{ address: string }>,
	mode: 'normal' | 'shadow',
	time?: number,
	screenWidth?: number;
	screenHeight?: number;
	address?: string;
}

class SetCarousel extends Component<ISetCarouselProps> {

	t = this.props.page.t;

	tabsConfig = [
		{ title: this.t('轮播图片选择'), index: 0 }, { title: this.t('轮播时间间隔'), index: 1 }
	];

	state = {
		isShowAbbreviation: false,
		tabsCurrent: 0,
		nft: [] as NFT[],
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		videoNftList: [] as NFT[],
		carouselIntervalTime: 10,
		carouselConfig: {} as device.DeviceScreenSave,
		tabs: this.tabsConfig,
		isShadow: false,
		selectedArrList: [] as NFT[],
		hasMore: true,
		page: 1,
		screenWidth: 1920,
		screenHeight: 1080
	}

	componentWillMount() {
		this.getCarouselConfig();
	}

	componentWillReceiveProps(props: ISetCarouselProps) {
		if (props.mode != this.props.mode) {
			this.setState({ nft: [], page: 1, hasMore: true }, () => {
				this.getCarouselConfig(props.mode, props.time);
			});
		}
	}

	// 获取本地轮播图配置
	async getCarouselConfig(newMode?: 'normal' | 'shadow', newTime?: number) {
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		try {
			let { address } = this.props.page.params;
			let mode = newMode || this.props.mode;
			let carouselConfig = await modeConfig[mode].get_screen_save(address);
			// let screenWidth = 1920;
			// let screenHeight = 1080;
			// let time = 10;
			const { screenWidth, screenHeight, time } = await getScreenSettings(address);
			let nftList = await this.getNftList(undefined, 0, screenWidth, screenHeight);
			let newselectedList = await this.getNewSelectedList(nftList);
			l.close();
			let isShadow = Boolean(localStorage.getItem('isShadow') == '1');
			this.setState({ screenWidth, screenHeight, carouselConfig, radioValue: carouselConfig.type, selectedArrList: newselectedList, carouselIntervalTime: time, isShowAbbreviation: false, isShadow });
		} catch (error: any) {
			l.close();
		}
	}


	// 获取nft列表
	async getNftList(list?: NFT[], curPage?: number, screenWidth?: number, screenHeight?: number) {
		curPage = curPage || 1;
		let { mode } = this.props;
		let { address } = this.props.page.params;
		let { nft } = this.state;
		let owner = await chain.getDefaultAccount();
		let ownerAddress = mode == 'shadow' ? owner : address;
		// let nftList: NFT[] = list?.length ? list : await models.nft.methods.getNFTByOwner({ owner: ownerAddress });
		let nftList: NFT[] = list?.length ? list : await getNFTByOwnerPage({ owner: ownerAddress, address, curPage, pageSize: 16, screenWidth, screenHeight });
		let leftNftList: NFT[] = [];
		let rightNftList: NFT[] = [];

		let newNftList = [...nft, ...nftList];

		(newNftList).forEach((item, index) => {
			!Boolean(index % 2) ? leftNftList.push(item) : rightNftList.push(item);
		});

		let newState: any = { leftNftList, rightNftList, nft: newNftList };
		if (!nftList.length || nftList.length < 16) newState.hasMore = false;

		this.setState({ ...newState });
		return newNftList;
	}

	// 标签tab切换事件
	onTabsChange(tabs: any, tabsCurrent: number) {
		// const { radioValue } = this.state;
		// 不是多选时 取消选中间隔设置
		// radioValue !== CarouselType.multi && (tabsCurrent = 0);
		this.setState({ isShowAbbreviation: false, tabsCurrent });
	}


	// 根据之前保存的配置 获取新的选中项
	async getNewSelectedList(nftList?: NFT[]) {
		let { mode } = this.props;
		let carouselConfig = await modeConfig[mode].get_screen_save(this.props.page.params.address);

		let nftListObj = ArrayToObj(nftList || [] as any, 'tokenId');

		let newselectedList: { [key: string]: NFT } = {};
		carouselConfig.data.forEach(item => {
			if (nftListObj[item.tokenId]) newselectedList[item.tokenId] = item as NFT;;
		});
		return Object.values(newselectedList);
	}

	handleImage = (url: string) => {
		let urlStr = url;
		let isIpfs = ["http://", "https://"].some((value) =>
			urlStr.includes(value)
		);
		if (!isIpfs) {
			urlStr = `https://ipfs.io/ipfs/${urlStr}`;
		}
		return urlStr;
	};

	rendNftItem(nft: NFT, index: number) {
		const { selectedArrList } = this.state;
		let ids = selectedArrList.map(item => item.tokenId);
		return <div key={nft.tokenId} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
			{/* {nft.media.match(/\.mp4/i) ? <video controls src={nft.media || nft.mediaOrigin} poster={nft.image || nft.imageOrigin}></video> : <img src={nft.image || nft.imageOrigin} alt="" />} */}
			{nft.media.match(/\.mp4/i) ? <video controls src={nft.media || nft.mediaOrigin} poster={this.handleImage(nft?.thumbnail || nft.image || nft.imageOrigin)}></video> : <Image className="nft_image" preview={false} placeholder={<LoadingOutlined className="loading_icon" /> || <img src={require("../../assets/img_loading.jpg")} />} src={this.handleImage(nft?.thumbnail || nft.image || nft.imageOrigin)} alt="" fallback={require("../../assets/img_error.jpg")} />}
			{/* <div className={`select_btn ${ids.includes(nft.id) && 'select_btn_active'}`} /> */}
			<img className={`select_img ${ids.includes(nft.tokenId) && 'select_img_active'}`} src={require(`../../assets/${ids.includes(nft.tokenId) ? 'selected' : 'select'}.png`)} />
		</div>
	}


	// nft列表项点击事件
	nftItemClick(nftItem: NFT) {
		let { isShowAbbreviation, selectedArrList } = this.state;
		let newselectedArrList = JSON.parse(JSON.stringify([...selectedArrList]));

		let findNftIndex = newselectedArrList.findIndex((item: any) => item.tokenId === nftItem.tokenId);

		if (findNftIndex >= 0) {
			// 删除已选择的nft
			newselectedArrList.splice(findNftIndex, 1);

			// 如果没有选中项了 收起底部弹框
			!newselectedArrList.length ? (isShowAbbreviation = false) : (isShowAbbreviation = true);


		} else {
			// 选中当前点击的nft
			newselectedArrList.push(nftItem)
			// 显示底部已选弹框
			isShowAbbreviation = true;
		}

		this.setState({ isShowAbbreviation, selectedArrList: newselectedArrList });

	}


	// 保存轮播时间间隔
	async saveCarouselIntervalTime() {
		let { t } = this;
		const { address } = this.props.page.params;
		const { carouselConfig, carouselIntervalTime } = this.state;
		// 修改当前选择的时间间隔
		let newCarouselConfig = { ...carouselConfig, time: carouselIntervalTime };
		// let { mode } = this.props;
		try {
			// await modeConfig[mode].set_screen_save(address, { time: carouselIntervalTime }, radioValue);
			await timeMultiImage(address, carouselIntervalTime);
			this.setState({ carouselConfig: newCarouselConfig });
			alert(t('轮播图时间间隔设置完成!'));
		} catch (error: any) {
			alert(error.message);
		}
	}

	// 滚动间隔选择
	intervalTimeSelect(val: number) {
		this.setState({ carouselIntervalTime: val });
	}


	// 保存轮播图配置
	async saveCarousel() {
		let { t } = this;
		let { address } = this.props.page.params;
		let { carouselConfig, selectedArrList } = this.state;
		let newCarouselConfig = { ...carouselConfig, data: selectedArrList };
		let { mode } = this.props;
		console.log(newCarouselConfig, "newCarouselConfig", mode);

		try {
			await modeConfig[mode].set_screen_save(address, { ...newCarouselConfig }, 'nft');
			mode == 'shadow' && localStorage.setItem('isShadow', '1');

			this.setState({ isShowAbbreviation: false, carouselConfig: newCarouselConfig, isShadow: true });
			alert(t('轮播图设置完成!'));
		} catch (error: any) {
			alert(error?.message);
		}
	}


	// 取消投屏点击
	clearShadowClick() {
		let { t } = this;
		return new Promise((resolve, reject) => {
			let calText = t('取消');
			let okText = t('确认');
			showModal({
				title: t('取消投屏'), text: t('确定取消本次投屏吗？'), buttons: {
					[calText]: resolve,
					[`@${okText}`]: async () => {
						try {
							await clearShadow(this.props.page.params.address);
							resolve('success!');
							localStorage.setItem('isShadow', '0');
							this.setState({ isShadow: false });
							alert(t('已取消投屏'));
						} catch (error: any) {
							alert(error.message);
							reject(error);
						}
					}
				}
			});

		});
	}

	async loadMoreData() {
		let { page } = this.state;
		this.setState({ page: page + 1 }, () => {
			this.getNftList(undefined, page + 1);
		});
	}

	render() {
		const { isShowAbbreviation, leftNftList, rightNftList, tabsCurrent, carouselIntervalTime, tabs, selectedArrList, nft, hasMore } = this.state;
		const { mode } = this.props;
		let t = this.t;

		let loader = <div className="bottom_box" > <LoadingOutlined className="loading_icon" /></div>;

		let endMessage = <div className="bottom_box">{t('已经到底了')}</div>;

		return <div className="set_carousel" style={isShowAbbreviation ? { paddingBottom: '1.4rem' } : {}}>
			{mode == 'shadow' && <Button disabled={localStorage.getItem('isShadow') == '0' || !localStorage.getItem('isShadow')} type='link' className='clear_btn' onClick={this.clearShadowClick.bind(this)}>{t('取消投屏')}</Button>}
			<div className="set_carousel_card" style={tabsCurrent ? { height: 'auto' } : {}} >
				<Tabs tabBarBackgroundColor={"transparent"} tabBarUnderlineStyle={{ border: 0, width: "40%", marginLeft: ".24rem", height: '3px', background: 'linear-gradient(90deg, #4881FA, #6ED6F5)', borderRadius: '3px' }} tabs={tabs}
					initialPage={0}
					page={tabsCurrent}
					onChange={this.onTabsChange.bind(this)}
					renderTab={(item) => <div onClick={() => {
					}} className={`carousel_tabs`}>{item.title}</div>}
				>
					<div className="item_page" id={'scroll_carousel'}>
						{/* {this.props.mode == 'shadow' && <NoticeBar marqueeProps={{ loop: true, text: t("您只能查看在其他网络的NFT，不能进行任何操作，若您想把其他网络的NFT绑定到设备，需切换到该NFT所在的网络后才可以将该NFT绑定到设备") }} mode="closable" action={<CloseOutlined style={{ color: '#a1a1a1', }} />} />} */}
						<InfiniteScroll
							// scrollThreshold={0.1}
							key={"scroll_carousel"}
							dataLength={nft.length}
							next={this.loadMoreData.bind(this)}
							hasMore={hasMore}
							loader={loader}
							endMessage={nft.length ? endMessage : ''}
							scrollableTarget={"scroll_carousel"}
						>
							{leftNftList.length ? <div className="nft_list">
								<div className="left_box">
									{leftNftList.map((item, index) => this.rendNftItem(item, index))}
								</div>

								<div className="right_box">
									{rightNftList.map((item, index) => this.rendNftItem(item, index))}
								</div>
							</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../../assets/empty_img.png')} description={t("暂无NFT，请添加NFT至钱包")} />}
						</InfiniteScroll>
					</div>
					<div className="item_page2" >
						<div className="time_box">
							{intervalTimeConfig.map(item => <div key={item.value} onClick={this.intervalTimeSelect.bind(this, item.value)} className={`time_item ${carouselIntervalTime === item.value && 'active'}`}>{item.label}</div>)}
						</div>
					</div>
				</Tabs>
			</div>

			{Boolean(tabsCurrent === 1) && <div className="item_page2_action">
				<Button className='save_time_btn' type="primary" onClick={this.saveCarouselIntervalTime.bind(this)}>{t('保存')}</Button>
				<Button className="cancel_btn" type="primary" onClick={() => this.props.page.popPage()}>{t('取消')}</Button>
			</div>}


			{/* {isShowAbbreviation && <div className="bottom_modal_box">
				<div className="top_part">
					<Button className="ant-btn-background-ghost" type="primary" size="small" onClick={() => this.setState({ isShowAbbreviation: false })}>{t('取消')}</Button>
					<Button type="primary" size="small" onClick={this.saveCarousel.bind(this)}>{t('确定')} ( {selectedArrList.length} )</Button>
				</div>
				<div className="bottom_part">
					{selectedArrList.map(item => {
						return <div key={item.id} className="selected_nft_item">
							<div className="close_btn">
								<img onClick={this.nftItemClick.bind(this, item)} src={require('../../assets/close.png')} alt="x" />
							</div>
							<Image className="selected_nft_item_image nft_img" preview={false} placeholder={<LoadingOutlined className="loading_icon" /> || <img src={require("../../assets/img_loading.jpg")} />} src={item.image || item.imageOrigin} alt="" fallback={require("../../assets/img_error.jpg")} />
						</div>
					})}
				</div>
			</div>} */}

			{isShowAbbreviation && <div className="bottom_confirm_box">
				<Button className='confirm_btn' onClick={this.saveCarousel.bind(this)}>{t('确定')}</Button>
			</div>}
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(SetCarousel);
