'use strict';

Polymer({
  is: 'distortion-update-confirmation-dialog',
	behaviors: [
		DialogBehavior
	],
	
  properties: {
		changedDistortions: Array,
		requestManager: Object,
		_status: {
			type: String,
			value: 'ready'
		},
		_progress: Object,
		eventId: {
			type: String,
			value: 'distortion-update-confirmation-dialog'
		}
  },
	
	applyWithoutCache: function() {
		this.set('_status', 'applying');
		
		const updateUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/distortions/update'), {
			distortions: JSON.stringify(this.changedDistortions)
		});
		
		const self = this;
		this.requestManager.request(updateUrl).then(result => {
			self._closeDialog();
		});
	},
	
	applyAndCache: function() {
		this.set('_status', 'applying');
		
		const updateUrl = tf_backend.addParams(tf_backend.getRouter()
			.pluginRoute('advis', '/distortions/update'), {
			distortions: JSON.stringify(this.changedDistortions)
		});
		
		const self = this;
		this.requestManager.request(updateUrl).then(result => {
			const cacheUrl = tf_backend.addParams(tf_backend.getRouter()
				.pluginRoute('advis', '/cache'), {
				modelAccuracy: String(advis.config.requests.imageAmounts.modelAccuracy),
				nodeActivation: String(advis.config.requests.imageAmounts
					.nodeActivation)
			});
			
			self.requestManager.request(cacheUrl).then(result => {
				self._closeDialog();
			});
			
			// Start updating the progress bar and status text periodically
			this.set('_status', 'caching');
			setTimeout(() => self._updateProgress(), 1000);
		});
	},
	
	setContent: function(content) {
		this.changedDistortions = content.changedDistortions;
		this.requestManager = content.requestManager;
		
		this.set('_status', '');
		this.set('_status', 'ready');
	},
	
	_updateProgress: function() {
		const progressUrl = tf_backend.getRouter()
			.pluginRoute('advis', '/cache/progress');
		
		const self = this;
		this.requestManager.request(progressUrl).then(result => {
			self.set('_progress', result);
			self.set('_status', '');
			self.set('_status', 'caching');
			
			if (result.progress.total > 0) {
				setTimeout(() => self._updateProgress(), 500);
			}
		});
	},
	
	_closeDialog: function() {
		this.close();
		this.fire('dialogReturnedEvent', {
			eventId: this.eventId
		});
	},
	
	_getContentText: function(status) {
		if (status == 'ready') {
			var distortionNames = [];
			for (const distortion in this.changedDistortions) {
				distortionNames.push(this.changedDistortions[distortion].displayName);
			}
			
			return `You have changed the following distortions: `
				+ `${distortionNames.join(', ')}. If you apply these changes, all `
				+ `cached data concerning these distortions will be invalidated and `
				+ `will need to be recomputed. You can also rebuild the cache `
				+ `immediately.`;
		} else if (status == 'applying') {
			return 'Applying all changes and invalidating caches…';
		} else if (status == 'caching') {
			if (this._progress != null) {
				return `${this._progress.progress.percentage}%: ` 
					+ `${this._progress.status}`;
			} else {
				return 'Rebuilding caches…';
			}
		} else {
			return '';
		}
	},
	
	_buttonsDisabled: function(status) {
		return status != 'ready';
	},
	
	_isIndeterminate: function(status) {
		return status == 'applying';
	}
});
