
import { React, NavPage, Root, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../components/icon_font';

export default class extends ViewController<{ page: NavPage; title: string; back?: boolean, actionBtn?: JSX.Element }> {

	private m_handleClick_1 = (e: any) => {
		if (this.props.page) {
			this.props.page.popPage(true);
		}
	}

	render() {
		var nav = Root.current.refs.nav as Nav;
		let { actionBtn } = this.props;
		// console.log(this.props.page, nav.length, this.props.back, "this.props.page");
		return (
			<div className="_title">
				{/* <div className="_a"></div> */}
				<div className="title_box">

					{/* <div className="_b"> */}
					{nav.length > 1 || this.props.back ?
						// <div className='back_icon' style={nav.length > 1 || this.props.back ? { display: "block" } : {}} onClick={this.m_handleClick_1}></div>
						// <IconFont className='back_icon' type="icon-houtui" />
						<img onClick={this.m_handleClick_1} className='back_icon' src={require('../assets/back.png')} />
						: null}
					<div className="text">
						{this.props.title || ''}
					</div>
					{/* </div> */}
					{this.props.children}
					{actionBtn}
				</div>

			</div>
		);
	}
}
