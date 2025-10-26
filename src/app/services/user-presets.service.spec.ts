import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserPresetsService } from './user-presets.service';
import type { UserPreset } from '../interfaces/UserPreset';

interface ServiceWithPrivates {
  dbPromise: Promise<IDBDatabase> | null;
  isUserPreset(value: unknown): value is UserPreset;
  load: UserPresetsService['load'];
  save: UserPresetsService['save'];
  add: UserPresetsService['add'];
  remove: UserPresetsService['remove'];
}

describe('UserPresetsService', () => {
  let service: ServiceWithPrivates;

  const createMockUserPreset = (overrides?: Partial<UserPreset>): UserPreset => ({
    id: 'user:test-1',
    name: 'Test Preset',
    spur: 48,
    pinion: 16,
    internalRatio: 3.0,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(UserPresetsService) as unknown as ServiceWithPrivates;
  });

  afterEach(() => {
    // Clean up
    service.dbPromise = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle IndexedDB not available gracefully', (done) => {
    // Store original indexedDB
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'indexedDB');

    // Mock indexedDB as undefined
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const freshService = new UserPresetsService();

    freshService.load().subscribe({
      next: (presets) => {
        expect(presets).toEqual([]);
        // Restore original indexedDB
        if (originalDescriptor) {
          Object.defineProperty(window, 'indexedDB', originalDescriptor);
        }
        done();
      },
      error: (err) => {
        // Restore original indexedDB
        if (originalDescriptor) {
          Object.defineProperty(window, 'indexedDB', originalDescriptor);
        }
        done.fail(err);
      },
    });
  });

  it('should validate preset structure correctly', () => {
    const validPreset = createMockUserPreset();
    const isValid = service.isUserPreset(validPreset);
    expect(isValid).toBe(true);
  });

  it('should reject invalid preset - missing id', () => {
    const invalidPreset = {
      name: 'Test',
      spur: 48,
      pinion: 16,
      internalRatio: 3.0,
    };
    const isValid = service.isUserPreset(invalidPreset);
    expect(isValid).toBe(false);
  });

  it('should reject invalid preset - missing name', () => {
    const invalidPreset = {
      id: 'user:1',
      spur: 48,
      pinion: 16,
      internalRatio: 3.0,
    };
    const isValid = service.isUserPreset(invalidPreset);
    expect(isValid).toBe(false);
  });

  it('should reject invalid preset - wrong types', () => {
    const invalidPreset = {
      id: 'user:1',
      name: 'Test',
      spur: '48', // should be number
      pinion: 16,
      internalRatio: 3.0,
    };
    const isValid = service.isUserPreset(invalidPreset);
    expect(isValid).toBe(false);
  });

  it('should reject non-object values', () => {
    expect(service.isUserPreset(null)).toBe(false);
    expect(service.isUserPreset(undefined)).toBe(false);
    expect(service.isUserPreset('string')).toBe(false);
    expect(service.isUserPreset(123)).toBe(false);
  });

  it('should accept valid preset with optional fields', () => {
    const presetWithOptionals = {
      ...createMockUserPreset(),
      category: 'Buggy',
      drive: '4WD' as const,
      notes: 'Test notes',
    };
    const isValid = service.isUserPreset(presetWithOptionals);
    expect(isValid).toBe(true);
  });
});
