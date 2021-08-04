
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set.scss';

export default class extends NavPage {

	title = '选择轮播时间';

	render() {
		return (
			<div className="device_set">
				<Header title="选择轮播时间" page={this} />
				<div className="items">
					<div className="item">
						<div className="checkbox"></div>
						<div className="txt1">5秒</div>
					</div>
					<div className="item on">
						<div className="checkbox"></div>
						<div className="txt1">10秒</div>
					</div>
					<div className="item">
						<div className="checkbox"></div>
						<div className="txt1">15秒</div>
					</div>
					<div className="item">
						<div className="checkbox"></div>
						<div className="txt1">20秒</div>
					</div>
				</div>
			</div>
		);
	}

}