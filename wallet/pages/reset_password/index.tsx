import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import { Col, Statistic } from 'antd';
import Input from '../../../src/components/input';
import Button from '../../../src/components/button';
import { changePwd, login, logout, sendPhoneVerify } from '../../user';
import { alert } from 'webpkit/lib/dialog';
import { verificationPhone } from '../../util/tools';
import Header from '../../../src/util/header';

const { Countdown } = Statistic;

import "./index.scss";

export default class ResetPassword extends NavPage {


	state = {
		isCountdown: false,
		username: '',
		v_code: '',
		password: '',
		confirm_password: ''
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

	// 登录事件
	async login() {
		let { username, v_code, password, confirm_password } = this.state;
		if (!verificationPhone(username)) return alert('请输入正确格式的手机号!');
		// let fromVal = await this.formRef.current?.validateFields();
		if (confirm_password !== password) return alert("两次密码输入不一致!");

		try {
			await login(username, { pwd: password, verify: v_code });
			await changePwd(username, password);
			alert('密码修改成功!', () => logout());

		} catch (error: any) {
			if (error.errno == 100319) alert("短信验证码无效!");
			alert(error.message);
		}
	}


	render() {

		let { isCountdown, username, v_code, password, confirm_password } = this.state;

		return <div className="reset_password_page">
			<Header page={this} title="修改登录密码" />

			<div className="mid_part">
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
				</div>
			</div>
			<div className="bottom_part">
				<Button disabled={(username.length < 11 || !password || !confirm_password || password.length < 8 || confirm_password.length < 8)} className="login_btn" type="primary" onClick={this.login.bind(this)}>确认</Button>
			</div>
		</div>
	}
}