import time, threading
from os.path import isfile
import pickle
import copy

class DataCache:
	class __DataCache:
		__cache = None
		__cache_dirty = False
		storage_file = None
		caching_enabled = True
		
		def __init__(self):
			self.__cache = {}
			cache_thread = threading.Thread(target = self._timed_persist)
			cache_thread.daemon = True
			cache_thread.start()
		
		def set_storage_file(self, storage_file):
			self.storage_file = storage_file
			
			# Load available data from the file if it exists
			if isfile(self.storage_file):
				with open(self.storage_file, 'rb') as handle:
					self.__cache = pickle.load(handle)
		
		def has_data(self, type, key):
			return (type, key) in self.__cache
		
		def get_data(self, type, key):
			return copy.deepcopy(self.__cache[(type, key)])
		
		def set_data(self, type, key, data):
			self.__cache[(type, key)] = copy.deepcopy(data)
			self.__cache_dirty = True
		
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
					if key[0] != type or not condition(key[1])}
			
			removed_elements = len(self.__cache) - len(pruned_cache)
			
			self.__cache = pruned_cache
			self.persist_cache()
			
			return removed_elements
		
		def persist_cache(self):
			with open(self.storage_file, 'wb') as handle:
				pickle.dump(self.__cache, handle, protocol=pickle.HIGHEST_PROTOCOL)
			
			self.__cache_dirty = False
		
		def _timed_persist(self):
			while True:
				if self.__cache_dirty and self.caching_enabled \
					and self.storage_file is not None:
					self.persist_cache()
				
				time.sleep(10)
	
	__instance = None
	
	def __init__(self):
		if not DataCache.__instance:
			DataCache.__instance = DataCache.__DataCache()
	
	def __getattr__(self, name):
		return getattr(self.__instance, name)
