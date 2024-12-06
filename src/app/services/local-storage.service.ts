import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  saveState(key: string, state: any): void {
    localStorage.setItem(key, JSON.stringify(state));
  }

  loadState(key: string): any {
    const state = localStorage.getItem(key);
    return state ? JSON.parse(state) : null;
  }

  clearState(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all localStorage data
  clearAll(): void {
    localStorage.clear();
  }
}