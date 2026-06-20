export enum Operator {
  EQ = "eq",
  NEQ = "neq",
  GT = "gt",
  GTE = "gte",
  LT = "lt",
  LTE = "lte",
  EXISTS = "exists",
  NOT_EXISTS = "not_exists",
  IN = "in",
  NOT_IN = "not_in"
}

export interface Precondition {
  entity: string;
  field: string;
  operator: Operator;
  value?: any;
  description?: string;
}

export interface Effect {
  entity: string;
  field: string;
  value: any;
  description?: string;
}

export interface GoalState {
  entity: string;
  field: string;
  value: any;
}

export interface WorldState {
  [entity: string]: {
    [field: string]: any;
  };
}

export interface StateQuery {
  entity: string;
  field: string;
}

export interface WorldStateSnapshot {
  timestamp: number;
  state: WorldState;
}

export interface StateDiff {
  added: { entity: string; field: string; value: any }[];
  removed: { entity: string; field: string }[];
  modified: { entity: string; field: string; oldValue: any; newValue: any }[];
}
