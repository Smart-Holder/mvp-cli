import InfiniteScroll from 'react-infinite-scroll-component';
import { React } from 'webpkit/mobile';
import { useState, useEffect } from 'react';
import { NFT } from '../../models';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chain from '../../chain';
import { Empty } from 'antd';
import { getNFTByOwnerPage, IGetNFTByOwnerPageProps } from '../../models/nft';
import { INftItem } from '../../pages/interface';
import { setNftActionLoading } from '../../util/tools';
import './index.scss';
interface INftListItemProps {
	// listItem: JSX.Element;
	renderItem: (item: NFT) => void;
	listType: 'chain' | 'other_chain';
	id?: string
	isRefresh?: boolean
	deviceAddress?: string;
}

const NftList = (props: INftListItemProps) => {
	let { renderItem, listType, id, isRefresh, deviceAddress } = props;
	const { t } = useTranslation();

	const [hasMore, sethasMore] = useState<boolean>(true);

	const [loading, setloading] = useState<boolean>(false);

	const [nftList, setnftList] = useState<NFT[]>([]);

	const [from, setfrom] = useState<string>('');

	const [page, setpage] = useState<number>(1);

	// const [isRefresh, setisRefresh] = useState(initialState);
	const loadMoreData = () => {
		let newPage = page + 1;
		setpage(newPage);
		getNFTList(newPage);
	}

	useEffect(() => {
		setnftList([]);
		sethasMore(true);
		setpage(1);
		getNFTList();
	}, [isRefresh]);

	// 获取nft列表
	const getNFTList = async (curPage?: number) => {
		setloading(true);

		let owner = deviceAddress || from || await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'

		curPage = curPage || 1;

		let params: IGetNFTByOwnerPageProps = { owner, curPage: curPage || 1, pageSize: 10 };
		params[listType] = chain.chain;

		let list: INftItem[] = await getNFTByOwnerPage(params);

		list = setNftActionLoading(list, "nftDisabledTime");

		let newNftList = [...(curPage != 1 ? nftList : []), ...list];
		setfrom(owner);
		setnftList(newNftList);
		setloading(false);
		if (!list.length) sethasMore(false);
	}

	let loader = <div className="bottom_box" > <LoadingOutlined className="loading_icon" /></div>;

	let endMessage = <div className="bottom_box">{t('已经是全部数据了')}</div>;

	return <div id={id || "scrollableDiv2"} className="scroll_box">
		<InfiniteScroll
			key={id || "scrollableDiv2"}
			dataLength={nftList.length}
			next={loadMoreData}
			hasMore={hasMore}
			loader={loader}
			endMessage={nftList.length ? endMessage : ''}
			scrollableTarget={id || "scrollableDiv2"}
		>
			{(nftList.length) ? nftList.map(item => renderItem(item)) : (!loading && <Empty style={{ marginTop: '30%' }} image={require('../../assets/empty_img.png')} description={t('暂无NFT，请添加NFT至钱包')} />)}
		</InfiniteScroll>
	</div>
}

export default NftList;