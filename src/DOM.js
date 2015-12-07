function _elize(element) {
	return typeof element === 'string' ? document.querySelectorAll(element) : element;
}

function addClass(element, className) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			addClass(element[i], className);
		}
		return;
	}

	if (hasClass(element, className)) return;

	if (element.classList)
		element.classList.add(className);
	else
		element.className += ' ' + className;
}

function removeClass(element, className) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			removeClass(element[i], className);
		}
		return;
	}
	if (element.classList)
		element.classList.remove(className);
	else
		element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function hasClass(element, className) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		var ret = true;
		for (var i = 0; i < element.length; ++i) {
			if ( ! hasClass(element[i], className)) ret = false;
		}
		return ret;
	}

	if (element.classList)
		return element.classList.contains(className);
	else
		return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
}

function toggleClass(element, className, value) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			toggleClass(element[i], className, value);
		}
		return;
	}

	if (value)
		addClass(element, className);
	else
		removeClass(element, className);
}

function css(element, rule) {
	if ( ! element) return;
	element = _elize(element);
	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		element = element[0];
	}
	return getComputedStyle(element).getPropertyValue(rule);
}

// ANIMATIONS

function show(element) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			show(element[i]);
		}
		return;
	}

	element.removeAttribute('hidden');
}

function hide(element) {
	if ( ! element) return;
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			hide(element[i]);
		}
		return;
	}

	element.setAttribute('hidden', true);
}

function fadeIn(element) {
	if ( ! element) return;
	_setUpAnimationStylesheet();
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			fadeIn(element[i]);
		}
		return;
	}

	element.removeAttribute('hidden');
	var onEnd = function(e) {
		removeClass(e.target, 'PSanimated');
		removeClass(e.target, 'PSfadeIn');
		_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
	};
	_prefixedEvent(element, 'AnimationEnd', onEnd);
	addClass(element, 'PSanimated');
	addClass(element, 'PSfadeIn');
}

function fadeOut(element) {
	if ( ! element) return;
	_setUpAnimationStylesheet();
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			fadeOut(element[i]);
		}
		return;
	}

	var onEnd = function(e) {
		e.target.setAttribute('hidden', true);
		removeClass(e.target, 'PSanimated');
		removeClass(e.target, 'PSfadeOut');
		_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
	};
	_prefixedEvent(element, 'AnimationEnd', onEnd);
	addClass(element, 'PSanimated');
	addClass(element, 'PSfadeOut');
}

function slideInRight(element) {
	if ( ! element) return;
	_setUpAnimationStylesheet();
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			slideInRight(element[i]);
		}
		return;
	}

	element.removeAttribute('hidden');
	var onEnd = function(e) {
		removeClass(e.target, 'PSanimated');
		removeClass(e.target, 'PSslideInRight');
		_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
	};
	_prefixedEvent(element, 'AnimationEnd', onEnd);
	addClass(element, 'PSanimated');
	addClass(element, 'PSslideInRight');
}

function slideOutRight(element) {
	if ( ! element) return;
	_setUpAnimationStylesheet();
	element = _elize(element);

	if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
		for (var i = 0; i < element.length; ++i) {
			slideOutRight(element[i]);
		}
		return;
	}

	var onEnd = function(e) {
		e.target.setAttribute('hidden', true);
		removeClass(e.target, 'PSanimated');
		removeClass(e.target, 'PSslideOutRight');
		_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
	};
	_prefixedEvent(element, 'AnimationEnd', onEnd);
	addClass(element, 'PSanimated');
	addClass(element, 'PSslideOutRight');
}

var _animationStylesheet = false;

function _addRuleToStyle(sheet, selector, rules) {
	sheet.insertRule(selector + '{' + rules + '}', 0);
}

function _setUpAnimationStylesheet() {

	if (_animationStylesheet) return;

	// Create the <style> tag
	var style = document.createElement('style');

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute('media', 'screen')
	// style.setAttribute('media', 'only screen and (max-width : 1024px)')

	// WebKit hack :(
	style.appendChild(document.createTextNode(''));

	// Add the <style> element to the page
	document.head.appendChild(style);

	_animationStylesheet = style.sheet;

	_addRuleToStyle(_animationStylesheet, '.PSanimated', `
		animation-duration: 0.35s; -webkit-animation-duration: 0.35s;
		animation-fill-mode: both; -webkit-animation-fill-mode: both;
		animation-timing-function: ease-in-out; -webkit-animation-timing-function: ease-in-out;
	`);

	var animations = {
		fadeIn: `
			0% { opacity: 0; }
			70% { opacity: 1; }
			100% { opacity: 1; }
		`,
		fadeOut: `
			0% { opacity: 1; }
			70% { opacity: 0; }
			100% { opacity: 0; }
		`,
		slideInRight: `
			from {
				transform: translate3d(100%, 0, 0); -webkit-transform: translate3d(100%, 0, 0);
				visibility: visible;
			}
			to { transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); }
		`,
		slideOutRight: `
			from { transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); }
			to {
				visibility: hidden;
				transform: translate3d(100%, 0, 0); -webkit-transform: translate3d(100%, 0, 0);
			}
		`
	};

	for (var key in animations) {

		_addRuleToStyle(_animationStylesheet, `@-webkit-keyframes PS${key}`, animations[key]);
		_addRuleToStyle(_animationStylesheet, `@keyframes PS${key}`, animations[key]);

		_addRuleToStyle(_animationStylesheet, `.PS${key}`, `
			animation-name: PS${key}; -webkit-animation-name: PS${key};
		`);
	}
}

var _prefixes = ['webkit', 'moz', 'MS', 'o', ''];
function _prefixedEvent(element, type, callback) {
	element = _elize(element);
	for (var p = 0; p < _prefixes.length; p++) {
		if (!_prefixes[p]) type = type.toLowerCase();
		element.addEventListener(_prefixes[p]+type, callback, false);
	}
}
function _prefixedRemoveEvent(element, type, callback) {
	element = _elize(element);
	for (var p = 0; p < _prefixes.length; p++) {
		if (!_prefixes[p]) type = type.toLowerCase();
		element.removeEventListener(_prefixes[p]+type, callback);
	}
}

export default {
	addClass,
	removeClass,
	hasClass,
	toggleClass,
	css,
	show,
	hide,
	fadeIn,
	fadeOut,
	slideInRight,
	slideOutRight
};
