import React from "react";
import { utils } from "utils";

export const FormContext = React.createContext<FormContextType | null>(null);

export const Form: React.FC<FormProps> = ({ onChange, onSubmit, children, values = {} }) =>
{
	const [state, setState] = React.useState<FormState>(values);

	const ctx: FormContextType = {
		onChange: (name, val) => 
		{
			setState({ ...state, [name]: val });
			onChange && onChange(name, val);
		},
		getValue: (name) => state[name] || "",
		submit: () => onSubmit && onSubmit(state)
	};

	React.useEffect(() => 
	{
		if(!utils.objectEquals(values, state))
			setState(values);
	}, [values]);

	return (
		<form onSubmit={utils.react.stopEvents} action="#">
			<FormContext.Provider value={ctx}>
				{children}
			</FormContext.Provider>
		</form>
	);
}

export type FormState = {
	[key: string]: string;
};

type FormProps = {
	onChange?: (name: string, value: string) => void;
	onSubmit?: (values: FormState) => void;
	values?: FormState;
};

type FormContextType = {
	onChange: (name: string, value: string) => void;
	getValue: (name: string) => string;
	submit: () => void;
};
