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
},{"../Error/Error.js":1,"../constants.js":9}],3:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 17:02:38
* @Last Modified by:   iss_roachd
* @Last Modified time: 2017-12-02 09:28:58
*/

/**
 *
 * @constructor Notification
 */
function Notification () {
	this._events = {};
	this._publishOnce = {};
	this.eventsLog = [];
}

/**
 * @memberOf Notification
 * @param {string} eventName
 * @param argX - argument to pass to callback
 * @param argY - argument to pass to callback
 * @param argZ - argument to pass to callback
 * @returns {boolean} notifcation published
 */
Notification.prototype.publishOnce = function (eventName, argX, argY, argZ) {  // argX,Y,Z replaced by arguments below to capture additional arguments, which are concatenated to the arguments array from subscribe method
	this.eventsLog.push(eventName);
	if (!this._events[eventName]) return false;
	if (this._publishOnce[eventName]) return false;

	var subscribers = this._events[eventName];
	var iterCallback, iterContext;
	for (var i = 0; i < subscribers.length; i++) {
		iterCallback = subscribers[i].callback;
		iterContext = subscribers[i].context;
		var iterArguments = subscribers[i].arguments;
		iterCallback.apply(iterContext, iterArguments.concat(Array.prototype.slice.call(arguments, 1)));
	}
	this._publishOnce[eventName] = true;
};

/**
 * @memberOf Notification
 * @param {string} eventName
 * @param argX - argument to pass to callback
 * @param argY - argument to pass to callback
 * @param argZ - argument to pass to callback
 * @returns {boolean} argument published
 */
Notification.prototype.publishOnceForArgument = function (eventName, argX, argY, argZ) {  // argX,Y,Z replaced by arguments below to capture additional arguments, which are concatenated to the arguments array from subscribe method
	this.eventsLog.push(eventName);
	if (!this._events[eventName]) return false;

	try {
		if (this._publishOnce[eventName][argX]) return false;
	} catch (e) {
		this._publishOnce[eventName] = {argX: false};
	}

	var subscribers = this._events[eventName];
	var iterCallback, iterContext;
	for (var i = 0; i < subscribers.length; i++) {
		iterCallback = subscribers[i].callback;
		iterContext = subscribers[i].context;
		var iterArguments = subscribers[i].arguments;
		iterCallback.apply(iterContext, iterArguments.concat(Array.prototype.slice.call(arguments, 1)));
	}
	try {
		this._publishOnce[eventName][argX] = true;
	}	catch (e) {
		this._publishOnce[eventName] = {argX: true};
	}
};

/**
 * @memberOf Notification
 * @param {string} eventName
 * @param argX - argument to pass to callback
 * @param argY - argument to pass to callback
 * @param argZ - argument to pass to callback
 * @returns {boolean} event callaback does not exists
 */
Notification.prototype.publish = function (eventName, argX, argY, argZ) {  // argX,Y,Z replaced by arguments below to capture additional arguments, which are concatenated to the arguments array from subscribe method
	this.eventsLog.push(eventName);
	if (!this._events[eventName]) {
		return false;
	}
	var subscribers = this._events[eventName];
	var iterCallback, iterContext;
	for (var i = 0; i < subscribers.length; i++) {
		iterCallback = subscribers[i].callback;
		iterContext = subscribers[i].context;
		var iterArguments = subscribers[i].arguments;
		iterCallback.apply(iterContext, iterArguments.concat(Array.prototype.slice.call(arguments, 1)));
	}
};

/**
 * @memberOf Notification
 * @param {string} eventName
 * @callback callback~refFunc
 * @param {object} context - scope of function reference
 * @param arg1 - argument to pass to callback
 * @param arg2 - argument to pass to callback
 * @param arg3 - argument to pass to callback
 */
Notification.prototype.subscribe = function (eventName, callback, context, arg1, arg2, arg3) {  // arg1,2,3 replaced by arguments below to capture additional arguments (e.g. arg4, arg5, etc.)
	context = context || null;
	if (typeof eventName !== 'string') return;
	this._events[eventName] = this._events[eventName] || [];
	this._events[eventName].push({
		callback: callback,
		context: context,
		arguments: Array.prototype.slice.call(arguments, 3) || []
	});
};

/**
 * @memberOf Notification
 * @param {string} eventName
 * @callback callback~refFunc
 * @returns {boolean} no callback reference for vpaid event
 */
Notification.prototype.unsubscribe = function (eventName, callback) {
	var subscribers = this._events[eventName];
	if (!subscribers) return false;
	for (var i = 0; i < subscribers.length; i++) {
		if (subscribers[i].callback === callback) {
			subscribers.splice(i, 1);
		}
	}
};

Notification.instance = null;
/**
 * @memberOf Notification
 * Singleton getInstance definition
 * @return singleton class
 */
Notification.singleton = function () {
	if (this.instance === null) {
		this.instance = new Notification();
	}
	return this.instance;
};

module.exports = Notification;

},{}],4:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 12:42:08
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 12:18:29
*/

var Constants = require('../constants.js');
var UserInterface = require('../User/interface.js');
var UI = require('../UI/UI.js');
var Utils = require('../Utils/Utils.js');

var exists = (typeof window["UserInterface"] !== "undefined");
if (!exists) {
	window.UserInterface = UserInterface;
}

