(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 11:34:54
* @Last Modified by:   iss_roachd
* @Last Modified time: 2017-12-02 19:43:42
*/

function Error(name, code, desc, optionalData) {
	this.name = name || "Unknow Error Name";
	this.code = code || 999999999;
	this.desc = desc || "unknow";
	this.optionalData = optionalData || {};
}


// accepts json data only
Error.prototype.addExtraData = function(data) {
	this.optionalData = data;
}

Error.prototype.getCode = function() {
	return this.code;
}

Error.prototype.getName = function() {
	return this.name;
}

Error.prototype.getDesc = function() {
	return this.desc;
}

Error.prototype.getOptionalData = function() {
	return this.optionalData;
}

Error.prototype.jsonError = function() {
	return {
		name: this.name,
		code: this.code,
		desc: this.desc,
		optionalData: this.optionalData
	};
}
module.exports = Error;
},{}],2:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:42:21
* @Last Modified by:   iss_roachd
* @Last Modified time: 2017-12-12 17:08:16
*/

var NetworkError = require('../Error/Error.js');
var Constants = require('../constants.js');

function Network() {
	this.networkError = Constants.ERRORS.NETWORK;
}

Network.prototype.request = function(url, callback, data) {
	var notValidError = this.__validateRequest(url, callback);
	if (notValidError) {
		// log error
		// return error
		callback(notValidError);
	}
	this.url = url;
	this.callback = callback;
	this.data = data;
}

Network.prototype.setHeaders = function(args) {
	// still need to finish
	// interate through args as key value pairs and set header information
	this.networkHeaders = null;
}

Network.prototype.execute = function(type) {
	if (this.networkHeaders) {
		// set them on request
	}
	$.ajax({
		type: type,
		url: this.url,
		context: this,
		data: this.data,
		success: function(responseData) {
			this.callback(null, responseData);
		},
		error: function (jqXHR, exception) {
	        var msg = '';
	        if (jqXHR.status === 0) {
	            msg = 'Not connect.\n Verify Network.';
	        } else if (jqXHR.status == 404) {
	            msg = 'Requested page not found. [404]';
	        } else if (jqXHR.status == 500) {
	            msg = 'Internal Server Error [500].';
	        } else if (exception === 'parsererror') {
	            msg = 'Requested JSON parse failed.';
	        } else if (exception === 'timeout') {
	            msg = 'Time out error.';
	        } else if (exception === 'abort') {
	            msg = 'Ajax request aborted.';
	        } else {
	            msg = 'Uncaught Error.\n' + jqXHR.responseText;
	        }
	        var requestError = this.networkError.RESPONSE_ERROR;
	        var error = this.__handleError(requestError, msg);
	        this.callback(error);
	    },
	})
}

Network.prototype.__validateRequest = function(url, callback) {
	if (!url) {
		var noUrlError = this.networkError.NO_URL;
		return this.__handleError(noUrlError); 
		//new NetworkError(noUrlError.name, noUrlError.code, noUrlError.desc);
	}
	if (!callback) {
		var noCallbackError = this.networkError.NO_CALLBACK;
		return this.__handleError(noCallbackError);
		//new NetworkError(noCallbackError.name, noCallbackError.code, noCallbackError.desc);
	}
	getType = {};
	if (getType.toString.call(callback) !== '[object Function]') {
		var notFunctionError = this.networkError.NO_CALLBACK;
		return this.__handleError(notFunctionError);
		//new NetworkError(notFunctionError.name, notFunctionError.code, notFunctionError.desc);
	}
	return null;
}

Network.prototype.__handleError = function(error, optionalMsg) {
	// handle Error interallly and send back error to requester
	if (optionalMsg) {
		error.desc = optionalMsg;
	}
	return new NetworkError(error.name, error.code, error.desc);
}

module.exports = Network;
},{"../Error/Error.js":1,"../constants.js":4}],3:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-12 10:34:58
* @Last Modified by:   iss_roachd
* @Last Modified time: 2017-12-12 15:36:30
*/

var RegistrationError = require('../Error/Error.js');
var Networking = require('../Network/NetworkRequest.js');

function RegistrationApi() {
	this.networking = new Networking();
}

RegistrationApi.prototype.registerUser = function(event, data) {
	event.preventDefault();
	var errorElements = [];
	var registrationData = {};
	var inputs = $('#user-form *').filter(':input');
	for (var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		if (input.name === 'jobTitle' || input.name === 'serviceUnit') {
			var valid = this.checkFormRequirements(input);
			if (!valid) {
				errorElements.push(input.name);
			}
			else {
				var selectedInput = input[input.selectedIndex];
				registrationData[input.name] = selectedInput.value;
			}
		}
		else {
			if (input.type !== 'submit') {
				registrationData[input.name] = input.value;
			}
		}
	}
	if(errorElements.length > 0) {
		$('#form-error').empty();
		$('#form-error').append("<strong>Form Error</strong>");
		for (var i = 0; i < errorElements.length; i++) {
			if (errorElements[i] === 'jobTitle') {
				$('#form-error').append('<li id="job-title-error">Please Select A Job Title</li>');
			}
			if (errorElements[i] === 'serviceUnit') {
				$('#form-error').append('<li id="service-unit-error">Please Select A Service Unit</li>');
			}
		}
		$('#flash-message-box').show();
		return;
	}
	var json = JSON.stringify(registrationData);
	this.networking.request('register', function(error) {
		if (error) {

		}
		return true;
	}.bind(this), json);
	this.networking.execute('POST');
}

RegistrationApi.prototype.checkFormRequirements = function(input) {
	if (input !== null && input.selectedIndex !== 0) {
		return true;
	}
	return false;
}

RegistrationApi.prototype.flashMessage = function(type, messages) {
	// create messages
}

var exists = (typeof window["registrationApi"] !== "undefined");
if (!exists) {
	window.registrationApi = new RegistrationApi();
}
},{"../Error/Error.js":1,"../Network/NetworkRequest.js":2}],4:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:49:07
* @Last Modified by:   iss_roachd
* @Last Modified time: 2017-12-12 10:38:47
*/


var CONSTANTS = {

};
CONSTANTS.VERSION = '1.0.0';

// look at this fixed defaults override in previous version;
CONSTANTS.DEFAULTS = {
	name: 'eSalWebAppJS',
};

CONSTANTS.NOTIFICATION_EVENTS = {
	userMessage: "UserMessage"
};

CONSTANTS.ERRORS = {
	NETWORK: {
		NO_RESPONSE: {
			name: "NO_RESPONSE",
			code: 404,
			desc: "no data returned from request"
		},
		NO_URL: {
			name: "URL_MISSING",
			code: 405,
			desc: "no url given to network request"
		},
		NO_CALLBACK: {
			name: "NO_CALLBACK",
			code: 406,
			desc: "no callback passed to network request"
		}
	}
};
module.exports = CONSTANTS;

},{}]},{},[3]);
