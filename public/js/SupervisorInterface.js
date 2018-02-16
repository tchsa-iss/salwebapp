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
* @Date:   2017-12-01 12:42:22
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 11:26:36
*/
var SupervisorInterface = require('../Supervisor/interface.js');
var Constants = require('../constants.js');
var UI = require('../UI/UI.js');
var Utils = require('../Utils/Utils.js');

var exists = (typeof window["SupervisorInterface"] !== "undefined");
if (!exists) {
	window.SupervisorInterface = SupervisorInterface;
}

if (!window.currentUser) {
	// hmmm we didn't get a user variable passed to the page
 	console.log("no bueno");
}
else {
	window.supervisorInterface = new SupervisorInterface(window.currentUser);
}

SupervisorInterface.setupListeners = function() {
	$('#supervisors-container').on('show.bs.collapse', function (event) {
  		SupervisorInterface.showSupervisorsTable();
	})
	$('#employees-container').on('show.bs.collapse', function () {
  		SupervisorInterface.showEmployeesTable();
	})
	$('#team-content-container').on('show.bs.collapse', function () {
  		SupervisorInterface.showTeamTable();
	})
}

SupervisorInterface.showSupervisorsTable = function() {
	console.log("show supervisors-container tables");
	supervisorInterface.getAllSupervisors('#supervisors-table');
}

SupervisorInterface.showEmployeesTable = function() {
	console.log("show employees-container tables");
	supervisorInterface.getAllEmployees('#employees-table');
}

SupervisorInterface.showTeamTable = function() {
	console.log("show team-container tables");
	supervisorInterface.getAllTeamMembers('#team-member-table');
}

SupervisorInterface.showPendingSalApprovals = function(data, errorView) {
	var tableContainer = data.tableName + "-container";
	$(tableContainer).hide();
	supervisorInterface.loadMemberSals(data, function(error) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.critical, "There Must Be A Date Selected", errorView, 500);
			return;
		}
		$(data.panelDiv).show('blind', 300);
	});
}

SupervisorInterface.showModal = function(view) {
	$(view).modal("show");
}

SupervisorInterface.present = function(tableName, config, errorView) {
	if (config.type === 'close') {
		supervisorInterface[config.handler](config.closeViews);
		return;
	}
	if (Utils.requiresRowSelect(config)) {
		if (!UI.tableRowIsSelected(tableName)) {
			return UI.flashMessage(Constants.ERROR.TYPE.critical, "Please Select At Least One Row", errorView, 2000);
		}
	}
	var isModal = Utils.isModal(config);
	if (isModal) {
		supervisorInterface.setupModal(tableName, config, function(error, type) {
			if (error) {
				return UI.flashMessage(type, error, errorView, 2500);
			}
			$(config.modalName).modal("show");
			return;
		});
	}
	else {
		supervisorInterface[config.handler](tableName, config, function(error, type, message, messageLocation) {
			if (error) {
				return UI.flashMessage(type, message, errorView, 2500);
			}
			UI.flashMessage(type, message, messageLocation, 2500);
		});
	}
}
// depresiate when you have time use presentModal
SupervisorInterface.onClick = function(target, action, errorView) {
	var error = null;
	function isError(error) {

	}
	function showModal(view) {
		$(view).modal("show");
	}
	switch(action.type) {
		case "add":
			if(action.select && action.select === true) {
				var error = supervisorInterface.add(target, errorView);
				if(error) {
					return;
				}
			}
			supervisorInterface.prepModal(target, action, function(error) {
				if (error) {
					isError();
					return;
				}
				showModal(action.modalName);
			});
			break;
		case "modify":
			error = supervisorInterface.modify(target, errorView);
			break;
		case "delete":
			var error = supervisorInterface.delete(target, errorView);
			if(error) {
				return;
			}
			if (action.isModal) {
				supervisorInterface.prepModal(target, action, function(error) {
					if (error) {
						isError();
						return;
					}
					showModal(action.modalName);
				});
			}
			else {
				supervisorInterface.deleteSupervisor(target);
			}
			break
	}
}

