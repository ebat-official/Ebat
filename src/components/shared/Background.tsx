import React, { FC } from "react";

interface BackgroundProps {}

const Background: FC<BackgroundProps> = ({}) => {
  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 dark:opacity-15 blur-[100px]"></div>
        <div className="absolute left-0  bottom-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 dark:opacity-15 blur-[100px]"></div>
      </div>
    </>
  );
};

export default Background;