if (!window.currentUser) {
	// hmmm we didn't get a user variable passed to the page
 	console.log("no bueno");
}
else {
	window.userInterface = new UserInterface(window.currentUser);
}

// Class level methods
UserInterface.toggleTarget = function(target, typeOfAnimation, duration, callbackName) {
	$(target).toggle(typeOfAnimation, duration || 300, function() {
		if (callbackName) {
			if (typeof UserInterface[callbackName] === "function") { 
	    		// safe to use the function
	    		UserInterface[callbackName]();
			}
		}
	});
}

UserInterface.getSalsWithOption = function(option, config) {
	var type = Constants.OPTION.QUERY;
	var today = Utils.getCurrentDate();

	if (option === type.today) {
		console.log(today);
		userInterface.getSalsForDateRange(today, today, config);
	}
	if (option === type.week) {
		var curr = new Date(); // get current date
		var now = new Date();
		var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
		var last = first + 6; // last day is the first day + 6

		var firstDayOfWeek = new Date(curr.setDate(first));
		var lastDayOfWeek = new Date(now.setDate(last));

		var weekStart = Utils.getCurrentDate(firstDayOfWeek);
		var weekEnd = Utils.getCurrentDate(lastDayOfWeek);
		console.log(weekStart, weekEnd);
		userInterface.getSalsForDateRange(weekStart, weekEnd, config);
	}
	if (option === type.month) {
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		var firstDayOfMonth = new Date(y, m, 1);
		var lastDayOfMonth = new Date(y, m + 1, 0);
		var monthStart = Utils.getCurrentDate(firstDayOfMonth);
		var monthEnd = Utils.getCurrentDate(lastDayOfMonth);

		console.log(monthStart, monthEnd);
		userInterface.getSalsForDateRange(monthStart, monthEnd, config);
	}
	if (option === type.range) {
		if ($(config.rangeDiv).is(":visible")) {
			$(config.rangeDiv).hide('blind', 100);
			return;
		}
		userInterface.setupCalenderRange(config);
		$(config.rangeDiv).show('bounce', 500);
	}
}

UserInterface.presentModal = function(tableName, config, errorView) {
	switch(config.type) {
		case "add":
			userInterface.add(tableName, config, function(error, type) {
				if (error) {
					UI.flashMessage(type, error, errorView, 2500);
					return;
				}
				$(config.modalName).modal("show");
			});
			break;
		case "modify":
			userInterface.modify(tableName, config, function(error, type) {
				if (error) {
					UI.flashMessage(type, error, errorView, 2500);
					return;
				}
				if (Utils.isModal(config)) {
					$(config.modalName).modal("show");
					console.log("modal show");
				}
				//$(config.modalName).modal("show");
			});
			break;
		case "delete":
			userInterface.delete(tableName, config, function(error, type) {
				if (error) {
					UI.flashMessage(type, error, errorView, 2500);
					return;
				}
				$(config.modalName).modal("show");
			});
			break;
		case "submit":
			userInterface.submit(tableName, config, function(error, type, message, messageLocation) {
			if (error) {
				UI.flashMessage(type, message, errorView, 2500);
				return;
			}
			if (Utils.isModal(config)) {
				$(config.modalName).modal("show");
			}
		});
		break;
	}
}

UserInterface.setupListeners = function() {
	$(".nav-sidebar a").on("click", function() {
	  $(".nav").find(".active").removeClass("active");
	  $(this).parent().addClass("active");
	});
}

// UserInterface.setupSalEntryListeners = function() {
// 	var salDatePickerButton = $('#open-sals-date-picker');
// 	salDatePickerButton.datepicker({
// 		defaultDate: "+1w",
//           changeMonth: true,
//           numberOfMonths: 2
// 	});
// 	// from = $( "#from" )
//  //        .datepicker({
//  //          defaultDate: "+1w",
//  //          changeMonth: true,
//  //          numberOfMonths: 3
//  //        })
//  //        .on( "change", function() {
//  //          to.datepicker( "option", "minDate", getDate( this ) );
//  //        }),
//  //      to = $( "#to" ).datepicker({
//  //        defaultDate: "+1w",
//  //        changeMonth: true,
//  //        numberOfMonths: 3
//  //      })
//  //      .on( "change", function() {
//  //        from.datepicker( "option", "maxDate", getDate( this ) );
//  //      });
// }

UserInterface.setupListeners();

},{"../UI/UI.js":5,"../User/interface.js":7,"../Utils/Utils.js":8,"../constants.js":9}],5:[function(require,module,exports){
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
},{"../Utils/Utils.js":8,"../constants.js":9}],6:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2018-01-29 14:17:52
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 11:54:06
*/

var Networking = require('../../Network/NetworkRequest.js');
var Utils = require('../../Utils/Utils.js');

function Modal(targetTable, config, submitHandler) {
	this.modalElement = $(config.modalName);
	this.modalElement.modal({backdrop: 'static', keyboard: false});
	this.submitElement = this.modalElement.find(':submit');
	this.submitElement.unbind();
	this.submitElement.on('click', this.submit.bind(this));
	this.submitHandler = submitHandler;
	this.table = $(targetTable);
	this.data = null;
	this.selectedRow = null;
	this.formStatusChange = config.statusChange || 1;
	this.closeView = config.closeView || "";
}

Modal.prototype.createSelect = function(select, name, data) {
	var option = $('<option>'+ employee.FirstName + ' ' + name + '</option>');
	option.data({data: data});
	select.append(option);
}

