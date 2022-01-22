// import React from 'react';
import { React } from 'webpkit/mobile';
import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont'
import "./index.scss";
const IconFontCN = createFromIconfontCN({
	// scriptUrl: '//at.alicdn.com/t/font_2717960_zvh1qlvpq7.js',
	//at.alicdn.com/t/font_2717960_4tyhyvdxrd.js
	scriptUrl: '//at.alicdn.com/t/font_2968355_afuzpm1hki.js'
});



const IconFont = (props: IconFontProps) => {
	return <IconFontCN className='my_icon' {...props}  />;
}

export default IconFont;