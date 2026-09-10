param(
    [string]$Python = (Join-Path $PSScriptRoot 'venv\Scripts\python.exe'),
    [string]$OutputPath = (Join-Path $PSScriptRoot 'content_audio\practice-set-3.wav'),
    [string]$VoiceName = '',
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $OutputPath) {
    if (-not $Force) {
        Write-Output "Audio already exists: $OutputPath (use -Force to regenerate)."
        exit 0
    }
}
if (-not (Test-Path -LiteralPath $Python)) {
    throw "Python runtime not found: $Python. Pass -Python with a Python 3 executable."
}

# This reads only the authoring module. It never imports application/database code.
$recordingJson = & $Python (Join-Path $PSScriptRoot 'content\practice_set_3.py')
if ($LASTEXITCODE -ne 0) { throw 'Unable to load the original recording script.' }
$recording = $recordingJson | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $englishVoices = @($synthesizer.GetInstalledVoices() | Where-Object {
        $_.Enabled -and $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'en'
    })
    if ($englishVoices.Count -eq 0) {
        throw 'An installed Windows English text-to-speech voice is required. Install an English speech voice in Windows language settings.'
    }
    if ($VoiceName) {
        $matching = @($englishVoices | Where-Object { $_.VoiceInfo.Name -eq $VoiceName })
        if ($matching.Count -ne 1) { throw 'The requested English voice is not installed.' }
        $primaryVoice = $matching[0].VoiceInfo.Name
    } else {
        $primaryVoice = $englishVoices[0].VoiceInfo.Name
    }
    $secondaryVoice = $primaryVoice
    if ($englishVoices.Count -gt 1) { $secondaryVoice = $englishVoices[1].VoiceInfo.Name }
    $synthesizer.SelectVoice($primaryVoice)
    $synthesizer.Rate = -1
    $prompt = New-Object System.Speech.Synthesis.PromptBuilder
    $prompt.AppendText('This is an independent English listening practice test with forty questions. The recording uses synthetic speech. It is not an official IELTS examination. Listen to each part once. You will have time to read the questions before each part and to check your answers afterwards.')
    $prompt.AppendBreak([TimeSpan]::FromSeconds(3))
    foreach ($part in $recording.parts) {
        $prompt.AppendText([string]$part.intro)
        $prompt.AppendBreak([TimeSpan]::FromSeconds(45))
        foreach ($turn in $part.turns) {
            $speaker = [string]$turn[0]
            $voice = $primaryVoice
            if ($speaker -in @('caller', 'student2')) { $voice = $secondaryVoice }
            $prompt.StartVoice($voice)
            $prompt.AppendText([string]$turn[1])
            $prompt.EndVoice()
            $prompt.AppendBreak([TimeSpan]::FromMilliseconds(700))
        }
        $prompt.AppendText("That is the end of part $($part.part). You now have thirty seconds to check your answers.")
        $prompt.AppendBreak([TimeSpan]::FromSeconds(30))
    }
    $prompt.AppendText('That is the end of the listening recording. Check that you have entered an answer for every question. Use any time remaining on the test timer to check spelling and instructions before submitting.')

    $outputDirectory = Split-Path -Parent ([IO.Path]::GetFullPath($OutputPath))
    if (-not (Test-Path -LiteralPath $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory | Out-Null
    }
    # Write a sibling temporary file, then replace only the explicit target after
    # successful synthesis. A failure leaves any existing recording untouched.
    $temporaryPath = Join-Path $outputDirectory ('practice-audio-' + [Guid]::NewGuid().ToString('N') + '.wav')
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
        16000,
        [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
        [System.Speech.AudioFormat.AudioChannel]::Mono
    )
    $synthesizer.SetOutputToWaveFile($temporaryPath, $format)
    $synthesizer.Speak($prompt)
    $synthesizer.SetOutputToNull()
    $generated = Get-Item -LiteralPath $temporaryPath
    if ($generated.Length -lt 1000000) { throw 'Generated recording is unexpectedly short.' }
    Move-Item -LiteralPath $temporaryPath -Destination $OutputPath -Force:$Force
    Write-Output "Generated original synthetic practice audio: $OutputPath"
    Write-Output "English voices: $primaryVoice / $secondaryVoice"
    Write-Output "Bytes: $($generated.Length)"
} finally {
    $synthesizer.Dispose()
}
