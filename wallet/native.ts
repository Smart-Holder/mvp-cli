
import somes from 'somes';

export abstract class NativeAPI {
	abstract getStatusBarHeight(): Promise<number>;
	abstract getBottomStatusHeight(): Promise<number>;
	abstract scan(): Promise<string>;
	abstract getKeysName(): Promise<string[]>;
	abstract getKey(name: string): Promise<string | undefined>;
	abstract setKey(name: string, value: any): Promise<void>;
	abstract isSafeKeysStore(): Promise<boolean>;
}

class DefaultAPI extends NativeAPI {

	private _Prefix = 'nativeapi_';

	private _Key(name: string) {
		return this._Prefix + name;
	}

	async getStatusBarHeight() {
		return 0;
	}

	async getBottomStatusHeight() {
		return 0;
	}

	async scan(): Promise<string> {
		return '';
	}

	async getKeysName(): Promise<string[]> {
		var keys: string[] = [];
		for (var key in localStorage) {
			if (key.substring(0, this._Prefix.length) == this._Prefix) {
				keys.push(key.substring(this._Prefix.length));
			}
		}
		return keys;
	}

	async getKey(name: string): Promise<string | undefined> {
		return localStorage[this._Key(name)];
	}

	async setKey(name: string, value: string): Promise<void> {
		localStorage.setItem(this._Key(name), value);
	}

	async deleteKey(name: string): Promise<void> {
		localStorage.removeItem(this._Key(name));
	}

	async isSafeKeysStore() {
		return false;
	}
}

abstract class APIIMPL extends NativeAPI {
	protected _Calls: Dict<{ reject: (e: any) => void, resolve: (e: any) => void }> = {}

	protected callback(id: string, { error, data }: { error?: any, data?: any }) {
		var promise = this._Calls[id];
		if (promise) {
			delete this._Calls[id];
			if (error) {
				promise.reject(error);
			} else {
				promise.resolve(data);
			}
		}
	}

	protected call<T = any>(exec: (id: string) => void) {
		return new Promise<T>((resolve, reject) => {
			var id = String(somes.getId());
			this._Calls[id] = {
				resolve, reject,
			};
			exec(id);
		});
	}
}

class IOSAPI extends APIIMPL {
	private _webkit = (window as any).webkit;

	getStatusBarHeight(): Promise<number> {
		return this.call<number>((id: string) => {
			this._webkit.messageHandlers.getStatusBarHeight.postMessage({ id, args: [] });
		});
	}

	async getBottomStatusHeight() {
		// TODO ...
		return 0;
	}

	scan(): Promise<string> {
		return this.call<string>((id: string) => {
			this._webkit.messageHandlers.scan.postMessage({ id, args: [] });
		});
	}

	getKeysName(): Promise<string[]> {
		return this.call<string[]>((id: string) => {
			this._webkit.messageHandlers.getKeysName.postMessage({ id, args: [] });
		});
	}

	getKey(name: string): Promise<string | undefined> {
		return this.call<string | undefined>((id: string) => {
			this._webkit.messageHandlers.getKey.postMessage({ id, args: [name] });
		});
	}

	setKey(name: string, value: any): Promise<void> {
		return this.call<void>((id: string) => {
			this._webkit.messageHandlers.setKey.postMessage({ id, args: [name, value] });
		});
	}

	deleteKey(name: string): Promise<void> {
		return this.call<void>((id: string) => {
			this._webkit.messageHandlers.deleteKey.postMessage({ id, args: [name] });
		});
	}

	async isSafeKeysStore(): Promise<boolean> {
		return true;
	}
}

class AndroidAPI extends APIIMPL {

	private _api: any = (globalThis as any).__android_api;

	async getStatusBarHeight(): Promise<number> {
		return this._api.getStatusBarHeight() / window.devicePixelRatio;
	}

	async getBottomStatusHeight(): Promise<number> {
		return this._api.getBottomStatusHeight() / window.devicePixelRatio;
	}
	
	scan(): Promise<string> {
		return this.call<string>((id: string) => {
			this._api.scan(id);
		});
	}

	async getKeysName(isCheck?:boolean): Promise<string[]> {
		var json = this._api.getKeysName(isCheck);
		var keys = JSON.parse(json);
		return keys;
	}

	async getKey(name: string, isUnCheck?:boolean): Promise<string | undefined> {
		return this._api.getKey(name, isUnCheck);
	}

	async setKey(name: string, value: any): Promise<void> {
		this._api.setKey(name, value);
	}

	async deleteKey(name: string): Promise<void> {
		return this._api.deleteKey(name);
	}

	async isSafeKeysStore(): Promise<boolean> {
		return this._api.isSafeKeysStore();
	}

}

const _api =
	somes.webFlags?.ios ? new IOSAPI() :
		somes.webFlags?.android ? new AndroidAPI() : new DefaultAPI();

(globalThis as any).__jsapi = _api;

export default _api;