import React from "react";
import {
	CODE_LANGUAGE_FRIENDLY_NAME_MAP,
	getLanguageFriendlyName,
} from "@lexical/code";
import { DropDown } from ".";

function getCodeLanguageOptions(): [string, string][] {
	const options: [string, string][] = [];
	for (const [lang, friendlyName] of Object.entries(
		CODE_LANGUAGE_FRIENDLY_NAME_MAP,
	)) {
		options.push([lang, friendlyName]);
	}
	return options;
}

export default function CodeList({
	onCodeLanguageSelect,
	disabled = false,
	codeLanguage,
}: {
	onCodeLanguageSelect: (v: string) => void;
	disabled?: boolean;
	codeLanguage: string;
}) {
	const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

	const languageButtons = CODE_LANGUAGE_OPTIONS.map(([lang]) => ({
		label: lang,
		func: () => onCodeLanguageSelect(lang),
	}));

	return (
		<DropDown
			values={languageButtons}
			disabled={disabled}
			TriggerClassName={{ maxWidth: "200px", minWidth: "60px", width: "130px" }}
			TriggerLabel={getLanguageFriendlyName(codeLanguage)}
		/>
	);
}
