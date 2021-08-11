
import { React } from 'webpkit/mobile';
import {NFT} from '../models';

export function renderNft(e: NFT) {
	var uri = e.uri;
	if (uri.match(/\.(mp4)/)) {
		return <audio src={uri} />
	} else {
		return <img src={uri} />
	}
}