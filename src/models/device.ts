
import storage from 'somes/storage';
import index, {NFT} from '.';
import buffer, {IBuffer} from 'somes/buffer';
import * as key from '../key';
import somes from 'somes';

export interface Device {
	sn: string;
	address: string;
	nft?: number;
}

export interface DeviceScreenSave {
	address: string;
	time: number;
	type: 'single' | 'multi' | 'video';
	data: {token: string; tokenId: string}[];
}

export async function devices(): Promise<Device[]> {
	var list = storage.get('__deviceList', []) as Device[];
	if (list.length) {
		var owners = list.map(e=>e.address);
		var counts = await index.nft.methods.getNFTCountByOwners({ owners }) as number[];
		list.forEach((e,j)=>(e.nft=counts[j]));
	}
	return list;
}

export async function call(target: string, method: string, args?: any): Promise<any> {
	var hash = await index.mbx.methods.call({
		target, method, args: { errno: 0, message: '', data: JSON.stringify(args) }
	}) as string;
	var msg = buffer.from(hash, 'base64');
	var {signature,recovery} = key.sign(msg);
	var sign = buffer.concat([signature, [recovery]]).toString('base64');
	var r = await index.mbx.methods.post({hash, signature: sign});
	return JSON.parse(r);
}

export async function ping(target: string) {
	await index.mbx.methods.ping({target});
}

export function displaySingleImage(target: string, token: string, tokenId: string) {
	return call(target, 'displaySingleImage', { type: 'image', time: 0, data:[{ token, tokenId }] });
}

export function displayMultiImage(target: string, time: number, data: {token: string, tokenId: string}[]) {
	return call(target, 'displayMultiImage', { type: 'image', time, data });
}

export function displayVideo(target: string, token: string, tokenId: string) {
	return call(target, 'displayVideo', { type: 'video', time: 0, data:[{ token, tokenId }] });
}

export function sign(target: string, msg: IBuffer) {
	return call(target, 'sign', { message: msg.toString('base64') });
}

export async function bind(target: string, authCode: string) {
	var sn = await call(target, 'bind', {
		name: key.authName(),
		address: key.address(),
		publicKey: key.publicKey(), authCode: authCode,
	});

	var NewDevice = { address: target, sn: sn || target };

	var list = storage.get('__deviceList', []) as Device[];
	var it = list.find(e=>e.address == target);
	if (!it) {
		list.push(NewDevice);
	} else {
		Object.assign(it, NewDevice);
	}
	storage.set('__deviceList', list);
}

export async function unbind(target: string) {
	await call(target, 'unbind', { name: key.authName() });

	var list = storage.get('__deviceList', []) as Device[];
	var i = -1;

	if (list.find((e,j)=>(i=j,e.address==target))) {
		list.splice(i, 1);
		storage.set('__deviceList', list);
	}
}

export function get_screen_save(address: string, _type?: 'single' | 'multi' | 'video'): DeviceScreenSave {
	var type = _type || storage.get('__device_set_screen_save_cur_' + address, 'single');
	return { data: [], ...storage.get(
		'__device_set_screen_save_' + address + type, { address, time: 10, type }) 
	};
}

export async function set_screen_save(address: string, 
	pss: Partial<DeviceScreenSave>, type: 'single' | 'multi' | 'video') 
{
	var ss = Object.assign(get_screen_save(address, type), pss);
	var nfts = await index.nft.methods.getNFTByOwner({owner: address}) as NFT[];
	var nfts_set = new Set();

	for (var nft of nfts) {
		nfts_set.add(nft.token + nft.tokenId);
	}

	ss.data = ss.data.filter(e=>nfts_set.has(e.token+e.tokenId));

	if (!ss.data.length && nfts.length) {
		// ss.data = [nfts[0]];
	}

	ss.type = type;
	storage.set('__device_set_screen_save_cur_' + address, type);
	storage.set('__device_set_screen_save_' + address + type, ss);

	if (pss.data) {
		if (type == 'single') {
			somes.assert(pss.data.length, 'Bad param for call displaySingleImage()');
			await displaySingleImage(address, pss.data[0].token, pss.data[0].tokenId);
		} else if (type == 'multi') {
			await displayMultiImage(address, ss.time, pss.data);
		} else {
			somes.assert(pss.data.length, 'Bad param for call displayVideo()');
			await displayVideo(address, pss.data[0].token, pss.data[0].tokenId);
		}
	} else if (pss.time) {
		if (ss.type == 'multi')
			await displayMultiImage(address, ss.time, ss.data);
	}
}
