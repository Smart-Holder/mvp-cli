
// import somes from 'somes';
import { NavPage as NavPageBase } from 'webpkit/mobile';
import native from '../wallet/util/prefix_native';

class NavPage<P = {}> extends NavPageBase<P> {

	protected title: string = '';

	// t(s: string): any {
	// 	if (!this) return s;

	// 	return (this.props as any).t(s) as string;
	// }

	t = (this.props as any).t;

	// async triggerLoad() {
		// console.log(this.props.priv.m_status = 666, '');

	// }

	triggerShow(data: { active?: 'init', [key: string]: any } = {}) {
		// document.title = this.title;
		
	}

}

export default NavPage;
