
import chain from '../src/chain';
import Proxy from '../src/chain/nftproxy';
import erc1155 from '../src/chain/erc1155';
import { ChainType } from '../src/models';

export default async function () {
	if (chain.chain != ChainType.ETHEREUM) return;

	var proxy1155 = Proxy.New('0x36763175b209853D022F2BAfd64eef71D5DF8dCF', ChainType.ETHEREUM);

	var my = await chain.getDefaultAccount();
	var lxy = '0xb02cbeD3aC823085CfB1A667Fb1C73E19E724657';
	var token = '0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656';
	var tokenId = BigInt('0xb02cbed3ac823085cfb1a667fb1c73e19e724657000000000000080000000001');

	if (await erc1155.balanceOf(token, my, tokenId) != BigInt(0)) {
		await erc1155.safeTransferToProxy(token, [my], tokenId, BigInt(1), proxy1155.contractAddress);
	}

	if (await proxy1155.balanceOf(token, tokenId, my) != BigInt(0)) {
		await proxy1155.withdrawFrom(my, lxy, token, tokenId, BigInt(1));
		// await proxy1155.test_withdraw(my, lxy, token, tokenId, BigInt(1));
	}
}