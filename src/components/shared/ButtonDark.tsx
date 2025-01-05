import { cn } from '@/lib/utils';
import React, { FC } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  title?: string;
  loading?: boolean;
}

const ButtonDark: FC<ButtonProps> = ({
  className,
  title,
  loading = false,
  ...others
}) => {
  return (
    <button
      className={cn(
        'flex justify-center items-center w-full px-6 py-3 mt-6 mb-2 text-xs font-bold text-center text-white uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer active:opacity-85 hover:scale-102 hover:shadow-soft-xs leading-pro ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 bg-gradient-to-tl from-gray-900 to-slate-800 hover:border-slate-700 hover:bg-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-50',
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

export default ButtonDark;
