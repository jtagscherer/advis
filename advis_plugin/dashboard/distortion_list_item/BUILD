package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a simple section header.
tf_web_library(
	name = "distortion_list_item",
	srcs = [
		"distortion-list-item.html",
		"distortion-list-item.css",
		"distortion-list-item.ts"
	],
	path = "/distortion-list-item",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_ripple"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distortion_list_item_scss",
  src = "distortion-list-item.scss",
	deps = [
		"//advis_plugin/shared:text",
		"//advis_plugin/shared:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distortion_list_item_css",
  srcs = [":distortion_list_item_scss"],
  outs = ["distortion-list-item.css"],
  cmd = "cat $(locations :distortion_list_item_scss) > $@"
)
