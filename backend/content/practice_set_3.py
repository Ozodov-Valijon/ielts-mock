"""Original complete practice set, released under CC0-1.0.

The places, projects and participants described here are fictional. These texts
exercise academic English; their claims are part of the exercises, not citations.
Run this module to print the recording script as JSON (no database connection).
"""

import json

SET_NUMBER = 3
AUDIO_URL = "/api/v1/content/audio/practice-set-3.wav"
MANIFEST = {
    "set_number": SET_NUMBER,
    "title": "Communities, Learning and Change",
    "version": "1.0.0",
    "license": "CC0-1.0",
    "source": "Original fictional practice material created for this platform",
    "official": False,
    "disclaimer": "Independent IELTS-style practice, not an official IELTS test. Difficulty and band equivalence have not been externally calibrated.",
    "audio": "Locally generated synthetic English speech; not an authentic examination recording.",
    "counts": {"reading": 40, "listening": 40, "writing": 2, "speaking": 3},
}

READING_PASSAGES = [
    """PASSAGE 1: THE LIBRARY OF THINGS

A. When the council of the fictional town of Bellford surveyed its residents in 2018, it expected complaints about the price of books. Instead, many respondents described cupboards full of equipment that they rarely used. One resident owned a drill that had operated for fewer than ten minutes in a year. Another had bought a large cooking pot for a single family celebration. The survey did not establish how representative these examples were, but it suggested a question: could a public library lend useful objects as well as printed information? A working group of librarians and residents began exploring the idea.

B. The resulting Library of Things opened in a former ticket office beside Bellford's central bus station. The location was chosen for access by public transport, not because it offered the cheapest rent. A supermarket had offered a free room on the edge of town, but the group judged that visitors without cars would struggle to reach it. The first collection contained thirty items, bought with a council grant. Donations were welcomed later, after staff had developed safety checks. Electrical items had to pass inspection before joining the collection, even if their donors said that they were new.

C. Membership was available to adults living in Bellford. It cost twelve pounds per year, although residents receiving certain benefits could join without paying. Most objects could be borrowed for seven days. A few large items, including carpet cleaners, had a shorter loan period because demand was high and storage was limited. Borrowers booked through a website or by asking a librarian in person. The team deliberately preserved the second option: an online-only system would have excluded some of the people it hoped to serve. A deposit was required only for three especially expensive objects, rather than for everything.

D. During the first six months, staff expected power tools to dominate the loans. In fact, sewing machines were requested most often. Interviews suggested that many borrowers wanted to repair clothing but were unsure whether they would use a machine often enough to buy one. The library therefore added monthly repair workshops. These were run by volunteers who demonstrated a technique before participants tried it themselves. The workshops were not a free repair service: visitors remained responsible for their own belongings. Attendance was limited to eight people so that each participant could receive individual guidance.

E. The project also revealed costs that its founders had underestimated. Every returned item needed to be checked, cleaned and, where necessary, repaired. A cheap appliance that failed frequently could require more staff time than a durable but expensive alternative. The team began recording maintenance hours alongside purchase prices. This changed its buying decisions: easily replaceable parts became more important than attractive packaging. Items were removed from circulation when safety was uncertain. Staff never assumed that a familiar borrower could skip an inspection, and they did not charge borrowers for ordinary wear caused by appropriate use.

F. Measuring the environmental effect proved more difficult than counting loans. Borrowing a tent did not necessarily prevent someone from buying one; it might enable a camping trip that would otherwise never happen. The team asked borrowers what they would probably have done without the service, but recognised that such answers were uncertain. Its annual report therefore distinguished observed activity from estimated savings. The report counted 940 loans in the first year and described the project as promising, while avoiding a precise claim about carbon emissions. A neighbouring town has since requested advice, but Bellford has not yet opened a second branch. The group's next priority is making its existing collection more reliable, rather than making it larger.""",
    """PASSAGE 2: WHEN A RIVER RETURNS TO VIEW

A. Beneath the centre of the fictional city of Eastmere, the Alder River once travelled through a concrete tunnel. The river had been covered during an earlier period of road construction, when engineers regarded water mainly as a problem to move away quickly. Decades later, a proposal to uncover a section of the river attracted support from ecologists and local shopkeepers. Their reasons differed: the ecologists wanted a connected habitat, while traders hoped for a pleasant walking route. Neither group could promise that the project would eliminate flooding throughout the city, although some early publicity gave that impression.

B. Before construction, researchers spent eighteen months studying the catchment. They mapped how rainwater reached the river from roofs, streets and parks. The survey showed that a narrow channel near the railway bridge restricted flow during heavy rain. Simply uncovering the central section would not remove that restriction. Engineers therefore combined the river work with upstream storage areas that could temporarily hold storm water. The storage areas normally functioned as playing fields. Warning signs and gates allowed the fields to close when water levels rose. This arrangement required coordination between drainage staff and the department responsible for recreation.

C. Designers faced an awkward choice about the river's edges. Straight concrete banks would have occupied little space and been simple to inspect. Sloping banks planted with reeds would require more land but offer shelter for wildlife and reduce the speed of water near the edge. The final design used both approaches in different locations. Near an old warehouse, where space was restricted, a wall was retained. Elsewhere, shallow shelves created a gradual transition between land and water. The designers rejected the idea that a successful urban river must look entirely untouched by people. Their objective was useful ecological function within a working city.

D. Residents were invited to comment on a temporary demonstration area before the final layout was approved. Some asked for bright lighting along the entire path. Wildlife specialists warned that constant light could disturb animals moving beside the river at night. The city settled on low lamps directed towards the walking surface and left one short habitat corridor unlit. This compromise did not satisfy everyone. Nevertheless, publishing the reasons behind the decision helped residents understand which concerns had been considered. The consultation also led to more benches, several of which had armrests requested by older visitors.

E. After the river was uncovered, volunteers measured water temperature and recorded visible wildlife each month. Professional researchers checked a sample of their observations. This was not because volunteers were assumed to be careless, but because identifying some species accurately required specialist knowledge. The monitoring scheme used the same recording points each time and retained records of days when nothing was seen. Without those empty observations, the data might have exaggerated improvement. Two years after opening, the number of recorded plant species had increased, but the researchers said that longer observation was needed before attributing every change to the new channel.

F. The financial results were equally mixed. Cafes close to the river reported more customers, while shops on a parallel street noticed little change. Rents near the new path began to rise. For property owners this could be welcome; for small businesses it could create pressure. The council responded by offering longer leases in the commercial buildings it owned, though it could not control every private landlord. Project supporters had initially treated economic growth as an uncomplicated benefit. The experience showed that the distribution of benefits mattered as much as their total size.

G. Eastmere's lesson was not that every buried river should be uncovered. Some tunnels run below buildings or carry polluted water that must first be treated. A project can also fail if there is money for construction but none for later maintenance. At Eastmere, an annual budget pays for removing litter, inspecting banks and managing vegetation. The river's return to view changed a neglected route into a valued public place, but it did so through continuing work. The city's planners now describe restoration as an ongoing relationship with water, rather than a single engineering event.""",
    """PASSAGE 3: THE VALUE OF A USEFUL MISTAKE

A. In many classrooms, a correct answer is taken as evidence that learning has occurred. It is easy to record, compare and reward. Yet a learner may produce the right answer by copying a pattern without understanding why it works. Conversely, an incorrect answer can reveal a productive attempt to connect ideas. The fictional Northbridge Learning Study explored this distinction by examining how adults learned unfamiliar rules. Its researchers did not argue that accuracy was unimportant. They asked which kinds of practice helped learners retain knowledge and apply it when a problem looked different from the examples used in teaching.

B. Participants learned to classify invented symbols using a set of rules. One group received a worked example before each attempt. Another group attempted a problem first, then saw an explanation that addressed the likely source of error. Both groups spent the same total time on the material and received the same number of explanations. During practice, the example-first group answered more questions correctly. A week later, however, the attempt-first group performed better on problems that combined the rules in new ways. The study separated immediate performance from delayed transfer, rather than treating all test scores as interchangeable.

C. This result did not mean that any unsuccessful attempt would help. In a follow-up exercise, participants were given either a manageable problem or one that depended on several concepts they had never encountered. The very difficult task often produced random guesses and frustration. Its participants gained little from a later explanation because they had no useful framework into which they could fit it. Researchers described the productive task as challenging but reachable. Teachers therefore needed to consider what learners already knew, instead of increasing difficulty whenever a class seemed comfortable.

D. Feedback was another crucial condition. A simple red cross told a learner that an answer was wrong but did not explain the reasoning behind the error. More useful feedback compared the learner's approach with the relevant principle and then offered a fresh opportunity to apply it. Timing also mattered. Leaving every error unaddressed until the end of a long course could allow misconceptions to become established. On the other hand, interrupting a learner before any meaningful attempt removed the very activity the study was examining. The researchers favoured feedback after a short, genuine attempt, while acknowledging that the appropriate interval depended on the task.

E. Learners' beliefs complicated the picture. Several participants preferred the example-first method because it felt smoother. They interpreted fluent practice as lasting learning, even when their later performance suggested otherwise. After seeing their delayed test results, some revised their preferences, but others continued to favour the easier-feeling approach. A questionnaire indicated that anxiety about public mistakes also affected willingness to attempt an answer. The study did not measure whether these preferences changed over several years. Its authors cautioned against claiming that a brief experiment had transformed a person's general attitude to education.

F. Classroom application requires attention to social conditions as well as task design. If errors attract ridicule, students may protect themselves by remaining silent. One participating teacher used anonymous responses to discuss common misunderstandings before inviting individuals to explain their reasoning. Another allowed students to revise an answer and describe why they had changed it. In both cases the aim was to make reasoning visible without treating uncertainty as a personal failure. Neither teacher removed standards of accuracy. They made the route towards a correct answer part of what was assessed.

G. There are limits to the approach. A novice learning a procedure with an immediate physical danger may need a clear demonstration before attempting it. Findings from symbol puzzles cannot automatically justify trial and error in every workplace. The Northbridge team also noted that its participants were volunteers and that the tasks lasted less than an hour. Larger studies in ordinary classrooms would be needed to establish how widely the results apply. Even with these qualifications, the research offered a useful distinction: practice that feels successful now may differ from practice that builds understanding for later. The teacher's challenge is to make mistakes informative, bounded and followed by an opportunity to improve.""",
]

