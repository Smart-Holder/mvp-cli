
// import somes from 'somes';
import { NavPage as NavPageBase } from 'webpkit/mobile';

export default class NavPage<P = {}> extends NavPageBase<P> {

	protected title: string = '';

	t(s: string): any {
		return (this.props as any).t(s) as string;
	}

	triggerShow(data: { active?: 'init', [key: string]: any } = {}) {
		// document.title = this.title;
	}

}