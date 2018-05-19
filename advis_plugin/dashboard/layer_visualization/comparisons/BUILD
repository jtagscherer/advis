package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

tf_web_library(
	name = "visualization_comparison_behavior",
	srcs = [
		"visualization-comparison-behavior.html",
		"visualization-comparison-behavior.ts"
	],
	path = "/visualization-comparison-behavior",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_iron_resizable_behavior"
	]
)
