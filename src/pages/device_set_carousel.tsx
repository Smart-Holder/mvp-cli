import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import { Modal } from 'antd-mobile';
import Button from '../components/button';
import SetCarousel from '../components/set_carousel';
import { Device } from '../models';
import { Drawer, Slider, Switch } from 'antd';
// import { confirm } from '../../deps/webpkit/lib/dialog';
import { alert, confirm } from '../util/tools'
import { withTranslation } from 'react-i18next';
import IconFont from '../components/icon_font';
import { checkVersion, getScreenSettings, screenColor, screenLight, screenOrientation, screenVolume, screenWiFi, switchAutoLight, switchDetails, upgradeVersion } from '../models/device';
import Loading from '../../deps/webpkit/lib/loading';

import '../css/device_set_carousel.scss';

enum SettingDarwerType { audio = 'audio', autoLight = 'autoLight', brightness = 'brightness', wifi = 'wifi', image = 'image', rotation = 'rotation', color = 'color', version = 'version', detail = 'detail', shadow = 'shadow' };

const settingDarwerConfig = [
	{ label: "音量", value: SettingDarwerType.audio, icon: 'icon-shengyin' },
	// { label: "自动调整亮度", value: SettingDarwerType.autoLight, icon: 'icon-sunliangdu' },
	{ label: "亮度", value: SettingDarwerType.brightness, icon: 'icon-liangdu1' },
	{ label: "WI-FI", value: SettingDarwerType.wifi, icon: 'icon-WIFI' },
	{ label: "屏幕角度", value: SettingDarwerType.rotation, icon: 'icon-zhizhangfangxiang' },
	{ label: "更新检查", value: SettingDarwerType.version, icon: 'icon-banbengengxin' },
	{ label: "背景颜色", value: SettingDarwerType.color, icon: 'icon-yanse' },
	{ label: "NFT信息", value: SettingDarwerType.detail, icon: 'icon-luojituxianshiyincang' },
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

class DeviceSetCarousel extends NavPage<Device> {

	tabsConfig = [
		{ title: this.t('轮播图片选择'), index: 0 }, { title: this.t('轮播时间间隔'), index: 1 }
	];

	state = {
		tabsCurrent: 0,
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
		time: 10,
		versionCode:0
	}

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ switchDetails, volume, light, color, switchAutoLight, time, versionCode }) => {
			if (light > 100) light = 100;
			light = parseInt(String(light / 20));
			volume = volume / 3;
			console.log(versionCode);
			
			this.setState({ switchValue: switchDetails, volume, light, currColor: color, autoLight: switchAutoLight, time, versionCode});
		}).catch((err: any) => {
			alert(err.message);
		}).finally(() => l.close());
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
			<div style={{ marginBottom: '.2rem' }}>{t('开关：显示/隐藏NFT信息和详情二维码')}</div>
			<Switch onChange={async (e) => {
				this.setState({ switchValue: e, switchLoading: true });
				await switchDetails(this.params.address, e);
				this.setState({ switchLoading: false });
			}} loading={switchLoading} checked={switchValue} checkedChildren={t("开启")} unCheckedChildren={t("关闭")} />
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
			case SettingDarwerType.shadow:
				return <SetCarousel time={time} page={this} mode='shadow' />;

			default:
				return <SetCarousel time={time} page={this} mode='normal' />;
		}
	}


	// 抽屉项点击事件
	async drawerItemClick(currSettingIndex: SettingDarwerType) {
		if ([SettingDarwerType.wifi, SettingDarwerType.version].includes(currSettingIndex)) {
			this.setState({ currcallDeviceIndex: currSettingIndex, settingModalVisible: true, });
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
			res.upgrading && alert(this.t('设备升级中...'));
		});
	}

	render() {

		const { currSettingIndex, drawerVisible, currcallDeviceIndex, hasNew, hasNewLoading, hasNewAction, versionCode} = this.state;
		const { t } = this;
		return <div className="device_set_carousel_page">
			<div className="device_set_carousel_page_content">
				<Header title={t("设置")} page={this} actionBtn={<IconFont onClick={() => this.setState({ drawerVisible: true })} style={{ fontSize: ".5rem", marginRight: '.2rem', width: '.38rem', height: '.38rem' }} type="icon-ai221" />} />
				<div className="device_set_carousel_body">
					{this.getCurrPageContent()}
				</div>

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
					let ele = <p onClick={this.drawerItemClick.bind(this, item.value)} className={item.value == currSettingIndex ? 'active' : ''} style={{ display: 'flex', alignItems: 'center' }}><IconFont style={{ width: '.34rem', height: '.34rem', marginRight: '.2rem' }} type={item.icon} /> {t(item.label)}</p>;
					if ([SettingDarwerType.shadow].includes(item.value) && versionCode < 139) return false;
						return ele;
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
							<div className="label">{t("检测版本")}:</div>
							{hasNewAction ?
								<Button loading={hasNewLoading} className={String(hasNew && 'hasNew')} ghost type="primary" onClick={this.settingModalClick.bind(this)}> {hasNew ? t('发现新版本') : t('已经是最新版本了')}</Button> :
								<Button loading={hasNewLoading} ghost type="primary" onClick={this.checkDeviceVersion.bind(this)} > {t("点击检查版本更新")}</Button>
							}
						</div>
						:
						<div className='label_item'>
							<div className="label">{t("WIFI设置")}:</div>
							<Button ghost type="primary" onClick={this.settingModalClick.bind(this)}> {t(callDeviceConfig[currcallDeviceIndex]?.btnText)}</Button>
						</div>
					}
				</div>
			</Modal>

		</div>
	}
}

export default withTranslation('translations', { withRef: true })(DeviceSetCarousel);
