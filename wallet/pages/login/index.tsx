import NavPage from '../../../src/nav';
import { React, ReactDom } from 'webpkit/mobile';
import { Col, Statistic, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Input from '../../../src/components/input';
import Button from '../../../src/components/button';
import { login, register, sendPhoneVerify } from '../../user';
import { alert } from 'webpkit/lib/dialog';
import { verificationPhone } from '../../util/tools';
// import wallet from '../../wallet';
import storage from 'somes/storage'
import native from '../../native';
import { MyRoot } from '../..';
import _404 from '../../../src/pages/404';
import routes from '../../router';
import "./index.scss";

type IMethodType = 'vcode' | 'password'
const { Countdown } = Statistic;



class Login extends NavPage {

	state = {
		login_method: 'vcode' as IMethodType,
		isCountdown: false,
		username: '',
		v_code: '',
		password: '',
		loading: false
	}

	formRef = React.createRef<FormInstance>();

	async triggerLoad() {
		ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));

		var state = await storage.get('loginState');
		let keyname = await native.getKeysName();
		state && this.pushPage(keyname.length ? '/home' : '/secret_key');
	}

	async loginMethodClick(login_method: IMethodType) {
		this.setState({ login_method });
	}

	// 登录事件
	async loginClick() {
		this.setState({ loading: true });
		let { username, password, login_method, v_code } = this.state;
		let isRegister = false;
		try {
			await register(username, password, '000000');
		} catch (error: any) {
			if (error.errno == 100307) isRegister = true;
		}
		if (!isRegister) alert('该账号未注册，请注册后登录');

		try {
			if (login_method == 'vcode') {
				await login(username, { pwd: password, verify: v_code });
			} else {
				await login(username, { pwd: password });
			}
			if (await (await native.getKeysName()).length) return this.replacePage('/home');
			this.replacePage('/secretkey');
		} catch (error: any) {
			alert(error.message);
		}
		this.setState({ loading: false });

		// let data = await _api.scan();
		// alert(data);
		// let fromVal = await this.formRef.current?.validateFields();
		// console.log(fromVal, "fromVal");
		// let privateKey = hash.sha256(username + password + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a');
		// console.log(username, password );
		// let privateKey = hash.sha256(username + password + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a');
		// a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699eccd55f9ff301a
		// console.log(privateKey.toString('base64'));

		// await devices();
		// console.log(privateKey.toString('base64'), "privateKey");

	}

	// 输入框事件
	inputChange(key: string, e: React.ChangeEvent<HTMLInputElement>) {
		// console.log(e.target.value);
		let val = e.target.value;
		this.setState({ [key]: val });


	}

	// 获取验证码
	async getVcode() {
		let { username } = this.state;
		if (!verificationPhone(username)) return alert('请输入有效的手机号码');
		try {
			await sendPhoneVerify(username);
			this.setState({ isCountdown: true });
		} catch (error: any) {
			alert(error.message);
		}
	}

	render() {
		let { login_method, isCountdown, username, v_code, password, loading } = this.state;
		return <div className="login_page">
			<Spin spinning={loading}>

				<div className="top_part">
					<div className="title">价值圈</div>
					<div className="desc">精准链接，资源聚合</div>
				</div>

				<div className="mid_part">
					<div className="login_methods">
						<div className={`vcode_login ${login_method == 'vcode' && 'active'}`} onClick={this.loginMethodClick.bind(this, 'vcode')}>验证码登录</div>
						<div className={`pwdcode_login ${login_method == 'password' && 'active'}`} onClick={this.loginMethodClick.bind(this, 'password')}>密码登录</div>
					</div>

					<div className="login_input_box">
						<Col className="input_col">
							<Input value={username} onInput={this.inputChange.bind(this, 'username')} maxLength={11} className="input_item" placeholder='请输入手机号' />
						</Col>



						{login_method == 'vcode' && <Col className="input_col v_code_col">
							<Input value={v_code} onInput={this.inputChange.bind(this, 'v_code')} maxLength={6} className="input_item" placeholder='请输入验证码' />
							<div className="get_vcode_box">
								{isCountdown ?
									<Countdown onFinish={() => this.setState({ isCountdown: false })} valueStyle={{ fontSize: '.28rem', marginRight: ".3rem", whiteSpace: "nowrap" }} format="s 秒" value={Date.now() + 60 * 1000} /> :
									<Button disabled={username.length < 11} type="link" className="get_vcode" onClick={this.getVcode.bind(this)}>获取验证码</Button>}
							</div>
						</Col>}

						{login_method == 'password' && <Col className="input_col">
							<Input inputType="password" value={password} onInput={this.inputChange.bind(this, 'password')} maxLength={30} className="input_item" placeholder='请输入密码' />
						</Col>}



						<div className="more_login_action">
							{login_method == 'vcode' && <div />}
							<div className="register_btn"> <Button type="link" onClick={() => this.pushPage(`/register?pageType=register`)}>立即注册</Button></div>
							{login_method == 'password' && <div className="forget_password"><Button onClick={() => this.pushPage(`/register?pageType=reset_password`)} type="link">忘记密码</Button></div>}
						</div>
					</div>
				</div>

				<div className="bottom_part">
					<Button disabled={(username.length < 11 || login_method == 'vcode' ? v_code.length < 6 : !password)} className="login_btn" type="primary" onClick={this.loginClick.bind(this)}>登录</Button>
				</div>
			</Spin>

		</div>
	}
}

export default Login;

