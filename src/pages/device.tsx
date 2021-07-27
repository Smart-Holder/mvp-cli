
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import Tools from '../util/tools';
import '../css/index.scss';
import '../css/device.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="index device">
				<Header title="设备列表" page={this} />
				<div className="list">
					<div className="a">绑定新设备</div>
					<div className="b">
						<div className="more">More...</div>
						<div className="txt1">SN: 012018116A93CC7946</div>
						<div className="txt2">Address：0x3B4aD9D18C44E0b</div>
						<div className="txt3">04<br/><span>NFT</span></div>
					</div>
					<div className="b">
						<div className="more">More...</div>
						<div className="txt1">SN: 012018116A93CC7946</div>
						<div className="txt2">Address：0x3B4aD9D18C44E0b</div>
						<div className="txt3">04<br/><span>NFT</span></div>
					</div>
				</div>
				<Tools page={this} />
			</div>
		);
	}

}