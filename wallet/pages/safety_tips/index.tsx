import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import Button from '../../../src/components/button';

import './index.scss';


const SafetyTipsConfig = [{
	img: require('../../../src/assets/safety_tips_1.png'),
	text: '任何人只要持有你的私钥，助记词，即可将价值转移。'
},
{
	img: require('../../../src/assets/safety_tips_2.png'),
	text: '账号的密码仅用于私钥的加密和解密，密码只存储在手机上。'
},
{
	img: require('../../../src/assets/safety_tips_3.png'),
	text: '请勿对私钥,助记词,keystore做截图备份，避免被恶意软件截取。'
},
{
	img: require('../../../src/assets/safety_tips_4.png'),
	text: '请正确抄写并保存在安全的地方，勿进行网络传输或存储。'
}
]

export default class extends NavPage<{ secret_key?: string, pushUrl?: string }> {

	onOk() {
		let { pushUrl, secret_key } = this.params;
		if (pushUrl) {
			this.replacePage(pushUrl ? `/${pushUrl}?secret_key=${secret_key}` : `/home`);
		} else {
			this.pushPage(`/home`);
		}
	}

	render() {
		return <div className='safety_tips_page safety_tips'>
			<Header page={this} title='安全提示' />
			<div className="top_tips">
				中心密码、助记词一旦泄漏，价值及可被他人掌握
			</div>

			<div className="safety_tips_content">

				{SafetyTipsConfig.map(item => {
					return <div className="safety_tips_item">
						<img src={item.img} alt="" />
						<div className="tips_content">{item.text}</div>
					</div>
				})}

			</div>

			<div className="import_btn">
				<Button type="primary" className="width_btn" onClick={this.onOk.bind(this)}>我知道了</Button>
			</div>
		</div>
	}
}

// safety_tips