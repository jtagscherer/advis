package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a UI element for adjusting a constant 
# parameter.
tf_web_library(
	name = "constant_parameter",
	srcs = [
		"constant-parameter.html",
		"constant-parameter.css",
		"constant-parameter.ts"
	],
	path = "/constant-parameter",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_slider"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "constant_parameter_scss",
  src = "constant-parameter.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "constant_parameter_css",
  srcs = [":constant_parameter_scss"],
  outs = ["constant-parameter.css"],
  cmd = "cat $(locations :constant_parameter_scss) > $@"
)
