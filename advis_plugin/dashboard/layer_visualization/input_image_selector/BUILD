package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a component for selecting an input image
tf_web_library(
	name = "input_image_selector",
	srcs = [
		"input-image-selector.html",
		"input-image-selector.css",
		"input-image-selector.ts"
	],
	path = "/input-image-selector",
	deps = [
		"//advis_plugin/dialogs/input_image_selection_dialog",
    "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_card",
		"@org_polymer_iron_icon",
		"@org_polymer_paper_ripple"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "input_image_selector_scss",
  src = "input-image-selector.scss",
	deps = [
		"//advis_plugin/shared:text",
		"//advis_plugin/shared:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "input_image_selector_css",
  srcs = [":input_image_selector_scss"],
  outs = ["input-image-selector.css"],
  cmd = "cat $(locations :input_image_selector_scss) > $@"
)
