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

export const categories = ["전체", "다육식물", "관엽식물", "야생화/정원식물", "동서양란", "화분자재류"];

export const products = rawProducts as Product[];

export function getProductImage(product: Product) {
  return product.image ? `/products/${product.image}` : null;
}
