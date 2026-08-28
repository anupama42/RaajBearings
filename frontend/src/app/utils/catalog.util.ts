import { Product } from '../models/catalog.models';

export const WHATSAPP_NUMBER = '917606902815';

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function whatsappEnquireUrl(product: Product): string {
  const text = `Hello Raaj Bearings, I want to enquire about ${product.name} (Model: ${product.modelNumber || product.sku}).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappCartUrl(products: Product[]): string {
  const lines = products.map((product) => `• ${product.name} (Model: ${product.modelNumber || product.sku})`);
  const text = `Hello Raaj Bearings, I want to enquire about these products:\n${lines.join('\n')}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local);
}

export function starLabel(rating: number): string {
  const filled = Math.round(rating);
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)} ${rating.toFixed(1)}`;
}
