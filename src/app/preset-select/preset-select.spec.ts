import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastrService, TOAST_CONFIG, GlobalConfig, ActiveToast } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { PresetSelect } from './preset-select';

describe('PresetSelect', () => {
  let component: PresetSelect;
  let fixture: ComponentFixture<PresetSelect>;

  beforeEach(async () => {
    // Create a mock ToastrService that returns a minimal ActiveToast for warning
    const onTap$ = new Subject<void>();
    const mockActiveToast = {
      onTap: onTap$.asObservable(),
      toastRef: { close: jasmine.createSpy('close') },
    } as unknown as ActiveToast<unknown>;

    const toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'warning']);
    toastrSpy.success.and.returnValue(undefined as unknown as ActiveToast<unknown>);
    toastrSpy.warning.and.returnValue(mockActiveToast);

    await TestBed.configureTestingModule({
      imports: [PresetSelect],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastrService, useValue: toastrSpy },
        { provide: TOAST_CONFIG, useValue: {} as GlobalConfig },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresetSelect);
    component = fixture.componentInstance;
    // Provide required inputs before initial change detection
    fixture.componentRef.setInput('presets', []);
    fixture.componentRef.setInput('userPresets', []);
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
