import DOM from './DOM';
import utils from './utils';

export class facebookPhotoSelector {

	constructor(settings) {

		// variables
		this._albums = [];
		this._photos = [];
		this._selectedAlbumIds = [];
		this._selectedPhotoIds = [];
		this._disabledPhotoIds = [];
		this.$albums = null;

		// override default settings with arguments
		this._settings = utils.merge({}, this.constructor._defaultSettings, settings);

		// translate HTML
		var HTML = this.constructor._HTML;
		for (let key in this._settings.i18n) {
			let find = `\{${key}\}`,
			    re = new RegExp(find, 'g');
			HTML = HTML.replace(re, this._settings.i18n[key]);
		}

		// inject HTML in page
		var $holder = document.createElement('div');
		$holder.innerHTML = HTML;
		document.body.appendChild($holder.children[0]);

		// select DOM elements
		this.$container         = document.querySelector(this._settings.containerSelector);
		this.$albumsContainer   = this.$container.querySelector(this._settings.albumsContainerSelector);
		this.$photosContainer   = this.$container.querySelector(this._settings.photosContainerSelector);
		this.$photosWrapper     = this.$container.querySelector(this._settings.photosWrapperSelector);
		this.$selectedCount     = this.$container.querySelector(this._settings.selectedPhotoCountSelector);
		this.$selectedCountMax  = this.$container.querySelector(this._settings.selectedPhotoCountMaxSelector);
		this.$pageNumber        = this.$container.querySelector(this._settings.pageNumberSelector);
		this.$pageNumberTotal   = this.$container.querySelector(this._settings.pageNumberTotalSelector);
		this.$pagePrev          = this.$container.querySelector(this._settings.pagePrevSelector);
		this.$pageNext          = this.$container.querySelector(this._settings.pageNextSelector);
		this.$backToAlbums      = this.$container.querySelector(this._settings.buttonBackToAlbumsSelector);
		this.$buttonClose       = this.$container.querySelector(this._settings.buttonCloseSelector);
		this.$buttonOK          = this.$container.querySelector(this._settings.buttonOKSelector);
		this.$buttonCancel      = this.$container.querySelector(this._settings.buttonCancelSelector);
		this.$loader            = this.$container.querySelector(this._settings.loader);
		this.$pagination        = this.$container.querySelectorAll(this._settings.pagination);
	}

