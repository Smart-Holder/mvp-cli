
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/index.scss';

export default class extends NavPage {

	title = 'NFT列表';

	_NftAdd = ()=>{
		this.pushPage('/nft_add');
	}

	_NftDetails = ()=>{
		this.pushPage('/nft_details');
	}

	render() {
		return (
			<div className="index">
				<Header title="NFT列表" page={this} />
				<div className="list">
					<div className="a" onClick={this._NftAdd}>添加NFT</div>
					<div className="b" onClick={this._NftDetails}>
						<div className="more">More...</div>
						<div className="txt1">Address:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
						<div className="txt1">Hash:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
					</div>
					<div className="b" onClick={this._NftDetails}>
						<div className="more">More...</div>
						<div className="txt1">Address:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
						<div className="txt1">Hash:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
					</div>
				</div>
			</div>
		);
	}

}