SupervisorInterface.setupListeners();


},{"../Supervisor/interface.js":6,"../UI/UI.js":7,"../Utils/Utils.js":8,"../constants.js":9}],5:[function(require,module,exports){
/*
* @Author: Daniel Roach
* @Date:   2018-01-11 12:36:43
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-14 15:58:30
*/

var Networking = require('../../Network/NetworkRequest.js');

function Modal(targetTable, config, callback) {
	this.modalElement = $(config.modalName);
	this.modalElement.modal({backdrop: 'static', keyboard: false});
	if (!config.submit) {
		this.submitElement = this.modalElement.find(':submit');
		this.submitElement.unbind();
		this.submitElement.on('click', this.submit.bind(this));
		//this.submitHandler = submitHandler;
	}
	else {
		this.submitHandler = this.submit.bind(this);
		this.handler = $(config.submit).on('click', this.submitHandler);
	}
	this.submitCallback = callback;
	this.currentValue = null;
	this.errorElement = $(config.modalName);
	this.table = $(targetTable);
	this.data = null;
	this.selectedRow = null;
	this.config = config;
}

Modal.prototype.prepAddSupervisor = function(callback) {
	var allEmployees = new Networking();
	allEmployees.request("user/super/employees/all", function(error, json) {
		if (error) {
			//UI.flashMessage(Constants.ERROR.TYPE.major, error, this.employeesMessageHead);
			callback(error);
			return;
		}
		var select = $('#supervisor-create-form-select');
		select.empty();
		select.append('<option disabled selected value> -- select a employee -- </option>');
		//select.on('click', this.updateSelection.bind(this));
		json.forEach(function(employee) {
			var option = $('<option>'+ employee.FirstName + ' ' + employee.LastName + '</option>');
			option.data({id: employee.UserID});
			select.append(option);
		})
		select.selectpicker('refresh');
		callback();

	}.bind(this));
	allEmployees.execute();
}

Modal.prototype.prepApproveMemberSal = function(callback) {
	this.modalElement.find('.modal-title').text("Approval");
	this.modalElement.find(':submit').text("Approve SAL");
	var modalBody = this.modalElement.find('.modal-body');
	modalBody.empty();
	modalBody.html('<div class="well"><h4>Please Confirm</h4></div>');
	callback();
}

Modal.prototype.prepDenyMemberSal = function(callback) {
	var table = this.table.DataTable();
	this.selectedRow = table.row( { selected: true } );
	this.modalElement.find('.modal-title').text("SAL Error Correction Form");
	this.modalElement.find(':submit').text("Deny");
	var modalBody = this.modalElement.find('.modal-body');
	modalBody.empty();
	modalBody.html('<form><div class="form-group"><p>Please give a description of the error found in the sal</p><h3 style="color:#777;">Error Message</h3><textarea class="form-control" id="sal-error-message" rows="4"></textarea></div></form>');
	callback();
}

Modal.prototype.prepCreateNewUserSal = function(callback) {
	var table = this.table.DataTable();
	this.selectedRow = table.row( { selected: true } );
	var data = this.selectedRow.data();
	var employee = $('#supervisor-employee-name');
	employee.attr("placeholder", data.FirstName + " " + data.LastName);
	$('#supervisor-create-sal-date').datepicker({showButtonPanel: true});
	callback();
}

Modal.prototype.prepAssignSupervisor = function(callback) {
	var allSupervisors = new Networking();
	allSupervisors.request("user/super/supervisors/all", function(error, json) {
		if (error) {
			//UI.flashMessage(Constants.ERROR.TYPE.major, error, this.employeesMessageHead);
			callback(error);
			return;
		}
		var table = this.table.DataTable();
		this.selectedRow = table.row( { selected: true } );
		var data = this.selectedRow.data();
		var employee = $('#team-add-member-name')
		employee.attr("placeholder", data.FirstName + " " + data.LastName);
		var select = $('#member-supervisor-form-select');
		select.empty();
		select.append('<option disabled selected value> -- select a employee -- </option>');
		//select.on('click', this.updateSelection.bind(this));
		json.forEach(function(supervisor, index) {
			var option = $('<option>'+ supervisor.FirstName + ' ' + supervisor.LastName + '</option>');
			option.data({id: supervisor.ID, index: index});
			select.append(option);
		})
		select.selectpicker('refresh');
		callback();

	}.bind(this));
	allSupervisors.execute();
}

Modal.prototype.prepRemoveSupervisor = function(callback) {
	var table = this.table.DataTable();
	this.selectedRow = table.row( { selected: true } );
	var data = this.selectedRow.data();
	var getSupervisor = new Networking();
	var get = 'user/super/supervisors/' + data.UserID;
	getSupervisor.request(get, function(error, supervisors) {
		if (error) {
			//UI.flashMessage(Constants.ERROR.TYPE.major, error, this.employeesMessageHead);
			callback(error);
			return;
		}
		var table = this.table.DataTable();
		var employee = $('#employee-remove-name')
		employee.attr("placeholder", data.FirstName + " " + data.LastName);
		var select = $('#employee-remove-supervisor-select');
		select.empty();
		select.append('<option disabled selected value> -- select a supervisor -- </option>');
		supervisors.forEach(function(supervisor, index) {
			var option = $('<option>'+ supervisor.FirstName + ' ' + supervisor.LastName + '</option>');
			option.data({id: supervisor.SupervisorID, index: index});
			select.append(option);
		})
		select.selectpicker('refresh');
		callback();
	}.bind(this));
	getSupervisor.execute();
}

Modal.prototype.submit = function() {
	this.submitCallback(this);
}

Modal.prototype.removeAllClickHandlers = function() {
	this.handler.off('click', this.submitHandler);
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
	var data = this.modalElement.find("option:selected").data();
	return data.id;
}

Modal.prototype.getElementData = function(id) {
	var el = this.modalElement.find(id);
	if (el) {
		return el.data();
	}
	return null;
}

Modal.prototype.handleAddSupervisor = function(selectPicker) {
	var selected = this.getBootstrapSelectVal(selectPicker);
	var employee = selected.val();
}

module.exports = Modal;

},{"../../Network/NetworkRequest.js":2}],6:[function(require,module,exports){
/*
* @Author: iss_roachd
* @Date:   2017-12-02 18:05:52
* @Last Modified by:   Daniel Roach
* @Last Modified time: 2018-02-16 12:36:45
*/

var Constants = require('../constants.js');
var InterfaceError = require('../Error/Error.js');
var Notification = require('../Notification/Notification.js');
var Networking = require('../Network/NetworkRequest.js');
var Modal = require('./Modal/interface.modal.js');
var UI = require('../UI/UI.js');
var Utils = require('../Utils/Utils.js');

function SupervisorInterface(user) {
	this.user = user;
	this.dispatch = new Notification();
	//this.modal = new Modal();
	this.currentModal = null;
	this.userError = Constants.ERROR.USER;
	this.employeesTable = null;
	this.supervisorsTable = null;
	this.teamMembersTable = null;
	this.employeesMessageHead = '#employees-container';
	this.supervisorsMessageHead = '#supervisors-container';
	this.teamMessageHead = '#team-content-container';
}

SupervisorInterface.prototype.subscribe = function(eventName, callback, context) {
	this.dispatch.subscribe(eventName, callback, context);
};

SupervisorInterface.prototype.unsubscribe = function(eventName, callback) {

};

SupervisorInterface.prototype.closeMemberApprovals = function(views, callback) {
	var closeCount = 0;
	var stopCount = views.length;
	var intervalID = setInterval(function () {
		$(views[closeCount]).hide('blind', 300);

		if (++closeCount === stopCount) {
			clearInterval(intervalID);
			if (callback) {
				callback();
			}
		}
	}, 400);
}

SupervisorInterface.prototype.setupModal = function(tableName, config, ready) {
	var modal = new Modal(tableName, config, this[config.handler].bind(this));
	modal[config.prep](function(error) {
		ready(error, Constants.ERROR.TYPE.critical);
	});
}

// swap out with function above is needs to be depreciated
SupervisorInterface.prototype.prepModal = function(targetTable, modalData, ready) {
	//this.currentModal = new Modal();
	var type = Constants.MODAL;
	switch (modalData.prep) {
		case type.addSupervisor:
			var modal = new Modal(targetTable, modalData, this.handleAddSupervisorSubmit)
			modal.prepAddSupervisor(function(error) {
				ready();
			})
		break;
		case type.assignSupervisor:
			var modal = new Modal(targetTable, modalData, this.handleAddSupervisorToMember);
			modal.prepAssignSupervisor(function(error) {
				ready();
			});
		break;
		case type.removeEmployeeSupervisor:
			var modal = new Modal(targetTable, modalData, this.handleRemoveSupervisor);
			modal.prepRemoveSupervisor(function(error) {
				if (error) {
					UI.flashMessage(Constants.ERROR.TYPE.critical, error, '#employees-container', 1000);
					return;
				}
				ready();
			})
		break;
		default:
		// new way of handling modal setup look at create new sal modal for reference
			try {
				var modal = new Modal(targetTable, modalData, this[modalData.handler]);
				modal[modalData.prep](function(error) {
					ready();
				});
			} catch(err) {
				console.log("bad news bears");
			}
	}
}

SupervisorInterface.prototype.loadMemberSals = function(data, callback) {
	var member = JSON.parse(data.member.dataset.info);
	var get = "user/sals/by/status/" + member.UserID + "/2";
	$(data.panelDiv).find('.panel-title').text(member.FirstName + " " + member.LastName);
	var getUserSals = new Networking();
	getUserSals.request(get, function(error, response) {
		if (error) {
			callback(error);
			return
		}
		this.updateSalPanel(response, $(data.panelEntry), data);
		callback();
	}.bind(this));
	getUserSals.execute();
}

SupervisorInterface.prototype.updateSalPanel = function(sals, panel, data) {
	panel.empty();
	if (sals.length === 0) {
		var div = $("<p class='text-center'>No SAL's Waiting For Approval </p>");
		panel.append(div);
		return;
	}
	for (var i = 0; i < sals.length; i++) {
		var sal = sals[i];
		sal.config = data;
		sal.tableName = data.tableName;
		sal.timeCompare = data.timeCompare;
		sal.containerHead = data.targetHead;
		var date = Utils.convertDateToReadableFormat(sal.Date);
		var div = $("<button class='btn btn-default'>"+ date + "</button>");
		div.data( "sal", sal );
		div.on("click", this.getSalEntriesFrom.bind(this, div));
		panel.append(div);
	}
}

SupervisorInterface.prototype.getSalEntriesFrom = function(element) {
	var sal = element.data().sal;
	var containerHead = $(sal.containerHead).find('.page-header');
	this.currentSal = sal;
	// console.log(sal);
	// $(sal.tableName + "-container").show('blind', 100);
	var getEntries = new Networking();
	getEntries.request('user/sal/entries/'+sal.ID, function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, containerHead, 1000);
			var table = $(sal.tableName).DataTable();
			$(sal.tableName + "-container").show('blind', 300); // this is bad! need to change this
			return;
		}
		if ($.fn.DataTable.isDataTable(sal.tableName)) {
			Utils.destroyOldTable(sal.tableName);
		}
		var entries = response;
		var table = $(sal.tableName).DataTable( {
			data: entries,
			"scrollX": true,
			scrollY: true,
			select: true,
			buttons: [
        		'copy', 'excel', 'pdf'
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
		// this.currentSal = sal;
		this.getUserSalTime(sal, entries);
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
		$(sal.tableName + "-container").show('blind', 300, function() {
			$(sal.timeCompare).show('blind', 300);
		}); // this is bad! need to change this
	}.bind(this));
	getEntries.execute();
}

SupervisorInterface.prototype.getUserSalTime = function(sal, entries) {
	var timePanel = UI.checkForTimePanel(sal.tableName + "-container");
	if (!timePanel) {
		return;
	}
	var data = {
		date: sal.Date,
		userId: sal.UserID
	};
	var get = "user/supervisor/team/member/timeips/time";
	var getTimeIpsTime = new Networking();
	getTimeIpsTime.request(get, function(error, response) {
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

SupervisorInterface.prototype.submitApprovedSalHandler = function(tableName, config, callback) {
	var post = 'user/supervisor/team/member/sal/approved/' + this.currentSal.ID || "";
	var messageHead = $(config.head).find('.page-header');
	var postApprovedSal = new Networking();
	postApprovedSal.request(post, function(error, response) {
		if (error) {
			callback(true, Constants.ERROR.TYPE.critical, error);
			return;
		}
		this.closeMemberApprovals(config.closeViews, function() {
			callback(error, Constants.STATUS.TYPE.success, response.message, messageHead);
		});
		// UI.closeSalView(config.closeView, function() {
		// 	callback(error, Constants.STATUS.TYPE.success, response.message, messageHead);
		// });
	}.bind(this));
	postApprovedSal.execute('POST');
}

SupervisorInterface.prototype.submitDenySalHandler = function(modal) {
	var data = modal.selectedRow.data();
	var errorMessage = modal.modalElement.find('#sal-error-message').val();
	data.errorMessage = errorMessage;
	data.statusChange = modal.config.statusChange;
	data.userSalId = this.currentSal.ID;
	var json = JSON.stringify(data);

	var postSalError = new Networking()
	postSalError.request('user/supervisor/team/member/sal/error', function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, modal.errorElement, 2000);
			return;
		}
		modal.dismiss();
		UI.flashMessage(Constants.STATUS.TYPE.success, response.message, $('#supervisor-sal-approval-options'), 3000);
	}, json);
	postSalError.execute('POST');
}

SupervisorInterface.prototype.createUserSal = function(modal) {
	var data = modal.selectedRow.data();
	var dateString = modal.modalElement.find('#supervisor-create-sal-date').datepicker({dateFormat: "yy-mm-dd"}).val();
	var date = $.datepicker.formatDate( "yy-mm-dd", new Date(dateString) );
	if (!date) {
		UI.flashMessage(Constants.ERROR.TYPE.critical, "There Must Be A Date Selected", modal.errorElement, 500);
		return;
	}
	var createUserSal = {
		userId: data.UserID,
		date: date,
		entryStatusID: 1, // open sal
	};
	var json = JSON.stringify(createUserSal);
	var createNewUserSal = new Networking();
	createNewUserSal.request('user/supervisor/create/team/member/sal', function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, modal.errorElement, 2000);
			return;
		}
		UI.flashMessage(Constants.STATUS.TYPE.success, response.message, modal.errorElement, 1000);
		modal.dismiss();
	}, json);
	createNewUserSal.execute('POST');
}

