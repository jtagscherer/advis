package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

py_library(
	name = "advis_plugin",
	srcs = ["plugin.py"],
	srcs_version = "PY2AND3",
	deps = [
		"@org_pocoo_werkzeug",
		"@org_pythonhosted_six",
		"@org_tensorflow_tensorboard//tensorboard/backend:http_util",
		"@org_tensorflow_tensorboard//tensorboard/backend/event_processing:event_accumulator",
		"@org_tensorflow_tensorboard//tensorboard/plugins:base_plugin"
	]
)

py_binary(
	name = "demo",
	srcs = ["demo.py", "argutil.py"],
	srcs_version = "PY2AND3",
	deps = [
		":summary",
		"//models"
	]
)

py_library(
	name = "summary",
	srcs = ["summary.py"],
	srcs_version = "PY2AND3"
)
