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
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_board",
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_controls",
    "//advis_plugin/dashboard/graph_view/components/advis_tf_graph_loader"
  ]
)

# Compile the component's Sass stylesheet to CSS
sass_binary(
  name = "graph_view_scss",
  src = "graph-view.scss"
)

# Move the compiled CSS file to our desired path
genrule(
  name = "graph_view_css",
  srcs = [":graph_view_scss"],
  outs = ["graph-view.css"],
  cmd = "cat $(locations :graph_view_scss) > $@"
)
