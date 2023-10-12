
import sdk from '../sdk';

import {AssetMy} from '../../deps/mvp-ser/src/models/def';

export * from '../../deps/mvp-ser/src/models/def';

export interface  NFT extends AssetMy  {
    thumbnail?: string;
};

export default sdk;