# Every listening part is one coherent recording. Speaker labels aid the local
# speech generator but are not read aloud. Transcripts never go into question API
# payloads: they are authoring material and an answer-key validation source.
LISTENING_PARTS = [
    {
        "part": 1,
        "title": "Booking a community pottery course",
        "intro": "Part one. You will hear a conversation between a caller and a receptionist at a community arts centre. Look at questions one to ten. Complete each note with no more than two words and or a number.",
        "turns": [
            ("caller", "Hello. I saw a notice about your beginners' pottery course. I have never used a pottery wheel before, so I wanted to check whether I need any experience."),
            ("receptionist", "Not at all. The first course is designed for complete beginners. We show you how to prepare clay and make simple bowls by hand before introducing the wheel. Would you like to book a place?"),
            ("caller", "Yes, please. My surname is Benton. That's B, E, N, T, O, N. My first name is Maya."),
            ("receptionist", "Thank you, Maya. We used to run the beginners' group on Tuesday, but the tutor now teaches at a college that evening. The next course will be on Thursday. There is also a Saturday group, but that is for people who have already completed this course."),
            ("caller", "Thursday is fine. I work until five, so I should have plenty of time to get there. What time does the lesson begin?"),
            ("receptionist", "At six thirty in the evening. You can arrive fifteen minutes early if you want to look around, but the teaching starts at six thirty. The lesson lasts two hours, with a short break halfway through."),
            ("caller", "And how many weeks does the course run for? I will be away later in the summer."),
            ("receptionist", "It runs for six weeks. We tried an eight-week course last year, but many people found that difficult to fit around holidays. Six weeks gives beginners enough time to finish a small collection of work."),
            ("caller", "That sounds ideal. I saw a price of ninety pounds on an old leaflet. Is that still correct?"),
            ("receptionist", "The price is now ninety-six pounds for the whole course. Clay and firing are included. You only pay extra if you choose to make a particularly large piece, which is unusual in the beginners' group."),
            ("caller", "Where exactly are the classes held? I know the main building, next to the post office."),
            ("receptionist", "They are in the garden studio. Walk through the main entrance and continue past reception into the courtyard. You will see a separate low building with green doors. That is the garden studio; it is much easier to clean than the upstairs classrooms."),
            ("caller", "Should I bring anything with me? I can borrow some tools from a friend if necessary."),
            ("receptionist", "We provide all the tools. Please bring an apron, though. Clay can get onto your clothes, and we do not have enough spare aprons for everyone. Comfortable closed shoes are also sensible."),
            ("caller", "I usually cycle into town. Is there somewhere secure to leave my bicycle?"),
            ("receptionist", "Yes, the covered bicycle rack is beside the cafe. There are older racks near the road, but those are not under cover. The one beside the cafe is the best place in wet weather."),
            ("caller", "One last question. If my work schedule changes, when would I need to cancel?"),
            ("receptionist", "For a full refund, cancel at least four days before the first class. After that we can only refund you if someone on the waiting list takes your place. I will include those details in your confirmation."),
            ("caller", "Lovely. Will the confirmation arrive by post, or should I come in to collect it?"),
            ("receptionist", "Neither is necessary. I will send the booking confirmation by email this afternoon, together with directions and the payment link. Please check the spelling of your name when it arrives."),
        ],
    },
    {
        "part": 2,
        "title": "Welcome to Willow Nature Reserve",
        "intro": "Part two. You will hear a reserve officer welcoming visitors. Look at questions eleven to twenty. For questions eleven to fifteen choose one answer. For questions sixteen to twenty write no more than two words.",
        "turns": [
            ("officer", "Good morning, everyone, and welcome to Willow Nature Reserve. Before you set off on the paths, I would like to give you a few practical details. People sometimes assume this land has always been a nature reserve because the trees look well established. In fact, much of it was a gravel quarry. When extraction ended, the pits filled with water and birds began to use the site. The reserve was created later, after local residents campaigned to protect it."),
            ("officer", "You will notice a choice of three marked routes on your map. The red route climbs the hill and includes several steps. The green route is flat but has a narrow, uneven surface beside the old wall. Visitors using wheelchairs or pushing buggies should take the blue route. It has a wide, firm surface and accessible seating points. The blue route is a little longer than the green one, so do not choose purely on distance."),
            ("officer", "Please also note that the eastern path is closed this month. It has not been damaged by flooding, and we are not building new facilities there. The closure protects birds that are nesting close to the path. We ask visitors to respect the barrier even if they cannot see any birds. Disturbance is most harmful when adults are repeatedly forced away from a nest."),
            ("officer", "Many of you have asked about equipment. Binoculars can be borrowed from reception free of charge. We will ask for your name and contact number, and we need the binoculars back before you leave. There is no deposit, although you are responsible for looking after them. Printed bird guides are for sale, but you can also use the identification panels around the lake."),
            ("officer", "If you would like to join today's guided walk, meet at the old water tower. That is the round brick building visible beyond the lake. Last week's walk began at reception, but today's guide is starting at the tower because the group will explore the northern woodland. There is no need to book for this short walk; simply arrive a few minutes before the time shown on the board."),
            ("officer", "Let me point out a few facilities before we finish. Food can attract animals onto the paths, so please eat only in the picnic meadow. You are welcome to bring your own lunch. The cafe sells drinks and sandwiches, but you do not have to buy anything there to use the picnic meadow. We have placed bins at its entrance and ask you to take large amounts of rubbish home."),
            ("officer", "Dogs are allowed in the reserve, provided they remain on a lead at all times. This includes the woodland, even if you believe that your dog will stay close to you. Some animals shelter in the undergrowth and can be disturbed before an owner notices them. Please leave any extendable lead at its shortest practical length near other visitors."),
            ("officer", "The observation hide has narrow viewing windows and is a good place to watch the lake quietly. When you open a window, please maintain silence so that other visitors can listen as well as look. Conversations carry across the water, and sudden sounds may frighten birds away. Children are very welcome, but an adult should accompany them in the hide."),
            ("officer", "For anyone who would like to help us regularly, new volunteers receive their first training in the visitor centre. You do not need specialist wildlife knowledge. Some volunteers repair signs, some welcome visitors, and others help record what is seen. Finally, lost property is kept at reception. If you find a glove, a phone or any other item, please take it there rather than leaving it on a bench. Enjoy your visit, and ask us if you need help."),
        ],
    },
    {
        "part": 3,
        "title": "Planning a student research project",
        "intro": "Part three. You will hear two students discussing a research project with their tutor. Look at questions twenty-one to thirty. Choose one answer for each question.",
        "turns": [
            ("tutor", "You sent me your outline for the project on evening study spaces. Before we discuss methods, explain why you chose that topic."),
            ("student1", "We initially wanted to study coffee consumption, but another group had already selected it. Then we noticed that some students arrive late at the library because they commute. We want to understand barriers faced by commuting students who need somewhere to study in the evening. It is about access, rather than simply which room is most popular."),
            ("tutor", "That is a useful focus. Your draft questionnaire asks whether facilities are satisfactory. What did you learn from trying it with a few classmates?"),
            ("student2", "People interpreted facilities differently. One thought we meant desks and lighting; another included buses and food shops. We need to rewrite the questions because the wording is ambiguous. The pilot was useful even though we will not count those responses in the main results."),
            ("tutor", "Your outline suggests interviewing only people already inside the library at nine o'clock. Who would that leave out?"),
            ("student1", "The very students who cannot get there. So we plan to recruit through evening classes as well. Those classes include commuters, and we can invite people who do not currently use the library. We will still speak to library users, but they will no longer be our only source."),
            ("tutor", "Good. Be careful about asking for personal information you do not actually need. How will you protect participants' identities?"),
            ("student2", "We will assign participant codes and store contact details separately from the interview notes. Names will not appear in the report. We thought about making video recordings, but audio and written notes are sufficient for our questions. Participants can choose not to be recorded."),
            ("tutor", "And how large will the interview sample be? Remember that you must transcribe and analyse it."),
            ("student1", "We first proposed forty interviews. After transcribing a trial interview, we realised that would be too much. We have reduced the sample to twelve to allow detailed analysis within the available time. We can describe the limits of a small sample rather than pretend it represents everyone."),
            ("tutor", "Your observation plan mentions two library rooms. Why those particular rooms?"),
            ("student2", "Their seating capacity is the same, but one allows conversation and the other is quiet. That gives us a reasonably fair comparison of different study environments. Comparing a tiny room with the main hall would make occupancy figures difficult to interpret."),
            ("tutor", "I agree, provided you observe them at comparable times. Is there anything in the academic calendar that could distort your results?"),
            ("student1", "Examinations. We will avoid examination week because unusually high demand could make normal patterns disappear. We will visit on the same evenings in two ordinary teaching weeks instead. If there is a special event on one visit, we will record it."),
            ("tutor", "How will you bring the observations and interviews together?"),
            ("student2", "We will organise the interviews into themes and compare those themes with the observed patterns. For example, if people mention noise, we can examine the occupancy of the quiet room. We know that occupancy alone cannot tell us why someone chose a seat, so we need both sources."),
            ("tutor", "That distinction will strengthen the report. When you discuss transport, do you have a reliable source for the last-bus times?"),
            ("student1", "We copied them from a two-year-old student guide. We should replace that with the current transport timetable before we draw conclusions. It would be embarrassing to recommend a later bus if the service had already changed."),
            ("tutor", "Exactly. What will you bring to our next meeting? I do not need a complete literature review yet."),
            ("student2", "We will bring the revised questionnaire and the consent form. Once you have checked those, we can recruit participants. We will also include a short explanation of how someone can withdraw from the project."),
        ],
    },
    {
        "part": 4,
        "title": "How seed libraries preserve diversity",
        "intro": "Part four. You will hear a lecture about community seed libraries. Look at questions thirty-one to forty. Complete the notes with no more than two words for each answer.",
        "turns": [
            ("lecturer", "Today we will consider community seed libraries. Despite the name, these organisations do not usually expect someone to return the exact seeds they borrowed. Participants grow plants and may return a share of newly produced seed. The purpose is to keep useful varieties in circulation while allowing people to learn from one another. A seed library can occupy a cupboard in a public library or a small room at a community garden. Its success depends more on clear procedures than on an impressive building."),
            ("lecturer", "One practical aim is preserving local varieties. These are plants that gardeners in a particular area have maintained over time. A commercial supplier may concentrate on a few widely marketable crops, while a local grower values a bean that ripens well in a short season. Keeping such varieties available does not prove that they will outperform every commercial alternative. It gives growers choices and preserves knowledge that might otherwise disappear when an experienced gardener stops growing."),
            ("lecturer", "The first requirement is good information. Each packet needs a clear label giving the crop, the variety and the harvest date. The harvest date is especially useful because the likelihood of germination generally changes as seeds age. A handwritten name such as Grandmother's bean can be meaningful within one family but confusing to everyone else. Libraries therefore record who supplied the seed and any known history in a separate register, without inventing a formal variety name."),
            ("lecturer", "Next comes storage. For many ordinary garden crops, seeds should be thoroughly dried before they are packed. Staff must then control moisture, since damp conditions can encourage mould and shorten storage life. A cool cupboard is helpful, but cooling alone cannot compensate for wet seeds. Clear containers make inspection easy; they should not sit in direct sunlight. The appropriate method differs between plant species, so a general instruction should never replace crop-specific guidance."),
            ("lecturer", "To estimate whether a batch is still usable, volunteers can test a small sample on damp paper. They count how many seeds produce normal seedlings over a suitable period and record the result. This is a practical germination check, not a guarantee that every seed planted outdoors will survive. Soil temperature, watering and pests also affect growth. It is better to communicate a modest, measured result than to print a promise that the library cannot support."),
            ("lecturer", "Beginners need careful crop selection. The community programme in our example starts with beans because their seeds are large and easy to handle. Participants can observe the plants, allow selected pods to dry and collect the seed without specialist equipment. The programme introduces more complicated crops later. Enthusiasm alone does not make every crop suitable for a first attempt, and a failed first season can discourage someone who would otherwise become a regular contributor."),
            ("lecturer", "Another challenge is keeping varieties distinct. Some crops readily exchange pollen with nearby plants of the same species. Where this matters, growers may use distance to reduce unwanted crossing. Other techniques include barriers or growing varieties at different times, but the method must suit the crop. A library should explain these limits rather than assume that a familiar-looking fruit will always produce identical offspring. Records of growing conditions help future users interpret unexpected results."),
            ("lecturer", "An exchange also needs a fair return policy. Plants can fail because of weather or pests even when a participant has followed the instructions. In our example, the library asks growers to report a failure but imposes no penalty. Making people hide unsuccessful attempts would damage the information on which the project depends. Experienced contributors are encouraged to supply a little extra, and new participants may help with sorting or labelling before returning any seed."),
            ("lecturer", "The educational programme includes workshops led by experienced gardeners. These sessions allow participants to compare real seed heads, practise cleaning techniques and ask questions about their own crops. The library also records flowering times, since those observations can help explain why a variety succeeds in one place and struggles in another. A single unusual season is not enough to establish a trend, but consistent records become valuable over time."),
            ("lecturer", "Finally, success should not be judged only by the number of packets distributed. If every packet contains the same easy crop, activity may be high while the collection becomes less varied. The coordinators therefore track diversity as well as participation. They ask which varieties remain in circulation, which have been lost and where additional support is needed. A seed library is both a collection and a network of people. Maintaining either part without the other is unlikely to produce a durable result."),
        ],
    },
]


