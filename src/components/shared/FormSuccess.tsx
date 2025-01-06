import React, { FC } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface FormSuccessProps {
  message?: string;
  className?: string;
}

const FormSuccess: FC<FormSuccessProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        "bg-emerald-500/20 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 lg:px-8",
        className,
      )}
    >
      <CheckCircledIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
