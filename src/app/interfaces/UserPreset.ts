export interface UserPreset {
  id: string; // prefixed with 'user:'
  name: string;
  spur: number;
  pinion: number;
  internalRatio: number;
  category?: string;
  drive?: "2WD" | "4WD";
  notes?: string;
}