def _question(section, number, text, answer, *, options=None, passage=None):
    return {
        "section": section,
        "set_number": SET_NUMBER,
        "order_num": number,
        "question_type": "multiple_choice" if options else "fill_blank",
        "question_text": text,
        "passage_text": passage,
        "audio_url": AUDIO_URL if section == "listening" else None,
        "options": options,
        "correct_answer": answer,
    }


QUESTIONS = []


def _reading(number, passage, text, answer, options=None):
    QUESTIONS.append(_question("reading", number, text, answer, options=options, passage=READING_PASSAGES[passage - 1]))


def _tf(number, passage, text, answer):
    _reading(number, passage, "True / False / Not Given: " + text, answer, ["True", "False", "Not Given"])
    QUESTIONS[-1]["question_type"] = "true_false"


def _fill(number, passage, text, answer):
    _reading(number, passage, "Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage. " + text, answer)


_tf(1, 1, "The council originally expected residents to complain about book prices.", "True")
_tf(2, 1, "The central bus station site offered the lowest rent.", "False")
_tf(3, 1, "The first collection was purchased with money from the council.", "True")
_tf(4, 1, "More than half of Bellford's adults joined during the first year.", "Not Given")
_tf(5, 1, "Every object required a deposit.", "False")
_fill(6, 1, "The standard annual membership fee was _____ pounds.", "twelve")
_fill(7, 1, "Most objects could be kept for _____ days.", "seven")
_fill(8, 1, "The most frequently requested items in the first six months were _____.", "sewing machines")
_fill(9, 1, "Each repair workshop had a maximum of _____ participants.", "eight")
_fill(10, 1, "The team recorded _____ as well as the purchase price of an item.", "maintenance hours")
_reading(11, 1, "Why did the library continue accepting bookings in person?", "To include people who could not use online booking", ["To include people who could not use online booking", "To collect a deposit on every loan", "To avoid keeping any digital records", "To limit the number of new members"])
_reading(12, 1, "What uncertainty affected the environmental assessment?", "A loan did not always replace a purchase", ["The number of loans had not been recorded", "A loan did not always replace a purchase", "The council refused to publish a report", "Borrowers were prohibited from answering surveys"])
_reading(13, 1, "What is the group's next priority?", "Improving the reliability of its existing collection", ["Opening several branches immediately", "Replacing volunteers with paid tutors", "Improving the reliability of its existing collection", "Restricting all loans to power tools"])

