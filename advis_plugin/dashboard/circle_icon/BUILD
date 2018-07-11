package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a circle with an icon.
tf_web_library(
	name = "circle_icon",
	srcs = [
		"circle-icon.html",
		"circle-icon.css",
		"circle-icon.ts"
	],
	path = "/circle-icon",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_iron_icon",
		"//advis_plugin/dashboard/shared/icons"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "circle_icon_scss",
  src = "circle-icon.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "circle_icon_css",
  srcs = [":circle_icon_scss"],
  outs = ["circle-icon.css"],
  cmd = "cat $(locations :circle_icon_scss) > $@"
)
