import * as parser from '../src/stack-parser'

describe("silly function", () => {
  test("test regex", () => {
    expect(/\)/.test("\)")).toBe(true)
    expect(/\)/.test(")")).toBe(true)
  })

  test("multiplication", () => {
    let expression = "7 * 8"
    expect(parser.evaluateExpression(expression)).toBe(56)
  })

  test("addition only", () => {
    let expression = "7 + 8"
    expect(parser.evaluateExpression(expression)).toBe(15)
  })

  test("doubleDigit", () => {
    let expression = "12 + 23"
    expect(parser.evaluateExpression(expression)).toBe(35)
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
    let expression = "2 * 7 + 8"
    expect(parser.evaluateExpression(expression)).toBe(22)
  })
})
