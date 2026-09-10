# Original practice set 3

`practice_set_3.py` contains 40 Reading questions across three original passages,
40 Listening questions across four complete scripts, two Academic Writing tasks
and three Speaking parts. Its fictional places and studies are exercise content,
not factual references. The written material is dedicated to the public domain
under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

This is independent IELTS-style training. It is not an official IELTS test and
its difficulty/band equivalence has not been externally calibrated. Reading has
multiple choice, True/False/Not Given and short completion questions. Listening
has multiple choice and short completion questions. It is not intended to cover
every question format used in examinations.

The accompanying `../content_audio/practice-set-3.wav` is original synthetic
English narration, generated locally with installed Windows System.Speech
voices. It contains the complete scripts, question-reading intervals and answer
checking pauses. It has no music and makes no external API request. Speaker
variety depends on the English voices installed on the generating machine;
synthetic voices are not a substitute for practice with natural accents.

To reproduce the recording on Windows, from the backend directory:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\generate_practice_audio.ps1
```

Add `-Force` only when intentionally replacing that generated WAV. An existing
recording is otherwise preserved. The included WAV allows non-Windows servers
to serve the practice set without speech-generation dependencies.

Seed with `python seed_practice.py` after configuring the intended database.
It adds missing question slots for set 3 and does not delete or update existing
questions, users, tests or answers. Running it repeatedly does not duplicate
questions. Existing content at a set 3 slot is respected, so review any manually
edited slots before expecting an exact match to the bundled material.

The question-facing audio URL is `/api/v1/content/audio/practice-set-3.wav`.
The application serves it through its authenticated content endpoint. Do not
publish this authoring directory: it contains the answer key and transcripts.
Run the repository content tests with the backend virtual environment:

```powershell
backend\venv\Scripts\python.exe -m unittest discover -s tests -p test_content.py -v
```
