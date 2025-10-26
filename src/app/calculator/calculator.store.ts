import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Preset } from '../interfaces/Preset';
import { CARS } from '../data/presets';
import { inject } from '@angular/core';
import type { UserPreset } from '../interfaces/UserPreset';
import { UserPresetsService } from '../services/user-presets.service';

interface CalculatorState {
  presets: Preset[];
  userPresets: UserPreset[];
  selectedId: string;
  spur: number;
  pinion: number;
  internalRatio: number;
  irOverridden: boolean;
}

function getSearchParamString(): string {
  const g: unknown = typeof globalThis !== 'undefined' ? globalThis : undefined;
  if (typeof g === 'object' && g !== null && 'location' in g) {
    const loc = (g as { location?: unknown }).location;
    if (typeof loc === 'object' && loc !== null && 'search' in (loc as Record<string, unknown>)) {
      const s = (loc as { search?: unknown }).search;
      if (typeof s === 'string') return s;
    }
  }
  return '';
}

const initialState = (): CalculatorState => {
  const qs = new URLSearchParams(getSearchParamString());
  const presets = CARS;
  const selectedId = (() => {
    const id = qs.get('preset');
    if (id && presets.some((p) => p.id === id)) {
      return id;
    }
    return presets[0]?.id ?? '';
  })();

  const selectedPreset = presets.find((p) => p.id === selectedId);

  return {
    presets,
    userPresets: [],
    selectedId,
    spur: Number(qs.get('spur')) || 72,
    pinion: Number(qs.get('pinion')) || 32,
    internalRatio: selectedPreset?.internalRatio ?? 1,
    irOverridden: false,
  };
};

export const CalculatorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState()),
  withComputed(({ presets, userPresets, selectedId, spur, pinion, internalRatio }) => ({
    selectedPreset: computed(() => presets().find((p) => p.id === selectedId())),
    selectedUserPreset: computed(() => userPresets().find((p) => p.id === selectedId())),
    fdr: computed(() => {
      const spurValue = spur();
      const pinionValue = pinion();
      const internalRatioValue = internalRatio();
      if (spurValue <= 0 || pinionValue <= 0 || internalRatioValue <= 0) return NaN;
      const result = (spurValue / pinionValue) * internalRatioValue;
      return Math.round(result * 100) / 100;
    }),
    fdrValid: computed(() => {
      const spurValue = spur();
      const pinionValue = pinion();
      const internalRatioValue = internalRatio();
      return spurValue > 0 && pinionValue > 0 && internalRatioValue > 0;
    }),
  })),
  withMethods((store) => {
    const service = inject(UserPresetsService);
    return ({
    initUserPresets(): void {
      service.load().subscribe({
        next: (saved) => patchState(store, { userPresets: saved }),
        error: (error) => console.error('Failed to initialize user presets:', error)
      });
    },
    initFromLocation(): void {
      const qs = new URLSearchParams(getSearchParamString());
      const maybePreset = qs.get('preset');
      const spurParam = Number(qs.get('spur'));
      const pinionParam = Number(qs.get('pinion'));

      if (maybePreset && store.presets().some(p => p.id === maybePreset)) {
        const preset = store.presets().find(p => p.id === maybePreset)!;
        patchState(store, { selectedId: preset.id, internalRatio: preset.internalRatio, irOverridden: false });
      }
      if (Number.isFinite(spurParam) && spurParam > 0) {
        patchState(store, { spur: spurParam });
      }
      if (Number.isFinite(pinionParam) && pinionParam > 0) {
        patchState(store, { pinion: pinionParam });
      }
    },
    selectPreset(id: string): void {
      const preset = store.presets().find((p) => p.id === id);
      const user = store.userPresets().find((p) => p.id === id);
      if (preset) {
        if (!store.irOverridden()) {
          patchState(store, { selectedId: id, internalRatio: preset.internalRatio });
        } else {
          patchState(store, { selectedId: id });
        }
      } else if (user) {
        // Selecting a user preset should apply their saved defaults
        patchState(store, {
          selectedId: id,
          internalRatio: user.internalRatio,
          spur: user.spur,
          pinion: user.pinion,
          irOverridden: false,
        });
      }
    },
    setSpur(value: number): void {
      patchState(store, { spur: value });
    },
    setPinion(value: number): void {
      patchState(store, { pinion: value });
    },
    setInternalRatio(value: number): void {
      patchState(store, { internalRatio: value });
    },
    addUserPreset(name: string): void {
      const newPreset: UserPreset = {
        id: `user:${Date.now().toString(36)}`,
        name,
        spur: store.spur(),
        pinion: store.pinion(),
        internalRatio: store.internalRatio(),
      };
      const updated = [...store.userPresets(), newPreset];
      patchState(store, { userPresets: updated, selectedId: newPreset.id, irOverridden: false });
      service.save(updated).subscribe({
        error: (error) => console.error('Failed to save user preset:', error)
      });
    },
    removeUserPreset(id: string): void {
      const updated = store.userPresets().filter(p => p.id !== id);
      patchState(store, { userPresets: updated });
      service.save(updated).subscribe({
        error: (error) => console.error('Failed to remove user preset:', error)
      });
    },
    toggleIrOverride(): void {
      const next = !store.irOverridden();
      // If turning off override, snap back to preset's IR
      if (!next) {
        const preset = store.selectedPreset();
        if (preset) {
          patchState(store, { irOverridden: false, internalRatio: preset.internalRatio });
          return;
        }
      }
      patchState(store, { irOverridden: next });
    },
    setIrOverridden(value: boolean): void {
      if (!value) {
        const preset = store.selectedPreset();
        if (preset) {
          patchState(store, { irOverridden: false, internalRatio: preset.internalRatio });
          return;
        }
      }
      patchState(store, { irOverridden: value });
    },
    resetToPreset(): void {
      const preset = store.selectedPreset();
      if (preset) {
        patchState(store, {
          internalRatio: preset.internalRatio,
          spur: 72,
          pinion: 32,
          irOverridden: false,
        });
      }
    },
  });
  })
);
