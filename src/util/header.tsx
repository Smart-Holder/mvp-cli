
import { React, NavPage, Root, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import native from '../../wallet/util/prefix_native';

export default class extends ViewController<{ page: NavPage; title: string; back?: boolean, actionBtn?: JSX.Element ,hiddenBtn?:boolean}> {
	state = {
		height:0
}

	private m_handleClick_1 = (e: any) => {
		if (this.props.page) {
			this.props.page.popPage();
		}
	}

	async triggerLoad() {
		try {
			
			let height = await native.getStatusBarHeight();
			this.setState({ height });
		} catch (error) {
			alert(error)
		}
	// console.log(height);
	}

	render() {
		var nav = Root.current.refs.nav as Nav;
		let { actionBtn, hiddenBtn} = this.props;
		let { height } = this.state;
		// console.log(this.props.page, nav.length, this.props.back, "this.props.page");
		return (
			<div className="_title" style={height ? { marginTop: height + 'px'}:{}}>
				{/* <div className="_a"></div> */}
				{/* <div className="status_bar_box" style={{}}></div> */}
				<div className="title_box">

					<div className="_b">
						{(nav.length > 1 || this.props.back) && !hiddenBtn ?
							<div style={nav.length > 1 || this.props.back ? { display: "block" } : { visibility: 'hidden', display: "block" }} onClick={this.m_handleClick_1}></div> : <span></span>}{this.props.title || ''}
						<span></span>
					</div>
					{this.props.children}
					{actionBtn}
				</div>

			</div>
		);
	}
}
