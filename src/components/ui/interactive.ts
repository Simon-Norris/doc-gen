export interface Variable {
  name: string;
  value: string;
}

export interface Condition {
  expression: string;
  trueBlock: string;
  elseIfExpression: string;
  elseIfBlock: string;
  falseBlock: string;
}

export interface Loop {
  listVariable: string;
  loopBody: string;
}

export interface Macro {
  name: string;
  body: string;
}

export interface FtlTemplate {
  variables: Variable[];
  conditions: Condition[];
  loops: Loop[];
  macros: Macro[];
}
