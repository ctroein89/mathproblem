const digitCheck = /[\d]/
const permittedOperators = /[*/+-]/
const startSubExpression = /\(/;
const endSubExpression = /\)/;

interface ExprStack {
  values: Array<ExprStack | number>;
  operator: string;
  i: number
}

enum Operators {
  Multiply = 1,
  Add = 2,
}

function parseExpression(expression: string): ExprStack {
  // this solution is very focused on just solving math problems

  let stack: ExprStack = {
    values: [],
    operator: "",
    i: -1
  }

  console.log("stack", expression)

  let valueUnderConstruction = "";
  let lastFullValue: number | undefined;

  for (let i = expression.length; i>=0; i--) {
    let current = expression[i]
    stack.i = i

    if (digitCheck.test(current)) {
      valueUnderConstruction = current + valueUnderConstruction
    } else if (valueUnderConstruction) {
      lastFullValue = parseInt(valueUnderConstruction)
      stack.values.push(lastFullValue)
      console.log("new value", valueUnderConstruction)
      valueUnderConstruction = "";
    }

    if (permittedOperators.test(current)) {
      if (stack.operator) {
        if (stack.operator !== current) {
          // I haven't solved how to read differing types of operators without
          // grouping (eg 'x * y + z', can only do '(x * y) + z)')
          // it should be as simple as implicitly treating it as a new grouping
          // but I haven't decided on how to implement look-forwards/look-backs
          // but there should be a minimally invasive version of look-forwards
          // to get this right
          throw new Error("Operator changed, which is unhandled")
        }
      } else {
        stack.operator = current;
        console.log("set operator", stack.operator)
      }
    }

    if (startSubExpression.test(current)) {
      break
    }

    if (endSubExpression.test(current)) {
      const substack = parseExpression(expression.substring(0, i))
      stack.values.push(substack)
      i = substack.i
    }
  }

  // edge case, the variable is at the end
  if (valueUnderConstruction) {
    stack.values.push(parseInt(valueUnderConstruction))
    console.log("handle last value", valueUnderConstruction)
    valueUnderConstruction = "";
  }
  console.log("returning", JSON.stringify(stack, null, 2))

  return stack
}

function evaluateExpressionStack(stack: ExprStack): number | undefined {
  let res: number | undefined;
  stack.values.forEach((rawValue: ExprStack | number) => {
    let value: number | undefined;
    if (typeof rawValue === "object") {
      value = evaluateExpressionStack(rawValue);
    } else if (typeof rawValue === "number") {
      value = rawValue;
    }

    if (typeof res === "undefined") {
      res = value
    } else if (typeof value === "number") {
      if (stack.operator === "*") res = res * value
      if (stack.operator === "+") res = res + value
    }
    console.log("evaluating", JSON.stringify(stack), value, res)
  })
  return res
}

export function evaluateExpression(expression: string): number | undefined {
  const expressionStack = parseExpression(expression);
  return evaluateExpressionStack(expressionStack);
}
