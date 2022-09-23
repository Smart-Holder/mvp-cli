
import storage from 'somes/storage';
import index, { NFT, Device } from '.';
import buffer, { IBuffer } from 'somes/buffer';
import * as key from '../key';
import somes from 'somes';
import sdk from '../sdk';
import chain from '../chain';
import { t } from 'i18next';
import { alert } from '../util/tools';
import { ICropConfig } from '../pages/cropper_nft';

export { Device };

export interface DeviceScreenSave {
	address: string;
	time: number;
	type: 'single' | 'multi' | 'video' | 'nft';
	data: NFT[];
}

interface ITransformImageProps extends NFT {
	imageTransform?: ICropConfig;
}

export function devices(): Promise<Device[]> {
	return sdk.user.methods.devices();
}

export async function call(target: string, method: string, args?: any, vCheck?: string): Promise<any> {
	return new Promise(async (resolve, reject) => {
		try {
			var hash = await index.mbx.methods.call({
				target, method, args: { errno: 0, message: '', data: JSON.stringify(args) }, vCheck
			}) as string;
			let r = await post(hash);
			let res = JSON.parse(r);
			resolve(res);
			return res;
		} catch (error: any) {
			error.message = t(error.message);
			// console.log(error, error.message, 'error');
			reject(error);
		}
	});
}

export async function send(target: string, event: string, args?: any): Promise<any> {
	var hash = await index.mbx.methods.send({
		target, event, args: { errno: 0, message: '', data: JSON.stringify(args) }
	}) as string;
	await post(hash);
}

export async function post(hash: string) {
	var msg = buffer.from(hash, 'base64');
	var { signature, recovery } = key.sign(msg);
	var sign = buffer.concat([signature, [recovery]]).toString('base64');
	var r = await index.mbx.methods.post({ hash, signature: sign });
	return r;
}

export async function ping(target: string) {
	await index.mbx.methods.ping({ target });
}

// 设置音量
export function screenVolume(target: string, volume: number) {
	return send(target, 'screenVolume', { volume });
}

// 设置亮度
export function screenLight(target: string, light: number) {
	return send(target, 'screenLight', { light });
}

// 设置唤起wifi
export function screenWiFi(target: string) {
	return call(target, 'screenWiFi');
}

// 设置唤起检查更新
export function checkVersion(target: string) {
	return call(target, 'checkVersion');
}

// 设置开始更新设备
export function upgradeVersion(target: string, upgrade: boolean) {
	return call(target, 'upgradeVersion', { upgrade });
}


// 获取屏幕设置
export function getScreenSettings(target: string) {
	return call(target, 'getScreenSettings');
}

// 设置屏幕背景颜色
export function screenColor(target: string, color: string) {
	return send(target, 'screenColor', { color });
}

// 开关：显示/隐藏NFT信息和详情二维码
export function switchDetails(target: string, show: boolean) {
	return send(target, 'switchDetails', { show });
}

// 开关：显示/关闭 自动亮度
export function switchAutoLight(target: string, auto: boolean) {
	return send(target, 'switchAutoLight', { auto });
}


// 设置轮播时间
export function timeMultiImage(target: string, time: number | string) {
	return send(target, 'timeMultiImage', { time });
}

// 设置屏幕角度
export function screenOrientation(target: string, orientation: string) {
	return call(target, 'screenOrientation', { orientation });
}


// /files/res/apk/nftmvp_apk_upgrade.json

// 清除投屏
export function clearShadow(target: string) {
	return call(target, 'clearShadow');
}

export function shadowSingleImage(target: string, token: string, tokenId: string, item: NFT) {
	return call(target, 'shadowSingleImage', { type: 'image', time: 0, data: [item] });
}

export function shadowMultiImage(target: string, time: number, data: { token: string, tokenId: string }[]) {
	return call(target, 'shadowMultiImage', { type: 'image', time, data });
}

export function shadowVideo(target: string, token: string, tokenId: string, item: NFT) {
	return call(target, 'shadowVideo', { type: 'video', time: 0, data: [item] });
}


