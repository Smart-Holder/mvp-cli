import NavPage from '../../../src/nav';
import { React, ReactDom } from 'webpkit/mobile';
import { Col, Statistic, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import Input from '../../../src/components/input';
import Button from '../../../src/components/button';
import { login, register, sendPhoneVerify } from '../../user';
import { alert ,show} from 'webpkit/lib/dialog';
import { verificationPhone } from '../../util/tools';
import storage from 'somes/storage'
import native from '../../util/prefix_native';
import { MyRoot } from '../..';
import _404 from '../../../src/pages/404';
import routes from '../../router';
import "./index.scss";
import {  Checkbox } from 'antd-mobile';
import { PrivacyArgeeBox, UserArgeeBox } from '../../../src/components/argee_box';
type IMethodType = 'vcode' | 'password'
const { Countdown } = Statistic;



class Login extends NavPage {

	state = {
		login_method: 'vcode' as IMethodType,
		isCountdown: false,
		username: '',
		v_code: '',
		password: '',
		loading: false,
		dateNow: Date.now(),
		checked:false
	}

	formRef = React.createRef<FormInstance>();

	async triggerLoad() {
		ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));

		var state = await storage.get('loginState');
		let keyname = await native.getKeysName();
		state && this.pushPage(keyname.length ? '/home' : '/secret_key');
		let isShowAgreeModal = localStorage.getItem('isShowAgreeModal');

		isShowAgreeModal !== "1" && this.showAgreeModal(true);
	}

	async loginMethodClick(login_method: IMethodType) {
		this.setState({ login_method });
	}

	// 登录事件
	async loginClick() {
		let isShowAgreeModal = localStorage.getItem('isShowAgreeModal');
		if (isShowAgreeModal === '1') {
			this.loginMethods();
		} else {
			this.showAgreeModal()
		}
	}

	async showAgreeModal(isFirst?: boolean) {
		let l = await show({
			title: '服务协议',
			text: <div style={{ textAlign: 'left' }}>&nbsp;&nbsp;&nbsp;&nbsp; 请您务必认真阅读，充分理解
				<span className="argee_text" onClick={() => { l.close(); this.pushPage('/agreement'); }} > “Hashii隐私协议”</span>与
				<span className="argee_text" onClick={() => { l.close(); this.pushPage('/agreement_user'); }} > “Hashii服务协议”</span>
				各条款，包括但不限于：为了向您提供数据、分享等服务所需要获取的权限信息，<br />
				<div style={{ marginTop: '.2rem' }}>	&nbsp;&nbsp;&nbsp;&nbsp;您可以阅读
					<span className="argee_text" onClick={() => { l.close(); this.pushPage('/agreement'); }} >《Hashii隐私协议》</span>与
					<span className="argee_text" onClick={() => { l.close(); this.pushPage('/agreement_user'); }} >《Hashii服务协议》</span>
					了解详细信息 ，
					如您同意请点击“同意”开始接受我们的服务.</div>
			</div>,
			buttons: {
				'暂不使用': () => {
					console.log('我取消了');
					console.log(l.close(), 'l');
				},
				'@同意': () => {
					console.log('我同意了');
					localStorage.setItem('isShowAgreeModal', '1');
					this.setState({ isShowAgreeModal: 1 });
					!isFirst && this.loginMethods();
				},
			},
		});
	}

	async loginMethods() {
		this.setState({ loading: true });
		let { username, password, login_method, v_code, checked } = this.state;
		let isRegister = false;
		try {
			await register(username, password, '000000');
		} catch (error: any) {
			if (error.errno == 100307) isRegister = true;
		}
		if (!isRegister && login_method == 'password') {
			this.setState({ loading: false });
			alert('该账号未注册，请注册后登录');
			return;
		};

		try {
			if (login_method == 'vcode') {
				await login(username, { pwd: password, verify: v_code });
			} else {
				await login(username, { pwd: password });
			}
			let keyName = await native.getKeysName(username);
			console.log(keyName, 'login keyname');
			if (keyName.length) return this.replacePage('/home');
			this.replacePage('/secretkey');

		} catch (error: any) {
			alert(error.message);
		}
		this.setState({ loading: false });
	}

	// 输入框事件
	inputChange(key: string, e: React.ChangeEvent<HTMLInputElement>) {
		let val = e.target.value;
		this.setState({ [key]: val });
	}

	// 获取验证码
	async getVcode() {
		let { username } = this.state;
		if (!verificationPhone(username)) return alert('请输入有效的手机号码');
		try {
			await sendPhoneVerify(username);
			this.setState({ isCountdown: true, dateNow: Date.now() });
		} catch (error: any) {
			alert(error.message);
		}
	}

	checkAgree() {
		let isShowAgreeModal = localStorage.getItem('isShowAgreeModal');
		// isShowAgreeModal !== "1" && this.showAgreeModal(true);
		return isShowAgreeModal === "1";
	}

	render() {
		let { login_method, isCountdown, username, v_code, password, loading, checked } = this.state;
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

					<div className="login_input_box" onClick={() => {
						!this.checkAgree() && this.showAgreeModal(true);
					}} >
						<Col className="input_col">
							<Input disabled={!this.checkAgree()} value={username} onInput={this.inputChange.bind(this, 'username')} maxLength={11} className="input_item" placeholder='请输入手机号' />
						</Col>



						{login_method == 'vcode' && <Col className="input_col v_code_col">
							<Input disabled={!this.checkAgree()} value={v_code} onInput={this.inputChange.bind(this, 'v_code')} maxLength={6} className="input_item" placeholder='请输入验证码' />
							<div className="get_vcode_box">
								{isCountdown ?
									<Countdown onFinish={() => this.setState({ isCountdown: false })} valueStyle={{ fontSize: '.28rem', marginRight: ".3rem", whiteSpace: "nowrap" }} format="s 秒" value={this.state.dateNow + 60 * 1000} /> :
									<Button disabled={username.length < 11} type="link" className="get_vcode" onClick={this.getVcode.bind(this)}>获取验证码</Button>}
							</div>
						</Col>}

						{login_method == 'password' && <Col className="input_col">
							<Input disabled={!this.checkAgree()} inputType="password" value={password} onInput={this.inputChange.bind(this, 'password')} maxLength={30} className="input_item" placeholder='请输入密码' />
						</Col>}



						<div className="more_login_action">
							{login_method == 'vcode' && <div />}
							<div className="register_btn"> <Button type="link" onClick={() => {
								let isAgee = this.checkAgree();
								if (!isAgee) return false;
								this.pushPage(`/register?pageType=register`);
							}}>立即注册</Button></div>
							{login_method == 'password' && <div className="forget_password"><Button onClick={() => {
								let isAgee = this.checkAgree();
								if (!isAgee) return false;
								this.pushPage(`/register?pageType=reset_password`)
							}} type="link">忘记密码</Button></div>}
						</div>
					</div>
				</div>

				<div className="bottom_part">
					<Button disabled={Boolean((username.length < 11 || login_method == 'vcode' ? v_code.length < 6 : !password) || !checked )} className="login_btn" type="primary" onClick={this.loginClick.bind(this,false)}>登录</Button>
					<div className="login_agreement_box">
						<Checkbox checked={checked} className="login_checkbox" onChange={(e) => this.setState({ checked:e.target.checked})}>
						<span>登录即代表您同意</span> 
						</Checkbox>

						<PrivacyArgeeBox page={this} /> 与
						<UserArgeeBox page={this} />
						{/* {<span className="argee_text" onClick={() => this.pushPage('/agreement')} >“Hashii隐私协议”</span>} */}
					</div>
				</div>
			</Spin>



		</div>
	}
}

export default Login;