_reading(14, 2, "Why did ecologists support uncovering the Alder River?", "It could connect wildlife habitat", ["It would remove every flood risk in Eastmere", "It could connect wildlife habitat", "It would provide free commercial property", "It would eliminate maintenance costs"])
_fill(15, 2, "Researchers studied the catchment for _____ months before construction.", "eighteen")
_fill(16, 2, "The flow restriction was near the _____.", "railway bridge")
_fill(17, 2, "The upstream storage areas usually served as _____.", "playing fields")
_tf(18, 2, "The final design used the same type of bank everywhere.", "False")
_tf(19, 2, "A wall was retained near the old warehouse because space was limited.", "True")
_tf(20, 2, "Every resident approved the final lighting arrangement.", "False")
_tf(21, 2, "The new benches were manufactured within Eastmere.", "Not Given")
_fill(22, 2, "Some older visitors requested benches fitted with _____.", "armrests")
_reading(23, 2, "Why were observations with no wildlife sightings retained?", "Omitting them could exaggerate improvement", ["They showed that the volunteers needed payment", "They reduced the need for fixed observation points", "Omitting them could exaggerate improvement", "Only empty observations were scientifically valid"])
_reading(24, 2, "How did the council help businesses in buildings it owned?", "It offered longer leases", ["It banned all rent increases across the city", "It offered longer leases", "It moved every shop to the river", "It paid for private landlords to leave"])
_reading(25, 2, "What does the author emphasise about economic benefits?", "Who receives the benefits matters", ["Every business benefits equally", "Benefits can only be measured through rents", "Benefits always exceed maintenance costs", "Who receives the benefits matters"])
_fill(26, 2, "An annual budget covers litter removal, bank inspections and managing _____.", "vegetation")

