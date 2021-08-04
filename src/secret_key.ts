
import storage from 'somes/storage';
import buffer from 'somes/buffer';

const crypto_tx = require('crypto-tx');

export function getKeysDetails() {
	if (storage.has('__as1ahaasr')) {
		var privateKey = buffer.from(storage.get('__as1ahaasr'), 'base64')
	} else {
		var privateKey = buffer.from(crypto_tx.genPrivateKey());
		storage.set('__as1ahaasr', privateKey.toString('base64'));
	}

	// publicKeyBytes: publicKey,
	// publicKeyLongBytes: publicKeyLong,
	// addressBytes: address,
	// publicKey: '0x' + publicKeyHex,
	// publicKeyLong: '0x' + publicKeyLongHex,
	// address: '0x' + addressHex,
	// publicKeyHex: publicKeyHex,
	// publicKeyLongHex: publicKeyLongHex,
	// addressHex: addressHex,

	return {
		...crypto_tx.publicKeyConvertDetails(crypto_tx.getPublic(privateKey)), privateKey,
	};
}