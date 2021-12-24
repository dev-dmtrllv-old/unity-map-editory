import React from "react";
import { ipcRenderer } from "electron"
import { FlexBox, FlexItem, View } from "./views";
import { MenuBar } from "./components/MenuBar";
import { WorkArea } from "./components/WorkArea";
import { SideBar } from "./components/SideBar";
import { BottomPanel } from "./components/BottomPanel";
import { Editor } from "./editor/Editor";
import { Dialog } from "./components/Dialog";

const App = ({ }) =>
{
	const editor = Editor.get();
	
	React.useEffect(() => 
	{
		ipcRenderer.send("ready");
		
		editor.canvasRenderer.onMount();

		return () => 
		{
			editor.canvasRenderer.onUnmount();
		};
	}, []);

	return (
		<View position="absolute" fill theme="primary">
			<FlexBox position="absolute" fill dir="vertical" >
				<FlexItem base={24}>
					<MenuBar />
				</FlexItem>
				<FlexItem>
					<FlexBox position="absolute" fill dir="horizontal">
						<FlexItem>
							<FlexBox position="absolute" fill dir="vertical" >
								<FlexItem>
									<View position="absolute" fill>
										<WorkArea />
									</View>
								</FlexItem>
								<BottomPanel />
							</FlexBox>
						</FlexItem>
						<SideBar />
					</FlexBox>
				</FlexItem>
			</FlexBox>
			<Dialog />
		</View>
	);
};

export default App;
