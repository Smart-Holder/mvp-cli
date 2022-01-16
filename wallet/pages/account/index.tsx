import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';

import Button from '../../../src/components/button';
import { confirm } from 'webpkit/lib/dialog';

import storage from '../../../deps/webpkit/deps/somes/storage';
import { LoginState, logout } from '../../user';
import "./index.scss";

export default class Account extends NavPage<{ key: string }> {

	state = {
		userInfo: { name: '' }
	}

	async triggerLoad() {
		var state = await storage.get('loginState') as LoginState;
		this.setState({ userInfo: state });
	}


	async myNft() {
		// let { address } = this.state.addressInfo;
		// console.log(address, 'address');
		// try {
		// 	this.pushPage(`/my?address=${address}`);
		// } catch (error: any) {
		// 	alert(error);
		// }
	}

	async deviceList() {
		this.pushPage('/device');
	}

	// 变更网络
	async changeNetwork() {
		this.pushPage('/change_network');
	}

	render() {
		let { userInfo } = this.state;
		return <div className="account_page">
			<Header page={this} title="设置" />
			<div className="account_item">

				<div className="left_box">
					<IconFont type="icon-weidenglu" />
				</div>
				<div className="right_box">
					<div className="account_name">{userInfo.name}</div>
					{/* <div className="account_address_box" onClick={() => copyText(addressInfo.address)}>
						<div className="account_address textNoWrap" >{addressInfo.address}</div>
					</div> */}
				</div>
			</div>

			{/* <div className="setting_item" onClick={this.myNft.bind(this)}>
				<div className="setting_title">我的数字收藏品</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div> */}
			<div className="setting_item" onClick={this.deviceList.bind(this)}>
				<div className="setting_title">管理设备</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>
			<div className="setting_item" style={{ marginBottom: '.3rem' }} onClick={this.changeNetwork.bind(this)}>
				<div className="setting_title">网络切换</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="btn_box">
				<Button type="primary" className="width_btn" onClick={() => {
					confirm('确认退出当前登录吗?', (isOk) => {
						// logout
						if (isOk) logout();

					});
				}}>退出登录</Button>
			</div>
		</div>
	}
}