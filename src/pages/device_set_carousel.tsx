import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import { Tabs, } from 'antd-mobile';
import Button from '../components/button';
import models, { Device, NFT } from '../models';
import { Empty } from 'antd';
import * as device from '../models/device';
import { alert } from '../../deps/webpkit/lib/dialog';

import '../css/device_set_carousel.scss';
import { ArrayToObj } from '../util/tools';


const tabsConfig = [
	{ title: '轮播图片选择', index: 0 }, { title: '轮播时间间隔', index: 1 }
];

const intervalTimeConfig = [
	{ label: "5秒", value: 5 },
	{ label: "10秒", value: 10 },
	{ label: "15秒", value: 15 },
	{ label: "20秒", value: 20 },
];
enum CarouselType { single = 'single', multi = 'multi', video = 'video' };

export default class extends NavPage<Device> {
	state = {
		isShowAbbreviation: false,
		radioValue: 'single' as CarouselType,
		tabsCurrent: 0,
		nft: [] as NFT[],
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		videoNftList: [] as NFT[],
		selectedList: {} as { [key: string]: NFT },
		carouselIntervalTime: 5,
		carouselConfig: {} as device.DeviceScreenSave,
		tabs: tabsConfig
	}

	async triggerLoad() {
		let carouselConfig = await device.get_screen_save(this.params.address);

		let nftList = await this.getNftList(undefined, carouselConfig.type as CarouselType);
		let newselectedList = await this.getNewSelectedList(nftList);
		console.log(carouselConfig, "carouselConfig");
		this.setState({ carouselConfig, radioValue: carouselConfig.type, selectedList: newselectedList, carouselIntervalTime: carouselConfig.time });
	}

	// 获取nft列表
	async getNftList(list?: NFT[], type?: CarouselType) {
		let nftList: NFT[] = list?.length ? list : await models.nft.methods.getNFTByOwner({ owner: this.params.address });
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

	// 根据之前保存的配置 获取新的选中项
	async getNewSelectedList(nftList?: NFT[]) {
		let carouselConfig = await device.get_screen_save(this.params.address);
		let nftListObj = ArrayToObj(nftList || [] as any, 'tokenId');
		console.log(nftListObj, "nftListObj");

		let newselectedList: { [key: string]: NFT } = {};
		carouselConfig.data.forEach(item => {
			if (nftListObj[item.tokenId]) newselectedList[item.tokenId] = item as NFT;;

		});
		return newselectedList;
	}

	// 单选按钮事件
	async setRadioValue(radioValue: CarouselType) {
		let { videoNftList, nft, carouselConfig, tabsCurrent } = this.state;
		let tabs = tabsConfig;
		// 仅显示视频nft数据
		radioValue === CarouselType.video ? this.getNftList(videoNftList, radioValue) : this.getNftList(nft, radioValue);
		radioValue === CarouselType.multi && (tabsCurrent = 0);
		let selectedList = {};
		// console.log(tabsCurrent, "tabsCurrent");

		// 选中之前选择的项
		if (radioValue === carouselConfig.type) selectedList = await this.getNewSelectedList(nft);
		this.setState({ radioValue, isShowAbbreviation: false, selectedList, tabs, tabsCurrent });
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
		console.log(newselectedList, "newselectedList");
		this.setState({ selectedList: newselectedList, isShowAbbreviation });
	}

	// 标签tab切换事件
	onTabsChange(tabs: any, tabsCurrent: number) {
		const { carouselConfig, radioValue } = this.state;
		// 不是多选时 取消选中间隔设置
		radioValue !== CarouselType.multi && (tabsCurrent = 0);
		this.setState({ isShowAbbreviation: false, tabsCurrent, carouselIntervalTime: carouselConfig.time });
	}

	// 滚动间隔选择
	intervalTimeSelect(val: number) {
		this.setState({ carouselIntervalTime: val });
	}

	rendNftItem(nft: NFT) {
		const { selectedList } = this.state;
		return <div key={nft.id} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
			{/* <img src={(nft.image)} alt="" /> */}
			{nft.media.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image}></video> : <img src={nft.image} alt="" />}
			<div className={`select_btn ${selectedList[nft.tokenId] && 'active'}`} />
		</div>
	}

