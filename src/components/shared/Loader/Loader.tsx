import React, { FC } from "react";
import styles from "./Loader.module.css";

const Loader: FC = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className={styles.loader}>
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
				<div className={`${styles.loaderSquare} bg-foreground`} />
			</div>
			<span className="text-lg font-semibold animate-pulse font-code">
				Loading...
			</span>
		</div>
	);
};

export default Loader;
