
import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../components/icon_font';
import { NFT } from '../models';
import { DefaultOptions, show } from '../../deps/webpkit/lib/dialog';
import { CloseOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { INftItem } from '../pages/interface';
import { changeLanguage, LanguageType } from '../util/i18next';
export type IDisabledKey = 'transfer_btn_disabled' | 'btn_disabled';

import "./tools.scss";
import chain from '../chain';

class Tab extends ViewController<{ nav: () => Nav }> {
	triggerLoad() {
		let locLanguage = navigator.language || localStorage.getItem('language');
		if (locLanguage === 'zh-CN') locLanguage = 'zh';
		changeLanguage(locLanguage?.toLocaleUpperCase() as LanguageType || 'ZH');
	}
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
		let { t } = this.props as any;

		return (
			<div className="_tools" >
				<div className="btn" onClick={this.m_click_1}>
					{(current === 0 && location.pathname.startsWith("/device")) ? <IconFont type="icon-shouyexuanzhong" /> : <IconFont type="icon-shouye" />}
					<div className={`txt ${(current === 0 && location.pathname.startsWith("/device")) && 'active'}`}>{t("首页")}</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					{(current === 1 || location.pathname.startsWith("/my")) ? <IconFont type="icon-wodexuanzhong" /> : <IconFont type="icon-wode" />}
					<div className={`txt ${(current === 1 || location.pathname.startsWith("/my")) && 'active'}`}>{t("我的")}</div>
				</div>
			</div>
		);
	}
}

export default withTranslation('translations', { withRef: true })(Tab);


export type IDisabledType = 'drawNftDisabledTime' | 'nftDisabledTime';
export type IActionType = 'toWallets' | 'toDevice';

interface INftDisabledTimeProps {
	[key: string]: {
		actionTime: string;
		actionType: 'toWallets' | 'toDevice';
	}
}

// 设置记录当前nft 存入设备操作时间
export const setNftDisabledTime = (nft: NFT, storageType: IDisabledType, getList?: () => void, actionType: IActionType = 'toDevice') => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	nftDisabledTime[nft.tokenId] = { actionTime: String(Date.now()), actionType };

	let dsq_id = setTimeout(() => {
		removeNftDisabledTimeItem(nft, storageType);
		getList && getList();
		console.log('定时器执行', dsq_id);
	}, 100000);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.setItem(nft.tokenId, String(dsq_id));
}

// 删除操作nft时间
export const removeNftDisabledTimeItem = (nft: NFT, storageType: IDisabledType) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	let dsq_id = Number(localStorage.getItem(nft.tokenId));
	delete nftDisabledTime[nft.tokenId];
	console.log('删除nft操作时间', storageType, '清除定时器>', dsq_id);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.removeItem(nft.tokenId);
	clearTimeout(dsq_id);
}

// 设置nft操作按钮loading
export const setNftActionLoading = (nftList: INftItem[], storageType: IDisabledType) => {


	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};

	let otherType: IDisabledType = storageType == "drawNftDisabledTime" ? "nftDisabledTime" : "drawNftDisabledTime";
	let otherDisabledTimeStr = localStorage.getItem(otherType);
	let otherDisabledTime: INftDisabledTimeProps = otherDisabledTimeStr ? JSON.parse(otherDisabledTimeStr) : {};



	nftList.forEach(item => {
		let nftDisabledTimeItem = nftDisabledTime[item.tokenId];
		let nftSaveTime = Number(nftDisabledTimeItem?.actionTime);
		const isWithdraw = nftDisabledTimeItem?.actionType === 'toWallets';

		let disabled = nftSaveTime && (Date.now() - nftSaveTime) < 180000 ? true : false;
		let disabledKey: IDisabledKey = isWithdraw ? 'transfer_btn_disabled' : 'btn_disabled';

		item[disabledKey] = disabled;

		if (otherDisabledTime[item.tokenId]) removeNftDisabledTimeItem(item, otherType);
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

interface IShowModalProps extends DefaultOptions {
	onClose?: () => {

	}
}

export const showModal = async (opts: IShowModalProps,) => {
	let instance = await show({
		...opts,
		title: <div>{opts.title} <CloseOutlined onClick={(e: any) => {
			let btnKeys = Object.keys(opts.buttons || {});
			opts?.buttons && opts?.buttons[btnKeys[0]](e);
			instance?.close();
		}} /> </div>, buttons:
			opts.buttons && Object.keys(opts.buttons).reduce((prebtnTitle: {}, btnTitle: string, index: number) => {
				return {
					...prebtnTitle, [btnTitle]: (e: any) => {
						if (opts?.buttons) {
							opts?.buttons[btnTitle](e);
							!index && instance?.close();
						}
					}
				}
			}, {})
	});
}

//截取字符串中间用省略号显示
export function getSubStr(str: string, substrlen: number = 11, startLen?: number) {
	var subStr1 = str.substr(0, startLen || substrlen);
	var subStr2 = str.substr(str.length - substrlen, str.length);
	var subStr = subStr1 + "..." + subStr2;
	return subStr;
}

// 获取根据当前钱包链 区分开的数据
export const getDistinguishNftList = (nftList: INftItem[]) => {
	let nftList1: INftItem[] = [];
	let nftList2: INftItem[] = [];

	nftList.forEach(item => {
		(item.chain == chain.chain) ? nftList1.push(item) : nftList2.push(item);
	});
	return { nftList1, nftList2 };
}