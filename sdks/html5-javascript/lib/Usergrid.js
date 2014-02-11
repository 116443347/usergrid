/*
 *  This module is a collection of classes designed to make working with
 *  the Appigee App Services API as easy as possible.
 *  Learn more at http://Usergrid.com/docs/usergrid
 *
 *   Copyright 2012 Usergrid Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  @author rod simpson (rod@Usergrid.com)
 *  @author matt dobson (matt@Usergrid.com)
 *  @author ryan bridges (rbridges@Usergrid.com)
 */


//Hack around IE console.log
window.console = window.console || {};
window.console.log = window.console.log || function() {};


function extend(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;

    subClass.superclass = superClass.prototype;
    if(superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
    return subClass;
}

function NOOP(){}

//Usergrid namespace encapsulates this SDK
/*window.Usergrid = window.Usergrid || {};
Usergrid = Usergrid || {};
Usergrid.USERGRID_SDK_VERSION = '0.10.07';*/


function isValidUrl(url) {
    if (!url) return false;
    var doc, base, anchor, isValid=false;
    try{
        doc = document.implementation.createHTMLDocument('');
        base = doc.createElement('base');
        base.href = base || window.lo;
        doc.head.appendChild(base);
        anchor = doc.createElement('a');
        anchor.href = url;
        doc.body.appendChild(anchor);
        isValid=!(anchor.href === '')
    }catch(e){
        console.error(e);
    }finally{
        doc.head.removeChild(base);
        doc.body.removeChild(anchor);
        base=null;
        anchor=null;
        doc=null;
        return isValid;
    }
}

/*
 * Tests if the string is a uuid
 *
 * @public
 * @method isUUID
 * @param {string} uuid The string to test
 * @returns {Boolean} true if string is uuid
 */
var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isUUID(uuid) {
	return (!uuid)?false:uuidValueRegex.test(uuid);
}

/*
 *  method to encode the query string parameters
 *
 *  @method encodeParams
 *  @public
 *  @params {object} params - an object of name value pairs that will be urlencoded
 *  @return {string} Returns the encoded string
 */
function encodeParams(params) {
    var queryString;
    if(params && Object.keys(params)){
        queryString = [].slice.call(arguments)
            .reduce(function(a, b) {return a.concat((b instanceof Array)?b:[b]);},[])
            .filter(function(c){return "object"===typeof c})
            .reduce(function(p,c){(!(c instanceof Array)) ? p= p.concat(Object.keys(c).map(function(key){return [key,c[key]]})): p.push(c); return p;},[])
            .reduce(function(p,c){((c.length===2) ? p.push(c) : p= p.concat(c)); return p;},[])
            .reduce(function(p,c){(c[1] instanceof Array) ? c[1].forEach(function(v){p.push([c[0],v])}): p.push(c); return p;},[])
            .map(function(c){c[1]=encodeURIComponent(c[1]); return c.join('=')})
            .join('&');
    }
    return queryString;
}


/*
 *  method to determine whether or not the passed variable is a function
 *
 *  @method isFunction
 *  @public
 *  @params {any} f - any variable
 *  @return {boolean} Returns true or false
 */
function isFunction(f) {
	return (f && f !== null && typeof(f) === 'function');
}

/*
 *  a safe wrapper for executing a callback
 *
 *  @method doCallback
 *  @public
 *  @params {Function} callback - the passed-in callback method
 *  @params {Array} params - an array of arguments to pass to the callback
 *  @params {Object} context - an optional calling context for the callback
 *  @return Returns whatever would be returned by the callback. or false.
 */
function doCallback(callback, params, context) {
	var returnValue;
	if (isFunction(callback)) {
		if (!params) params = [];
		if (!context) context = this;
		params.push(context);
		//try {
			returnValue = callback.apply(context, params);
		/*} catch (ex) {
			if (console && console.error) {
				console.error("Callback error:", ex);
			}
		}*/
	}
	return returnValue;
}

//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
	var name = 'Usergrid', overwrittenName = global[name];

    function Usergrid() {
        this.logger = new Logger(name);
    }

    Usergrid.isValidEndpoint = function (endpoint) {
        //TODO actually implement this
        return true;
    };
    var VALID_REQUEST_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
    Usergrid.Request = function (method, endpoint, query_params, data, callback) {
        var p = new Promise();
        /*
         Create a logger
         */
        this.logger = new global.Logger("Usergrid.Request");
        this.logger.time("process request " + method + " " + endpoint);
        /*
         Validate our input
         */
        this.endpoint=endpoint;
        this.method = method.toUpperCase();
        this.query_params = query_params;
        this.data = ("object" === typeof data) ? JSON.stringify(data) : data;

        if (VALID_REQUEST_METHODS.indexOf(this.method) === -1) {
            throw new UsergridInvalidHTTPMethodError("invalid request method '" + this.method + "'");
        }

        /*
         Prepare our request
         */
        if (!isValidUrl(this.endpoint)) {
            this.logger.error(endpoint, this.endpoint, /^https:\/\//.test(endpoint));
            throw new UsergridInvalidURIError("The provided endpoint is not valid: " + this.endpoint);
        }
        /* a callback to make the request */
        var request=function () {return Ajax.request(this.method, this.endpoint, this.data)}.bind(this);
        /* a callback to process the response */
        var response=function (err, request) {return new Usergrid.Response(err, request)}.bind(this);
        /* a callback to clean up and return data to the client */
        var oncomplete=function (err, response) {
            p.done(err, response);
            this.logger.info("REQUEST", err, response);
            doCallback(callback, [err, response]);
            this.logger.timeEnd("process request " + method + " " + endpoint);
        }.bind(this);
        /* and a promise to chain them all together */
        Promise.chain([request,response]).then(oncomplete);

        return p;
    };
    Usergrid.Request.prototype= new UsergridStorable();
    //TODO more granular handling of statusCodes
    Usergrid.Response = function (err, response) {
        var p = new Promise();
        this.logger = new global.Logger(name);
        this.success = true;
        this.err = err;
        this.data = {};
        var data;
        try {
            data = JSON.parse(response.responseText);
        } catch (e) {
            //this.logger.error("Error parsing response text: ",this.text);
            this.logger.error("Caught error ", e.message);
            data = {}
        } finally {
            this.data = data;
        }
        this.status = parseInt(response.status);
        this.statusGroup = (this.status - this.status % 100);
        switch (this.statusGroup) {
            case 200:
                this.success = true;
                break;
            case 400:
            case 500:
            case 300:
            case 100:
            default:
                //server error
                this.success = false;
                break;
        }
        var self = this;
        if (this.success) {
            p.done(null, this);
        } else {
            p.done(UsergridError.fromResponse(this.data), this);
        }
        return p;
    };
    Usergrid.Response.prototype.getEntities = function () {
        var entities=[]
        if (this.success && this.data.entities) {
            entities=this.data.entities;
        }
        return entities;
    }
    Usergrid.Response.prototype.getEntity = function () {
        var entities=this.getEntities();
        return entities[0];
    }

    //Usergrid.Entity=function(){};
		//Usergrid.Collection=function(){};
	global[name] =  Usergrid;
	global[name].noConflict = function() {
		if(overwrittenName){
			global[name] = overwrittenName;
		}
		return Usergrid;
	};
	return global[name];
}(this));



