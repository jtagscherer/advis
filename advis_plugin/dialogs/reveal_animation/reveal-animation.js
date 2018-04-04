'use strict';

Polymer({
  is: 'reveal-animation',
  behaviors: [
    Polymer.NeonAnimationBehavior
  ],
  configure: function(config) {
    var node = config.node;
		
    var from = config.from || 'none';
    var to = config.to || 'none';
		
    this._effect = new KeyframeEffect(node, [
      {
				'transform': from.transform,
				'opacity': from.opacity
			},
      {
				'transform': to.transform,
				'opacity': to.opacity
			}
    ], this.timingFromConfig(config));
		
    if (config.transformOrigin) {
      this.setPrefixedProperty(node, 'transformOrigin', config.transformOrigin);
    }
		
    return this._effect;
  }
});