Modal.prototype.prepSalAddEntry = function(ready) {
	this.modalElement.find('.modal-title').text("Create New Sal Entry");
	this.submitElement.text("Create Entry");
	var type = {entryType: 1};
	var getFormData = new Networking();
	getFormData.request('/user/sal/form/entry/data', function(error, formData) {
		console.log(formData);
		var formSelects = this.modalElement.find('.selectpicker');
		for (var i = 0; i < formSelects.length; i++) {
			var select = $(formSelects[i]);
			select.empty();
			if (select.attr('name') === 'status') {
				select.append('<option disabled selected value> -- select a status (Required) -- </option>');
				formData.status.forEach(function(status) {
					Utils.createSelect(select, status.StatusCode + ": " + status.Description, status);
				});
			}
			if (select.attr('name') === 'reporting-unit') {
				select.append('<option disabled selected value> -- select a reporting unit (Required) -- </option>');
				formData.reportingUnits.forEach(function(unit) {
					Utils.createSelect(select, unit.Code + ": " + unit.Name, unit);
				});
			}
			if (select.attr('name') === 'sub-reporting-unit') {
				select.append('<option disabled selected value> -- Do Not Select Unless Sub Is Needed -- </option>');
				formData.subReportingUnits.forEach(function(unit) {
					Utils.createSelect(select, unit.ReportingUnitCode + ": " + unit.Description, unit);
				});
			}
			if (select.attr('name') === 'location') {
				select.append('<option disabled selected value> -- select a location (Required) -- </option>');
				formData.locationCodes.forEach(function(location) {
					Utils.createSelect(select, location.Description, location);
				});
			}
			if (select.attr('name') === 'account-code') {
				select.append('<option disabled selected value> -- select a account code (Required) -- </option>');
				formData.accountCodes.forEach(function(accountCode) {
					Utils.createSelect(select, accountCode.Code + ": " + accountCode.Name, accountCode);
				});
			}
			if (select.attr('name') === 'project') {
				select.append('<option disabled selected value> -- select a project (optional) -- </option>');
				formData.projects.forEach(function(project) {
					Utils.createSelect(select, project.Name + ": " + project.Description, project);
				});
			}
			if (select.attr('name') === 'group') {
				select.append('<option disabled selected value> -- select a group (optional) -- </option>');
				formData.groups.forEach(function(group) {
					Utils.createSelect(select, group.Name + ": " + group.Description, group);
				});
			}
			select.selectpicker('refresh');
		}
		ready(null);
	}.bind(this), type)
	getFormData.execute();
}

Modal.prototype.prepModifySalEntry = function(ready) {
	this.modalElement.find('.modal-title').text("Edit Sal Entry");
	this.submitElement.text("Update Entry");
	var type = {entryType: 1};
	var table = this.table.DataTable();
	this.selectedRow = table.row( { selected: true } );
	var getFormData = new Networking();
	getFormData.request('/user/sal/form/entry/data', function(error, formData) {
		var data = this.selectedRow.data();
		var formSelects = this.modalElement.find('.selectpicker');
		for (var i = 0; i < formSelects.length; i++) {
			var select = $(formSelects[i]);
			select.empty();
			if (select.attr('name') === 'status') {
				//select.append('<option disabled selected value> -- select a status -- </option>');
				formData.status.forEach(function(status) {
					var isSelected = false;
					if (status.StatusCode === data.EntryStatusCode) {
						isSelected = true;
					}
					Utils.createSelect(select, status.StatusCode + ": " + status.Description, status, isSelected);
				});
			}
			if (select.attr('name') === 'reporting-unit') {
				//select.append('<option disabled selected value> -- select a reporting unit -- </option>');
				formData.reportingUnits.forEach(function(unit) {
					var isSelected = false;
					if (unit.Code === data.ReportingUnitCode) {
						isSelected = true;
					}
					Utils.createSelect(select, unit.Code + ": " + unit.Name, unit, isSelected, isSelected);
				});
			}
			if (select.attr('name') === 'location') {
				//select.append('<option disabled selected value> -- select a location -- </option>');
				formData.locationCodes.forEach(function(location) {
					var isSelected = false;
					if (location.Description === data.Location) {
						isSelected = true;
					}
					Utils.createSelect(select, location.Description, location, isSelected);
				});
			}
			if (select.attr('name') === 'account-code') {
				//select.append('<option disabled selected value> -- select a account code -- </option>');
				formData.accountCodes.forEach(function(accountCode) {
					var isSelected = false;
					if (accountCode.Code === data.ActivityCode) {
						isSelected = true;
					}
					Utils.createSelect(select, accountCode.Code + ": " + accountCode.Name, accountCode, isSelected);
				});
			}
			if (select.attr('name') === 'project') {
				select.append('<option disabled selected value> -- select a project (optional) -- </option>');
				formData.projects.forEach(function(project) {
					Utils.createSelect(select, project.Name + ": " + project.Description, project);
				});
			}
			if (select.attr('name') === 'group') {
				select.append('<option disabled selected value> -- select a group (optional) -- </option>');
				formData.groups.forEach(function(group) {
					Utils.createSelect(select, group.Name + ": " + group.Description, group);
				});
			}
			select.selectpicker('refresh');
		}
		this.modalElement.find('input[name="time-spent"]').attr('value', data.TimeSpent);
		this.modalElement.find('input[name="prep-time"]').attr('value', data.PrepTime);
		this.modalElement.find('input[name="time-of-day"]').attr('value', data.ActivityStartTime);
		this.modalElement.find('textarea[name="description"]').val(data.Description);
		ready(null);
	}.bind(this), type)
	getFormData.execute();
}
Modal.prototype.prepDeleteSalEntry = function(ready) {
	var table = this.table.DataTable();
	this.selectedRow = table.row( { selected: true } );
	ready(null);
}

