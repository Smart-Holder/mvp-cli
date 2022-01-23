import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import Input from '../../../src/components/input';
import { Checkbox } from 'antd';
import Button from '../../../src/components/button'
import { decryptPrivateKey, encryptPrivateKey } from '../../../deps/webpkit/deps/crypto-tx/keystore';
import native from '../../util/prefix_native'
import { genPrivateKey } from '../../../deps/webpkit/deps/crypto-tx/account';
import { alert } from 'webpkit/lib/dialog';
import "./index.scss";
import wallet_ui, { SecretKey } from '../../wallet_ui';


export default class CreateAccount extends NavPage {

	state = {
		address_name: '',
		password: '',
		confirm_password: '',
	}

	async create() {
		// this.pushPage('/safety_tips');
		// genPrivateKey
		let { address_name, password, confirm_password } = this.state;

		if (confirm_password !== password) return alert("两次密码输入不一致!");

		try {
			let privateKey = genPrivateKey();
			let keyStore = await encryptPrivateKey('0x' + privateKey.toString('hex'), password);
			console.log(privateKey.toString('hex'), "privateKey");

			// await native.setKey(address_name, JSON.stringify(keyStore));
			await wallet_ui.addKey(address_name, new SecretKey(keyStore));
			alert('密钥创建成功!', () => this.replacePage('/safety_tips'));
		} catch (error: any) {
			alert(error);
		}
	}


	render() {
		let { address_name, password, confirm_password } = this.state;

		return <div className="create_account_page"> <Header page={this} title="创建账号" />

			<div className="create_account_page_content">
				<div className="card_box secret_key_name_box">
					<div className="card_title">管理密钥名称</div>
					<div className="card_body">
						<Input maxLength={25} placeholder="请输入管理密钥名称" value={address_name} onChange={(e) => this.setState({ address_name: e.target.value })} />

					</div>
				</div>

				<div className="card_box secret_key_pwd_box">
					<div className="card_title">解锁密码</div>
					<div className="card_body">
						<Input minLength={8} maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={password} onChange={(e) => this.setState({ password: e.target.value })} />
						<div className="line"></div>
						<Input minLength={8} maxLength={25} inputType="password" placeholder="请重复输入密码" value={confirm_password} onChange={(e) => this.setState({ confirm_password: e.target.value })} />
					</div>
				</div>

				{/* <div className="checkbox_part">
					<Checkbox style={{ marginRight: '.05rem', marginLeft: '.08rem' }} />
					<div className="checkbox_label">
						<span>我已仔细阅读并同意</span>
						<a>《用户协议》</a>
					</div>
				</div> */}

				<Button onClick={this.create.bind(this)} className="import_btn" type='primary' disabled={!address_name || password.length < 8 || confirm_password.length < 8} >创建账号</Button>
			</div>

		</div>
	}
}