import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.question import TestQuestion

def seed_set2():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("Set 2 savollarini tozalash va to'liq kiritish (10 Reading, 10 Listening)...")
        db.query(TestQuestion).filter(TestQuestion.set_number == 2).delete()
        db.commit()

        # Reading Passage
        passage = """THE EVOLUTION OF RENEWABLE ENERGY TECHNOLOGIES

The transition towards sustainable energy systems has emerged as one of the defining imperatives of the twenty-first century. As international treaties mandate substantial reductions in greenhouse gas emissions, the reliance on traditional fossil fuel infrastructures is progressively diminishing in favour of renewable alternatives such as solar, wind, and hydroelectric energy.

Modern commercial wind energy traces its direct technological roots to the 1973 global oil crisis, which spurred Western governments to invest heavily in alternative energy research. Early turbine models suffered from mechanical instability and low aerodynamic conversion efficiencies. However, modern multi-megawatt turbines installed in offshore wind farms now generate gigawatts of clean electricity, using high-voltage submarine transmission cables to transport power directly to continental power grids.

Parallel to wind developments, solar photovoltaic (PV) technology has achieved dramatic cost reductions and efficiency gains. Over the last two decades, advances in silicon wafer manufacturing and perovskite cell layering have reduced levelized generation costs by over eighty percent, rendering solar power cheaper than newly built coal or gas power plants in numerous regions. Hydroelectric power, meanwhile, remains the oldest and largest source of renewable mechanical electricity globally, providing grid stability through pumped storage systems that balance the intermittency of wind and solar sources.

Despite these technological triumphs, serious infrastructural challenges persist. Integrating decentralized renewable sources into legacy electrical grids requires substantial investments into smart grid management, grid-scale battery storage facilities (such as lithium-iron-phosphate batteries), and long-distance high-voltage direct current (HVDC) transmission lines. Policy analysts emphasize that without robust regulatory frameworks and international technological collaboration, the global target of net-zero emissions by 2050 may remain unattainable."""

        reading_questions = [
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=1,
                question_type="multiple_choice",
                passage_text=passage,
                question_text="According to the passage, which historical event initially catalyzed major Western government investment into modern wind turbine development?",
                options=["The 1973 oil crisis", "The Industrial Revolution", "The Paris Climate Agreement", "The invention of photovoltaic silicon cells"],
                correct_answer="The 1973 oil crisis"
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
                correct_answer="transmission"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=6,
                question_type="multiple_choice",
                passage_text=passage,
                question_text="By approximately what percentage have levelized generation costs for solar power fallen over recent decades?",
                options=["Over eighty percent", "Fifty percent", "Twenty-five percent", "Ten percent"],
                correct_answer="Over eighty percent"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=7,
                question_type="fill_blank",
                passage_text=passage,
                question_text="Complete the sentence: Modern solar photovoltaic advancements utilize silicon wafers alongside innovative ______ cell layering.",
                options=None,
                correct_answer="perovskite"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=8,
                question_type="true_false",
                passage_text=passage,
                question_text="Integrating variable renewable power into existing grids requires investments in grid-scale battery storage facilities.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=9,
                question_type="multiple_choice",
                passage_text=passage,
                question_text="What international net-zero emissions target year is highlighted by policy analysts in the conclusion?",
                options=["2050", "2030", "2075", "2100"],
                correct_answer="2050"
            ),
            TestQuestion(
                section="reading",
                set_number=2,
                order_num=10,
                question_type="true_false",
                passage_text=passage,
                question_text="Hydroelectric power is described as the newest form of mechanical renewable electricity.",
                options=["True", "False", "Not Given"],
                correct_answer="False"
            )
        ]

        # Listening
        listening_audio = "/uploads/audio/ielts_listening_set2.wav"
        listening_questions = [
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=1,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="Where will the general academic orientation briefing for new international students take place?",
                options=["Auditorium Hall B", "Central Science Laboratory", "Student Union Dining Hall", "Campus Sports Complex"],
                correct_answer="Auditorium Hall B"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=2,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="Registered full-time students are entitled to complimentary consultations at the university medical clinic.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=3,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="In which building is the university medical clinic situated?",
                options=["Building 4", "Building 1", "Building 12", "The West Pavilion"],
                correct_answer="Building 4"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=4,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="International students must complete their biometric permit verification before Friday, September ______.",
                options=None,
                correct_answer="15th / 15 / fifteen / fifteenth"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=5,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="The central campus library remains open 24 hours a day during examination periods.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=6,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="What is the surname of the academic advisor conducting this orientation? (Dr. Margaret ______)",
                options=None,
                correct_answer="Evans"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=7,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="During normal term time, the library closes at ______.",
                options=None,
                correct_answer="midnight / 12 AM / 12:00 AM / 24:00"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=8,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="Which campus unit provides drop-in workshops for academic essay writing and referencing?",
                options=["Academic Skills Unit", "Global Languages Centre", "Career Placement Office", "Postgraduate Guild"],
                correct_answer="Academic Skills Unit"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=9,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="On which days of the week are the essay writing and referencing workshops offered?",
                options=["Tuesday and Thursday", "Monday and Wednesday", "Friday only", "Saturday morning"],
                correct_answer="Tuesday and Thursday"
            ),
            TestQuestion(
                section="listening",
                set_number=2,
                order_num=10,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="The student ID card provides discounts on local public transport.",
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
                question_text="WRITING TASK 1: The charts below compare the proportions of energy generated from different fuels in Australia and Germany in 2015 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="writing",
                set_number=2,
                order_num=2,
                question_type="writing_task_2",
                question_text="WRITING TASK 2: In many nations, people increasingly choose to live in high-density urban apartments rather than spacious suburban houses.\n\nWhat are the primary reasons for this trend, and do the advantages of living in high-density city apartments outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
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
                question_text="PART 1: Hometown & Leisure Activities\n- Tell me about the town or city where you grew up.\n- What do people in your hometown usually do in their free time?\n- Has your hometown changed much over the past few years?",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=2,
                order_num=2,
                question_type="speaking_part_2",
                question_text="PART 2: Individual Long Turn (Cue Card)\nDescribe an environmental project or activity that you took part in or heard about.\nYou should say:\n- What the project was\n- Where and when it happened\n- What people did to help\nAnd explain why you think this project was beneficial or important.\n\n(Preparation time: 1 minute. Speaking time: 1 to 2 minutes)",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=2,
                order_num=3,
                question_type="speaking_part_3",
                question_text="PART 3: Global Environmental Issues\n- Whose responsibility is it to combat climate change: governments, corporations, or individuals?\n- How can schools encourage children to protect the environment from a young age?\n- Do you think renewable energy can completely replace fossil fuels in the near future?",
                passage_text=None,
                options=None,
                correct_answer=None
            )
        ]

        all_questions = reading_questions + listening_questions + writing_questions + speaking_questions
        for q in all_questions:
            db.add(q)
        db.commit()
        print(f"Set 2: Jami {len(all_questions)} ta savol muvaffaqiyatli kiritildi!")

    except Exception as e:
        db.rollback()
        print(f"Xatolik yuz berdi: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_set2()
