import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/catalog.models';

const STORAGE_KEY = 'raaj-enquiry-cart';
const TOKEN_KEY = 'raaj-token';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private ids = signal<number[]>(this.readLocal());
  readonly count = computed(() => this.ids().length);

  constructor(private http: HttpClient) {}

  private loggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private readLocal(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  }

  private writeLocal(ids: number[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    this.ids.set(ids);
  }

  private setFromProducts(products: Product[]): void {
    this.ids.set(products.map((product) => product.id));
    localStorage.removeItem(STORAGE_KEY);
  }

  list(): number[] {
    return this.ids();
  }

  has(id: number): boolean {
    return this.ids().includes(id);
  }

  loadFromServer(): void {
    if (!this.loggedIn()) {
      return;
    }
    this.http.get<Product[]>('/api/enquiry-cart').subscribe((products) => this.setFromProducts(products));
  }

  syncAfterLogin(): void {
    const guestIds = this.readLocal();
    this.http.post<Product[]>('/api/enquiry-cart/merge', { productIds: guestIds }).subscribe((products) => {
      this.setFromProducts(products);
    });
  }

  clearOnLogout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.ids.set([]);
  }

  add(id: number, done?: () => void): void {
    if (this.loggedIn()) {
      this.http.post<Product[]>('/api/enquiry-cart', { productId: id }).subscribe((products) => {
        this.setFromProducts(products);
        done?.();
      });
      return;
    }
    if (!this.has(id)) {
      this.writeLocal([...this.ids(), id]);
    }
    done?.();
  }

  remove(id: number, done?: () => void): void {
    if (this.loggedIn()) {
      this.http.delete<Product[]>(`/api/enquiry-cart/${id}`).subscribe((products) => {
        this.setFromProducts(products);
        done?.();
      });
      return;
    }
    this.writeLocal(this.ids().filter((item) => item !== id));
    done?.();
  }

  toggle(id: number): void {
    if (this.has(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }
}
