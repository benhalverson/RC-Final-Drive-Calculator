export type Category = "On-Road" | "2wd-Off-Road" | "4wd-Off-Road";

export interface Preset {
  id: string;
  brand: string;
  model: string;
  category: Category;
  internalRatio: number;
  drive: "2WD" | "4WD";
  notes?: string;
}
