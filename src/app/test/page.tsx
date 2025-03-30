"use client";
import "@excalidraw/excalidraw/index.css";
import Editor from "@/components/shared/Lexical Editor";
import React, { FC } from "react";
import { EditorProvider } from "@/components/shared/Lexical Editor/providers/EditorContext";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
	return (
		<EditorProvider>
			<Editor isEditable={true} />
		</EditorProvider>
	);
};

export default page;

// import {
//   Excalidraw,
//   convertToExcalidrawElements,
// } from "@excalidraw/excalidraw";

// import "@excalidraw/excalidraw/index.css";

// const ExcalidrawWrapper: React.FC = () => {
//   console.info(
//     convertToExcalidrawElements([
//       {
//         type: "rectangle",
//         id: "rect-1",
//         width: 186.47265625,
//         height: 141.9765625,
//       },
//     ])
//   );
//   return (
//     <div style={{ height: "500px", width: "500px" }} className="custom-styles">
//       <Excalidraw />
//     </div>
//   );
// };
// export default ExcalidrawWrapper;
