from os.path import isfile
import pickle

class DataCache:
	class __DataCache:
		__cache = None
		storage_file = None
		caching_enabled = True
		
		def __init__(self):
			self.__cache = {}
		
		def set_storage_file(self, storage_file):
			self.storage_file = storage_file
			
			# Load available data from the file if it exists
			if isfile(self.storage_file):
				with open(self.storage_file, 'rb') as handle:
					self.__cache = pickle.load(handle)
		
		def has_data(self, type, key):
			return (type, key) in self.__cache
		
		def get_data(self, type, key):
			return self.__cache[(type, key)]
		
		def set_data(self, type, key, data):
			self.__cache[(type, key)] = data
			
			if self.caching_enabled and self.storage_file != None:
				self.persist_cache()
		
		def enable_caching(self):
			self.caching_enabled = True
			
		def disable_caching(self):
			self.caching_enabled = False
		
		def remove_cached_data(self, type, condition=None):
			if condition is None:
				pruned_cache = {key: value for key, value in self.__cache.items() \
					if key[0] != type}
			else:
				pruned_cache = {key: value for key, value in self.__cache.items() \
					if key[0] != type and not condition(key)}
			
			self.__cache = pruned_cache
			self.persist_cache()
		
		def persist_cache(self):
			with open(self.storage_file, 'wb') as handle:
				pickle.dump(self.__cache, handle, protocol=pickle.HIGHEST_PROTOCOL)
	
	__instance = None
	
	def __init__(self):
		if not DataCache.__instance:
			DataCache.__instance = DataCache.__DataCache()
	
	def __getattr__(self, name):
		return getattr(self.__instance, name)