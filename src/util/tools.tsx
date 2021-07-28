
import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';

export default class extends ViewController<{ nav: ()=>Nav }> {

	m_click_1 = ()=>{
		this.props.nav().replace('/', false, 0);
	};
	m_click_2 = ()=>{
		this.props.nav().replace('/device', false, 0);
	};

	render() {
		return (
			<div className="_tools">
				<div className="btn" onClick={this.m_click_1}>
					<div className="icon a"></div>
					<div className="txt">NFT</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					<div className="icon b"></div>
					<div className="txt">设备</div>
				</div>
			</div>
		);
	}
}
