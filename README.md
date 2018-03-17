# Advis

Analyze how your deep learning model behaves when presented with randomly perturbed input data or targeted adversarial attacks.

## Building

1. Make sure your setup satisfies all requirements.
    1. You will need to [install a recent version of TensorFlow](https://www.tensorflow.org/install/), which comes with TensorBoard.
    Using Python 3 inside a virtual environment like [`venv`](https://docs.python.org/3/library/venv.html) is highly recommended.
    2. [Install Bazel](https://docs.bazel.build/versions/master/install.html) which will be used to build the plugin and integrate it into a custom version of TensorBoard.

2. *Optional:* If you don't have any actual data to visualize yet but want to try out Advis, you can build and run the plugin demo to generate some exemplary data. Choose a directory where the output data should be written using the `logdir` parameter. Remember to point TensorBoard to the same directory when launching it in step 3.

    Keep in mind that this step will download large model checkpoint files when run the first time.

    `bazel run //advis_plugin:demo -- --logdir /tmp/advis_demo`

3. Build Tensorboard and the plugin, link them against each other and launch the modified Tensorboard version with Advis installed. This might take a while when compiling for the first time.

    `bazel run //advis_tensorboard -- --logdir /tmp/advis_demo`

4. If everything went well, TensorBoard along with Advis should now be available at [`localhost:6006`](http://localhost:6006/).

## Usage

**TODO**
