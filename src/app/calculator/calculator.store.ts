import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Preset } from '../interfaces/Preset';
import { CARS } from '../data/presets';

interface CalculatorState {
  presets: Preset[];
  selectedId: string;
  spur: number;
  pinion: number;
  internalRatio: number;
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
    selectedId,
    spur: Number(qs.get('spur')) || 72,
    pinion: Number(qs.get('pinion')) || 32,
    internalRatio: selectedPreset?.internalRatio ?? 1,
  };
};

export const CalculatorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState()),
  withComputed(({ presets, selectedId, spur, pinion, internalRatio }) => ({
    selectedPreset: computed(() => presets().find((p) => p.id === selectedId())),
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
  withMethods((store) => ({
    initFromLocation(): void {
      const qs = new URLSearchParams(getSearchParamString());
      const maybePreset = qs.get('preset');
      const spurParam = Number(qs.get('spur'));
      const pinionParam = Number(qs.get('pinion'));

      if (maybePreset && store.presets().some(p => p.id === maybePreset)) {
        const preset = store.presets().find(p => p.id === maybePreset)!;
        patchState(store, { selectedId: preset.id, internalRatio: preset.internalRatio });
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
      if (preset) {
        patchState(store, { selectedId: id, internalRatio: preset.internalRatio });
      }
    },
    setSpur(value: number): void {
      patchState(store, { spur: value });
    },
    setPinion(value: number): void {
      patchState(store, { pinion: value });
    },
    resetToPreset(): void {
      const preset = store.selectedPreset();
      if (preset) {
        patchState(store, {
          internalRatio: preset.internalRatio,
          spur: 72,
          pinion: 32
        });
      }
    },
  }))
);