_reading(27, 3, "What distinction did the Northbridge study investigate?", "Immediate correct performance versus lasting understanding", ["Adults' knowledge versus children's knowledge", "Immediate correct performance versus lasting understanding", "Written answers versus spoken answers", "Learning alone versus learning with friends"])
_tf(28, 3, "Both original groups spent the same total time learning the material.", "True")
_tf(29, 3, "The attempt-first group produced more correct answers during initial practice.", "False")
_tf(30, 3, "Participants were tested again one week after practice.", "True")
_tf(31, 3, "Most volunteers had previously studied symbol classification at university.", "Not Given")
_fill(32, 3, "The very difficult follow-up task frequently led to _____ and frustration.", "random guesses")
_reading(33, 3, "Why did learners gain little from the extremely difficult task?", "They lacked a useful framework for the explanation", ["The researchers refused to provide feedback", "They lacked a useful framework for the explanation", "They were given too many worked examples", "They had already mastered all the concepts"])
_reading(34, 3, "What kind of feedback did the researchers favour?", "An explanation after a short genuine attempt", ["A red cross without any explanation", "An explanation before every possible attempt", "An explanation after a short genuine attempt", "No correction until the end of a long course"])
_tf(35, 3, "Every participant preferred the attempt-first method after seeing the delayed results.", "False")
_tf(36, 3, "The study established whether preferences persisted over several years.", "False")
_fill(37, 3, "One teacher discussed misunderstandings using _____.", "anonymous responses")
_reading(38, 3, "How did the two teachers treat accuracy?", "They retained it while also assessing reasoning", ["They removed it from assessment entirely", "They only assessed the first answer given", "They considered it less important than public ranking", "They retained it while also assessing reasoning"])
_reading(39, 3, "Which situation does the passage identify as a limit to attempt-first practice?", "A procedure with immediate physical danger", ["A puzzle using invented symbols", "A task with an opportunity to revise", "A procedure with immediate physical danger", "An anonymous classroom response"])
_reading(40, 3, "Which statement best expresses the passage's main conclusion?", "Mistakes help when tasks and feedback make them informative", ["The easiest practice always creates the best learning", "Teachers should allow every misconception to remain", "Mistakes help when tasks and feedback make them informative", "One short study proves the best method for every subject"])


