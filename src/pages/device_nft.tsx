
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';
import * as device from '../models/device';
import { alert } from 'webpkit/lib/dialog';
import models, { NFT } from '../models';
import { renderNft } from '../util/media';
import nft_proxy, {proxyAddress} from '../chain/nftproxy';
import somes from 'somes';
import { contracts, env } from '../../config';
import Loading from 'webpkit/lib/loading';
import chain from '../chain';
import artifacts from '../chain/artifacts';

type Device = device.Device;

export default class extends NavPage<Device> {

	title = '设备NFT';

	_Unbind = async () => {
		await device.unbind(this.params.address);
		alert('解绑设备成功', () => this.popPage());
	};

	_Set = async () => {
		this.pushPage({ url: '/device_set', params: this.params });
	};

	// _Withdraw

	_Withdraw = async (nft: NFT) => {
		var to = await chain.defaultAccount();
		var from = nft.ownerBase || '';
		somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持代理取出
		// somes.assert(nft.owner == contracts.ERC721Proxy ||
		// 	nft.owner == contracts.ERC1155Proxy, '#device_nft#_Withdraw: BAD_NFT_PROXY');
		proxyAddress(nft.type, nft.chain, '#device_nft#_Withdraw: BAD_NFT_PROXY');

		var l = await Loading.show('正在取出到密钥');
		try {
			var proxy = nft_proxy.New(nft.owner as string, nft.chain);
			// var val = await proxy.balanceOf(nft.token, BigInt(nft.tokenId), from);
			// var val1 = await artifacts.erc1155(nft.token).api.balanceOf('0xb02cbeD3aC823085CfB1A667Fb1C73E19E724657', BigInt(nft.tokenId)).call();
			// console.log(val, val1);
			// return;
			await proxy
				.withdrawFrom(from, to, nft.token, BigInt(nft.tokenId), BigInt(nft.count)); // 取出一个
			alert('取出到密钥成功,数据显示可能有所延时,请稍后刷新数据显示');
			this.popPage();
		} catch (err: any) {
			console.error(err);
			alert('取出到密钥失败');
			if (env == 'dev') {
				alert(err.message);
			}
		} finally {
			l.close();
		}
	};

	async triggerLoad() {
		var owner = this.params.address;
		this.setState({ nft: await models.nft.methods.getNFTByOwner({ owner }) });
	}

	state = { nft: [] as NFT[] };

	render() {
		return (
			<div className="device_nft">
				<Header title="设备NFT" page={this} />
				<div className="list">
					<div className="list_header">
						<div className="txt1">SN: {this.params.sn}</div>
						<div className="txt1 txt1_1">Address：{this.params.address}</div>
						<div className="btn_p">
							<div className="" onClick={this._Unbind}>解绑设备</div>
							<div className="set" onClick={this._Set}>设置</div>
						</div>
					</div>

					{this.state.nft.map((e, j) =>
						<div className="item" key={j}>
							<div className="img">{renderNft(e)}</div>
							<div className="txt1">Address:</div>
							<div className="txt2">{e.token}</div>
							<div className="txt1">Hash:</div>
							<div className="txt2">{e.tokenId}</div>
							<div className="btn_p"><div onClick={() => this._Withdraw(e)}>取出到钱包</div></div>
						</div>
					)}

				</div>
			</div>
		);
	}

}