import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastrService, TOAST_CONFIG, GlobalConfig, ActiveToast } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { Calculator } from './calculator';

describe('Calculator', () => {
  let component: Calculator;
  let fixture: ComponentFixture<Calculator>;

  beforeEach(async () => {
    // Mock ToastrService used by PresetSelect child component
    const onTap$ = new Subject<void>();
    const mockActiveToast = {
      onTap: onTap$.asObservable(),
      toastRef: { close: jasmine.createSpy('close') },
    } as unknown as ActiveToast<unknown>;

    const toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'warning']);
    toastrSpy.success.and.returnValue(undefined as unknown as ActiveToast<unknown>);
    toastrSpy.warning.and.returnValue(mockActiveToast);

    await TestBed.configureTestingModule({
      imports: [Calculator],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastrService, useValue: toastrSpy },
        { provide: TOAST_CONFIG, useValue: {} as GlobalConfig },
      ]
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
