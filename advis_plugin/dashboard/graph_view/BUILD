load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "tf_web_library")
load("@io_bazel_rules_sass//sass:sass.bzl", "sass_binary")

tf_web_library(
  name = "graph_view",
  srcs = [
    "graph-view.html",
		"graph-view.css",
		"graph-view.ts"
  ],
  path = "/graph-view",
  visibility = ["//visibility:public"],
  deps = [
		"@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
		"@org_tensorflow_tensorboard//tensorboard/components/tf_backend",
		"@org_polymer_paper_icon_button",
		"//advis_plugin/dashboard/dialogs/graph_settings_dialog",
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_board",
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_controls",
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_loader",
		"//advis_plugin/dashboard/graph_view/components/advis_tf_graph_common",
		"//advis_plugin/shared/libraries/chroma"
  ]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "graph_view_scss",
  src = "graph-view.scss",
	deps = [
		"//advis_plugin/shared/style:color"
	]
)

# Move the compiled CSS file to our desired path
genrule(
  name = "graph_view_css",
  srcs = [":graph_view_scss"],
  outs = ["graph-view.css"],
  cmd = "cat $(locations :graph_view_scss) > $@"
)
