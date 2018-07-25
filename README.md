# Advis

Analyze how your deep learning model behaves when presented with randomly perturbed input data or targeted adversarial attacks.

## Building

1. Make sure your setup satisfies all requirements.
    1. You will need to [install a recent version of TensorFlow](https://www.tensorflow.org/install/), which comes with TensorBoard.
    Using Python 3 inside a virtual environment like [`venv`](https://docs.python.org/3/library/venv.html) is highly recommended.
    2. [Install Bazel](https://docs.bazel.build/versions/master/install.html) which will be used to build the plugin and integrate it into a custom version of TensorBoard.

2. Build TensorBoard and the plugin, link them against each other and launch the modified TensorBoard version with Advis installed. This might take a while when compiling for the first time.

    `bazel run //advis_tensorboard -- --logdir /tmp/advis_demo`
		
	Afterwards, the server will prepare all data needed to speed up interaction with the interface. You will be informed about the progress within your terminal. Please wait until TensorBoard outputs that the server has been started.

3. If everything went well, TensorBoard along with Advis should now be available at [`localhost:6006/#advis`](http://localhost:6006/#advis).

## Usage

If the building process succeeded, you are set to start using Advis.

### Defining modules

Advis uses a modular system for managing models, datasets, and distortions. These modules are Python files living inside the specified `logdir`, each representing one of the aforementioned elements. When starting for the first time with an empty `logdir`, the directory will be filled with preset modules for a set of interesting models, datasets, and distortions. Of course you can delete or customize these modules to your likings. For specifying your own custom modules, please refer to this repository's Wiki pages.

### Caching

For faster starting times and a more interactive visualization, Advis caches data in a two-tiered system.

Firstly, visualization annotation operations need to be added to the computation graphs of models. When done so, these annotated computation graphs along with their full and simplified graph definitions will be saved to a cache directory within the model module directory so these steps will not need to be repeated when starting the next time. Make sure to delete this cache if you change anything about the model.

Secondly, all expensive computations, especially ones concerning model predictions, are lazily cached after they have been executed. They are written to the `logdir` as a file called `cache.pickle`. If you want to eagerly cache every important computation result you can do so by sending a request to the [`/cache`](http://localhost:6006/data/plugin/advis/cache?modelAccuracy=<number>&nodeActivation=<number>&verbose=True) route while specifying the amount of samples to be used to calculate `modelAccuracy` and `nodeActivation`. These should correspond with the constants defined in the dashboard. The `verbose` flag specifies whether the current caching process should be written to the terminal. Please be aware that depending on your hardware, caching parameters, and data complexity this process can take a long time.
