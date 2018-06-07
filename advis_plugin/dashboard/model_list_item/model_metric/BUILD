package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a simple section header.
tf_web_library(
	name = "model_metric",
	srcs = [
		"model-metric.html",
		"model-metric.css",
		"model-metric.ts"
	],
	path = "/model-metric",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "model_metric_scss",
  src = "model-metric.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "model_metric_css",
  srcs = [":model_metric_scss"],
  outs = ["model-metric.css"],
  cmd = "cat $(locations :model_metric_scss) > $@"
)
