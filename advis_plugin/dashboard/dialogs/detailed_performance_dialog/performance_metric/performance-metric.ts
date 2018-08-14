'use strict';

Polymer({
  is: 'performance-metric',
	properties: {
		name: String,
		values: {
			type: Object,
			observer: '_generateValueData'
		},
		percent: Boolean,
		_originalValue: Object,
		_distortedValue: Object,
		_valueList: Array,
		_noDistortions: Boolean
	},
	
	_generateValueData: function(values) {
		this.set('_noDistortions', Object.keys(values).length <= 1);
		
		this.set('_originalValue', {
			value: values['original'].value
		});
		
		var valueList = [];
		var averageDistortedValue = 0;
		
		for (let value in values) {
			if (value != 'original') {
				valueList.push({
					name: values[value].displayName,
					value: values[value].value,
					originalValue: values['original'].value
				});
				
				averageDistortedValue += values[value].value;
			}
		}
		
		valueList.sort((a, b) => a.name.localeCompare(b.name));
		
		this.set('_valueList', valueList);
		this.set('_distortedValue', {
			value: averageDistortedValue / valueList.length,
			originalValue: values['original'].value
		});
	}
});
