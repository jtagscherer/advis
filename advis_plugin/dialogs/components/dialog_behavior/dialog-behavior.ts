'use strict';

const DialogBehavior = {
	listeners: {
    'closeButtonClickedEvent': '_handleCloseEvent'
  },
	
	setContent(content) {
		// Empty by default, should be implemented in specific dialogs
	},
	
	open(content) {
		if (content != null) {
			this.setContent(content);
			this._setupAnimations(content.animationTarget);
		}
		
		this.$$('paper-dialog').open();
	},
	close() {
		this.$$('paper-dialog').close();
	},
	
	_setupAnimations(target) {
		// Set up nice opening and closing animations
		const paperDialog = this.$$('paper-dialog');
		
		// By default, simply scale up the dialog from its center
		var from = {
			transform: 'scale(0, 0)',
			opacity: 0
		};
		var to = {
			transform: 'scale(1, 1)',
			opacity: 1
		};
		
		// If an animation target has been provided, scale the dialog relative to 
		// the target in opening and closing animations.
		if (target != null) {
			// Calculate relative dialog translations
			const translateX = (target.left + (target.width / 2))
				- (window.innerWidth / 2);
			const translateY = (target.top + (target.height / 2))
				- (window.innerHeight / 2);
			
			// Fade and translate at the same time
			var from = {
				transform: `translate(${translateX}px, ${translateY}px) scale(0, 0)`,
				opacity: 0
			};
			var to = {
				transform: 'translate(0, 0) scale(1, 1)',
				opacity: 1
			};
		}
		
		// Assign the animations to the dialog
		paperDialog.animationConfig = {
			entry: {
				name: 'reveal-animation',
				node: paperDialog,
				from: from,
				to: to
			},
			exit: {
				name: 'reveal-animation',
				node: paperDialog,
				from: to,
				to: from
			}
		};
	},
	
	_handleCloseEvent(e) {
		if (e.detail.eventId === this.eventId) {
			this.close();
		}
	}
};
