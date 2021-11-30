import { useState } from "react";
import { Button as AtButton, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, SearchOutlined } from "@ant-design/icons";
import { React } from 'webpkit/mobile';
import { ButtonProps } from "antd/lib/button";

import "./index.scss";

interface IBottomBtnProps extends ButtonProps {
	onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	btn_text?: string;
	children?: JSX.Element | string | {} | null;
	className?: string;
	ghost?: boolean; // 是否幽灵👻样式
	disabled?: boolean;
	notLoading?: boolean;
	btnType?: "edit" | "delete" | "lock" | "unlock" | "info";
}

const btnIcon = {
	edit: <EditOutlined />,
	delete: <DeleteOutlined />,
	lock: <LockOutlined />,
	unlock: <UnlockOutlined />,
	info: <SearchOutlined />,
};

const Button = (props: IBottomBtnProps) => {
	let { onClick, children, className, ghost, disabled = false, btnType, notLoading = false, ...rest } = props;

	const [loading, setloading] = useState<boolean>(false);

	const btnClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		if (loading) return false;
		!notLoading && setloading(true);
		try {
			await (onClick && onClick(e));
		} catch (error) {
			console.log(error, "error");
		}
		setloading(false);
	};

	const button = (
		<AtButton type={btnType ? "primary" : props.type} disabled={loading || disabled} loading={loading} className={`button_btn ${className} ${btnType}`} onClick={btnClick} {...rest}>
			{(btnType && btnIcon[btnType]) || children}
		</AtButton>
	);

	if (btnType) {
		return <Tooltip title={children}>{button}</Tooltip>;
	}
	return button;
};

export default Button;
