package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the component for the difference image 
# comparison
tf_web_library(
	name = "difference",
	srcs = [
		"difference.html",
		"difference.css",
		"difference.ts"
	],
	path = "/difference",
	deps = [
		"//advis_plugin/shared/libraries/resemble",
		"//advis_plugin/dashboard/layer_visualization/comparisons:visualization_comparison_behavior",
		"//advis_plugin/dialogs/unit_details_dialog",
		"@org_polymer_neon_animation",
		"@org_polymer_paper_radio_group"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "difference_scss",
  src = "difference.scss",
	deps = [
		"//advis_plugin/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "difference_css",
  srcs = [":difference_scss"],
  outs = ["difference.css"],
  cmd = "cat $(locations :difference_scss) > $@"
)
