
// pragma solidity ^0.7.5;
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

abstract contract NFTProxy {

	uint256 private constant _TRANSFER_EXPIRY = 60; // 60 second

	struct Signature {
		bytes32 r; bytes32 s; uint8 v;
	}

	struct TransferTx {
		address token;
		uint256 tokenId;
		address to;
		uint256 expiry; // second
		Signature rsv;
	}

	function ownerOf(address token, uint256 tokenId) virtual external view returns(address);
	function _withdraw(address from, address to, address token, uint256 tokenId) virtual internal;
	function _transfer(address from, address to, address token, uint256 tokenId) virtual internal;

	function withdraw(address to, address token, uint256 tokenId) external {
		_withdraw(msg.sender, to, token, tokenId);
	}

	function transfer(address to, address token, uint256 tokenId) external {
		_transfer(msg.sender, to, token, tokenId);
	}

	function withdrawFrom(TransferTx memory tx) external {
		require(tx.expiry > block.timestamp, "#NFTProxy#withdrawFrom: TRANSFER_EXPIRY");
		bytes32 hash = keccak256(abi.encodePacked(tx.token, tx.tokenId, tx.to, tx.expiry));
		address from = ecrecover(hash, tx.rsv.v, tx.rsv.r, tx.rsv.s);
		_withdraw(from, tx.to, tx.token, tx.tokenId);
	}

	function transferFrom(TransferTx memory tx) external {
		require(tx.expiry > block.timestamp, "#NFTProxy#transferFrom: TRANSFER_EXPIRY");
		bytes32 hash = keccak256(abi.encodePacked(tx.token, tx.tokenId, tx.to, tx.expiry));
		address from = ecrecover(hash, tx.rsv.v, tx.rsv.r, tx.rsv.s);
		_transfer(from, tx.to, tx.token, tx.tokenId);
	}

}