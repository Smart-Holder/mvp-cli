
import mask from './test-metamask';
import api from './test-api';
import proxy from './test-proxy';

async function test() {
	await mask();
	// await api();
	// await proxy();
}

test();

export {}