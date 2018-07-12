package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

tf_web_library(
	name = "icons",
	srcs = [
		"icons.html"
	],
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_iron_iconset_svg"
	],
	path = "/advis-icons"
)
