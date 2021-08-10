
import { React } from 'webpkit/mobile';
import {NFTPlus} from '../models';

export function renderNft(e: NFTPlus) {
	var uri = e.uri;
	if (uri.match(/\.(mp4)/)) {
		return <audio src={uri} />
	} else {
		return <img src={uri} />
	}
}