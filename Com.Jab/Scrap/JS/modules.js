(function(g, undefined) {
	var z;
	var hasOwnPropertyFunc;
	var moduleFromModulePathStr;
	var regExpModulePathStr;
	var n;
	hasOwnPropertyFunc = g.Object.prototype.hasOwnProperty;
	if (hasOwnPropertyFunc.call(g, "z")) {
		throw Error("z is already defined in the global namespace, conflicts may occur");
	}
	z = g.z = {};
	moduleFromModulePathStr = {};
	n = -9007199254740992;
	regExpModulePathStr = /^[^\/]+(\/[^\/]+)*$/;
	
	function isArrayIsh(obj) {
		var len;
		if (obj === null || typeof obj !== "object") {
			return false;
		}
		len = obj.length;
		if (typeof len !== "number" ||
			(len % 1) !== 0 || 
			!(0 <= len && len <= 9007199254740992)) {
			return false;
		}
		return true;
	}
	
	function addDependency(dependantModule, dependency) {
		dependantModule.__dependencies.push(dependency);
		dependency.__dependants.push(dependantModule);
	}
	
	function circularDependencyTest(moduleWithDependencies, mark) {
		var ds, i, len;
		ds = moduleWithDependencies.__dependencies;
		len = ds.length;
		for (i = 0; i < len; ++i) {
			ds[i].__circularDependencyTest_setMark(mark);
			if (ds[i].__dependencies !== null) {
				circularDependencyTest(ds[i], mark);
			}
		}
	}
	
	function Module(modulePathStr) {
		this.__modulePathStr = modulePathStr;
	}
	Module.prototype = {

		__initialize_assumeNoDependenciesAndLoaded: function(initializeFunc) {
			this.__initializeFunc = null;
			this.__dependencies = [];
			this.__dependenciesOfWhichInitializeHasBeenCalled = 0;
			this.__dependants = [];
			this.__hasInitializeFuncBeenCalled = true;
			this.__circularDependencyTest_mark = null;
			initializeFunc(g);
		},
		
		__initialize_attemptToLoad: function() {
			this.__initializeFunc = null;
			this.__dependencies = null;
			this.__dependenciesOfWhichInitializeHasBeenCalled = 0;
			this.__dependants = [];
			this.__hasInitializeFuncBeenCalled = false;
			this.__circularDependencyTest_mark = null;
			this.__attemptToLoad();
		},
		
		__initialize_loadedModuleWithDependencies: function (initializeFunc, nullFromDependencyModulePathStr) {
		    this.__circularDependencyTest_mark = null;
		    this.__dependants = [];
		    this.__dependenciesOfWhichInitializeHasBeenCalled = 0;
		    this.__setLoadedCore(initializeFunc, nullFromDependencyModulePathStr);
		},

		__attemptToLoad: function() {
			var scriptElem;
			scriptElem = g.document.createElement("script");
			scriptElem.type = "text/javascript";
			scriptElem.src = this.__modulePathStr + ".js";
			scriptElem.async = true;
			g.document.getElementsByTagName("head")[0].appendChild(scriptElem);
		},
		
		__setLoadedCore: function(initializeFunc, nullFromDependencyModulePathStr) {
			this.__dependencies = [];
			var mpstrDep;
			var mDep;
			for (mpstrDep in nullFromDependencyModulePathStr) {
				if (hasOwnPropertyFunc.call(nullFromDependencyModulePathStr, mpstrDep)) {
					if (hasOwnPropertyFunc.call(moduleFromModulePathStr, mpstrDep)) {
						mDep = moduleFromModulePathStr[mpstrDep];
						if (mDep.__hasInitializeFuncBeenCalled) {
							++this.__dependenciesOfWhichInitializeHasBeenCalled;
						}
					} else {
						mDep = new Module(mpstrDep);
						moduleFromModulePathStr[mpstrDep] = mDep;
						mDep.__initialize_attemptToLoad();
					}
					addDependency(this, mDep);
				}
			}
			if (++n === n) {
			    throw Error("too much modules");
			}
			this.__circularDependencyTest_setMark(n);
			circularDependencyTest(this, n);
			this.__hasInitializeFuncBeenCalled = 
				this.__dependenciesOfWhichInitializeHasBeenCalled === this.__dependencies.length;
			if (this.__hasInitializeFuncBeenCalled) {
				this.__initializeFunc = null;
				initializeFunc(g);
			} else {
				this.__initializeFunc = initializeFunc;
			}
		},
		
		__circularDependencyTest_setMark: function(mark) {
			if (mark === this.__circularDependencyTest_mark) {
				throw Error("the module identified by \"" + this.__modulePathStr + "\" is involved in a circular dependency");
			}
			this.__circularDependencyTest_mark = mark;
		},
		
		__propagateUpdateDependants: function() {
			var i;
			var len;
			var d;
			var t;
			len = this.__dependants.length;
			for (i = 0; i < len; ++i) {
				d = this.__dependants[i];
				if (++d.__dependenciesOfWhichInitializeHasBeenCalled === d.__dependencies.length) {
					d.__hasInitializeFuncBeenCalled = true;
					t = d.__initializeFunc;
					d.__initializeFunc = null;
					t(g);
					d.__propagateUpdateDependants();
				}
			}
		},
		
		__onLoad: function(initializeFunc, nullFromDependencyModulePathStr) {
			this.__setLoadedCore(initializeFunc, nullFromDependencyModulePathStr);
			if (this.__hasInitializeFuncBeenCalled) {
				this.__propagateUpdateDependants();
			}
		},
		
		getHasInitializeFuncBeenCalled: function() {
			return this.__hasInitializeFuncBeenCalled;
		}
	};
	
	function isValidModulePathStr(str) {
		return typeof str === "string" && regExpModulePathStr.test(str);
	}
	
	function verifyModulePathStrArg(str) {
		if (!isValidModulePathStr(str)) {
			throw Error("modulePathStr must be a valid path string (a slash at the beginning or end is not allowed) (\"" + modulePathStr + "\")");
		}
	}
	
	function hasOwnProperties(obj) {
		var k;
		for (k in obj) {
			if (hasOwnPropertyFunc.call(obj, k)) {
				return true;
			}
		}
		return false;
	}
	
	function createNullFromDependentOnModulePathStr(arr) {
		var obj;
		var i, len;
		var elem;
		if (!isArrayIsh(arr)) {
			throw Error("dependentOnModulePathStrs must be an array of valid path strings");
		}
		obj = {};
		len = arr.length;
		for (i = 0; i < len; ++i) {
			if (hasOwnPropertyFunc.call(arr, i)) {
				elem = arr[i];
				if (typeof elem !== "string" || !regExpModulePathStr.test(elem)) {
					throw Error("dependentOnModulePathStrs must be an array of valid path strings");
				}
				obj[elem] = null;
			}
		}
		return obj;
	}
	
	
    (function () {

        var mainModule;
        var mainModulePathStr;
	    var mainModuleName;
	    var lastScriptElem;
	    var lastScriptElemFileName;
	    var i;

	    g.Object.defineProperty(z, "Module", { value: {} });
	    g.Object.defineProperty(z.Module, "define", {
	        value: function () {
	            var modulePathStr;
	            var nullFromDependentOnModulePathStr;
	            var initializeFunc;
	            var module;
	            switch (arguments.length) {
	                case 0:
	                case 1:
	                    throw Error("not enough arguments");
	                case 2:
	                    modulePathStr = arguments[0];
	                    nullFromDependentOnModulePathStr = {};
	                    initializeFunc = arguments[1];
	                    break;
	                default:
	                    modulePathStr = arguments[0];
	                    nullFromDependentOnModulePathStr = createNullFromDependentOnModulePathStr(arguments[1]);
	                    initializeFunc = arguments[2];
	                    break;
	            }
	            verifyModulePathStrArg(modulePathStr);
	            if (!(initializeFunc instanceof g.Function)) {
	                throw Error("initializeFunc must be a function");
	            }
	            module = moduleFromModulePathStr[modulePathStr];
	            if (hasOwnPropertyFunc.call(moduleFromModulePathStr, modulePathStr)) {
	                if (module.getHasInitializeFuncBeenCalled()) {
	                    throw Error("z.Module.define has already been called for module \"" + modulePathStr + "\"");
	                }
	                module.__onLoad(initializeFunc, nullFromDependentOnModulePathStr);
	            } else {
	                module = moduleFromModulePathStr[modulePathStr] = new Module(modulePathStr);
	                if (!hasOwnProperties(nullFromDependentOnModulePathStr)) {
	                    module.__initialize_assumeNoDependenciesAndLoaded(initializeFunc);
	                } else {
	                    module.__initialize_loadedModuleWithDependencies(initializeFunc, nullFromDependentOnModulePathStr);
	                }
	            }
	        }
	    });





	    i = g.document.getElementsByTagName("script");
	    lastScriptElem = i[i.length - 1];
	    i = lastScriptElem.src.lastIndexOf("/");
	    if (i < 0) {
	        lastScriptElemFileName = i.src;
	    } else {
	        lastScriptElemFileName = lastScriptElem.src.substring(i + 1);
	    }
	    if (lastScriptElemFileName !== "modules.js") {
	        throw Error("\
                modules.js is assumed to be loaded using a script element (e.g. <script src=\"modules.js\"></script>) and \
                at the time of loading this script element is assumed to be the last script element");
	    }
	    if (!hasOwnPropertyFunc.call(lastScriptElem.dataset, "mainModuleName") ||
            (mainModuleName = lastScriptElem.dataset["mainModuleName"]).length === 0) {
	        throw Error("the last script element must hava a data-main-module-name attribute with non-empty name specifying the name of the javascript file (without extension) that represents the startup module to be loaded initially");
	    }
        
	    if (!isValidModulePathStr(mainModuleName)) {
	        throw Error("the main module name is invalid");
	    }
	    if (i < 0) {
	        mainModulePathStr = mainModuleName;
	    } else {
	        mainModulePathStr = lastScriptElem.src.substring(0, i + 1) + mainModuleName;
	    }
	    mainModule = new Module(mainModulePathStr);
	    moduleFromModulePathStr[mainModulePathStr] = mainModule;
	    mainModule.__initialize_attemptToLoad();

	    lastScriptElem.parentNode.removeChild(lastScriptElem);

	})();

})(this);