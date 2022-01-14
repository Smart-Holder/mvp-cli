import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import { Col, Statistic } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Input from '../../../src/components/input';
import Button from '../../../src/components/button';
import { alert } from 'webpkit/lib/dialog';

import "./index.scss";
import { verificationPhone } from '../../util/tools';
import { changePwd, login, register, sendPhoneVerify } from '../../user';

type IMethodType = 'vcode' | 'password'
const { Countdown } = Statistic;

class Login extends NavPage<{ pageType?: 'register' | 'reset_password' }> {

	state = {
		isCountdown: false,
		username: '',
		v_code: '',
		password: '',
		confirm_password: ''
	}

	formRef = React.createRef<FormInstance>();

	loginMethodClick(login_method: IMethodType) {
		this.setState({ login_method });
	}

	// 登录事件
	async login() {
		let { username, v_code, password, confirm_password } = this.state;
		let { pageType } = this.params;
		if (!verificationPhone(username)) return alert('请输入正确格式的手机号!');
		// let fromVal = await this.formRef.current?.validateFields();
		if (confirm_password !== password) return alert("两次密码输入不一致!");
		let body = {
			username,
			v_code,
			password,
			confirm_password
		};


		// let privateKey = await genPrivateKeyForPhone(username, password);
		// console.log(privateKey, "privateKey");

		// registerFromPhone

		if (pageType == 'reset_password') {
			try {
				await login(username, { pwd: password, verify: v_code });
				await changePwd(username, password);
				alert('密码修改成功!', () => this.pushPage('/secretkey'));
				
			} catch (error:any) {
				alert(error.message);
			}
		} else {
			try {
				let data = await register(username, password, v_code);
				alert("注册成功!", () => {
					if (this.nav.length > 1) {
						this.popPage();
					} else {
						this.replacePage('/login');
					}
				});
				console.log(body, "body", data, "data");
			} catch (error: any) {
				if (error.errno == 100307) alert("该账号已被注册");
				if (error.errno == 100319) alert("短信验证码无效!");

			}
		}

		

	}

	// 输入框事件
	inputChange(key: string, e: React.ChangeEvent<HTMLInputElement>) {
		// console.log(e.target.value);
		let val = e.target.value;
		this.setState({ [key]: val });
	}

	async getVcode() {
		await sendPhoneVerify(this.state.username);
		this.setState({ isCountdown: true });
	}

	render() {
		let { pageType } = this.props.params;
		let { isCountdown, username, v_code, password, confirm_password } = this.state;
		return <div className="register_page">
			<div className="top_part">
				<div className="title">价值圈</div>
				<div className="desc">精准链接，资源聚合</div>
			</div>

			<div className="mid_part">
				<div className="login_methods">
					<div className={`vcode_login`}>{pageType == 'register' ? '注册' : '找回密码'}</div>
				</div>

				<div className="login_input_box">
					<Col className="input_col">
						<Input value={username} onInput={this.inputChange.bind(this, 'username')} maxLength={11} className="input_item" placeholder='请输入手机号' />
					</Col>

					<Col className="input_col">
						<Input inputType="password" value={password} onInput={this.inputChange.bind(this, 'password')} maxLength={25} className="input_item" placeholder='请输入密码' />
					</Col>

					<Col className="input_col">
						<Input inputType="password" value={confirm_password} onInput={this.inputChange.bind(this, 'confirm_password')} maxLength={25} className="input_item" placeholder='请重复输入密码' />
					</Col>

					<Col className="input_col v_code_col">
						<Input value={v_code} onInput={this.inputChange.bind(this, 'v_code')} maxLength={6} className="input_item" placeholder='请输入验证码' />
						<div className="get_vcode_box">
							{isCountdown ?
								<Countdown onFinish={() => this.setState({ isCountdown: false })} valueStyle={{ fontSize: '.28rem', marginRight: ".3rem", whiteSpace: "nowrap" }} format="s 秒" value={Date.now() + 60 * 1000} /> :
								<Button disabled={username.length < 11} type="link" className="get_vcode" onClick={this.getVcode.bind(this)}>获取验证码</Button>}
						</div>
					</Col>

					<div className="more_login_action">
						<div></div>
						<div className="register_btn">{pageType == 'register' && '已有账号'} <Button type="link" onClick={() => {
							if (this.nav.length > 1) {
								this.popPage();
							} else {
								this.replacePage('/login');
							}
						}}>立即登录</Button></div>
					</div>
				</div>
			</div>

			<div className="bottom_part">
				<Button disabled={(username.length < 11 || v_code.length < 6 || !password || !confirm_password)} className="login_btn" type="primary" onClick={this.login.bind(this)}>{pageType == 'register' ? '立即注册' : '登录'}</Button>
			</div>
		</div>
	}
}

export default Login;

