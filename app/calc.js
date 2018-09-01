const OPERATOR = {
	'加': function add(num1, num2) {
		return num1 + num2;
	},
	'减': function sub(num1, num2) {
		return num1 - num2;
	},
	'乘': function mul(num1, num2) {
		return num1 * num2;
	},
	'除': function div(num1, num2) {
		return num2 / num1;
	},
	'除以': function div(num1, num2) {
		return num1 / num2;
	},
};

function isOperator(op) {
	return OPERATOR.hasOwnProperty(op);
}

exports = module.exports = function calc(cmd) {
	let argv = arguments;
	if (argv.length == 3 && isOperator(cmd)) {
		return OPERATOR[cmd](argv[1], argv[2]);
	}
	return 0;
};

module.exports.OPERATOR = OPERATOR;
module.exports.isOperator = isOperator;