import * as logicParser from '../src/logic.parser'

describe("logical lexer", () => {
  let parser: logicParser.Parser

  beforeEach(() => {
    parser = new logicParser.Parser()
  })

  test("number", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1")
    expect(res).toMatchObject([{value: "1", type: logicParser.TokenType.Number}])
  })
  test("double digit number", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("11")
    expect(res).toMatchObject([{value: "11", type: logicParser.TokenType.Number}])
  })
  test("1.2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1.2")
    expect(res).toMatchObject([{value: "1.2", type: logicParser.TokenType.Number}])
  })
  test("&", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("&")
    expect(res).toMatchObject([{value: "&", type: logicParser.TokenType.Operator}])
  })
  test("=", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("=")
    expect(res).toMatchObject([{value: "=", type: logicParser.TokenType.Operator}])
  })
  test("Create array", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1 & (2 = 3)")
    expect(res).toMatchObject([
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: "=", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
    ])
  })
})

describe("logical parser", ()  => {
  let parser: logicParser.Parser

  beforeEach(() => {
    parser = new logicParser.Parser()
  })

  test("1 & 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1 & 2")
    expect(res).toMatchObject([
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "&", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "1", type: logicParser.TokenType.Number},
      },
      right: {
        token: {value: "2", type: logicParser.TokenType.Number},
      },
    })
  })

  test("1 & 2 & 3", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1 & 2 & 3")
    expect(res).toMatchObject([
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "&", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "1", type: logicParser.TokenType.Number},
      },
      right: {
        token: {value: "&", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "2", type: logicParser.TokenType.Number},
        },
        right: {
          token: {value: "3", type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("1 = 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1 = 2")
    expect(res).toMatchObject([
      {value: "1", type: logicParser.TokenType.Number},
      {value: "=", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "=", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "1", type: logicParser.TokenType.Number},
      },
      right: {
        token: {value: "2", type: logicParser.TokenType.Number},
      },
    })
  })

  test("1 & 2 = 3", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("1 & 2 = 3")
    expect(res).toMatchObject([
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: "=", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "&", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "1", type: logicParser.TokenType.Number},
      },
      right: {
        token: {value: "=", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "2", type: logicParser.TokenType.Number},
        },
        right: {
          token: {value: "3", type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("(1 & 2) = 3", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(1 & 2) = 3")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
      {value: "=", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
    ])

    parser.shouldLog = true;
    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "=", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "(", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "&", type: logicParser.TokenType.Operator},
          left: {
            token: {value: "1", type: logicParser.TokenType.Number},
          },
          right: {
            token: {value: "2", type: logicParser.TokenType.Number},
          },
        },
      },
      right: {
        token: {value: "3", type: logicParser.TokenType.Number},
      },
    })
  })

  test("(1 & (2 & 3)) = 4", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(1 & (2 & 3)) = 4")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: "&", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
      {value: ")", type: logicParser.TokenType.Operator},
      {value: "=", type: logicParser.TokenType.Operator},
      {value: "4", type: logicParser.TokenType.Number},
    ])

    parser.shouldLog = true;
    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "=", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "(", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "&", type: logicParser.TokenType.Operator},
          left: {
            token: {value: "1", type: logicParser.TokenType.Number},
          },
          right: {
            token: {value: "(", type: logicParser.TokenType.Operator},
            left: {
              token: {value: "&", type: logicParser.TokenType.Operator},
              left: {
                token: {value: "2", type: logicParser.TokenType.Number},
              },
              right: {
                token: {value: "3", type: logicParser.TokenType.Number},
              },
            },
            right: {
              token: {value: ")", type: logicParser.TokenType.Operator},
            },
          },
        },
        right: {
          token: {value: ")", type: logicParser.TokenType.Operator},
        },
      },
      right: {
        token: {value: "4", type: logicParser.TokenType.Number},
      },
    })
  })
})

xdescribe("silly function", () => {
  test("multiplication", () => {
    let expression = "7 = 8"
    expect(logicParser.evaluate(expression)).toBe(56)
  })

  test("addition only", () => {
    let expression = "7 & 8"
    expect(logicParser.evaluate(expression)).toBe(15)
  })

  test("doubleDigit", () => {
    let expression = "11 & 22"
    expect(logicParser.evaluate(expression)).toBe(33)
  })

  test("addition only", () => {
    let expression = "2 & 2 & 2"
    expect(logicParser.evaluate(expression)).toBe(6)
  })

  test("add to multiple", () => {
    let expression = "2 & (7 = 8)"
    expect(logicParser.evaluate(expression)).toBe(58)
  })

  test("add then multiple", () => {
    let expression = "(2 & 7) = 8"
    expect(logicParser.evaluate(expression)).toBe(72)
  })

  test("add then multiple", () => {
    let expression = "(2 = 7) & 8"
    expect(logicParser.evaluate(expression)).toBe(22)
  })
})

xdescribe("", () => {
  test("add then multiple", () => {
    let expression = "(2 & 7) = 8"
    expect(logicParser.evaluate(expression)).toBe(72)
  })
})
