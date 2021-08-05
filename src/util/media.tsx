
import { React } from 'webpkit/mobile';
import {NftPlus} from '../models';

export function renderNft(e: NftPlus) {
	var uri = e.uri;
	if (uri.match(/\.(mp4)/)) {
		return <audio src={uri} />
	} else {
		return <img src={uri} />
	}
}