import { ProductGrid } from "@/components/ProductGrid";
import { products } from "@/lib/products";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="intro">
        <div>
          <p className="eyebrow">지역 맞춤 식물 쇼핑</p>
          <h1>내 주소의 내한성으로 식물 구매를 더 정확하게.</h1>
          <p>
            차차그린하우스는 주소 기반 기후 데이터를 활용해 구매하려는 식물이 내 지역에서
            월동 가능한지 확인하는 식물 판매 서비스입니다.
          </p>
        </div>
        <div className="region-card">
          내 재배 지역 설정
          <span>주소 입력 후 상품별 적합도를 확인하세요.</span>
        </div>
      </section>

      <ProductGrid products={products} />
    </main>
  );
}
