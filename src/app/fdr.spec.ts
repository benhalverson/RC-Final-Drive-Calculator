import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Fdr } from './fdr';

describe('Fdr', () => {
  let service: Fdr;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(Fdr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('computes FDR and rounds to 2 decimals (happy path)', () => {
    // 82 / 25 = 3.28; 3.28 * 2.6 = 8.528 -> rounds to 8.53
    const result = service.compute({ spur: 82, pinion: 25, internalRatio: 2.6 });
    expect(result).toBe(8.53);
  });

  it('returns NaN when spur <= 0', () => {
    expect(Number.isNaN(service.compute({ spur: 0, pinion: 25, internalRatio: 2.6 }))).toBeTrue();
    expect(Number.isNaN(service.compute({ spur: -1, pinion: 25, internalRatio: 2.6 }))).toBeTrue();
  });

  it('returns NaN when pinion <= 0', () => {
    expect(Number.isNaN(service.compute({ spur: 82, pinion: 0, internalRatio: 2.6 }))).toBeTrue();
    expect(Number.isNaN(service.compute({ spur: 82, pinion: -3, internalRatio: 2.6 }))).toBeTrue();
  });

  it('returns NaN when internalRatio <= 0', () => {
    expect(Number.isNaN(service.compute({ spur: 82, pinion: 25, internalRatio: 0 }))).toBeTrue();
    expect(Number.isNaN(service.compute({ spur: 82, pinion: 25, internalRatio: -1 }))).toBeTrue();
  });

  it('rounds down when third decimal < 5', () => {
    // Choose values to yield ~5.994 -> round to 5.99
    // (spur/pinion) * internalRatio ≈ 5.994
    const result = service.compute({ spur: 999, pinion: 167, internalRatio: 1.0 }); // 999/167 ≈ 5.98503
    // Adjust slightly via internalRatio to target ~5.994
    const adjusted = service.compute({ spur: 999, pinion: 167, internalRatio: 1.0015 });
    expect(adjusted).toBe(5.99);
  });

  it('rounds up when third decimal >= 5', () => {
    // 1999/333 ≈ 6.003 -> with IR 0.999 -> ~5.996 -> rounds to 6.00
    const result = service.compute({ spur: 1999, pinion: 333, internalRatio: 0.999 });
    expect(result).toBe(6.0);
  });
});
