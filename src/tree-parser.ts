const digitCheck = /[\d]/
const permittedOperators = /[*/+-]/
const startSubExpression = /\(/;
const endSubExpression = /\)/;

function getFullValue(expression: string) {
  let accumulated: string = ""
  for (let i = 0; i < expression.length; i++) {
    if (!digitCheck.test(expression[i])) {
      return {val: parseInt(accumulated), i: i}
    }
    accumulated = accumulated + expression[i];
  }
  return {val: parseInt(accumulated) || -1, i: expression.length}
}

export enum TokenType {
  Operator = "OP",
  Number = "NUM",
}

export interface ExprNode {
  value: string;
  type: TokenType;
  left?: ExprNode | undefined;
  right?: ExprNode | undefined;
}

/*
 * The lexer splits the string/file into tokens, which can then be parsed based
 * the data
 */
export function lexicalAnalysis(expression: string): ExprNode[] {
  let res = []
  let token: ExprNode
  let incompleteNumber: string = ""

  function createNumber() {
    token = {
      value: incompleteNumber,
      type: TokenType.Number,
    }
    res.push(token)
    incompleteNumber = ""
  }

  for (let c of expression) {
    if (incompleteNumber && !digitCheck.test(c)) {
      createNumber()
    }
    if (["*", "+", "(", ")"].includes(c)) {
      token = {
        value: c,
        type: TokenType.Operator,
      }
      if (!!token) res.push(token)
    } else if (digitCheck.test(c)) {
      incompleteNumber += c
    } else if (c === " ") {

    } else {
      throw new Error(`Invalid character: '${c}'`)
    }
  }
  if (incompleteNumber) {
    createNumber()
  }

  return res
}

/*
 * Parses based on the lexer results
 */
export class Parser {
  tokens: ExprNode[] = [];
  i: number = 0;
  eof: boolean = false;
  shouldLog: boolean = false;

  next(): void {
    this.i = this.i + 1
    if (this.i >= this.tokens.length) {
      this.eof = true;
      return
    }
  }

  back(): void {
    this.i = this.i - 1
    if (this.i < 0) {
      this.i = 0
      return
    }
  }

  parseNumber(): ExprNode | undefined {
    if (!this.eof && this.tokens[this.i]?.type === TokenType.Number) {
      if (this.shouldLog) console.log("parseNumber", this.i)
      return this.tokens[this.i]
    }
  }

  parentheses(): ExprNode | undefined {
    let token = this.tokens[this.i]
    if (!this.eof && token?.value == '(') {
      this.next()
      token.left = this.add()
      if (!this.eof && this.tokens[this.i]?.value == ')') {
        token.right = this.tokens[this.i]
      } else {
        this.back()
      }
      return token
    }
    return this.parseNumber()
  }

  multiply(): ExprNode | undefined {
    let sub_expr = this.parentheses()
    this.next()
    let token = this.tokens[this.i]
    // we could handle division here for simplicity, it's just multiplication
    // In a classic example of this, 'x / y * z' is treated as 'x * (1/y) * z'
    // but it's worth clarifying the rules to ensure that that is correct, ie
    // it's equally valid to read it as 'x / (y * z)'
    if (!this.eof && token?.value == "*") {
      token.left = sub_expr
      this.next()
      token.right = this.multiply()
      return token
    } else {
      this.back()
    }
    return sub_expr
  }

  add(): ExprNode | undefined {
    let sub_expr = this.multiply()
    this.next()
    let token = this.tokens[this.i]
    // we could handle subtraction here for simplicity, it's just addition
    // I've seen examples where unary operator is handled seperately
    // and it may be worth reworking 'x - y' to 'x + -y'
    if (!this.eof && token?.value == "+") {
      token.left = sub_expr
      this.next()
      token.right = this.add()
      return token
    }
    return sub_expr
  }

  // Main input function
  expression(tokens: Array<ExprNode>): ExprNode | undefined {
    // Note how the rules are parsed 
    this.tokens = tokens
    return this.add()
  }
}


export function parseExpression(expression: string, level?: undefined | number): ExprNode {
  if (!level) level = 1; // logged for debugging
  let tree = lexicalAnalysis(expression)[0]

  return tree;
}

export function evaluateExpressionTree(expressionTree: ExprNode): number {
  if (expressionTree.type == TokenType.Number) {
    return parseInt(expressionTree.value) ? parseInt(expressionTree.value) : 0;
  }
  if (expressionTree.type == TokenType.Operator) {
    if (expressionTree.value == "*") {
      return evaluateExpressionTree(expressionTree.left!) * evaluateExpressionTree(expressionTree.right!)
    } else if (expressionTree.value == "+") {
      return evaluateExpressionTree(expressionTree.left!) + evaluateExpressionTree(expressionTree.right!)
    } else if (expressionTree.value == "(") {
      // don't need to handle ")" case, because it's always the right hand side of "("
      return evaluateExpressionTree(expressionTree.left!)
    }
  }
  throw new Error(`Unhandled expressionTree type of: '${expressionTree.type}'`)
}

export function evaluateExpression(expression: string): number | undefined {
  let res: ExprNode[] = lexicalAnalysis(expression)

  let astParser = new Parser()
  let ast = astParser.expression(res)
  return evaluateExpressionTree(ast!);
}
