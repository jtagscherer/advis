package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a UI element for adjusting a range 
# parameter.
tf_web_library(
	name = "range_parameter",
	srcs = [
		"range-parameter.html",
		"range-parameter.css",
		"range-parameter.ts"
	],
	path = "/range-parameter",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_range_slider"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "range_parameter_scss",
  src = "range-parameter.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "range_parameter_css",
  srcs = [":range_parameter_scss"],
  outs = ["range-parameter.css"],
  cmd = "cat $(locations :range_parameter_scss) > $@"
)
