
import somes from 'somes';
import sdk from '../src/sdk';

export default async function() {
	await somes.sleep(1e3);
	await sdk.user.methods.addDevice({ address: '0xC2631C2C69E2296541e317ad538BfC35bD6C8549', sn: 'sn-aa' });
	await sdk.user.methods.addDevice({ address: '0x3BF96c4dEA3c5168EFB7190F88e02B956b027334', sn: 'sn-bb' });
	console.log(await sdk.user.methods.devices());
}