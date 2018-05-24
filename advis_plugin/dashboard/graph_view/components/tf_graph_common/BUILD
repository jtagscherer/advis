package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")

licenses(["notice"])  # Apache 2.0

tf_web_library(
	name = "tf_graph_common",
	srcs = [
		"annotation.ts",
		"colors.ts",
		"common.ts",
		"contextmenu.ts",
		"edge.ts",
		"externs.ts",
		"graph.ts",
		"hierarchy.ts",
		"layout.ts",
		"minimap.ts",
		"node.ts",
		"op.ts",
		"parser.ts",
		"proto.ts",
		"render.ts",
		"scene.ts",
		"template.ts",
		"tf-graph-common.html",
		"util.ts"
	],
	path = "/tf-graph-common",
	deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:d3",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:dagre",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:graphlib",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:lodash",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer"
	]
)
