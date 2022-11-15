import * as parser from '../src/parser'

describe("silly function", () => {
  test("unrecognized", () => {
    let expression = ".()"
    expect(() => {
      parser.evaluateExpression(expression)
    }).toThrow("Unrecognized character: '.' at 0 in '.()'")
  })

  test("multiplication", () => {
    let expression = "7 * 8"
    expect(parser.evaluateExpression(expression)).toBe(56)
  })
  test("multiplication", () => {
    let expression = "7 * 8"
    expect(parser.evaluateExpression(expression)).toBe(56)
  })

  test("addition only", () => {
    let expression = "7 + 8"
    expect(parser.evaluateExpression(expression)).toBe(15)
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
