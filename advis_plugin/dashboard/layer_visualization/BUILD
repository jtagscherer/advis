package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component with everything necessary for 
# visualizing a model layer
tf_web_library(
	name = "layer_visualization",
	srcs = [
		"layer-visualization.html",
		"layer-visualization.css",
		"layer-visualization.ts"
	],
	path = "/layer-visualization",
	deps = [
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_neon_animation",
		"@org_polymer_paper_tabs",
		"@org_polymer_paper_icon_button",
		"//advis_plugin/dashboard/shared/icons",
		"//advis_plugin/dashboard/empty_state",
		"//advis_plugin/dashboard/layer_visualization/selectors/input_image_selector",
		"//advis_plugin/dashboard/layer_visualization/selectors/distortion_selector",
		"//advis_plugin/dashboard/layer_visualization/comparisons/side_by_side",
		"//advis_plugin/dashboard/layer_visualization/comparisons/swipe",
		"//advis_plugin/dashboard/layer_visualization/comparisons/crossfade",
		"//advis_plugin/dashboard/layer_visualization/comparisons/difference"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "layer_visualization_scss",
  src = "layer-visualization.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "layer_visualization_css",
  srcs = [":layer_visualization_scss"],
  outs = ["layer-visualization.css"],
  cmd = "cat $(locations :layer_visualization_scss) > $@"
)
