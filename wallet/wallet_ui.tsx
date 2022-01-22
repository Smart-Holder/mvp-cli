import { RpcCallback, Transaction, WalletManagerAbstract, WalletUser } from "./wallet";
import { JsonRpcPayload } from 'web3-core-helpers';
import { Signature, providers } from 'web3z';
import { RLPEncodedTransaction } from 'web3-core';
import { DeviceSigner, getDeviceFormAddress } from '../src/models/device';
import somes from 'somes';
import native from "./util/prefix_native";
import buffer, { IBuffer } from 'somes/buffer';
import * as config from "../config";
import { decryptPrivateKey } from "../deps/webpkit/deps/crypto-tx/keystore";
import { Modal } from 'antd-mobile';
import { React } from 'webpkit/mobile';
import IconFont from "../src/components/icon_font";
import Button from "../src/components/button";
import { chainTraits } from "../src/models";
import { unitLabel } from "../src/util/tools";
import chain from "../src/chain";
import "./util/wallet_ui.scss";
import { bSNGasTap, setRef } from "./user";

var cryptoTx = require('crypto-tx');

const { alert, prompt } = Modal;

export interface ISecretKey {
	readonly address: string;
	// readonly address: string;
	readonly keystore: any;
	unlock(pwd?: string): Promise<IBuffer>;
	sign(message: IBuffer): Promise<Signature>;
}

export class SecretKey implements ISecretKey {
	readonly address: string;
	readonly keystore: any;

	private _key?: IBuffer;

	constructor(keystore: any) {
		this.keystore = keystore;
		this.address = cryptoTx.checksumAddress('0x' + keystore.address);
	}

	async inputPasswordModal(): Promise<string> {
		return new Promise((resolve, reject) => {
			prompt(
				'请输入密钥解锁密码',
				'',
				[
					{ text: '取消', onPress: () => reject({ message: '取消输入密码', errno: -1 }) },
					{ text: '提交', onPress: password => resolve(password) },
				],
				'secure-text',
			)
		});
	}

	async unlock() {
		if (!this._key) {
			let pwd = await this.inputPasswordModal();
			let priv = new Buffer('');
			try {
				priv = decryptPrivateKey(this.keystore, pwd);
			} catch (error) {
				throw Error('密钥密码输入错误!')
			}
			this._key = buffer.from(priv);
			return this._key;
			// TODO ...
		}
		// buffer.from('', 'hex')
		return this._key as IBuffer;
	}

	async sign(message: IBuffer): Promise<Signature> {
		var priv = await this.unlock();
		var signature = cryptoTx.sign(message, priv);
		return signature;
	}

}


export class UIWalletManager extends WalletManagerAbstract implements DeviceSigner {

	private _accounts?: Dict<ISecretKey>;
	private _currentKey?: ISecretKey; // 当前选择的钱包

	provider = new providers.HttpProvider(localStorage.getItem('currNetwork') || config.defaultNetwork);
	// https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
	// https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13
	onSend(payload: JsonRpcPayload, callback: RpcCallback, user?: WalletUser): void {
		this.provider.send(payload, callback);
	}

	async setProvider(ctr_network?: string) {
		// let network = await storage.get('currNetwork');
		let network = localStorage.getItem('currNetwork');
		this.provider = new providers.HttpProvider(ctr_network || network || config.defaultNetwork);
	}

	setAccounts(new_account: Dict<ISecretKey> | undefined) {
		this._accounts = new_account
	}

	async currentKey() {
		await this.keys();
		// let currkey = await this.selectCurrentKey();
		// if (currkey) this._currentKey = currkey;
		somes.assert(this._currentKey, 'No wallet available');
		return this._currentKey as ISecretKey;
	}

	async setCurrentKey(keyName: string) {
		var json = await native.getKey(keyName);
		var keystore = JSON.parse(String(json));
		var key = '0x' + keystore.address === this._currentKey?.address ? this._currentKey : new SecretKey(keystore);
		// var key = new SecretKey(keystore);
		await setRef(key.address);
		this._currentKey = key; // The first wallet is selected by default
	}

	async clearCurrentKey() {
		this._currentKey = undefined;
	}

	// async selectCurrentKey(): Promise<string> {
	// 	var keysName = await native.getKeysName() || [];
	// 	let index = '';
	// 	return new Promise((resolve) => {
	// 		let alertInstance = alert('选择管理密钥', <div className="select_wallet_box">
	// 			{keysName.map(key => {
	// 				return <Button key={key} className="wallet_item" onClick={async () => {
	// 					// alertInstance.close();
	// 					// resolve(key);
	// 					index = key;
	// 				}}>
	// 					<IconFont type="icon-qianbao" style={{width:'.34rem',height:'.34rem'}} />
	// 					<div className="name">{key}</div>
	// 					<div>index {index} </div>
	// 				</Button>
	// 			})}
	// 		</div>, [
	// 			{ text: '取消', onPress: () => resolve('') },
	// 		]);
	// 	});
	// }

	// ---------------------------------- impl DeviceSigner ----------------------------------
	async availableOwner() {
		var key = await this.currentKey();
		return key.address;
	}

	async availablePublicKey() {
		var key = await this.currentKey();
		// 标准 keystore 在解密前只能取到地址,如果设备端验签必须要publicKey,那就只能在存keystore时把publicKey也存起来
		// 但是这样会脱离 keystore 的标准，最好还是在设备端支持 address 验签
		return key.address;
	}

