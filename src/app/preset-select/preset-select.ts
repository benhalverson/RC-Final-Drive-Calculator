import { Component, input, output } from '@angular/core';
import { Preset } from '../interfaces/Preset';

@Component({
  selector: 'app-preset-select',
  imports: [],
  templateUrl: './preset-select.html',
  styleUrl: './preset-select.css',
})
export class PresetSelect {
  presets = input.required<Preset[]>();
  value = input.required<string>();
  valueChange = output<string>();

  onChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(select.value);
   }


  tc() {
    return this.presets().filter(p => p.category === "On-Road" );
  }
  buggy2wd() {
    return this.presets().filter(p => p.category === "2wd-Off-Road" );
  }
  buggy4wd() {
    return this.presets().filter(p => p.category === "4wd-Off-Road" && p.drive === "4WD");
  }

}
