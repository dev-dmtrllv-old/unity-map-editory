import React from "react";
import { WithReactProps } from ".";
import { utils } from "../../utils";
import { FormContext } from "./Form";

import "./styles/btn.scss";

export const Button: React.FC<WithReactProps<ButtonProps, HTMLButtonElement>> = ({ children, className, onClick, ...props }) => 
{
	const ctx = React.useContext(FormContext);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) =>
	{
		if(ctx && props.type === "submit")
			ctx.submit();

		onClick && onClick(e);
	}
	return <button onClick={handleClick} className={utils.react.getClassFromProps("btn", { className })} {...props}>{children}</button>;
};

type ButtonProps = {
	type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
	name?: string;
};