	async signFrom(target: string, msg: IBuffer): Promise<Signature> {
		var device = await getDeviceFormAddress(target);
		if (device && device.owner ) {
			var key = await this.keyFrom(device.owner);
		} else {
			var key = await this.currentKey();
		}
		var sign = await key.sign(msg);
		return sign;
	}
	// ---------------------------------- impl DeviceSigner end ----------------------------------

	async keys() {
		if (!this._accounts) {
			this._accounts = {};
			var keysName = await native.getKeysName() || [];
			for (var name of keysName) {
				var json = await native.getKey(name);
				if (json) {
					try {
						var keystore = JSON.parse(json);

						var key = new SecretKey(keystore);
						this._accounts[name] = key;
						if (!this._currentKey) {
							this._currentKey = key; // The first wallet is selected by default
						}
					} catch (err) { }
				}
			}
		}
		return { ...this._accounts };
	}

	async addKey(name: string, key: ISecretKey) {
		await this.keys();
		await native.setKey(name, JSON.stringify(key.keystore));
		(this._accounts as any)[name] = key;
	}

	async getKey(name: string): Promise<ISecretKey | null> {
		var acc = (await this.keys())[name];
		return acc || null;
	}

	async setKey(name: string, key: ISecretKey) {
		this.addKey(name, key);
	}

	async keyFrom(address: string) {
		address = cryptoTx.checksumAddress(address);
		var keys = await this.keys();
		let oldKey;
		// 记住用户输入密码
		if (this._currentKey && (this._currentKey?.address == address)) oldKey = this._currentKey;
		var key = Object.values(keys).find(e => e.address == address);
		if (!key)
			throw Error.new('与当前设备绑定的钱包不存在');
		return oldKey || key;
	}

	async onAccounts(user?: WalletUser): Promise<string[]> {
		var key = Object.values(await this.keys()).filter(e => e !== this._currentKey);
		if (this._currentKey)
			key.unshift(this._currentKey);
		return key.map(e => e.address);
	}

	async onSign(user: WalletUser, text: string, hash: IBuffer, from: string, pwd?: string): Promise<string> {
		var key = await this.keyFrom(from);
		// TODO ...
		var isAgree = true;
		if (!isAgree) {
			throw Error.new('reject sign');
		}

		var signature = await key.sign(hash);

		return buffer.concat([signature.signature, [signature.recovery]]).toString('hex');
	}

	async onSignTransaction(user: WalletUser, tx: Transaction): Promise<RLPEncodedTransaction | any> {
		try {
			var from = tx.from;

			let balance = Number(await this.getBalance(from)) / Math.pow(10, 18);
			if (!balance) await bSNGasTap(from);

			var key = await this.keyFrom(from);
			var getSignature = async (message: IBuffer) => await key.sign(message);

			// TODO ...

			var isAgree = true;
			if (!isAgree) {
				throw Error.new('reject sign or send transaction');
			}

			var signTx = await this.signTx({
				async sign(message: IBuffer): Promise<Signature> {
					return getSignature(message);
				}
			}, tx);

			tx = await this.getUserTx(tx);
			console.log(tx, "tx");


			return UIWalletManager.getRLPEncodedTransaction(tx, signTx);
		} catch (error: any) {
			// if (error.errno == -30000) throw new Error('.');
			let e = new Error(error);
			if (error.errno) e = error;
			throw e;
			// dialogAlert(error.message);
		}
	}

	async getUserTx(tx: Transaction): Promise<Transaction> {
		let { from, to, gas, gasPrice, value } = tx;
		let keysName = await native.getKeysName() || [];

		let unit = (chainTraits as any)[unitLabel[String(chain.chain)]][2]
		let walletName = keysName.find((key) => {
			if (this._accounts) {
				var json = (this._accounts)[key];
				return json.address?.toUpperCase() == from?.toUpperCase();
			}
		});



		return new Promise((resolve, reject) => {
			let alertinterfas = alert('等待中', <div>
				<Modal
					title="交易详情"
					popup
					visible={true}
					animationType="slide-up"
					closable
					bodyStyle={{ paddingBottom: '2rem' }}
					onClose={() => { alertinterfas.close(); reject({ message: '已取消支付', errno: -90002 }); }}
				>
					<div className="detail_box">

						<div className="value_box">
							{Number(value)} {unit}
						</div>

						<div className="label_item">
							<div className="label">付款地址</div>
							<div className="value">
								<div className="title">{from}</div>
								<div className="sub_title">({walletName})</div>
							</div>
						</div>

						<div className="label_item">
							<div className="label">转入地址</div>
							<div className="value">{to}</div>
						</div>

						<div className="label_item">
							<div className="label">操作费用</div>
							<div className="value">
								<div className="title"> {(Number(gas) * Number(gasPrice)) / Math.pow(10, 18)} {unit}</div>
								<div className="sub_title">≈ Gas({Number(gas)})*Gas Price({Number(gasPrice) / Math.pow(10, 9)}Gwei)</div>
							</div>
						</div>

						<Button className="pay_btn" type="primary" onClick={() => {
							alertinterfas.close();
							resolve(tx);
						}}>确认支付</Button>
					</div>
				</Modal>
			</div>, []);
		});
	}

}

export default new UIWalletManager();