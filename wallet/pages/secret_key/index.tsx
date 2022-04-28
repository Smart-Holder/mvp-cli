import NavPage from '../../../src/nav';
import { React, ReactDom } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';
import "./index.scss";
import Button from '../../../src/components/button';
import { logout } from '../../user';
import _404 from '../../../src/pages/404';
import routes from '../../router';
import { MyRoot } from '../..';
import { PrivacyArgeeBox, UserArgeeBox } from '../../../src/components/argee_box';

// import { LeftOutlined} from '@ant-design/icons';


class SecretKeyPage extends NavPage<{ isHomePage?: string }> {
	
	async triggerLoad() {
		ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));
	}

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

			<div className="loginout_btn_box">

				{!this.params.isHomePage && <Button type="link" onClick={logout}>  退出登录 </Button>}
			</div>


			<div  style={{textAlign:'center', width:'100%',position:'absolute',bottom:'.6rem' }}>

			<PrivacyArgeeBox page={this} /> 与
			<UserArgeeBox page={this} />
			</div>
		</div>
	}
}

export default SecretKeyPage;