import { DialogStore } from "app/stores/DialogStore";
import { RootStore } from "app/stores/RootStore";
import { FlexBox, FlexItem, View } from "app/views";
import { observer } from "mobx-react";
import React from "react";
import { utils } from "utils";

import "./styles/dialog.scss";

export const dialogComponent = <Props extends {}>(component: React.FC<Props & { dialog: DialogStore }>) =>
{
	const Component = observer(component);
	return (props: Props) => <Component {...props} dialog={RootStore.get(DialogStore)}/>
};

const DialogCloseBtn: React.FC<DialogCloseBtnProps> = ({ onClick }) => (
	<View className="close-btn" position="absolute" onClick={() => onClick()}>
		<View position="absolute" center className="cross" />
	</View>
);

const clickHandler = (store: DialogStore) => (e: React.MouseEvent) =>
{
	const t = e.nativeEvent.target as HTMLElement;
	if(t && ("classList" in t) && t.classList.contains("dialog-wrapper"))
		store.close();
}

export const Dialog = RootStore.use(DialogStore, ({ store }) =>
{
	return (
		<View position="absolute" theme="custom" fill className={utils.react.getClassFromProps("dialog-wrapper", { open: store.isOpen })} onClick={clickHandler(store)}>
			<View position="absolute" theme="primary" center className="dialog" style={store.style}>
				<FlexBox dir="vertical" fill>
					<FlexItem className="top-bar" base={64}>
						<h1 className="title">
							{store.title}
						</h1>
						{store.options.closable && <DialogCloseBtn onClick={store.close} />}
					</FlexItem>
					<FlexItem className="body">
						{store.body}
					</FlexItem>
				</FlexBox>
			</View>
		</View>
	);
});

export type DialogProps = {

};

type DialogCloseBtnProps = {
	onClick: () => void;
};
