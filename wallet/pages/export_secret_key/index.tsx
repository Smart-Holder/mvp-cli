import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import './index.scss';
import * as QRCode from "qrcode.react";
import { copyText } from '../../../src/util/tools';
import Button from '../../../src/components/button';


export default class ExportSecretKey extends NavPage<{ secret_key: string }> {

	render() {
		let { secret_key } = this.params;
		return <div className="export_secret_key_page">
			<Header page={this} title="私钥导出" />

			<div className="top_box">
				<div className="top_tips">
					私钥未加密，请谨慎导出，做好安全备份，做备份时请确保周边没有可疑人员
				</div>
			</div>
			<div className="warpper">

				<div className="mid_box">
					<div className="value_box">
						<QRCode className='qrcode' value={secret_key} />
					</div>
				</div>
				<div className="bottom_box">
					<div className="label_box">
						明文私钥
					</div>

					<div className="value_box" >{secret_key}</div>
				</div>

			</div>
			<div style={{ textAlign: 'center', paddingTop: '.4rem' }}>
				<Button type='primary' size='large' style={{ width: '40%' }} onClick={() => copyText(secret_key)}>复制私钥</Button>
			</div>
		</div>
	}
};
