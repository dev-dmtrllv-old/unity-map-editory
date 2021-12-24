import { Editor } from "app/editor/Editor";
import { observer } from "mobx-react";
import React from "react";
import { utils } from "utils";
import { FlexBox, FlexItem, View } from "../views";

import "./styles/work-area.scss";

type MouseFunc = (e: React.MouseEvent) => void;

const Tab: React.FC<{ active: boolean, name: string, onSelect: MouseFunc, onClose: MouseFunc }> = ({ active, name, onSelect, onClose }) =>
{
	return (
		<View className={utils.react.getClassFromProps("tab", { active })} onClick={onSelect}>
			<View className="name">{name}</View>
			<View className="btn-close" onClick={onClose}></View>
		</View>
	);
}

export const WorkArea = observer(({ }) =>
{
	const editor = Editor.get();
	
	return (
		<View className="work-area" position="absolute" fill theme="primary">
			<FlexBox position="absolute" dir="vertical" fill>
				<FlexItem base={28}>
					<View className="tabs" position="absolute" fill theme="tertiary">
						{editor.openMapNames.map((name, i) => <Tab key={i} active={editor.activeMapName === name} name={name} onClose={editor.onClose(i)} onSelect={editor.onSelect(i)} />)}
					</View>
				</FlexItem>
				<FlexItem>
					<View position="absolute" fill>
						<canvas ref={editor.canvasRenderer.canvasRef} onMouseDown={editor.onMouseDown} onMouseEnter={editor.onMouseEnter}/>
					</View>
				</FlexItem>
			</FlexBox>
		</View>
	);
});
