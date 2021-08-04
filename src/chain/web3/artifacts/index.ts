/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import somes from 'somes';
import web3 from '..';
import Happy from 'web3z/happy';

import * as Exchange from './Exchange';
import * as FeePlan from './FeePlan';
import * as Ledger from './Ledger';
import * as VotePool from './VotePool';
import * as NFTs from './NFTs';

const ex_ = {
	get exchange() { return Happy.instance<Exchange.default>(Exchange, web3) },
	get fee_plan() { return Happy.instance<FeePlan.default>(FeePlan, web3) },
	get ledger() { return Happy.instance<Ledger.default>(Ledger, web3) },
	get vote_pool() { return Happy.instance<VotePool.default>(VotePool, web3) },
	get nfts() { return Happy.instance<NFTs.default>(NFTs, web3) },
	nft(address: string) { return Happy.instance<NFTs.default>({...NFTs, contractAddress: address}, web3, address) },
}

export async function check() {
	somes.assert(await ex_.exchange.api.feePlan().call() == ex_.fee_plan.address, 'exchange.api.feePlan().call() == ex_.fee_plan.address');
	somes.assert(await ex_.exchange.api.ledger().call() == ex_.ledger.address, 'exchange.api.ledger().call() == ex_.ledger.address');
	somes.assert(await ex_.exchange.api.votePool().call() == ex_.vote_pool.address, 'exchange.api.votePool().call() == ex_.vote_pool.address');
	somes.assert(await ex_.ledger.api.hasSubLedger(ex_.vote_pool.address).call(), 'ledger.api.hasSubLedger(ex_.vote_pool.address).call()');
	somes.assert(await ex_.vote_pool.api.ledger().call() == ex_.ledger.address, 'vote_pool.api.ledger().call() == ex_.ledger.address');
	somes.assert(await ex_.vote_pool.api.exchange().call() == ex_.exchange.address, 'vote_pool.api.exchange().call() == ex_.exchange.address');
}

export default ex_;