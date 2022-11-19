import * as logicParser from '../src/logic.parser'

describe("Lexing", () => {
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

  test("&&", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("&&")
    expect(res).toMatchObject([{value: "&&", type: logicParser.TokenType.Operator}])
  })

  test("||", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("||")
    expect(res).toMatchObject([{value: "||", type: logicParser.TokenType.Operator}])
  })

  test("<<", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("<<")
    expect(res).toMatchObject([{value: "<<", type: logicParser.TokenType.Operator}])
  })

  test("=", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("=")
    expect(res).toMatchObject([{value: "=", type: logicParser.TokenType.Operator}])
  })

  test("a == 1 && (b < 3)", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 && (b < 3)")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&&", type: logicParser.TokenType.Operator},
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "b", type: logicParser.TokenType.Word},
      {value: "<", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
    ])
  })
})

describe("AST parsing", ()  => {
  let parser: logicParser.Parser

  beforeEach(() => {
    parser = new logicParser.Parser()
  })

  test("a == 1", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "==", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "a", type: logicParser.TokenType.Word},
      },
      right: {
        token: {value: "1", type: logicParser.TokenType.Number},
      },
    })
  })

  test("a == 1 && b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 && b > 2")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "&&", type: logicParser.TokenType.Operator},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "&&", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "==", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "a", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "1", type: logicParser.TokenType.Number},
        },
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "2", type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("a == 1 || b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 || b > 2")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "||", type: logicParser.TokenType.Operator},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "||", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "==", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "a", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "1", type: logicParser.TokenType.Number},
        },
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "2", type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("(a == 1) || b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(a == 1) || b > 2")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
      {value: "||", type: logicParser.TokenType.Operator},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "||", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "(", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "==", type: logicParser.TokenType.Operator},
          left: {
            token: {value: "a", type: logicParser.TokenType.Word},
          },
          right: {
            token: {value: "1", type: logicParser.TokenType.Number},
          },
        },
        right: {
          token: {value: ")", type: logicParser.TokenType.Operator},
        }
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "2", type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("(a == 1 || b < 2) && c > 3", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(a == 1 || b < 2) && c > 3")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Operator},
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Operator},
      {value: "1", type: logicParser.TokenType.Number},
      {value: "||", type: logicParser.TokenType.Operator},
      {value: "b", type: logicParser.TokenType.Word},
      {value: "<", type: logicParser.TokenType.Operator},
      {value: "2", type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Operator},
      {value: "&&", type: logicParser.TokenType.Operator},
      {value: "c", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Operator},
      {value: "3", type: logicParser.TokenType.Number},
    ])

    let ast = parser.expression(res)
    expect(ast).toMatchObject({
      token: {value: "&&", type: logicParser.TokenType.Operator},
      left: {
        token: {value: "(", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "||", type: logicParser.TokenType.Operator},
          left: {
            token: {value: "==", type: logicParser.TokenType.Operator},
            left: {
              token: {value: "a", type: logicParser.TokenType.Word},
            },
            right: {
              token: {value: "1", type: logicParser.TokenType.Number},
            },
          },
          right: {
            token: {value: "<", type: logicParser.TokenType.Operator},
            left: {
              token: {value: "b", type: logicParser.TokenType.Word},
            },
            right: {
              token: {value: "2", type: logicParser.TokenType.Number},
            },
          },
        },
        right: {
          token: {value: ")", type: logicParser.TokenType.Operator},
        }
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Operator},
        left: {
          token: {value: "c", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: "3", type: logicParser.TokenType.Number},
        },
      },
    })
  })
})

describe("Evaluation", () => {
  let evaluater = new logicParser.Evaluater()

  const testCases = [
    {
      expr: "a == 1",
      facts: {"a": 1},
      value: true,
    },
    {
      expr: "a == 1",
      facts: {"a": 2},
      value: false,
    },
    {
      expr: "a == 1",
      facts: {"b": 1},
      value: false,
    },
    {
      expr: "a == 1 && b == 2",
      facts: {"a": 1, "b": 2},
      value: true
    },
    {
      expr: "a == 1 && b == 2",
      facts: {"a": 3, "b": 2},
      value: false
    },
    {
      expr: "a == 1 && b == 2",
      facts: {"a": 1, "b": 4},
      value: false
    },
    {
      expr: "a == 1 && b == 2",
      facts: {"a": 3, "b": 4},
      value: false
    },
    {
      expr: "a == 1 || b == 2",
      facts: {"a": 1, "b": 2},
      value: true
    },
    {
      expr: "a == 1 || b == 2",
      facts: {"a": 3, "b": 2},
      value: true
    },
    {
      expr: "a == 1 || b == 2",
      facts: {"a": 1, "b": 4},
      value: true
    },
    {
      expr: "a == 1 || b == 2",
      facts: {"a": 3, "b": 4},
      value: false
    },
    {
      expr: "(a == 1 || b == 2) && c == 3",
      facts: {"a": 1, "b": 2, "c": 3},
      value: true
    },
  ]

  testCases.forEach((testCase) => {
    const {expr, facts, value} = testCase
    const factsString: string = Object.entries(facts).map(
      ([k, v]) => {return k + "=" + v}
    ).join("&")
    const name = `${expr} for ${factsString}`
    test(name, () => {
      expect(evaluater.evaluate(expr, facts)).toBe(value)
    })
  })
})
