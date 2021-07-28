
import { React, NavPage, Root, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';

export default class extends ViewController<{page: NavPage; title: string; back?: boolean }> {

	private m_handleClick_1 = (e: any)=> {
		if (this.props.page) {
			this.props.page.popPage(true);
		}
	}

	render() {
		var nav = Root.current.refs.nav as Nav;
		return (
			<div className="_title">
				<div className="_a"></div>
				<div className="_b">
					{nav.length>1 || this.props.back?
					<div onClick={this.m_handleClick_1}></div>:null}{this.props.title || ''}
				</div>
				{this.props.children}
			</div>
		);
	}
}