	// 保存轮播图配置
	async saveCarousel() {
		let { address } = this.params;
		let { carouselConfig, radioValue, selectedList } = this.state;


		let newCarouselConfig = { ...carouselConfig, type: radioValue, data: Object.keys(selectedList).map(key => selectedList[key]) };
		if (radioValue === CarouselType.multi && newCarouselConfig.data.length < 2) return alert('请选择至少两张图片');

		try {
			await device.set_screen_save(address, { ...newCarouselConfig }, radioValue);
			this.setState({ isShowAbbreviation: false, carouselConfig: newCarouselConfig });
			alert('轮播图设置完成!');
		} catch (error: any) {
			alert(error);
		}
	}

	// 保存轮播时间间隔
	async saveCarouselIntervalTime() {
		const { address } = this.params;
		const { carouselConfig, radioValue, carouselIntervalTime } = this.state;
		// 修改当前选择的时间间隔
		let newCarouselConfig = { ...carouselConfig, time: carouselIntervalTime };

		try {
			await device.set_screen_save(address, { time: carouselIntervalTime }, radioValue);
			console.log(newCarouselConfig, "newCarouselConfig");
			this.setState({ carouselConfig: newCarouselConfig });
			alert('轮播图时间间隔设置完成!');
		} catch (error: any) {
			alert(error.message);
		}

	}

	render() {

		const { radioValue, isShowAbbreviation, leftNftList, rightNftList, selectedList, tabsCurrent, carouselIntervalTime, tabs } = this.state;

		return <div className="device_set_carousel_page">
			<div className="device_set_carousel_page_content">
				<Header title="设置" page={this} />


				<div className="set_carousel" style={isShowAbbreviation ? { paddingBottom: '2.4rem' } : {}}>
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
						// onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
						>
							<div className="item_page" >
								<div className="radio_box">
									<div onClick={this.setRadioValue.bind(this, CarouselType.single)} className={`radio_item ${radioValue === CarouselType.single && "active"}`}>单张NFT</div>
									<div onClick={this.setRadioValue.bind(this, CarouselType.multi)} className={`radio_item ${radioValue === CarouselType.multi && "active"}`}>多张轮播NFT</div>
									<div onClick={this.setRadioValue.bind(this, CarouselType.video)} className={`radio_item ${radioValue === CarouselType.video && "active"}`}>选择视频NFT</div>
								</div>

								{leftNftList.length ? <div className="nft_list">
									<div className="left_box">
										{leftNftList.map(item => this.rendNftItem(item))}
									</div>

									<div className="right_box">
										{rightNftList.map(item => this.rendNftItem(item))}
									</div>
								</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../assets/empty_img.png')} description="暂无NFT，请添加NFT至钱包" />}
							</div>
							<div className="item_page2" >
								<div className="time_box">
									{intervalTimeConfig.map(item => <div key={item.value} onClick={this.intervalTimeSelect.bind(this, item.value)} className={`time_item ${carouselIntervalTime === item.value && 'active'}`}>{item.label}</div>)}
								</div>
							</div>
						</Tabs>
					</div>

					{Boolean(tabsCurrent === 1) && <div className="item_page2_action">
						<Button className="ant-btn-background-ghost" type="primary" onClick={() => this.popPage()}>取消</Button>
						<Button type="primary" onClick={this.saveCarouselIntervalTime.bind(this)}>保存</Button>
					</div>}
				</div>

				{isShowAbbreviation && <div className="bottom_modal_box">
					<div className="top_part">
						<Button className="ant-btn-background-ghost" type="primary" size="small" onClick={() => this.setState({ isShowAbbreviation: false })}>取消</Button>
						<Button type="primary" size="small" onClick={this.saveCarousel.bind(this)}>确定 ( {Object.keys(selectedList).length} )</Button>
					</div>
					<div className="bottom_part">
						{Object.keys(selectedList).map(key => {
							let item = selectedList[key];
							return <div key={item.id} className="selected_nft_item">
								<div className="close_btn">
									<img onClick={this.nftItemClick.bind(this, item)} src={require('../assets/close.png')} alt="x" />
								</div>
								<img className="nft_img" src={item.image} alt="" />
							</div>
						})}
					</div>
				</div>}
			</div>

		</div>
	}
}