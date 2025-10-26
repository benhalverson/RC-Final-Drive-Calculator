import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PresetSelect } from "../preset-select/preset-select";
import { CalculatorStore } from './calculator.store';
import { GearForm } from '../gear-form/gear-form';

@Component({
  selector: 'app-calculator',
  imports: [PresetSelect,  GearForm],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Calculator implements OnInit {
  readonly store = inject(CalculatorStore);

  onPresetChange(id: string): void {
    this.store.selectPreset(id);
  }

  resetToPreset(): void {
    this.store.resetToPreset();
  }

  onSpurChange(value: number): void {
    this.store.setSpur(Number.isFinite(value) ? value : 0);
  }

  onPinionChange(value: number): void {
    this.store.setPinion(Number.isFinite(value) ? value : 0);
  }

  onInternalRatioChange(value: number): void {
    this.store.setInternalRatio(Number.isFinite(value) && value > 0 ? value : 0);
  }

  onIrOverrideToggle(): void {
    this.store.toggleIrOverride();
  }

  ngOnInit(): void {
    // Initialize from URL on the client to prefill a single form without SSR mismatches
    if (typeof globalThis !== 'undefined' && typeof (globalThis as unknown as { location?: unknown }).location !== 'undefined') {
      this.store.initFromLocation();
    }
  }
}
