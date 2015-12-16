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
	exports.facebookPhotoSelector = undefined;

	var _DOM = __webpack_require__(1);

	var _DOM2 = _interopRequireDefault(_DOM);

	var _utils = __webpack_require__(2);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var facebookPhotoSelector = exports.facebookPhotoSelector = (function () {
		function facebookPhotoSelector(settings) {
			var _this = this;

			_classCallCheck(this, facebookPhotoSelector);

			// variables
			this._albums = [];
			this._photos = [];
			this._selectedAlbumIds = [];
			this._selectedPhotoIds = [];
			this._disabledPhotoIds = [];
			this.$albums = null;

			// override default settings with arguments
			this._settings = _utils2.default.merge({}, this.constructor._defaultSettings, settings);

			// translate HTML
			var HTML = this.constructor._HTML;
			for (var key in this._settings.i18n) {
				var find = '{' + key + '}',
				    re = new RegExp(find, 'g');
				HTML = HTML.replace(re, this._settings.i18n[key]);
			}

			// inject HTML in page
			var $holder = document.createElement('div');
			$holder.innerHTML = HTML;
			document.body.appendChild($holder.children[0]);

			// select DOM elements
			this.$container = document.querySelector(this._settings.containerSelector);
			this.$albumsContainer = this.$container.querySelector(this._settings.albumsContainerSelector);
			this.$photosContainer = this.$container.querySelector(this._settings.photosContainerSelector);
			this.$photosWrapper = this.$container.querySelector(this._settings.photosWrapperSelector);
			this.$selectedCount = this.$container.querySelector(this._settings.selectedPhotoCountSelector);
			this.$selectedCountMax = this.$container.querySelector(this._settings.selectedPhotoCountMaxSelector);
			this.$pageNumber = this.$container.querySelector(this._settings.pageNumberSelector);
			this.$pageNumberTotal = this.$container.querySelector(this._settings.pageNumberTotalSelector);
			this.$pagePrev = this.$container.querySelector(this._settings.pagePrevSelector);
			this.$pageNext = this.$container.querySelector(this._settings.pageNextSelector);
			this.$backToAlbums = this.$container.querySelector(this._settings.buttonBackToAlbumsSelector);
			this.$buttonClose = this.$container.querySelector(this._settings.buttonCloseSelector);
			this.$buttonOK = this.$container.querySelector(this._settings.buttonOKSelector);
			this.$buttonCancel = this.$container.querySelector(this._settings.buttonCancelSelector);
			this.$loader = this.$container.querySelector(this._settings.loader);
			this.$pagination = this.$container.querySelectorAll(this._settings.pagination);

			// events
			this._eventButtonClose = function (e) {
				e.preventDefault();
				_this.hideAlbumSelector();
			};
			this._eventButtonCancel = function (e) {
				e.preventDefault();
				_this.hideAlbumSelector();
			};
			this._eventButtonOK = function (e) {
				e.preventDefault();
				_this.hideAlbumSelector();
				if (typeof _this._settings.callbackSubmit === 'function') {
					_this._settings.callbackSubmit(_this._selectedPhotoIds);
				}
			};
			this._eventBackToAlbums = function (e) {
				e.preventDefault();
				_DOM2.default.show(_this.$pagination);
				_DOM2.default.hide(_this.$buttonOK);
				_this.hidePhotoSelector();
			};
			this._eventPagePrev = function (e) {
				e.preventDefault();
				var pageNumber = parseInt(_this.$pageNumber.textContent, 10) - 1;
				if (pageNumber < 1) {
					return;
				}
				_this._updateAlbumContainer(pageNumber);
				_this._updatePaginationButtons(pageNumber);
			};
			this._eventPageNext = function (e) {
				var pageNumber = parseInt(_this.$pageNumber.textContent, 10) + 1;
				e.preventDefault();
				if (_DOM2.default.hasClass(e.target, _this._settings.disabledClass)) {
					return;
				}
				_this._updateAlbumContainer(pageNumber);
				_this._updatePaginationButtons(pageNumber);
			};
			this._eventWindowEscape = function (e) {
				if (e.which === 27) {
					// The escape key has the same effect as the close button
					e.preventDefault();
					e.stopPropagation();
					_this.hideAlbumSelector();
				}
			};
		}

		/**
	  * Build the local Albums array from the Facebook response
	  * (If your website has already loaded the user's Facebook photos,
	  * pass them in here to avoid another API call)
	  * @param {object} input   the Facebook response
	  */

		_createClass(facebookPhotoSelector, [{
			key: 'setAlbums',
			value: function setAlbums(input) {
				if (!input || input.length === 0) {
					return;
				}
				input = Array.prototype.slice.call(input);
				input = input.sort(this._sortPhotos);

				//albums = []; do we need this here? :|
				/*for (var i = 0; i < input.length; i++) {
	   	//albums[albums.length] = input[i];
	   	this._albums.push(input[i]);
	   }*/
				this._albums = input;
			}

			/**
	   * Return the Albums array
	   * @return {array} the Albums array
	   */

		}, {
			key: 'getAlbums',
			value: function getAlbums() {
				return this._albums;
			}

			/**
	   * Build the local Photos array from the Facebook response
	   * @param {object} input   the Facebook response
	   */

		}, {
			key: 'setPhotos',
			value: function setPhotos(input) {
				if (!input || input.length === 0) {
					return;
				}
				input = Array.prototype.slice.call(input);
				this._photos = input;
			}

			/**
	   * Return the Photos array
	   * @return {array} the Photos array
	   */

		}, {
			key: 'getPhotos',
			value: function getPhotos() {
				return this._photos;
			}

			/**
	   * Get an album by its Facebook id
	   * @param  {int} id    the album id
	   * @return {object}    the corresponding Album object
	   */

		}, {
			key: 'getAlbumById',
			value: function getAlbumById(id) {
				var i, len;
				id = id.toString();
				for (i = 0, len = this._albums.length; i < len; i += 1) {
					if (this._albums[i].id === id) {
						return this._albums[i];
					}
				}
				return null;
			}

			/**
	   * Get a photo by its Facebook id
	   * @param  {int} id    the photo id
	   * @return {object}    the corresponding Photo object
	   */

		}, {
			key: 'getPhotoById',
			value: function getPhotoById(id) {
				if (!id) return null;
				var i, len;
				id = id.toString();
				for (i = 0, len = this._photos.length; i < len; i += 1) {
					if (this._photos[i].id === id) {
						return this._photos[i];
					}
				}
				return null;
			}

			// NEWINSTANCE :|

			/**
	   * Show the photo selector UI
	   * (Call this from your frontend (eg. from the event listener))
	   * @param  {int|string}   id       the Facebook user id, or the string 'me'
	   * @param  {Function} callback
	   */

		}, {
			key: 'showAlbumSelector',
			value: function showAlbumSelector(id, callback) {
				var _this2 = this;

				var i, len;
				this._log('CSPhotoSelector - show Albums');

				id = id || 'me';

				if (!this.$albums) {
					return this._buildAlbumSelector(id, function () {
						_this2.showAlbumSelector(id, callback);
					});
				} else {
					this._bindEvents();
					// Update classnames to represent the selections for this instance
					_DOM2.default.removeClass(this.$albums, this._settings.albumSelectedClass);
					_DOM2.default.removeClass(this.$albums, this._settings.albumDisabledClass);
					_DOM2.default.removeClass(this.$albums, this._settings.photoFilteredClass);
					for (i = 0, len = this._albums.length; i < len; i += 1) {
						if (this._selectedAlbumIds.indexOf(this._albums[i].id) >= 0) {
							_DOM2.default.addClass(this.$albums[i], this._settings.albumSelectedClass);
						}
						if (this._disabledPhotoIds.indexOf(this._albums[i].id) >= 0) {
							_DOM2.default.addClass(this.$albums[i], this._settings.albumDisabledClass);
						}
					}
					// Update paging
					this._updateAlbumContainer(1);
					this._updatePaginationButtons(1);
					_DOM2.default.fadeIn(this.$container);
					if (typeof callback === 'function') {
						callback();
					}
				}
			}

			/**
	   * Show the album's photos
	   * @param  {Function} callback
	   * @param  {int|string}   id       the Facebook album id
	   */

		}, {
			key: 'showPhotoSelector',
			value: function showPhotoSelector(callback, albumId) {
				var _this3 = this;

				var i, len;
				this._log('CSPhotoSelector - show Photos');

				// show loader until we get a response
				_DOM2.default.show(this.$loader);

				if (!this.$photos || albumId) {
					return this._buildPhotoSelector(function () {
						_this3.showPhotoSelector(callback);
					}, albumId);
				} else {
					// Update classnames to represent the selections for this instance
					_DOM2.default.removeClass(this.$photos, this._settings.albumSelectedClass);
					_DOM2.default.removeClass(this.$photos, this._settings.albumDisabledClass);
					_DOM2.default.removeClass(this.$photos, this._settings.photoFilteredClass);
					for (i = 0, len = this._photos.length; i < len; i += 1) {
						if (this._selectedPhotoIds.indexOf(this._photos[i].id) >= 0) {
							_DOM2.default.addClass(this.$photos[i], this._settings.albumSelectedClass);
						}
						if (this._disabledPhotoIds.indexOf(this._photos[i].id) >= 0) {
							_DOM2.default.addClass(this.$photos[i], this._settings.albumDisabledClass);
						}
					}
					// Update paging
					this.$selectedCount.textContent = this._selectedPhotoIds.length;
					this.$selectedCountMax.textContent = this._settings.maxSelection;
					this._updatePhotosContainer(1);
					// _updatePaginationButtons(1);
					//DOM.fadeIn(this.$container);
					if (typeof callback === 'function') {
						callback();
					}
				}
			}

			/**
	   * Hide the album's photos
	   * @return {void}
	   */

		}, {
			key: 'hidePhotoSelector',
			value: function hidePhotoSelector() {
				_DOM2.default.slideOutRight(this.$photosWrapper);
			}

			/**
	   * Hide the photo selector UI
	   * @return {void}
	   */

		}, {
			key: 'hideAlbumSelector',
			value: function hideAlbumSelector() {
				this._unbindEvents();
				_DOM2.default.fadeOut(this.$container);
			}

			/**
	   * Getter for this._selectedAlbumIds
	   * @return {Array} this._selectedAlbumIds
	   */

		}, {
			key: 'getselectedAlbumIds',
			value: function getselectedAlbumIds() {
				return this._selectedAlbumIds;
			}

			/**
	   * Getter for this._selectedPhotoIds
	   * @return {Array} this._selectedPhotoIds
	   */

		}, {
			key: 'getselectedPhotoIds',
			value: function getselectedPhotoIds() {
				return this._selectedPhotoIds;
			}

			/**
	   * Set disabled photos
	   * (Disabled photos are greyed out in the interface and are not selectable.)
	   * @param {Array} input An array of ids
	   */

		}, {
			key: 'setDisabledPhotoIds',
			value: function setDisabledPhotoIds(input) {
				this._disabledPhotoIds = input;
			}

			/**
	   * Remove selections, clear disabled list, go to page 1, etc
	   * @return {void}
	   */

		}, {
			key: 'reset',
			value: function reset() {
				if (!this._albums || this._albums.length === 0) {
					return;
				}
				// hide the photo container
				_DOM2.default.slideOutRight(this.$photosWrapper);
				_DOM2.default.hide(this.$buttonOK);
				this.$albumsContainer.innerHTML = '';
				this.$photosContainer.innerHTML = '';
				this._selectedAlbumIds = [];
				this._selectedPhotoIds = [];
				this.$albums = null;
				this.$selectedCount.textContent = '0';
				this._disabledPhotoIds = [];
				this._updatePaginationButtons(1);
			}

			/**
	   * Bind events to our UI controls
	   * @return {void}
	   */

		}, {
			key: '_bindEvents',
			value: function _bindEvents() {
				this.$buttonClose.addEventListener('click', this._eventButtonClose);
				this.$buttonCancel.addEventListener('click', this._eventButtonCancel);
				this.$buttonOK.addEventListener('click', this._eventButtonOK);
				this.$backToAlbums.addEventListener('click', this._eventBackToAlbums);
				this.$pagePrev.addEventListener('click', this._eventPagePrev);
				this.$pageNext.addEventListener('click', this._eventPageNext);
				window.addEventListener('keydown', this._eventWindowEscape);
			}

			/**
	   * Remove event listeners from our UI controls
	   * @return {void}
	   */

		}, {
			key: '_unbindEvents',
			value: function _unbindEvents() {
				this.$buttonClose.removeEventListener('click', this._eventButtonClose);
				this.$buttonCancel.removeEventListener('click', this._eventButtonCancel);
				this.$buttonOK.removeEventListener('click', this._eventButtonOK);
				this.$backToAlbums.removeEventListener('click', this._eventBackToAlbums);
				/*[].forEach.call(this.$albumsContainer.children, ($child) => {
	   	$child.removeEventListener('click', this.);
	   });
	   [].forEach.call(this.$photosContainer.children, ($child) => {
	   	$child.removeEventListener('click', this._eventPageNext);
	   });*/
				this.$pagePrev.removeEventListener('click', this._eventPagePrev);
				this.$pageNext.removeEventListener('click', this._eventPageNext);
				window.removeEventListener('keydown', this._eventWindowEscape);
			}

			/**
	   * Set the contents of the albums container
	   * @param  {int} pageNumber the page number we want to show
	   * @return {void}
	   */

		}, {
			key: '_updateAlbumContainer',
			value: function _updateAlbumContainer(pageNumber) {
				var _this4 = this;

				var firstIndex, lastIndex;
				firstIndex = (pageNumber - 1) * this._settings.albumsPerPage;
				lastIndex = pageNumber * this._settings.albumsPerPage;

				/*var filtered = [].filter.call(this.$albums, ($element) => {
	   	return !DOM.hasClass($element, this._settings.photoFilteredClass);
	   });
	   filtered = filtered.slice(firstIndex, lastIndex);*/

				this.$albumsContainer.innerHTML = '';

				for (var i = firstIndex; i < lastIndex; i) {
					if (!this.$albums[i]) break;
					if (!_DOM2.default.hasClass(this.$albums[i], this._settings.photoFilteredClass)) {
						this.$albumsContainer.appendChild(this.$albums[i]);
						i++;
					}
				}

				/*for (var i = 0; i < filtered.length; i++) {
	   	this.$albumsContainer.innerHTML += filtered[i].outerHTML;
	   }
	   this.$albums = this.$albumsContainer.children;*/
				[].forEach.call(this.$albumsContainer.children, function ($album) {
					$album.addEventListener('click', function (e) {
						e.preventDefault();
						_this4._selectAlbum($album);
					});
				});
			}

			/**
	   * Set the contents of the photos container
	   * @param  {int} pageNumber the page number we want to show
	   * @return {void}
	   */

		}, {
			key: '_updatePhotosContainer',
			value: function _updatePhotosContainer(pageNumber) {
				var _this5 = this;

				var firstIndex, lastIndex;
				firstIndex = (pageNumber - 1) * this._settings.photosPerPage;
				lastIndex = pageNumber * this._settings.photosPerPage;

				/*var filtered = [].filter.call(this.$photos, ($element) => {
	   	return !DOM.hasClass($element, this._settings.photoFilteredClass);
	   });
	   filtered = filtered.slice(firstIndex, lastIndex);*/

				this.$photosContainer.innerHTML = '';

				for (var i = firstIndex; i < lastIndex; i) {
					if (!this.$photos[i]) break;
					if (!_DOM2.default.hasClass(this.$photos[i], this._settings.photoFilteredClass)) {
						this.$photosContainer.appendChild(this.$photos[i]);
						i++;
					}
				}

				[].forEach.call(this.$photosContainer.children, function ($photo) {
					$photo.addEventListener('click', function (e) {
						e.preventDefault();
						_this5._selectPhotos($photo);
					});
				});
			}

			/**
	   * Update the contents of the pagination buttons
	   * @param  {int} pageNumber the page number we want to show
	   * @return {void}
	   */

		}, {
			key: '_updatePaginationButtons',
			value: function _updatePaginationButtons(pageNumber) {
				var numPages = Math.ceil(this._albums.length / this._settings.albumsPerPage);
				this.$pageNumber.textContent = pageNumber;
				this.$pageNumberTotal.textContent = numPages;
				if (pageNumber === 1 || numPages === 1) {
					_DOM2.default.addClass(this.$pagePrev, this._settings.disabledClass);
				} else {
					_DOM2.default.removeClass(this.$pagePrev, this._settings.disabledClass);
				}
				if (pageNumber === numPages || numPages === 1) {
					_DOM2.default.addClass(this.$pageNext, this._settings.disabledClass);
				} else {
					_DOM2.default.removeClass(this.$pageNext, this._settings.disabledClass);
				}
			}

			/**
	   * Select album and show its photos
	   * @param  {Element} $album
	   * @return {void}
	   */

		}, {
			key: '_selectAlbum',
			value: function _selectAlbum($album) {
				var albumId, i, len, removedId;
				albumId = $album.getAttribute('data-id');

				// If the album is disabled, ignore this
				if (_DOM2.default.hasClass($album, this._settings.albumDisabledClass)) {
					return;
				}

				if (!_DOM2.default.hasClass($album, this._settings.albumSelectedClass)) {
					// If autoDeselection is enabled and they have already selected the max number of albums, deselect the first album
					if (this._settings.autoDeselection && this._selectedAlbumIds.length === this._settings.maxSelection) {
						removedId = this._selectedAlbumIds.splice(0, 1);
						_DOM2.default.removeClass(this.$getAlbumById(removedId), this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedAlbumIds.length;
					}
					if (this._selectedAlbumIds.length < this._settings.maxSelection) {
						// Add album to this._selectedAlbumIds
						if (this._selectedAlbumIds.indexOf(albumId) < 0) {
							this._selectedAlbumIds.push(albumId);
							_DOM2.default.addClass($album, this._settings.albumSelectedClass);
							this.$selectedCount.textContent = this._selectedAlbumIds.length;
							this._log('CSPhotoSelector - newInstance - _selectAlbum - selected IDs: ', this._selectedAlbumIds);
							if (typeof this._settings.callbackAlbumSelected === "function") {
								this._settings.callbackAlbumSelected(albumId);
							}
						} else {
							this._log('CSPhotoSelector - newInstance - _selectAlbum - ID already stored');
						}
					}
				} else {
					// Remove album from this._selectedAlbumIds
					for (i = 0, len = this._selectedAlbumIds.length; i < len; i += 1) {
						if (this._selectedAlbumIds[i] === albumId) {
							this._selectedAlbumIds.splice(i, 1);
							_DOM2.default.removeClass($album, this._settings.albumSelectedClass);
							this.$selectedCount.textContent = this._selectedAlbumIds.length;
							if (typeof this._settings.callbackAlbumUnselected === "function") {
								this._settings.callbackAlbumUnselected(albumId);
							}
							return false;
						}
					}
				}

				if (this._selectedAlbumIds.length === this._settings.maxSelection) {
					if (typeof this._settings.callbackMaxSelection === "function") {
						this._settings.callbackMaxSelection();
					}
				}
			}

			/**
	   * Select photo and add its id to the list
	   * @param  {Element} $photo
	   * @return {void}
	   */

		}, {
			key: '_selectPhotos',
			value: function _selectPhotos($photo) {
				var photoId, i, len, removedId;
				photoId = $photo.getAttribute('data-id');

				// If the photo is disabled, ignore this
				if (_DOM2.default.hasClass($photo, this._settings.albumDisabledClass)) {
					return;
				}

				if (!_DOM2.default.hasClass($photo, this._settings.albumSelectedClass)) {
					// If autoDeselection is enabled and they have already selected the max number of photos, deselect the first photo
					if (this._settings.autoDeselection && this._selectedPhotoIds.length === this._settings.maxSelection) {
						removedId = this._selectedPhotoIds.splice(0, 1);
						_DOM2.default.removeClass(this.$getPhotoById(removedId), this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedPhotoIds.length;
					}
					if (this._selectedPhotoIds.length < this._settings.maxSelection) {
						// Add photo to this._selectedPhotoIds
						if (this._selectedPhotoIds.indexOf(photoId) < 0) {
							this._selectedPhotoIds.push(photoId);
							_DOM2.default.addClass($photo, this._settings.albumSelectedClass);
							this.$selectedCount.textContent = this._selectedPhotoIds.length;
							this._log('CSPhotoSelector - newInstance - selectPhoto - selected IDs: ', this._selectedPhotoIds);
							if (typeof this._settings.callbackPhotoSelected === "function") {
								this._settings.callbackPhotoSelected(photoId);
							}
						} else {
							this._log('CSPhotoSelector - newInstance - selectPhoto - ID already stored');
						}
					}
				} else {
					// Remove photo from this._selectedPhotoIds
					for (i = 0, len = this._selectedPhotoIds.length; i < len; i += 1) {
						if (this._selectedPhotoIds[i] === photoId) {
							this._selectedPhotoIds.splice(i, 1);
							_DOM2.default.removeClass($photo, this._settings.albumSelectedClass);
							this.$selectedCount.textContent = this._selectedPhotoIds.length;
							if (typeof this._settings.callbackPhotoUnselected === "function") {
								this._settings.callbackPhotoUnselected(photoId);
							}
							return false;
						}
					}
				}

				if (this._selectedPhotoIds.length) {
					_DOM2.default.show(this.$buttonOK);
				} else {
					_DOM2.default.hide(this.$buttonOK);
				}

				if (this._selectedPhotoIds.length === this._settings.maxSelection) {
					if (typeof this._settings.callbackMaxSelection === "function") {
						this._settings.callbackMaxSelection();
					}
				}

				// this._log(this._selectedPhotoIds);
			}

			// END NEWINSTANCE :|

			/**
	   * Get an album by its Facebook id
	   * @param  {int} id    the album id
	   * @return {Element}   the HTML element of the corresponding Album
	   */

		}, {
			key: '$getAlbumById',
			value: function $getAlbumById(id) {
				var i, len;
				id = id.toString();
				for (i = 0, len = this._albums.length; i < len; i += 1) {
					if (this._albums[i].id === id) {
						return this.$albums[i];
					}
				}
				return null;
			}

			/**
	   * Get a photo by its Facebook id
	   * @param  {int} id    the photo id
	   * @return {Element}    the HTML element of the corresponding Photo
	   */

		}, {
			key: '$getPhotoById',
			value: function $getPhotoById(id) {
				var i, len;
				id = id.toString();
				for (i = 0, len = this._photos.length; i < len; i += 1) {
					if (this._photos[i].id === id) {
						return this.$photos[i];
					}
				}
				return null;
			}

			/**
	   * Load the Facebook albums and build the markup
	   * @param  {int}   id           the Facebook user id
	   * @param  {Function} callback
	   */

		}, {
			key: '_buildAlbumSelector',
			value: function _buildAlbumSelector(id, callback) {
				var _this6 = this;

				var buildMarkup, buildAlbumMarkup;
				this._log("buildAlbumSelector");
				_DOM2.default.show(this.$pagination);

				if (!FB) {
					this._log('The Facebook SDK must be initialised before showing the photo selector');
					return false;
				}

				// Check that the user is logged in to Facebook
				FB.getLoginStatus(function (response) {
					if (response.status === 'connected') {
						var accessToken = response.authResponse.accessToken;
						// Load Facebook photos
						FB.api('/' + id + '/albums', function (response) {
							if (response.data.length) {
								_this6.setAlbums(response.data);
								// Build the markup
								buildMarkup(accessToken);
								// Call the callback
								if (typeof callback === 'function') {
									callback();
								}
							} else {
								alert(_this6._settings.i18n.permission_error);
								_this6._log('CSPhotoSelector - buildAlbumSelector - No albums returned');
								return false;
							}
						});
					} else {
						_this6._log('CSPhotoSelector - buildAlbumSelector - User is not logged in to Facebook');
						return false;
					}
				});

				// Build the markup of the album selector
				buildMarkup = function (accessToken) {
					// loop through photo albums
					var i,
					    len,
					    html = [];
					//$div = document.createElement('div');
					for (i = 0, len = _this6._albums.length; i < len; i += 1) {
						var elementMarkup = buildAlbumMarkup(_this6._albums[i], accessToken),
						    $element = document.createElement('div');
						$element.innerHTML = elementMarkup;
						html.push($element.children[0]);
						//$div.innerHTML += elementMarkup;
					}
					_this6.$albums = html;
				};

				// Return the markup for a single album
				buildAlbumMarkup = function (album, accessToken) {
					return '<a href="#" class="PhotoSelector_album" data-id="' + album.id + '">' + '<div class="PhotoSelector_albumWrap"><div>' + '<img src="https://graph.facebook.com/' + album.id + '/picture?type=album&access_token=' + accessToken + '" alt="' + _this6._htmlEntities(album.name) + '" class="PhotoSelector_photoAvatar" />' + '</div></div>' + '<div class="PhotoSelector_photoName">' + _this6._htmlEntities(album.name) + '</div>' + '</a>';
				};
			}

			/**
	   * Load the Facebook photos and build the markup
	   * @param  {Function} callback
	   * @param  {int}   albumId           the Facebook album id
	   */

		}, {
			key: '_buildPhotoSelector',
			value: function _buildPhotoSelector(callback, albumId) {
				var _this7 = this;

				var buildSecondMarkup, buildPhotoMarkup;
				this._log("buildPhotoSelector");

				FB.api('/' + albumId + '/photos?fields=id,picture,source,height,width,images&limit=500', function (response) {
					if (response.data) {
						_this7.setPhotos(response.data);
						// Build the markup
						buildSecondMarkup();
						// Call the callback
						if (typeof callback === 'function') {
							callback();
							// hide the loader and pagination
							_DOM2.default.hide(_this7.$loader);
							_DOM2.default.hide(_this7.$pagination);
							// set the photo container to active
							_DOM2.default.slideInRight(_this7.$photosWrapper);
						}
					} else {
						_this7._log('CSPhotoSelector - showPhotoSelector - No photos returned');
						return false;
					}
				});

				// Build the markup of the photo selector
				buildSecondMarkup = function () {
					//loop through photos
					var i,
					    len,
					    html = [];
					//    $div = document.createElement('div');

					// if photos is empty, we need to try again
					if (!_this7._photos.length) {
						_this7._buildPhotoSelector(null, albumId);
					}
					for (i = 0, len = _this7._photos.length; i < len; i += 1) {
						var elementMarkup = buildPhotoMarkup(_this7._photos[i]),
						    $element = document.createElement('div');
						$element.innerHTML = elementMarkup;
						html.push($element.children[0]);
						//$div.innerHTML += elementMarkup;
					}

					_this7.$photos = html;
				};

				buildPhotoMarkup = function (photo) {
					return '<a href="#" class="PhotoSelector_photo PhotoSelector_clearfix" data-id="' + photo.id + '">' + '<span><img src="' + photo.picture + '" alt="" class="PhotoSelector_photoAvatar" /></span>' + '</a>';
				};
			}

			/**
	   * Sort photos alphabetically by name (for Array.sort)
	   * @param  {object} photo1 the first photo
	   * @param  {object} photo2 the second photo
	   * @return {int}
	   */

		}, {
			key: '_sortPhotos',
			value: function _sortPhotos(photo1, photo2) {
				if (photo1.upperCaseName === photo2.upperCaseName) {
					return 0;
				}
				if (photo1.upperCaseName > photo2.upperCaseName) {
					return 1;
				}
				if (photo1.upperCaseName < photo2.upperCaseName) {
					return -1;
				}
			}

			/**
	   * Console.log wrapper (only logs if the debug setting is true)
	   * @return {void}
	   */

		}, {
			key: '_log',
			value: function _log() {
				if (this._settings.debug && window.console) {
					console.log(Array.prototype.slice.call(arguments));
				}
			}

			/**
	   * Replace HTML tags in a string with encoded entities
	   * @param  {string} str the HTML to be cleaned
	   * @return {string}     the cleaned string
	   */

		}, {
			key: '_htmlEntities',
			value: function _htmlEntities(str) {
				if (!str) return '';
				return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			}
		}]);

		return facebookPhotoSelector;
	})();

	facebookPhotoSelector._defaultSettings = {
		// generic
		debug: false,

		// originale "instance" settings
		maxSelection: 1,
		albumsPerPage: 6,
		photosPerPage: 500,
		autoDeselection: true, // Allow the user to keep on selecting once they reach maxSelection, and just deselect the first selected photo
		callbackAlbumSelected: null,
		callbackAlbumUnselected: null,
		callbackPhotoSelected: null,
		callbackPhotoUnselected: null,
		callbackMaxSelection: null,
		callbackSubmit: null,

		// original "global" settings
		disabledClass: 'PhotoSelector_disabled',
		albumSelectedClass: 'PhotoSelector_photoSelected',
		albumDisabledClass: 'PhotoSelector_photoDisabled',
		photoFilteredClass: 'PhotoSelector_photoFiltered',
		containerSelector: '#PhotoSelector',
		albumsContainerSelector: '.PhotoSelector_albumContainer',
		photosContainerSelector: '.PhotoSelector_photoContainer',
		photosWrapperSelector: '.PhotoSelector_wrapper',
		selectedPhotoCountSelector: '.PhotoSelector_selectedPhotoCount',
		selectedPhotoCountMaxSelector: '.PhotoSelector_selectedPhotoCountMax',
		pageNumberSelector: '#PhotoSelector_pageNumber',
		pageNumberTotalSelector: '#PhotoSelector_pageNumberTotal',
		pagePrevSelector: '#PhotoSelector_pagePrev',
		pageNextSelector: '#PhotoSelector_pageNext',
		buttonBackToAlbumsSelector: '#PhotoSelector_backToAlbums',
		buttonCloseSelector: '#PhotoSelector_buttonClose',
		buttonOKSelector: '#PhotoSelector_buttonOK',
		buttonCancelSelector: '#PhotoSelector_buttonCancel',
		loader: '#PhotoSelector_loader',
		pagination: '.PhotoSelector_pageNumberContainer, #PhotoSelector_pagePrev, #PhotoSelector_pageNext',

		// internationalization
		i18n: {
			choose: 'Choose from Photos',
			browse_albums: 'Browse your albums until you find a picture you want to use',
			select_an_album: 'Select an album',
			select_a_photo: 'Select a new photo',
			photos_selected: 'photo(s) selected',
			back_to_albums: 'Back to albums',
			previous: 'Previous',
			next: 'Next',
			page: 'Page',
			OK: 'OK',
			cancel: 'Cancel',
			permission_error: 'It looks like we don’t have permission to see the pictures. Please log out and log in again'
		}
	};

	facebookPhotoSelector._HTML = '\n<div id="PhotoSelector" hidden>\n  <div class="PhotoSelector_dialog">\n    <a href="#" id="PhotoSelector_buttonClose">&times;</a>\n    <div class="PhotoSelector_form">\n      <div class="PhotoSelector_header">\n        <p>{choose}</p>\n      </div>\n\n      <div class="PhotoSelector_content AlbumSelector_wrapper">\n        <p>{browse_albums}</p>\n        <div class="PhotoSelector_searchContainer PhotoSelector_clearfix">\n          <div class="PhotoSelector_selectedCountContainer">{select_an_album}</div>\n        </div>\n        <div class="PhotoSelector_photosContainer PhotoSelector_albumContainer"></div>\n      </div>\n\n      <div class="PhotoSelector_content PhotoSelector_wrapper" hidden>\n        <p>{select_a_photo}</p>\n        <div class="PhotoSelector_searchContainer PhotoSelector_clearfix">\n          <div class="PhotoSelector_selectedCountContainer"><span class="PhotoSelector_selectedPhotoCount">0</span> / <span class="PhotoSelector_selectedPhotoCountMax">0</span> {photos_selected}</div>\n          <a href="#" id="PhotoSelector_backToAlbums">{back_to_albums}</a>\n        </div>\n        <div class="PhotoSelector_photosContainer PhotoSelector_photoContainer"></div>\n      </div>\n\n      <div id="PhotoSelector_loader" hidden></div>\n\n\n      <div class="PhotoSelector_footer PhotoSelector_clearfix">\n        <a href="#" id="PhotoSelector_pagePrev" class="PhotoSelector_disabled" hidden>{previous}</a>\n        <a href="#" id="PhotoSelector_pageNext" hidden>{next}</a>\n        <div class="PhotoSelector_pageNumberContainer" hidden>\n          {page} <span id="PhotoSelector_pageNumber">1</span> / <span id="PhotoSelector_pageNumberTotal">1</span>\n        </div>\n        <a href="#" id="PhotoSelector_buttonOK">{OK}</a>\n        <a href="#" id="PhotoSelector_buttonCancel">{cancel}</a>\n      </div>\n    </div>\n  </div>\n</div>\n';

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function _elize(element) {
		return typeof element === 'string' ? document.querySelectorAll(element) : element;
	}

	function addClass(element, className) {
		if (!element) return;
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				addClass(element[i], className);
			}
			return;
		}

		if (hasClass(element, className)) return;

		if (element.classList) element.classList.add(className);else element.className += ' ' + className;
	}

	function removeClass(element, className) {
		if (!element) return;
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				removeClass(element[i], className);
			}
			return;
		}
		if (element.classList) element.classList.remove(className);else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}

	function hasClass(element, className) {
		if (!element) return;
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			var ret = true;
			for (var i = 0; i < element.length; ++i) {
				if (!hasClass(element[i], className)) ret = false;
			}
			return ret;
		}

		if (element.classList) return element.classList.contains(className);else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
	}

	function toggleClass(element, className, value) {
		if (!element) return;
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				toggleClass(element[i], className, value);
			}
			return;
		}

		if (value) addClass(element, className);else removeClass(element, className);
	}

	function css(element, rule) {
		if (!element) return;
		element = _elize(element);
		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			element = element[0];
		}
		return getComputedStyle(element).getPropertyValue(rule);
	}

	// ANIMATIONS
	var _ie = /MSIE ([0-9]+)/g.exec(window.navigator.userAgent) ? /MSIE ([0-9]+)/g.exec(window.navigator.userAgent)[1] : undefined;

	function show(element) {
		if (!element) return;
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
		if (!element) return;
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
		if (!element) return;

		if (_ie && _ie < 10) {
			element.removeAttribute('hidden');
			return;
		}

		_setUpAnimationStylesheet();
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				fadeIn(element[i]);
			}
			return;
		}

		element.removeAttribute('hidden');
		var onEnd = function onEnd(e) {
			removeClass(e.target, 'PSanimated');
			removeClass(e.target, 'PSfadeIn');
			_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
		};
		_prefixedEvent(element, 'AnimationEnd', onEnd);
		addClass(element, 'PSanimated');
		addClass(element, 'PSfadeIn');
	}

	function fadeOut(element) {
		if (!element) return;

		if (_ie && _ie < 10) {
			element.addAttribute('hidden');
			return;
		}

		_setUpAnimationStylesheet();
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				fadeOut(element[i]);
			}
			return;
		}

		var onEnd = function onEnd(e) {
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
		if (!element) return;

		if (_ie && _ie < 10) {
			element.removeAttribute('hidden');
			return;
		}

		_setUpAnimationStylesheet();
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				slideInRight(element[i]);
			}
			return;
		}

		element.removeAttribute('hidden');
		var onEnd = function onEnd(e) {
			removeClass(e.target, 'PSanimated');
			removeClass(e.target, 'PSslideInRight');
			_prefixedRemoveEvent(element, 'AnimationEnd', onEnd);
		};
		_prefixedEvent(element, 'AnimationEnd', onEnd);
		addClass(element, 'PSanimated');
		addClass(element, 'PSslideInRight');
	}

	function slideOutRight(element) {
		if (!element) return;

		if (_ie && _ie < 10) {
			element.addAttribute('hidden');
			return;
		}

		_setUpAnimationStylesheet();
		element = _elize(element);

		if (element instanceof NodeList || element instanceof HTMLCollection || Array.isArray(element)) {
			for (var i = 0; i < element.length; ++i) {
				slideOutRight(element[i]);
			}
			return;
		}

		var onEnd = function onEnd(e) {
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

		_addRuleToStyle(_animationStylesheet, '.PSanimated', '\n\t\tanimation-duration: 0.35s; -webkit-animation-duration: 0.35s;\n\t\tanimation-fill-mode: both; -webkit-animation-fill-mode: both;\n\t\tanimation-timing-function: ease-in-out; -webkit-animation-timing-function: ease-in-out;\n\t');

		var animations = {
			fadeIn: '\n\t\t\t0% { opacity: 0; }\n\t\t\t70% { opacity: 1; }\n\t\t\t100% { opacity: 1; }\n\t\t',
			fadeOut: '\n\t\t\t0% { opacity: 1; }\n\t\t\t70% { opacity: 0; }\n\t\t\t100% { opacity: 0; }\n\t\t',
			slideInRight: '\n\t\t\tfrom {\n\t\t\t\ttransform: translate3d(100%, 0, 0); -webkit-transform: translate3d(100%, 0, 0);\n\t\t\t\tvisibility: visible;\n\t\t\t}\n\t\t\tto { transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); }\n\t\t',
			slideOutRight: '\n\t\t\tfrom { transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); }\n\t\t\tto {\n\t\t\t\tvisibility: hidden;\n\t\t\t\ttransform: translate3d(100%, 0, 0); -webkit-transform: translate3d(100%, 0, 0);\n\t\t\t}\n\t\t'
		};

		for (var key in animations) {

			_addRuleToStyle(_animationStylesheet, '@-webkit-keyframes PS' + key, animations[key]);
			_addRuleToStyle(_animationStylesheet, '@keyframes PS' + key, animations[key]);

			_addRuleToStyle(_animationStylesheet, '.PS' + key, '\n\t\t\tanimation-name: PS' + key + '; -webkit-animation-name: PS' + key + ';\n\t\t');
		}
	}

	var _prefixes = ['webkit', 'moz', 'MS', 'o', ''];
	function _prefixedEvent(element, type, callback) {
		element = _elize(element);
		for (var p = 0; p < _prefixes.length; p++) {
			if (!_prefixes[p]) type = type.toLowerCase();
			element.addEventListener(_prefixes[p] + type, callback, false);
		}
	}
	function _prefixedRemoveEvent(element, type, callback) {
		element = _elize(element);
		for (var p = 0; p < _prefixes.length; p++) {
			if (!_prefixes[p]) type = type.toLowerCase();
			element.removeEventListener(_prefixes[p] + type, callback);
		}
	}

	exports.default = {
		addClass: addClass,
		removeClass: removeClass,
		hasClass: hasClass,
		toggleClass: toggleClass,
		css: css,
		show: show,
		hide: hide,
		fadeIn: fadeIn,
		fadeOut: fadeOut,
		slideInRight: slideInRight,
		slideOutRight: slideOutRight
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function merge(out) {
	    out = out || {};

	    for (var i = 1; i < arguments.length; i++) {
	        var obj = arguments[i];

	        if (!obj) continue;

	        for (var key in obj) {
	            if (obj.hasOwnProperty(key)) {
	                if (_typeof(obj[key]) === 'object') out[key] = merge(out[key], obj[key]);else out[key] = obj[key];
	            }
	        }
	    }

	    return out;
	}

	exports.default = {
	    merge: merge
	};

/***/ }
/******/ ])
});
;