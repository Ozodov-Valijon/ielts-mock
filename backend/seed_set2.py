import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.question import TestQuestion

def seed_set2():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        existing = db.query(TestQuestion).filter(TestQuestion.set_number == 2).count()
        if existing > 0:
            print(f"Set 2 savollari allaqachon mavjud ({existing} ta). Qayta kiritilmadi.")
            return

        print("Set 2 savollarini kiritish boshlandi...")

        # Reading Passage
        passage = """THE EVOLUTION OF RENEWABLE ENERGY TECHNOLOGIES

The transition towards sustainable energy systems has emerged as one of the defining imperatives of the twenty-first century. As international treaties mandate substantial reductions in greenhouse gas emissions, the reliance on traditional fossil fuel infrastructures is progressively diminishing in favour of renewable alternatives such as solar, wind, and hydroelectric energy.

Modern commercial wind energy trace its direct technological roots to the 1973 global oil crisis, which spurred Western governments to invest heavily in alternative energy research. Early turbine models suffered from mechanical instability and low aerodynamic conversion efficiencies. However, modern multi-megawatt turbines installed in offshore wind farms now generate gigawatts of clean electricity, using high-voltage submarine transmission cables to transport power directly to continental power grids.

Parallel to wind developments, solar photovoltaic (PV) technology has achieved dramatic cost reductions and efficiency gains. Over the last two decades, advances in silicon wafer manufacturing and perovskite cell layering have reduced levelized generation costs by over eighty percent, rendering solar power cheaper than newly built coal or gas power plants in numerous regions. Hydroelectric power, meanwhile, remains the oldest and largest source of renewable mechanical electricity globally, providing grid stability through pumped storage systems that balance the intermittency of wind and solar sources."""

        reading_questions = [
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=1,
                question_type="multiple_choice",
                passage_text=passage,
                question_text="According to the passage, which historical event initially catalyzed major Western government investment into modern wind turbine development?",
                options=["The 1973 oil crisis", "The Industrial Revolution", "The Paris Climate Agreement", "The invention of photovoltaic silicon cells"],
                correct_answer="The 1973 oil crisis / 1973 oil crisis"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=2,
                question_type="true_false",
                passage_text=passage,
                question_text="The cost of generating electricity from solar photovoltaic systems has decreased substantially over the last twenty years.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=3,
                question_type="multiple_choice",
                passage_text=passage,
                question_text="What primary role does hydroelectric power serve in modern renewable grids as described in the text?",
                options=["Providing grid stability and balancing intermittent energy sources", "Eliminating the need for solar panels", "Replacing all submarine high-voltage cables", "Reducing silicon wafer costs"],
                correct_answer="Providing grid stability and balancing intermittent energy sources"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=4,
                question_type="true_false",
                passage_text=passage,
                question_text="Early commercial wind turbines manufactured in the 1970s operated with the highest known aerodynamic conversion efficiencies.",
                options=["True", "False", "Not Given"],
                correct_answer="False"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=5,
                question_type="fill_blank",
                passage_text=passage,
                question_text="Complete the sentence: Offshore wind farms transport generated clean electricity to mainland power grids using high-voltage submarine ______ cables.",
                options=None,
                correct_answer="transmission / submarine transmission / power"
            )
        ]

        # Listening
        listening_questions = [
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=1,
                question_type="multiple_choice",
                audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                question_text="Where will the general academic orientation briefing for new international students take place?",
                options=["Auditorium Hall B", "Central Science Laboratory", "Student Union Dining Hall", "Campus Sports Complex"],
                correct_answer="Auditorium Hall B"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=2,
                question_type="true_false",
                audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                question_text="All incoming postgraduate students are strictly required to finalise their elective course registrations before Wednesday afternoon.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=3,
                question_type="multiple_choice",
                audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                question_text="Which primary identity document must students bring to receive their student smart campus card?",
                options=["Valid original passport", "High school diploma", "Driving license", "Bank statement"],
                correct_answer="Valid original passport / Valid passport / passport"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=4,
                question_type="fill_blank",
                audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                question_text="The international student careers and CV advisory office is situated on the ______ floor of the student services building.",
                options=None,
                correct_answer="3rd / third / 3"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=5,
                question_type="true_false",
                audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                question_text="Complimentary university shuttle buses run between the main library and campus accommodation every fifteen minutes.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            )
        ]

        # Writing
        writing_questions = [
            TestQuestion(
                section="writing",
                set_number=2,
                order_num=1,
                question_type="writing_task_1",
                question_text="WRITING TASK 1: The line graph illustrates the percentage of electricity generated from renewable sources (wind, solar, and hydro) across four OECD nations between 2005 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="writing",
                set_number=2,
                order_num=2,
                question_type="writing_task_2",
                question_text="WRITING TASK 2: In recent years, an increasing number of companies allow their staff to work remotely from home on a permanent basis. Some argue that this enhances productivity and job satisfaction, while others believe that collaborative physical office spaces are indispensable for organizational success.\n\nDiscuss both perspectives and deliver your own opinion with relevant examples.\n\nWrite at least 250 words.",
                passage_text=None,
                options=None,
                correct_answer=None
            )
        ]

        # Speaking
        speaking_questions = [
            TestQuestion(
                section="speaking",
                set_number=2,
                order_num=1,
                question_type="speaking_part_1",
                question_text="PART 1: Introduction & Familiar Topics\n- What kind of climate or weather do you find most comfortable?\n- Do you prefer reading books on digital devices or paper format?\n- How frequently do you visit natural environments or public parks?",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=2,
                order_num=2,
                question_type="speaking_part_2",
                question_text="PART 2: Individual Long Turn (Cue Card)\nDescribe a software application or digital tool that significantly assists you in your daily life or studies.\nYou should say:\n- What the application or tool is\n- When and how you first discovered it\n- In what specific ways it assists your productivity\nAnd explain how your routine would be impacted without it.\n\n(Preparation time: 1 minute. Speaking time: 1 to 2 minutes)",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=2,
                order_num=3,
                question_type="speaking_part_3",
                question_text="PART 3: Two-way Discussion\n- In what ways has artificial intelligence impacted employment prospects for recent graduates?\n- Do you think people have become overly dependent on algorithmic recommendations?\n- What regulatory measures should governments take to safeguard digital privacy online?",
                passage_text=None,
                options=None,
                correct_answer=None
            )
        ]

        all_q = reading_questions + listening_questions + writing_questions + speaking_questions
        for q in all_q:
            db.add(q)
        db.commit()
        print(f"Set 2 muvaffaqiyatli kiritildi: Jami {len(all_q)} ta savol.")
    except Exception as e:
        db.rollback()
        print(f"Set 2 kiritishda xatolik: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_set2()
