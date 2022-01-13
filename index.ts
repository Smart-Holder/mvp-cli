
if (process.env.WALLET) {
	import('./wallet');
} else {
	import('./src');
}