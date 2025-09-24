export enum BeatState {
  Off,
  Normal,
  Accent,
}

export interface Preset {
  name: string;
  pattern: BeatState[];
}
