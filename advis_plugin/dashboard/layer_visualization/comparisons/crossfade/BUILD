package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the component for the crossfade image 
# comparison
tf_web_library(
	name = "crossfade",
	srcs = [
		"crossfade.html",
		"crossfade.css",
		"crossfade.ts"
	],
	path = "/crossfade",
	deps = [
		"//advis_plugin/dashboard/layer_visualization/comparisons:visualization_comparison_behavior",
		"//advis_plugin/dialogs/unit_details_dialog",
		"@org_polymer_neon_animation",
		"@org_polymer_paper_slider"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "crossfade_scss",
  src = "crossfade.scss",
	deps = [
		"//advis_plugin/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "crossfade_css",
  srcs = [":crossfade_scss"],
  outs = ["crossfade.css"],
  cmd = "cat $(locations :crossfade_scss) > $@"
)
