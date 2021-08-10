
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';
import * as device from '../models/device';
import {alert} from 'webpkit/lib/dialog';
import models, {NFTPlus} from '../models';
import {renderNft} from '../util/media';
import nft_proxy from '../chain/nft_proxy';
import * as key from '../key';
import somes from 'somes';
import {contracts} from '../../config';
import Loading from 'webpkit/lib/loading';

type Device = device.Device;

export default class extends NavPage<Device> {

	title = '设备NFT';

	_Unbind = async ()=>{
		await device.unbind(this.params.address);
		alert('解绑设备成功', ()=>this.popPage());
	};

	_Set = async ()=>{
		this.pushPage({ url: '/device_set', params: this.params });
	};

	// _Withdraw

	_Withdraw = async (nft: NFTPlus)=>{
		var to = key.address();
		var from = nft.delegate;
		somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持非代理取出
		somes.assert(nft.owner == contracts.ERC721Proxy, '#device_nft#_Withdraw: BAD_NFT_PROXY');

		var l = await Loading.show('正在取出到钱包');
		try {
			await nft_proxy.New(nft.owner).withdrawFrom(from, to, nft.token, BigInt(nft.tokenId));
			alert('取出到钱包成功,数据显示可能有所延时,请稍后刷新数据显示');
			this.popPage();
		} catch(err) {
			console.error(err);
			alert('取出到钱包失败');
		} finally {
			l.close();
		}
	};

	async triggerLoad() {
		var owner = this.params.address;
		this.setState({ nft: await models.nft.methods.getNftByOwner({ owner }) });
	}

	state = { nft: [] as NFTPlus[] };

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

					{this.state.nft.map((e,j)=>
						<div className="item" key={j}>
							<div className="img">{renderNft(e)}</div>
							<div className="txt1">Address:</div>
							<div className="txt2">{e.token}</div>
							<div className="txt1">Hash:</div>
							<div className="txt2">{e.tokenId}</div>
							<div className="btn_p"><div onClick={()=>this._Withdraw(e)}>取出到钱包</div></div>
						</div>
					)}

				</div>
			</div>
		);
	}

}