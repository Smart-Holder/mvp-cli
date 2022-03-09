import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import { Tabs, Modal } from 'antd-mobile';
import Button from '../components/button';
import SetCarousel from '../components/set_carousel';

import models, { Device, NFT } from '../models';
import { Empty, Drawer, Slider, Switch } from 'antd';
import * as device from '../models/device';
import { alert, confirm } from '../../deps/webpkit/lib/dialog';
import { ArrayToObj } from '../util/tools';
import { withTranslation } from 'react-i18next';
import IconFont from '../components/icon_font';
import { checkVersion, getScreenSettings, screenColor, screenLight, screenOrientation, screenVolume, screenWiFi, switchAutoLight, switchDetails, upgradeVersion } from '../models/device';
import Loading from '../../deps/webpkit/lib/loading';

import '../css/device_set_carousel.scss';




const intervalTimeConfig = [
	// { label: "5s", value: 5 },
	{ label: "10s", value: 10 },
	{ label: "15s", value: 15 },
	{ label: "20s", value: 20 },
];

enum SettingDarwerType { audio = 'audio', autoLight = 'autoLight', brightness = 'brightness', wifi = 'wifi', image = 'image', rotation = 'rotation', color = 'color', version = 'version', detail = 'detail', shadow = 'shadow' };

// enum CallDeviceType {wifi = 'wifi',  version = 'version' };


const settingDarwerConfig = [
	{ label: "音量", value: SettingDarwerType.audio, icon: 'icon-shengyin' },
	// { label: "自动调整亮度", value: SettingDarwerType.autoLight, icon: 'icon-sunliangdu' },
	{ label: "亮度", value: SettingDarwerType.brightness, icon: 'icon-liangdu1' },
	{ label: "WI-FI", value: SettingDarwerType.wifi, icon: 'icon-WIFI' },
	{ label: "屏幕角度", value: SettingDarwerType.rotation, icon: 'icon-zhizhangfangxiang' },
	{ label: "更新检查", value: SettingDarwerType.version, icon: 'icon-banbengengxin' },
	{ label: "背景颜色", value: SettingDarwerType.color, icon: 'icon-yanse' },
	{ label: "数字藏品信息", value: SettingDarwerType.detail, icon: 'icon-luojituxianshiyincang' },
	{ label: "轮播图", value: SettingDarwerType.image, icon: 'icon-lunbotu' },
	{ label: "投屏", value: SettingDarwerType.shadow, icon: 'icon-pingmu' },
];

export enum CarouselType { single = 'single', multi = 'multi', video = 'video' };

const callDeviceConfig: { [key: string]: { title: string, btnText: string } } = {
	wifi: { title: "WIFI设置", btnText: '唤起WIFI' },
	version: { title: "检查版本更新", btnText: '检查更新' },
}

const colorListConfig = [
	{ label: "黑色", color: "#000000" },
	{ label: "白色", color: "#ffffff" },
];

const rotationConfig = [
	{ label: "向左90", value: "left", img: ('left_90') },
	{ label: "旋转180", value: "reverse", img: ('180') },
	{ label: "向右90", value: "right", img: ('right_90') },
];

enum RotationType { left = 'left', reverse = 'reverse', right = 'right' };


