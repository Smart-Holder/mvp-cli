// SPDX-License-Identifier: MIT
// Created by NTFSWAP Team

// pragma solidity ^0.7.5;
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";
import { NFTProxy } from './NFTProxy.sol';
import { Proxyable } from './Proxyable.sol';

contract ERC721Proxy is IERC721Receiver, NFTProxy, Proxyable {
	using Address for address;

	// nft token address => map( tokenID => owner )
	mapping(address => mapping(uint256 => address)) assets;

	bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
	bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

	event Transfer(
		address indexed from,
		address indexed to,
		address indexed token,
		uint256 tokenId
	);

	function initialize() external {
		__Proxyable_init();
	}

	// @dev convert addr to standard ERC721 NFT,will be revered if add is invalid.
	function _isERC721(address addr) internal view returns (IERC721) {
		require(
			addr.isContract(),
			"#Exchange#_isERC721: INVLIAD_CONTRACT_ADDRESS"
		);
		require(
			IERC721(addr).supportsInterface(_INTERFACE_ID_ERC721),
			"The NFT contract has an invalid ERC721 implementation"
		);
		return IERC721(addr);
	}

	function onERC721Received(
			address,
			address from,
			uint256 tokenId,
			bytes memory data
	) external override returns (bytes4) {
		//check
		IERC721 token = _isERC721(msg.sender);
		require(
			token.ownerOf(tokenId) == address(this),
			"#ERC721Proxy#onERC721Received: NOT_OWN_TOKEN"
		);

		_supply(from, token, tokenId, data);
		return _ERC721_RECEIVED;
	}

	function _supply(
		address from,
		IERC721 token,
		uint256 tokenId,
		bytes memory data
	) private {
		require(from != address(0), "#ERC721Proxy#_supply: FROM_IS_EMPTY");
		require(assets[address(token)][tokenId] == address(0), "#ERC721Proxy#_supply: OWNER_NOT_EMPTY");

		address to;
		bytes memory other;
		(to, other) = abi.decode(data, (address, bytes));

		if (to == address(0))
			to = from;

		assets[address(token)][tokenId] = to;

		emit Transfer(address(0), to, address(token), tokenId);
	}

	function _withdraw(address from, address to, address token, uint256 tokenId) internal override {
		address assetOwner = assets[token][tokenId];
		require(
			assetOwner != address(0),
			"#ERC721Proxy#_withdraw: NOT_FOUND_ASSET"
		);
		require(assetOwner == from, "#ERC721Proxy#_withdraw: NO_ACCESS");

		delete assets[token][tokenId];
		IERC721(token).safeTransferFrom(address(this), to, tokenId);

		emit Transfer(from, address(0), token, tokenId);
	}

	function _transfer(address from, address to, address token, uint256 tokenId) internal override {
		address assetOwner = assets[token][tokenId];
		require(
			assetOwner != address(0),
			"#ERC721Proxy#_transfer: NOT_FOUND_ASSET"
		);
		require(assetOwner == from, "#ERC721Proxy#_transfer: NO_ACCESS");

		assets[token][tokenId] = to;

		emit Transfer(from, to, token, tokenId);
	}

	function ownerOf(address token, uint256 tokenId) external view override returns(address) {
		return assets[token][tokenId];
	}

}