import Editor from "@/components/shared/Lexical Editor";
import React, { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <Editor isEditable={true} />
    </div>
  );
};

export default page;
