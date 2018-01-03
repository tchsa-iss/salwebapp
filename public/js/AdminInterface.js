(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:18:11
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 17:21:47
*/

var Constants = require('../../constants');
var Networking = require('../../Network/NetworkRequest.js');
var UI = require('../../UI/UI.js');

function DatabaseInterface() {
	this.LOGS = Constants.LOGTYPES.AVAILABLE;
	this.currentLog = null;
	this.serviceUnitsInit = false;
}

DatabaseInterface.prototype.showSubMenu = function(menu, done) {
	$(menu).toggle('blind', 200, done);
}

DatabaseInterface.prototype.showServiceUnits = function() {
	if (this.serviceUnitsInit) return;
	var serviceUnits = new Networking();
	serviceUnits.request("admin/database/service/units", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
		}
		$('#service-units-table').DataTable( {
			data: json,
			"scrollX": true,
		    columns: [
		        { data: 'id' },
		        { data: 'name' },
		        { data: 'UnitAbbrev' },
		        { data: 'Code' },
		        { data: 'IsActive' },
		        { data: 'Description' },
		    ]
		});
		this.serviceUnitsInit = true;
	}.bind(this));
	serviceUnits.execute();
}

DatabaseInterface.prototype.showAllUserRoles = function() {
	var userRoles = new Networking();
	userRoles.request("admin/database/user/roles", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
		}
		$('#user-roles-table').DataTable( {
			data: json,
			"scrollX": true,
		    columns: [
		        { data: 'Username' },
		        { data: 'FirstName' },
		        { data: 'LastName' },
		        { data: 'DisplayName' }
		    ]
		});
	});
	userRoles.execute();
}

DatabaseInterface.prototype.showUserReportingUnits = function() {
	var reportingUnits = new Networking();
	reportingUnits.request("admin/database/user/reporting/units", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
		}
		$('#user-reporting-units-table').DataTable( {
			data: json,
			"scrollX": true,
		    columns: [
		        { data: 'FirstName' },
		        { data: 'LastName' },
		        { data: 'ReportingUnits' }
		    ]
		});
	});
	reportingUnits.execute();
}

DatabaseInterface.prototype.addReportingUnit = function($userID) {

}

DatabaseInterface.prototype.projects = function() {

}

DatabaseInterface.prototype.activityCodes = function() {

}

module.exports = new DatabaseInterface();
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../constants":11}],2:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:18:27
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 16:31:14
*/

var Constants = require('../../constants');
var Networking = require('../../Network/NetworkRequest.js');
var UI = require('../../UI/UI.js');

function EmployeeInterface() {
	this.services = Constants.SERVICES;
}

EmployeeInterface.prototype.show = function(employees) {
	if (employees === this.services.all) {
		return this.all();
	}
}

EmployeeInterface.prototype.all = function() {
	var all = new Networking();
	all.request("admin/employees/all", function(error, json) {
		if (!error) {
			$('#employees-table').show();
			$('#employees-table').DataTable( {
    			data: json,
    			"scrollX": true,
			    columns: [
			        { data: 'Username' },
			        { data: 'FirstName' },
			        { data: 'MiddleName' },
			        { data: 'LastName' },
			        { data: 'PhoneNumber' },
			        { data: 'CellPhoneNumber' },
			        { data: 'Job Title' },
			        { data: 'Reporting Unit' },
			        { data: 'Email' },
			        { data: 'SupervisorID' },
			        { data: 'LastLoginDate' },
			        { data: 'Active' }
			    ]
			});
			return;
		}
		UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main', 500);
	});
	all.execute();
}

EmployeeInterface.prototype.fiscal = function() {

}

EmployeeInterface.prototype.clinic = function() {

}

EmployeeInterface.prototype.behaviorHealth = function() {

}

EmployeeInterface.prototype.substanceAbuse = function() {

}

module.exports = new EmployeeInterface();
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../constants":11}],3:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:19:12
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 11:01:38
*/
var Constants = require('../../constants');
var Networking = require('../../Network/NetworkRequest.js');
var UI = require('../../UI/UI.js');

