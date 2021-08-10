
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/index.scss';
import models, { NFTPlus } from '../models';
import chain from '../chain';

export default class extends NavPage {

	title = '我的NFT';

	_NftAdd = ()=>{
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFTPlus) {
		this.pushPage({url:`/nft_details`, params: {id:e.id}});
	}

	state = { nft: [] as NFTPlus[] };

	async triggerLoad() {
		var owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		this.setState({ nft: await models.nft.methods.getNftByOwner({ owner }) });
	}

	render() {
		console.log(this.state.nft);
		return (
			<div className="index">
				<Header title="我的NFT" page={this} />
				<div className="list">
					{/* <div className="a" onClick={this._NftAdd}>添加NFT</div> */}

					{this.state.nft.map((e,j)=>
						<div className="b" onClick={()=>this._NftDetails(e)} key={j}>
							<div className="more">More...</div>
							<div className="txt1">Address:</div>
							<div className="txt2">{e.token}</div>
							<div className="txt1">Hash:</div>
							<div className="txt2">{e.tokenId}</div>
						</div>
					)}
				</div>
			</div>
		);
	}

}