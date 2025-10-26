import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PresetSelect } from './preset-select';

describe('PresetSelect', () => {
  let component: PresetSelect;
  let fixture: ComponentFixture<PresetSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetSelect],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresetSelect);
    component = fixture.componentInstance;
    // Provide required inputs before initial change detection
    fixture.componentRef.setInput('presets', []);
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
