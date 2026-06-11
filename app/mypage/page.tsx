"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function MyPage() {
  const { data: session, status } = useSession();

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
        <button
          type="button"
          className="primary-action"
          onClick={() => signIn("naver", { callbackUrl: "/mypage" })}
        >
          네이버로 로그인
        </button>
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
