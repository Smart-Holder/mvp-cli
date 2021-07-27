
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/device_set_screen_img.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="device_set_screen_img">
				<Header title="选择轮播项目" page={this} />
				<div className="list">
					<div className="item">
						<div className="img"></div>
						<div className="checkbox"></div>
					</div>
					<div className="item">
						<div className="img"></div>
						<div className="checkbox"></div>
					</div>
					<div className="item on">
						<div className="img"></div>
						<div className="checkbox"></div>
					</div>
					<div className="item">
						<div className="img"></div>
						<div className="checkbox"></div>
					</div>
				</div>
			</div>
		);
	}

}