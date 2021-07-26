
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/nft_add.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="nft_add">
				<Header title="添加NFT" page={this} />
				<div className="inputs">
					<div className="i1">
						<div className="txt1">协约地址：</div>
						<input className="input" placeholder="输入地址" />
						<div className="btn"></div>
					</div>
					<div className="i1">
						<div className="txt1">NFT编号：</div>
						<input className="input" placeholder="输入编号" />
						<div className="btn"></div>
					</div>
				</div>
			</div>
		);
	}

}