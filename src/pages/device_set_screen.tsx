
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/nft_add.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="index index2">
				<Header title="设置轮播" page={this} />
			</div>
		);
	}

}