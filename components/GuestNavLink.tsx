"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  authMode?: "soft" | "hard";
  children?: ReactNode;
};

/** Điều hướng tab. Khách xem được; tác vụ mua/đăng mới hỏi đăng nhập. */
export default function GuestNavLink({ href, children, authMode: _authMode, ...rest }: Props) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
