package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the component for the swipe image 
# comparison
tf_web_library(
	name = "swipe",
	srcs = [
		"swipe.html",
		"swipe.css",
		"swipe.ts"
	],
	path = "/swipe",
	deps = [
		"//advis_plugin/dashboard/layer_visualization/comparisons:visualization_comparison_behavior",
		"//advis_plugin/dialogs/unit_details_dialog",
		"@org_polymer_neon_animation",
		"@org_polymer_paper_slider"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "swipe_scss",
  src = "swipe.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "swipe_css",
  srcs = [":swipe_scss"],
  outs = ["swipe.css"],
  cmd = "cat $(locations :swipe_scss) > $@"
)
