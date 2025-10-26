import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { GearForm } from './gear-form';

describe('GearForm', () => {
  let component: GearForm;
  let fixture: ComponentFixture<GearForm>;

  const makeEvent = (value: string): Event => ({
    target: { value }
  } as unknown as Event);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GearForm],
      providers: [provideZonelessChangeDetection()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GearForm);
    component = fixture.componentInstance;
    // Provide required inputs before initial change detection
    fixture.componentRef.setInput('spur', 82);
    fixture.componentRef.setInput('pinion', 25);
    fixture.componentRef.setInput('internalRatio', 2.6);
    fixture.componentRef.setInput('irOverridden', false);
    fixture.componentRef.setInput('fdr', 8.52);
    fixture.componentRef.setInput('isFdrValid', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSpurInput emits parsed number for valid numeric string', () => {
    const emitted: number[] = [];
    component.spurChange.subscribe(v => emitted.push(v));
    component.onSpurInput(makeEvent('82'));
    expect(emitted).toEqual([82]);
  });

  it('onSpurInput emits decimals correctly', () => {
    const emitted: number[] = [];
    component.spurChange.subscribe(v => emitted.push(v));
    component.onSpurInput(makeEvent('82.5'));
    expect(emitted).toEqual([82.5]);
  });

  it('onSpurInput emits 0 for non-numeric input', () => {
    const emitted: number[] = [];
    component.spurChange.subscribe(v => emitted.push(v));
    component.onSpurInput(makeEvent('abc'));
    expect(emitted).toEqual([0]);
  });

  it('onSpurInput emits 0 for Infinity/NaN-like input', () => {
    const emitted: number[] = [];
    component.spurChange.subscribe(v => emitted.push(v));
    component.onSpurInput(makeEvent('1e309'));
    component.onSpurInput(makeEvent('NaN'));
    expect(emitted).toEqual([0, 0]);
  });

  it('onSpurInput allows negative numbers (emits as parsed)', () => {
    const emitted: number[] = [];
    component.spurChange.subscribe(v => emitted.push(v));
    component.onSpurInput(makeEvent('-5'));
    expect(emitted).toEqual([-5]);
  });

  it('onPinionInput emits parsed number for valid numeric string', () => {
    const emitted: number[] = [];
    component.pinionChange.subscribe(v => emitted.push(v));
    component.onPinionInput(makeEvent('25'));
    expect(emitted).toEqual([25]);
  });

  it('onPinionInput emits 0 for non-numeric input', () => {
    const emitted: number[] = [];
    component.pinionChange.subscribe(v => emitted.push(v));
    component.onPinionInput(makeEvent('abc'));
    expect(emitted).toEqual([0]);
  });

  it('onPinionInput emits decimals and negative numbers as parsed', () => {
    const emitted: number[] = [];
    component.pinionChange.subscribe(v => emitted.push(v));
    component.onPinionInput(makeEvent('12.34'));
    component.onPinionInput(makeEvent('-3'));
    expect(emitted).toEqual([12.34, -3]);
  });

  it('onIrInput emits parsed number for valid numeric string', () => {
    const emitted: number[] = [];
    component.internalRatioChange.subscribe(v => emitted.push(v));
    component.onIrInput(makeEvent('2.6'));
    expect(emitted).toEqual([2.6]);
  });

  it('onIrInput emits 0 for non-finite values (Infinity/NaN)', () => {
    const emitted: number[] = [];
    component.internalRatioChange.subscribe(v => emitted.push(v));
    component.onIrInput(makeEvent('Infinity'));
    component.onIrInput(makeEvent('NaN'));
    expect(emitted).toEqual([0, 0]);
  });

  it('onIrInput emits 0 for non-numeric input', () => {
    const emitted: number[] = [];
    component.internalRatioChange.subscribe(v => emitted.push(v));
    component.onIrInput(makeEvent('abc'));
    expect(emitted).toEqual([0]);
  });
});
