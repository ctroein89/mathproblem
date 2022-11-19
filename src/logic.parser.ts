const numberRegex = /[\d\.]/
const wordRegex = /[A-Za-z\d-_]/
const permittedKeywords = /[\&|<>=\(\)]/
const startSubExpression = /\(/;
const endSubExpression = /\)/;

enum Keyword {
  AND = "&&",
  OR = "||",
  WHERE = "where",
  IN = "in",
  PARENTHESES_OPEN = "(",
  PARENTHESES_CLOSE = ")",
  EQUALTO = "==",
  GREAT_THAN_OR_EQUALTO = ">=",
  LESS_THAN_OR_EQUALTO = "<=",
  GREAT_THAN = ">",
  LESS_THAN = "<",
  NOT_EQUAL_TO = "!=",
}

const keywordMapping: {[key:string]: Keyword} = {
  "&&": Keyword.AND,
  "||": Keyword.OR,
  "where": Keyword.WHERE,
  "in": Keyword.IN,
  "(": Keyword.PARENTHESES_OPEN,
  ")": Keyword.PARENTHESES_CLOSE,
  "==": Keyword.EQUALTO,
  ">=": Keyword.GREAT_THAN_OR_EQUALTO,
  "<=": Keyword.LESS_THAN_OR_EQUALTO,
  ">": Keyword.GREAT_THAN,
  "<": Keyword.LESS_THAN,
  "!=": Keyword.NOT_EQUAL_TO,
}





const Comparitors = [
  Keyword.EQUALTO,
  Keyword.GREAT_THAN_OR_EQUALTO,
  Keyword.LESS_THAN_OR_EQUALTO,
  Keyword.GREAT_THAN,
  Keyword.LESS_THAN,
  Keyword.NOT_EQUAL_TO as string,
]

export enum TokenType {
  Keyword = "OP",
  Number = "NUM",
  Word = "WORD",
}

export interface Token {
  value: string | Keyword | number;
  type: TokenType;
  debug?: any;
}

export interface KeywordToken extends Token {
  value: Keyword;
  type: TokenType;
  debug?: any;
}

export interface WordToken extends Token {
  value: string;
  type: TokenType;
  debug?: any;
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
  expr: string | undefined;

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
    let tokens: Token[] = []
    let inProgressToken: string = ""
    let typeInProgress: TokenType | undefined
    this.expr = expression
    let i = 0
    let start: number = 0

    function createToken() {
      let t: Token = {
        value: inProgressToken,
        type: TokenType.Word,
        debug: {
          start: start,
          end: i,
        }
      }
      // if word in keyword, use that instead
      if (keywordMapping[inProgressToken]) {
        t.type = TokenType.Keyword
      }

      if (typeInProgress == TokenType.Number) {
        let num: number = /\./.test(inProgressToken) ? parseFloat(inProgressToken) : parseInt(inProgressToken)
        t = {
          value: num,
          type: TokenType.Number,
        }
      }
      if (!!t) tokens.push(t)
      inProgressToken = ""
      typeInProgress = undefined
      start = i
    }

    function checkCompleteToken(c: string) {
      if (inProgressToken) {
        if (typeInProgress == TokenType.Number && !numberRegex.test(c)) {
          createToken()
        } else if (typeInProgress == TokenType.Word && !wordRegex.test(c)) {
          createToken()
        } else if (keywordMapping[inProgressToken]) {
          createToken()
        }
      }
    }

    for (let c of expression) {
      checkCompleteToken(c)

      let validChar = false
      if (permittedKeywords.test(c)) {
        validChar = true
        if (!typeInProgress) typeInProgress = TokenType.Keyword
      } else if (numberRegex.test(c)) {
        validChar = true
        if (!typeInProgress) typeInProgress = TokenType.Number
      } else if (wordRegex.test(c)) {
        validChar = true
        if (!typeInProgress) typeInProgress = TokenType.Word
      } else if (c === " ") {
      } else {
        throw new Error(`Invalid character: '${c}'`)
      }
      if (validChar) {
        inProgressToken += c
      }
      i++
    }
    createToken()

    this.errorCheckLexer(tokens)

