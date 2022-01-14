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

type IimportMethodType = 'secret_key' | 'mnemonic_words';

class ImportSecretKeyPage extends NavPage {

	state = {
		import_method: 'secret_key' as IimportMethodType,
		address: '',
		secret_key_name: '',
		password: '',
		confirm_password: '',
	}

	set_import_method(import_method: IimportMethodType) {
		this.setState({ import_method });
	}

	// 导入钱包
	async importWallet() {
		let { address, secret_key_name, password, confirm_password } = this.state;
		
		if (confirm_password !== password) return alert("两次密码输入不一致!");

		try {
			let keyStore = await encryptPrivateKey('0x' + address, password);
			await native.setKey(secret_key_name, JSON.stringify(keyStore));
			alert('私钥导入成功!',() => this.pushPage('/home'));
		} catch (error:any) {
			alert(error);
		}
		// let data = await native.getKey(secret_key_name);

		// let privateKey = await decryptPrivateKey(JSON.parse(String(data)), password);
		// alert(String(data));
		// console.log(privateKey.toString('hex'),data);
	}

	// 扫码获取私钥地址
	async scan() {
		let address = await native.scan();
		this.setState({ address });
	}

	render() {

		let { import_method, address, secret_key_name, password, confirm_password } = this.state;
		return <div className="import_secretkey_page">
			<Header title="导入方式" page={this} />

			<div className="import_secretkey_page_content">
				<div className="import_method_card">
					<div onClick={this.set_import_method.bind(this, 'secret_key')} className={`import_item ${import_method == 'secret_key' && 'active'}`}> <span>私钥导入</span> </div>
					<div onClick={this.set_import_method.bind(this, 'mnemonic_words')} className={`import_item ${import_method == 'mnemonic_words' && 'active'}`}> <span>助记词导入</span> </div>
				</div>


				<div className="card_box address">
					<div className="wallet_input_box">
						<Input placeholder="输入密码或扫描二维码，注意大小写" value={address} onChange={(e) => this.setState({ address: e.target.value })} />
						<IconFont className="qrcode_icon" type="icon-saoma" onClick={this.scan.bind(this)} />
					</div>
				</div>

				<div className="card_box secret_key_name_box">
					<div className="card_title">管理密钥名称</div>
					<div className="card_body">
						<Input maxLength={25} placeholder="请输入管理密钥名称" value={secret_key_name} onChange={(e) => this.setState({ secret_key_name: e.target.value })} />
					</div>
				</div>

				<div className="card_box secret_key_pwd_box">
					<div className="card_title">解锁密码</div>
					<div className="card_body">
						<Input maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={password} onChange={(e) => this.setState({ password: e.target.value })} />
						<div className="line"></div>
						<Input maxLength={25} inputType="password" placeholder="请重复输入密码" value={confirm_password} onChange={(e) => this.setState({ confirm_password: e.target.value })} />
					</div>
				</div>

				<div className="checkbox_part">
					<Checkbox style={{ marginRight: '.05rem', marginLeft: '.08rem' }} />
					<div className="checkbox_label">
						<span>我已仔细阅读并同意</span>
						<a>《用户协议》</a>
					</div>
				</div>

				<Button disabled={!address || !password || !confirm_password || !secret_key_name} className="import_btn" type='primary' onClick={this.importWallet.bind(this)}>导入账号</Button>
			</div>
		</div>;
	}
}

export default ImportSecretKeyPage;