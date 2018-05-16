package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a simple section header.
tf_web_library(
	name = "section_header",
	srcs = [
		"section-header.html",
		"section-header.css",
		"section-header.ts"
	],
	path = "/section-header",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "section_header_scss",
  src = "section-header.scss",
	deps = [
		"//advis_plugin/shared/style:text",
		"//advis_plugin/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "section_header_css",
  srcs = [":section_header_scss"],
  outs = ["section-header.css"],
  cmd = "cat $(locations :section_header_scss) > $@"
)
