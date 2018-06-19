package(default_visibility = ["//visibility:public"])
load("@python_dependencies//:requirements.bzl", "requirement")

py_library(
	name = "datasets",
	srcs = ["datasets.py"],
	srcs_version = "PY2AND3",
	data = glob(["presets/**/*"]),
	deps = [
		requirement('scikit-image'),
		requirement('Pillow')
	]
)
