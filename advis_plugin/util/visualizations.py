class Visualizations:
	class __Visualizations:
		# Data caches for faster access
		_layer_visualization_cache = None
		
		def __init__(self):
			self._layer_visualization_cache = {}
		
		def get_layer_visualization(self, model_manager, model, layer, image_index,
			distortion=None):
			key_tuple = (model, layer, image_index, distortion)
			
			if key_tuple in self._layer_visualization_cache:
				return self._layer_visualization_cache[key_tuple]
			
			_model = model_manager.get_model_modules()[model]
			result = None
			
			if distortion == None:
				meta_data = {
					'run_type': 'single_activation_visualization',
					'layer': layer,
					'image': image_index
				}
				
				result = _model.run(meta_data)
			else:
				meta_data = {
					'run_type': 'distorted_activation_visualization',
					'layer': layer,
					'image': image_index,
					'distortion': distortion
				}
				
				result = _model.run(meta_data)
			
			# Cache the result for later use
			self._layer_visualization_cache[key_tuple] = result
			
			return result
	
	__instance = None
	
	def __init__(self):
		if not Visualizations.__instance:
			Visualizations.__instance = Visualizations.__Visualizations()
	
	def __getattr__(self, name):
		return getattr(self.__instance, name)
