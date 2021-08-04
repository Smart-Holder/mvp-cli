/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import web3 from '..';
import Happy from 'web3z/happy';
import * as NFTs from './NFTs';

const ex_ = {
	get nfts() { return Happy.instance<NFTs.default>(NFTs, web3) },
	nft(address: string) { return Happy.instance<NFTs.default>({...NFTs, contractAddress: address}, web3, address) },
}

export default ex_;