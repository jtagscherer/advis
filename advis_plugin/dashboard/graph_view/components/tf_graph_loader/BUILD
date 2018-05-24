package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "tf_graph_loader",
	srcs = ["tf-graph-loader.html"],
	path = "/tf-graph-loader",
	deps = [
		"//advis_plugin/dashboard/graph_view/components/tf_graph_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)
