import { cn } from '@/lib/utils';
import React, { FC } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  title?: string;
  loading?: boolean;
}

const ButtonBlue: FC<ButtonProps> = ({
  className,
  title,
  loading = false,
  ...others
}) => {
  return (
    <button
      className={cn(
        'flex justify-center items-center w-full px-6 py-3 mt-6 mb-0 text-xs font-bold text-center text-white uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro ease-soft-in tracking-tight-soft bg-gradient-to-tl from-blue-600 to-cyan-400 hover:scale-102 hover:shadow-soft-xs active:opacity-85 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      disabled={loading}
      {...others}
    >
      {!loading && title}
      <Loader2
        className={cn('mr-2 h-4 w-4 animate-spin', { hidden: !loading })}
      />
      {loading && 'Please wait'}
    </button>
  );
};

export default ButtonBlue;
