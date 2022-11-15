import * as parser from '../src/parser'

describe("silly function", () => {
  test("multiplication", () => {
    let expression = "7*8"
    expect(parser.parseExpression(expression)).toBe("56")
  })

  test("addition only", () => {
    let expression = "7 + 8"
    expect(parser.parseExpression(expression)).toBe("15")
  })

  xtest("add then multiple", () => {
    let expression = "(2 + 7) * 8"
    expect(parser.parseExpression(expression)).toBe("58")
  })

  xtest("add then multiple", () => {
    let expression = "(2 * 7) + 8"
    expect(parser.parseExpression(expression)).toBe("22")
  })
})
