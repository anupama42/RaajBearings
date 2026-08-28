import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ContactPayload,
  EnquiryPayload,
  FilterOptions,
  Product,
  ProductQuery,
  SearchOptions
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private http: HttpClient) {}

  getFilters(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>('/api/filters');
  }

  getSearchOptions(): Observable<SearchOptions> {
    return this.http.get<SearchOptions>('/api/search-options');
  }

  getProducts(query: ProductQuery = {}): Observable<Product[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });
    return this.http.get<Product[]>('/api/products', { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  sendEnquiry(payload: EnquiryPayload): Observable<{ id: number; status: string }> {
    return this.http.post<{ id: number; status: string }>('/api/enquiries', payload);
  }

  sendContact(payload: ContactPayload): Observable<{ id: number; status: string }> {
    return this.http.post<{ id: number; status: string }>('/api/contacts', payload);
  }
}
