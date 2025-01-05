import React, { FC } from "react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

const FormError: FC<FormErrorProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        "bg-destructive/20 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive lg:px-8",
        className,
      )}
    >
      <ExclamationTriangleIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormError;
