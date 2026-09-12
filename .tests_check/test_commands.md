# Ruff
ruff check . --fix > .tests_check/ruff.md

# Mypy
mypy .  > .tests_check/mypy.md

# Pytest
pytest .  > .tests_check/pytest.md