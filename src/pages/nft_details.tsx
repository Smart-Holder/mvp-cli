
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/nft_details.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="nft_details">
				<Header title="NFT详情" page={this} />
				<div className="item">
					<div className="img"></div>
					<div className="txt1">作品名称: 早晨的阳光照耀着你的长发</div>
					<div className="txt1 txt1_1">作者: 蔡徐坤 </div>
					<div className="txt2">合约AD:</div>
					<div className="txt3">0x31a5bf4d05231273f03c4922542a56Bd0EA9d74e</div>
					<div className="txt2">作品序号:</div>
					<div className="txt3 txt3_1">#0x31a5bf4d05231273f03c4922542a56</div>
					<div className="btn_p"><div>存入到设备</div></div>
				</div>
			</div>
		);
	}

}