import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Calculator } from './calculator';

describe('Calculator', () => {
  let component: Calculator;
  let fixture: ComponentFixture<Calculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calculator],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Calculator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
