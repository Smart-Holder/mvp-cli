
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/nft_details.scss';
import models, { NFT, NFTMode } from '../models';
import erc721 from '../chain/erc721';
import {erc721_proxy} from '../chain/nftproxy';
import chain, {encodeParameters} from '../chain';
import {alert} from 'webpkit/lib/dialog';
import Loading from 'webpkit/lib/loading';
import {contracts} from '../../config';
import somes from 'somes';

// import nft_proxy from '../chain/nft_proxy';

export default class extends NavPage<{id:number}> {

	title = 'NFT详情';

	state = { NFTs: [] as NFT[], from: '' };

	async triggerLoad() {
		var from = await chain.getDefaultAccount();
		this.setState({
			from,
			NFTs: await models.nft.methods.getNFTById({ id: this.params.id, owner: from }),
		});
	}

	private async _transferToDevice(device_address: string, nft: NFT) {
		var from = this.state.from;
		if (nft.mode == NFTMode.ERC721) { // erc721
			var buf = encodeParameters(['address'], [device_address]);
			// var data = buffer.from(data_str.slice(2), 'hex');
			if (nft.ownerBase) {
				await erc721_proxy.transfer(device_address, nft.token, BigInt(nft.tokenId), BigInt(1));
			} else {
				await erc721.safeTransferFrom( // 转移给代理协约
					nft.token, from, contracts.ERC721Proxy, BigInt(nft.tokenId), buf);
			}
			alert('存入到设备成功,数据显示可能有所延时,请稍后刷新数据显示');
			this.popPage();
		} else {
			alert('暂时不支持这种类型的NFT存入到设备');
		}
	}

	async triggerShow(data: Dict) {
		super.triggerShow(data);
		var device_address = data.address as string;
		if (device_address) { // 存入到设备
			var [nft] = this.state.NFTs;
			var from = this.state.from;
			somes.assert(nft.owner == from || nft.ownerBase == from, '#nft_details#triggerShow: NOT_OWN_TOKEN');
			var l = await Loading.show('正在存入到设备');
			try {
				await this._transferToDevice(device_address, nft);
			} catch(err) {
				console.error(err);
				alert('存入到设备失败');
			} finally {
				l.close();
			}
		}
	}

	_Handle = async ()=>{
		this.pushPage({url: '/device', params: {type: 'back' }})
		// var [nft] = this.state.NFTs;
		// var from = this.state.from;
		// await nft_proxy.New(nft.owner as string)
		// 	.test_withdrawFrom(from, from, nft.token, BigInt(nft.tokenId), BigInt(1));
	}

	render() {
		var [nft] = this.state.NFTs;
		return (
			<div className="nft_details">
				<Header title="NFT详情" page={this} />
				<div className="item">
					<div className="img"><img src={nft?.media||nft?.mediaOrigin} /></div>
					<div className="txt1">作品名称: {nft?.name || '无'}</div>
					<div className="txt1 txt1_1">作者: {nft?.author || '无'} </div>
					<div className="txt2">合约地址:</div>
					<div className="txt3">{nft?.token}</div>
					<div className="txt2">作品序号:</div>
					<div className="txt3 txt3_1">{nft?.tokenId}</div>
					<div className="btn_p"><div onClick={this._Handle}>存入到设备</div></div>
				</div>
			</div>
		);
	}

}