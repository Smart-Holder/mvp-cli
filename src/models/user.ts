import sdk from '../sdk';

interface IRealNameAuthProps {
	verify: string;
	idCard: string;
	mobile: string;
	realName: string;
}

export function registerFromPhone(phone: string, key: string, verify: string,) {
	return sdk.user.methods.registerFromPhone({phone, key, verify});
}

export function sendPhoneVerify(phone: string) {
	return sdk.user.methods.sendPhoneVerify({ phone });
}

export function bSNGasTap(address: string) {
	return sdk.user.methods.bSNGasTap({ address });
}

export const realNameAuth = async (props: IRealNameAuthProps) => {
	return sdk.realname.methods.realNameAuth(props);
}

export const isRealName = async (mobile:string) => {
	return sdk.realname.methods.isRealName({ mobile });
}