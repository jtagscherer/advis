package(default_visibility = ["//visibility:public"])

load("@python_dependencies//:requirements.bzl", "requirement")
load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

py_library(
	name = "advis_plugin",
	srcs = ["plugin.py"],
	srcs_version = "PY2AND3",
	deps = [
		"//advis_plugin/models:models",
		"//advis_plugin/datasets:datasets",
		"//advis_plugin/distortions:distortions",
		"//advis_plugin/routers",
		"@org_pocoo_werkzeug",
		"@org_tensorflow_tensorboard//tensorboard/plugins:base_plugin"
	]
)

py_library(
	name = "util",
	srcs = [
		"util/imgutil.py",
		"util/argutil.py",
		"util/visualizations.py",
		"util/cache.py"
	],
	srcs_version = "PY2AND3",
	deps = [
		requirement('scikit-image'),
		requirement('Pillow')
	]
)