SupervisorInterface.prototype.handleRemoveSupervisor = function(modal) {
	var supervisorId = modal.getBootstrapSelectId();
	var post = 'user/super/remove/employee/supervisor';
	var row = modal.selectedRow.data();
	var removeSupervisorData = {
		supervisorId: supervisorId,
		userId: row.UserID
	};
	var json = JSON.stringify(removeSupervisorData);
	var removeSupervisor = new Networking();
	removeSupervisor.request(post, function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, modal.errorElement, 2000);
			return;
		}
		var row = modal.selectedRow;
		var data = row.data();
		var table = modal.getTable().DataTable();
		data.SupervisorID = response.value;
		table.row(row).data(data).draw();
		modal.dismiss();
		/******************* fix *************/
		var container = '#employees-container';
		UI.flashMessage(Constants.STATUS.TYPE.success, response.message, container, 1000);
	}, json);
	removeSupervisor.execute('POST');
}

SupervisorInterface.prototype.handleAddSupervisorToMember = function(modal) {
	var supervisorId = modal.getBootstrapSelectId();
	var post = 'user/super/assign/employee/supervisor';
	var row = modal.selectedRow.data();
	var assignSupervisorData = {
		supervisorId: supervisorId,
		userId: row.UserID
	};
	var json = JSON.stringify(assignSupervisorData);
	var assignSupervisor = new Networking();
	assignSupervisor.request(post, function(error, response) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, modal.errorElement, 500);
			return;
		}
		// var row = modal.selectedRow;
		// var data = row.data();
		// var table = modal.getTable().DataTable();
		// data.SupervisorID = supervisorId;
		// table.row(row).data(data).draw();
		modal.removeAllClickHandlers();
		modal.dismiss();
		/******************* fix *************/
		var container = '#employees-container';
		UI.flashMessage(Constants.STATUS.TYPE.success, response.message, container, 1000);
	}, json);
	assignSupervisor.execute('POST');
}


