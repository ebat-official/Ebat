import { $isCodeNode } from "@lexical/code";
import { $getNearestNodeFromDOMNode, LexicalEditor } from "lexical";
import { Options } from "prettier";
import { useState } from "react";

interface Props {
  lang: string;
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

const PRETTIER_PARSER_MODULES = {
  css: [() => import("prettier/parser-postcss")],
  html: [() => import("prettier/parser-html")],
  js: [
    () => import("prettier/parser-babel"),
    () => import("prettier/plugins/estree"),
  ],
  markdown: [() => import("prettier/parser-markdown")],
  typescript: [
    () => import("prettier/parser-typescript"),
    () => import("prettier/plugins/estree"),
  ],
} as const;

type LanguagesType = keyof typeof PRETTIER_PARSER_MODULES;

async function loadPrettierParserByLang(lang: string) {
  const dynamicImports = PRETTIER_PARSER_MODULES[lang as LanguagesType];
  const modules = await Promise.all(
    dynamicImports.map((dynamicImport) => dynamicImport())
  );
  return modules;
}

async function loadPrettierFormat() {
  const { format } = await import("prettier/standalone");
  return format;
}

const PRETTIER_OPTIONS_BY_LANG: Record<string, Options> = {
  css: { parser: "css" },
  html: { parser: "html" },
  js: { parser: "babel" },
  markdown: { parser: "markdown" },
  typescript: { parser: "typescript" },
};

const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG);

export function canBePrettier(lang: string): boolean {
  return LANG_CAN_BE_PRETTIER.includes(lang);
}

function getPrettierOptions(lang: string): Options {
  const options = PRETTIER_OPTIONS_BY_LANG[lang];
  if (!options) {
    throw new Error(
      `CodeActionMenuPlugin: Prettier does not support this language: ${lang}`
    );
  }

  return options;
}

