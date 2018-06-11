package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a legend for the colors used in the 
# node activation difference visualization.
tf_web_library(
	name = "color_legend",
	srcs = [
		"color-legend.html",
		"color-legend.css",
		"color-legend.ts"
	],
	path = "/color-legend",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_spinner"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "color_legend_scss",
  src = "color-legend.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "color_legend_css",
  srcs = [":color_legend_scss"],
  outs = ["color-legend.css"],
  cmd = "cat $(locations :color_legend_scss) > $@"
)