export function nftmvp_apk_upgrade() {
	return index.mbx.methods.post('/files/res/apk/nftmvp_apk_upgrade.json');
}

export function displaySingleImage(target: string, token: string, tokenId: string) {
	return call(target, 'displaySingleImage', { type: 'image', time: 0, data: [{ token, tokenId }] });
}

export function displayMultiImage(target: string, time: number, data: { token: string, tokenId: string }[]) {
	return call(target, 'displayMultiImage', { type: 'image', time, data });
}

export function displayVideo(target: string, token: string, tokenId: string) {
	return call(target, 'displayVideo', { type: 'video', time: 0, data: [{ token, tokenId }] });
}

export function displayNFTs(target: string, data: { token: string, tokenId: string }[]) {
	return call(target, 'displayNFTs', { type: 'nft', time: 0, data });
}

export function shadowNFTs(target: string, data: { token: string, tokenId: string }[]) {
	return call(target, 'shadowNFTs', { type: 'nft', time: 0, data });
}

export function transformImage(target: string, data: ITransformImageProps) {
	return call(target, 'transformImage', { ...data });
}


export function sign(target: string, msg: IBuffer): Promise<{ signer: string, sign: string }[]> {
	return call(target, 'sign', { message: msg.toString('base64') });
}

export async function bind(target: string, authCode: string, vCheck?: string) {
	var o = await call(target, 'bind', {
		name: key.authName(),
		address: key.address(),
		publicKey: key.publicKey(), authCode: authCode,
		addressOrigin: await chain.getDefaultAccount(),
	}, vCheck) as { sn: string, screen: number };

	if (typeof o == 'string') {
		o = { sn: o, screen: 0 };
	}

	await sdk.user.methods.addDevice({ address: target, sn: o.sn || target, vCheck, screen: o.screen });
}

export async function unbind(target: string) {
	await call(target, 'unbind', { name: key.authName() });
	await sdk.user.methods.deleteDevice({ address: target });
}

export async function get_screen_save(address: string, _type?: 'single' | 'multi' | 'video' | 'nft'): Promise<DeviceScreenSave> {
	var type = _type || await storage.get('__device_set_screen_save_cur_' + address, 'single');
	var save = await storage.get('__device_set_screen_save_' + address + type, { address, time: 10, type })
	return { data: [], ...save };
}

export async function set_screen_save(address: string,
	pss: Partial<DeviceScreenSave>, type: 'single' | 'multi' | 'video' | 'nft', isNotCall?: boolean) {
	var ss = Object.assign(await get_screen_save(address, type), pss);
	var nfts = await index.nft.methods.getNFTByOwner({ owner: address }) as NFT[];
	var nfts_set = new Set();

	for (var nft of nfts) {
		nfts_set.add(nft.token + nft.tokenId);
	}

	ss.data = ss.data.filter(e => nfts_set.has(e.token + e.tokenId));
	ss.type = type;
	await storage.set('__device_set_screen_save_cur_' + address, type);
	await storage.set('__device_set_screen_save_' + address + type, ss);

	if (pss.data) {
		console.log(pss.data, 'pss.data');
		await displayNFTs(address, pss.data);
	}
}


export async function get_shadow_screen_save(address: string, _type?: 'single' | 'multi' | 'video' | 'nft'): Promise<DeviceScreenSave> {
	var type = _type || await storage.get('__device_set_shadow_screen_save_cur_' + address, 'single');
	var save = await storage.get('__device_set_shadow_screen_save_' + address + type, { address, time: 10, type })
	return { data: [], ...save };
}

export async function set_shadow_screen_save(address: string,
	pss: Partial<DeviceScreenSave>, type: 'single' | 'multi' | 'video' | 'nft', isNotCall?: boolean) {

	if (pss.data) {

		let nftList = pss.data.map(item => {
			return { ...item, shadow: 1 };
		});
		console.log(nftList, 'nftList');
		await shadowNFTs(address, nftList);
	}
}
