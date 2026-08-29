import { Product } from '../models/catalog.models';

export const WHATSAPP_NUMBER = '919632601143';

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

export function emailEnquiryUrl(product: Product): string {
  const subject = `Product enquiry: ${product.name}`;
  const body = `Hello Raaj Bearings,\n\nI would like to enquire about ${product.name} (Model: ${product.modelNumber || product.sku}).\n\nPlease share the available price and delivery details.\n\nThank you.`;
  return `mailto:raajspinbearing@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
