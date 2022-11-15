const digitCheck = /[\d]/;

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
	left: number | string | ExprTree | undefined;
	right: number | string | ExprTree | undefined;
	operator: string | undefined;
	i: number;
}

export function parseExpression(expression: string, level?: undefined | number): ExprTree {
	if (!level) level = 1;
	let left: ExprTree | string | number | undefined = "";
	let operator: string | undefined;
	let right: ExprTree | string | number | undefined = "";
	let finalI = 0;

	let i = 0;
	while(i<expression.length) {
		finalI = i;
		if (/\(/.test(expression[i]) && !left) {
			// console.debug("start of expression")
			left = parseExpression(expression.substring(i+1,expression.length), level + 1)
			i = left.i + i;

		} else if (/\(/.test(expression[i]) && !right) {
			// console.debug("start of expression")
			right = parseExpression(expression.substring(i+1,expression.length), level + 1)
			i = right.i + i;

		} else if ((left && right && operator) || /\)/.test(expression[i])) {
			// console.debug("end of expression")
			break;

		} else if (digitCheck.test(expression[i]) && !left) {
			let fullValue = getFullValue(expression.substring(i,expression.length))
			i = fullValue.i + i
			left = fullValue.val
			// console.debug(`got left value ${left}`)

		} else if (/[\*+]/.test(expression[i]) && !operator) {
			operator = expression[i];
			// console.debug(`got operator ${operator}`)

		} else if (digitCheck.test(expression[i]) && !right) {
			let fullValue = getFullValue(expression.substring(i,expression.length))
			i = fullValue.i + i
			right = fullValue.val
			// console.debug(`got right value ${right}`)

		} else if (/ /.test(expression[i])) {
			// do nothing

		} else {
			throw new Error(`Unrecognized character: '${expression[i]}' at ${i} in '${expression}'`)
		}
		// console.debug(`i:${i} e[i]:'${expression[i]}' level:${level} left:'${JSON.stringify(left)}' operator:'${operator}' right:'${JSON.stringify(right)}' `)
		
		i++
	}
	let tree: ExprTree = {
		left: left,
		operator: operator,
		right: right,
		i: finalI,
	}
	// console.debug(`tree ${JSON.stringify(tree)}`)
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
	}
	// console.debug(`left: '${JSON.stringify(expressionTree.left)}' operator: '${expressionTree.operator}' right: '${JSON.stringify(expressionTree.right)}' ret: ${ret}`)
	return ret;
}

export function evaluateExpression(expression: string): number | undefined {
	const expressionTree = parseExpression(expression);
	return evaluateExpressionTree(expressionTree);
}
