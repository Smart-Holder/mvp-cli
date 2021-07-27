
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/device_set.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="device_set">
				<Header title="选择轮播项目" page={this} />
				<div className="items">
					<div className="item">
						<div className="checkbox"></div>
						<div className="txt1">选择单张图片</div>
						<div className="arrow"></div>
					</div>
					<div className="item on">
						<div className="checkbox"></div>
						<div className="txt1">选择一个视频</div>
						<div className="arrow"></div>
					</div>
					<div className="item">
						<div className="checkbox"></div>
						<div className="txt1">选择多张轮播图片</div>
						<div className="arrow"></div>
					</div>
				</div>
			</div>
		);
	}

}