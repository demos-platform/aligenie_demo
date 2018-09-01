'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const calc = require('./calc');
const logger = require('./logger');
const path = require('path')

const app = express();

app.set('port', (process.env.AleGeniePort || 9420));

app.use('/aligenie', express.static(path.join(__dirname, '../', 'aligenie')))

app.use(bodyParser.json({
	type: 'application/json'
}));

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(morgan('short', {
	stream: logger.stream
}));

app.post('/', function (req, res) {
	logger.verbose("Request Body : " + JSON.stringify(req.body));

	let requestBody = req.body;

	let sessionId = requestBody.sessionId;
	let intentId = requestBody.intentId;
	let intentName = requestBody.intentName;
	let utterance = requestBody.utterance;
	let slotValues = requestBody.slotEntities;

	if (!sessionId || !slotValues || !intentId || !utterance) {
		console.error('invalid post reuqest');
		res.status(400).send('invalid request');
		return;
	}
	logger.info('user session : ' + sessionId);
	logger.info('user utterance : ' + utterance + ', intentId : ' + intentId);

	let numbers = [];
	let ops = [];
	for (var slotValue of slotValues) {
		if (slotValue.intentParameterName == 'op') {
			ops.push(slotValue.slotValue);
		} else {
			numbers.push(slotValue.slotValue);
		}
	}

	let replyMessage = '我没听清楚，请再说一遍';
	let result = 0.0;
	let resultStr = '';
	let resultFlag = false;
	let responseBody = {
		'returnCode': '0',
		'returnErrorSolution': '',
		'returnMessage': 'Sucess',
		'returnValue': {
			'reply': replyMessage,
			'resultType': 'RESULT',
			'properties': {},
		},
	};

	if (ops.length == 1 && numbers.length == 2) {
		logger.log('debug', 'start calc for %s %s %s', numbers[0], ops[0], numbers[1]);

		result = calc(ops[0], parseFloat(numbers[0]), parseFloat(numbers[1]));
		if (!Number.isInteger(result)) {
			result = result.toFixed(2);
		}

		replyMessage = '' + numbers[0] + ops[0] + numbers[1] + '等于' + result;
		responseBody.returnValue.reply = replyMessage;
		responseBody.returnValue.properties.result = result;

		logger.debug('calc result : ' + result);
	} else {
		logger.error('not support syntax');
		if (ops.length == 0) {
			responseBody.returnValue.reply = '主人，请出题';
		}
		responseBody.returnValue.resultType = 'ASK_INF';
		responseBody.returnValue.askedInfos = [{
			'parameterName': 'num1',
			'intentId': intentId,
		}, {
			'parameterName': 'op',
			'intentId': intentId,
		}, {
			'parameterName': 'num2',
			'intentId': intentId,
		},];
	}

	logger.verbose("Reply Body : " + JSON.stringify(responseBody));

	res.append('Content-Type', 'application/json');
	res.status(200).send(responseBody);

});


app.use((err, req, res, next) => {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	logger.error("got error from %s, method %s, url %s", ip, req.method, req.url);
	logger.error(err.stack);
	next(err);
});

module.exports = function createServer(done) {
	return app.listen(app.get('port'), function () {
		logger.info('AliGenie Calculator listening on port ' + app.get('port'));
		if (done) done();
	});
};