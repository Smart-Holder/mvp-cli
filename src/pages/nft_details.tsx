
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/nft_details.scss';
import models, { NFT, AssetType } from '../models';
import erc721 from '../chain/erc721';
import erc1155 from '../chain/erc1155';
import * as nftproxy from '../chain/nftproxy';
import chain, {encodeParameters} from '../chain';
import {alert} from 'webpkit/lib/dialog';
import Loading from 'webpkit/lib/loading';
import {contracts} from '../../config';
import somes from 'somes';
import {renderNft} from '../util/media';

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
		if (nft.type == AssetType.ERC721) { // erc721
			var buf = encodeParameters(['address[]', 'uint256'], [
				[device_address/*这里可以写一个owners列表,表示这个资产属于这一群人*/], 1/*转移资产时需要几个人签名*/]);
			if (nft.ownerBase) {
				await nftproxy.proxy721.transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(1), BigInt(1));
				//alert('暂时不支持这种类型的NFT存入到设备'); return;
			} else {
				await erc721.safeTransferFrom( // 转移给代理协约
					nft.token, from, contracts.ERC721Proxy, BigInt(nft.tokenId), buf);
			}
			alert('存入到设备成功,数据显示可能有所延时,请稍后刷新数据显示');
			this.popPage();
		} else if (nft.type == AssetType.ERC1155) {
			var buf = encodeParameters(['address[]', 'uint256'], [
				[device_address/*这里可以写一个owners列表,表示这个资产属于这一群人*/], 1/*转移资产时需要几个人签名*/]);
			if (nft.ownerBase) {
				await nftproxy.proxy1155.transfer([device_address], nft.token, BigInt(nft.tokenId), BigInt(nft.count), BigInt(1));
				// alert('暂时不支持这种类型的NFT存入到设备'); return;
			} else {
				await erc1155.safeTransferFrom( // 转移给代理协约
					nft.token, from, contracts.ERC1155Proxy, BigInt(nft.tokenId), BigInt(nft.count), buf);
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
			} catch(err: any) {
				console.error(err);
				alert('存入到设备失败');
			} finally {
				l.close();
			}
		}
	}

	_Handle = async ()=>{
		this.pushPage({url: '/device', params: {type: 'back' }})
		var [nft] = this.state.NFTs;
		var from = this.state.from;
		// await nftproxy.New(nft.owner as string);
		//nftproxy.proxy1155.test_withdraw(from, [from], nft.token, BigInt(nft.tokenId), BigInt(1));
	}

	render() {
		var [nft] = this.state.NFTs;
		return (
			<div className="nft_details">
				<Header title="NFT详情" page={this} />
				<div className="item">
					<div className="img">{renderNft(nft)}</div>
					<div className="txt1">作品名称: {nft?.name || '无'}</div>
					<div className="txt1 txt1_1"> {nft?.info || '无'} </div>
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