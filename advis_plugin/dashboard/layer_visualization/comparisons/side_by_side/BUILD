package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the component for the side by side image 
# comparison
tf_web_library(
	name = "side_by_side",
	srcs = [
		"side-by-side.html",
		"side-by-side.css",
		"side-by-side.ts"
	],
	path = "/side-by-side",
	deps = [
		"//advis_plugin/dashboard/layer_visualization/comparisons:visualization_comparison_behavior",
		"//advis_plugin/dashboard/dialogs/unit_details_dialog",
		"@org_polymer_neon_animation"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "side_by_side_scss",
  src = "side-by-side.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "side_by_side_css",
  srcs = [":side_by_side_scss"],
  outs = ["side-by-side.css"],
  cmd = "cat $(locations :side_by_side_scss) > $@"
)
