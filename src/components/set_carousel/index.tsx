import models, { NFT } from "../../models";
import { React, Component } from 'webpkit/mobile';
import { Tabs } from 'antd-mobile';
import { CarouselType } from "../../pages/device_set_carousel";
import NavPage from "../../nav";
import * as device from '../../models/device';
import { ArrayToObj, showModal } from "../../util/tools";
import Button from '../../components/button';
import { Empty } from 'antd';
import { withTranslation } from 'react-i18next';
// import { alert } from '../../../deps/webpkit/lib/dialog';
import { alert } from '../../util/tools'

import { clearShadow, timeMultiImage } from "../../models/device";
import chain from "../../chain";

import './index.scss';

const intervalTimeConfig = [
	// { label: "5s", value: 5 },
	{ label: "10s", value: 10 },
	{ label: "15s", value: 15 },
	{ label: "20s", value: 20 },
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
	page: NavPage<device.Device>,
	mode: 'normal' | 'shadow',
	time?: number,
}

class SetCarousel extends Component<ISetCarouselProps> {

	t = this.props.page.t;

	tabsConfig = [
		{ title: this.t('轮播图片选择'), index: 0 }, { title: this.t('轮播时间间隔'), index: 1 }
	];

	state = {
		isShowAbbreviation: false,
		radioValue: 'single' as CarouselType,
		tabsCurrent: 0,
		nft: [] as NFT[],
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		videoNftList: [] as NFT[],
		selectedList: {} as { [key: string]: NFT },
		carouselIntervalTime: 10,
		carouselConfig: {} as device.DeviceScreenSave,
		tabs: this.tabsConfig,
		isShadow: false
	}

	componentWillMount() {
		this.getCarouselConfig();
	}

	componentWillReceiveProps(props: ISetCarouselProps) {
		if (props.mode != this.props.mode) {
			this.getCarouselConfig(props.mode);
		}
	}

	// 获取本地轮播图配置
	async getCarouselConfig(newMode?: 'normal' | 'shadow') {
		let { address } = this.props.page.params;
		let mode = newMode || this.props.mode;
		let carouselConfig = await modeConfig[mode].get_screen_save(address);
		let nftList = await this.getNftList(undefined, carouselConfig.type as CarouselType);
		let newselectedList = await this.getNewSelectedList(nftList);
		// const { time } = await getScreenSettings(address);
		let isShadow = Boolean(localStorage.getItem('isShadow') == '1');
		this.setState({ carouselConfig, radioValue: carouselConfig.type, selectedList: newselectedList, carouselIntervalTime: this.props.time, isShowAbbreviation: false, isShadow });
	}


	// 获取nft列表
	async getNftList(list?: NFT[], type?: CarouselType) {
		let { mode } = this.props;
		let { address } = this.props.page.params;
		let owner = await chain.getDefaultAccount();
		let ownerAddress = mode == 'shadow' ? owner : address;
		let nftList: NFT[] = list?.length ? list : await models.nft.methods.getNFTByOwner({ owner: ownerAddress });
		let leftNftList: NFT[] = [];
		let rightNftList: NFT[] = [];
		let videoNftList: NFT[] = [];
		let imgNftList: NFT[] = [];

		nftList.forEach(item => item.media.match(/\.mp4/i) ? videoNftList.push(item) : imgNftList.push(item));

		(type === CarouselType.video ? videoNftList : imgNftList).forEach((item, index) => {
			!Boolean(index % 2) ? leftNftList.push(item) : rightNftList.push(item);
		});

		let newState: any = { leftNftList, rightNftList, videoNftList };

		type !== CarouselType.video && (newState.nft = nftList);

		this.setState({ ...newState });
		return nftList;
	}

	// 标签tab切换事件
	onTabsChange(tabs: any, tabsCurrent: number) {
		const { radioValue } = this.state;
		// 不是多选时 取消选中间隔设置
		radioValue !== CarouselType.multi && (tabsCurrent = 0);
		this.setState({ isShowAbbreviation: false, tabsCurrent });
	}

	// 单选按钮事件
	async setRadioValue(radioValue: CarouselType) {
		let { videoNftList, nft, carouselConfig, tabsCurrent } = this.state;
		let tabs = this.tabsConfig;
		// 仅显示视频nft数据
		radioValue === CarouselType.video ? this.getNftList(videoNftList, radioValue) : this.getNftList(nft, radioValue);
		radioValue === CarouselType.multi && (tabsCurrent = 0);
		let selectedList = {};

		// 选中之前选择的项
		if (radioValue === carouselConfig.type) selectedList = await this.getNewSelectedList(nft);
		this.setState({ radioValue, isShowAbbreviation: false, selectedList, tabs, tabsCurrent });

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
		return newselectedList;
	}

	rendNftItem(nft: NFT) {
		const { selectedList } = this.state;
		return <div key={nft.id} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
			{nft.media.match(/\.mp4/i) ? <video controls src={nft.media || nft.mediaOrigin} poster={nft.image || nft.imageOrigin}></video> : <img src={nft.image || nft.imageOrigin} alt="" />}
			<div className={`select_btn ${selectedList[nft.tokenId] && 'select_btn_active'}`} />
		</div>
	}


