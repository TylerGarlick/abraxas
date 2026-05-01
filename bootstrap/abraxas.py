import os


def bootstrap():
    base_dir = ".abraxas"
    sub_dirs = ["retrospectives", "ledgers", "brain_memory"]

    # Create the .abraxas directory if it doesn't exist
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Create the specified subdirectories
    for sub_dir in sub_dirs:
        path = os.path.join(base_dir, sub_dir)
        if not os.path.exists(path):
            os.makedirs(path)


if __name__ == "__main__":
    bootstrap()