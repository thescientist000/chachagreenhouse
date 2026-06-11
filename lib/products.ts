import rawProducts from "@/public/data/products.json";

export type Product = {
  id: string;
  name: string;
  category: string;
  seller: string;
  priceText: string;
  price?: number;
  spec?: string;
  hardinessZone?: string;
  coldLimitC?: number | null;
  image?: string | null;
  sourceText?: string;
};

export const categories = ["전체", "야생화/정원식물", "다육식물", "관엽식물", "동서양란", "화분자재류"];

export const products = (rawProducts as Product[]).map((product) => ({
  ...product,
  name: getDisplayName(product),
}));

export function getProductImage(product: Product) {
  if (!product.image) {
    return null;
  }

  return product.image.startsWith("http") ? product.image : `/products/${product.image}`;
}

function getDisplayName(product: Product) {
  if (product.category === "야생화/정원식물") {
    return product.name;
  }

  const withoutBrackets = product.name
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[♥★☆♡]/g, " ");
  const beforeDivider = withoutBrackets.split(/[\/|,]/)[0] ?? withoutBrackets;
  const withoutSalesWords = beforeDivider
    .replace(/\b\d+[-~]?\d*\b/g, " ")
    .replace(/\d+\s*(개|개입|개셋트|셋트|세트|호|번|촉|분|포트|cm|CM|센치|치|L|ml|구|대|년생)/g, " ")
    .replace(
      /(희귀|무늬|식물|미니|선인장|다육|다육이|관엽|공기정화|서양란|동양란|호접란|축하|개업|승진|이전|화분|색상|랜덤|원하는|기재|해주세요|신품|재입고|특가|할인|무료배송|배송|택배|묶음|한셋트|한세트|정품|수입|국내|농장|직송|포함|완성|인테리어|반려|실내|키우기|판매)/g,
      " ",
    )
    .replace(/[ㅡ_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutSalesWords || product.name;
}
