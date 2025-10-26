import { TestBed } from '@angular/core/testing';

import { Fdr } from './fdr';

describe('Fdr', () => {
  let service: Fdr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fdr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
