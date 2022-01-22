import native from '../native';
import { loginState } from '../user';

class PrefixNative {

	async getStatusBarHeight() {
		return await native.getStatusBarHeight();
	}

	async scan(): Promise<string> {
		return await native.scan();
	}

	private _Prefix = 'nativeapi_' + loginState.name + '_';

	private _Key(name: string) {
		return this._Prefix + name;
	}

	async getKey(id: string) {
		let value = await native.getKey(this._Key(id));
		return value;
	}

	async setKey(id: string,value:string) {
		await native.setKey(this._Key(id), value);
	}

	async deleteKey(id: string) {
		await native.deleteKey(this._Key(id));
	}


	async getKeysName(): Promise<string[]> {
		var keys: string[] = [];
		let keyArr = await native.getKeysName();
		for (var key in keyArr) {
			if (key.substring(0, this._Prefix.length) == this._Prefix) {
				keys.push(key.substring(this._Prefix.length));
			}
		}
		return keys;
	}
}

export default new PrefixNative();