function LogsInterface() {
	this.LOGS = Constants.LOGTYPES.AVAILABLE;
	this.currentLog = null;
}

LogsInterface.prototype.show = function(type) {
	var available = this.LOGS.indexOf(type);
	if (available > -1) {
		return this.getLog(type);
	}
}

LogsInterface.prototype.getLog = function(type) {
	var requestName = 'admin/logs/' + type;
	var log = new Networking();
	log.request(requestName, function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main', 500);
		}
		if (this.currentLog) {
			this.currentLog.destroy();
		}
		setTimeout(function() {
			this.currentLog = $('#log-content-table').DataTable({
				data: json,
				"scrollX": true,
				columns :[
					{data: "message"},
					{data: "channel"},
					{data: "extra.user"},
					{data: "datetime.date"},
					{data: "extra.uid"},
					{data: "level"},
					{data: "level_name"}
				]
			});
		}.bind(this), 200);
	}.bind(this));
	log.execute();
}

module.exports = new LogsInterface();
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../constants":11}],4:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 12:39:17
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 15:07:41
*/

(function() {
	Array.prototype.clean = function(deleteValue) {
		for(var i = 0; i < this.length; i++) {
			if (this[i] == deleteValue) {
				this.splice(i, 1);
				i--;
			}
		}
		return this;
	}
}());

var Constants = require('../Constants.js');
var AdminErrors = require('../Error/Error.js');
var Networking = require('../Network/NetworkRequest.js');
var Notification = require('../Notification/Notification.js');
var EmployeeInterface = require('./Employees/interface.employees.js');
var DatabaseInterface = require('./Database/interface.database.js');
var LogInterface = require('./Logs/interface.logs.js');
var UI = require('../UI/UI.js');

/**
 * 
 */
function AdminInterface() {
	this.dispatch = new Notification();
	this.activeMenu = null;
	this.activeSubMenu = null;
};

/**
 * @param  {[type]}
 * @param  {Function}
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
AdminInterface.prototype.subscribe = function(eventName, callback, cantext, args) {
	this.dispatch.subscribe(event, callback, context);
};

/**
 * @param  {[type]}
 * @param  {Function}
 * @return {[type]}
 */
AdminInterface.prototype.unsubscribe =function(eventName, callback) {
	return this.dispatch.unsubscribe(event)
};

AdminInterface.prototype.publish = function(eventName, args1, arg2, arg3) {

}

AdminInterface.prototype.callMethod = function(name, args, callback) {
	
}

AdminInterface.prototype.empoyeeInterface = function(method, args) {
	EmployeeInterface[method](args);
}

AdminInterface.prototype.logInterface = function(method, args) {
	LogInterface[method](args);
}

AdminInterface.prototype.databaseInterface = function(method, args, callback) {
	DatabaseInterface[method](args, callback);
}

/**
 * @return {[type]}
 */

AdminInterface.prototype.showMenuTab = function(id) {
	this.hideActiveTab(null, function() {
		$(id).show("slide", 150, function() {
			this.kickStartSubmenu(id);
		}.bind(this));

		this.activeMenu = id;
	}.bind(this));
}

AdminInterface.prototype.kickStartSubmenu = function(id) {
	if (id === '#log-menu') {
		//this.showLogs();
	}
	if (id === '#employees-menu') {

	}
}

AdminInterface.prototype.hideActiveTab = function(element, done) {
	if (this.activeMenu) {
		$(this.activeMenu).hide("fast", function() {
			if (typeof done === 'function') {
				done();
			}
		});
	}
	else {
		if (done && typeof done === 'function') {
			done();
		}
	}
}

AdminInterface.prototype.expandSubMenu = function(id, callback) {
	$(id).show('blind', 200, callback);
}

AdminInterface.prototype.collapseSubMenu = function(id, callback) {
	$(id).hide('blind', 200, callback);
}

AdminInterface.prototype.createDataTable = function(id) {
	$(id).DataTable();
}

/**
 * @param  {[type]}
 * @return {[type]}
 */
