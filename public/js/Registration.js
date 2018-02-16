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
* @Last Modified time: 2018-02-13 16:09:23
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
	        var localErrorMessage = jqXHR.responseJSON && jqXHR.responseJSON.error || errorObj && errorObj.optionalData || "Unknown Error Please Contact Your IT Department";
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
},{"../Error/Error.js":1,"../constants.js":6}],3:[function(require,module,exports){
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
* @Last Modified time: 2018-02-16 12:35:53
*/

var Constants = require('../constants.js');
var Utils = require('../Utils/Utils.js');

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
		flashMessage.hide('blind', 300, function() {
			$(flashMessage).remove();
		});

	}.bind(flashMessage), duration);
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

UI.prototype.isSelected = function(table) {
	if (table.rows('.info').data().length < 1) {
		return false;
	}
	return true;
}

UI.prototype.tableRowIsSelected = function(tableName) {
	var table = $(tableName).DataTable();
	if (table.rows('.info').data().length < 1) {
		return false;
	}
	return true;
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

UI.prototype.closeSalView = function(view, done) {
	if (view === 'open') {
		$('#open-sals-panel').hide();
		$('#sal-open-table-container').hide();
		//done();
		// $('#sal-open-table-container').hide('blind', 500, function() {
		// 	$('#open-sals-panel').hide('blind', 600, done);
		// });
	}
	if (view === 'pending') {
		$('#pending-sals-panel').hide();
		$('#sal-pending-table-container').hide();
		//done();
	}
	if (view === 'approved') {
		//$('#pending-sals-panel').hide();
		$('#member-sal-approved-table-container').hide();
	}
	if (view === 'closed') {
		
	}
	if (view === 'corrections') {
		$('#member-sal-correction-table-container').hide();
	}
	if (view === 'approvals') {
		$('#member-sal-approval-table-container').hide();
		$('#member-time-compare').hide();
		$('#panel-approval-sals').hide();
	}
	done();
}

UI.prototype.checkForTimePanel = function(container) {
	var timePanel = $(container).find('.sal-time-compare');
	if (timePanel.length === 0) {
		return false;
	}
	return timePanel;
}

UI.prototype.updateTimePanelColors = function(memberPanel, timeIpsPanel, isOff) {
	var member = memberPanel.find('.panel-heading');
	var timeIps = timeIpsPanel.find('.panel-heading');
	if (isOff) {
		memberPanel.css({"border-color": "#d9534f"});
		timeIpsPanel.css({"border-color": "#d9534f"});
		member.css({"background-color": "rgb(217,83,79)"});  //removeClass("time-entries-danger").addClass( "time-entries-danger" );
		timeIps.css({"background-color": "rgb(217,83,79)"}); //removeClass("time-entries-danger").addClass( "time-entries-danger" );
		return;
	}
	memberPanel.css({"border-color": "#337ab7"});
	timeIpsPanel.css({"border-color": "#337ab7"});
	member.css({"background-color": "rgb(51, 122, 183)"});
	timeIps.css({"background-color": "rgb(51, 122, 183)"});
}

UI.prototype.updateUserTimeComparePanel = function(entries, timePanel, timeIPSTime) {
	var memberTimePanel = timePanel.find('.member-time');
	var timeIpsTimePanel = timePanel.find('.timeips-time');
	var memberTimeMinutes = memberTimePanel.find('p[name="minutes"]');
	var memberTimeHours = memberTimePanel.find('p[name="hours"]');
	var timeIpsTimeMinutes =  timeIpsTimePanel.find('p[name="minutes"]');
	var timeIpsTimeHours = timeIpsTimePanel.find('p[name="hours"]');
	var memberData = memberTimeMinutes.data();
	memberData.minutes.time = 0;
	//memberData.minutes.time;
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		memberData.minutes.time += entry.TimeSpent;
	}
	var offset = timeIPSTime.minutes - memberData.minutes.time;
	var timeError = false;

	if (offset > 1 || offset < -1) {
		timeError = true;
	}
	this.updateTimePanelColors(memberTimePanel, timeIpsTimePanel, timeError);

	memberTimeMinutes.text(memberData.minutes.time);
	memberTimeHours.text(Utils.convertMinutesToHours(memberData.minutes.time));
	timeIpsTimeMinutes.text(timeIPSTime.minutes);
	timeIpsTimeHours.text(timeIPSTime.hours);
}


