import { React } from 'webpkit/mobile';
import { Form as AtForm } from "antd";
import { FormInstance, FormItemProps, FormProps } from 'antd/lib/form';
import "./index.scss";

const { Item } = AtForm;

interface IFormProps {
	formItemConfig: IFormItemProps[];
	formConfig: IformConfigProps;
}

interface IformConfigProps extends FormProps {
	ref?: React.Ref<FormInstance> | [FormInstance<any>] | any;
}

interface IFormItemProps extends FormItemProps {
	// children: JSX.Element;
	content: JSX.Element;
	isShow?: boolean;
	// config: FormItemProps;
	// formItemType: "input" | "select";
}

const Form = (props: IFormProps) => {
	let { formConfig, formItemConfig } = props;

	return (
		<div className="form_box">
			<AtForm {...formConfig}>
				{formItemConfig.map(({ isShow = true, hasFeedback = true, content, ...rest }, index) => {
					// if (!(item as any).content) {
					// 	return <item></item>;
					// }
					if (!isShow) return false;
					return (
						<Item key={index} hasFeedback={Boolean(rest.rules?.length)} {...rest}>
							{content}
						</Item>
					);
				})}
			</AtForm>
		</div>
	);
};

export default Form;
