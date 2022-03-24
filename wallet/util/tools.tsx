import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../../src/components/icon_font';
import native from "./prefix_native";
import { Modal } from 'antd-mobile';

const { prompt } = Modal;

const TabBarItemConfig = [
	{ text: '密钥', pathname: '/home', selectIcon: 'icon-miyuexuanzhong', icon: 'icon-miyue', current: 0 },
	{ text: '设备', pathname: '/device', selectIcon: 'icon-shebeixuanzhong', icon: 'icon-shebei', current: 2 },
	{ text: '我的', pathname: '/account', selectIcon: 'icon-wodexuanzhong', icon: 'icon-wode', current: 1 },
]


export class Tab extends ViewController<{ nav: () => Nav }> {

	state = {
		current: 0,
		bottom: 10
	}

	m_click(pathname: string, current: number) {
		this.setState({ current });
		this.props.nav().replace(pathname, false, 0);

	}

	async triggerLoad() {
		let data = await native.getBottomStatusHeight();
		// let mainEle = document.querySelector('._main > div');
		setTimeout(() => {
			let mainEle = document.querySelector('._main > div');
			data && (mainEle?.setAttribute('style', `padding-bottom:${data ? (52 + data) + 'px' : '52px'}`))
			console.log(mainEle, "mainEle", data, window.devicePixelRatio);
		}, 1000);
		this.setState({ bottom: data });
	}

	render() {
		// console.log(location.pathname, "this.props");
		let { current, bottom } = this.state;
		let style = { width: '.48rem', height: '.48rem' };
		return (
			<div className="_tools" style={{ paddingBottom: (bottom || 10) + 'px' }}>
				{TabBarItemConfig.map(item => {
					return <div className="btn" onClick={this.m_click.bind(this, item.pathname, item.current)}>
						{(current === item.current && location.pathname.startsWith(item.pathname)) ? <IconFont style={style} type={item.selectIcon} /> : <IconFont style={style} type={item.icon} />}
						<div className={`txt ${(current === item.current && location.pathname.startsWith(item.pathname)) && 'active'}`}>{item.text}</div>
					</div>
				})}

			</div>
		);
	}
}

// 验证手机号正则
export const verificationPhone = (str: string) => {
	return /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(str);
};

// 获取路由中的参数
export const getParams = (url: string) => {
	var temp1 = url.split('?');
	var pram = temp1[1];
	var keyValue = pram.split('&');
	var obj: { [key: string]: string } = {};
	for (var i = 0; i < keyValue.length; i++) {
		var item = keyValue[i].split('=');
		var key = item[0];
		var value = item[1];
		obj[key] = value;
	}
	return obj;
}

// async inputPasswordModal(): Promise < string > {
// 	return new Promise((resolve, reject) => {
// 		prompt(
// 			'请输入密钥解锁密码',
// 			'',
// 			[
// 				{ text: '取消', onPress: () => reject({ message: '取消输入密码', errno: -1 }) },
// 				{ text: '提交', onPress: password => resolve(password) },
// 			],
// 			'secure-text',
// 		)
// 	});
// }

export const inputPasswordModal = async () => {
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