import ButtonBlue from "../shared/ButtonBlue";

interface RunButtonProps {
	isRunning: boolean;
	disabled?: boolean;
	onClick?: () => void;
}

function RunButton({ isRunning, disabled, onClick }: RunButtonProps) {
	const handleRun = async () => {
		onClick?.();
	};

	return (
		<ButtonBlue
			className="bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
			loadingText="Executing..."
			onClick={handleRun}
			disabled={disabled}
			loading={isRunning}
		>
			<span>Run Code</span>
		</ButtonBlue>
	);
}
export default RunButton;
