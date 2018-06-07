class DataCache:
	class __DataCache:
		__cache = None
		
		def __init__(self):
			self.__cache = {}
		
		def has_data(self, type, key):
			return (type, key) in self.__cache
		
		def get_data(self, type, key):
			return self.__cache[(type, key)]
		
		def set_data(self, type, key, data):
			self.__cache[(type, key)] = data
	
	__instance = None
	
	def __init__(self):
		if not DataCache.__instance:
			DataCache.__instance = DataCache.__DataCache()
	
	def __getattr__(self, name):
		return getattr(self.__instance, name)
