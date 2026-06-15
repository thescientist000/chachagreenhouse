"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { startGoogleLogin, startNaverLogin } from "@/lib/naver-login";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

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

  if (status === "loading") {
    return (
      <main className="page-shell compact">
        <h1>마이페이지</h1>
        <p>로그인 정보를 확인하는 중입니다.</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="page-shell compact auth-page">
        <h1>마이페이지</h1>
        <p>네이버 로그인 후 주소 설정과 주문 정보를 확인할 수 있습니다.</p>
        <div className="auth-actions">
          <button
            type="button"
            className="primary-action"
            disabled={isSigningIn}
            onClick={handleNaverLogin}
          >
            {isSigningIn ? "로그인 이동 중" : "네이버로 로그인"}
          </button>
          <button
            type="button"
            className="secondary-action"
            disabled={isSigningIn}
            onClick={handleGoogleLogin}
          >
            구글로 로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell compact auth-page">
      <h1>마이페이지</h1>
      <section className="account-box">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="account-avatar" />
        ) : null}
        <div>
          <strong>{session.user.name ?? "네이버 회원"}님</strong>
          <p>{session.user.email ?? "네이버 계정으로 로그인했습니다."}</p>
        </div>
      </section>
      <p>주소 설정과 주문 정보는 이곳에서 확인할 수 있습니다.</p>
      <button
        type="button"
        className="secondary-action"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        로그아웃
      </button>
    </main>
  );
}
