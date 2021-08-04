
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/nft_add.scss';

export default class extends NavPage {

	title = '添加设备';

	render() {
		return (
			<div className="index index2">
				<Header title="添加设备" page={this} />
			</div>
		);
	}

}