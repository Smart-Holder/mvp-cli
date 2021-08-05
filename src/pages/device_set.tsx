
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set.scss';
import {Device} from '../models/device';

export default class extends NavPage<Device> {

	title = '设置';

	_ImgSelect = ()=>{
		this.pushPage({url: '/device_set_screen', params: this.params});
	};

	_TimeSelect = ()=>{
		this.pushPage({url: '/device_set_screen_time', params: this.params});
	};

	render() {
		return (
			<div className="device_set">
				<Header title="设置" page={this} />
				<div className="items">
					<div className="item" onClick={this._ImgSelect}>
						{/* <div className="checkbox"></div> */}
						<div className="txt1">轮播图片选择</div>
						<div className="arrow"></div>
					</div>
					<div className="item" onClick={this._TimeSelect}>
						{/* <div className="checkbox"></div> */}
						<div className="txt1">轮播时间间隔</div>
						<div className="arrow"></div>
					</div>
				</div>
			</div>
		);
	}

}