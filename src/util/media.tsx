
import { React } from 'webpkit/mobile';
import {NFT} from '../models';
import './media.scss';

export function renderNft(e?: NFT) {
	var uri = e?.media || e?.mediaOrigin;
	if (uri) {
		if (uri.match(/\.(mp4)/)) {
			return <div className="renderNft"><audio src={uri} /></div>
		} else {
			return <div className="renderNft"><img src={uri} /></div>
		}
	}
}