Modal.prototype.prepSubmitSal = function(ready) {
	// prep is stubbed for future use
	// 
	this.modalElement.find('#user-agreement-checkbox').prop('checked', false);
	ready(null);
}

Modal.prototype.prepReOpenSal = function(ready) {
	this.modalElement.find('.modal-title').text("Re-Open SAL");
	var modalBody = this.modalElement.find('.modal-body');
	console.log("prep modal");
	modalBody.empty();

	modalBody.html(
		'<p id="re-open-message">Please Confirm Re-Open Request<p><div class="row" id="re-open-progress" style="display:none;"><div class="col-sm-12"><div class="page-header"><h3 style="color:#777;">Working....</h3></div><div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only">0% Complete</span></div></div></div></div>'
		)
	// var progress = $('<div class="progress" style="display:none;"></div>')
	// var bar = $('<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>');
	// var indicator = $('<span class="sr-only">0% Complete</span>');
	// bar.append(indicator);
	// progress.append(bar);
	// modalBody.append(progress);
	ready(null);
}

Modal.prototype.addNewSalEntry = function() {

}

Modal.prototype.submit = function() {
	this.submitHandler(this);
}

Modal.prototype.removeAllClickHandlers = function() {
	//this.submitElement.off('click', this.submitContext);
	this.submitElement.unbind();
}

Modal.prototype.getTable = function() {
	return this.table;
}

Modal.prototype.dismiss = function() {
	this.modalElement.modal('hide');
}

Modal.prototype.updateSelection = function(element) {
	this.currentValue = element;
}

Modal.prototype.getBootstrapSelectId = function(target) {
	var data = this.element.find("option:selected").data();
	return data.id;
}

Modal.prototype.getBootstrapSelectWith = function(target) {
	var data = target.find("option:selected").data();
	return data;
}

Modal.prototype.getElementData = function(id) {
	var el = this.element.find(id);
	if (el) {
		return el.data();
	}
	return null;
}

module.exports = Modal;

},{"../../Network/NetworkRequest.js":2,"../../Utils/Utils.js":8}],7:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 11:30:20
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 12:34:57
*/

var Constants = require('../constants.js');
var InterfaceError = require('../Error/Error.js');
var Notification = require('../Notification/Notification.js');
var UI = require('../UI/UI.js');
var Utils = require('../Utils/Utils.js');
var Modal = require('./Modal/user.modal.js');
var Networking = require('../Network/NetworkRequest.js');

function UserInterface(user) {
	this.user = user;
	this.dispatch = new Notification();
	this.userError = Constants.ERROR.USER;
	this.currentSelectedMenu = null;
	this.salHead = null;
	this.currentSal = null;
}

UserInterface.prototype.subscribe = function(eventName, callback, context) {
	this.dispatch.subscribe(eventName, callback, context);
};

UserInterface.prototype.unsubscribe = function(eventName, callback) {

};

UserInterface.prototype.add = function(tableName, config, ready) {
	var isModal = Utils.isModal(config);
	if (isModal) {
		var modal = new Modal(tableName, config, this[config.handler].bind(this));
		modal[config.prep](function(error) {
			ready(error, Constants.ERROR.TYPE.critical);
		});
	}
}

UserInterface.prototype.modify = function(tableName, config, ready) {
	var error = this.__checkModalConfigRequirements(config, tableName);
	var isModal = Utils.isModal(config);
	if (error) {
		ready(error, Constants.ERROR.TYPE.critical);
		return;
	}
	if (isModal) {
		var modal = new Modal(tableName, config, this[config.handler].bind(this));
		modal[config.prep](function(error) {
			ready(error, Constants.ERROR.TYPE.critical);
		});
	}
}

UserInterface.prototype.delete = function(tableName, config, ready) {
	var error = this.__checkModalConfigRequirements(config, tableName);
	var isModal = Utils.isModal(config);
	if (error) {
		ready(error, Constants.ERROR.TYPE.critical);
		return;
	}
	if (isModal) {
		var modal = new Modal(tableName, config, this[config.handler].bind(this));
		modal[config.prep](function(error) {
			ready(error, Constants.ERROR.TYPE.critical);
		});
	}
}

UserInterface.prototype.submit = function(tableName, config, ready) {
	var error = this.__checkModalConfigRequirements(config, tableName);
	var isModal = Utils.isModal(config);
	if (error) {
		ready(error, Constants.ERROR.TYPE.critical);
		return;
	}
	if (isModal) {
		var modal = new Modal(tableName, config, this[config.handler].bind(this));
		modal[config.prep](function(error) {
			ready(error, Constants.ERROR.TYPE.critical);
		});
	}
	else {
		this[config.handler](tableName, config, ready);
	}
}

