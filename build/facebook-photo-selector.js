(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _DOM = __webpack_require__(1);

	var _DOM2 = _interopRequireDefault(_DOM);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var facebookPhotoSelector = (function () {
		function facebookPhotoSelector() {
			_classCallCheck(this, facebookPhotoSelector);
		}

		_createClass(facebookPhotoSelector, [{
			key: 'toString',
			value: function toString() {
				return 'Hello visitor';
			}
		}]);

		return facebookPhotoSelector;
	})();

	exports.default = facebookPhotoSelector;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function _elize(element) {
		return typeof element === 'string' ? document.querySelector(element) : element;
	}

	function addClass(element, className) {
		element = _elize(element);
		if (element.classList) element.classList.add(className);else element.className += ' ' + className;
	}

	function removeClass(element, className) {
		element = _elize(element);
		if (element.classList) element.classList.remove(className);else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}

	function hasClass(element, className) {
		element = _elize(element);
		if (element.classList) return element.classList.contains(className);else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
	}

	function toggleClass(element, className, value) {
		element = _elize(element);
		if (value) addClass(element, className);else removeClass(element, className);
	}

	function css(element, rule) {
		element = _elize(element);
		return getComputedStyle(element).getPropertyValue(rule);
	}

	var _queryChildrenCount = 0; // select direct children
	function queryChildren(element, query) {
		element = _elize(element);
		var id = element.id,
		    guid = element.id = id || 'query_children_' + _queryChildrenCount++,
		    attr = '#' + guid + ' > ',
		    selector = attr + (query + '').replace(',', ',' + attr, 'g');
		var result = element.parentNode.querySelectorAll(selector);
		if (!id) element.removeAttribute('id');
		return result;
	}

	exports.default = {
		addClass: addClass,
		removeClass: removeClass,
		hasClass: hasClass,
		toggleClass: toggleClass,
		css: css,
		queryChildren: queryChildren
	};

/***/ }
/******/ ])
});
;