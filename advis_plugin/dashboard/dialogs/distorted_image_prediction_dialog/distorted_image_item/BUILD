package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains the component that displays a single 
# distorted version of an input image and its prediction certainty.
tf_web_library(
	name = "distorted_image_item",
	srcs = [
		"distorted-image-item.html",
		"distorted-image-item.css",
		"distorted-image-item.ts"
	],
	path = "/distorted-image-item",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_card",
		"@org_polymer_paper_ripple",
		"@org_polymer_paper_tooltip",
		"//advis_plugin/dashboard/circle_icon"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distorted_image_item_scss",
  src = "distorted-image-item.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distorted_image_item_css",
  srcs = [":distorted_image_item_scss"],
  outs = ["distorted-image-item.css"],
  cmd = "cat $(locations :distorted_image_item_scss) > $@"
)