UserInterface.prototype.updateUserSalStatus = function(tableName, data, callback) {
	var userSalId = this.currentSal.ID;
	var progressView = $(data.progressView);
	var postCloseUserSal = new Networking();
	var post = 'user//close/sal/' + userSalId;
	postCloseUserSal.request(post, function(error, response) {
		progressView.hide('fade', 200, function() {
			var progressBar = $(this);
			progressBar.find('.progress-bar').css("width", "0%");
		});
		if (error) {
			callback(true, Constants.ERROR.TYPE.critical, error);
			return;
		}
		callback(false, Constants.STATUS.TYPE.success, response.message);

	});
	progressView.show('blind', 200);
	UI.runProgress(progressView, function() {
		postCloseUserSal.execute('POST');
	});
}

UserInterface.prototype.salSubmitHandler = function(modal) {
	//check if user agreed to terms and conditions then submit for approval
	
	var accepted = modal.modalElement.find('#user-agreement-checkbox').prop('checked');
	if (!accepted) {
		UI.flashMessage(Constants.ERROR.TYPE.critical, "You Must Accept The Terms And Conditions Before A SAL Can Be Submitted", modal.modalElement, 3000);
		return;
	}
	var sal = this.currentSal;
	sal.EntryStatusID = modal.formStatusChange;
	var json = JSON.stringify(sal)
	var submitSal = new Networking();
	submitSal.request('user/submit/sal', function(error, response) {
		if(error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, modal.modalElement, 1000);
			return;
		}
		modal.dismiss();
		UI.closeSalView(modal.closeView, function() {
				UI.flashMessage(Constants.STATUS.TYPE.success, this.message, this.view, 2500);
		}.bind({view: this.salHead, message: response.message}));

	}.bind(this), json);
	submitSal.execute('POST');
}

UserInterface.prototype.salDeleteHandler = function(modal) {
	//newtork call to delete entry
	//delete table entry
	
	var entry = modal.selectedRow.data();
	var json = JSON.stringify(entry);
	var postDelete = new Networking();
	postDelete.request('user/delete/sal/entry', function(error, response){
		if(error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, modal.modalElement, 1000);
			return;
		}
		var table = modal.getTable().DataTable();
		var row = table.row( { selected: true } );
		table.row(row).remove().draw();
		modal.removeAllClickHandlers();
		modal.dismiss();
	},json);
	postDelete.execute('POST');
}

UserInterface.prototype.salEditEntrySubmitHandler = function(modal) {
	var salData = this.__getSalDataElements(modal);
	var table = modal.getTable().DataTable();

	var postData = {
		formId: 1,
		entryStatusCode: salData.status.data,
		reportingUnit: salData.reportingUnit.data,
		sub: salData.sub && salData.sub.data || 0,
		location: salData.locationCode.data,
		accountCode: salData.accountCode.data,
		project: salData.project && salData.project.data || 0,
		group: salData.group && salData.group.data || 0,
		timeSpent: salData.timeSpent,
		prepTime: salData.timePrep,
		timeOfDay: "",
		clientName: "",
		description: salData.description,
		sal: this.currentSal,
		entry: modal.selectedRow.data()
	}

	var json = JSON.stringify(postData);
	var editEntry = new Networking();
	editEntry.request('user/edit/sal/entry', function(error, response) {
		console.log(response);
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, modal.modalElement, 2000);
			return;
		}
		var entry = response;
		var table = modal.getTable().DataTable();
		var row = table.row( { selected: true } );
		console.log(row);
		row.data(entry).draw();
		modal.removeAllClickHandlers();
		modal.dismiss();
	}.bind(this), json);
	editEntry.execute('POST');
}

UserInterface.prototype.salAddEntrySubmitHandler = function(modal) {
	var salData = this.__getSalDataElements(modal);
	var table = modal.getTable().DataTable();

	var postData = {
		formId: 1,
		entryStatusCode: salData.status.data,
		reportingUnit: salData.reportingUnit.data,
		sub: salData.sub && salData.sub.data || 0,
		location: salData.locationCode.data,
		accountCode: salData.accountCode.data,
		project: salData.project && salData.project.data || 0,
		group: salData.group && salData.group.data || 0,
		timeSpent: salData.timeSpent,
		prepTime: salData.timePrep,
		timeOfDay: "",
		clientName: "",
		description: salData.description,
		sal: this.currentSal
	}
	var json = JSON.stringify(postData);
	var createEntry = new Networking();
	createEntry.request('user/create/sal/entry', function(error, response) {
		console.log(response);
		if (error) {
			modal.modalElement.animate({ scrollTop: 0 }, 'fast');
			UI.flashMessage(Constants.ERROR.TYPE.critical, "A Required Field Was Not Filled Out", modal.modalElement, 4000);
			return;
		}
		var entry = response;
		var table = modal.getTable().DataTable();
		table.row.add(entry).draw();
		modal.removeAllClickHandlers();
		modal.dismiss();
	}.bind(this), json);
	createEntry.execute('POST');
}

UserInterface.prototype.salReOpenHandler = function(modal) {
	var sal = this.currentSal;
	sal.EntryStatusID = modal.formStatusChange;
	var now = 0;
	console.log(sal);
	var json = JSON.stringify(sal);
	var message = modal.modalElement.find('#re-open-message');
	var progressContainer = modal.modalElement.find('#re-open-progress');
	var progress = progressContainer.find('.progress-bar');
	message.hide();
	progressContainer.show('blind', 200);

	var reOpenSal = new Networking();
	reOpenSal.request('user/reopen/sal/entry', function(error, response) {
		now = 100;
		progress.css("width", now + "%");
		if(error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, modal.modalElement, 1000);
			return;
		}
		modal.dismiss();

		UI.closeSalView(modal.closeView, function() {
				UI.flashMessage(Constants.STATUS.TYPE.success, this.message, this.view, 2500);
		}.bind({view: this.salHead, message: response.message}));

	}.bind(this), json);

	var progressContext = setInterval(function() {
		if (now >= 60) {
			clearInterval(progressContext);
			reOpenSal.execute('POST');
		}
		progress.css("width", now + "%");
		now = now + 5;
	}, 50);

}

