/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import web3 from '..';
import Happy from 'web3z/happy';
import * as ERC721 from './ERC721';
import * as ERC1155 from './ERC1155';
import * as NFTProxy from './NFTProxy';
// import {contracts} from '../../../config';

const ex_ = {
	erc721(address: string = ERC721.contractAddress) { return Happy.instance<ERC721.default>({...ERC721, contractAddress: address}, web3, address) },
	erc1155(address: string = ERC1155.contractAddress) { return Happy.instance<ERC1155.default>({...ERC1155, contractAddress: address}, web3, address) },
	nft_proxy(address: string) {
		return Happy.instance<NFTProxy.default>({...NFTProxy, contractAddress: address}, web3, address)
	},
}

export default ex_;