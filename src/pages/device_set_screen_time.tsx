
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set.scss';
import * as device from '../models/device';

export default class extends NavPage<device.Device> {

	title = '选择轮播时间';

	state = { save: device.get_screen_save(this.params.address) };

	get_cls(time: number) {
		return `item ${time == this.state.save.time ? 'on': ''}`;
	}

	async _Handle(time: number) {
		await device.set_screen_save(this.params.address, {time});
		this.setState({time});
		this.popPage();
	}

	render() {
		return (
			<div className="device_set">
				<Header title="选择轮播时间" page={this} />
				<div className="items">
					<div className={this.get_cls(5)} onClick={()=>this._Handle(5)}>
						<div className="checkbox"></div>
						<div className="txt1">5秒</div>
					</div>
					<div className={this.get_cls(10)} onClick={()=>this._Handle(10)}>
						<div className="checkbox"></div>
						<div className="txt1">10秒</div>
					</div>
					<div className={this.get_cls(15)} onClick={()=>this._Handle(15)}>
						<div className="checkbox"></div>
						<div className="txt1">15秒</div>
					</div>
					<div className={this.get_cls(20)} onClick={()=>this._Handle(20)}>
						<div className="checkbox"></div>
						<div className="txt1">20秒</div>
					</div>
				</div>
			</div>
		);
	}

}