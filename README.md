# Advis

Analyze how your deep learning model behaves when presented with randomly perturbed input data or targeted adversarial attacks.

## Building

1. Build and run the plugin demo to generate some exemplary data

 `bazel run //advis_plugin:advis_demo`

2. Build Tensorboard and the plugin, link them against each other and launch the modified Tensorboard version with Advis installed. This might take some time.

 `bazel run //advis_tensorboard -- --logdir=/tmp/advis_demo`

## Usage

**TODO**
