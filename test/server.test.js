const request = require('supertest');
const chai = require('chai');
const createServer = require('../app/server');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();


let server;

beforeEach(function(done) {
	server = createServer(done);
});

afterEach(function(done) {
	server.close(done);
});

function createRequestBody(op, num1, num2) {
	return {
		'sessionId': "5832c9dc-ec5a-4243-991b-a3934ec26605",
		"skillId": 9548,
		"skillName": "计算器",
		"intentId": 17311,
		"intentName": "数学计算",
		"utterance": "计算器 1加2等于多少",
		"requestData": {},
		"conversationRecords": [],
		"slotEntities": [{
			"intentParameterName": "num1",
			"originalValue": num1,
			"standardValue": num1,
			"liveTime": 0,
			"createTimeStamp": 1519874007598,
			"slotValue": num1
		}, {
			"intentParameterName": "op",
			"originalValue": op,
			"standardValue": op,
			"liveTime": 0,
			"createTimeStamp": 1519874007598,
			"slotValue": op
		}, {
			"intentParameterName": "num2",
			"originalValue": num2,
			"standardValue": num2,
			"liveTime": 0,
			"createTimeStamp": 1519874007598,
			"slotValue": num2
		}],
		"sessionEntries": {
			"CONTEXT_ENTRY_KEY_BOT_DATA_ID": {
				"timeToLive": 0,
				"liveTime": 0,
				"timeStamp": 1519874007609,
				"value": "21471"
			}
		},
		"botId": 21471,
		"domainId": 15738,
	};
}

function checkResult(res, result) {
	res.body.returnCode.should.equal('0');
	res.body.should.have.property('returnValue');
	res.body.should.have.property('returnErrorSolution');
	res.body.should.have.property('returnMessage');
	res.body.returnValue.should.have.property('reply');
	res.body.returnValue.resultType.should.equal('RESULT');
	res.body.returnValue.properties.result.should.equal(result);
}


describe('redirect', function() {
	it('Get / should redirect to blog server', function(done) {
		request(server).get('/')
			.expect(302, done);
	});
});

describe('calc for + - * /', function() {
	it('should return 400 when empty post', function(done) {
		request(server).post('/')
			.expect(400, done);
	});

	it('should get result 3.17 when post 19 / 6', function(done) {
		request(server).post('/')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(createRequestBody('除以', 19, 6))
			.expect(200)
			.end(function(err, res) {
				checkResult(res, '3.17');
				done(err);
			});
	});

	it('should get result 120 when post 15 * 8', function(done) {
		request(server).post('/')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(createRequestBody('乘', 15, 8))
			.expect(200)
			.end(function(err, res) {
				checkResult(res, 120);
				done(err);
			});
	});

	it('should get result 5 when post 3 + 2', function(done) {
		request(server).post('/')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(createRequestBody('加', 3, 2))
			.expect(200)
			.end(function(err, res) {
				checkResult(res, 5);
				done(err);
			});
	});

	it('should get result -10.22 when post 11.89 - 22.11', function(done) {
		request(server).post('/')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(createRequestBody('减', 11.89, 22.11))
			.expect(200)
			.end(function(err, res) {
				checkResult(res, '-10.22');
				done(err);
			});
	});

	it('should get result 56.80 when post 100 - 43.2', function(done) {
		request(server).post('/')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send(createRequestBody('减', 100, 43.2))
			.expect(200)
			.end(function(err, res) {
				checkResult(res, '56.80');
				done(err);
			});
	});

});