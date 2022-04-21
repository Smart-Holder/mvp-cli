import * as React from "react"
import NavPage from "../../nav";
import "./index.scss";
interface IPrivacyArgeeBoxProps {
	page: NavPage;
	title?:string
}

export const PrivacyArgeeBox = (props: IPrivacyArgeeBoxProps) => {
	let { page, title } = props;
	return <span className="argee_text" onClick={() => page.pushPage('/agreement')} >{title || '“Hashii隐私协议”'}</span>
}

export const UserArgeeBox = (props: IPrivacyArgeeBoxProps) => {
	let { page, title } = props;
	return <span className="argee_text" onClick={() => page.pushPage('/agreement_user')} >{title || '“Hashii服务协议”'}</span>
}