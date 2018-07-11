package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component that displays a value along 
# with its name and its difference to another value.
tf_web_library(
	name = "metric_value",
	srcs = [
		"metric-value.html",
		"metric-value.css",
		"metric-value.ts"
	],
	path = "/metric-value",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_tooltip"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "metric_value_scss",
  src = "metric-value.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "metric_value_css",
  srcs = [":metric_value_scss"],
  outs = ["metric-value.css"],
  cmd = "cat $(locations :metric_value_scss) > $@"
)
