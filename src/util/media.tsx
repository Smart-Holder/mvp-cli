
import { React } from 'webpkit/mobile';
import {Asset} from '../models';
import './media.scss';

export function renderNft(e?: Asset, isFirstImg?: boolean) {
	var media = e?.media || e?.mediaOrigin;
	var img = e?.image || e?.imageOrigin;
	var uri = isFirstImg ? (img || media): media;
	if (uri) {
		if (uri.match(/\.(mp4)/)) {
			return <div className="renderNft"><video src={uri} controls={true} /></div>
		} else {
			return <div className="renderNft"><img src={uri} /></div>
		}
	}
}