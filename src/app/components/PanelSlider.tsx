import { View } from "app/views";
import React from "react";
import { utils } from "utils";

import "./styles/panel-slider.scss";

export const PanelSlider: React.FC<PanelSliderProps> = ({ popBarier = 5, position, base, onChange = () => { }, min = 0, max = Infinity, }) =>
{
	const mouseDown = React.useRef<number | null>(null);
	const startBase = React.useRef<number>(base);
	const isHidden = React.useRef<boolean>(base < min + popBarier);

	React.useEffect(() => 
	{
		const onMouseUp = () => 
		{
			if (mouseDown)
			{
				mouseDown.current = null;
				document.body.style.cursor = "unset";
			}
		};

		const onMouseMove = (e: MouseEvent) => 
		{
			if (mouseDown.current)
			{
				let n = startBase.current;
				switch (position)
				{
					case "bottom":
						n = startBase.current + e.clientY - mouseDown.current;
						break;
					case "top":
						n = startBase.current + mouseDown.current - e.clientY;
						break;
					case "left":
						n = startBase.current + mouseDown.current - e.clientX;
						break;
					case "bottom":
						n = startBase.current + e.clientX - mouseDown.current;
						break;
				}
				if (n > max)
				{
					n = max;
				}
				else if (isHidden.current && (n > ((popBarier / 2) + min)))
				{
					isHidden.current = false;
					n = popBarier + min;
				}
				else if(!isHidden.current)
				{
					if(n < ((popBarier / 2) + min))
					{
						isHidden.current = true;
						n = min;
					}
					else if(n < (popBarier + min))
					{
						n = min + popBarier;	
					}
				}

				if(isHidden.current)
					n = min;
					
				onChange(n);
			}
		};

		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);

		return () =>
		{
			window.removeEventListener("mouseup", onMouseUp);

			window.removeEventListener("mousemove", onMouseMove);
		}
	}, []);

	const onMouseDown = (e: React.MouseEvent) =>
	{
		if (position === "bottom" || position === "top")
		{
			mouseDown.current = e.clientY;
			document.body.style.cursor = "ns-resize";
		}
		else
		{
			mouseDown.current = e.clientX;
			document.body.style.cursor = "ew-resize";
		}
		startBase.current = base;
	}

	return (
		<View
			theme="custom"
			position="absolute"
			className={utils.react.getClassFromProps("panel-slider", { [position]: true })}
			onMouseDown={onMouseDown}
		/>
	);
};

type PanelSliderProps = {
	position: "left" | "right" | "top" | "bottom";
	onChange?: (offset: number) => void;
	base: number;
	max?: number;
	min?: number;
	popBarier?: number;
};
