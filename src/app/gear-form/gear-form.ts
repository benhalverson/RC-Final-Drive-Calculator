import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';


@Component({
  selector: 'app-gear-form',
  imports: [],
  templateUrl: './gear-form.html',
  styleUrl: './gear-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GearForm {
  // Inputs
  spur = input.required<number>();
  pinion = input.required<number>();
  internalRatio = input.required<number>();
  irOverridden = input.required<boolean>();
  fdr = input.required<number>();
  isFdrValid = input.required<boolean>();

  // Outputs
  spurChange = output<number>();
  pinionChange = output<number>();
  internalRatioChange = output<number>();
  irOverrideToggle = output<void>();

  onSpurInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const value = Number(inputEl.value);
    this.spurChange.emit(Number.isFinite(value) ? value : 0);
  }

  onPinionInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const value = Number(inputEl.value);
    this.pinionChange.emit(Number.isFinite(value) ? value : 0);
  }

  onIrInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const value = Number(inputEl.value);
    this.internalRatioChange.emit(Number.isFinite(value) ? value : 0);
  }

}
