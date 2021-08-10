
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/nft_details.scss';
import models, { NFTPlus, NFTMode } from '../models';
import erc721 from '../chain/erc721';
import {encodeParameters} from '../chain';
import {alert} from 'webpkit/lib/dialog';
import * as key from '../key';
import Loading from 'webpkit/lib/loading';
import {contracts} from '../../config';
import somes from 'somes';

export default class extends NavPage<{id:number}> {

	title = 'NFT详情';

	state = { nft: null as NFTPlus | null };

	async triggerLoad() {
		this.setState({ nft: await models.nft.methods.getNftById({ id: this.params.id }) });
	}

	private async _transferToDevice(device_address: string, nft: NFTPlus) {
		var from = key.address();
		if (nft.mode == NFTMode.ERC721) { // erc721
			var d_hex = encodeParameters(['address'], [device_address]);
			// var data = buffer.from(data_str.slice(2), 'hex');
			await erc721.safeTransferFrom( // 转移给代理协约
				nft.token, from, contracts.ERC721Proxy, BigInt(nft.tokenId), d_hex);
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
			var nft = this.state.nft as NFTPlus;
			var addr = key.address();
			somes.assert(nft.owner == addr || nft.delegate == addr, '#nft_details#triggerShow: NOT_OWN_TOKEN');
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
					<div className="txt3 txt3_1">{this.state.nft?.tokenId}</div>
					<div className="btn_p"><div onClick={this._Handle}>存入到设备</div></div>
				</div>
			</div>
		);
	}

}