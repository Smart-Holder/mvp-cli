import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../../src/components/icon_font';


export class Tab extends ViewController<{ nav: () => Nav }> {

	state = {
		current: 0
	}

	m_click_1 = () => {
		this.setState({ current: 0 });
		this.props.nav().replace('/home', false, 0);
	};
	m_click_2 = () => {
		this.setState({ current: 1 });
		this.props.nav().replace('/account', false, 0);
	};


	render() {
		// console.log(location.pathname, "this.props");
		let { current } = this.state;
		let style = { width: '.48rem', height: '.48rem' };
		return (
			<div className="_tools" >
				<div className="btn" onClick={this.m_click_1}>
					{(current === 0 && location.pathname.startsWith("/home")) ? <IconFont style={style} type="icon-miyuexuanzhong" /> : <IconFont style={style} type="icon-miyue" />}
					<div className={`txt ${(current === 0 && location.pathname.startsWith("/home")) && 'active'}`}>{("密钥")}</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					{(current === 1 || location.pathname.startsWith("/account")) ? <IconFont style={style} type="icon-wodexuanzhong" /> : <IconFont style={style} type="icon-wode" />}
					<div className={`txt ${(current === 1 || location.pathname.startsWith("/account")) && 'active'}`}>{("我的")}</div>
				</div>
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