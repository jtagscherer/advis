package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

# Build the web library that contains a Chart.js radar chart.
tf_web_library(
	name = "chart_component",
	srcs = [
		"chart-component.html",
		"chart-component.ts"
	],
	path = "/chart-component",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_iron_resizable_behavior",
		"//advis_plugin/shared/libraries/chart"
	]
)
