package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

# Build the web library that contains a preview of what a distortion does to an 
# input image.
tf_web_library(
	name = "distortion_preview",
	srcs = [
		"distortion-preview.html",
		"distortion-preview.css",
		"distortion-preview.ts"
	],
	path = "/distortion-preview",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_iron_icons",
		"//advis_plugin/dashboard/image_loader"
	]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "distortion_preview_scss",
  src = "distortion-preview.scss",
	deps = [
		"//advis_plugin/dashboard/shared/style:text",
		"//advis_plugin/dashboard/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "distortion_preview_css",
  srcs = [":distortion_preview_scss"],
  outs = ["distortion-preview.css"],
  cmd = "cat $(locations :distortion_preview_scss) > $@"
)
