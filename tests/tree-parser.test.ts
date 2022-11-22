import * as parser from '../src/tree-parser'

describe("lexer", () => {
  test("number", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1")
    expect(res).toMatchObject([{value: "1", type: parser.TokenType.Number}])
  })
  test("double digit number", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("11")
    expect(res).toMatchObject([{value: "11", type: parser.TokenType.Number}])
  })
  test("+", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("+")
    expect(res).toMatchObject([{value: "+", type: parser.TokenType.Operator}])
  })
  test("*", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("*")
    expect(res).toMatchObject([{value: "*", type: parser.TokenType.Operator}])
  })
  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1 + (2 * 3)")
    expect(res).toMatchObject([
      {value: "1", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "(", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
      {value: "*", type: parser.TokenType.Operator},
      {value: "3", type: parser.TokenType.Number},
      {value: ")", type: parser.TokenType.Operator},
    ])
  })
})

describe("parser", ()  => {
  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1 + 2")
    expect(res).toMatchObject([
      {value: "1", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
    ])

    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "+",
      type: parser.TokenType.Operator,
      left: {
        value: "1",
        type: parser.TokenType.Number,
      },
      right: {
        value: "2",
        type: parser.TokenType.Number,
      },
    })
  })

  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1 + 2 + 3")
    expect(res).toMatchObject([
      {value: "1", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "3", type: parser.TokenType.Number},
    ])

    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "+",
      type: parser.TokenType.Operator,
      left: {
        value: "1",
        type: parser.TokenType.Number,
      },
      right: {
        value: "+",
        type: parser.TokenType.Operator,
        left: {
          value: "2",
          type: parser.TokenType.Number,
        },
        right: {
          value: "3",
          type: parser.TokenType.Number,
        },
      },
    })
  })

  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1 * 2")
    expect(res).toMatchObject([
      {value: "1", type: parser.TokenType.Number},
      {value: "*", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
    ])

    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "*",
      type: parser.TokenType.Operator,
      left: {
        value: "1",
        type: parser.TokenType.Number,
      },
      right: {
        value: "2",
        type: parser.TokenType.Number,
      },
    })
  })

  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("1 + 2 * 3")
    expect(res).toMatchObject([
      {value: "1", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
      {value: "*", type: parser.TokenType.Operator},
      {value: "3", type: parser.TokenType.Number},
    ])

    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "+",
      type: parser.TokenType.Operator,
      left: {
        value: "1",
        type: parser.TokenType.Number,
      },
      right: {
        value: "*",
        type: parser.TokenType.Operator,
        left: {
          value: "2",
          type: parser.TokenType.Number,
        },
        right: {
          value: "3",
          type: parser.TokenType.Number,
        },
      },
    })
  })

  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("(1 + 2) * 3")
    expect(res).toMatchObject([
      {value: "(", type: parser.TokenType.Operator},
      {value: "1", type: parser.TokenType.Number},
      {value: "+", type: parser.TokenType.Operator},
      {value: "2", type: parser.TokenType.Number},
      {value: ")", type: parser.TokenType.Operator},
      {value: "*", type: parser.TokenType.Operator},
      {value: "3", type: parser.TokenType.Number},
    ])

    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "*",
      type: parser.TokenType.Operator,
      left: {
        value: "(",
        type: parser.TokenType.Operator,
        left: {
          value: "+",
          type: parser.TokenType.Operator,
          left: {value: "1", type: parser.TokenType.Number},
          right: {value: "2", type: parser.TokenType.Number},
        },
        /*
        right: {
          value: ")",
          type: parser.TokenType.Operator
        },
        */
      },
      right: {
        value: "3",
        type: parser.TokenType.Number,
      },
    })
  })

  test("Create array", () => {
    let res: parser.ExprNode[] = parser.lexicalAnalysis("(1 + (2 + 3)) * 4")
    let astParser = new parser.Parser()
    let ast = astParser.expression(res)
    expect(ast).toMatchObject({
      value: "*",
      type: parser.TokenType.Operator,
      left: {
        value: "(",
        type: parser.TokenType.Operator,
        left: {
          value: "+",
          type: parser.TokenType.Operator,
          left: {value: "1", type: parser.TokenType.Number},
          right: {
            value: "(",
            type: parser.TokenType.Operator,
            left: {
              value: "+",
              type: parser.TokenType.Operator,
              left: {value: "2", type: parser.TokenType.Number},
              right: {
                value: "3", type: parser.TokenType.Number
              },
            },
            right: {
              value: ")", type: parser.TokenType.Operator
            },
          },
        },
        right: {
          value: ")", type: parser.TokenType.Operator
        },
      },
      right: {
        value: "4",
        type: parser.TokenType.Number,
      },
    })
  })
})

describe("silly function", () => {
  test("multiplication", () => {
    let expression = "7 * 8"
    expect(parser.evaluateExpression(expression)).toBe(56)
  })

  test("addition only", () => {
    let expression = "7 + 8"
    expect(parser.evaluateExpression(expression)).toBe(15)
  })

  test("doubleDigit", () => {
    let expression = "11 + 22"
    expect(parser.evaluateExpression(expression)).toBe(33)
  })

  test("addition only", () => {
    let expression = "2 + 2 + 2"
    expect(parser.evaluateExpression(expression)).toBe(6)
  })

  test("add to multiple", () => {
    let expression = "2 + (7 * 8)"
    expect(parser.evaluateExpression(expression)).toBe(58)
  })

  test("add then multiple", () => {
    let expression = "(2 + 7) * 8"
    expect(parser.evaluateExpression(expression)).toBe(72)
  })

  test("add then multiple", () => {
    let expression = "(2 * 7) + 8"
    expect(parser.evaluateExpression(expression)).toBe(22)
  })
})

xdescribe("", () => {
  test("add then multiple", () => {
    let expression = "(2 + 7) * 8"
    expect(parser.evaluateExpression(expression)).toBe(72)
  })
})