SupervisorInterface.prototype.handleAddSupervisorSubmit = function(modal) {
	var id = modal.getBootstrapSelectId();
	var post = 'user/super/add/supervisors/'+id;
	var createSupervisor = new Networking();
	createSupervisor.request(post, function(error, supervisor) {
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, modal.errorElement, 500);
			return;
		}
		supervisor.Name = supervisor.FirstName + ' ' + supervisor.LastName;
		var table = modal.getTable().DataTable();
		table.row.add(supervisor).draw();
		modal.dismiss();
	})
	createSupervisor.execute('POST');
}

SupervisorInterface.prototype.add = function(target, errorView) {
	var error = false;
	var table = $(target).DataTable();
	if (!UI.isSelected(table)) {
		var message = "Please Select At Least One Row";
		UI.flashMessage(Constants.ERROR.TYPE.major, message, errorView, 500);
		error = true;
	}
	return error;
}

SupervisorInterface.prototype.modify = function(target, errorView) {
	var error = null;
	var table = $(target).DataTable();
	if (!UI.isSelected(table)) {
		var message = "Please Select At Least One Row To Modify";
		UI.flashMessage(Constants.ERROR.TYPE.major, message, errorView, 500);
		error = true;
	}
	return error;
}

SupervisorInterface.prototype.delete = function(target, errorView) {
	var error = null;
	var table = $(target).DataTable();
	if (!UI.isSelected(table)) {
		var message = "Please Select At Least One Row To Delete";
		UI.flashMessage(Constants.ERROR.TYPE.critical, message, errorView, 500);
		error = true;
		return error;
	}
}