UserInterface.prototype.__checkModalConfigRequirements = function(config, tableName) {
	if (Utils.requiresRowSelect(config)) {
		if (!UI.tableRowIsSelected(tableName)) {
			return "Please Select At Least One Row";
		}
	}
	return null;
}

UserInterface.prototype.toggleSalMenu =  function(data, typeOfAnimation, duration, fuctionRef, args) {
	$(data.closeView).hide();
	if (this.currentSelectedMenu) {
		$(this.currentSelectedMenu).toggle(typeOfAnimation, duration || 300, function() {
			var that = this;
			$(data.target).toggle(typeOfAnimation, duration || 300, function() {
				if (fuctionRef) {
					that[fuctionRef](args);
				}
			});
		}.bind(this));
	}
	else {
		$(data.target).toggle(typeOfAnimation, duration || 300, function() {
			if (fuctionRef) {
				this[fuctionRef](args);
			}
		}.bind(this));
	}
	this.currentSelectedMenu = data.target;
}

UserInterface.prototype.setupCalenderRange = function(config) {
	config.elements.forEach(function(inputElement) {
		 $(inputElement).datepicker({showButtonPanel: true});
	});
	
	var submitElement = $(config.rangeDiv).find(':submit');
	submitElement.on( "click", function() {
		var fromDate = $(config.elements[0]).datepicker({ dateFormat: 'yy-mm-dd' }).val();
		var toDate = $(config.elements[1]).datepicker({ dateFormat: 'yy-mm-dd' }).val();
		this.getSalsForDateRange(fromDate, toDate, config);
		event.preventDefault(); // avoid to execute the actual submit of the form.
	}.bind(this, config));
}

UserInterface.prototype.updateSalEntryTable = function(entries) {

} 

UserInterface.prototype.updateSalHead = function() {
	this.salHead = $(this.currentSelectedMenu).find('.page-header').next();
}

UserInterface.prototype.updateSalPanel = function(sals, panel, tableName) {
	panel.empty();
	if (sals.length === 0) {
		var div = $("<p class='text-center'>No Sals Found For This Date Or Range</p>");
		panel.append(div);
		return;
	}
	for (var i = 0; i < sals.length; i++) {
		var sal = sals[i];
		sal.tableName = tableName;
		var date = Utils.convertDateToReadableFormat(sal.Date);
		var div = $("<button class='btn btn-default'>"+ date + "</button>");
		div.data( "sal", sal );
		if (sal.EntryStatusID === 3) {
			div.on("click", this.getApprovedSalEntries.bind(this, div));
		}
		else {
			div.on("click", this.getSalEntries.bind(this, div));
		}
		panel.append(div);
	}
}

UserInterface.prototype.loadSalsByStatus = function(data) {
	this.updateSalHead();
	//var spinner = $(data.view).find('.loading-spinner-now').show();
	var tableName = data.tableName;
	var status = data.status;
	var panel = $(data.panel);
	var get = 'user/sals/by/status/' + this.user.UserID + "/" + status;
	//var get = 'user/sals/by/status/' + "50" + "/" + status;
	var getUserSals = new Networking()
	getUserSals.request(get, function(error, response) {
		//spinner.hide('blind', 300);
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead);
		}
		var sals = response;
		this.updateSalPanel(sals, panel, tableName);
	}.bind(this));
	getUserSals.execute();
}

UserInterface.prototype.getApprovedSalEntries = function(entry) {
	var sal = $(entry).data().sal;
	//var spinner = this.salHead.find('.sal-loading').show('blind', 100);
	var getEntries = new Networking();

	getEntries.request('/user/sal/entries/' + sal.ID, function(error, entries) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead, 1000);
			var table = $(sal.tableName).DataTable();
			$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
			return;
		}
		if ($.fn.DataTable.isDataTable(sal.tableName)) {
			Utils.destroyOldTable(sal.tableName);
		}
		var table = $(sal.tableName).DataTable( {
			data: entries,
			"scrollX": true,
			scrollY: true,
			select: true,
			buttons: [
        		'copy',
        		{
        			extend: 'excel',
        			text: "Export SAL Entries",
        			action: this.downloadSalEntryExcelForm.bind(this),
        			filename: function() {
        				return this.currentSal.Date;
        			}.bind(this),
        			title: null,
        			header: false
        		},
        		'pdf'
    		],
		    columns: [
		        { data: 'SalEntryID' },
		        { data: 'FormName' },
		        { data: 'EntryStatusCode'},
		        { 
		        	data: 'Reporting Unit',
		        	render: function ( data, type, row ) {
       					 return row.ReportingUnitCode +' '+ row.ReportingUnitAbbrev;
    				}
		    	},
		        { data: 'SubReportingUnitID' },
		        { data: 'Location' },
		        { 
		        	data: 'ActivityCode',
		        	render: function(data, type, row) {
		        		return row.ActivityCode + ' ' + row.ActivityName;
		        	}
		    	},
				{ data: 'ProjectNumberID' },
				{ data: 'GroupNumber' },
				{ data: 'TimeSpent' },
				{ data: 'PrepTime' },
				{ data: 'Description' },
				{ data: 'CreateDate'}
		    ]
		});
		//table.sal = sal;
		//this.salEntryTable = table;
		this.currentSal = sal;
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		// var exportButton = $(table.buttons()[1].node);
		// var url = "user/export/sal/entries/" + sal.ID;
		// var anchor = $('<a href=""></a>');
  //      	anchor.attr("href", url);
		// $(exportButton).wrap(anchor);
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
		$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
	}.bind(this), sal);
	getEntries.execute();
}

