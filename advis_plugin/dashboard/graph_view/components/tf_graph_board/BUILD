package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "tf_graph_board",
	srcs = ["tf-graph-board.html"],
	path = "/tf-graph-board",
	deps = [
		"//advis_plugin/dashboard/graph_view/components/tf_graph",
		"//advis_plugin/dashboard/graph_view/components/tf_graph_common",
		"//advis_plugin/dashboard/graph_view/components/tf_graph_info",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_polymer_paper_progress"
	]
)
