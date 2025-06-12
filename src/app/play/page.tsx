import EditorPanel from "@/components/playground/EditorPanel";
import Header from "@/components/playground/Header";
import OutputPanel from "@/components/playground/OutputPanel";

export default function Home() {
	return (
		<div className="min-h-screen">
			<div className="max-w-[1800px] mx-auto p-4">
				<Header />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<EditorPanel />
					<OutputPanel />
				</div>
			</div>
		</div>
	);
}
