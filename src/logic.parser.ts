const numberRegex = /[\d\.]/
const wordRegex = /[A-Za-z\d-_]/
const permittedKeywords = /[\&|<>=\(\)]/

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
  Keyword = "KEY",
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

  private next(): void {
    this.i = this.i + 1
    if (this.i >= this.tokens.length) {
      this.eof = true;
      return
    }
  }

  private back(): void {
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
  public lexicalAnalysis(expression: string): Token[] {
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
        /*
        debug: {
          s: start,
          e: i,
        }
        // */
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

  private errorCheckLexer(tokens: Token[]) {
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

  private parseLiteral(): AstNode | undefined {
    if (!(!this.eof && [TokenType.Number, TokenType.Word].includes(this.tokens[this.i]?.type))) {
      if (this.shouldLog) console.log("parseLiteral", "you get nothing")
      return
    }

    let node: AstNode = {
      token: this.tokens[this.i]
    }
    this.render(node)
    return node
  }

  private parentheses(): AstNode | undefined {
    let sub_expr = this.parseLiteral()
    if (sub_expr) {
      return sub_expr
    }

    let token = this.tokens[this.i]
    let node: AstNode
    if (this.eof || token?.value !== '(') {
      throw new Error("Getting neither a literal nor a '(' is unexpected")
    }

    this.next()
    node = {
      token: token
    }
    this.render(node)
    node.left = this.expression()
    if (this.eof || this.tokens[this.i]?.value !== ')') {
      this.back()
    }

    node.right = {
      token: this.tokens[this.i]
    }
    this.render(node)
    return node
  }

  private comparitor(): AstNode | undefined {
    let sub_expr = this.parentheses()
    const keywords = [
      Keyword.EQUALTO,
      Keyword.GREAT_THAN_OR_EQUALTO,
      Keyword.LESS_THAN_OR_EQUALTO,
      Keyword.GREAT_THAN,
      Keyword.LESS_THAN,
      Keyword.NOT_EQUAL_TO,
    ]
    // return this.keyword(keywords, sub_expr)
    this.next()
    let token = this.tokens[this.i]
    if (!(!this.eof && keywords.includes(token?.value as Keyword))) {
      this.back()
      return sub_expr
    }

    let node: AstNode = {
      token: token as Token
    }
    node.left = sub_expr
    this.next()
    node.right = this.comparitor()
    this.render(node)
    return node
  }

  private keyword(keywords: Keyword[], sub_expr: AstNode | undefined, shouldBackStep: boolean = true): AstNode | undefined {
    this.next()
    let token = this.tokens[this.i]
    if (this.eof ||
      typeof token.value !== "string" ||
      !keywords.includes(token.value as Keyword)
    ) {
      if (shouldBackStep) this.back()
      this.render(sub_expr!)
      return sub_expr
    }

    let node: AstNode = {
      token: token
    }
    node.left = sub_expr
    this.next()
    node.right = this.expression()
    this.render(node)
    return node
  }

  private and(): AstNode | undefined {
    let sub_expr = this.comparitor()
    return this.keyword([Keyword.AND, Keyword.OR], sub_expr)
  }

  private where(): AstNode | undefined {
    let sub_expr = this.and()
    return this.keyword([Keyword.WHERE], sub_expr, false)
  }

  private expression(): AstNode | undefined {
    let sub_expr = this.where()
    this.render(sub_expr!)
    return sub_expr
  }

  // Main input function
  public parse(tokens: Array<Token>): AstNode | undefined {
    this.tokens = tokens
    return this.expression()
  }

  private render(ast: AstNode) {
    if (!this.shouldLog) return

    function renderLine(ast: AstNode, level: number): string {
      let line = ""
      for (let i = 0; i < level; i++) {
        line += "\t"
      }
      line += `-> '${ast.token.value}'\n`
      if (ast.left) {
        line += renderLine(ast.left, level + 1)
      }
      if (ast.right) {
        line += renderLine(ast.right, level + 1)
      }
      return line
    }

    console.log("expression", this.i, this.tokens[this.i], '\n', renderLine(ast, 0))
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
      case Keyword.GREAT_THAN_OR_EQUALTO:
        return value >= rightHandSide
      case Keyword.LESS_THAN_OR_EQUALTO:
        return value <= rightHandSide
      case Keyword.GREAT_THAN:
        return value > rightHandSide
      case Keyword.LESS_THAN:
        return value < rightHandSide
      case Keyword.NOT_EQUAL_TO:
        return value != rightHandSide
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

  evaluateAst(ast: AstNode, facts: Object | Object[]): boolean {
    const token = ast.token
    if (token.type !== TokenType.Keyword) {
      throw new Error(`Unhandled ast type of: '${ast.token.type}' for ${JSON.stringify(ast.token)}`)
    }

    if (typeof token.value === "string" && [
      Keyword.AND as string,
      Keyword.OR as string,
    ].includes(token.value)) {
      return this.evaluateBoolean(ast, facts)
    } else if (Comparitors.includes(token.value as Keyword)) {
      return  this.compareLeaves(ast, facts)
    } else if (
      typeof token.value === "string" &&
      [
        Keyword.PARENTHESES_OPEN as string,
        Keyword.PARENTHESES_CLOSE as string
      ].includes(token.value)) {
      return this.evaluateAst(ast.left!, facts)
    } else if (typeof token.value === "string" && ["(", ")"].includes(token.value)) {
      return this.evaluateAst(ast.left!, facts)
    } else if (token.value as Keyword == Keyword.WHERE) {
      if (Array.isArray(facts)) {

        let any = false
        facts.forEach((f) => {
          let thisWas
          if (this.evaluateAst(ast.right!, f)) {
            thisWas = this.evaluateAst(ast.left!, f)
          }
          any = any || !!thisWas
        })
        return any
      } else {
        if (this.evaluateAst(ast.right!, facts)) {
          return this.evaluateAst(ast.left!, facts)
        }
      }
      return false
    } else {
      throw new Error(`Unhandled operator: '${token.value}'. This is a problem is the expression evaluation.`)
    }
  }

  evaluate(expression: string, facts: Object): boolean {
    let astParser = new Parser()
    let res: Token[] = astParser.lexicalAnalysis(expression)

    let ast = astParser.parse(res)
    return this.evaluateAst(ast!, facts);
  }
}