UI.prototype.runProgress = function(progressView, done) {
	var progressBar = progressView.find('.progress-bar');
	var now = 0;
	var progressContext = setInterval(function() {
		// if (now === 75) {
		// 	done();
		// }
		if(now >= 100) {
			clearInterval(progressContext);
			done();
		}
		progressBar.css("width", now + "%");
		now = now + 5;
	}, 50);
}

module.exports = new UI();
},{"../Utils/Utils.js":5,"../constants.js":6}],5:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2018-01-04 16:15:47
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 11:03:27
*/

var Utils = function() {

}
Utils.clearDataTable = function(table) {

}

Utils.dataTableExists = function(target) {
	if (!$.fn.DataTable.isDataTable(target)) {
  		return false
	}
	return true;
}

Utils.destroyOldTable = function(tableName) {
	var oldTable = $(tableName).DataTable();
	  var tbody = oldTable.table().body();
	  tbody.remove();
	  oldTable.destroy();
}

Utils.combineTwoStrings = function(string1, string2) {
	return string1 + ' ' + string2;
}

Utils.isModal = function(config) {
	if (!config) {
		return false;
	}
	if (typeof config !== 'object') {
		return false;
	}
	if (config.isModal && config.isModal === true) {
		return true;
	}
	return false;
}

Utils.requiresRowSelect = function(config) {
	if (!config) {
		return false;
	}
	if (typeof config !== 'object') {
		return false;
	}
	if (config.select && config.select === true) {
		return true;
	}
	return false;
}

Utils.createSelect = function(select, name, data, selected) {
	var option = $('<option>' + name + '</option>');
	if (selected) {
		option = $('<option selected active>' + name + '</option>');
	}
	option.data({data: data});
	select.append(option);
}

Utils.convertDateToReadableFormat = function(date) {
	var newDate = new Date(date.replace(/-/g, '\/').replace(/T.+/, ''));

	// request a weekday along with a long date
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	return newDate.toLocaleString('en-us', options);
}

Utils.getCurrentDate = function(dateObj) {
	var dateObj = dateObj || new Date();

	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	return month + "-" + day + "-" + year;
}

Utils.convertMinutesToHours = function(time) {
	if (time < 1) {
	    return "0:00";
	}
	var hours = Math.floor(time / 60);
	var minutes = (time % 60);
	if (minutes === 0) {
		return hours + ":" + "00";
	}
	return hours + ":" + minutes;
}

Utils.secondsToHMS = function(seconds) {
	try {
		if(seconds <0) 
			seconds = 0;

		var h = Math.floor(seconds/3600);
		var m = Math.floor(seconds/60)%60;
		var s = (seconds%60);


		if (s >= 30 && s <= 59)
		{
			m = m + 1;
	//Check to make sure min is not over 60
	//If it is then add an hour
	}

	if (m > 59) {
		h = h + 1;
		m = 0
	}

	if (m < 10) m = '0'+m;
	if (s < 10) s = '0'+s;
	if (h == 0) h = "0";

	if(isNaN(h) || isNaN(m) || isNaN(s)) throw "no";
	return h+":"+m;
	} catch(err) {
		return "0:00";
	}
}

module.exports = Utils;
},{}],6:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:49:07
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-06 13:32:34
*/


var CONSTANTS = {

};
CONSTANTS.VERSION = '0.0.9';

// look at this fixed defaults override in previous version;
CONSTANTS.DEFAULTS = {
	name: 'eSalWebAppJS',
};

CONSTANTS.MODAL = {
	addSupervisor: 1,
	assignSupervisor: 2,
	removeEmployeeSupervisor: 3
};

CONSTANTS.OPTION = {
	QUERY: {
		today: 0,
		week: 1,
		month: 2,
		range: 3
	}
};

CONSTANTS.EVENT = {
	userMessage: "UserMessage",
	submit: {
		open: "SalOpenSubmit",
		pending: "SalPendingSubmit",
		approved: "SalApprovedSubmit",
		closed: "SalClosed",
		corrections: "SalCorrectionSubmit"
	}
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
		success: 'alert-success'
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
