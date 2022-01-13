import { React } from 'webpkit/mobile';
import { Form, Input as AtInput } from "antd";
import { TextAreaProps } from "antd/lib/input/TextArea";
import { InputProps } from 'antd/lib/input';
import { FormItemProps } from 'antd/lib/form';
import { omit } from '../../util/tools';

const { Item } = Form;

type IinputTypeProps = 'input' | 'textarea' | 'password';

interface IInputProps extends InputProps {
	formItemConfig?: FormItemProps;
	textArea?: boolean;
	textAreaConfig?: TextAreaProps;
	inputType?: IinputTypeProps
}

const Input = (props: IInputProps) => {
	let { textArea, textAreaConfig, inputType } = props;
	const inputConfig = {
		'input': <AtInput {...omit(props, ["formItemConfig", "textarea"])} />,
		'textarea': <AtInput.TextArea {...textAreaConfig} {...omit(props, ["textarea", "formItemConfig"])} />,
		'password': <AtInput.Password {...textAreaConfig} {...omit(props, ["textarea", "formItemConfig"])} />,
	}
	// const atInput = textArea ? <AtInput.TextArea {...textAreaConfig} {...omit(props, ["textarea", "formItemConfig"])} /> : <AtInput {...omit(props, ["formItemConfig", "textarea"])} />;
	const atInput = inputConfig[inputType || 'input'];

	if (!props.formItemConfig) return atInput;

	let rules = props.formItemConfig?.rules || [];

	return (
		<Item {...props.formItemConfig} rules={[{ required: props.formItemConfig.required, message: props.placeholder }, ...rules]}>
			{atInput}
		</Item>
	);
};

export default Input;
