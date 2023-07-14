import { React, Nav } from "webpkit/mobile";
import { ViewController } from "webpkit/lib/ctr";
import IconFont from "../components/icon_font";
import { NFT } from "../models";
import { DefaultOptions, DialogIn, show } from "../../deps/webpkit/lib/dialog";
import { CloseOutlined } from "@ant-design/icons";
import { withTranslation } from "react-i18next";
import { INftItem } from "../pages/interface";
import { changeLanguage, LanguageType } from "../util/i18next";
export type IDisabledKey = "transfer_btn_disabled" | "btn_disabled";
import { Toast } from "antd-mobile";
import "./tools.scss";
import chain from "../chain";
import { t } from "i18next";
import { bindDevice, bind, deviceActivation, checkBindDeviceStatus, getDeviceInfoByAddress } from "../models/device";
const crypto_tx = require("crypto-tx");
import Web3 from "web3"
import { ChainType,chainTraits } from '../models/def';

class Tab extends ViewController<{ nav: () => Nav }> {
	triggerLoad() {
		let locLanguage = navigator.language || localStorage.getItem("language");
		if (locLanguage === "zh-CN") locLanguage = "zh";
		changeLanguage((locLanguage?.toLocaleUpperCase() as LanguageType) || "ZH");
	}
	state = {
		current: 0,
	};

	m_click_1 = () => {
		this.setState({ current: 0 });
		this.props.nav().replace("/device", false, 0);
	};
	m_click_2 = () => {
		this.setState({ current: 1 });
		this.props.nav().replace("/my", false, 0);
	};

	render() {
		// console.log(location.pathname, "this.props");
		let { current } = this.state;
		let { t } = this.props as any;

		return (
			<div className="_tools">
				<div className="btn" onClick={this.m_click_1}>
					{current === 0 && location.pathname.startsWith("/device") ? <img src={require("../assets/tab1_selected.png")} /> : <img src={require("../assets/tab1.png")} />}
					<div className={`txt ${current === 0 && location.pathname.startsWith("/device") && "active"}`}>{t("首页")}</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					{current === 1 || location.pathname.startsWith("/my") ? <img src={require("../assets/tab2_selected.png")} /> : <img src={require("../assets/tab2.png")} />}
					<div className={`txt ${(current === 1 || location.pathname.startsWith("/my")) && "active"}`}>{t("我的")}</div>
				</div>
			</div>
		);
	}
}

export default withTranslation("translations", { withRef: true })(Tab);

export type IDisabledType = "drawNftDisabledTime" | "nftDisabledTime";
export type IActionType = "toWallets" | "toDevice";

interface INftDisabledTimeProps {
	[key: string]: {
		actionTime: string;
		actionType: "toWallets" | "toDevice";
	};
}

// 设置记录当前nft 存入设备操作时间
export const setNftDisabledTime = (nft: NFT, storageType: IDisabledType, getList?: () => void, actionType: IActionType = "toDevice") => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	nftDisabledTime[nft.tokenId] = { actionTime: String(Date.now()), actionType };

	let dsq_id = setTimeout(() => {
		removeNftDisabledTimeItem(nft, storageType);
		getList && getList();
		console.log("定时器执行", dsq_id);
	}, 100000);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.setItem(nft.tokenId, String(dsq_id));
};

// 删除操作nft时间
export const removeNftDisabledTimeItem = (nft: NFT, storageType: IDisabledType) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	let dsq_id = Number(localStorage.getItem(nft.tokenId));
	delete nftDisabledTime[nft.tokenId];
	console.log("删除nft操作时间", storageType, nftDisabledTime, "清除定时器>", dsq_id);
	localStorage.setItem(storageType, JSON.stringify(nftDisabledTime));
	localStorage.removeItem(nft.tokenId);
	clearTimeout(dsq_id);
};

