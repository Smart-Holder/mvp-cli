import NavPage from '../../../nav';
import { React } from 'webpkit/mobile';
import "./index.scss";
class Login extends NavPage {
	render() {
		return <div className="login_page">
			<div className="top_part">
				<div className="title">价值圈</div>
				<div className="desc">精准链接，资源聚合</div>
			</div>
		</div>
	}
}

export default Login;

