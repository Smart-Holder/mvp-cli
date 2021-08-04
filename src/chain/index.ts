
import {APIExchange} from './exchange';
import {APILedger} from './ledger';
import {APINFTs} from './nfts';
import {APIUser} from './user';
import {APIVotePool} from './vote_pool';
import * as cfg from '../../config';

export * from './exchange';
export * from './ledger';
export * from './nfts';
export * from './user';
export * from './vote_pool';

export var exchange: APIExchange;
export var ledger: APILedger;
export var nfts: APINFTs;
export var user: APIUser;
export var vote_pool: APIVotePool;

var _encodeParameters: (types: any[], paramaters: any[]) => string;
var _initialize: () => Promise<void>;

if (cfg.platform == 'substrate') {

	const _ex = require('./substrate/exchange').default;
	const _ledger = require('./substrate/ledger').default;
	const _nfts = require('./substrate/nfts').default;
	const _user = require('./substrate/user').default;
	const _vp = require('./substrate/vote_pool').default;
	const _substrate = require('./substrate');
	
	exchange = _ex;
	ledger = _ledger;
	nfts = _nfts;
	user = _user;
	vote_pool = _vp;

	_encodeParameters = (...args: any[])=>_substrate.encodeParameters(...args);
	_initialize = ()=>_substrate.default.initialize();
} else {

	const _ex = require('./web3/exchange').default;
	const _ledger = require('./web3/ledger').default;
	const _nfts = require('./web3/nfts').default;
	const _user = require('./web3/user').default;
	const _vp = require('./web3/vote_pool').default;
	const _web3 = require('./web3');
	
	exchange = _ex;
	ledger = _ledger;
	nfts = _nfts;
	user = _user;
	vote_pool = _vp;

	_encodeParameters = (...args: any[])=>_web3.encodeParameters(...args);
	_initialize = ()=>_web3.default.initialize();
}

export const encodeParameters = _encodeParameters;
export const initialize = _initialize;