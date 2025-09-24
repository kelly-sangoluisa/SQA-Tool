'use client';

import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  target?: string;
}

export default function AuthLink({ href, children, target }: AuthLinkProps) {
  return (
    <Link 
      href={href}
      target={target}
      className="font-medium text-[#4E5EA3] hover:text-[#3d4a82] dark:text-[#8b9dc3] dark:hover:text-[#4E5EA3]"
    >
      {children}
    </Link>
  );
}