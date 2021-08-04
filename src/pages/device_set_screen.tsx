
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set.scss';

export default class extends NavPage {

	title = '选择轮播项目';

	_SelectImg = ()=>{
		this.pushPage('/device_set_screen_img?type=0');
	};

	_SelectVideo = ()=>{
		this.pushPage('/device_set_screen_img?type=1');
	};

	_SelectImgs = ()=>{
		this.pushPage('/device_set_screen_img?type=2');
	};

	render() {
		return (
			<div className="device_set">
				<Header title="选择轮播项目" page={this} />
				<div className="items">
					<div className="item" onClick={this._SelectImg}>
						<div className="checkbox"></div>
						<div className="txt1">选择单张图片</div>
						<div className="arrow"></div>
					</div>
					<div className="item on" onClick={this._SelectVideo}>
						<div className="checkbox"></div>
						<div className="txt1">选择一个视频</div>
						<div className="arrow"></div>
					</div>
					<div className="item" onClick={this._SelectImgs}>
						<div className="checkbox"></div>
						<div className="txt1">选择多张轮播图片</div>
						<div className="arrow"></div>
					</div>
				</div>
			</div>
		);
	}

}