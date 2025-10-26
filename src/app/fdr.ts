import { Injectable } from '@angular/core';
import { FdrInput } from './interfaces/Fdr';

@Injectable({
  providedIn: 'root'
})
export class Fdr {
 compute(input: FdrInput): number {
  const { spur, pinion, internalRatio } = input;
  if(spur <= 0 || pinion <= 0 || internalRatio <= 0) return NaN;
  const fdr = (spur / pinion) * internalRatio;
  return Math.round(fdr * 100) / 100;
 }
}

