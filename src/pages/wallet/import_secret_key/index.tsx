import NavPage from '../../../nav';
import { React } from 'webpkit/mobile';
import Header from '../../../util/header';
import Input from '../../../components/input';
import IconFont from '../../../components/icon_font';
import { Checkbox } from 'antd';
import Button from '../../../components/button';
import "./index.scss";


type IimportMethodType = 'secret_key' | 'mnemonic_words';

class ImportSecretKeyPage extends NavPage {

	state = {
		import_method: 'secret_key' as IimportMethodType,
		secret_key_address: '',
		secret_key_name: '',
		password: '',
		confim_password: '',
	}

	set_import_method(import_method: IimportMethodType) {
		this.setState({ import_method });
	}

	render() {

		let { import_method, secret_key_address, secret_key_name, password, confim_password } = this.state;
		return <div className="import_secretkey_page">
			<Header title="导入方式" page={this} />

			<div className="import_secretkey_page_content">
				<div className="import_method_card">
					<div onClick={this.set_import_method.bind(this, 'secret_key')} className={`import_item ${import_method == 'secret_key' && 'active'}`}> <span>私钥导入</span> </div>
					<div onClick={this.set_import_method.bind(this, 'mnemonic_words')} className={`import_item ${import_method == 'mnemonic_words' && 'active'}`}> <span>助记词导入</span> </div>
				</div>


				<div className="card_box secret_key_address">
					<div className="wallet_input_box">
						<Input placeholder="输入密码或扫描二维码，注意大小写" value={secret_key_address} onChange={(e) => this.setState({ secret_key_address: e.target.value })} />
						<IconFont className="qrcode_icon" type="icon-saoma" />
					</div>
				</div>

				<div className="card_box secret_key_name_box">
					<div className="card_title">管理密钥名称</div>
					<div className="card_body">
						<Input maxLength={25} placeholder="请输入管理密钥名称" value={secret_key_name} onChange={(e) => this.setState({ secret_key_name: e.target.value })} />
					</div>
				</div>

				<div className="card_box secret_key_pwd_box">
					<div className="card_title">解锁密码</div>
					<div className="card_body">
						<Input maxLength={25} inputType="password" className="password_input_item" placeholder="请输入至少8位密码" value={password} onChange={(e) => this.setState({ password: e.target.value })} />
						<div className="line"></div>
						<Input maxLength={25} inputType="password" placeholder="请重复输入密码" value={confim_password} onChange={(e) => this.setState({ confim_password: e.target.value })} />
					</div>
				</div>

				<div className="checkbox_part">
					<Checkbox style={{ marginRight: '.05rem', marginLeft: '.08rem' }} />
					<div className="checkbox_label">
						<span>我已仔细阅读并同意</span>
						<a>《用户协议》</a>
					</div>
				</div>

				<Button className="import_btn" type='primary' >导入账号</Button>
			</div>
		</div>;
	}
}

export default ImportSecretKeyPage;