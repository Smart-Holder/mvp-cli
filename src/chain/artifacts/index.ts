/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import web3 from '..';
import Happy from 'web3z/happy';
import * as ERC721 from './ERC721';

const ex_ = {
	get erc721() { return Happy.instance<ERC721.default>(ERC721, web3) },
	nft(address: string) { return Happy.instance<ERC721.default>({...ERC721, contractAddress: address}, web3, address) },
}

export default ex_;