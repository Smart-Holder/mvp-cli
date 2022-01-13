import sdk from '../sdk';
export function registerFromPhone(phone: string, key: string, verify: string,) {
	return sdk.user.methods.registerFromPhone({phone, key, verify});
}

export function sendPhoneVerify(phone: string) {
	return sdk.user.methods.sendPhoneVerify({ phone });
}

