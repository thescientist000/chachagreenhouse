export async function startNaverLogin(callbackUrl = "/mypage") {
  const csrfResponse = await fetch("/api/auth/csrf");

  if (!csrfResponse.ok) {
    throw new Error("CSRF 토큰을 가져오지 못했습니다.");
  }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken?: string };

  if (!csrfToken) {
    throw new Error("CSRF 토큰이 비어 있습니다.");
  }

  const signinResponse = await fetch("/api/auth/signin/naver", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl,
      json: "true",
    }),
  });

  if (!signinResponse.ok) {
    throw new Error("네이버 로그인 요청에 실패했습니다.");
  }

  const data = (await signinResponse.json()) as { url?: string };

  if (!data.url) {
    throw new Error("네이버 로그인 주소를 받지 못했습니다.");
  }

  if (data.url.includes("/api/auth/error")) {
    throw new Error("네이버 로그인 설정을 확인해야 합니다. Client ID, Client Secret, Callback URL을 다시 확인해 주세요.");
  }

  window.location.assign(data.url);
}
