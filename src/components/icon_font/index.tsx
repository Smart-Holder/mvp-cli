// import React from 'react';
import { React } from 'webpkit/mobile';
import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont'

const IconFontCN = createFromIconfontCN({
	// scriptUrl: '//at.alicdn.com/t/font_2717960_zvh1qlvpq7.js',
	//at.alicdn.com/t/font_2717960_4tyhyvdxrd.js
	scriptUrl: '//at.alicdn.com/t/font_2968355_h8wn0t41uhc.js'
});



const IconFont = (props: IconFontProps) => {
	return <IconFontCN {...props} />;
}

export default IconFont;