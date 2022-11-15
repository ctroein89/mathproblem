import * as parser from '../src/parser'

describe("silly function", () => {
  test("multiplication", () => {
    let expression = "7*8"
    expect(parser.parseExpression(expression)).toBe(56)
  })

  test("addition only", () => {
    let expression = "7 + 8"
    expect(parser.parseExpression(expression)).toBe(15)
  })
})