export function PrettierButton({ lang, editor, getCodeDOMNode }: Props) {
  const [syntaxError, setSyntaxError] = useState<string>("");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  async function handleClick(): Promise<void> {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) {
      return;
    }

    let content = "";
    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }
    });
    if (content === "") {
      return;
    }

    try {
      const format = await loadPrettierFormat();
      const options = getPrettierOptions(lang);
      const prettierParsers = await loadPrettierParserByLang(lang);
      options.plugins = prettierParsers.map(
        (parser) => parser.default || parser
      );
      const formattedCode = await format(content, options);

      editor.update(() => {
        const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
        if ($isCodeNode(codeNode)) {
          const selection = codeNode.select(0);
          selection.insertText(formattedCode);
          setSyntaxError("");
          setTipsVisible(false);
        }
      });
    } catch (error: unknown) {
      setError(error);
    }
  }

  function setError(error: unknown) {
    if (error instanceof Error) {
      setSyntaxError(error.message);
      setTipsVisible(true);
    } else {
      console.error("Unexpected error: ", error);
    }
  }

  function handleMouseEnter() {
    if (syntaxError !== "") {
      setTipsVisible(true);
    }
  }

  function handleMouseLeave() {
    if (syntaxError !== "") {
      setTipsVisible(false);
    }
  }

  return (
    <div className="w-full group h-full relative">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="prettier"
      >
        <svg
          width="20"
          height="20"
          className="mt-2"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="prettier">
            <g id="prettier_2">
              <path
                id="Rectangle"
                d="M73.8095 19.0481H78.5715C79.9048 19.0481 80.9524 20.0957 80.9524 21.429C80.9524 22.7624 79.9048 23.81 78.5715 23.81H73.8095C72.4762 23.81 71.4286 22.7624 71.4286 21.429C71.4286 20.0957 72.4762 19.0481 73.8095 19.0481Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_1_"
                d="M2.38095 95.2388H26.1904C27.5238 95.2388 28.5714 96.2864 28.5714 97.6197C28.5714 98.9531 27.5238 100.001 26.1904 100.001H2.38095C1.04762 100.001 0 98.9531 0 97.6197C0 96.2864 1.04762 95.2388 2.38095 95.2388Z"
                fill="#EA5E5E"
              />
              <path
                id="Rectangle_2_"
                d="M59.5239 57.1436H73.8095C75.1428 57.1436 76.1904 58.1911 76.1904 59.5244C76.1904 60.8577 75.1428 61.9052 73.8095 61.9052H59.5239C58.1906 61.9052 57.1429 60.8577 57.1429 59.5244C57.1429 58.1911 58.1906 57.1436 59.5239 57.1436Z"
                fill="#BF85BF"
              />
              <path
                id="Rectangle_3_"
                d="M30.9525 57.1436H50.0002C51.3335 57.1436 52.3811 58.1911 52.3811 59.5244C52.3811 60.8577 51.3335 61.9052 50.0002 61.9052H30.9525C29.6192 61.9052 28.5715 60.8577 28.5715 59.5244C28.5715 58.1911 29.6192 57.1436 30.9525 57.1436Z"
                fill="#EA5E5E"
              />
              <path
                id="Rectangle_4_"
                d="M2.38095 57.1436H21.4286C22.7619 57.1436 23.8095 58.1911 23.8095 59.5244C23.8095 60.8577 22.7619 61.9052 21.4286 61.9052H2.38095C1.04762 61.9052 0 60.8577 0 59.5244C0 58.1911 1.04762 57.1436 2.38095 57.1436Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_5_"
                d="M2.38095 76.1909H26.1904C27.5238 76.1909 28.5714 77.2385 28.5714 78.5719C28.5714 79.9052 27.5238 80.9528 26.1904 80.9528H2.38095C1.04762 80.9528 0 79.9052 0 78.5719C0 77.2385 1.04762 76.1909 2.38095 76.1909Z"
                fill="#BF85BF"
              />
              <path
                id="Rectangle_6_"
                d="M2.38095 38.0957H26.1904C27.5238 38.0957 28.5714 39.1433 28.5714 40.4767C28.5714 41.81 27.5238 42.8577 26.1904 42.8577H2.38095C1.04762 42.8577 0 41.81 0 40.4767C0 39.1433 1.04762 38.0957 2.38095 38.0957Z"
                fill="#BF85BF"
              />
              <path
                id="Rectangle_7_"
                d="M26.1905 9.52441H73.8095C75.1428 9.52441 76.1905 10.572 76.1905 11.9054C76.1905 13.2387 75.1428 14.2863 73.8095 14.2863H26.1905C24.8572 14.2863 23.8096 13.2387 23.8096 11.9054C23.8096 10.572 24.8572 9.52441 26.1905 9.52441Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_8_"
                d="M2.38095 9.52441H16.6667C18 9.52441 19.0476 10.572 19.0476 11.9054C19.0476 13.2387 18 14.2863 16.6667 14.2863H2.38095C1.04762 14.2863 0 13.2387 0 11.9054C0 10.572 1.04762 9.52441 2.38095 9.52441Z"
                fill="#EA5E5E"
              />
              <path
                id="Rectangle_9_"
                d="M21.4286 85.7148H26.1905C27.5239 85.7148 28.5715 86.7625 28.5715 88.0958C28.5715 89.4291 27.5239 90.4768 26.1905 90.4768H21.4286C20.0952 90.4768 19.0476 89.4291 19.0476 88.0958C19.0476 86.7625 20.0952 85.7148 21.4286 85.7148Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_10_"
                d="M21.4286 28.572H26.1905C27.5239 28.572 28.5715 29.6196 28.5715 30.9529C28.5715 32.2862 27.5239 33.3338 26.1905 33.3338H21.4286C20.0952 33.3338 19.0476 32.2862 19.0476 30.9529C19.0476 29.6196 20.0952 28.572 21.4286 28.572Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_11_"
                d="M2.38096 85.7148H11.9048C13.2381 85.7148 14.2857 86.7625 14.2857 88.0958C14.2857 89.4291 13.2381 90.4768 11.9048 90.4768H2.38096C1.04762 90.4768 0 89.4291 0 88.0958C0 86.7625 1.04762 85.7148 2.38096 85.7148Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_12_"
                d="M2.38096 28.572H11.9048C13.2381 28.572 14.2857 29.6196 14.2857 30.9529C14.2857 32.2862 13.2381 33.3338 11.9048 33.3338H2.38096C1.04762 33.3338 0 32.2862 0 30.9529C0 29.6196 1.04762 28.572 2.38096 28.572Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_13_"
                opacity="0.5"
                d="M64.2858 85.7148H69.0476C70.3809 85.7148 71.4285 86.7625 71.4285 88.0958C71.4285 89.4291 70.3809 90.4768 69.0476 90.4768H64.2858C62.9525 90.4768 61.9049 89.4291 61.9049 88.0958C61.9049 86.7625 62.9525 85.7148 64.2858 85.7148Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_14_"
                opacity="0.5"
                d="M35.7142 85.7148H54.7619C56.0953 85.7148 57.1429 86.7625 57.1429 88.0958C57.1429 89.4291 56.0953 90.4768 54.7619 90.4768H35.7142C34.3809 90.4768 33.3333 89.4291 33.3333 88.0958C33.3333 86.7625 34.3809 85.7148 35.7142 85.7148Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_15_"
                opacity="0.5"
                d="M78.5714 85.7148H97.6191C98.9524 85.7148 100 86.7625 100 88.0958C100 89.4291 98.9524 90.4768 97.6191 90.4768H78.5714C77.2381 90.4768 76.1904 89.4291 76.1904 88.0958C76.1904 86.7625 77.2381 85.7148 78.5714 85.7148Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_16_"
                d="M40.4762 47.6196H78.5714C79.9047 47.6196 80.9523 48.6672 80.9523 50.0005C80.9523 51.3338 79.9047 52.3814 78.5714 52.3814H40.4762C39.1428 52.3814 38.0952 51.3338 38.0952 50.0005C38.0952 48.6672 39.1428 47.6196 40.4762 47.6196Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_17_"
                d="M16.6666 47.6196H30.9523C32.2856 47.6196 33.3333 48.6672 33.3333 50.0005C33.3333 51.3338 32.2856 52.3814 30.9523 52.3814H16.6666C15.3333 52.3814 14.2856 51.3338 14.2856 50.0005C14.2856 48.6672 15.3333 47.6196 16.6666 47.6196Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_18_"
                d="M2.38095 47.6196H7.14286C8.4762 47.6196 9.52382 48.6672 9.52382 50.0005C9.52382 51.3338 8.4762 52.3814 7.14286 52.3814H2.38095C1.04762 52.3814 0 51.3338 0 50.0005C0 48.6672 1.04762 47.6196 2.38095 47.6196Z"
                fill="#EA5E5E"
              />
              <path
                id="Rectangle_19_"
                d="M45.2381 19.0481H64.2857C65.619 19.0481 66.6666 20.0957 66.6666 21.429C66.6666 22.7624 65.619 23.81 64.2857 23.81H45.2381C43.9048 23.81 42.8572 22.7624 42.8572 21.429C42.8572 20.0957 43.9048 19.0481 45.2381 19.0481Z"
                fill="#BF85BF"
              />
              <path
                id="Rectangle_20_"
                d="M2.38095 19.0481H35.7142C37.0476 19.0481 38.0952 20.0957 38.0952 21.429C38.0952 22.7624 37.0476 23.81 35.7142 23.81H2.38095C1.04762 23.81 0 22.7624 0 21.429C0 20.0957 1.04762 19.0481 2.38095 19.0481Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_21_"
                d="M16.6666 66.667H59.5239C60.8572 66.667 61.9048 67.7146 61.9048 69.048C61.9048 70.3813 60.8572 71.4289 59.5239 71.4289H16.6666C15.3333 71.4289 14.2856 70.3813 14.2856 69.048C14.2856 67.7146 15.3333 66.667 16.6666 66.667Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_22_"
                d="M2.38095 66.667H7.14286C8.4762 66.667 9.52382 67.7146 9.52382 69.048C9.52382 70.3813 8.4762 71.4289 7.14286 71.4289H2.38095C1.04762 71.4289 0 70.3813 0 69.048C0 67.7146 1.04762 66.667 2.38095 66.667Z"
                fill="#BF85BF"
              />
              <path
                id="Rectangle_23_"
                d="M59.5239 28.572H83.3333C84.6666 28.572 85.7143 29.6196 85.7143 30.9529C85.7143 32.2862 84.6666 33.3338 83.3333 33.3338H59.5239C58.1906 33.3338 57.1429 32.2862 57.1429 30.9529C57.1429 29.6196 58.1906 28.572 59.5239 28.572Z"
                fill="#EA5E5E"
              />
              <path
                id="Rectangle_24_"
                d="M59.5239 38.0957H83.3333C84.6666 38.0957 85.7143 39.1433 85.7143 40.4767C85.7143 41.81 84.6666 42.8577 83.3333 42.8577H59.5239C58.1906 42.8577 57.1429 41.81 57.1429 40.4767C57.1429 39.1433 58.1906 38.0957 59.5239 38.0957Z"
                fill="#F7BA3E"
              />
              <path
                id="Rectangle_25_"
                d="M2.38095 0.000488281H59.5238C60.8571 0.000488281 61.9048 1.04811 61.9048 2.38144C61.9048 3.71477 60.8571 4.76239 59.5238 4.76239H2.38095C1.04762 4.76239 0 3.71477 0 2.38144C0 1.04811 1.04762 0.000488281 2.38095 0.000488281Z"
                fill="#56B3B4"
              />
              <path
                id="Rectangle_26_"
                opacity="0.5"
                d="M69.0477 0.000488281H97.6191C98.9525 0.000488281 100 1.04811 100 2.38144C100 3.71477 98.9525 4.76239 97.6191 4.76239H69.0477C67.7144 4.76239 66.6667 3.71477 66.6667 2.38144C66.6667 1.04811 67.7144 0.000488281 69.0477 0.000488281Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_27_"
                opacity="0.5"
                d="M69.0477 66.667H78.5715C79.9048 66.667 80.9524 67.7146 80.9524 69.048C80.9524 70.3813 79.9048 71.4289 78.5715 71.4289H69.0477C67.7144 71.4289 66.6667 70.3813 66.6667 69.048C66.6667 67.7146 67.7144 66.667 69.0477 66.667Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_28_"
                opacity="0.5"
                d="M88.0953 66.667H97.6192C98.9525 66.667 100 67.7146 100 69.048C100 70.3813 98.9525 71.4289 97.6192 71.4289H88.0953C86.762 71.4289 85.7144 70.3813 85.7144 69.048C85.7144 67.7146 86.762 66.667 88.0953 66.667Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_29_"
                opacity="0.5"
                d="M83.3334 57.1436H97.6191C98.9524 57.1436 100 58.1911 100 59.5244C100 60.8577 98.9524 61.9052 97.6191 61.9052H83.3334C82 61.9052 80.9524 60.8577 80.9524 59.5244C80.9524 58.1911 82 57.1436 83.3334 57.1436Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_30_"
                opacity="0.5"
                d="M83.3334 9.52441H97.6191C98.9524 9.52441 100 10.572 100 11.9054C100 13.2387 98.9524 14.2863 97.6191 14.2863H83.3334C82 14.2863 80.9524 13.2387 80.9524 11.9054C80.9524 10.572 82 9.52441 83.3334 9.52441Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_31_"
                opacity="0.5"
                d="M88.0953 47.6196H97.6192C98.9525 47.6196 100 48.6672 100 50.0005C100 51.3338 98.9525 52.3814 97.6192 52.3814H88.0953C86.762 52.3814 85.7144 51.3338 85.7144 50.0005C85.7144 48.6672 86.762 47.6196 88.0953 47.6196Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_32_"
                opacity="0.5"
                d="M88.0953 19.0481H97.6192C98.9525 19.0481 100 20.0957 100 21.429C100 22.7624 98.9525 23.81 97.6192 23.81H88.0953C86.762 23.81 85.7144 22.7624 85.7144 21.429C85.7144 20.0957 86.762 19.0481 88.0953 19.0481Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_33_"
                opacity="0.5"
                d="M92.8572 28.572H97.6191C98.9524 28.572 100 29.6196 100 30.9529C100 32.2862 98.9524 33.3338 97.6191 33.3338H92.8572C91.5238 33.3338 90.4762 32.2862 90.4762 30.9529C90.4762 29.6196 91.5238 28.572 92.8572 28.572Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_34_"
                opacity="0.5"
                d="M92.8572 38.0957H97.6191C98.9524 38.0957 100 39.1433 100 40.4767C100 41.81 98.9524 42.8577 97.6191 42.8577H92.8572C91.5238 42.8577 90.4762 41.81 90.4762 40.4767C90.4762 39.1433 91.5238 38.0957 92.8572 38.0957Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_35_"
                opacity="0.5"
                d="M54.762 76.1909H97.6191C98.9524 76.1909 100 77.2385 100 78.5719C100 79.9052 98.9524 80.9528 97.6191 80.9528H54.762C53.4287 80.9528 52.3811 79.9052 52.3811 78.5719C52.3811 77.2385 53.4287 76.1909 54.762 76.1909Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_36_"
                opacity="0.5"
                d="M35.7142 76.1909H45.238C46.5714 76.1909 47.619 77.2385 47.619 78.5719C47.619 79.9052 46.5714 80.9528 45.238 80.9528H35.7142C34.3809 80.9528 33.3333 79.9052 33.3333 78.5719C33.3333 77.2385 34.3809 76.1909 35.7142 76.1909Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_37_"
                opacity="0.5"
                d="M73.8096 95.2388H97.6192C98.9525 95.2388 100 96.2864 100 97.6197C100 98.9531 98.9525 100.001 97.6192 100.001H73.8096C72.4762 100.001 71.4286 98.9531 71.4286 97.6197C71.4286 96.2864 72.4762 95.2388 73.8096 95.2388Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_38_"
                opacity="0.5"
                d="M35.7142 95.2388H64.2856C65.6189 95.2388 66.6665 96.2864 66.6665 97.6197C66.6665 98.9531 65.6189 100.001 64.2856 100.001H35.7142C34.3809 100.001 33.3333 98.9531 33.3333 97.6197C33.3333 96.2864 34.3809 95.2388 35.7142 95.2388Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_39_"
                opacity="0.5"
                d="M35.7142 28.572H50C51.3334 28.572 52.381 29.6196 52.381 30.9529C52.381 32.2862 51.3334 33.3338 50 33.3338H35.7142C34.3809 33.3338 33.3333 32.2862 33.3333 30.9529C33.3333 29.6196 34.3809 28.572 35.7142 28.572Z"
                fill="#D0D4D8"
              />
              <path
                id="Rectangle_40_"
                opacity="0.5"
                d="M35.7142 38.0957H50C51.3334 38.0957 52.381 39.1433 52.381 40.4767C52.381 41.81 51.3334 42.8577 50 42.8577H35.7142C34.3809 42.8577 33.3333 41.81 33.3333 40.4767C33.3333 39.1433 34.3809 38.0957 35.7142 38.0957Z"
                fill="#D0D4D8"
              />
            </g>
          </g>
        </svg>
      </button>
      {tipsVisible ? (
        <pre className=" hover:opacity-100 group-hover:opacity-100 text-xs opacity-0 transition-all  absolute top-8 right-0  p-2 bg-red-500/50 rounded-sm">
          {syntaxError}
        </pre>
      ) : null}
    </div>
  );
}
