import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { DeviceItem } from '../components/deviceItem';
import { Device } from '../models/device';
import models, { NFT } from '../models';
import NftCard from '../components/nft_card';
import { INftItem } from './my';
import '../css/device_info.scss';
import somes from '../../deps/webpkit/deps/somes';
import chain from '../chain';
import { contracts, env } from '../../config';
import nft_proxy from '../chain/nftproxy';
import Loading from 'webpkit/lib/loading';
import { alert } from 'webpkit/lib/dialog';
import { IDisabledType, setNftDisabledTime } from '../util/tools';


export default class extends NavPage<Device> {

	state = {
		nftList: [] as INftItem[]
	}

	async triggerLoad() {
		// let nftList = await models.nft.methods.getNFTByOwner({ owner: this.params.address });
		// this.setState({ nftList });
		this.getNFTList(this.params.address);
	}


	// 获取nft列表
	async getNFTList(owner: string) {
		let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });

		let nftDisabledTimeStr = localStorage.getItem('nftDisabledTime');
		let nftDisabledTime: { [key: string]: { date: string, type: IDisabledType } } = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};

		// nftList.forEach(item => {
		// 	let nftSaveTime = Number(nftDisabledTime[item.tokenId]);
		// 	item.btn_disabled = nftSaveTime && (Date.now() - nftSaveTime) < 180000 ? true : false;
		// });
		Object.keys(nftDisabledTime).forEach(key => {
			if (nftDisabledTime[key].type === 'draw') delete nftDisabledTime[key];
		});

		Object.keys(nftDisabledTime).map(tokenId => {
			nftList.forEach(item => {
				if (tokenId === item.tokenId) delete nftDisabledTime[tokenId];
			})
		});

		nftList.forEach(item => {
			let nftSaveTime = Number(nftDisabledTime[item.tokenId]);
			item.btn_disabled = nftSaveTime && (Date.now() - nftSaveTime) < 180000 ? true : false;
		});

		localStorage.setItem('nftDisabledTime', JSON.stringify(nftDisabledTime));

		this.setState({ nftList });
	}

	async takeAwayNftOfDeviceClick(nft: NFT) {
		try {

			await this._Withdraw(nft);
			alert('取出到钱包成功,数据显示可能有所延时,请稍后刷新数据显示', () => this.getNFTList(this.params.address));
			setNftDisabledTime(nft, 'draw');

		} catch (error) {
			alert(String(error));

		}
	}

	_Withdraw = async (nft: NFT) => {
		var to = await chain.getDefaultAccount();
		var from = nft.ownerBase || '';
		somes.assert(from, '#device_nft#_Withdraw: NOT_SUPPORT_WITHDRAW'); // 暂时只支持代理取出
		somes.assert(nft.owner == contracts.ERC721Proxy ||
			nft.owner == contracts.ERC1155Proxy, '#device_nft#_Withdraw: BAD_NFT_PROXY');

		var l = await Loading.show('正在取出到钱包');
		return new Promise(async (resolve, reject) => {
			try {
				await nft_proxy.New(nft.owner as string)
					.withdrawFrom(from, to, nft.token, BigInt(nft.tokenId), BigInt(nft.count)); // 取出一个
				resolve(nft);
			} catch (err: any) {
				console.error(err);
				if (env == 'dev') alert(err.message);
				reject('取出到钱包失败');
			} finally {
				l.close();
			}

		})
	};

	render() {
		let { nftList } = this.state;
		return <div className="device_info_page">
			<div className="device_info_page_title">设备列表</div>

			<div className="device_info_page_content">


				<div className="device_card_box">
					<DeviceItem deviceInfo={this.params} showArrow={false} showActionBtn={true} />
				</div>


				{nftList.map(item => <NftCard key={item.id} btnClick={this.takeAwayNftOfDeviceClick.bind(this, item)} nft={item} btnText="取出到钱包" btnLoadingText="取出中" />)}

				{/* <div className="nft_box">
						<div className="nft_info_box">
							<div className="nft_img_box">
								<img src={require('../assets/home_bg.png')} alt="" />
							</div>

							<div className="nft_address_box">
								<div className="nft_address_title">Address</div>
								<div className="nft_address textNoWrap">12as1d32as21da3s2d1a3s1d3212as1d32as21da3s2d1a3s1d32</div>
							</div>

							<div className="nft_hash_box">
								<div className="nft_hash_title">Hash</div>
								<div className="nft_hash textNoWrap">12as1d32as21da3s2d1a3s1d3212as1d32as21da3s2d1a3s1d32</div>
							</div>
						</div>

						<div className="action_btn_box">
							<Button type="primary">取出到钱包</Button>
						</div>

					</div> */}
			</div>

		</div>
	}
}