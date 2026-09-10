import subprocess
import os

ps_script = """
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = -1
$outputDir = "uploads/audio"
if (!(Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# Set 1: University Library Registration
$out1 = Join-Path $outputDir "ielts_listening_set1.wav"
$synth.SetOutputToWaveFile($out1)
$text1 = @"
SECTION 1. You will hear a student speaking to a university librarian to register for a library membership card.
First you have some time to look at questions 1 to 10.
Librarian: Good morning! Welcome to the University Central Library. How can I help you today?
Student: Good morning. I am a new international postgraduate student, and I would like to register for a library membership card.
Librarian: Certainly! I can set that up for you right away. May I take your full name and student identification number, please?
Student: Yes, my name is Alex Turner, and my student ID is ST-84920.
Librarian: Thank you, Alex. As an international student, you are entitled to borrow up to ten books at a time, for a maximum loan period of three weeks each.
Student: That sounds great. What about multimedia materials like audiobooks and DVDs?
Librarian: Multimedia materials can be borrowed for one week. The multimedia and computer suite is located on the second floor. Please note that the second floor is strictly a quiet study zone.
Student: Understood. And what are the regular opening hours on weekends?
Librarian: On Saturdays we are open from 9 AM to 8 PM, and on Sundays we close earlier, at 6 PM sharp.
Student: Are there charging points for laptops in the silent study halls?
Librarian: Yes, individual study desks on the first and second floors have dedicated charging sockets and complimentary high-speed Wi-Fi.
Student: Perfect. Thank you so much for your assistance!
Librarian: You are very welcome. Here is your student library card. Have a productive semester!
"@
$synth.Speak($text1)

# Set 2: New Student Campus Orientation Briefing
$out2 = Join-Path $outputDir "ielts_listening_set2.wav"
$synth.SetOutputToWaveFile($out2)
$text2 = @"
SECTION 1. You will hear an academic advisor conducting an orientation briefing for newly arrived international students.
First you have some time to look at questions 1 to 10.
Advisor: Welcome everyone to St. Andrew's University. My name is Dr. Margaret Evans, and this orientation session takes place in Auditorium Hall B.
Today we will cover your academic schedule, campus facilities, and health services.
First of all, all international students must complete their biometric residence permit verification at the Student Services Centre before Friday, September 15th.
Our central campus library is open 24 hours a day during exam periods. However, during normal term time, it operates from 8 AM until midnight.
Regarding health care, the university medical clinic is situated in Building 4, next to the sports complex. Consultations with campus doctors are entirely free of charge for registered full-time students.
If you require academic support or tutoring in essay writing and referencing, our Academic Skills Unit hosts drop-in workshops every Tuesday and Thursday afternoon at 2 PM.
Please remember that your student ID card grants you access to the gym, computer labs, and local public transport discounts.
Thank you for your attention, and we wish you the very best of success in your academic journey!
"@
$synth.Speak($text2)
$synth.Dispose()
Write-Host "Audio generation completed successfully!"
"""

with open("gen_audio.ps1", "w", encoding="utf-8") as f:
    f.write(ps_script)

res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "gen_audio.ps1"], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
if os.path.exists("uploads/audio/ielts_listening_set1.wav"):
    print("Set 1 size:", os.path.getsize("uploads/audio/ielts_listening_set1.wav"))
if os.path.exists("uploads/audio/ielts_listening_set2.wav"):
    print("Set 2 size:", os.path.getsize("uploads/audio/ielts_listening_set2.wav"))
if os.path.exists("gen_audio.ps1"):
    os.remove("gen_audio.ps1")
