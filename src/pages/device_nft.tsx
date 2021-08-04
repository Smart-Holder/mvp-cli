
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';

export default class extends NavPage {

	title = '设备NFT';

	_Unbind = ()=>{
		//
	};

	_Set = ()=>{
		this.pushPage({ url: '/device_set', params: {} });
	};

	_Withdraw = ()=>{
		//
	};

	render() {
		return (
			<div className="device_nft">
				<Header title="设备NFT" page={this} />
				<div className="list">
					<div className="list_header">
						<div className="txt1">SN: 012018116A93CC7946</div>
						<div className="txt1 txt1_1">Address：0x3B4B1e…D9D184C44E0b</div>
						<div className="btn_p">
							<div className="" onClick={this._Unbind}>解绑设备</div>
							<div className="set" onClick={this._Set}>设置</div>
						</div>
					</div>
					<div className="item">
						<div className="img"></div>
						<div className="txt1">Address:</div>
						<div className="txt2">0x31a5bf4d05231273f03c4922a56Bd0EA9d74e</div>
						<div className="txt1">Hash:</div>
						<div className="txt2">0x31a5bf4d05231273f03c4922a56Bd0EA9d74e</div>
						<div className="btn_p"><div onClick={this._Withdraw}>取出到钱包</div></div>
					</div>
					<div className="item">
						<div className="img"></div>
						<div className="txt1">Address:</div>
						<div className="txt2">0x31a5bf4d05231273f03c4922a56Bd0EA9d74e</div>
						<div className="txt1">Hash:</div>
						<div className="txt2">0x31a5bf4d05231273f03c4922a56Bd0EA9d74e</div>
						<div className="btn_p"><div>取出到钱包</div></div>
					</div>
				</div>
			</div>
		);
	}

}