def _listening(number, text, answer, options=None):
    if options is None:
        text = "Write NO MORE THAN TWO WORDS AND/OR A NUMBER. " + text
    QUESTIONS.append(_question("listening", number, text, answer, options=options))


_listening(1, "Booking form: Maya's surname is _____.", "Benton")
_listening(2, "The new beginners' class will take place on _____.", "Thursday")
_listening(3, "The lesson begins at _____ p.m. Write the time in digits, for example 7:15.", "6:30")
_listening(4, "The course lasts _____ weeks. Write a number in digits.", "6")
_listening(5, "The total course fee is £_____. Write a number in digits.", "96")
_listening(6, "Classes take place in the _____.", "garden studio")
_listening(7, "Participants should bring an _____.", "apron")
_listening(8, "The covered bicycle rack is beside the _____.", "cafe")
_listening(9, "A full refund requires cancellation at least _____ days before the first class. Write a number in digits.", "4")
_listening(10, "Booking confirmation will be sent by _____.", "email")
_listening(11, "What was the reserve used for before it became a wildlife site?", "A gravel quarry", ["A commercial orchard", "A gravel quarry", "A military airfield", "A railway depot"])
_listening(12, "Which route is recommended for wheelchair users?", "The blue route", ["The red route", "The green route", "The blue route", "The eastern path"])
_listening(13, "Why is the eastern path closed?", "To protect nesting birds", ["To repair damage caused by flooding", "To construct a new cafe", "To protect nesting birds", "To remove unsafe trees"])
_listening(14, "What does the officer say about binoculars?", "They can be borrowed without a fee or deposit", ["Only members can borrow them", "They can be borrowed without a fee or deposit", "They must be booked a week ahead", "They are sold with the printed bird guide"])
_listening(15, "Where will today's guided walk begin?", "At the old water tower", ["At reception", "At the cafe", "At the railway gate", "At the old water tower"])
_listening(16, "Visitors should eat in the _____.", "picnic meadow")
_listening(17, "Dogs must always remain on a _____.", "lead")
_listening(18, "Visitors opening the hide windows are asked to maintain _____.", "silence")
_listening(19, "New volunteers have their first training in the _____.", "visitor centre")
_listening(20, "Lost property should be taken to _____.", "reception")
_listening(21, "What is the students' main research aim?", "To understand barriers faced by evening commuters", ["To compare coffee prices on campus", "To rank the popularity of every room", "To understand barriers faced by evening commuters", "To persuade all students to study at home"])
_listening(22, "What did the pilot questionnaire reveal?", "Some wording was ambiguous", ["The topic had already been fully researched", "Some wording was ambiguous", "Students refused to answer any questions", "The questionnaire needed more technical vocabulary"])
_listening(23, "Why will the students recruit through evening classes?", "To reach people who do not currently use the library", ["To avoid requesting consent", "To interview only their close friends", "To reach people who do not currently use the library", "To replace all library observations"])
_listening(24, "How will participants' identities be protected?", "Codes will replace names in research notes", ["Video recordings will be posted publicly", "Names will appear only in the final report", "Contact details will be printed with answers", "Codes will replace names in research notes"])
_listening(25, "Why was the interview sample reduced?", "To allow detailed analysis in the available time", ["Only twelve students use the library", "The tutor banned larger samples", "To allow detailed analysis in the available time", "The researchers had lost the original notes"])
_listening(26, "Why were the two observation rooms selected?", "They have equal capacity but different noise rules", ["They are the oldest rooms on campus", "They have equal capacity but different noise rules", "They always contain the same students", "They are both closed during the evening"])
_listening(27, "Why will examination week be avoided?", "Demand then may not reflect normal use", ["The library does not open that week", "The transport timetable is unpublished", "Students are prohibited from interviews", "Demand then may not reflect normal use"])
_listening(28, "How will the two kinds of data be combined?", "Interview themes will be compared with observation patterns", ["Interview themes will be compared with observation patterns", "Interview notes will replace all occupancy records", "Only numerical answers will be retained", "The students will average all spoken comments"])
_listening(29, "What source needs to be updated?", "The transport timetable", ["The library building plan", "The room seating chart", "The transport timetable", "The examination results"])
_listening(30, "What will the students bring to their next meeting?", "The revised questionnaire and consent form", ["A finished literature review", "The revised questionnaire and consent form", "Recordings of forty interviews", "The complete final report"])
_listening(31, "One aim of seed libraries is to preserve _____.", "local varieties")
_listening(32, "Packet labels should include the crop, variety and _____.", "harvest date")
_listening(33, "During storage, staff need to control _____ to prevent damp conditions.", "moisture")
_listening(34, "A germination check can be carried out on _____.", "damp paper")
_listening(35, "In the example programme, beginners first grow _____.", "beans")
_listening(36, "Growers may use _____ to reduce unwanted crossing between varieties.", "distance")
_listening(37, "When crops fail, the example library imposes no _____.", "penalty")
_listening(38, "Practical workshops are led by _____.", "experienced gardeners")
_listening(39, "The library records _____ to help explain differences in performance.", "flowering times")
_listening(40, "Coordinators measure _____ as well as participation.", "diversity")

