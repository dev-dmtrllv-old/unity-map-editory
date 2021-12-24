import { FlexBox, FlexItem, View } from "app/views";
import React from "react";
import { PanelSlider } from "./PanelSlider";
import { Editor } from "app/editor/Editor";
import { utils } from "utils";

import "./styles/bottom-panel.scss";

const TextureImg: React.FC<{ name: string, data: string, selected: boolean, onSelect: Function }> = ({ data, name, selected, onSelect }) =>
{
	return (
		<View className={utils.react.getClassFromProps("texture", { selected })} onMouseDown={() => onSelect()}>
			<View className="img" style={{ backgroundImage: `url("${data}")` }} />
			<View className="name">{name}</View>
		</View>
	);
}

export const BottomPanel = Editor.withStore(({ editor }) =>
{
	const [base, setBase] = React.useState(320);

	return (
		<FlexItem base={base}>
			<PanelSlider position="top" onChange={setBase} base={base} popBarier={15} />
			<FlexBox fill dir="vertical">
				<FlexItem base={24}>

				</FlexItem>
				<FlexItem className="bottom-panel" theme="secundary">
					{editor.projectTextures.map((t, i) => <TextureImg key={i} name={t.name} data={t.dataString || t.path} selected={editor.selectedTextureIndex === i} onSelect={() => editor.selectTexture(i)} />)}
				</FlexItem>
			</FlexBox>
		</FlexItem>
	);
});
