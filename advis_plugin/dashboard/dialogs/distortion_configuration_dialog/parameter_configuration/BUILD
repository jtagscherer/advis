package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that displays configuration elements for all parameters 
# of a distortion method.
tf_web_library(
	name = "parameter_configuration",
	srcs = [
		"parameter-configuration.html",
		"parameter-configuration.css",
		"parameter-configuration.ts"
	],
	path = "/parameter-configuration",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/dialogs/distortion_configuration_dialog/parameter_configuration/constant_parameter",
		"//advis_plugin/dashboard/dialogs/distortion_configuration_dialog/parameter_configuration/range_parameter"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "parameter_configuration_scss",
  src = "parameter-configuration.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "parameter_configuration_css",
  srcs = [":parameter_configuration_scss"],
  outs = ["parameter-configuration.css"],
  cmd = "cat $(locations :parameter_configuration_scss) > $@"
)
