package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a selectable single input image along with
# additional meta information.
tf_web_library(
	name = "input_image_item",
	srcs = [
		"input-image-item.html",
		"input-image-item.css",
		"input-image-item.ts"
	],
	path = "/input-image-item",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_card",
		"@org_polymer_paper_ripple",
		"@org_polymer_paper_tooltip"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "input_image_item_scss",
  src = "input-image-item.scss",
	deps = [
		"//advis_plugin/shared/style:color",
		"//advis_plugin/shared/style:text"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "input_image_item_css",
  srcs = [":input_image_item_scss"],
  outs = ["input-image-item.css"],
  cmd = "cat $(locations :input_image_item_scss) > $@"
)
