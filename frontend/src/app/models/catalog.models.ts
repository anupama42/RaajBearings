export interface Product {
  id: number;
  sku: string;
  modelNumber: string;
  name: string;
  brand: string;
  type: string;
  description: string;
  priceMin: number;
  priceMax: number;
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  rating: number;
  moq: number;
  material: string;
  innerDiameter: string;
  outerDiameter: string;
  imageUrl: string;
  filterC: string;
  filterD: string;
}

export interface FilterChoice {
  value: string;
  label: string;
}

export interface FilterOptions {
  discount: FilterChoice[];
  rating: FilterChoice[];
  C: string[];
  D: string[];
}

export interface SearchOptions {
  brands: string[];
  types: string[];
}

export interface ProductQuery {
  brand?: string;
  type?: string;
  minDiscount?: string;
  minRating?: string;
  filterC?: string;
  filterD?: string;
  q?: string;
}

export interface EnquiryPayload {
  productId: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  company?: string;
  message: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}
