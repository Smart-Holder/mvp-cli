
import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../components/icon_font';
import "./tools.scss"
import { NFT } from '../models';
import { INftItem } from '../pages/my';

export default class extends ViewController<{ nav: () => Nav }> {
	state = {
		current: 0
	}

	m_click_1 = () => {
		this.setState({ current: 0 });
		this.props.nav().replace('/device', false, 0);
	};
	m_click_2 = () => {
		this.setState({ current: 1 });
		this.props.nav().replace('/my', false, 0);
	};


	render() {
		// console.log(location.pathname, "this.props");
		let { current } = this.state;
		return (
			<div className="_tools">
				<div className="btn" onClick={this.m_click_1}>
					{/* <div className="icon a"></div> */}
					{(current === 0 && location.pathname.startsWith("/device")) ? <IconFont type="icon-shouyexuanzhong" /> : <IconFont type="icon-shouye" />}
					<div className="txt">首页</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					{/* <div className="icon b"></div> */}
					{(current === 1 || location.pathname.startsWith("/my")) ? <IconFont type="icon-wodexuanzhong" /> : <IconFont type="icon-wode" />}
					<div className="txt">我的</div>
				</div>
			</div>
		);
	}
}

export type IDisabledType = 'draw' | 'transfer';

// 设置记录当前nft 存入设备操作时间
export const setNftDisabledTime = (nft: NFT, storageType: string, getList: () => void) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: { [key: string]: string } = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	nftDisabledTime[nft.tokenId] = String(Date.now());
	let dsq_id = setTimeout(() => {
		removeNftDisabledTimeItem(nft, storageType);
		getList();
		console.log('定时器执行', dsq_id);
	}, 180000);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.setItem(nft.tokenId, String(dsq_id));
}

// 删除操作nft时间
export const removeNftDisabledTimeItem = (nft: NFT, storageType: string) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: { [key: string]: string } = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	let dsq_id = Number(localStorage.getItem(nft.tokenId));
	delete nftDisabledTime[nft.tokenId];
	console.log('删除nft操作时间', storageType, '清除定时器>', dsq_id);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.removeItem(nft.tokenId);
	clearTimeout(dsq_id);
}

// 设置nft操作按钮loading
export const setNftActionLoading = (nftList: INftItem[], storageType: string) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: { [key: string]: string } = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};

	nftList.forEach(item => {
		let nftSaveTime = Number(nftDisabledTime[item.tokenId]);
		item.btn_disabled = nftSaveTime && (Date.now() - nftSaveTime) < 180000 ? true : false;
	});
	return nftList;
}


// 数组变对象
export function ArrayToObj<T>(arr: T[], key: string, key2?: string): { [key: string]: T } {
	let objArr: { [key: string]: T } = {};
	arr.forEach((item: any, index) => {
		let id = (item[key] as string) || (item as any)[key2 || index] || "empty-" + index;
		objArr[id] = item;
	});
	return objArr;
}