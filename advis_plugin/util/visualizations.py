from advis_plugin.util.cache import DataCache

class Visualizations:
	class __Visualizations:
		data_type = 'layer_visualization'
		
		def __init__(self):
			self._layer_visualization_cache = {}
		
		def get_layer_visualization(self, model_manager, model, layer, image_index,
			distortion=None):
			key_tuple = (model, layer, image_index, distortion)
			
			if DataCache().has_data(self.data_type, key_tuple):
				return DataCache().get_data(self.data_type, key_tuple)
			
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
			DataCache().set_data(self.data_type, key_tuple, result)
			
			return result
	
	__instance = None
	
	def __init__(self):
		if not Visualizations.__instance:
			Visualizations.__instance = Visualizations.__Visualizations()
	
	def __getattr__(self, name):
		return getattr(self.__instance, name)
