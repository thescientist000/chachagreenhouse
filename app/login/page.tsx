"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">로그인</p>
        <h1>차차그린하우스 시작하기</h1>
        <p>네이버 계정으로 로그인하면 장바구니, 마이페이지, 주문조회 기능을 사용할 수 있습니다.</p>
        <button className="naver-login" type="button" onClick={() => signIn("naver", { callbackUrl: "/" })}>
          네이버로 로그인
        </button>
      </section>
    </main>
  );
}
