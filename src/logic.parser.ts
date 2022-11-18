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

enum Keyword {
  AND = "&&",
  OR = "||",
  WHERE = "where",
  PARENTHESES_OPEN = "(",
  PARENTHESES_CLOSE = ")",
}

export enum TokenType {
  Operator = "OP",
  Number = "NUM",
}

export interface Token {
  value: string;
  type: TokenType;
}

export interface AstNode {
  token: Token;
  left?: AstNode | undefined;
  right?: AstNode | undefined;
}

/*
 * Parses based on the lexer results
 */
export class Parser {
  tokens: Token[] = [];
  astTree: AstNode = {
    token: { value: "", type: TokenType.Number},
  }
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

  /*
   * The lexer splits the string/file into tokens, which can then be parsed based
   * the data
   */
  lexicalAnalysis(expression: string): Token[] {
    let res = []
    let token: Token
    let incompleteToken: string = ""
    let typeInProgress: TokenType | undefined

    function createNumber() {
      token = {
        value: incompleteToken,
        type: TokenType.Number,
      }
      res.push(token)
      incompleteToken = ""
    }

    for (let c of expression) {
      if (incompleteToken && !digitCheck.test(c)) {
        createNumber()
      }
      if (["*", "+", "(", ")"].includes(c)) {
        token = {
          value: c,
          type: TokenType.Operator,
        }
        if (!!token) res.push(token)
      } else if (digitCheck.test(c)) {
        incompleteToken += c
      } else if (c === " ") {

      } else {
        throw new Error(`Invalid character: '${c}'`)
      }
    }
    if (incompleteToken) {
      createNumber()
    }

    return res
  }


  parseNumber(): AstNode | undefined {
    if (!this.eof && this.tokens[this.i]?.type === TokenType.Number) {
      if (this.shouldLog) console.log("parseNumber", this.i)
      let node: AstNode = {
        token: this.tokens[this.i]
      }
      return node
    }
  }

  parentheses(): AstNode | undefined {
    let token = this.tokens[this.i]
    if (!this.eof && token?.value == '(') {
      this.next()
      let node: AstNode = {
        token: token
      }
      node.left = this.add()
      if (!this.eof && this.tokens[this.i]?.value == ')') {
        node.right = {
          token: this.tokens[this.i]
        }
      } else {
        this.back()
      }
      return node
    }
    return this.parseNumber()
  }

  multiply(): AstNode | undefined {
    let sub_expr = this.parentheses()
    this.next()
    let token = this.tokens[this.i]
    // we could handle division here for simplicity, it's just multiplication
    // In a classic example of this, 'x / y * z' is treated as 'x * (1/y) * z'
    // but it's worth clarifying the rules to ensure that that is correct, ie
    // it's equally valid to read it as 'x / (y * z)'
    if (!this.eof && token?.value == "*") {
      let node: AstNode = {
        token: token
      }
      node.left = sub_expr
      this.next()
      node.right = this.multiply()
      return node
    } else {
      this.back()
    }
    return sub_expr
  }

  add(): AstNode | undefined {
    let sub_expr = this.multiply()
    this.next()
    let token = this.tokens[this.i]
    // we could handle subtraction here for simplicity, it's just addition
    // I've seen examples where unary operator is handled seperately
    // and it may be worth reworking 'x - y' to 'x + -y'
    if (!this.eof && token?.value == "+") {
      let node: AstNode = {
        token: token
      }
      node.left = sub_expr
      this.next()
      node.right = this.add()
      return node
    }
    return sub_expr
  }

  // Main input function
  expression(tokens: Array<Token>): AstNode | undefined {
    // Note how the rules are parsed 
    this.tokens = tokens
    return this.add()
  }
}


export function evaluateAst(expressionTree: AstNode): number {
  if (expressionTree.token.type == TokenType.Number) {
    return parseInt(expressionTree.token.value) ? parseInt(expressionTree.token.value) : 0;
  }
  if (expressionTree.token.type == TokenType.Operator) {
    if (expressionTree.token.value == "*") {
      return evaluateAst(expressionTree.left!) * evaluateAst(expressionTree.right!)
    } else if (expressionTree.token.value == "+") {
      return evaluateAst(expressionTree.left!) + evaluateAst(expressionTree.right!)
    } else if (expressionTree.token.value == "(") {
      // don't need to handle ")" case, because it's always the right hand side of "("
      return evaluateAst(expressionTree.left!)
    }
  }
  throw new Error(`Unhandled expressionTree type of: '${expressionTree.token.type}'`)
}

export function evaluate(expression: string): number | undefined {
  let astParser = new Parser()
  let res: Token[] = astParser.lexicalAnalysis(expression)

  let ast = astParser.expression(res)
  return evaluateAst(ast!);
}