	/**
	 * Build the local Albums array from the Facebook response
	 * (If your website has already loaded the user's Facebook photos,
	 * pass them in here to avoid another API call)
	 * @param {object} input   the Facebook response
	 */
	setAlbums(input) {
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
	getAlbums() {
		return this._albums;
	}

	/**
	 * Build the local Photos array from the Facebook response
	 * @param {object} input   the Facebook response
	 */
	setPhotos(input) {
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
	getPhotos() {
		return this._photos;
	}

	/**
	 * Get an album by its Facebook id
	 * @param  {int} id    the album id
	 * @return {object}    the corresponding Album object
	 */
	getAlbumById(id) {
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
	getPhotoById(id) {
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
		showAlbumSelector(id, callback) {
			var i, len;
			this._log('CSPhotoSelector - show Albums');

			id = id || 'me';

			if (!this.$albums) {
				return this._buildAlbumSelector(id, () => {
					this.showAlbumSelector(id, callback);
				});
			} else {
				this._bindEvents();
				// Update classnames to represent the selections for this instance
				DOM.removeClass(this.$albums, this._settings.albumSelectedClass);
				DOM.removeClass(this.$albums, this._settings.albumDisabledClass);
				DOM.removeClass(this.$albums, this._settings.photoFilteredClass);
				for (i = 0, len = this._albums.length; i < len; i += 1) {
					if (this._selectedAlbumIds.indexOf(this._albums[i].id) >= 0) {
						DOM.addClass(this.$albums[i], this._settings.albumSelectedClass);
					}
					if (this._disabledPhotoIds.indexOf(this._albums[i].id) >= 0) {
						DOM.addClass(this.$albums[i], this._settings.albumDisabledClass);
					}
				}
				// Update paging
				this._updateAlbumContainer(1);
				this._updatePaginationButtons(1);
				DOM.fadeIn(this.$container);
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
		showPhotoSelector(callback, albumId) {
			var i, len;
			this._log('CSPhotoSelector - show Photos');

			// show loader until we get a response
			DOM.show(this.$loader);

			if ( ! this.$photos || albumId) {
				return this._buildPhotoSelector(() => {
					this.showPhotoSelector(callback);
				}, albumId);
			} else {
				// Update classnames to represent the selections for this instance
				DOM.removeClass(this.$photos, this._settings.albumSelectedClass);
				DOM.removeClass(this.$photos, this._settings.albumDisabledClass);
				DOM.removeClass(this.$photos, this._settings.photoFilteredClass);
				for (i = 0, len = this._photos.length; i < len; i += 1) {
					if (this._selectedPhotoIds.indexOf(this._photos[i].id) >= 0) {
						DOM.addClass(this.$photos[i], this._settings.albumSelectedClass);
					}
					if (this._disabledPhotoIds.indexOf(this._photos[i].id) >= 0) {
						DOM.addClass(this.$photos[i], this._settings.albumDisabledClass);
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
		hidePhotoSelector() {
			DOM.slideOutRight(this.$photosWrapper);
		}

		/**
		 * Hide the photo selector UI
		 * @return {void}
		 */
		hideAlbumSelector() {
			this._unbindEvents();
			DOM.fadeOut(this.$container);
		}

		/**
		 * Getter for this._selectedAlbumIds
		 * @return {Array} this._selectedAlbumIds
		 */
		getselectedAlbumIds() {
			return this._selectedAlbumIds;
		}

		/**
		 * Getter for this._selectedPhotoIds
		 * @return {Array} this._selectedPhotoIds
		 */
		getselectedPhotoIds() {
			return this._selectedPhotoIds;
		}

		/**
		 * Set disabled photos
		 * (Disabled photos are greyed out in the interface and are not selectable.)
		 * @param {Array} input An array of ids
		 */
		setDisabledPhotoIds(input) {
			this._disabledPhotoIds = input;
		}

		/**
		 * Remove selections, clear disabled list, go to page 1, etc
		 * @return {void}
		 */
		reset() {
			if (!this._albums || this._albums.length === 0) {
				return;
			}
			// hide the photo container
			DOM.slideOutRight(this.$photosWrapper);
			DOM.hide(this.$buttonOK);
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
		 * Listener for the ESC key
		 */
		_windowEscapeListener(e) {
			if (e.which === 27) {
				// The escape key has the same effect as the close button
				e.preventDefault();
				e.stopPropagation();
				this.hideAlbumSelector();
			}
		}

		/**
		 * Bind events to our UI controls
		 * @return {void}
		 */
		_bindEvents() {
			this.$buttonClose.addEventListener('click', (e) => {
				e.preventDefault();
				this.hideAlbumSelector();
			});
			this.$buttonCancel.addEventListener('click', (e) => {
				e.preventDefault();
				this.hideAlbumSelector();
			});

			this.$buttonOK.addEventListener('click', (e) => {
				e.preventDefault();
				this.hideAlbumSelector();
				if (typeof this._settings.callbackSubmit === 'function') { this._settings.callbackSubmit(this._selectedPhotoIds); }
			});

			this.$backToAlbums.addEventListener('click', (e) => {
				e.preventDefault();
				DOM.show(this.$pagination);
				DOM.hide(this.$buttonOK);
				this.hidePhotoSelector();
			});

			this.$pagePrev.addEventListener('click', (e) => {
				var pageNumber = parseInt(this.$pageNumber.textContent, 10) - 1;
				e.preventDefault();
				if (pageNumber < 1) { return; }
				this._updateAlbumContainer(pageNumber);
				this._updatePaginationButtons(pageNumber);
			});

			this.$pageNext.addEventListener('click', (e) => {
				var pageNumber = parseInt(this.$pageNumber.textContent, 10) + 1;
				e.preventDefault();
				if (DOM.hasClass(e.target, this._settings.disabledClass)) { return; }
				this._updateAlbumContainer(pageNumber);
				this._updatePaginationButtons(pageNumber);
			});

			window.addEventListener('keydown', this._windowEscapeListener.bind(this));
		}

		/**
		 * Remove event listeners from our UI controls
		 * @return {void}
		 */
		_unbindEvents() {
			this.$buttonClose.removeEventListener('click');
			this.$buttonOK.removeEventListener('click');
			this.$buttonCancel.removeEventListener('click');
			[].forEach.call(this.$albumsContainer.children, ($child) => {
				$child.removeEventListener('click');
			});
			[].forEach.call(this.$photosContainer.children, ($child) => {
				$child.removeEventListener('click');
			});
			this.$pagePrev.removeEventListener('click');
			this.$pageNext.removeEventListener('click');
			window.removeEventListener('keydown', this._windowEscapeListener);
		}

		/**
		 * Set the contents of the albums container
		 * @param  {int} pageNumber the page number we want to show
		 * @return {void}
		 */
		_updateAlbumContainer(pageNumber) {
			var firstIndex, lastIndex;
			firstIndex = (pageNumber - 1) * this._settings.albumsPerPage;
			lastIndex = pageNumber * this._settings.albumsPerPage;

			/*var filtered = [].filter.call(this.$albums, ($element) => {
				return !DOM.hasClass($element, this._settings.photoFilteredClass);
			});
			filtered = filtered.slice(firstIndex, lastIndex);*/

			this.$albumsContainer.innerHTML = '';

			for (var i = firstIndex; i < lastIndex; i) {
				if ( ! this.$albums[i]) break;
				if ( ! DOM.hasClass(this.$albums[i], this._settings.photoFilteredClass)) {
					this.$albumsContainer.appendChild(this.$albums[i]);
					i++;
				}
			}

			/*for (var i = 0; i < filtered.length; i++) {
				this.$albumsContainer.innerHTML += filtered[i].outerHTML;
			}
			this.$albums = this.$albumsContainer.children;*/
			[].forEach.call(this.$albumsContainer.children, ($album) => {
				$album.addEventListener('click', (e) => {
					e.preventDefault();
					this._selectAlbum($album);
				});
			});
		}

		/**
		 * Set the contents of the photos container
		 * @param  {int} pageNumber the page number we want to show
		 * @return {void}
		 */
		_updatePhotosContainer(pageNumber) {
			var firstIndex, lastIndex;
			firstIndex = (pageNumber - 1) * this._settings.photosPerPage;
			lastIndex = pageNumber * this._settings.photosPerPage;

			/*var filtered = [].filter.call(this.$photos, ($element) => {
				return !DOM.hasClass($element, this._settings.photoFilteredClass);
			});
			filtered = filtered.slice(firstIndex, lastIndex);*/

			this.$photosContainer.innerHTML = '';

			for (var i = firstIndex; i < lastIndex; i) {
				if ( ! this.$photos[i]) break;
				if ( ! DOM.hasClass(this.$photos[i], this._settings.photoFilteredClass)) {
					this.$photosContainer.appendChild(this.$photos[i]);
					i++;
				}
			}

			[].forEach.call(this.$photosContainer.children, ($photo) => {
				$photo.addEventListener('click', (e) => {
					e.preventDefault();
					this._selectPhotos($photo);
				});
			});
		}

		/**
		 * Update the contents of the pagination buttons
		 * @param  {int} pageNumber the page number we want to show
		 * @return {void}
		 */
		_updatePaginationButtons(pageNumber) {
			var numPages = Math.ceil((this._albums.length) / this._settings.albumsPerPage);
			this.$pageNumber.textContent = pageNumber;
			this.$pageNumberTotal.textContent = numPages;
			if (pageNumber === 1 || numPages === 1) {
				DOM.addClass(this.$pagePrev, this._settings.disabledClass);
			} else {
				DOM.removeClass(this.$pagePrev, this._settings.disabledClass);
			}
			if (pageNumber === numPages || numPages === 1) {
				DOM.addClass(this.$pageNext, this._settings.disabledClass);
			} else {
				DOM.removeClass(this.$pageNext, this._settings.disabledClass);
			}
		}

		/**
		 * Select album and show its photos
		 * @param  {Element} $album
		 * @return {void}
		 */
		_selectAlbum($album) {
			var albumId, i, len, removedId;
			albumId = $album.getAttribute('data-id');

			// If the album is disabled, ignore this
			if (DOM.hasClass($album, this._settings.albumDisabledClass)) {
				return;
			}

			if ( ! DOM.hasClass($album, this._settings.albumSelectedClass)) {
				// If autoDeselection is enabled and they have already selected the max number of albums, deselect the first album
				if (this._settings.autoDeselection && this._selectedAlbumIds.length === this._settings.maxSelection) {
					removedId = this._selectedAlbumIds.splice(0, 1);
					DOM.removeClass(this.$getAlbumById(removedId), this._settings.albumSelectedClass);
					this.$selectedCount.textContent = this._selectedAlbumIds.length;
				}
				if (this._selectedAlbumIds.length < this._settings.maxSelection) {
					// Add album to this._selectedAlbumIds
					if (this._selectedAlbumIds.indexOf(albumId) < 0) {
						this._selectedAlbumIds.push(albumId);
						DOM.addClass($album, this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedAlbumIds.length;
						this._log('CSPhotoSelector - newInstance - _selectAlbum - selected IDs: ', this._selectedAlbumIds);
						if (typeof this._settings.callbackAlbumSelected === "function") { this._settings.callbackAlbumSelected(albumId); }
					} else {
						this._log('CSPhotoSelector - newInstance - _selectAlbum - ID already stored');
					}
				}

			} else {
				// Remove album from this._selectedAlbumIds
				for (i = 0, len = this._selectedAlbumIds.length; i < len; i += 1) {
					if (this._selectedAlbumIds[i] === albumId) {
						this._selectedAlbumIds.splice(i, 1);
						DOM.removeClass($album, this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedAlbumIds.length;
						if (typeof this._settings.callbackAlbumUnselected === "function") { this._settings.callbackAlbumUnselected(albumId); }
						return false;
					}
				}
			}

			if (this._selectedAlbumIds.length === this._settings.maxSelection) {
				if (typeof this._settings.callbackMaxSelection === "function") { this._settings.callbackMaxSelection(); }
			}
		}

		/**
		 * Select photo and add its id to the list
		 * @param  {Element} $photo
		 * @return {void}
		 */
		_selectPhotos($photo) {
			var photoId, i, len, removedId;
			photoId = $photo.getAttribute('data-id');

			// If the photo is disabled, ignore this
			if (DOM.hasClass($photo, this._settings.albumDisabledClass)) {
				return;
			}

			if ( ! DOM.hasClass($photo, this._settings.albumSelectedClass)) {
				// If autoDeselection is enabled and they have already selected the max number of photos, deselect the first photo
				if (this._settings.autoDeselection && this._selectedPhotoIds.length === this._settings.maxSelection) {
					removedId = this._selectedPhotoIds.splice(0, 1);
					DOM.removeClass(this.$getPhotoById(removedId), this._settings.albumSelectedClass);
					this.$selectedCount.textContent = this._selectedPhotoIds.length;
				}
				if (this._selectedPhotoIds.length < this._settings.maxSelection) {
					// Add photo to this._selectedPhotoIds
					if (this._selectedPhotoIds.indexOf(photoId) < 0) {
						this._selectedPhotoIds.push(photoId);
						DOM.addClass($photo, this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedPhotoIds.length;
						this._log('CSPhotoSelector - newInstance - selectPhoto - selected IDs: ', this._selectedPhotoIds);
						if (typeof this._settings.callbackPhotoSelected === "function") { this._settings.callbackPhotoSelected(photoId); }
					} else {
						this._log('CSPhotoSelector - newInstance - selectPhoto - ID already stored');
					}
				}

			} else {
				// Remove photo from this._selectedPhotoIds
				for (i = 0, len = this._selectedPhotoIds.length; i < len; i += 1) {
					if (this._selectedPhotoIds[i] === photoId) {
						this._selectedPhotoIds.splice(i, 1);
						DOM.removeClass($photo, this._settings.albumSelectedClass);
						this.$selectedCount.textContent = this._selectedPhotoIds.length;
						if (typeof this._settings.callbackPhotoUnselected === "function") { this._settings.callbackPhotoUnselected(photoId); }
						return false;
					}
				}
			}

			if (this._selectedPhotoIds.length) {
				DOM.show(this.$buttonOK);
			} else {
				DOM.hide(this.$buttonOK);
			}

			if (this._selectedPhotoIds.length === this._settings.maxSelection) {
				if (typeof this._settings.callbackMaxSelection === "function") { this._settings.callbackMaxSelection(); }
			}

			// this._log(this._selectedPhotoIds);
		}

	// END NEWINSTANCE :|

	/**
	 * Get an album by its Facebook id
	 * @param  {int} id    the album id
	 * @return {Element}   the HTML element of the corresponding Album
	 */
	$getAlbumById(id) {
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
	$getPhotoById(id) {
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
	_buildAlbumSelector(id, callback) {
		var buildMarkup, buildAlbumMarkup;
		this._log("buildAlbumSelector");
		DOM.show(this.$pagination);

		if (!FB) {
			this._log('The Facebook SDK must be initialised before showing the photo selector');
			return false;
		}

		// Check that the user is logged in to Facebook
		FB.getLoginStatus((response) => {
			if (response.status === 'connected') {
				var accessToken = response.authResponse.accessToken;
				// Load Facebook photos
				FB.api('/'+ id +'/albums', (response) => {
					if (response.data.length) {
						this.setAlbums(response.data);
						// Build the markup
						buildMarkup(accessToken);
						// Call the callback
						if (typeof callback === 'function') { callback(); }
					} else {
						alert(this._settings.i18n.permission_error);
						this._log('CSPhotoSelector - buildAlbumSelector - No albums returned');
						return false;
					}
				});
			} else {
				this._log('CSPhotoSelector - buildAlbumSelector - User is not logged in to Facebook');
				return false;
			}
		});

		// Build the markup of the album selector
		buildMarkup = (accessToken) => {
			// loop through photo albums
			var i, len, html = [];
			    //$div = document.createElement('div');
			for (i = 0, len = this._albums.length; i < len; i += 1) {
				let elementMarkup = buildAlbumMarkup(this._albums[i], accessToken),
				    $element = document.createElement('div');
				$element.innerHTML = elementMarkup;
				html.push($element.children[0]);
				//$div.innerHTML += elementMarkup;
			}
			this.$albums = html;
		};

		// Return the markup for a single album
		buildAlbumMarkup = (album, accessToken) => {
			return '<a href="#" class="PhotoSelector_album" data-id="' + album.id + '">' +
					'<div class="PhotoSelector_albumWrap"><div>' +
					'<img src="https://graph.facebook.com/'+ album.id +'/picture?type=album&access_token='+ accessToken +'" alt="' + this._htmlEntities(album.name) + '" class="PhotoSelector_photoAvatar" />' +
					'</div></div>' +
					'<div class="PhotoSelector_photoName">' + this._htmlEntities(album.name) + '</div>' +
					'</a>';
		};
	}

	/**
	 * Load the Facebook photos and build the markup
	 * @param  {Function} callback
	 * @param  {int}   albumId           the Facebook album id
	 */
	_buildPhotoSelector(callback, albumId) {
		var buildSecondMarkup, buildPhotoMarkup;
		this._log("buildPhotoSelector");

		FB.api('/'+ albumId +'/photos?fields=id,picture,source,height,width,images&limit=500', (response) => {
			if (response.data) {
				this.setPhotos(response.data);
				// Build the markup
				buildSecondMarkup();
				// Call the callback
				if (typeof callback === 'function') {
					callback();
					// hide the loader and pagination
					DOM.hide(this.$loader);
					DOM.hide(this.$pagination);
					// set the photo container to active
					DOM.slideInRight(this.$photosWrapper);
				}
			} else {
				this._log('CSPhotoSelector - showPhotoSelector - No photos returned');
				return false;
			}
		});

		// Build the markup of the photo selector
		buildSecondMarkup = () => {
			//loop through photos
			var i, len, html = [];
			//    $div = document.createElement('div');

			// if photos is empty, we need to try again
			if (!this._photos.length) {
				this._buildPhotoSelector(null, albumId);
			}
			for (i = 0, len = this._photos.length; i < len; i += 1) {
				let elementMarkup = buildPhotoMarkup(this._photos[i]),
				    $element = document.createElement('div');
				$element.innerHTML = elementMarkup;
				html.push($element.children[0]);
				//$div.innerHTML += elementMarkup;
			}

			this.$photos = html;
		};

		buildPhotoMarkup = function(photo) {
			return '<a href="#" class="PhotoSelector_photo PhotoSelector_clearfix" data-id="' + photo.id + '">' +
					'<span><img src="' + photo.picture + '" alt="" class="PhotoSelector_photoAvatar" /></span>' +
					'</a>';
		};
	}

	/**
	 * Sort photos alphabetically by name (for Array.sort)
	 * @param  {object} photo1 the first photo
	 * @param  {object} photo2 the second photo
	 * @return {int}
	 */
	_sortPhotos(photo1, photo2) {
		if (photo1.upperCaseName === photo2.upperCaseName) { return 0; }
		if (photo1.upperCaseName > photo2.upperCaseName) { return 1; }
		if (photo1.upperCaseName < photo2.upperCaseName) { return -1; }
	}

	/**
	 * Console.log wrapper (only logs if the debug setting is true)
	 * @return {void}
	 */
	_log() {
		if (this._settings.debug && window.console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	}

	/**
	 * Replace HTML tags in a string with encoded entities
	 * @param  {string} str the HTML to be cleaned
	 * @return {string}     the cleaned string
	 */
	_htmlEntities(str) {
		if (!str) return '';
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

}

facebookPhotoSelector._defaultSettings = {
	// generic
	debug							: false,

	// originale "instance" settings
	maxSelection			        : 1,
	albumsPerPage			        : 6,
	photosPerPage			        : 500,
	autoDeselection			        : true, // Allow the user to keep on selecting once they reach maxSelection, and just deselect the first selected photo
	callbackAlbumSelected	        : null,
	callbackAlbumUnselected	        : null,
	callbackPhotoSelected	        : null,
	callbackPhotoUnselected	        : null,
	callbackMaxSelection	        : null,
	callbackSubmit			        : null,

	// original "global" settings
	disabledClass					: 'PhotoSelector_disabled',
	albumSelectedClass				: 'PhotoSelector_photoSelected',
	albumDisabledClass				: 'PhotoSelector_photoDisabled',
	photoFilteredClass				: 'PhotoSelector_photoFiltered',
	containerSelector				: '#PhotoSelector',
	albumsContainerSelector			: '.PhotoSelector_albumContainer',
	photosContainerSelector			: '.PhotoSelector_photoContainer',
	photosWrapperSelector			: '.PhotoSelector_wrapper',
	selectedPhotoCountSelector		: '.PhotoSelector_selectedPhotoCount',
	selectedPhotoCountMaxSelector	: '.PhotoSelector_selectedPhotoCountMax',
	pageNumberSelector				: '#PhotoSelector_pageNumber',
	pageNumberTotalSelector			: '#PhotoSelector_pageNumberTotal',
	pagePrevSelector				: '#PhotoSelector_pagePrev',
	pageNextSelector				: '#PhotoSelector_pageNext',
	buttonBackToAlbumsSelector		: '#PhotoSelector_backToAlbums',
	buttonCloseSelector				: '#PhotoSelector_buttonClose',
	buttonOKSelector				: '#PhotoSelector_buttonOK',
	buttonCancelSelector			: '#PhotoSelector_buttonCancel',
	loader							: '#PhotoSelector_loader',
	pagination						: '.PhotoSelector_pageNumberContainer, #PhotoSelector_pagePrev, #PhotoSelector_pageNext',

	// internationalization
	i18n                            : {
		choose:           'Choose from Photos',
		browse_albums:    'Browse your albums until you find a picture you want to use',
		select_an_album:  'Select an album',
		select_a_photo:   'Select a new photo',
		photos_selected:  'photo(s) selected',
		back_to_albums:   'Back to albums',
		previous:         'Previous',
		next:             'Next',
		page:             'Page',
		OK:               'OK',
		cancel:           'Cancel',
		permission_error: 'It looks like we don’t have permission to see the pictures. Please log out and log in again'
	}
};

facebookPhotoSelector._HTML = `
<div id="PhotoSelector" hidden>
  <div class="PhotoSelector_dialog">
    <a href="#" id="PhotoSelector_buttonClose">&times;</a>
    <div class="PhotoSelector_form">
      <div class="PhotoSelector_header">
        <p>{choose}</p>
      </div>

      <div class="PhotoSelector_content AlbumSelector_wrapper">
        <p>{browse_albums}</p>
        <div class="PhotoSelector_searchContainer PhotoSelector_clearfix">
          <div class="PhotoSelector_selectedCountContainer">{select_an_album}</div>
        </div>
        <div class="PhotoSelector_photosContainer PhotoSelector_albumContainer"></div>
      </div>

      <div class="PhotoSelector_content PhotoSelector_wrapper" hidden>
        <p>{select_a_photo}</p>
        <div class="PhotoSelector_searchContainer PhotoSelector_clearfix">
          <div class="PhotoSelector_selectedCountContainer"><span class="PhotoSelector_selectedPhotoCount">0</span> / <span class="PhotoSelector_selectedPhotoCountMax">0</span> {photos_selected}</div>
          <a href="#" id="PhotoSelector_backToAlbums">{back_to_albums}</a>
        </div>
        <div class="PhotoSelector_photosContainer PhotoSelector_photoContainer"></div>
      </div>

      <div id="PhotoSelector_loader" hidden></div>


      <div class="PhotoSelector_footer PhotoSelector_clearfix">
        <a href="#" id="PhotoSelector_pagePrev" class="PhotoSelector_disabled" hidden>{previous}</a>
        <a href="#" id="PhotoSelector_pageNext" hidden>{next}</a>
        <div class="PhotoSelector_pageNumberContainer" hidden>
          {page} <span id="PhotoSelector_pageNumber">1</span> / <span id="PhotoSelector_pageNumberTotal">1</span>
        </div>
        <a href="#" id="PhotoSelector_buttonOK">{OK}</a>
        <a href="#" id="PhotoSelector_buttonCancel">{cancel}</a>
      </div>
    </div>
  </div>
</div>
`;
