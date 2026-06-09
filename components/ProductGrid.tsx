"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { categories, getProductImage } from "@/lib/products";
import { getFitLabel, getFitStatus, type FitStatus } from "@/lib/hardiness";

type Region = {
  address: string;
  lat: number;
  lng: number;
  hardinessC: number;
};

type ProductGridProps = {
  products: Product[];
};

type VworldResponse = {
  response?: {
    status?: string;
    error?: {
      code?: string;
      text?: string;
    };
    refined?: {
      text?: string;
    };
    result?: {
      point?: {
        x?: string;
        y?: string;
      };
    };
  };
};

const statusClass: Record<FitStatus, string> = {
  available: "fit-good",
  caution: "fit-caution",
  hard: "fit-hard",
  indoor: "fit-neutral",
  excluded: "fit-muted",
  unknown: "fit-muted",
};

const outdoorFitCategories = new Set(["야생화/정원식물"]);

export function ProductGrid({ products }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const saved = window.localStorage.getItem("chacha-region");
    return saved ? (JSON.parse(saved) as Region) : null;
  });
  const [regionStatus, setRegionStatus] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch = activeCategory === "전체" || product.category === activeCategory;
      const queryMatch = !keyword || product.name.toLowerCase().includes(keyword);

      return categoryMatch && queryMatch;
    });
  }, [activeCategory, products, query]);

  async function handleRegionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!address.trim()) {
      setRegionStatus("주소를 입력해 주세요.");
      return;
    }

    setRegionStatus("주소를 확인하는 중입니다.");

    try {
      const geocode = await geocodeAddress(address);

      const hardinessResponse = await fetch(`/api/hardiness?lat=${geocode.lat}&lng=${geocode.lng}`);
      const hardiness = await readJsonResponse(hardinessResponse);

      if (!hardinessResponse.ok) {
        throw new Error(formatApiError(hardiness, "내한성 값을 찾지 못했습니다."));
      }

      const nextRegion: Region = {
        address: geocode.address,
        lat: geocode.lat,
        lng: geocode.lng,
        hardinessC: hardiness.valueC,
      };

      setRegion(nextRegion);
      window.localStorage.setItem("chacha-region", JSON.stringify(nextRegion));
      setRegionStatus("내 재배 지역이 설정되었습니다.");
    } catch (error) {
      setRegionStatus(error instanceof Error ? error.message : "주소 설정에 실패했습니다.");
    }
  }

  return (
    <>
      <aside className="region-panel" aria-label="내 재배 지역">
        <div>
          <p className="panel-label">내 재배 지역</p>
          {region ? (
            <>
              <strong>{region.address}</strong>
              <span>지역 내한성 {region.hardinessC.toFixed(1)}°C</span>
            </>
          ) : (
            <>
              <strong>지역 미설정</strong>
              <span>주소를 입력하면 적합도를 계산합니다.</span>
            </>
          )}
        </div>
        <form onSubmit={handleRegionSubmit}>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="예: 전남 나주시 산포면"
            aria-label="주소"
          />
          <button type="submit">설정</button>
        </form>
        {regionStatus ? <p className="panel-status">{regionStatus}</p> : null}
      </aside>

      <section className="shop-tools" aria-label="상품 검색과 필터">
        <div className="category-row">
          {categories.map((category) => (
            <button
              className={category === activeCategory ? "active" : ""}
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="식물 이름 검색"
          aria-label="식물 이름 검색"
        />
      </section>

      <section className="product-grid" aria-label="상품 목록">
        {filteredProducts.map((product) => {
          const image = getProductImage(product);
          const fitStatus = getFitStatus(product, region?.hardinessC);
          const showFit = outdoorFitCategories.has(product.category);

          return (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                {image ? <img src={image} alt={product.name} /> : <span>{product.category}</span>}
              </div>
              <div className="product-body">
                <div className="product-meta">
                  <span>{product.category}</span>
                  <span>{product.seller}</span>
                </div>
                <h2>{product.name}</h2>
                {product.spec ? <p className="spec">{product.spec}</p> : null}
                <div className="product-bottom">
                  <strong>{product.priceText}</strong>
                  {showFit ? (
                    <span className={`fit-badge ${statusClass[fitStatus]}`}>{getFitLabel(fitStatus)}</span>
                  ) : null}
                </div>
                {showFit && typeof product.coldLimitC === "number" ? (
                  <p className="hardiness-note">
                    내한성 {product.hardinessZone}구역 · 약 {product.coldLimitC.toFixed(1)}°C
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

async function geocodeAddress(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY;

  if (!apiKey) {
    throw new Error("VWorld API 키가 설정되지 않았습니다.");
  }

  const roadResult = await requestVworldJsonp(address, "road", apiKey);
  const roadPoint = getVworldPoint(roadResult);

  if (roadPoint) {
    return roadPoint;
  }

  const parcelResult = await requestVworldJsonp(address, "parcel", apiKey);
  const parcelPoint = getVworldPoint(parcelResult);

  if (parcelPoint) {
    return parcelPoint;
  }

  const error = parcelResult.response?.error ?? roadResult.response?.error;
  const status = parcelResult.response?.status ?? roadResult.response?.status ?? "UNKNOWN";
  const detail = error?.text ?? error?.code ?? "검색 결과가 없습니다.";

  throw new Error(`주소 검색에 실패했습니다. / 상태: ${status} / 상세: ${detail}`);
}

function getVworldPoint(data: VworldResponse) {
  const point = data.response?.result?.point;

  if (data.response?.status !== "OK" || !point?.x || !point?.y) {
    return null;
  }

  return {
    address: data.response.refined?.text ?? "선택한 주소",
    lat: Number(point.y),
    lng: Number(point.x),
  };
}

function requestVworldJsonp(address: string, type: "road" | "parcel", apiKey: string) {
  const callbackName = `vworldCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const params = new URLSearchParams({
    service: "address",
    request: "getCoord",
    version: "2.0",
    crs: "epsg:4326",
    type,
    address,
    format: "json",
    errorFormat: "json",
    callback: callbackName,
    key: apiKey,
  });

  return new Promise<VworldResponse>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("VWorld API 응답 시간이 초과되었습니다."));
    }, 10000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as any)[callbackName];
    }

    (window as any)[callbackName] = (data: VworldResponse) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("VWorld API 스크립트 호출에 실패했습니다."));
    };

    script.src = `https://api.vworld.kr/req/address?${params.toString()}`;
    document.body.appendChild(script);
  });
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {
      error: "서버 응답이 비어 있습니다.",
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: text,
    };
  }
}

function formatApiError(data: any, fallback: string) {
  const parts = [data?.error ?? fallback];

  if (data?.status) {
    parts.push(`상태: ${data.status}`);
  }

  if (data?.detail) {
    const detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    parts.push(`상세: ${detail}`);
  }

  return parts.join(" / ");
}
