import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Preset } from '../interfaces/Preset';
import type { UserPreset } from '../interfaces/UserPreset';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-preset-select',
  imports: [],
  templateUrl: './preset-select.html',
  styleUrl: './preset-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresetSelect {
  private readonly toastr = inject(ToastrService);
  presets = input.required<Preset[]>();
  userPresets = input.required<UserPreset[]>();
  value = input.required<string>();
  valueChange = output<string>();
  addPreset = output<string>();
  removePreset = output<string>();

  showSaveForm = signal(false);
  presetName = signal('');

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

  toggleSaveForm() {
    this.showSaveForm.update(v => !v);
    if (!this.showSaveForm()) {
      this.presetName.set('');
    }
  }

  onSavePreset() {
    const name = this.presetName().trim();
    if (name) {
      this.addPreset.emit(name);
      this.presetName.set('');
      this.showSaveForm.set(false);
      this.toastr.success('Preset saved', 'Saved');
    }
  }

  onRemovePreset(id: string, event: Event) {
    event.stopPropagation();
    const toast = this.toastr.warning('Click this message to confirm deletion', 'Delete preset', {
      closeButton: true,
      disableTimeOut: true,
      tapToDismiss: false,
      timeOut: 0,
      extendedTimeOut: 0,
    });

    const tapSub = toast.onTap.subscribe(() => {
      this.removePreset.emit(id);
      this.toastr.success('Preset deleted', 'Deleted');
      // Close the confirmation toast after action
      toast.toastRef.close();
      tapSub.unsubscribe();
    });
  }

}
