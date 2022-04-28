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
import { clearShadow, timeMultiImage } from "../../models/device";
import { alert } from '../../util/tools'
import chain from "../../chain";

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
		tabsCurrent: 0,
		nft: [] as NFT[],
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		videoNftList: [] as NFT[],
		carouselIntervalTime: 10,
		carouselConfig: {} as device.DeviceScreenSave,
		tabs: this.tabsConfig,
		isShadow: false,
		selectedArrList: [] as NFT[]
	}

	componentWillMount() {
		this.getCarouselConfig();
	}

	componentWillReceiveProps(props: ISetCarouselProps) {
		if (props.mode != this.props.mode || props.time != this.props.time) {
			this.getCarouselConfig(props.mode, props.time);
		}
	}

	// 获取本地轮播图配置
	async getCarouselConfig(newMode?: 'normal' | 'shadow', newTime?: number) {
		let { address } = this.props.page.params;
		let mode = newMode || this.props.mode;
		let carouselConfig = await modeConfig[mode].get_screen_save(address);
		let nftList = await this.getNftList(undefined, carouselConfig.type as CarouselType);
		let newselectedList = await this.getNewSelectedList(nftList);
		// const { time } = await getScreenSettings(address);
		let isShadow = Boolean(localStorage.getItem('isShadow') == '1');
		this.setState({ carouselConfig, radioValue: carouselConfig.type, selectedArrList: newselectedList, carouselIntervalTime: newTime || this.props.time, isShowAbbreviation: false, isShadow });
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

		// nftList.forEach(item => {
		// 	let { image, imageOrigin, media, mediaOrigin } = item;
		// 	if (image && imageOrigin && media && mediaOrigin) {
		// 		item.media.match(/\.mp4/i) ? videoNftList.push(item) : imgNftList.push(item)
		// 	}
		// });

		(nftList).forEach((item, index) => {
			!Boolean(index % 2) ? leftNftList.push(item) : rightNftList.push(item);
		});

		let newState: any = { leftNftList, rightNftList, nft: nftList};

		// type !== CarouselType.video && (newState.nft = nftList);

		this.setState({ ...newState });
		return nftList;
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

		let nftListObj = ArrayToObj(nftList || [] as any, 'id');

		let newselectedList: { [key: string]: NFT } = {};
		carouselConfig.data.forEach(item => {
			if (nftListObj[item.id]) newselectedList[item.id] = item as NFT;;
		});
		// console.log(Object.values(newselectedList), 'Object.values(newselectedList)', carouselConfig.data);
		return Object.values(newselectedList);
	}

	rendNftItem(nft: NFT, index: number) {
		const {  selectedArrList } = this.state;
		let ids = selectedArrList.map(item => item.id);
		return <div key={nft.id} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
			{nft.media.match(/\.mp4/i) ? <video controls src={nft.media || nft.mediaOrigin} poster={nft.image || nft.imageOrigin}></video> : <img src={nft.image || nft.imageOrigin} alt="" />}
			<div className={`select_btn ${ids.includes(nft.id) && 'select_btn_active'}`} />
		</div>
	}


	// nft列表项点击事件
	nftItemClick(nftItem: NFT) {
		let {  isShowAbbreviation,  selectedArrList} = this.state;
		let newselectedArrList = JSON.parse(JSON.stringify([ ...selectedArrList ]));

		let findNftIndex = newselectedArrList.findIndex((item:any) => item.id === nftItem.id);

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
		const { carouselConfig,  carouselIntervalTime } = this.state;
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
		let { carouselConfig,  selectedArrList } = this.state;
		let newCarouselConfig = { ...carouselConfig, data: selectedArrList };
		let { mode } = this.props;
		console.log(newCarouselConfig,"newCarouselConfig");
		
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

	render() {
		const {  isShowAbbreviation, leftNftList, rightNftList, tabsCurrent, carouselIntervalTime, tabs,  selectedArrList } = this.state;
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
					}} className={`carousel_tabs`}>{item.title}</div>}
				>
					<div className="item_page" >
						{leftNftList.length ? <div className="nft_list">
							<div className="left_box">
								{leftNftList.map((item,index) => this.rendNftItem(item,index))}
							</div>

							<div className="right_box">
								{rightNftList.map((item,index) => this.rendNftItem(item,index))}
							</div>
						</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../../assets/empty_img.png')} description={t("暂无NFT，请添加NFT至钱包")} />}
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
					<Button type="primary" size="small" onClick={this.saveCarousel.bind(this)}>{t('确定')} ( {selectedArrList.length} )</Button>
				</div>
				<div className="bottom_part">
					{selectedArrList.map(item => {
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
