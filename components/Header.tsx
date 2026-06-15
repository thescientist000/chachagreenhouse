"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { startGoogleLogin, startNaverLogin } from "@/lib/naver-login";

export function Header() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isLoading = status === "loading" || isSigningIn;
  const userName = session?.user?.name ?? "회원";

  async function handleNaverLogin() {
    try {
      setIsSigningIn(true);
      await startNaverLogin("/mypage");
    } catch (error) {
      setIsSigningIn(false);
      alert(error instanceof Error ? error.message : "네이버 로그인을 시작하지 못했습니다.");
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsSigningIn(true);
      await startGoogleLogin("/mypage");
    } catch (error) {
      setIsSigningIn(false);
      alert(error instanceof Error ? error.message : "구글 로그인을 시작하지 못했습니다.");
    }
  }

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
          <>
            <button
              type="button"
              className="nav-link"
              disabled={isLoading}
              onClick={handleNaverLogin}
            >
              {isSigningIn ? "로그인 이동 중" : "네이버 로그인"}
            </button>
            <button
              type="button"
              className="nav-link"
              disabled={isLoading}
              onClick={handleGoogleLogin}
            >
              구글 로그인
            </button>
          </>
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
