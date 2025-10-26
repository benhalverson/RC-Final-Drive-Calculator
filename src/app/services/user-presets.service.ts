import { Injectable } from '@angular/core';
import { from, Observable, defer, catchError, of, switchMap } from 'rxjs';
import type { UserPreset } from '../interfaces/UserPreset';

const DB_NAME = 'rc-fdr-calc';
const DB_VERSION = 1;
const STORE_NAME = 'user-presets';

@Injectable({ providedIn: 'root' })
export class UserPresetsService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });

    return this.dbPromise;
  }

  private fromRequest<T>(request: IDBRequest<T>): Observable<T> {
    return new Observable((observer) => {
      request.onsuccess = () => {
        observer.next(request.result);
        observer.complete();
      };
      request.onerror = () => observer.error(request.error);
    });
  }

  private fromTransaction(tx: IDBTransaction): Observable<void> {
    return new Observable((observer) => {
      tx.oncomplete = () => {
        observer.next();
        observer.complete();
      };
      tx.onerror = () => observer.error(tx.error);
    });
  }

  load(): Observable<UserPreset[]> {
    return defer(() => from(this.openDB())).pipe(
      switchMap((db) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        return this.fromRequest<unknown[]>(store.getAll());
      }),
      switchMap((results) => {
        if (!Array.isArray(results)) return of([]);
        return of(results.filter((item): item is UserPreset => this.isUserPreset(item)));
      }),
      catchError((error) => {
        console.error('Failed to load user presets:', error);
        return of([]);
      })
    );
  }

  save(list: UserPreset[]): Observable<void> {
    return defer(() => from(this.openDB())).pipe(
      switchMap((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        store.clear();
        for (const preset of list) {
          store.put(preset);
        }

        return this.fromTransaction(tx);
      }),
      catchError((error) => {
        console.error('Failed to save user presets:', error);
        throw error;
      })
    );
  }

  add(preset: UserPreset): Observable<void> {
    return defer(() => from(this.openDB())).pipe(
      switchMap((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        return this.fromRequest(store.put(preset));
      }),
      switchMap(() => of(undefined)),
      catchError((error) => {
        console.error('Failed to add user preset:', error);
        throw error;
      })
    );
  }

  remove(id: string): Observable<void> {
    return defer(() => from(this.openDB())).pipe(
      switchMap((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        return this.fromRequest(store.delete(id));
      }),
      switchMap(() => of(undefined)),
      catchError((error) => {
        console.error('Failed to remove user preset:', error);
        throw error;
      })
    );
  }

  private isUserPreset(value: unknown): value is UserPreset {
    if (typeof value !== 'object' || value === null) return false;

    const obj = value as Record<string, unknown>;

    return (
      typeof obj['id'] === 'string' &&
      typeof obj['name'] === 'string' &&
      typeof obj['spur'] === 'number' &&
      typeof obj['pinion'] === 'number' &&
      typeof obj['internalRatio'] === 'number'
    );
  }
}
