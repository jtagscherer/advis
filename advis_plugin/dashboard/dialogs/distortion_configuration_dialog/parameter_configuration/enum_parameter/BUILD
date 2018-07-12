package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a UI element for adjusting an enumeration  
# parameter.
tf_web_library(
	name = "enum_parameter",
	srcs = [
		"enum-parameter.html",
		"enum-parameter.css",
		"enum-parameter.ts"
	],
	path = "/enum-parameter",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_radio_group"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "enum_parameter_scss",
  src = "enum-parameter.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "enum_parameter_css",
  srcs = [":enum_parameter_scss"],
  outs = ["enum-parameter.css"],
  cmd = "cat $(locations :enum_parameter_scss) > $@"
)