SupervisorInterface.prototype.isValidChange = function(tableName, column, rules) {
	var valid = true;
	var table = $(tableName).DataTable();
	var columnData = table.row( { selected: true } ).data();
	rules.forEach(function(rule) {
		var invalid = columnData[column];
		if (invalid === rule) {
			valid = false;
			return
		}
	});
	return valid;
}

SupervisorInterface.prototype.deleteSupervisor = function(tableName) {
	var table = $(tableName).DataTable();
	var row = table.row( { selected: true } );
	var data = row.data();
	var name = data.FirstName + ' ' + data.LastName;
	var message = $("<h4>You are about to delete "+"<u><stong>"+name +"</stong></u>"+"  as a supervisor</h4>");

	$('#alert-delete-supervisor-message').append(message);

	$('#submit-supervisor-delete').on('click', function() {
		var deleteSup = new Networking();
		var post = 'user/super/delete/supervisor/' + data.ID;
		deleteSup.request(post, function(error, response) {
			if (error) {
				UI.flashMessage(Constants.ERROR.TYPE.major, error, this.supervisorsMessageHead, 1000);
				return;
			}
			$('#alert-delete-supervisor').hide('blind', 300);
			message.remove();
			table.row(row).remove().draw();
		});

		deleteSup.execute('POST');

	}.bind(this, {table:table, row: row, message: message}));

	$('#alert-delete-supervisor').show('blind', 300);
}

