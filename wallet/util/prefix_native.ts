import storage from 'somes/storage';
import native from '../native';
import somes from 'somes';

class PrefixNative {

	private _api: any = somes.webFlags?.ios ? (window as any).webkit?.messageHandlers?.getStatusBarHeight : somes.webFlags?.android ? (globalThis as any).__android_api : localStorage ;

	async getBottomStatusHeight() {
		if (!this?._api) return 0;
		return await native.getBottomStatusHeight();
	}

	async getStatusBarHeight() {
		if (!this?._api) return 0;
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
		if (!this?._api) return [];
		var keys: string[] = [];
		let keyArr = native?.getKeysName ? await native.getKeysName() : [];
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