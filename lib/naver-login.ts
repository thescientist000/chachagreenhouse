type LoginProvider = "naver" | "google";

const PROVIDER_LABELS: Record<LoginProvider, string> = {
  naver: "네이버",
  google: "구글",
};

export async function startProviderLogin(
  provider: LoginProvider,
  callbackUrl = "/mypage",
) {
  const label = PROVIDER_LABELS[provider];
  const csrfResponse = await fetch("/api/auth/csrf");

  if (!csrfResponse.ok) {
    throw new Error("CSRF 토큰을 가져오지 못했습니다.");
  }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken?: string };

  if (!csrfToken) {
    throw new Error("CSRF 토큰이 비어 있습니다.");
  }

  const signinResponse = await fetch(`/api/auth/signin/${provider}`, {
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
    throw new Error(`${label} 로그인 요청에 실패했습니다.`);
  }

  const data = (await signinResponse.json()) as { url?: string };

  if (!data.url) {
    throw new Error(`${label} 로그인 주소를 받지 못했습니다.`);
  }

  if (data.url.includes("/api/auth/error")) {
    throw new Error(`${label} 로그인 설정을 확인해야 합니다. Client ID, Client Secret, Callback URL을 다시 확인해 주세요.`);
  }

  window.location.assign(data.url);
}

export function startNaverLogin(callbackUrl = "/mypage") {
  return startProviderLogin("naver", callbackUrl);
}

export function startGoogleLogin(callbackUrl = "/mypage") {
  return startProviderLogin("google", callbackUrl);
}
