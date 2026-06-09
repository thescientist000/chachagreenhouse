import { NextResponse } from "next/server";

const GEOCODE_URL = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ error: "주소를 입력해 주세요." }, { status: 400 });
  }

  const clientId = process.env.NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "네이버 지도 API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const response = await fetch(`${GEOCODE_URL}?query=${encodeURIComponent(address)}`, {
    headers: {
      "x-ncp-apigw-api-key-id": clientId,
      "x-ncp-apigw-api-key": clientSecret,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    return NextResponse.json(
      {
        error: "주소 검색에 실패했습니다.",
        status: response.status,
        detail: message,
      },
      { status: response.status },
    );
  }

  const data = await response.json();
  const first = data.addresses?.[0];

  if (!first) {
    return NextResponse.json({ error: "검색된 주소가 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    address: first.roadAddress || first.jibunAddress || address,
    roadAddress: first.roadAddress,
    jibunAddress: first.jibunAddress,
    lat: Number(first.y),
    lng: Number(first.x),
  });
}
