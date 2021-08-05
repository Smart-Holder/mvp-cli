
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/nft_details.scss';
import models, { NftPlus } from '../models';
// import chain from '../chain';
import {alert} from 'webpkit/lib/dialog';

export default class extends NavPage<{id:number}> {

	title = 'NFT详情';

	state = { nft: null as NftPlus | null };

	async triggerLoad() {
		this.setState({ nft: await models.nft.methods.getNftById({ id: this.params.id }) });
	}

	async triggerShow(data: Dict) {
		super.triggerShow(data);
		var address = data.address as string;
		if (address) { // 存入到设备
			// TODO ...
			// send tx
			alert('存入到设备...');
		}
	}

	_Handle = ()=>{
		this.pushPage({url: '/device', params: {type: 'back' }})
	}

	render() {
		return (
			<div className="nft_details">
				<Header title="NFT详情" page={this} />
				<div className="item">
					<div className="img"><img src={this.state.nft?.uri} /></div>
					<div className="txt1">作品名称: {this.state.nft?.name}</div>
					<div className="txt1 txt1_1">作者: {this.state.nft?.author} </div>
					<div className="txt2">合约地址:</div>
					<div className="txt3">{this.state.nft?.token}</div>
					<div className="txt2">作品序号:</div>
					<div className="txt3 txt3_1">#{this.state.nft?.tokenId}</div>
					<div className="btn_p"><div onClick={this._Handle}>存入到设备</div></div>
				</div>
			</div>
		);
	}

}