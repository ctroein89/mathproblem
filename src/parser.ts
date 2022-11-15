export function parseExpression(expression: string) {
	let val1 = "";
	let operator;
	let val2 = "";
	let hit1 = false;
	let digitCheck = /[\d]/;

	for(let i = expression.length; i>=0; i--) {
		if (digitCheck.test(expression[i]) && !hit1) {
			val1 = val1 + expression[i];
			console.log("val1", val1)
		} else if (/[\*+]/.test(expression[i])) {
			operator = expression[i];
			hit1 = true;
			console.log("operator", operator)
		} else if (digitCheck.test(expression[i])) {
			val2 = val2 + expression[i];
			console.log("val2", val2)
		}
	}

	if (operator == "*") {
		return parseInt(val1) * parseInt(val2);
	}
	if (operator == "+") {
		return parseInt(val1) + parseInt(val2);
	}

	return -1;
}
