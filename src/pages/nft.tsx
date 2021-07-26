
import { React, NavPage } from 'webpkit/mobile';
import Header from '../util/header';
import '../css/index.scss';

export default class extends NavPage {

	render() {
		return (
			<div className="index">
				<Header title="NFT列表" page={this} noBack={true} />
				<div className="list">
					<div className="a">添加NFT</div>
					<div className="b">
						<div className="more">More...</div>
						<div className="txt1">Address:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
						<div className="txt1">Hash:</div>
						<div className="txt2">asasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajkasasdsajdaskjdhnajk</div>
					</div>
					<div className="b">
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