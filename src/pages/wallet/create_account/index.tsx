import NavPage from '../../../nav';
import { React } from 'webpkit/mobile';
import Header from '../../../util/header';
import Input from '../../../components/input';
import IconFont from '../../../components/icon_font';
import { Checkbox } from 'antd';
import Button from '../../../components/button';
import { InputItem } from 'antd-mobile';

import "./index.scss";
import { genPrivateKey } from '../../../../deps/webpkit/deps/crypto-tx/account';


export default class CreateAccount extends NavPage {

	state = {
		secret_key_name: '',
		password: '',
		confim_password: '',
	}

	async create() {
		this.pushPage('/safety_tips');
		// genPrivateKey
	}


	render() {
		let { secret_key_name, password, confim_password } = this.state;

		return <div className="create_account_page"> <Header page={this} title="创建账号" />

			<div className="create_account_page_content">
				<div className="card_box secret_key_name_box">
					<div className="card_title">管理密钥名称</div>
					<div className="card_body">
						<Input maxLength={25} placeholder="请输入管理密钥名称" value={secret_key_name} onChange={(e) => this.setState({ secret_key_name: e.target.value })} />
						{/* <InputItem type="phone"
							placeholder="请输入管理密钥名称"
							error={!secret_key_name}
							maxLength={25}
							// onErrorClick={this.onErrorClick}
							onChange={(e) => this.setState({ secret_key_name: e })}
							value={secret_key_name} /> */}
					</div>
				</div>

				<div className="card_box secret_key_pwd_box">
					<div className="card_title">解锁密码</div>
					<div className="card_body">
						<Input minLength={8} maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={password} onChange={(e) => this.setState({ password: e.target.value })} />
						<div className="line"></div>
						<Input minLength={8} maxLength={25} inputType="password" placeholder="请重复输入密码" value={confim_password} onChange={(e) => this.setState({ confim_password: e.target.value })} />
					</div>
				</div>

				<div className="checkbox_part">
					<Checkbox style={{ marginRight: '.05rem', marginLeft: '.08rem' }} />
					<div className="checkbox_label">
						<span>我已仔细阅读并同意</span>
						<a>《用户协议》</a>
					</div>
				</div>

				<Button onClick={this.create.bind(this)} className="import_btn" type='primary' disabled={!secret_key_name || password.length < 8 || confim_password.length < 8} >创建账号</Button>
			</div>

		</div>
	}
}