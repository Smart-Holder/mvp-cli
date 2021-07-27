
import { React, NavPage } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';

export default class extends ViewController<{page: NavPage; }> {

	render() {
		return (
			<div className="_tools">
				<div className="btn on">
					<div className="icon a"></div>
					<div className="txt">NFT</div>
				</div>
				<div className="btn">
					<div className="icon b"></div>
					<div className="txt">设备</div>
				</div>
			</div>
		);
	}
}
