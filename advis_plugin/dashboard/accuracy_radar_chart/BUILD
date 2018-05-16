package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a simple section header.
tf_web_library(
	name = "accuracy_radar_chart",
	srcs = [
		"accuracy-radar-chart.html",
		"accuracy-radar-chart.css",
		"accuracy-radar-chart.ts"
	],
	path = "/accuracy-radar-chart",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "accuracy_radar_chart_scss",
  src = "accuracy-radar-chart.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "accuracy_radar_chart_css",
  srcs = [":accuracy_radar_chart_scss"],
  outs = ["accuracy-radar-chart.css"],
  cmd = "cat $(locations :accuracy_radar_chart_scss) > $@"
)
