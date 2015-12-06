function _elize(element) {
	return typeof element === 'string' ? document.querySelector(element) : element;
}

function ready(fn) {
	if (document.readyState != 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

function addClass(element, className) {
	element = _elize(element);
	if (element.classList)
		element.classList.add(className);
	else
		element.className += ' ' + className;
}

function removeClass(element, className) {
	element = _elize(element);
	if (element.classList)
		element.classList.remove(className);
	else
		element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function hasClass(element, className) {
	element = _elize(element);
	if (element.classList)
		return element.classList.contains(className);
	else
		return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
}

function toggleClass(element, className, value) {
	element = _elize(element);
	if (value)
		addClass(element, className);
	else
		removeClass(element, className);
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

export default {
	ready,
	addClass,
	removeClass,
	hasClass,
	toggleClass,
	css,
	queryChildren
};
