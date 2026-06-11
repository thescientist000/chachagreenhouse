"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const userName = session?.user?.name ?? "회원";

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        차차그린하우스
      </Link>
      <nav className="main-nav" aria-label="주요 메뉴">
        {session?.user ? (
          <>
            <span className="nav-user">{userName}님</span>
            <button
              type="button"
              className="nav-link"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            type="button"
            className="nav-link"
            disabled={isLoading}
            onClick={() => signIn("naver", { callbackUrl: "/mypage" })}
          >
            네이버 로그인
          </button>
        )}
        <Link href="/cart" className="nav-link">
          장바구니
        </Link>
        <Link href="/mypage" className="nav-link">
          마이페이지
        </Link>
        <Link href="/orders" className="nav-link">
          주문조회
        </Link>
      </nav>
    </header>
  );
}
