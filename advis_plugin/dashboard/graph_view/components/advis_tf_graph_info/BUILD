package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "advis_tf_graph_info",
	srcs = [
		"advis-tf-graph-info.html",
		"advis-tf-node-info.html",
		"advis-tf-node-list-item.html"
	],
	path = "/advis-tf-graph-info",
	deps = [
		":advis_tf_graph_icon",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_common",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_debugger_data_card",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_op_compat_card",
		"@org_polymer_iron_collapse",
		"@org_polymer_iron_list",
		"@org_polymer_paper_button",
		"@org_polymer_paper_icon_button",
		"@org_polymer_paper_item",
		"@org_polymer_paper_material",
		"@org_polymer_paper_slider",
		"@org_polymer_paper_spinner"
	]
)

tf_web_library(
	name = "advis_tf_graph_icon",
	srcs = [
		"advis-tf-graph-icon.html"
	],
	path = "/advis-tf-graph-info",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_dashboard_common",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)