SupervisorInterface.prototype.getAllSupervisors = function(tableName, refresh) {
	if (this.supervisorsTable) return

	$('#supervisors-loading').show();
	var allSupervisors = new Networking();
	allSupervisors.request("user/super/supervisors/all", function(error, json) {
		$('#supervisors-loading').hide();
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.supervisorsMessageHead, 1000);
			var table = $(tableName).DataTable();
			this.supervisorsTable = table;
			return;
		}
		// json.forEach(function(supervisor) {
		// 	supervisor.Name = Utils.combineTwoStrings(supervisor.FirstName, supervisor.LastName);
		// })
		var table = $(tableName).DataTable( {
			data: json,
			"scrollX": true,
			scrollY: true,
			select: true,
			buttons: [
        		'copy', 'excel', 'pdf'
    		],
		    columns: [
		        { data: 'ID' },
		        { data: 'UserID' },
		        { 
		        	data: 'Name',
		        	render: function ( data, type, row ) {
       					 return row.FirstName +' '+ row.LastName;
    				}
		    	},

		        { data: 'ReportingUnit' },
		        { data: 'Code' },
		        { data: 'CreateDate' },
		        { data: 'IsActive' },
		    ]
		});
		this.supervisorsTable = table;
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
	}.bind(this));
	allSupervisors.execute();
}

