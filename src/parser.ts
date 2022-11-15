export function parseExpression(expression: string) {
	let left = "";
	let operator;
	let right = "";
	let hit1 = false;
	let digitCheck = /[\d]/;

	for(let i = 0; i<expression.length; i++) {
		if (digitCheck.test(expression[i]) && !hit1) {
			left = left + expression[i];
			console.log("left", left)
		} else if (/[\*+]/.test(expression[i])) {
			operator = expression[i];
			hit1 = true;
			console.log("operator", operator)
		} else if (digitCheck.test(expression[i])) {
			right = right + expression[i];
			console.log("right", right)
		} else if (/ /.test(expression[i])) {
		} else {
			throw new Error("Unrecognized character: '" + expression[i] + "'")
		}
	}

	if (operator == "*") {
		return parseInt(left) * parseInt(right) + "";
	}
	if (operator == "+") {
		return parseInt(left) + parseInt(right) + "";
	}

	return -1;
}
