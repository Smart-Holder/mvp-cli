
import chain from '../src/chain';
import native from './native';
import { dialog } from 'webpkit/mobile';

export default chain;

async function test() {

	var str = await native.scan();

	alert('qrcode:' + str);

	await native.setKey('a', 'A');
	await native.setKey('b', 'B');

	alert(await native.getKeysName());

	alert(await native.getKey('a'));
	alert(await native.getKey('b'));
}

export async function initialize() {
	// TODO ...
	//test();

	await chain.initialize();
}