QUESTIONS.extend([
    _question("writing", 1,
        "Academic Writing Task 1. Spend about 20 minutes and write at least 150 words. "
        "The table shows the percentage of journeys to a fictional university made by five transport modes in 2010 and 2025. "
        "Summarise the information by selecting and reporting the main features, and make comparisons where relevant. "
        "Do not give your opinion.\n\nTransport mode | 2010 | 2025\nCar | 48% | 30%\nBus | 25% | 32%\nBicycle | 10% | 20%\nWalking | 12% | 15%\nOther | 5% | 3%\nTotal | 100% | 100%",
        "", passage="Transport mode | 2010 | 2025\nCar | 48% | 30%\nBus | 25% | 32%\nBicycle | 10% | 20%\nWalking | 12% | 15%\nOther | 5% | 3%\nTotal | 100% | 100%"),
    _question("writing", 2,
        "Academic Writing Task 2. Spend about 40 minutes and write at least 250 words. "
        "Some people believe public libraries should spend most of their budget on books, while others think they should provide a wider range of services such as equipment lending and practical classes. "
        "Discuss both views and give your own opinion. Give reasons for your answer and include relevant examples from your own knowledge or experience.", ""),
    _question("speaking", 1,
        "Part 1: Home and learning (about 4-5 minutes). Answer each question naturally. "
        "1. What do you like about the area where you live? 2. Is there a place nearby where you like to spend time? "
        "3. What practical skill would you like to learn? 4. Do you prefer learning alone or with other people? Why? "
        "5. How has the way you study changed in recent years?", ""),
    _question("speaking", 2,
        "Part 2: Long turn. Prepare for 1 minute, then speak for 1-2 minutes. "
        "Describe a time when you learned something useful from another person. "
        "You should say: who the person was; what you learned; how the person helped you; "
        "and explain why this learning experience was useful to you.", ""),
    _question("speaking", 3,
        "Part 3: Discussion (about 4-5 minutes). Develop your answers with reasons and examples. "
        "1. What qualities make someone a good teacher? 2. How can schools help students learn from mistakes? "
        "3. Should employers provide time for staff to learn new skills? 4. What can younger and older people learn from each other? "
        "5. How might community learning spaces change in the future?", ""),
])

for _item in QUESTIONS:
    if _item["section"] == "writing":
        _item["question_type"] = "essay"
    elif _item["section"] == "speaking":
        _item["question_type"] = "speaking"


if __name__ == "__main__":
    print(json.dumps({"manifest": MANIFEST, "parts": LISTENING_PARTS}, ensure_ascii=True))
