import * as logicParser from '../src/logic.parser'

describe("Lexing", () => {
  let parser: logicParser.Parser

  beforeEach(() => {
    parser = new logicParser.Parser()
  })

  const testCases = [
    {
      expr: "1",
      match: [
        {value: 1, type: logicParser.TokenType.Number}
      ],
    },
    {
      expr: "11",
      match: [
        {value: 11, type: logicParser.TokenType.Number}
      ],
    },
    {
      expr: "1.2",
      match: [
        {value: 1.2, type: logicParser.TokenType.Number}
      ],
    },
    {
      expr: "&&",
      match: [
        {value: "&&", type: logicParser.TokenType.Keyword}
      ],
    },
    {
      expr: "||",
      match: [
        {value: "||", type: logicParser.TokenType.Keyword}
      ],
    },
    {
      expr: "==",
      match: [
        {value: "==", type: logicParser.TokenType.Keyword}
      ],
    },
    {
      expr: "where",
      match: [
        {value: "where", type: logicParser.TokenType.Keyword}
      ],
    },
    {
      expr: "a == 1 && (b < 3)",
      match: [
        {value: "a", type: logicParser.TokenType.Word},
        {value: "==", type: logicParser.TokenType.Keyword},
        {value: 1, type: logicParser.TokenType.Number},
        {value: "&&", type: logicParser.TokenType.Keyword},
        {value: "(", type: logicParser.TokenType.Keyword},
        {value: "b", type: logicParser.TokenType.Word},
        {value: "<", type: logicParser.TokenType.Keyword},
        {value: 3, type: logicParser.TokenType.Number},
        {value: ")", type: logicParser.TokenType.Keyword},
      ],
    },
  ]

  testCases.forEach((testCase) => {
    const {expr, match} = testCase
    test(expr, () => {
      expect(
        parser.lexicalAnalysis(expr)
      ).toMatchObject(match)
    })
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
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      token: {value: "==", type: logicParser.TokenType.Keyword},
      left: {
        token: {value: "a", type: logicParser.TokenType.Word},
      },
      right: {
        token: {value: 1, type: logicParser.TokenType.Number},
      },
    })
  })

  test("a == 1 && b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 && b > 2")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
      {value: "&&", type: logicParser.TokenType.Keyword},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Keyword},
      {value: 2, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      token: {value: "&&", type: logicParser.TokenType.Keyword},
      left: {
        token: {value: "==", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "a", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 1, type: logicParser.TokenType.Number},
        },
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 2, type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("a == 1 || b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 || b > 2")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
      {value: "||", type: logicParser.TokenType.Keyword},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Keyword},
      {value: 2, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      token: {value: "||", type: logicParser.TokenType.Keyword},
      left: {
        token: {value: "==", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "a", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 1, type: logicParser.TokenType.Number},
        },
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 2, type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("(a == 1) || b > 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(a == 1) || b > 2")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Keyword},
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Keyword},
      {value: "||", type: logicParser.TokenType.Keyword},
      {value: "b", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Keyword},
      {value: 2, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      token: {value: "||", type: logicParser.TokenType.Keyword},
      left: {
        token: {value: "(", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "==", type: logicParser.TokenType.Keyword},
          left: {
            token: {value: "a", type: logicParser.TokenType.Word},
          },
          right: {
            token: {value: 1, type: logicParser.TokenType.Number},
          },
        },
        right: {
          token: {value: ")", type: logicParser.TokenType.Keyword},
        }
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 2, type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("(a == 1 || b < 2) && c > 3", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("(a == 1 || b < 2) && c > 3")
    expect(res).toMatchObject([
      {value: "(", type: logicParser.TokenType.Keyword},
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
      {value: "||", type: logicParser.TokenType.Keyword},
      {value: "b", type: logicParser.TokenType.Word},
      {value: "<", type: logicParser.TokenType.Keyword},
      {value: 2, type: logicParser.TokenType.Number},
      {value: ")", type: logicParser.TokenType.Keyword},
      {value: "&&", type: logicParser.TokenType.Keyword},
      {value: "c", type: logicParser.TokenType.Word},
      {value: ">", type: logicParser.TokenType.Keyword},
      {value: 3, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      token: {value: "&&", type: logicParser.TokenType.Keyword},
      left: {
        token: {value: "(", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "||", type: logicParser.TokenType.Keyword},
          left: {
            token: {value: "==", type: logicParser.TokenType.Keyword},
            left: {
              token: {value: "a", type: logicParser.TokenType.Word},
            },
            right: {
              token: {value: 1, type: logicParser.TokenType.Number},
            },
          },
          right: {
            token: {value: "<", type: logicParser.TokenType.Keyword},
            left: {
              token: {value: "b", type: logicParser.TokenType.Word},
            },
            right: {
              token: {value: 2, type: logicParser.TokenType.Number},
            },
          },
        },
        right: {
          token: {value: ")", type: logicParser.TokenType.Keyword},
        }
      },
      right: {
        token: {value: ">", type: logicParser.TokenType.Keyword},
        left: {
          token: {value: "c", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 3, type: logicParser.TokenType.Number},
        },
      },
    })
  })

  test("a == 1 where b == 2", () => {
    let res: logicParser.Token[] = parser.lexicalAnalysis("a == 1 where b == 2")
    expect(res).toMatchObject([
      {value: "a", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 1, type: logicParser.TokenType.Number},
      {value: "where", type: logicParser.TokenType.Keyword},
      {value: "b", type: logicParser.TokenType.Word},
      {value: "==", type: logicParser.TokenType.Keyword},
      {value: 2, type: logicParser.TokenType.Number},
    ])

    let ast = parser.parse(res)
    expect(ast).toMatchObject({
      left: {
        left: {
          token: {value: "a", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 1, type: logicParser.TokenType.Number},
        },
        token: {value: "==", type: logicParser.TokenType.Keyword},
      },
      right: {
        left: {
          token: {value: "b", type: logicParser.TokenType.Word},
        },
        right: {
          token: {value: 2, type: logicParser.TokenType.Number},
        },
        token: {value: "==", type: logicParser.TokenType.Keyword},
      },
      token: {value: "where", type: logicParser.TokenType.Keyword},
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
    {
      expr: "a == 1 where b == 2",
      facts: {"a": 1, "b": 2, "c": 3},
      value: true
    },
    {
      expr: "a == 1 where b == 2",
      facts: [
        {"a": 1, "b": 3, "c": 3},
      ],
      value: false
    },
    {
      expr: "a == 1 where b == 2",
      facts: [
        {"a": 1, "b": 2, "c": 3},
        {"a": 1, "b": 3, "c": 3},
      ],
      value: true
    },
    {
      expr: "a == 1 where b == 2",
      facts: [
        {"a": 2, "b": 2, "c": 3},
        {"a": 1, "b": 3, "c": 3},
      ],
      value: false
    },
    {
      expr: "a == 1 where b == 2",
      facts: [
        {"a": 2, "b": 2, "c": 3},
        {"a": 2, "b": 3, "c": 3},
      ],
      value: false
    },
    {
      expr: "(a == 1 && c == 3) where b == 2",
      facts: [
        {"a": 2, "b": 2, "c": 3},
        {"a": 2, "b": 3, "c": 3},
      ],
      value: false
    },
    {
      expr: "(a == 1 && c == 3) where b == 2",
      facts: [
        {"a": 1, "b": 2, "c": 3},
        {"a": 2, "b": 3, "c": 3},
      ],
      value: true
    },
  ]

  testCases.forEach((testCase) => {
    const {expr, facts, value} = testCase
    let factsString: string = ""
    if (Array.isArray(facts)) {
      factsString = facts.map<string>(
        (f) => {
          return Object.entries(f).map(
            ([k, v]) => { return k + "=" + v }
          ).join("&")
        }
      ).join(", ")
    } else {
      factsString = Object.entries(facts).map(
        ([k, v]) => {return k + "=" + v}
      ).join("&")
    }
    const name = `${expr} for ${factsString}`
    test(name, () => {
      expect(evaluater.evaluate(expr, facts)).toBe(value)
    })
  })
})
