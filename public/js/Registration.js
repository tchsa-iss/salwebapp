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
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-04 09:48:17
*/

var NetworkError = require('../Error/Error.js');
var Constants = require('../constants.js');

function Network() {
	this.networkError = Constants.ERROR.NETWORK;
	this.id = null;
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
	this.id = this.__generateNetworkRequestId();
	return this.id;
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
		success: function(data, textStatus, request) {
			var contentType = request.getResponseHeader("content-type") || "";
			this.callback(null, data, this.id);
		},
		error: function (jqXHR, exception, error) {
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
	        //log this 
	        var errorObj = this.__handleError(requestError, msg);
	        var localErrorMessage = jqXHR.responseJSON && jqXHR.responseJSON.error || "Unknown Error Please Contact Your IT Department";
	        this.callback(localErrorMessage, this.id);
	    },
	})
}

Network.prototype.__generateNetworkRequestId = function() {
	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    	return v.toString(16);
		});
	}
	return uuidv4();
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
		return new NetworkError(error.name, error.code, error.desc, optionalMsg);
	}
	return new NetworkError(error.name, error.code, error.desc);
}

module.exports = Network;
},{"../Error/Error.js":1,"../constants.js":5}],3:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-12 10:34:58
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2017-12-19 15:35:17
*/

var RegistrationError = require('../Error/Error.js');
var Networking = require('../Network/NetworkRequest.js');
var UI = require('../UI/UI.js');
function RegistrationApi() {
	this.networking = new Networking();
	this.ui = UI;
}

RegistrationApi.prototype.registerUser = function(event, data) {
	event.preventDefault();
	this.__showSpinner();
	var form = this.__getUserFormData();
	if (form.errors.length > 0) {
		this.__hideSpinner();
		this.__formRequirementErrors(form.errors);
		this.ui.scrollToTop();
		return;
	}
	var json = JSON.stringify(form.registrationData);
	this.networking.request('register', function(error, jsonResponse) {
		if (error) {
			this.userCreateError(error);
			return;
		}
		this.userCreatedSuccess(jsonResponse);
	}.bind(this), json);
	this.networking.execute('POST');
}

RegistrationApi.prototype.userCreatedSuccess = function(json) {
	var messageSuccess = this.ui.createHeadingWithSubHeader("Success: ", json.message, '2');
	var messageWell =  this.ui.createWellWithContent(messageSuccess, 1);
	var buttonLink = $('<a href="/" class="btn btn-primary btn-lg active" role="button">Click Here For Your Dashboard</a>');
	messageWell.append(buttonLink);
	var message = messageWell.append(messageWell);
	$('.container').empty();
	$('.container').append(message);
	this.__hideSpinner();
}

RegistrationApi.prototype.userCreateError = function(error) {
	var errrorMessage = this.ui.createAlert(1, error);
	$('.container').prepend(errrorMessage);
	this.__hideSpinner();
	this.ui.scrollToTop();
}

RegistrationApi.prototype.__getUserFormData = function() {
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
	return {
		errors: errorElements,
		registrationData: registrationData
	}
}

RegistrationApi.prototype.__formRequirementErrors = function(errorElements) {
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
}

RegistrationApi.prototype.__showSpinner = function() {
	this.ui.showSpinnerOverlay('#registering-user-loading');
}
RegistrationApi.prototype.__hideSpinner = function() {
	this.ui.hideSpinnerOverlay('#registering-user-loading');
}

RegistrationApi.prototype.checkFormRequirements = function(input) {
	if (input !== null && input.selectedIndex !== 0) {
		return true;
	}
	return false;
}

RegistrationApi.prototype.flashMessage = function(type, messages) {
	
}

var exists = (typeof window["registrationApi"] !== "undefined");
if (!exists) {
	window.registrationApi = new RegistrationApi();
}
},{"../Error/Error.js":1,"../Network/NetworkRequest.js":2,"../UI/UI.js":4}],4:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-19 10:34:42
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-07 10:03:36
*/

var Constants = require('../constants.js');

function UI() {
	//this.jqueryApi =  window.$;
};

// defualt postion is top
UI.prototype.flashMessage = function(type, errorMsg, elementID, duration) {
	//var type = Constants.ERROR.TYPE;
	var duration = duration || 300;
	var flashMessage = $('<div class="alert '+type+'" role="alert" style="display:none">'+ errorMsg +'</div>');

	$(elementID).prepend(flashMessage);
	flashMessage.show('blind');
	setTimeout(function() {
		flashMessage.hide('blind', duration, function() {
			$(flashMessage).remove();
		});

	}.bind(flashMessage), 2000);
}

UI.prototype.scrollToTop = function(thisElementTop, position) {
	var element = thisElementTop || ".body";
	var position = position || 0;
	window.scrollTo(0, 0);
}

UI.prototype.showSpinnerOverlay = function(element) {
	$(element).addClass("loading").show();
}
UI.prototype.hideSpinnerOverlay = function(element) {
	$(element).removeClass("loading").hide();
}

UI.prototype.createWellWithContent = function(contentElement, size) {
	if (size === 1) {
		return $('<div class="well well-lg"></div>').append(contentElement);
	}
	if( size === 2) {
		return $('<div class="well well-lg"></div>').append(contentElement);
	}
	return null;
}

UI.prototype.createHeadingWithSubHeader = function(content, subContent, size) {
	var header = "<h" + size + ">" + content + "<small>" + subContent + "</small></h" + size +"/>"
	var headerElement = $(header);
	if (!headerElement) {
		return null;
	}
	return headerElement;
}

UI.prototype.createAlert = function(type, message) {
	var div = $('<div></div>').text(message);
	if (type === 1) {
		div.addClass("alert alert-danger alert-dismissible text-center");
		var closeButton = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>').append($('<span aria-hidden="true">&times;</span>'));
		div.append(closeButton);
	}
	if (type === 2) {
		div.addClass("alert alert-danger");
	}
	return div;
}

UI.prototype.selectSingleTableRow = function(event) {
	if ($(this).hasClass('info')) {
    	$(this).removeClass('info');
    }
    else {
        event.data.table.$('tr.info').removeClass('info');
        $(this).addClass('info');
    }
}

module.exports = new UI();
},{"../constants.js":5}],5:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:49:07
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-06 16:11:55
*/


var CONSTANTS = {

};
CONSTANTS.VERSION = '0.0.9';

// look at this fixed defaults override in previous version;
CONSTANTS.DEFAULTS = {
	name: 'eSalWebAppJS',
};

CONSTANTS.NOTIFICATION_EVENTS = {
	userMessage: "UserMessage"
};

CONSTANTS.SERVICES = {
	all: 1,
	fiscal: 2,
	clinic: 3,
	behviorHealth: 4,
	substanceAbuse: 5
},
CONSTANTS.LOGTYPES = {
	AVAILABLE: [
		'app-logs',
		'sal-api-logs',
		'timeips-api-logs'
	]
},

CONSTANTS.STATUS = {
	TYPE: {
		successPrimary : 'alert-primary',
		successSecodary: 'alert-secondary',
		successInfo: 'alert-info',
		success: 'alert-sucess'
	}
}

CONSTANTS.ERROR = {
	TYPE: {
		critical: 'alert-danger',
		major: 'alert-warning',
		info: 'alert-info'
	},
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
		},
		RESPONSE_ERROR: {
			name: "ERROR SERVER SIDE",
			code: 407,
			desc: "there was a error in server side php"
		}
	}
};
module.exports = CONSTANTS;

},{}]},{},[3]);
