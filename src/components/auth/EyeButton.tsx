import { Eye, EyeOff } from "lucide-react";
import { FC } from "react";
interface EyeButton {
	showPassword: boolean;
	onClickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const EyeButton: FC<EyeButton> = ({ showPassword, onClickHandler }) => {
	return (
		<button
			type="button"
			onClick={onClickHandler}
			className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50"
			aria-label="Toggle password visibility"
		>
			{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
		</button>
	);
};

export default EyeButton;
