'use strict';

Polymer({
  is: 'advis-dashboard',
  properties: {
    _selectedRuns: Array,
    _runToTag: Object,  // map<run: string, tags: string[]>
    _dataNotFound: Boolean,
    _tagFilter: {
      type: String,  // upward bound from paper-input
      value: '.*',
    },
    _categories: {
      type: Array,
      computed:
        '_makeCategories(_runToTag, _selectedRuns, _tagFilter)',
    },
    _requestManager: {
      type: Object,
      value: () => new tf_backend.RequestManager(),
    }
  },
  ready() {
    this.reload();
  },
  reload() {
    this._fetchTags().then(() => {
      this._reloadCards();
    });
  },
  _fetchTags() {
    const url = tf_backend.getRouter().pluginRoute('advis', '/tags');
    return this._requestManager.request(url).then(runToTag => {
      if (_.isEqual(runToTag, this._runToTag)) {
        // No need to update anything if there are no changes.
        return;
      }
      const tags = tf_backend.getTags(runToTag);
      this.set('_dataNotFound', tags.length === 0);
      this.set('_runToTag', runToTag);
    });
  },
  _reloadCards() {
    this.querySelectorAll('test-card').forEach(g => {
      g.reload();
    });
  },
  _makeCategories(runToTag, selectedRuns, tagFilter) {
    return tf_categorization_utils.categorizeRunTagCombinations(runToTag, selectedRuns, tagFilter);
  }
});

tf_tensorboard.registerDashboard({
  plugin: 'advis',
  elementName: 'advis-dashboard',
  tabName: 'Advis',
  isReloadDisabled: false
});