AdminInterface.prototype.__createTableWithJson = function(json) {
	//var table = $('<table id="service-units-table" class="table display" cellspacing="0"></table>');
	var	thead = $('<thead></thead>');
	var tabelRow = $('<tr></tr>');

	var jsonHeaders = json[0];
	var headerKeys = Object.keys(jsonHeaders);
	for (var i = 0; i < headerKeys.length; i++) {
		var headerName = headerKeys[i];
		var header = $("<th>" + headerName + "</th>");
		tabelRow.append(header);
	}
	
	var tbody = $('<tbody></tbody>');
	for (var i = 0; i < json.length; i++) {
		var tr = $("<tr></tr>");
		var jsonData = json[i];
		for (var ii = 0; ii < headerKeys.length; ii++) {
			var data = jsonData[headerKeys[ii]];
			if (headerKeys[ii] === 'datetime' || headerKeys[ii] === 'extra' || headerKeys[ii] === 'context') {
				data = JSON.stringify(data);
			}
			var td = $("<td>" + data + "</td>");
			tr.append(td);
		}
		tbody.append(tr);
	}
	var table = $('#log-content-table');
	thead.append(tabelRow);
	table.append(thead);
	table.append(tbody);
	return table;
};

module.exports = new AdminInterface();
},{"../Constants.js":5,"../Error/Error.js":6,"../Network/NetworkRequest.js":7,"../Notification/Notification.js":8,"../UI/UI.js":10,"./Database/interface.database.js":1,"./Employees/interface.employees.js":2,"./Logs/interface.logs.js":3}],5:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:49:07
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 09:16:09
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

CONSTANTS.ERROR = {
	TYPE: {
		critical: 1,
		major: 2,
		minor: 3,
		warning:4,
		info: 5
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

},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 09:42:21
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 09:09:21
*/

var NetworkError = require('../Error/Error.js');
var Constants = require('../constants.js');

function Network() {
	this.networkError = Constants.ERROR.NETWORK;
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
		success: function(data, textStatus, request) {
			var contentType = request.getResponseHeader("content-type") || "";
			this.callback(null, data);
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
	        this.callback(localErrorMessage);
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
		return new NetworkError(error.name, error.code, error.desc, optionalMsg);
	}
	return new NetworkError(error.name, error.code, error.desc);
}

module.exports = Network;
},{"../Error/Error.js":6,"../constants.js":11}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 12:41:51
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 16:47:06
*/

var AdminInterface = require('../AdminPanel/interface.js');

var exists = (typeof window["AdminInterface"] !== "undefined");
if (!exists) {
	window.AdminInterface = AdminInterface;
}

AdminInterface.showServiceUnitsOnClick = function(target) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.expandSubMenu(target, function() {
		AdminInterface.databaseInterface('showServiceUnits');
	});
}

AdminInterface.showUserRolesOnClick = function(target) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.expandSubMenu(target, function() {
		AdminInterface.databaseInterface('showAllUserRoles');
	});
}

AdminInterface.showUserReportingUnitsOnClick = function(target) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.expandSubMenu(target, function() {
		AdminInterface.databaseInterface('showUserReportingUnits');
	});
}

AdminInterface.checkVisibliityState = function(element) {
	return $(element).is(':visible');
}
},{"../AdminPanel/interface.js":4}],10:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-19 10:34:42
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-02 09:33:36
*/

var Constants = require('../constants.js');

function UI() {
	//this.jqueryApi =  window.$;

};

// defualt postion is top
UI.prototype.flashMessage = function(errorType, errorMsg, elementID, duration) {
	var type = Constants.ERROR.TYPE;
	var duration = duration || 300;
	var flashMessage = null;
	if (errorType === type.critical) {
		flashMessage = $('<div class="alert alert-danger" role="alert" style="display:none">'+ errorMsg +'</div>');
	}
	else if (errorType === type.major) {
		flashMessage = $('<div class="alert alert-warning" role="alert" style="display:none">'+ errorMsg +'</div>');
	}
	else if (errorType === type.minor) {

	}
	else if (errorType === type.warning) {

	}
	else if (errorType === type.info) {

	}
	else {

	}

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

module.exports = new UI();
},{"../constants.js":11}],11:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}]},{},[9]);