SupervisorInterface.prototype.getAllEmployees = function(tableName) {
	if (this.employeesTable) return;
	$('#employees-loading').show();
	var allEmployees = new Networking();
	allEmployees.request("user/super/employees/all", function(error, json) {
		$('#employees-loading').hide();
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.employeesMessageHead);
		}
		var table = $(tableName).DataTable( {
			data: json,
			"scrollX": true,
			scrollY: '50vh',
			select: true,
		    columns: [
		    	{ 	data: 'UserID',
		    		"visible": false,
		    		"searchable": false
		    	},
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
		this.employeesTable = table;
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
	}.bind(this));
	allEmployees.execute();
}

SupervisorInterface.prototype.getAllTeamMembers = function(tableName) {
	if (this.teamMembersTable) return;
	$('#team-members-loading').show();
	var get = 'user/supervisor/team/members/' + this.user.SupervisorID;
	var allTeamMembers = new Networking();
	allTeamMembers.request(get, function(error, json) {
		$('#team-members-loading').hide();
		if (error) {
			UI.flashMessage(Constants.ERROR.TYPE.major, error, this.teamMessageHead);
		}
		var table = $(tableName).DataTable( {
			data: json,
			"scrollX": true,
			select: true,
		    columns: [
		    	{ 	data: 'UserID',
		    		"visible": false,
		    		"searchable": false
		    	},
		    	{ data: 'Username'},
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
		this.teamMembersTable = table;
		table.buttons().container().appendTo($('.col-sm-6:eq(0)', table.table().container()));
		var tbody = table.table().body();
		$(tbody).on('click', 'tr',{table:table}, UI.selectSingleTableRow);
	}.bind(this));
	allTeamMembers.execute();
}

module.exports = SupervisorInterface;
},{"../Error/Error.js":1,"../Network/NetworkRequest.js":2,"../Notification/Notification.js":3,"../UI/UI.js":7,"../Utils/Utils.js":8,"../constants.js":9,"./Modal/interface.modal.js":5}],7:[function(require,module,exports){
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
},{"../Utils/Utils.js":8,"../constants.js":9}],8:[function(require,module,exports){
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
