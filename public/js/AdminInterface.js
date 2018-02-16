(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:18:11
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-05 17:33:36
*/

var Constants = require('../../constants');
var Networking = require('../../Network/NetworkRequest.js');
var UI = require('../../UI/UI.js');
var Utils = require('../../Utils/Utils.js');

function DatabaseInterface() {
	this.LOGS = Constants.LOGTYPES.AVAILABLE;
	this.currentLog = null;
	this.serviceUnitsInit = false;
}

DatabaseInterface.prototype.get = function(request, callback) {
	var get = new Networking();
	get.request(request, function(error, json, id) {
		callback(error, json, id);
	});
	get.execute();
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
		if (!Utils.dataTableExists('#service-units-table')) {
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
		}
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
		if (Utils.dataTableExists('#user-roles-table')) return;
		var table = $('#user-roles-table').DataTable( {
			data: json,
			"scrollX": true,
			buttons: [
        		'copy', 'excel', 'pdf'
    		],
		    columns: [
		        {data: 'Username'},
		        {data: 'FirstName'},
		        {data: 'LastName'},
		        {data: 'DisplayName'},
		        {
		        	targets: -1,
		        	data: null,
		        	defaultContent: "<button type='button' class='btn btn-danger btn-sm'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span> Delete</button>"
		        }
		    ]
		});
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
	});
	userRoles.execute();
}

DatabaseInterface.prototype.showUserReportingUnits = function() {
	var reportingUnits = new Networking();
	reportingUnits.request("admin/database/user/reporting/units", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
		}
		if (Utils.dataTableExists('#user-reporting-units-table')) return;
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

DatabaseInterface.prototype.showAccountCodeGroup = function(id, callback) {
	var groupTypePath = "admin/database/account/codes/type/"+id;
	var activityCode = new Networking();
	activityCode.request(groupTypePath, function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
			callback(false);
		}
		if (Utils.dataTableExists('#account-codes-table')) return;
		var table = $('#account-codes-table').DataTable( {
			data: json,
			"scrollX": true,
			buttons: [
        		'copy', 'excel', 'pdf'
    		],
		    columns: [
		        { data: 'Code' },
		        { data: 'Group' },
		        { data: 'GroupDesc' },
		        { data: 'Billable' },
		        { data: 'Name' },
		        { data: 'Description' },
		        { data: 'Active'},
		    ]
		});
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
		callback(true);
	});
	activityCode.execute();
}

DatabaseInterface.prototype.addReportingUnit = function(userID) {
	addReportingUnit = new Networking();
	addReportingUnit.request("admin/database/user/reporting/unit", function(error, response) {
		if (error) {
			//handle post error
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, '#dashboard-main');
		}
		UI.flashMessage(Constants.STATUS.TYPE.success, "success", '#dashboard-main');
		var table = $('#user-reporting-units-table').DataTable();
		table.rows.add(response).draw();
	});
}

DatabaseInterface.prototype.addNewUserRole = function(data, callback) {
	var json = JSON.stringify(data);
	addRole = new Networking();
	addRole.request("admin/database/user/role", function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, error, '#create-user-role-modal', 500);
			callback(false);
			return;
		}
		var table = $('#user-roles-table').DataTable();
		table.row.add(response.add).draw();
		// call success message
		callback(true);
	},json);
	addRole.execute('POST');
}

DatabaseInterface.prototype.projects = function() {

}

DatabaseInterface.prototype.activityCodes = function() {
	var activityCodes = new Networking();
	activityCodes.request("admin/database/sal/activity/codes", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main');
		}
		$('#activity-codes-table').DataTable( {
			data: json,
			"scrollX": true,
		    columns: [
		        { data: 'FirstName' },
		        { data: 'LastName' },
		        { data: 'activityCodes' }
		    ]
		});
	});
	activityCodes.execute();
}

module.exports = new DatabaseInterface();
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../Utils/Utils.js":11,"../../constants":12}],2:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:18:27
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-11 10:37:56
*/

var Constants = require('../../constants');
var Networking = require('../../Network/NetworkRequest.js');
var UI = require('../../UI/UI.js');
var Utils = require('../../Utils/Utils.js');

function EmployeeInterface() {
	this.services = Constants.SERVICES;
}

EmployeeInterface.prototype.show = function(employees) {
	if (employees === this.services.all) {
		return this.all();
	}
}

EmployeeInterface.prototype.get = function(request, callback) {
	var get = new Networking();
	get.request(request, function(error, json, id) {
		callback(error, json, id);
	});
	get.execute();
}

EmployeeInterface.prototype.getJobTitles = function(callback) {
	var employeeTitles = new Networking();
	employeeTitles.request("admin/employees/job/titles", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main', 500);
			callback(false);
		}
		if (Utils.dataTableExists('#job-titles-table')) {
			 callback(true);
			 return;
		}

		var table = $('#job-titles-table').DataTable( {
			data: json,
			"scrollX": true,
			buttons: [
        		'copy', 'excel', 'pdf'
    		],
		    columns: [
		        { data: 'id' },
		        { data: 'name' },
		        { data: 'Description' },
		    ]
		});
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
		callback(true);
	});
	employeeTitles.execute();
}

EmployeeInterface.prototype.all = function() {
	var all = new Networking();
	all.request("admin/employees/all", function(error, json) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, '#dashboard-main', 500);
		}
		if (Utils.dataTableExists('#employees-table')) return;

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
		        { data: 'IsActive' }
		    ]
		});
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
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../Utils/Utils.js":11,"../../constants":12}],3:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2017-12-20 12:19:12
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-04 15:11:15
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
},{"../../Network/NetworkRequest.js":7,"../../UI/UI.js":10,"../../constants":12}],4:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-01 12:39:17
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-01-06 17:47:27
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

