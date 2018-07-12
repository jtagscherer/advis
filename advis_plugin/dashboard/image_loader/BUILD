package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains an image that shows a spinner while it is 
# being loaded.
tf_web_library(
	name = "image_loader",
	srcs = [
		"image-loader.html",
		"image-loader.css",
		"image-loader.ts"
	],
	path = "/image-loader",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_spinner"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "image_loader_scss",
  src = "image-loader.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:style"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "image_loader_css",
  srcs = [":image_loader_scss"],
  outs = ["image-loader.css"],
  cmd = "cat $(locations :image_loader_scss) > $@"
)
