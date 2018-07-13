package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component that can be used as an empty 
# state which explains why nothing is being shown yet.
tf_web_library(
	name = "empty_state",
	srcs = [
		"empty-state.html",
		"empty-state.css",
		"empty-state.ts"
	],
	path = "/empty-state",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_iron_icon",
		"//advis_plugin/dashboard/shared/icons"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "empty_state_scss",
  src = "empty-state.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "empty_state_css",
  srcs = [":empty_state_scss"],
  outs = ["empty-state.css"],
  cmd = "cat $(locations :empty_state_scss) > $@"
)
