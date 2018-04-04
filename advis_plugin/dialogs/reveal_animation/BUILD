package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

tf_web_library(
	name = "reveal_animation",
	srcs = [
		"reveal-animation.html",
		"reveal-animation.js"
	],
	path = "/reveal-animation",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_neon_animation"
	]
)
