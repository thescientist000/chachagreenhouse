import { NextResponse } from "next/server";
import { getHardinessAt } from "@/lib/hardiness";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "위도와 경도를 확인해 주세요." }, { status: 400 });
  }

  const hardiness = await getHardinessAt(lat, lng);

  if (!hardiness) {
    return NextResponse.json({ error: "내한성 지도 범위 밖이거나 값이 없는 지역입니다." }, { status: 404 });
  }

  return NextResponse.json(hardiness);
}
