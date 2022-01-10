import NavPage from '../../../nav';
import { React } from 'webpkit/mobile';
import "./index.scss";

type IMethodType = 'vcode' | 'password'

class Login extends NavPage {

	state = {
		login_method: 'vcode' as IMethodType
	}

	loginMethodClick(login_method: IMethodType) {
		console.log(login_method, "login_method");

		this.setState({ login_method });
	}

	render() {
		let { login_method } = this.state;
		return <div className="login_page">
			<div className="top_part">
				<div className="title">价值圈</div>
				<div className="desc">精准链接，资源聚合</div>
			</div>

			<div className="mid_part">
				<div className="login_methods">
					<div className={`vcode_login ${login_method == 'vcode' && 'active'}`} onClick={this.loginMethodClick.bind(this, 'vcode')}>验证码登录</div>
					<div className={`pwdcode_login ${login_method == 'password' && 'active'}`} onClick={this.loginMethodClick.bind(this, 'password')}>密码登录</div>
				</div>
			</div>
		</div>
	}
}

export default Login;

