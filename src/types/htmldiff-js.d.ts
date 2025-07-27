declare module "htmldiff-js" {
	// eslint-disable-next-line @typescript-eslint/no-extraneous-class
	class HtmlDiff {
		static execute(oldHtml: string, newHtml: string): string;
	}
	export default HtmlDiff;
}
