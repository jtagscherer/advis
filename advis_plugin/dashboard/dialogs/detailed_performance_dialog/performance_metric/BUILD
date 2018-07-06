package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a row of values of a performance metric.
tf_web_library(
	name = "performance_metric",
	srcs = [
		"performance-metric.html",
		"performance-metric.css",
		"performance-metric.ts"
	],
	path = "/performance-metric",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/dialogs/detailed_performance_dialog/performance_metric/metric_value"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "performance_metric_scss",
  src = "performance-metric.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "performance_metric_css",
  srcs = [":performance_metric_scss"],
  outs = ["performance-metric.css"],
  cmd = "cat $(locations :performance_metric_scss) > $@"
)
