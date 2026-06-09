import { NextResponse } from "next/server";

const GEOCODE_URLS = ["https://api.vworld.kr/req/address", "http://api.vworld.kr/req/address"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ error: "주소를 입력해 주세요." }, { status: 400 });
  }

  const apiKey = process.env.VWORLD_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "VWorld API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const params = new URLSearchParams({
    service: "address",
    request: "getCoord",
    version: "2.0",
    crs: "epsg:4326",
    type: "road",
    address,
    format: "json",
    errorFormat: "json",
    key: apiKey,
  });

  let data = await requestVworld(params);
  let lastStatus = data?.response?.status;
  let lastDetail = data?.response?.error ?? data;

  if (!isSuccessful(data)) {
    params.set("type", "parcel");
    data = await requestVworld(params);
    lastStatus = data?.response?.status ?? lastStatus;
    lastDetail = data?.response?.error ?? data ?? lastDetail;
  }

  if (!isSuccessful(data)) {
    return NextResponse.json(
      {
        error: "주소 검색에 실패했습니다.",
        status: lastStatus ?? "UNKNOWN",
        detail: lastDetail,
      },
      { status: 404 },
    );
  }

  const point = data.response.result.point;
  const refinedAddress = data.response.refined?.text || address;

  return NextResponse.json({
    address: refinedAddress,
    roadAddress: data.response.refined?.structure?.level4LC || refinedAddress,
    jibunAddress: refinedAddress,
    lat: Number(point.y),
    lng: Number(point.x),
  });
}

async function requestVworld(params: URLSearchParams) {
  let lastError = "VWorld API 호출에 실패했습니다.";

  for (const geocodeUrl of GEOCODE_URLS) {
    try {
      const response = await fetch(`${geocodeUrl}?${params.toString()}`, {
        cache: "no-store",
      });

      return parseVworldResponse(response);
    } catch (error) {
      const cause = error instanceof Error && "cause" in error ? String(error.cause) : "";
      lastError = [error instanceof Error ? error.message : "fetch failed", cause].filter(Boolean).join(" / ");
    }
  }

  return {
    response: {
      status: "FETCH_ERROR",
      error: lastError,
    },
  };
}

async function parseVworldResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {
      response: {
        status: "EMPTY_RESPONSE",
        error: "VWorld API 응답이 비어 있습니다.",
      },
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      response: {
        status: response.ok ? "PARSE_ERROR" : String(response.status),
        error: text,
      },
    };
  }
}

function isSuccessful(data: any) {
  return data?.response?.status === "OK" && data?.response?.result?.point?.x && data?.response?.result?.point?.y;
}