// 设置nft操作按钮loading
export const setNftActionLoading = (nftList: INftItem[], storageType: IDisabledType) => {
	let nftDisabledTimeStr = localStorage.getItem(storageType);
	let nftDisabledTime: INftDisabledTimeProps = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};

	let otherType: IDisabledType = storageType == "drawNftDisabledTime" ? "nftDisabledTime" : "drawNftDisabledTime";
	let otherDisabledTimeStr = localStorage.getItem(otherType);
	let otherDisabledTime: INftDisabledTimeProps = otherDisabledTimeStr ? JSON.parse(otherDisabledTimeStr) : {};

	// console.log(otherDisabledTime, 'otherDisabledTime', nftDisabledTime, storageType);

	nftList.forEach((item) => {
		let nftDisabledTimeItem = nftDisabledTime[item.tokenId];
		let nftSaveTime = Number(nftDisabledTimeItem?.actionTime);
		const isWithdraw = nftDisabledTimeItem?.actionType === "toWallets";

		let disabled = nftSaveTime && Date.now() - nftSaveTime < 180000 ? true : false;
		let disabledKey: IDisabledKey = isWithdraw ? "transfer_btn_disabled" : "btn_disabled";

		item[disabledKey] = disabled;

		if (otherDisabledTime[item.tokenId]) removeNftDisabledTimeItem(item, otherType);
	});
	return nftList;
};

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
	onClose?: () => {};
}

export const showModal = async (opts: IShowModalProps) => {
	let instance = await show({
		...opts,
		title: (
			<div>
				{opts.title}{" "}
				<CloseOutlined
					onClick={(e: any) => {
						let btnKeys = Object.keys(opts.buttons || {});
						opts?.buttons && opts?.buttons[btnKeys[0]](e);
						instance?.close();
					}}
				/>{" "}
			</div>
		),
		buttons:
			opts.buttons &&
			Object.keys(opts.buttons).reduce((prebtnTitle: {}, btnTitle: string, index: number) => {
				return {
					...prebtnTitle,
					[btnTitle]: (e: any) => {
						if (opts?.buttons) {
							opts?.buttons[btnTitle](e);
							!index && instance?.close();
						}
					},
				};
			}, {}),
	});
};

//截取字符串中间用省略号显示
export function getSubStr(str: string, substrlen: number = 11, startLen?: number) {
	if (!str) return;
	var subStr1 = str.substr(0, startLen || substrlen);
	var subStr2 = str.substr(str.length - substrlen, str.length);
	var subStr = subStr1 + "..." + subStr2;
	return subStr;
}

// 获取根据当前钱包链 区分开的数据
export const getDistinguishNftList = (nftList: INftItem[]) => {
	let nftList1: INftItem[] = [];
	let nftList2: INftItem[] = [];

	nftList.forEach((item) => {
		item.chain == chain.chain ? nftList1.push(item) : nftList2.push(item);
	});
	return { nftList1, nftList2 };
};

// 复制文字
export const copyText = (text: string) => {
	var tag = document.createElement("input");
	tag.setAttribute("id", "cp_hgz_input");
	tag.value = text;
	document.getElementsByTagName("body")[0].appendChild(tag);
	(document?.getElementById("cp_hgz_input") as any).select();
	document.execCommand("copy");
	(document.getElementById("cp_hgz_input") as any).remove();
	Toast.show("复制完成!");
};

export const unitLabel: { [key: string]: string } = {
	"1": "ETH",
	0: "UNKNOWN",
	137: "MATIC",
	8217: "KLAYTN",
	100: "XDAI",
	56: "BSC",
	"-2": "FLOW",
	"-1": "LOCAL",
	4: "RINKEBY",
	80001: "MUMBAI",
	1001: "BAOBAB",
	97: "BSC_TESTNET",
	5: "GOERLI",
	5555: "BSN_TEST",
	599: "METIS_TEST",
	588: "METIS_TEST_OLD",
	6666: "HASHII_TEST",
};

export const unitLabelProd: { [key: string]: string } = {
	"1": "ETH",
	0: "UNKNOWN",
	137: "MATIC",
	8217: "KLAYTN",
	100: "XDAI",
	56: "BSC",
	"-2": "FLOW",
	"-1": "LOCAL",
	4: "RINKEBY",
	80001: "MUMBAI",
	1001: "BAOBAB",
	97: "BSC_TESTNET",
	5: "GOERLI",
	5555: "BSN",
	599: "METIS",
	588: "METIS_TEST_OLD",
	1088: "METIS",
	6666: "HASHII",
};

export enum unitChainIdLabel {

	UNKNOWN = 0, // UNKNOWN
	ETHEREUM = 1, // ETHEREUM
	MATIC = 137, // MATIC
	KLAYTN = 8217, // KLAYTN
	XDAI = 100, // XDAI
	BSC = 56, // BSC
	FLOW = -2, // FLOW
	LOCAL = -1, // LOCAL
	ROPSTEN = 3, // ROPSTEN
	RINKEBY = 4, // RINKEBY
	MUMBAI = 80001, // MUMBAI
	BAOBAB = 1001, // BAOBAB
	BSC_TESTNET = 97, // BSC_TESTNET
	GOERLI = 5, // GOERLI
	HCETH = 64, // hard-chain ETHEREUM
	BSN_TEST = 5555,
	BSN = 5555,
	HASHII_TEST = 6666,
	HASHII = 6667,
	METIS = 1088,
	METIS_TEST = 588,
	TMETIS     = 599,
	WENCHUANG =6669,
	TEST_CHAIN=8595,

