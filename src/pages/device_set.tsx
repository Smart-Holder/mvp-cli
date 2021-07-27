
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/device_set.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="device_set">
				<Header title="设置" page={this} />
				<div className="items">
					<div className="item">
						{/* <div className="checkbox"></div> */}
						<div className="txt1">轮播图片选择</div>
						<div className="arrow"></div>
					</div>
					<div className="item">
						{/* <div className="checkbox"></div> */}
						<div className="txt1">轮播时间间隔</div>
						<div className="arrow"></div>
					</div>
				</div>
			</div>
		);
	}

}