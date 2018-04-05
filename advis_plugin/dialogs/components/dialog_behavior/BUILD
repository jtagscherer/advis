package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

tf_web_library(
	name = "dialog_behavior",
	srcs = [
		"dialog-behavior.html",
		"dialog-behavior.ts"
	],
	path = "/dialog-behavior",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dialogs/components/reveal_animation"
	]
)
