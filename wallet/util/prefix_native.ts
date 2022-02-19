import storage from 'somes/storage';
import native from '../native';

class PrefixNative {


	async getBottomStatusHeight() {
		return await native.getBottomStatusHeight();
	}

	async getStatusBarHeight() {
		return await native.getStatusBarHeight();
	}

	async scan(): Promise<string> {
		return await native.scan();
	}

	private _Prefix = 'nativeapi_';

	private async _Key(name: string) {
		let loginstate = await storage.get('loginState');
		return this._Prefix + loginstate.name + '_' + name;
	}

	async getKey(id: string) {
		let value = await native.getKey(await this._Key(id));
		return value;
	}

	async setKey(id: string, value: string) {
		await native.setKey(await this._Key(id), value);
	}

	async deleteKey(id: string) {
		await native.deleteKey(await this._Key(id));
	}


	async getKeysName(account_name?: string): Promise<string[]> {

		var keys: string[] = [];
		let keyArr = await native.getKeysName();
		let loginstate = await storage.get('loginState');
		let prefix = this._Prefix + (loginstate?.name || account_name) + '_';

		keyArr.forEach(key => {
			if (key.substring(0, prefix.length) == prefix) {
				keys.push(key.substring(prefix.length));
			}
		});
		return keys;
	}
}

export default new PrefixNative();