UserInterface.prototype.getSalEntries = function(entry) {
	var sal = $(entry).data().sal;
	var get = '/user/sal/entries/' + sal.ID;
	//var spinner = this.salHead.find('.sal-loading').show('blind', 100);
	var getEntries = new Networking();
	if (sal.EntryStatusID === 5) {
		//send response to custom handler
		this.currentSal = sal;
		getEntries.request(get, this.handleErrorSalEntries.bind(this));
		getEntries.execute();
		return;
	}
	getEntries.request(get, function(error, entries) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead, 1000);
			var table = $(sal.tableName).DataTable();
			$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
			return;
		}
		if ($.fn.DataTable.isDataTable(sal.tableName)) {
		  	Utils.destroyOldTable(sal.tableName);
		}
		var table = $(sal.tableName).DataTable( {
			data: entries,
			"scrollX": true,
			scrollY: true,
			select: true,
			buttons: [
        		'copy',
        		{
        			extend: 'excel',
        			filename: function() {
        				return this.currentSal.Date;
        			}.bind(this),
        		},
        		'pdf'
    		],
		    columns: [
		        { data: 'SalEntryID' },
		        { data: 'FormName' },
		        { data: 'EntryStatusCode'},
		        { 
		        	data: 'Reporting Unit',
		        	render: function ( data, type, row ) {
       					 return row.ReportingUnitCode +' '+ row.ReportingUnitAbbrev;
    				}
		    	},
		        { data: 'SubReportingUnitID' },
		        { data: 'Location' },
		        { 
		        	data: 'ActivityCode',
		        	render: function(data, type, row) {
		        		return row.ActivityCode + ' ' + row.ActivityName;
		        	}
		    	},
				{ data: 'ProjectNumberID' },
				{ data: 'GroupNumber' },
				{ data: 'TimeSpent' },
				{ data: 'PrepTime' },
				{ data: 'Description' },
				{ data: 'CreateDate'}
		    ]
		});

		this.currentSal = sal;
		this.getUserSalTime(sal, entries);
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
		$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
	}.bind(this), sal);
	getEntries.execute();
}

UserInterface.prototype.getUserSalTime = function(sal, entries) {
	var timePanel = UI.checkForTimePanel(sal.tableName + "-container");
	if (!timePanel) {
		return;
	}
	var data = {date: sal.Date};
	var getTimeIpsTime = new Networking();
	getTimeIpsTime.request('user/sal/timeips/time', function(error, response) {
		if (error) {
			// tell user timeips time could be retrieved
			
		}
		var timeIpsTime = response;
		var normalTime = timeIpsTime[0];
		var benifitTime = timeIpsTime[1];
		var holidayTime = timeIpsTime[2];
		var timeStart = normalTime.totalTimeIn;
		var endTime = normalTime.totalTimeOut + benifitTime.totalBenifitTime + holidayTime.totalHolidayTimeTime;
		var timeWorked = endTime - timeStart;
		var time = Utils.secondsToHMS(timeWorked);
		var minutes = Math.round(timeWorked / 60);
		UI.updateUserTimeComparePanel(entries, timePanel, {hours: time, minutes: minutes});
	}, data);
	getTimeIpsTime.execute();
}

UserInterface.prototype.handleErrorSalEntries = function(error, entries) {
	var sal = this.currentSal;
	if (error) {
		UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead, 1000);
		var table = $(sal.tableName).DataTable();
		$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
		return;
	}
	if ($.fn.DataTable.isDataTable(sal.tableName)) {
	  Utils.destroyOldTable(sal.tableName);
	}
	var table = $(sal.tableName).DataTable( {
		data: entries,
		"scrollX": true,
		scrollY: true,
		select: true,
		buttons: [
    		'copy',
    		{
    			extend: 'excel',
    			filename: function() {
    				return this.currentSal.Date;
    			}.bind(this),
    		},
    		'pdf'
		],
	    columns: [
	        { data: 'SalEntryID' },
	        { data: 'FormName' },
	        { data: 'EntryStatusCode'},
	        { 
	        	data: 'Reporting Unit',
	        	render: function ( data, type, row ) {
   					 return row.ReportingUnitCode +' '+ row.ReportingUnitAbbrev;
				}
	    	},
	        { data: 'SubReportingUnitID' },
	        { data: 'Location' },
	        { 
	        	data: 'ActivityCode',
	        	render: function(data, type, row) {
	        		return row.ActivityCode + ' ' + row.ActivityName;
	        	}
	    	},
			{ data: 'ProjectNumberID' },
			{ data: 'GroupNumber' },
			{ data: 'TimeSpent' },
			{ data: 'PrepTime' },
			{ data: 'Description' },
			{ data: 'CreateDate'}
	    ]
	});
	this.updateUserSalErrorPanel(null, entries);
	this.currentSal = sal;
	table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
	var tbody = table.table().body();
	$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
	$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
}

