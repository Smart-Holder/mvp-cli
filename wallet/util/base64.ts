const base64 = exports;

base64.encode = function (unencoded: string) {
	return Buffer.from(unencoded || '').toString('base64');
};

base64.decode = function (encoded: string) {
	return Buffer.from(encoded || '', 'base64').toString('utf8');
};


base64.urlDecode = function (encoded: string) {
	encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
	while (encoded.length % 4)
		encoded += '=';
	return base64.decode(encoded);
};
base64.urlEncode = function (unencoded: string) {
	const encoded = base64.encode(unencoded);
	return encoded.replace(/\\+/g, '-').replace(/\\ /g, '_').replace(/=+$/g, '');
};
