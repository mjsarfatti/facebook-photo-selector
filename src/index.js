import DOM from './DOM';

class facebookPhotoSelector {

	$() {
		return DOM;
	}

	talk(message) {
		console.log(`Saying: ${message}`);
	}

	hc(element) {
		console.log(DOM.hasClass(element, 'class'));
	}
}

module.exports = {
	facebookPhotoSelector
};