class DeviceSetCarousel extends NavPage<Device> {

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
		currSettingIndex: 'image',
		drawerVisible: false,
		settingModalVisible: false,
		currcallDeviceIndex: 'wifi',
		currColor: '#000000',
		switchValue: false,
		switchLoading: false,
		currRotation: 'left',
		volume: 0,
		light: 0,
		dsq_id: 0,
		hasNew: false,
		hasNewLoading: false,
		hasNewAction: false,
		autoLightLoading: false,
		autoLight: false,
		time: 10
	}

	dsqRef = React.createRef();

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ switchDetails, volume, light, color, switchAutoLight, time }) => {
			if (light > 100) light = 100;
			light = parseInt(String(light / 20));
			volume = volume / 3;
			this.setState({ switchValue: switchDetails, volume, light, currColor: color, autoLight: switchAutoLight, time });
		}).finally(() => l.close());
		this.getCarouselConfig();


	}

	// 获取本地轮播图配置
	async getCarouselConfig() {
		let { address } = this.params;
		let carouselConfig = await device.get_screen_save(address);
		let nftList = await this.getNftList(undefined, carouselConfig.type as CarouselType);
		let newselectedList = await this.getNewSelectedList(nftList);


		// console.log(data, "data");
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
		let tabs = this.tabsConfig;
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
			<div className={`select_btn ${selectedList[nft.tokenId] && 'select_btn_active'}`} />
		</div>
	}

	// 保存轮播图配置
	async saveCarousel() {
		let { t } = this;
		let { address } = this.params;
		let { carouselConfig, radioValue, selectedList } = this.state;
		let newCarouselConfig = { ...carouselConfig, type: radioValue, data: Object.keys(selectedList).map(key => selectedList[key]) };
		if (radioValue === CarouselType.multi && newCarouselConfig.data.length < 2) return alert(t('请选择至少两张图片'));

		try {
			await device.set_screen_save(address, { ...newCarouselConfig }, radioValue);
			this.setState({ isShowAbbreviation: false, carouselConfig: newCarouselConfig });
			alert(t('轮播图设置完成!'));
		} catch (error: any) {
			alert(error?.message);
		}
	}

	// 保存轮播时间间隔
	async saveCarouselIntervalTime() {
		let { t } = this;
		const { address } = this.params;
		const { carouselConfig, radioValue, carouselIntervalTime } = this.state;
		// 修改当前选择的时间间隔
		let newCarouselConfig = { ...carouselConfig, time: carouselIntervalTime };

		try {
			await device.set_screen_save(address, { time: carouselIntervalTime }, radioValue);
			console.log(newCarouselConfig, "newCarouselConfig");
			this.setState({ carouselConfig: newCarouselConfig });
			alert(t('轮播图时间间隔设置完成!'));
		} catch (error: any) {
			alert(error.message);
		}

	}

	sliderChange(type: SettingDarwerType, e: number) {
		let volume = e * 3;
		let light = e * 20;
		let { address } = this.params;
		let { dsq_id } = this.state;
		// let dsq_id = 0;
		clearTimeout(dsq_id);
		let newDsqId = setTimeout(() => {
			type === SettingDarwerType.brightness ? screenLight(address, light) : screenVolume(address, volume);
		}, 500);
		if (type === SettingDarwerType.brightness) {
			this.setState({ light: e, dsq_id: newDsqId });
		} else {
			this.setState({ volume: e, dsq_id: newDsqId });
		}
	}

	audioCard() {
		let { t } = this;
		let { volume } = this.state;
		return <div className='setting_card_box'>
			<div>{t("调整音量")}</div>
			<Slider max={5} min={0} value={volume} dots step={1} onChange={this.sliderChange.bind(this, SettingDarwerType.audio)} />

			{/* <div style={{ marginTop: '.2rem' }}>{t("调整亮度")}</div> */}
			{/* <Slider max={5} min={0} defaultValue={light} dots step={1} onChange={this.sliderChange.bind(this, SettingDarwerType.brightness)} /> */}
		</div>
	}

	rotationCard() {
		let { currRotation } = this.state;
		let { t } = this;
		return <div className='setting_card_box rotation_card'>
			<div className="rotation_action_box">

				{rotationConfig.map(item => {
					return <div key={item.value} className="rotation_item" onClick={() => {
						this.setState({ currRotation: item.value });
					}}>
						<img src={require(`../assets/${item.img}.jpg`)} />
						<div className={`select_btn ${currRotation === item.value && 'select_btn_active'}`} />
					</div>
				})}
			</div>

			<Button ghost type="primary" onClick={async () => {
				confirm(t('调整屏幕角度将重启设备，确定调整屏幕角度吗？'), async (isok) => {
					isok && await screenOrientation(this.params.address, currRotation);
				})
			}}>{t('确认')}</Button>
		</div>
	}

	colorCard() {
		let { t } = this;
		let { currColor } = this.state;
		return <div className='setting_card_box color_card'>
			{colorListConfig.map(item => {
				return <div key={item.label} className="color_item" onClick={async () => {
					this.setState({ currColor: item.color });
					if (item.color !== currColor) await screenColor(this.params.address, item.color);
				}}>
					<div className="color_bg_item" style={{ backgroundColor: item.color }}></div>
					<div className="color_text">{t(item.label)}</div>
					<div className={`select_btn ${currColor === item.color && 'select_btn_active'}`} />
				</div>
			})}
		</div>
	}

	// nft信息是否显示
	nftDetailCard() {
		let { t } = this;
		let { switchValue, switchLoading } = this.state;
		return <div className="setting_card_box">
			<div style={{ marginBottom: '.2rem' }}>{t('开关：显示/隐藏数字藏品信息和详情二维码')}</div>
			<Switch onChange={async (e) => {
				this.setState({ switchValue: e, switchLoading: true });
				await switchDetails(this.params.address, e);
				this.setState({ switchLoading: false });
			}} loading={switchLoading} checked={switchValue} checkedChildren={t("开启")} unCheckedChildren={t("关闭")} />
		</div>
	}

	imageCard() {
		const { radioValue, isShowAbbreviation, leftNftList, rightNftList, tabsCurrent, carouselIntervalTime, tabs } = this.state;
		const { t } = this;

		return <div className="set_carousel" style={isShowAbbreviation ? { paddingBottom: '2.4rem' } : {}}>
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
							<div onClick={this.setRadioValue.bind(this, CarouselType.single)} className={`radio_item ${radioValue === CarouselType.single && "active"}`}>{t('单张藏品')}</div>
							<div onClick={this.setRadioValue.bind(this, CarouselType.multi)} className={`radio_item ${radioValue === CarouselType.multi && "active"}`}>{t('多张轮播藏品')}</div>
							<div onClick={this.setRadioValue.bind(this, CarouselType.video)} className={`radio_item ${radioValue === CarouselType.video && "active"}`}>{t('选择视频藏品')}</div>
						</div>

						{leftNftList.length ? <div className="nft_list">
							<div className="left_box">
								{leftNftList.map(item => this.rendNftItem(item))}
							</div>

							<div className="right_box">
								{rightNftList.map(item => this.rendNftItem(item))}
							</div>
						</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../assets/empty_img.png')} description={t("暂无数字藏品，请添加数字藏品至密钥")} />}
					</div>
					<div className="item_page2" >
						<div className="time_box">
							{intervalTimeConfig.map(item => <div key={item.value} onClick={this.intervalTimeSelect.bind(this, item.value)} className={`time_item ${carouselIntervalTime === item.value && 'active'}`}>{item.label}</div>)}
						</div>
					</div>
				</Tabs>
			</div>

			{Boolean(tabsCurrent === 1) && <div className="item_page2_action">
				<Button className="ant-btn-background-ghost" type="primary" onClick={() => this.popPage()}>{t('取消')}</Button>
				<Button type="primary" onClick={this.saveCarouselIntervalTime.bind(this)}>{t('保存')}</Button>
			</div>}
		</div>

	}

	// 设置自动亮度
	autoLight() {
		let { t } = this;
		let { autoLight, autoLightLoading, light } = this.state;
		// console.log(light, "light");

		return <div className="setting_card_box">
			<div style={{ marginBottom: '.2rem' }}>{t('开关：开启/关闭自动调整屏幕亮度')}</div>
			<Switch onChange={async (e) => {
				this.setState({ autoLight: e, autoLightLoading: true });
				await switchAutoLight(this.params.address, e);
				this.setState({ autoLightLoading: false });
			}} loading={autoLightLoading} checked={autoLight} checkedChildren={t("开启")} unCheckedChildren={t("关闭")} />

			{<div style={{ visibility: autoLight ? 'hidden' : 'visible', width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
				<div style={{ marginTop: '.2rem' }}>{t("调整亮度")}</div>
				<Slider max={5} min={0} value={light} dots step={1} onChange={this.sliderChange.bind(this, SettingDarwerType.brightness)} />
			</div>}

		</div>
	}

	getCurrPageContent() {
		const { currSettingIndex, time } = this.state;
		switch (currSettingIndex) {
			case SettingDarwerType.audio:
				return this.audioCard();
			case SettingDarwerType.brightness:
				return this.autoLight();
			case SettingDarwerType.rotation:
				return this.rotationCard();
			case SettingDarwerType.color:
				return this.colorCard();
			case SettingDarwerType.detail:
				return this.nftDetailCard();
			// case SettingDarwerType.autoLight:
			// 	return this.autoLight();
			case SettingDarwerType.shadow:
				return <SetCarousel page={this} mode='shadow' />;

			default:
				return <SetCarousel page={this} mode='normal' />;
				return this.imageCard();
		}
	}


	// 抽屉项点击事件
	async drawerItemClick(currSettingIndex: SettingDarwerType) {
		if ([SettingDarwerType.wifi, SettingDarwerType.version].includes(currSettingIndex)) {
			this.setState({ currcallDeviceIndex: currSettingIndex, settingModalVisible: true, });
			// if (SettingDarwerType.version === currSettingIndex) {

			// 	checkVersion(this.params.address).then((res) => {
			// 		this.setState({ drawerVisible: false, hasNew: res.hasNew, hasNewLoading: false });
			// 		res.upgrading && alert('设备升级中...');
			// 		return
			// 	});
			// }
		} else {
			this.setState({ currSettingIndex, });
		}
		this.setState({ drawerVisible: false, })
	}

	// 设置弹框中的按钮点击
	async settingModalClick() {
		let { address } = this.params;
		let { currcallDeviceIndex, hasNew } = this.state;
		if (currcallDeviceIndex === SettingDarwerType.wifi) {
			await screenWiFi(address)
		} else {
			if (hasNew) {
				await upgradeVersion(address, true);
			} else {
				upgradeVersion(address, false);
			}
			this.setState({ settingModalVisible: false, hasNewAction: false });
		}
		// currcallDeviceIndex === SettingDarwerType.wifi ? await screenWiFi(address) : hasNew ? await checkVersion(address) : this.setState({ settingModalVisible: false });
	}

	// 检查版本更新
	async checkDeviceVersion() {
		this.setState({ hasNewLoading: true });
		checkVersion(this.params.address).then((res) => {
			this.setState({ hasNewAction: true, hasNew: res.hasNew, hasNewLoading: false });
			res.upgrading && alert('设备升级中...');
		});
	}

	render() {

		const { isShowAbbreviation, selectedList, currSettingIndex, drawerVisible, currcallDeviceIndex, hasNew, hasNewLoading, hasNewAction } = this.state;
		const { t } = this;
		return <div className="device_set_carousel_page">
			<div className="device_set_carousel_page_content">
				<Header title={t("设置")} page={this} actionBtn={<IconFont onClick={() => this.setState({ drawerVisible: true })} style={{ fontSize: ".5rem", marginRight: '.2rem', width: '.38rem', height: '.38rem' }} type="icon-ai221" />} />

				<div className="device_set_carousel_body">
					{this.getCurrPageContent()}
				</div>

				{/* {isShowAbbreviation && <div className="bottom_modal_box">
					<div className="top_part">
						<Button className="ant-btn-background-ghost" type="primary" size="small" onClick={() => this.setState({ isShowAbbreviation: false })}>{t('取消')}</Button>
						<Button type="primary" size="small" onClick={this.saveCarousel.bind(this)}>{t('确定')} ( {Object.keys(selectedList).length} )</Button>
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
				</div>} */}
			</div>

			<Drawer
				className='setting-drawer'
				title={t("更多设置")}
				closable={false}
				visible={drawerVisible}
				width='5rem'
				bodyStyle={{ padding: '24px 0' }}
				onClose={() => this.setState({ drawerVisible: false })}
			>
				{settingDarwerConfig.map(item => {
					return <p onClick={this.drawerItemClick.bind(this, item.value)} className={item.value == currSettingIndex ? 'active' : ''} style={{ display: 'flex', alignItems: 'center' }}><IconFont style={{ width: '.34rem', height: '.34rem', marginRight: '.2rem' }} type={item.icon} /> {t(item.label)}</p>
				})}
			</Drawer>

			<Modal
				className="settingModal"
				visible={this.state.settingModalVisible}
				transparent
				onClose={() => { this.setState({ settingModalVisible: false, hasNewAction: false, hasNewLoading: false, hasNew: false }); upgradeVersion(this.params.address, false); }}
				title={t(callDeviceConfig[currcallDeviceIndex]?.title)}
				closable
			>
				<div style={{ height: '1.6rem', display: "flex", alignItems: "center", width: '100%' }}>
					{currcallDeviceIndex === 'version' ?
						<div className='label_item'>
							<div className="label">检测版本:</div>
							{hasNewAction ?
								<Button loading={hasNewLoading} className={String(hasNew && 'hasNew')} ghost type="primary" onClick={this.settingModalClick.bind(this)}> {hasNew ? t('发现新版本') : t('已经是最新版本了')}</Button> :
								<Button loading={hasNewLoading} ghost type="primary" onClick={this.checkDeviceVersion.bind(this)} > 点击检查版本更新</Button>
							}
							{/* // <Button loading={hasNewLoading} className={String(hasNew && 'hasNew')} ghost type="primary" onClick={this.settingModalClick.bind(this)}> {hasNew ? t('发现新版本') : t('已经是最新版本了')}</Button> */}
						</div>
						:
						<div className='label_item'>
							<div className="label">WIFI设置:</div>
							<Button ghost type="primary" onClick={this.settingModalClick.bind(this)}> {t(callDeviceConfig[currcallDeviceIndex]?.btnText)}</Button>
						</div>
					}
				</div>
			</Modal>

		</div>
	}
}

export default withTranslation('translations', { withRef: true })(DeviceSetCarousel);
