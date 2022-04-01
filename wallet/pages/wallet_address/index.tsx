import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import * as QRCode from "qrcode.react";

import './index.scss';
import { copyText } from '../../../src/util/tools';
export default class WalletAddress extends NavPage<{address:string}> {
	render() {
		return <div className="qr_code_page">

			<Header page={this} title='密钥地址' />

			<div className="qr_code_box">

				<div className="qr_code_part">
					<div className="address_title">密钥二维码</div>
				<QRCode value={this.params.address} />

					<div className="address_box" onClick={() => copyText(this.params.address)}>
						<div className="address_tip" >密钥地址</div>
					{this.params.address}
				</div>
				</div>
			</div>
		</div>
	}
}