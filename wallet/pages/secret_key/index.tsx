import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';
import "./index.scss";
class SecretKeyPage extends NavPage {
	render() {
		return <div className="secret_key_page">
			<Header title="密钥" page={this} />

			<img className="secret_key_bg" src={require('../../../src/assets/secret_key_bg.png')} alt="" />

			<div className="select_box">
				<div className="import_secret_key_item" onClick={() => this.pushPage('/import_secret_key')}>
					<div className="left_box">
						<div className="icon"><IconFont type='icon-daoruguanlimiyue' /> </div>
						<div className="content">导入管理密钥</div>
					</div>
					<div className="action_icon"><IconFont type='icon-bianzu' /></div>
				</div>

				<div className="import_secret_key_item" onClick={() => this.pushPage('/create_account')} style={{ marginTop: '.3rem' }}>
					<div className="left_box">
						<div className="icon"><IconFont type='icon-chuangjianguanlimiyue' /> </div>
						<div className="content">创建管理密钥</div>
					</div>
					<div className="action_icon"><IconFont type='icon-bianzu' /> </div>
				</div>
			</div>
		</div>
	}
}

export default SecretKeyPage;