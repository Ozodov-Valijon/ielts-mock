"""Backward-compatible test command; never writes to the application database."""
from run_tests import main

if __name__ == "__main__":
    raise SystemExit(main())
