'use client';

import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

const Loading = ({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  className, 
  color = 'primary' 
}: LoadingProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'text-[#4E5EA3]',
    secondary: 'text-[#59469A]',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  const renderSpinner = () => (
    <svg
      className={cn(
        "animate-spin",
        sizes[size],
        colors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-pulse",
            {
              sm: "w-2 h-2",
              md: "w-3 h-3", 
              lg: "w-4 h-4",
              xl: "w-5 h-5"
            }[size],
            {
              primary: "bg-[#4E5EA3]",
              secondary: "bg-[#59469A]",
              white: "bg-white",
              gray: "bg-gray-500"
            }[color]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        "rounded-full animate-pulse",
        sizes[size],
        {
          primary: "bg-[#4E5EA3]",
          secondary: "bg-[#59469A]",
          white: "bg-white",
          gray: "bg-gray-500"
        }[color],
        className
      )}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {renderLoader()}
      {text && (
        <span className={cn(
          "text-sm font-medium",
          {
            primary: "text-[#4E5EA3]",
            secondary: "text-[#59469A]", 
            white: "text-white",
            gray: "text-gray-500"
          }[color]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

// Full page loading component
export interface FullPageLoadingProps {
  text?: string;
  className?: string;
}

export const FullPageLoading = ({ text = "Cargando...", className }: FullPageLoadingProps) => (
  <div className={cn(
    "fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50",
    className
  )}>
    <div className="text-center">
      <Loading size="xl" text={text} />
    </div>
  </div>
);

export default Loading;