UserInterface.prototype.updateUserSalErrorPanel = function(view, entries) {
	var correctionView = $('#sal-entry-corrections').find('#correction-sal-error-message');
	var entryView = correctionView.find('.list-group');
	entryView.empty();
	for(var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		if (entry.Error === 1) {
			var errorEntry = $("<li class='list-group-item'>Entry ID: " + entry.SalEntryID + " Message: " + entry.ErrorMessage + "</li>");
			entryView.append(errorEntry);
		}
	}
}

UserInterface.prototype.downloadSalEntryExcelForm = function(entries) {
//this.downloadSalEntryExcelForm.bind(this, entries);

	//this is not the best solution, creates interuption of resources
	window.open('user/export/sal/entries/' + this.currentSal.ID,"_self");


	// win =  window.open('about:blank',"MHSA FORM",'fullscreen=no','width=612px','height=738px');
	// var getExcelForm = new Networking();
	// var get = 'user/export/sal/entries/' + this.currentSal.ID;
	// var head = this.salHead;
	// getExcelForm.request(get, function(error, response) {
	// 	if (error) {
	// 		UI.flashMessage(Constants.ERROR.TYPE.major, error, head);
	// 	}
	// });
	// //getExcelForm.execute('GET');
	// window.open(get);
}

UserInterface.prototype.getUserSalErrors = function(data) {
	this.updateSalHead();
	var tableName = data.tableName;
	var view = data.view // fix this later
	var status = data.status;
	var panel = $(data.panel);
	var get = 'user/sals/by/status/' + this.user.UserID + "/" + status;
	var progress = $('#sal-corrections-loading');

	var getSalCorrections = new Networking();
	getSalCorrections.request(get, function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead);
		}
		var sals = response;
		//sal.view = view;
		this.updateSalPanel(sals, panel, tableName);
		progress.hide('blind', 300);
	}.bind(this));
	getSalCorrections.execute();
}

UserInterface.prototype.getSalsForDateRange = function(from, to, setings) {
	var data = {
		fromDate: from,
		toDate: to,
		status: setings.salStatus
	};
	var getSals = new Networking()
	getSals.request("/user/sals", function(error, sals) {
		console.log(sals);
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead);
		}
		if (setings.usePanel) {
			this.updateSalPanel(sals, $(setings.panelEntry), setings.tableName);
			$(setings.panelDiv).show('blind', 100);
		}
		else {
			if ($(setings.panelDiv).is(":visible")) {
				$(setings.panelDiv).hide('blind', 100);
			}
			if (sals.length === 0) {
				UI.flashMessage(Constants.ERROR.TYPE.major, "No Sals Found For This Date", this.salHead, 2000);
				return;
			}
			this.getSalEntries(sals, function(error, entries) {
				if (error) {
					UI.flashMessage(Constants.ERROR.TYPE.major, error, this.salHead, 2000);
					return;
				}
				this.updateSalEntryTable(entries, setings.tableName);
			}.bind(this));
			//this.getSalEntries(sals, this.updateSalEntryTable.bind(this, config.tableName));
		}
	}.bind(this), data);
	getSals.execute();
}

UserInterface.prototype.__getSalDataElements = function(modal) {
	var statusEl = modal.modalElement.find('select[name="status"]');
	var reportingEl = modal.modalElement.find('select[name="reporting-unit"]');
	var subRuEl = modal.modalElement.find('select[name="sub-reporting-unit"]');
	var locationEl = modal.modalElement.find('select[name="location"]');
	var accountCodeEl = modal.modalElement.find('select[name="account-code"]');
	var projectEl = modal.modalElement.find('select[name="project"]');
	var groupEl = modal.modalElement.find('select[name="group"]');
	var timeSpent = modal.modalElement.find('input[name="time-spent"]').val();
	var timePrep = modal.modalElement.find('input[name="prep-time"]').val();
	var timeOfDay = modal.modalElement.find('input[name="time-of-day"]').val();
	var description = modal.modalElement.find('textarea[name="description"]').val();

	var status = modal.getBootstrapSelectWith(statusEl);
	var reportingUnit = modal.getBootstrapSelectWith(reportingEl);
	var sub =  modal.getBootstrapSelectWith(subRuEl);
	var locationCode =  modal.getBootstrapSelectWith(locationEl);
	var accountCode = modal.getBootstrapSelectWith(accountCodeEl);
	var project = modal.getBootstrapSelectWith(projectEl);
	var group = modal.getBootstrapSelectWith(groupEl);
	return {
		status: status,
		reportingUnit: reportingUnit,
		sub: sub,
		locationCode: locationCode,
		accountCode: accountCode,
		project: project,
		group: group,
		timeSpent: timeSpent,
		timePrep: timePrep,
		timeOfDay: timeOfDay,
		description: description
	}
}

module.exports = UserInterface;
},{"../Error/Error.js":1,"../Network/NetworkRequest.js":2,"../Notification/Notification.js":3,"../UI/UI.js":5,"../Utils/Utils.js":8,"../constants.js":9,"./Modal/user.modal.js":6}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

},{}]},{},[4]);
