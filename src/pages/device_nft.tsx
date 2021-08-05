
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';
import * as device from '../models/device';
import {alert} from 'webpkit/lib/dialog';
import models, {NftPlus} from '../models';
import {renderNft} from '../util/media';
// import chain from '../chain';

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

	_Withdraw = (e: NftPlus)=>{
		// TODO ...
		// send tx
		alert('取出到钱包...');
	};

	async triggerLoad() {
		var owner = this.params.address;
		this.setState({ nft: await models.nft.methods.getNftByOwner({ owner }) });
	}

	state = { nft: [] as NftPlus[] };

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