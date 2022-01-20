import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import Input from '../../../src/components/input';
import IconFont from '../../../src/components/icon_font';
import { Checkbox } from 'antd';
import Button from '../../../src/components/button';
import { alert } from 'webpkit/lib/dialog';
import "./index.scss";
import { decryptPrivateKey, encryptPrivateKey } from '../../../deps/webpkit/deps/crypto-tx/keystore';
import native from '../../native'
import wallet_ui from '../../wallet_ui';

type IimportMethodType = 'secret_key' | 'mnemonic_words';

class ImportSecretKeyPage extends NavPage<{ key: string; type: 'modify' | 'reset' }> {

	state = {
		import_method: 'secret_key' as IimportMethodType,
		address: '',
		secret_key_name: '',
		password: '',
		confirm_password: '',
		old_password: ''
	}

	async triggerLoad() {

	}

	set_import_method(import_method: IimportMethodType) {
		this.setState({ import_method });
	}

	// 导入钱包
	async importWallet() {
		let { password, confirm_password, old_password, address } = this.state;
		let { key, type } = this.params;
		if (confirm_password !== password) return alert("两次密码输入不一致!");

		if (type == 'modify') {
			try {
				let keyStore = JSON.parse(await native.getKey(key) || '{}');

				let privateKey = decryptPrivateKey(keyStore, old_password).toString('hex');

				let keyStoreJson = await encryptPrivateKey('0x' + privateKey, confirm_password);
				wallet_ui.setAccounts(undefined);
				await native.setKey(key, JSON.stringify(keyStoreJson));

				alert('密码修改成功!', () => this.replacePage('/home'));
			} catch (error: any) {
				console.log(error);
				alert('旧密码输入错误');
			}
		} else {
			try {
				await native.deleteKey(key);
				let keyStoreJson = encryptPrivateKey('0x' + address, confirm_password);
				wallet_ui.setAccounts(undefined);
				await native.setKey(key, JSON.stringify(keyStoreJson));
				alert('密码重置成功!', () => this.replacePage('/home'));
			} catch (error: any) {
				alert(error.message);
			}
		}

	}

	// 扫码获取私钥地址
	async scan() {
		let address = await native.scan();
		this.setState({ address });
	}

	render() {

		let { address, password, confirm_password, old_password } = this.state;
		let { key, type } = this.params;
		return <div className="import_secretkey_page">
			<Header title={type == 'modify' ? "修改解锁密码" : '重置解锁密码'} page={this} />

			<div className="import_secretkey_page_content">


				{Boolean(type === 'reset') && <div className="card_box address">
					<div className="wallet_input_box">
						<Input placeholder="输入密码或扫描二维码，注意大小写" value={address} onChange={(e) => this.setState({ address: e.target.value })} />
						<IconFont className="qrcode_icon" type="icon-saoma" onClick={this.scan.bind(this)} />
					</div>
				</div>}

				<div className="card_box secret_key_name_box">
					<div className="card_title">管理密钥名称</div>
					<div className="card_body">
						<Input disabled={true} maxLength={25} placeholder="请输入管理密钥名称" value={(key)} />
					</div>
				</div>

				{Boolean(type === 'modify') && <div className="card_box secret_key_name_box">
					<div className="card_title">旧密码</div>
					<div className="card_body">
						<Input maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={old_password} onChange={(e) => this.setState({ old_password: e.target.value })} />
					</div>
				</div>}

				<div className="card_box secret_key_pwd_box">
					<div className="card_title">新密码</div>
					<div className="card_body">
						<Input maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={password} onChange={(e) => this.setState({ password: e.target.value })} />
						<div className="line"></div>
						<Input maxLength={25} inputType="password" placeholder="请重复输入密码" value={confirm_password} onChange={(e) => this.setState({ confirm_password: e.target.value })} />
					</div>
				</div>


				<Button disabled={!password || !confirm_password || (!old_password && type == 'modify')} className="import_btn" type='primary' onClick={this.importWallet.bind(this)}>确定</Button>
			</div>
		</div>;
	}
}

export default ImportSecretKeyPage;