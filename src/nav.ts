
// import somes from 'somes';
import {NavPage as BavPageBase} from 'webpkit/mobile';

export default class extends BavPageBase {

	protected title: string = '';

	triggerShow(data: { active?: 'init', [key: string]: any } = {}) {
		// document.title = this.title;
	}

}