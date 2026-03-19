export class OPTION {
  value: unknown;
  key!: string;
  format!: OPTION_FORMAT;
}

export type OPTION_FORMAT = 'string' | 'int' | 'float' | 'json';
