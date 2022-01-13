
import somes from 'somes';

export abstract class NativeAPI {
	abstract scan(): Promise<string>;
	abstract getKeysName(): Promise<string[]>;
	abstract getKey(name: string): Promise<string|undefined>;
	abstract setKey(name: string, value: any): Promise<void>;
	abstract deleteKey(name: string): Promise<void>;
}

class DefaultAPI extends NativeAPI {

	private _Prefix = 'nativeapi_';

	private _Key(name: string) {
		return this._Prefix + name;
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

	async getKey(name: string): Promise<string|undefined> {
		return localStorage[this._Key(name)];
	}

	async setKey(name: string, value: string): Promise<void> {
		localStorage.setItem(this._Key(name), value);
	}

	async deleteKey(name: string): Promise<void> {
		localStorage.deleteItem(this._Key(name));
	}
}

abstract class APIIMPL extends NativeAPI {
	protected _Calls: Dict<{reject: (e: any)=>void, resolve:(e:any)=>void}> = {}

	protected callback(id: string, {error, data}: { error?: any, data?: any }) {
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

	protected call<T = any>(exec: (id: string)=>void) {
		return new Promise<T>((resolve, reject)=>{
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
	
	async scan(): Promise<string> {
		return this.call<string>((id: string)=>{
			this._webkit.messageHandlers.scan.postMessage({id, args:[]});
		});
	}

	async getKeysName(): Promise<string[]> {
		return this.call<string[]>((id: string)=>{
			this._webkit.messageHandlers.getKeysName.postMessage({id, args:[]});
		});
	}

	async getKey(name: string): Promise<string|undefined> {
		return this.call<string|undefined>((id: string)=>{
			this._webkit.messageHandlers.getKey.postMessage({id, args:[name]});
		});
	}

	async setKey(name: string, value: any): Promise<void> {
		return this.call<void>((id: string)=>{
			this._webkit.messageHandlers.setKey.postMessage({id, args:[name, value]});
		});
	}

	async deleteKey(name: string): Promise<void> {
		return this.call<void>((id: string)=>{
			this._webkit.messageHandlers.setKey.deleteKey({id, args:[name]});
		});
	}
}

class AndroidAPI extends APIIMPL {

	async scan(): Promise<string> {
		return '';
	}

	async getKeysName(): Promise<string[]> {
		return [];
	}

	async getKey(name: string): Promise<string|undefined> {
		// TODO ...
		return '';
	}

	async setKey(name: string, value: any): Promise<void> {
		// TODO ...
	}

	async deleteKey(name: string): Promise<void> {
		// TODO ...
	}
}

const _api = 
	somes.webFlags?.ios ? new IOSAPI(): 
	somes.webFlags?.android ? new AndroidAPI(): new DefaultAPI();

(globalThis as any).__jsapi = _api;

export default _api;