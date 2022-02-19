
import storage from 'somes/storage';
import { NFT, Device } from '.';
import buffer, { IBuffer } from 'somes/buffer';
import somes from 'somes';
import sdk, { authName } from '../sdk';
import chain from '../chain';
import { Signature } from 'web3z';

export { Device };

export interface DeviceScreenSave {
	time: number;
	type: 'single' | 'multi' | 'video';
	data: { token: string; tokenId: string }[];
}

export function devices(): Promise<Device[]> {
	return sdk.user.methods.devices();
}

export interface DeviceSigner {
	// 这个的owner拥有目标设备的访问授权。
	// 早期dapp版本中使用随机生成的中心账号做为owner,当使用钱包地址做为owner时,这个值为当前选择的钱包地址
	availableOwner(): Promise<string>;
	availablePublicKey(): Promise<string>; // owner的public key
	signFrom(target: string, msg: IBuffer): Promise<Signature>;
}

var _Signer: DeviceSigner;
var _Devices: Map<string, Device> = new Map();

export function setDeviceSigner(signer: DeviceSigner) {
	// console.log(_Signer, !_Signer);
	// debugger
	// somes.assert(!_Signer, 'Duplicate settings are not allowed');
	_Signer = signer;
}

export async function getDeviceFormAddress(target: string): Promise<Device | null> {
	var device = _Devices.get(target);
	if (!device) {
		_Devices = new Map();
		for (var i of await devices()) {
			_Devices.set(i.address, i);
		}
		device = _Devices.get(target);
	}
	return device || null;
}

// 清除设备缓存
export async function clearDeviceFormAddress() {
	_Devices.clear();
}

async function post(target: string, hash: string) {
	var msg = buffer.from(hash, 'base64');
	var { signature, recovery } = await _Signer.signFrom(target, msg);
	var sign = buffer.concat([signature, [recovery]]).toString('base64');
	var r = await sdk.mbx.methods.post({ hash, signature: sign });
	return r;
}

export async function call(target: string, method: string, args?: any, vCheck?: string): Promise<any> {
	var hash = await sdk.mbx.methods.call({
		target, method, args: { errno: 0, message: '', data: JSON.stringify(args) }, vCheck
	}) as string;
	let r = await post(target, hash);
	return JSON.parse(r);
}

export async function send(target: string, event: string, args?: any): Promise<any> {
	var hash = await sdk.mbx.methods.send({
		target, event, args: { errno: 0, message: '', data: JSON.stringify(args) }
	}) as string;
	await post(target, hash);
}

export async function ping(target: string) {
	await sdk.mbx.methods.ping({ target });
}

