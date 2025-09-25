'use client';

import Link from 'next/link';

interface AuthLinkProps {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly target?: string;
}

export default function AuthLink({ href, children, target }: Readonly<AuthLinkProps>) {
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