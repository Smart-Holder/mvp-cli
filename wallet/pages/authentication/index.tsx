import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import NavPage from '../../../src/nav';
import { Col, Statistic } from 'antd';
import Button from '../../../src/components/button';
import { bSNGasTap, loginState, sendPhoneVerify } from '../../user';
import { InputItem } from 'webpkit/mobile/antd';
import "./index.scss";
import { isRealName, realNameAuth } from '../../../src/models/user';
import { alert } from 'webpkit/lib/dialog';
const { Countdown } = Statistic;

export default class AuthenticationPage extends NavPage {

	state = {
		verify: '',
		idCard: '',
		mobile: '',
		realName: '',
		isCountdown: false,
		dateNow: Date.now(),
		isReadonly:false
	}

	async triggerLoad() {
		let data  = await isRealName(loginState().name);
		if (data) {
			let { idCard,name: realName,phone: mobile} = data;
			this.setState({ idCard, realName, mobile, isReadonly: true });
		}

	}

	// 输入框事件
	inputChange(key: string, val: string) {
		// console.log(e.target.value);
		// let val = e.target.value;
		this.setState({ [key]: val });
	}

	async getVcode() {
		await sendPhoneVerify(this.state.mobile);
		this.setState({ isCountdown: true, dateNow: Date.now() });
	}

	async getRealNameAuth() {
		try {
			let { verify, idCard, mobile, realName } = this.state;
			await realNameAuth({ verify, idCard, mobile, realName });
			alert('实名认证成功!', () => this.popPage());
		} catch (error: any) {
			if (error.code === 100323) return alert('认证失败!请填写真实信息.');
			alert(error.message);
		}
	}
	
	render() {

		let { verify, idCard, mobile, realName, isCountdown, isReadonly} = this.state;

		return <div className='auth_page'>
			<Header page={this} title="实名认证" />

			<div className="mid_part">
				<div className="login_input_box">
					<div className='login_input_box_title'>基本信息</div>
					<Col className="input_col">
						{/* <Input value={realName} onInput={this.inputChange.bind(this, 'realName')} maxLength={11} className="input_item" placeholder='请输入真实姓名' /> */}
						<InputItem disabled={isReadonly} value={realName} maxLength={20} onChange={this.inputChange.bind(this, 'realName')} placeholder='请输入真实姓名'>姓名</InputItem>
					</Col>

					<Col className="input_col">
						<InputItem disabled={isReadonly} value={idCard} maxLength={18} onChange={this.inputChange.bind(this, 'idCard')} placeholder='请输入身份证号'>身份证号</InputItem>

						{/* <Input value={idCard} onInput={this.inputChange.bind(this, 'idCard')} maxLength={25} className="input_item" placeholder='请输入身份证号' /> */}
					</Col>

					<Col className="input_col" style={{ borderBottom: isReadonly ? 0 :'1px solid #ddd'}}>
						<InputItem disabled={isReadonly} value={mobile} maxLength={11} onChange={this.inputChange.bind(this, 'mobile')} placeholder='请输入手机号'>手机号</InputItem>
						{/* <Input value={mobile} onInput={this.inputChange.bind(this, 'mobile')} maxLength={25} className="input_item" placeholder='请输入手机号' /> */}
					</Col>

					{!isReadonly && <Col className="input_col v_code_col">
						<InputItem value={verify} maxLength={6} onChange={this.inputChange.bind(this, 'verify')} placeholder='请输入验证码' extra={<div className="get_vcode_box">
							{isCountdown ?
								<Countdown onFinish={() => this.setState({ isCountdown: false })} valueStyle={{ fontSize: '.28rem', marginRight: ".3rem", whiteSpace: "nowrap" }} format="s 秒" value={this.state.dateNow + 60 * 1000} /> :
								<Button disabled={mobile.length < 11} type="link" className="get_vcode" onClick={this.getVcode.bind(this)}>获取验证码</Button>}
						</div>}>验证码</InputItem>
					</Col>}
				</div>
			</div>

			{!isReadonly && <div className="bottom_part">
				<Button disabled={(mobile.length < 11 || !realName || !idCard || !verify)} className="login_btn" type="primary" onClick={this.getRealNameAuth.bind(this)}>确认</Button>
			</div>}
				{/* <Button onClick={async() => {
					await bSNGasTap('0xb02cbeD3aC823085CfB1A667Fb1C73E19E724657');
				}}>test</Button> */}
		</div>
}
	
}