// 开关：显示/关闭 自动亮度
export function switchAutoLight(target: string, auto: boolean) {
	return send(target, 'switchAutoLight', { auto });
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

// 设置屏幕角度
export function screenOrientation(target: string, orientation: string) {
	return call(target, 'screenOrientation', { orientation });
}

// 清除投屏
export function clearShadow(target: string) {
	return call(target, 'clearShadow');
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

export function shadowSingleImage(target: string, token: string, tokenId: string) {
	return call(target, 'shadowSingleImage', { type: 'image', time: 0, data: [{ token, tokenId }] });
}

export function shadowMultiImage(target: string, time: number, data: { token: string, tokenId: string }[]) {
	return call(target, 'shadowMultiImage', { type: 'image', time, data });
}

export function shadowVideo(target: string, token: string, tokenId: string) {
	return call(target, 'shadowVideo', { type: 'video', time: 0, data: [{ token, tokenId }] });
}

export function sign(target: string, msg: IBuffer): Promise<{ signer: string, sign: string }[]> {
	return call(target, 'sign', { message: msg.toString('base64') });
}

export async function bind(target: string, authCode: string, vCheck?: string) {
	var owner = await _Signer.availableOwner();
	var publicKey = await _Signer.availablePublicKey();
	clearDeviceFormAddress();
	var o = await call(target, 'bind', {
		name: authName(),
		address: owner,
		publicKey: publicKey,
		authCode: authCode,
		addressOrigin: await chain.defaultAccount(),
	}, vCheck) as { sn: string, screen: number };

	if (typeof o == 'string') {
		o = { sn: o, screen: 0 };
	}

	await sdk.user.methods.addDevice({
		address: target,
		owner: owner,
		sn: o.sn || target,
		vCheck: vCheck,
		screen: o.screen,
	});
}

export async function unbind(target: string) {
	await call(target, 'unbind', { name: authName() });
	await sdk.user.methods.deleteDevice({ address: target });
}

export async function get_screen_save(address: string, _type?: 'single' | 'multi' | 'video'): Promise<DeviceScreenSave> {
	var type = _type || await storage.get('__device_set_screen_save_cur_' + address, 'single');
	var save = await storage.get('__device_set_screen_save_' + address + type, { address, time: 10, type })
	return { data: [], ...save };
}

export async function set_screen_save(address: string,
	pss: Partial<DeviceScreenSave>, type: 'single' | 'multi' | 'video', isNotCall?: boolean) {
	var ss = Object.assign(await get_screen_save(address, type), pss);
	var nfts = await sdk.nft.methods.getNFTByOwner({ owner: address }) as NFT[];
	var nfts_set = new Set();

	for (var nft of nfts) {
		nfts_set.add(nft.token + nft.tokenId);
	}

	ss.data = ss.data.filter(e => nfts_set.has(e.token + e.tokenId));

	ss.type = type;
	await storage.set('__device_set_screen_save_cur_' + address, type);
	await storage.set('__device_set_screen_save_' + address + type, ss);

	if (pss.data) {
		if (type == 'single') {
			somes.assert(pss.data.length, 'Bad param for call displaySingleImage()');
			!isNotCall && await displaySingleImage(address, pss.data[0].token, pss.data[0].tokenId);
		} else if (type == 'multi') {
			await displayMultiImage(address, ss.time, pss.data);
		} else {
			somes.assert(pss.data.length, 'Bad param for call displayVideo()');
			await displayVideo(address, pss.data[0].token, pss.data[0].tokenId);
		}
	} else if (pss.time) {
		if (type == 'multi')
			await displayMultiImage(address, ss.time, ss.data);
	}
}


export async function get_shadow_screen_save(address: string, _type?: 'single' | 'multi' | 'video'): Promise<DeviceScreenSave> {
	var type = _type || await storage.get('__device_set_shadow_screen_save_cur_' + address, 'single');
	var save = await storage.get('__device_set_shadow_screen_save_' + address + type, { address, time: 10, type })
	return { data: [], ...save };
}

export async function set_shadow_screen_save(address: string,
	pss: Partial<DeviceScreenSave>, type: 'single' | 'multi' | 'video', isNotCall?: boolean) {
	var ss = Object.assign(await get_screen_save(address, type), pss);
	var nfts = await sdk.nft.methods.getNFTByOwner({ owner: address }) as NFT[];
	var nfts_set = new Set();

	for (var nft of nfts) {
		nfts_set.add(nft.token + nft.tokenId);
	}

	ss.data = ss.data.filter(e => nfts_set.has(e.token + e.tokenId));

	ss.type = type;
	// await storage.set('__device_set_shadow_screen_save_cur_' + address, type);
	// await storage.set('__device_set_shadow_screen_save_' + address + type, ss);

	if (pss.data) {
		if (type == 'single') {
			somes.assert(pss.data.length, 'Bad param for call shadowSingleImage()');
			!isNotCall && await shadowSingleImage(address, pss.data[0].token, pss.data[0].tokenId);
		} else if (type == 'multi') {
			await shadowMultiImage(address, ss.time, pss.data);
		} else {
			somes.assert(pss.data.length, 'Bad param for call shadowVideo()');
			await shadowVideo(address, pss.data[0].token, pss.data[0].tokenId);
		}
	} else if (pss.time) {
		if (type == 'multi')
			await shadowMultiImage(address, ss.time, ss.data);
	}
}



