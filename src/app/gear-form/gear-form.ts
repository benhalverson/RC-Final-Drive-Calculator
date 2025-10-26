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
  fdr = input.required<number>();
  isFdrValid = input.required<boolean>();

  // Outputs
  spurChange = output<number>();
  pinionChange = output<number>();

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

}
