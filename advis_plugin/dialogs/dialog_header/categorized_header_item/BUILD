package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a three-tiered dialog header item with a 
# category, title, and caption.
tf_web_library(
	name = "categorized_header_item",
	srcs = [
		"categorized-header-item.html",
		"categorized-header-item.css",
		"categorized-header-item.ts"
	],
	path = "/dialog-header/categorized-header-item",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "categorized_header_item_scss",
  src = "categorized-header-item.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "categorized_header_item_css",
  srcs = [":categorized_header_item_scss"],
  outs = ["categorized-header-item.css"],
  cmd = "cat $(locations :categorized_header_item_scss) > $@"
)