AdminInterface.prototype.empoyeeInterface = function(method, args, callback) {
	EmployeeInterface[method](args, callback);
}

AdminInterface.prototype.logInterface = function(method, args) {
	LogInterface[method](args);
}

AdminInterface.prototype.databaseInterface = function(method, args, callback) {
	DatabaseInterface[method](args, callback);
}

AdminInterface.prototype.add = function(target, errorView) {

}

AdminInterface.prototype.modify = function(target, errorView) {
	var error = null;
	var table = $(target).DataTable();
	if (table.rows('.info').data().length < 1) {
		var message = "Please Select At Least One Row To Modify";
		UI.flashMessage(Constants.ERROR.TYPE.major, message, errorView, 500);
		error = true;
	}
	return error;
}

AdminInterface.prototype.delete = function(target, errorView) {
	var error = null;
	var table = $(target).DataTable();
	if (table.rows('.info').data().length < 1) {
		var message = "Please Select At Least One Row To Delete";
		UI.flashMessage(Constants.ERROR.TYPE.critical, message, errorView, 500);
		error = true;
	}
	return error;
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
},{"../Error/Error.js":6,"../constants.js":12}],8:[function(require,module,exports){
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
* @Last Modified time: 2018-01-08 14:12:49
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

AdminInterface.showProjectsOnClick = function(target) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.expandSubMenu(target, function() {
		//AdminInterface.databaseInterface('showUserReportingUnits');
	});
}

AdminInterface.showActivityCodesOnClick = function(target, refresh) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.expandSubMenu(target, function() {
		if($('#active-code-selections').has("button").length > 0) return;
		AdminInterface.databaseInterface('get', 'admin/database/account/code/types', function(error, codeTypes) {
			var buttonTypeGroup = $('#active-code-selections');
			codeTypes.forEach(function(type) {
				var onClickHandler = function() {
					AdminInterface.databaseInterface('showAccountCodeGroup', this.id, function(ready) {
						if (ready) {
							$('#activity-code-table-container').show('blind', 200, function() {
								$('#account-codes-options').show('slide', 200);
							});

						}
					});
				}.bind({id: type.CodeTypeID});
				var button = $('<button type="button" class="btn btn-default btn-sm">'+type.Name+'</button>');
				button.click(onClickHandler);
				buttonTypeGroup.append(button);
			})
		});
	});
}

AdminInterface.showModalTemp = function(view, request) {
	$(view).modal("show");
}

AdminInterface.onEmployeeJobTitlesClick = function(target, refresh) {
	if (AdminInterface.checkVisibliityState(target)) {
		AdminInterface.collapseSubMenu(target);
		return;
	}
	AdminInterface.empoyeeInterface('getJobTitles', function(ready) {
		if (ready) {
			AdminInterface.expandSubMenu(target, function() {
				console.log("done");
			})
		}
	});
}

AdminInterface.showModal = function(target, request) {
	var threads = 2;
	var clearOptions = function(parent) {
		while (parent.firstChild) { 
    		parent.removeChild(parent.firstChild); 
		}
		$(parent).append('<option selected="selected"></option>');
	}
	var done = function(error, data) {
		if (error) {
			// handle error
			return;
		}
		var id = this.id;
		data.forEach(function(obj) {
			if (id === 1) {
				var userSelectForm = $("#user-form-select");
				var name = obj.FirstName + " " + obj.LastName;
				userSelectForm.append('<option data-user-id='+obj.UserID +'>'+name+'</option>');
			}
			if (id === 2) {
				var userRoles = $("#user-form-roles");
				userRoles.append('<option data-role-id='+obj.ID+'>'+obj.DisplayName+'</option>');
			}
		})
		threads--;
		if (threads === 0) {
			$(target).modal("show");
		}
	}
	var userSelectElement = document.getElementById('user-form-select')
	var rolesElement = document.getElementById('user-form-roles')
	clearOptions(userSelectElement);
	clearOptions(rolesElement);
	AdminInterface.empoyeeInterface('get', 'admin/employees/all', done.bind({id:1}));
	AdminInterface.databaseInterface('get', 'admin/database/roles',done.bind({id:2}));
}

AdminInterface.onClick = function(target, action, errorView) {
	var error = null;
	switch(action.type) {
		case "add":
			error = AdminInterface.add(target, errorView);
			break;
		case "modify":
			error = AdminInterface.modify(target, errorView);
			break;
		case "delete":
			error = AdminInterface.delete(target, errorView);
			break
	}
	if (error) return;
	
	if (action.isModal) {
		this.showModalTemp(action.modal);
	}
}

AdminInterface.createUserRole = function(target) {
	var selectedUserId = $('#user-form-select').find(":selected").attr('data-user-id'); //$('#user-form-select').find(":selected").text();
	var selectedRoleId = $('#user-form-roles').find(":selected").attr('data-role-id'); //$('#user-form-roles').find(":selected").text();
	var postNewRole = {
		userId: selectedUserId,
		userRoleId: selectedRoleId
	};
	AdminInterface.databaseInterface('addNewUserRole', postNewRole, function(response) {
		if (response) {
			$(target).modal("hide");
		}
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
},{"../Utils/Utils.js":11,"../constants.js":12}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}]},{},[9]);
