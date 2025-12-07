export interface BillIntent {
  intent: string;
  target?: string;
  layout?: "grid" | "cascade" | "focus";
  payload?: any;
  confidence?: number;
  cmfkUpdate?: any;
}