	// METIS_TEST_OLD = 588, // METIS ????
}

export {ChainType,chainTraits};

export const alert = (text: string | DialogIn, onOk?: () => void) => {
	if (!text) return;
	let btnText = t("@确认");
	if (typeof text === "string") {
		return show({
			text,
			buttons: { [btnText]: () => onOk && onOk() },
		});
	}

	return show({
		...text,
		buttons: { [btnText]: () => onOk && onOk() },
	});
};

export const confirm = async (text: string | DialogIn, onOk?: (isOk?: any) => Promise<void>) => {
	let btnText = t("@确认");
	let btnTextCanel = t("取消");

	if (typeof text === "string") {
		let l: any = await show({
			text,
			buttons: { [btnTextCanel]: () => l.close(), [btnText]: () => onOk && onOk(true) },
		});
		return l;
	}

	return show({
		...text,
		buttons: { [btnTextCanel]: () => onOk && onOk(false), [btnText]: () => onOk && onOk(true) },
	});
};
const dialog_handles: Dict<any> = {};

export const handle = function (e: any) {
	var err = Error.new(e);
	var errno = err.errno as number;
	var text = err.message ? (
		<span>
			{err.message}
			<br />
			{err.description}
		</span>
	) : (
		<span>An unknown exception</span>
	);
	if (errno) {
		if (!dialog_handles[errno]) {
			var dag = alert({ text }, () => {
				delete dialog_handles[errno];
			});
			dialog_handles[errno] = dag;
		}
	} else {
		alert({ text });
	}
};

// 获取路由中的参数
export const getParams = (url: string) => {
	var temp1 = url.split("?");
	var pram = temp1[1];
	var keyValue = pram.split("&");
	var obj: { [key: string]: string } = {};
	for (var i = 0; i < keyValue.length; i++) {
		var item = keyValue[i].split("=");
		var key = item[0];
		var value = item[1];
		obj[key] = value;
	}
	return obj;
};

// 获取当前的 Gas 价格
export const  getPolygonCurrentGasPrice = async () => {
	const res = await fetch( 'https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
	const data = await res.json();
	const { ProposeGasPrice } = data.result;
	return ProposeGasPrice * 1000000000;
}

// const bind_device = async (href: string, isActivation?: boolean) => {
// 	let { a, c, v, n = 0 } = getParams(href);
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			if (!a) {
// 				// alert("请扫描设备绑定二维码!");
// 				throw Error('请扫描设备绑定二维码!');
// 			}
// 			Number(n) < 316 ? await bind(crypto_tx.checksumAddress(a), c, v) : await bindDevice(a, c, v);
// 			if (isActivation && Number(n) < 316) {
// 				await deviceActivation({ address: a });
// 			}

// 			if (Number(n) < 316) return resolve('');

// 			let index = 0;
// 			let dsq_id = setInterval(async () => {
// 				try {
// 					let data = await checkBindDeviceStatus(a);
// 					index++;
// 					if (index >= 5) {
// 						reject(data);
// 						clearInterval(dsq_id);
// 						alert('设备绑定失败超时');
// 					}
// 					if (!data) {
// 						clearInterval(dsq_id);
// 						resolve('');
// 					} else if (data == 3) {
// 						reject(data);
// 						clearInterval(dsq_id);
// 						alert('绑定失败,绑定二维码过期');
// 					}
// 				} catch (error) {
// 					clearInterval(dsq_id);
// 					reject(error);
// 				}
// 			}, 1000);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});

// }

// // 绑定设备设置当前钱包
// export const newBindDevice = async (a: string, code: string, vcheck?: string) => {
// 	let data = await getDeviceInfoByAddress({ address: a });
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			if (data?.activation) {
// 				await bind_device(a);
// 			} else {
// 				confirm({
// 					title: '激活提示',
// 					text: '激活设备后将不支持退换，确定激活设备？'
// 				}, async (isOk) => {
// 					if (!isOk) {
// 						return;
// 					};
// 					// 激活绑定
// 					await bind_device(a, true);
// 				});
// 			}
// 			resolve('');
// 		} catch (error) {

// 			reject(error);
// 		}
// 	});

// }
