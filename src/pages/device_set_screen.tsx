
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set.scss';
import * as device from '../models/device';

export default class extends NavPage<device.Device> {

	title = '选择轮播项目';

	state = { save: device.get_screen_save(this.params.address) };

	_SelectImg = ()=>{// 'single' | 'multi' | 'video'
		this.pushPage({url:'/device_set_screen_img?type=single', params: this.params});
	};

	_SelectVideo = ()=>{
		this.pushPage({url:'/device_set_screen_img?type=video', params: this.params});
	};

	_SelectImgs = ()=>{
		this.pushPage({url:'/device_set_screen_img?type=multi', params: this.params});
	};

	get_cls(type: string) {
		return `item ${type == this.state.save.type ? 'on': ''}`;
	}

	render() {
		return (
			<div className="device_set">
				<Header title="选择轮播项目" page={this} />
				<div className="items">
					<div className={this.get_cls('single')} onClick={this._SelectImg}>
						<div className="checkbox"></div>
						<div className="txt1">选择单张图片</div>
						<div className="arrow"></div>
					</div>
					<div className={this.get_cls('multi')} onClick={this._SelectImgs}>
						<div className="checkbox"></div>
						<div className="txt1">选择多张轮播图片</div>
						<div className="arrow"></div>
					</div>
					<div className={this.get_cls('video')} onClick={this._SelectVideo}>
						<div className="checkbox"></div>
						<div className="txt1">选择一个视频</div>
						<div className="arrow"></div>
					</div>
				</div>
			</div>
		);
	}

}