
import { Image } from 'antd';
import { ImageProps } from 'antd/lib/image';
import { React } from 'webpkit/mobile';
import { INftItem } from '../../pages/interface';
import { LoadingOutlined } from '@ant-design/icons';
import './index.scss';
interface IImageMogrProps extends ImageProps {
	nft?: INftItem
}
const ImageMogr = (props: IImageMogrProps) => {
	let { nft, ...rest } = props;
	return <Image preview={false} width='100%' src={(nft?.image || nft?.imageOrigin)} fallback={require('../../assets/img_error.jpg')} alt="" placeholder={
		<LoadingOutlined className="loading_icon" />
		// <Image
		// 	preview={false}
		// 	src={`${nft?.image || nft?.imageOrigin}?imageMogr2/thumbnail/!200x200r/blur/3x5`}
		// 	width='100%'
		// />
	} {...rest} />
}

export default ImageMogr;