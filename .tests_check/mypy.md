src/models.py:8: error: Variable "models.Base" is not valid as a type  [valid-type]
src/models.py:8: note: See https://mypy.readthedocs.io/en/stable/common_issues.html#variables-vs-type-aliases
src/models.py:8: error: Invalid base class "Base"  [misc]
src/main.py:27: error: Function is missing a return type annotation  [no-untyped-def]
src/sensor_simulado.py:5: error: Library stubs not installed for "requests"  [import-untyped]
src/sensor_simulado.py:5: note: Hint: "python3 -m pip install types-requests"
src/sensor_simulado.py:5: note: (or run "mypy --install-types" to install all missing stub packages)
src/sensor_simulado.py:5: note: See https://mypy.readthedocs.io/en/stable/running_mypy.html#missing-imports
src/sensor_simulado.py:10: error: Function is missing a type annotation  [no-untyped-def]
Found 5 errors in 3 files (checked 3 source files)