	// nft列表项点击事件
	nftItemClick(nftItem: NFT) {
		let { selectedList, isShowAbbreviation, radioValue } = this.state;
		let newselectedList = { ...selectedList };

		if (newselectedList[nftItem.tokenId]) {
			// 删除已选择的nft
			delete newselectedList[nftItem.tokenId];
			// 如果没有选中项了 收起底部弹框
			!Object.keys(newselectedList).length ? (isShowAbbreviation = false) : (isShowAbbreviation = true);

		} else {
			// 单张nft图片选择限制
			if ((radioValue === CarouselType.single || radioValue === CarouselType.video) && Object.keys(selectedList).length >= 1) newselectedList = {};
			// 选中当前点击的nft
			newselectedList[nftItem.tokenId] = nftItem;
			// 显示底部已选弹框
			isShowAbbreviation = true;
		}

		this.setState({ selectedList: newselectedList, isShowAbbreviation });

	}


	// 保存轮播时间间隔
	async saveCarouselIntervalTime() {
		let { t } = this;
		const { address } = this.props.page.params;
		const { carouselConfig, radioValue, carouselIntervalTime } = this.state;
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
		let { carouselConfig, radioValue, selectedList } = this.state;
		let newCarouselConfig = { ...carouselConfig, type: radioValue, data: Object.keys(selectedList).map(key => selectedList[key]) };
		if (radioValue === CarouselType.multi && newCarouselConfig.data.length < 2) return alert(t('请选择至少两张图片'));
		let { mode } = this.props;
		try {
			await modeConfig[mode].set_screen_save(address, { ...newCarouselConfig }, radioValue);
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

	render() {
		const { radioValue, isShowAbbreviation, leftNftList, rightNftList, tabsCurrent, carouselIntervalTime, tabs, selectedList } = this.state;
		const { mode } = this.props;
		let t = this.t;

		return <div className="set_carousel" style={isShowAbbreviation ? { paddingBottom: '2.4rem' } : {}}>
			{mode == 'shadow' && <Button disabled={localStorage.getItem('isShadow') == '0' || !localStorage.getItem('isShadow')} type='link' className='clear_btn' onClick={this.clearShadowClick.bind(this)}>{t('取消投屏')}</Button>}

			<div className="set_carousel_card" style={tabsCurrent ? { height: 'auto' } : {}} >
				<Tabs tabBarActiveTextColor={'#1677ff'} tabBarUnderlineStyle={{ width: "10%", marginLeft: ".95rem" }} tabs={tabs}
					initialPage={0}
					page={tabsCurrent}
					onChange={this.onTabsChange.bind(this)}
					renderTab={(item) => <div onClick={() => {
						if (radioValue === CarouselType.multi && item.index === 1) {
							this.setState({ tabsCurrent: 1 })
						}
					}} className={`${(radioValue !== CarouselType.multi && item.index === 1) && 'disabledTab'} `}>{item.title}</div>}
				>
					<div className="item_page" >
						<div className="radio_box">
							<div onClick={this.setRadioValue.bind(this, CarouselType.single)} className={`radio_item ${radioValue === CarouselType.single && "active"}`}>{t('单张NFT')}</div>
							<div onClick={this.setRadioValue.bind(this, CarouselType.multi)} className={`radio_item ${radioValue === CarouselType.multi && "active"}`}>{t('多张轮播NFT')}</div>
							<div onClick={this.setRadioValue.bind(this, CarouselType.video)} className={`radio_item ${radioValue === CarouselType.video && "active"}`}>{t('选择视频NFT')}</div>
						</div>

						{leftNftList.length ? <div className="nft_list">
							<div className="left_box">
								{leftNftList.map(item => this.rendNftItem(item))}
							</div>

							<div className="right_box">
								{rightNftList.map(item => this.rendNftItem(item))}
							</div>
						</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../../assets/empty_img.png')} description={t("暂无数字藏品，请添加数字藏品至密钥")} />}
					</div>
					<div className="item_page2" >
						<div className="time_box">
							{intervalTimeConfig.map(item => <div key={item.value} onClick={this.intervalTimeSelect.bind(this, item.value)} className={`time_item ${carouselIntervalTime === item.value && 'active'}`}>{item.label}</div>)}
						</div>
					</div>
				</Tabs>
			</div>

			{Boolean(tabsCurrent === 1) && <div className="item_page2_action">
				<Button className="ant-btn-background-ghost" type="primary" onClick={() => this.props.page.popPage()}>{t('取消')}</Button>
				<Button type="primary" onClick={this.saveCarouselIntervalTime.bind(this)}>{t('保存')}</Button>
			</div>}


			{isShowAbbreviation && <div className="bottom_modal_box">
				<div className="top_part">
					<Button className="ant-btn-background-ghost" type="primary" size="small" onClick={() => this.setState({ isShowAbbreviation: false })}>{t('取消')}</Button>
					<Button type="primary" size="small" onClick={this.saveCarousel.bind(this)}>{t('确定')} ( {Object.keys(selectedList).length} )</Button>
				</div>
				<div className="bottom_part">
					{Object.keys(selectedList).map(key => {
						let item = selectedList[key];
						return <div key={item.id} className="selected_nft_item">
							<div className="close_btn">
								<img onClick={this.nftItemClick.bind(this, item)} src={require('../../assets/close.png')} alt="x" />
							</div>
							<img className="nft_img" src={item.image || item.imageOrigin} alt="" />
						</div>
					})}
				</div>
			</div>}
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(SetCarousel);
