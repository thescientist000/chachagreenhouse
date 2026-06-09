"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="nav-muted">확인 중</span>;
  }

  if (!session?.user) {
    return (
      <>
        <button className="nav-link" type="button" onClick={() => signIn("naver")}>
          네이버 로그인
        </button>
        <a className="nav-link" href="/signup">
          회원가입
        </a>
      </>
    );
  }

  return (
    <>
      <span className="nav-user">{session.user.name ?? session.user.email ?? "사용자"}</span>
      <button className="nav-link" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
        로그아웃
      </button>
    </>
  );
}