    return tokens
  }

  errorCheckLexer(tokens: Token[]) {
    let lastToken: Token | undefined

    for (let i = 0; i < tokens.length; i++) {
      let token: Token = tokens[i]
      if (lastToken && (
        lastToken?.type != TokenType.Keyword && token.type != TokenType.Keyword
      )) {
        throw new Error(`${lastToken.value} ${token.value} forms an illegal combination`)
      }
      lastToken = token
    }
  }

  parseLiteral(): AstNode | undefined {
    if (!this.eof && [TokenType.Number, TokenType.Word].includes(this.tokens[this.i]?.type)) {
      let node: AstNode = {
        token: this.tokens[this.i]
      }
      return node
    }
  }

  parentheses(): AstNode | undefined {
    let token = this.tokens[this.i]
    let node: AstNode
    if (!this.eof && token?.value == '(') {
      this.next()
      node = {
        token: token
      }
      node.left = this.and()
      if (!this.eof && this.tokens[this.i]?.value == ')') {
        node.right = {
          token: this.tokens[this.i]
        }
      } else {
        this.back()
      }
      return node
    }
    return this.parseLiteral()
  }

  comparitor(): AstNode | undefined {
    let sub_expr = this.parentheses()
    this.next()
    let token = this.tokens[this.i]
    // we could handle division here for simplicity, it's just multiplication
    // In a classic example of this, 'x / y * z' is treated as 'x * (1/y) * z'
    // but it's worth clarifying the rules to ensure that that is correct, ie
    // it's equally valid to read it as 'x / (y * z)'
    if (!this.eof && [
      Keyword.EQUALTO as string,
      Keyword.GREAT_THAN_OR_EQUALTO as string,
      Keyword.LESS_THAN_OR_EQUALTO as string,
      Keyword.GREAT_THAN as string,
      Keyword.LESS_THAN as string,
      Keyword.NOT_EQUAL_TO as string,
    ].includes(token?.value as string)) {
      let node: AstNode = {
        token: token as Token
      }
      node.left = sub_expr
      this.next()
      node.right = this.comparitor()
      return node
    } else {
      this.back()
    }
    return sub_expr
  }

  or(): AstNode | undefined {
    let sub_expr = this.comparitor()
    this.next()
    let token = this.tokens[this.i]
    // we could handle subtraction here for simplicity, it's just addition
    // I've seen examples where unary operator is handled seperately
    // and it may be worth reworking 'x - y' to 'x + -y'
    if (!this.eof && token?.value as string == Keyword.OR) {
      let node: AstNode = {
        token: token
      }
      node.left = sub_expr
      this.next()
      node.right = this.and()
      return node
    }
    return sub_expr
  }

  and(): AstNode | undefined {
    let sub_expr = this.comparitor()
    this.next()
    let token = this.tokens[this.i]
    // we could handle subtraction here for simplicity, it's just addition
    // I've seen examples where unary operator is handled seperately
    // and it may be worth reworking 'x - y' to 'x + -y'
    if (!this.eof &&
      typeof token.value === "string" &&
      [Keyword.AND as string, Keyword.OR as string].includes(token.value)
    ) {
      let node: AstNode = {
        token: token
      }
      node.left = sub_expr
      this.next()
      node.right = this.and()
      return node
    }
    return sub_expr
  }

  // Main input function
  expression(tokens: Array<Token>): AstNode | undefined {
    // Note how the rules are parsed 
    this.tokens = tokens
    return this.and()
  }
}

export class Evaluater {
  compareLeaves(ast: AstNode, facts: any): boolean {
    if (ast.token.type != TokenType.Keyword) {
      return false
    }

    let value: string | number
    let leftHandSide: string | number | undefined = ast.left?.token?.value
    if (leftHandSide && typeof leftHandSide === "string" && typeof facts === "object") {
      value = facts[leftHandSide]
    } else {
      return false
    }

    let rightHandSide: string | number | undefined = ast.right?.token?.value
    if (!rightHandSide) {
      return false
    }
    switch (ast.token.value as Keyword) {
      case Keyword.EQUALTO:
        return value == rightHandSide
        break;
      case Keyword.GREAT_THAN_OR_EQUALTO:
        return value >= rightHandSide
        break;
      case Keyword.LESS_THAN_OR_EQUALTO:
        return value <= rightHandSide
        break;
      case Keyword.GREAT_THAN:
        return value > rightHandSide
        break;
      case Keyword.LESS_THAN:
        return value < rightHandSide
        break;
      case Keyword.NOT_EQUAL_TO:
        return value != rightHandSide
        break;
    }

    return false
  }

  evaluateBoolean(ast: AstNode, facts: Object): boolean {
    const token = ast.token
    if (token.value === Keyword.AND) {
      return this.evaluateAst(ast.left!, facts) &&
        this.evaluateAst(ast.right!, facts)
    }
    if (token.value === Keyword.OR) {
      return this.evaluateAst(ast.left!, facts) ||
        this.evaluateAst(ast.right!, facts)
    }
    throw new Error(`Unhandled boolean operator: '${token.value}'`)
  }

  evaluateAst(ast: AstNode, facts: Object): boolean {
    let result: boolean | undefined
    const token = ast.token
    if (token.type == TokenType.Keyword) {
      if (typeof token.value === "string" && [
        Keyword.AND as string,
        Keyword.OR as string,
      ].includes(token.value)) {
        return this.evaluateBoolean(ast, facts)
      } else if (Comparitors.includes(token.value as Keyword)) {
        // comparisons
        return  this.compareLeaves(ast, facts)
      } else if (typeof token.value === "string" && ["(", ")"].includes(token.value)) {
        return this.evaluateAst(ast.left!, facts)
      } else {
        throw new Error(`Unhandled operator: '${token.value}'. This is a problem is the expression evaluation.`)
      }
    }

    throw new Error(`Unhandled ast type of: '${ast.token.type}' for ${JSON.stringify(ast.token)}`)
  }

  evaluate(expression: string, facts: Object): boolean {
    let astParser = new Parser()
    let res: Token[] = astParser.lexicalAnalysis(expression)

    let ast = astParser.expression(res)
    return this.evaluateAst(ast!, facts);
  }
}
