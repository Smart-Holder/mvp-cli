import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';

import Button from '../../../src/components/button';
import native from '../../util/prefix_native';
import { copyText } from '../../../src/util/tools';
import { confirm } from 'webpkit/lib/dialog';

import "./index.scss";

export default class Account extends NavPage<{ key: string }> {

	state = {
		addressInfo: { address: '', key: '' }
	}

	async triggerLoad() {
		let { key } = this.params;
		// key = (key);
		console.log(key);

		let data = await native.getKey(key);
		this.setState({ addressInfo: { address: '0x' + JSON.parse(String(data)).address, key } });
	}

	async myNft() {
		let { address } = this.state.addressInfo;
		this.pushPage(`/my?address=${address}`);
	}

	async deviceList() {
		this.pushPage('/device');
	}

	// 删除事件
	async deleteAddress() {
		confirm('确定删除当前密钥?', async (isOk) => {
			if (isOk) {
				// alert((this.popPage));
				await native.deleteKey(this.params.key);
				this.popPage();
			};
		});
	}


	render() {
		let { addressInfo } = this.state;
		return <div className="wallet_setting_page">
			<Header page={this} title="设置" />
			<div className="account_item">
				<div className="right_box">
					<div className="account_name">{addressInfo.key}</div>
					<div className="account_address_box" onClick={() => copyText(addressInfo.address)}>
						<div className="account_address textNoWrap" >{addressInfo.address}</div>
						<div className="copy_btn"><IconFont style={{ width: '.36rem', height: '.36rem', marginLeft: '.1rem' }} type="icon-fuzhi" /> </div>
					</div>
				</div>
			</div>

			<div className="setting_item" onClick={this.myNft.bind(this)} style={{ marginBottom: '.3rem' }}>
				<div className="setting_title">我的数字收藏品</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>
			{/* <div className="setting_item" style={{ marginBottom: '.3rem' }} onClick={this.deviceList.bind(this)}>
				<div className="setting_title">管理设备</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div> */}

			<div className="setting_item" onClick={() => this.pushPage(`/wallet_setting_password?key=${this.params.key}&type=modify`)}>
				<div className="setting_title">修改解锁密码</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>
			<div className="setting_item" onClick={() => this.pushPage(`/wallet_setting_password?key=${this.params.key}&type=reset`)}>
				<div className="setting_title">重制解锁密码</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="btn_box">
				<Button type="primary" className="width_btn" danger onClick={this.deleteAddress.bind(this)}>删除管理密钥</Button>
			</div>
		</div>
	}
}