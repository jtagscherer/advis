package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a generic dialog header with a close 
# button
tf_web_library(
	name = "dialog_header",
	srcs = [
		"dialog-header.html",
		"dialog-header.css",
		"dialog-header.ts"
	],
	path = "/dialog-header",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_icon_button",
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "dialog_header_scss",
  src = "dialog-header.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "dialog_header_css",
  srcs = [":dialog_header_scss"],
  outs = ["dialog-header.css"],
  cmd = "cat $(locations :dialog_header_scss) > $@",
)
