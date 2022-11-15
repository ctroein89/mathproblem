const digitCheck = /[\d]/
const permittedOperators = /[*/+-]/
const startSubExpression = /\(/;
const endSubExpression = /\)/;

function getFullValue(expression: string) {
  let accumulated: string = ""
  for (let i = 0; i < expression.length; i++) {
    if (!digitCheck.test(expression[i])) {
      return {val: parseInt(accumulated), i: i}
    }
    accumulated = accumulated + expression[i];
  }
  return {val: parseInt(accumulated) || -1, i: expression.length}
}


interface ExprTree {
  left: number | ExprTree | undefined;
  right: number | ExprTree | undefined;
  operator: string | undefined;
  i: number;
}

export function parseExpression(expression: string, level?: undefined | number): ExprTree {
  if (!level) level = 1; // logged for debugging
  let tree: ExprTree = {
    left: undefined,
    operator: undefined,
    right: undefined,
    i: 0,
  }

  let i = 0;
  while(i<expression.length) {
    tree.i = i;
    if (!tree.left) {
      if (startSubExpression.test(expression[i])) {
        let subExpr = expression.substring(
          i + 1,
          expression.search(/\)/) || expression.length
        )
        tree.left = parseExpression(subExpr, level + 1)
        i = i + tree.left.i + 1;
      } else if (digitCheck.test(expression[i])) {
        let subExpr = expression.substring(i,expression.length)
        let fullValue = getFullValue(subExpr)
        tree.left = fullValue.val
        i = i + fullValue.i
      }

    } else if (permittedOperators.test(expression[i]) && !tree.operator) {
      tree.operator = expression[i];

    } else if (!tree.right) {
      if (startSubExpression.test(expression[i])) {
        let subExpr = expression.substring(
          i + 1,
          expression.search(/\)/) || expression.length
        )
        tree.right = parseExpression(subExpr, level + 1)
        i = i + tree.right.i + 1;
      } else if (digitCheck.test(expression[i])) {
        let subExpr = expression.substring(i,expression.length)
        let fullValue = getFullValue(subExpr)
        tree.right = fullValue.val
        i = i + fullValue.i
      }

    } else if (endSubExpression.test(expression[i])) {
      break;

    } else if (tree.left && tree.right && tree.operator) {
      let leftTree = tree
      tree = {
        left: leftTree,
        operator: undefined,
        right: undefined,
        i: i,
      }
      if (permittedOperators.test(expression[i])) {
        tree.operator = expression[i];
      }

    } else if (/ /.test(expression[i])) {
      // do nothing

    } else {
      throw new Error(`Unrecognized character: '${expression[i]}' at ${i} in '${expression}'`)
    }

    i++
  }
  if (!tree.operator) {
    throw new Error("invalid tree: no operator: " + JSON.stringify(tree))
  }

  return tree;
}

export function evaluateExpressionTree(expressionTree: ExprTree): number | undefined {
  let left: number | undefined;
  let right: number | undefined;
  const operator = expressionTree.operator;

  if (typeof expressionTree.left === "object") {
    left = evaluateExpressionTree(expressionTree.left)
  } else if (typeof expressionTree.left === "number") {
    left = expressionTree.left;
  } else if (typeof expressionTree.left === "string") {
    left = parseInt(expressionTree.left);
  }
  if (typeof left === "undefined") {
    throw new Error("left is undefined");
  }

  if (typeof expressionTree.right === "object") {
    right = evaluateExpressionTree(expressionTree.right)
  } else if (typeof expressionTree.right === "number") {
    right = expressionTree.right;
  } else if (typeof expressionTree.right === "string") {
    right = parseInt(expressionTree.right);
  }
  if (typeof right === "undefined") {
    throw new Error("right is undefined");
  }

  let ret;
  if (operator == "*") {
    ret = left * right;
  } else if (operator == "+") {
    ret = left + right;
  } else {
    throw new Error(`operator '${operator}' is invalid`);
  }
  return ret;
}

export function evaluateExpression(expression: string): number | undefined {
  const expressionTree = parseExpression(expression);
  return evaluateExpressionTree(expressionTree);
}
