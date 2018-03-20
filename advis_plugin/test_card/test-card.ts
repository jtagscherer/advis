'use strict';

Polymer({
  is: 'test-card',
  properties: {
    run: String,
    tag: String,

    /** @type {Function} */
    _colorScaleFunction: {
      type: Object,  // function: string => string
      value: () => tf_color_scale.runsColorScale,
    },
    _runColor: {
      type: String,
      computed: '_computeRunColor(run)',
    },
    requestManager: Object,
    _canceller: {
      type: Object,
      value: () => new tf_backend.Canceller(),
    }
  },

  observers: ['_fetchNewData(run, tag)'],

  _computeRunColor(run) {
    return this._colorScaleFunction(run);
  },
  attached() {
    // Defer reloading until after we're attached, because that ensures that
    // the requestManager has been set from above. (Polymer is tricky
    // sometimes)
    this._attached = true;
    this.reload();
  },
  reload() {
    this._fetchNewData(this.run, this.tag);
  },
  _fetchNewData(run, tag) {
    if (!this._attached) {
      return;
    }
    this._canceller.cancelAll();
    const url = tf_backend.addParams(
      tf_backend.getRouter().pluginRoute('advis', '/test'), {tag, run});
    const updateData = this._canceller.cancellable(result => {
      if (result.cancelled) {
        return;
      }
      const backendData = result.value;
      this.testData = backendData;
    });
    this.requestManager.request(url).then(updateData);
  }
});
