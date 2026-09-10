import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.question import TestQuestion
from app.services.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("1. Foydalanuvchilarni tekshirish va yaratish...")
        admin = db.query(User).filter(User.email == "admin@ielts.uz").first()
        if not admin:
            admin = User(
                email="admin@ielts.uz",
                full_name="IELTS Mentor Admin",
                phone="+998901234567",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            db.add(admin)
            print("  [OK] Admin yaratildi: admin@ielts.uz (parol: admin123)")
        else:
            print("  [OK] Admin allaqachon mavjud.")

        student = db.query(User).filter(User.email == "student@ielts.uz").first()
        if not student:
            student = User(
                email="student@ielts.uz",
                full_name="Valijon Ozodov",
                phone="+998907654321",
                password_hash=hash_password("student123"),
                role="student"
            )
            db.add(student)
            print("  [OK] Test talaba yaratildi: student@ielts.uz (parol: student123)")

        db.commit()

        print("2. IELTS Test Set 1 savollarini tozalash va to'liq kiritish (10 Reading, 10 Listening)...")
        db.query(TestQuestion).filter(TestQuestion.set_number == 1).delete()
        db.commit()

        # Reading matni
        reading_passage = """THE ORIGINS AND GLOBAL IMPACT OF TEA

Tea is one of the most widely consumed beverages in the world, second only to water. The history of tea dates back thousands of years to ancient China, where legend attributes its discovery to Emperor Shennong in 2737 BC. According to folklore, fresh leaves from a wild Camellia sinensis tree drifted into a cauldron of boiling water prepared for the emperor, producing an aromatic infusion that he found refreshing and invigorating.

Initially revered primarily as an herbal medicine and medicinal elixir, tea gradually evolved into an everyday social beverage during the Tang Dynasty (618–907 AD). Lu Yu, often commemorated as the Sage of Tea, authored the 'Cha Jing' (The Classic of Tea), the first known monograph detailing the cultivation, harvesting, processing, and ceremonial brewing of tea.

During the 16th and 17th centuries, Portuguese and Dutch merchants introduced tea to Europe, where it initially became a luxury commodity enjoyed almost exclusively by royal aristocrats. By the 18th century in Great Britain, tea had become central to British cultural identity, leading to vast trading enterprises spearheaded by the East India Company and the subsequent establishment of tea plantations in colonial India, particularly in regions such as Assam and Darjeeling.

Modern biochemical studies confirm that tea leaves are abundant in polyphenols, specifically epigallocatechin gallate (EGCG), a potent antioxidant associated with cardiovascular health and metabolic enhancement. While green tea leaves undergo immediate steaming or pan-firing to prevent enzymatic oxidation, black tea leaves undergo full fermentation and oxidation, developing robust flavors and a deeper amber hue. Today, tea cultivation sustains millions of smallholder farming families across Asia and Africa."""

        reading_questions = [
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=1,
                question_type="multiple_choice",
                passage_text=reading_passage,
                question_text="According to the passage, who is traditionally credited with the discovery of tea in 2737 BC?",
                options=["Emperor Shennong", "Lu Yu", "Portuguese merchants", "Marco Polo"],
                correct_answer="Emperor Shennong"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=2,
                question_type="true_false",
                passage_text=reading_passage,
                question_text="Tea was initially consumed primarily for medicinal and herbal purposes before becoming a regular beverage.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=3,
                question_type="multiple_choice",
                passage_text=reading_passage,
                question_text="Which historical figure wrote the 'Cha Jing', the first definitive guide on tea culture?",
                options=["Emperor Shennong", "Lu Yu", "Assam King", "The Dutch Merchant Guild"],
                correct_answer="Lu Yu"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=4,
                question_type="true_false",
                passage_text=reading_passage,
                question_text="Tea became an inexpensive household drink immediately upon its arrival in 16th-century Europe.",
                options=["True", "False", "Not Given"],
                correct_answer="False"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=5,
                question_type="fill_blank",
                passage_text=reading_passage,
                question_text="Complete the sentence: In colonial India, large-scale tea plantations were predominantly established in regions such as Assam and ______.",
                options=None,
                correct_answer="Darjeeling"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=6,
                question_type="multiple_choice",
                passage_text=reading_passage,
                question_text="What is the botanical name of the plant species from which authentic tea leaves originate?",
                options=["Camellia sinensis", "Arabica coffea", "Mentha piperita", "Ginkgo biloba"],
                correct_answer="Camellia sinensis"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=7,
                question_type="fill_blank",
                passage_text=reading_passage,
                question_text="Complete the sentence: Modern scientific research identifies EGCG as a powerful ______ associated with cardiovascular wellbeing.",
                options=None,
                correct_answer="antioxidant"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=8,
                question_type="true_false",
                passage_text=reading_passage,
                question_text="Green tea leaves undergo full enzymatic oxidation during commercial processing.",
                options=["True", "False", "Not Given"],
                correct_answer="False"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=9,
                question_type="multiple_choice",
                passage_text=reading_passage,
                question_text="Which trading enterprise spearheaded the commercial expansion of British tea imports during the 18th century?",
                options=["East India Company", "Royal Dutch Trading Guild", "Silk Road Caravan", "Hanseatic League"],
                correct_answer="East India Company"
            ),
            TestQuestion(
                section="reading",
                set_number=1,
                order_num=10,
                question_type="true_false",
                passage_text=reading_passage,
                question_text="Tea is currently the most consumed beverage on earth, surpassing plain drinking water.",
                options=["True", "False", "Not Given"],
                correct_answer="False"
            )
        ]

        # Listening savollari
        listening_audio = "/uploads/audio/ielts_listening_set1.wav"
        listening_questions = [
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=1,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="What is the main purpose of the student's visit to the university library?",
                options=["Registering for a library membership card", "Paying an overdue book fine", "Applying for campus employment", "Booking a silent study room"],
                correct_answer="Registering for a library membership card"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=2,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="International postgraduate students are allowed to borrow up to 10 books at a time.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=3,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="On which floor is the multimedia and computer suite located?",
                options=["Ground floor", "First floor", "Second floor", "Third floor"],
                correct_answer="Second floor"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=4,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="The library's Sunday operating hours conclude at ______ PM.",
                options=None,
                correct_answer="6 / 6 PM / six / 6:00"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=5,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="Individual study desks are equipped with dedicated electrical sockets for charging laptops.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=6,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="What is the student's full name as stated in the registration dialogue?",
                options=None,
                correct_answer="Alex Turner"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=7,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="What is the maximum loan duration for regular borrowed academic books? (______ weeks)",
                options=None,
                correct_answer="3 / three / 3 weeks"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=8,
                question_type="multiple_choice",
                audio_url=listening_audio,
                question_text="For how long may multimedia materials such as audiobooks and DVDs be borrowed?",
                options=["One week", "Two weeks", "Three weeks", "One month"],
                correct_answer="One week"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=9,
                question_type="true_false",
                audio_url=listening_audio,
                question_text="The second floor is strictly designated as a quiet study zone.",
                options=["True", "False", "Not Given"],
                correct_answer="True"
            ),
            TestQuestion(
                section="listening",
                set_number=1,
                order_num=10,
                question_type="fill_blank",
                audio_url=listening_audio,
                question_text="On Saturdays, the library closes at ______ PM.",
                options=None,
                correct_answer="8 / 8 PM / eight / 8:00"
            )
        ]

        # Writing mavzulari
        writing_questions = [
            TestQuestion(
                section="writing",
                set_number=1,
                order_num=1,
                question_type="writing_task_1",
                question_text="WRITING TASK 1: The bar chart illustrates the percentage of university graduates in three European countries who found full-time employment within six months of graduation between 2010 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="writing",
                set_number=1,
                order_num=2,
                question_type="writing_task_2",
                question_text="WRITING TASK 2: Some educators argue that technological advancement and artificial intelligence will eventually replace traditional classroom teaching, while others believe that the physical presence of a human teacher remains indispensable.\n\nDiscuss both views and present your personal perspective with relevant examples.\n\nWrite at least 250 words.",
                passage_text=None,
                options=None,
                correct_answer=None
            )
        ]

        # Speaking savollari
        speaking_questions = [
            TestQuestion(
                section="speaking",
                set_number=1,
                order_num=1,
                question_type="speaking_part_1",
                question_text="PART 1: Introduction & Familiar Topics\n- What is your full name and where do you currently reside?\n- Do you work or are you currently a student?\n- What do you enjoy most about your daily routine or studies?",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=1,
                order_num=2,
                question_type="speaking_part_2",
                question_text="PART 2: Individual Long Turn (Cue Card)\nDescribe an ambitious goal that you have achieved in your life.\nYou should say:\n- What the goal was\n- When and why you set it\n- What steps you took to achieve it\nAnd explain how you felt when you successfully accomplished it.\n\n(Preparation time: 1 minute. Speaking time: 1 to 2 minutes)",
                passage_text=None,
                options=None,
                correct_answer=None
            ),
            TestQuestion(
                section="speaking",
                set_number=1,
                order_num=3,
                question_type="speaking_part_3",
                question_text="PART 3: Two-way Discussion\n- In what ways do personal goals influence an individual's motivation?\n- Do you think people today set more realistic goals than previous generations?\n- How has social media affected people's expectations regarding personal success?",
                passage_text=None,
                options=None,
                correct_answer=None
            )
        ]

        all_questions = reading_questions + listening_questions + writing_questions + speaking_questions
        for q in all_questions:
            db.add(q)
        db.commit()
        print(f"  [OK] Set 1: Jami {len(all_questions)} ta savol muvaffaqiyatli kiritildi!")

    except Exception as e:
        db.rollback()
        print(f"Xatolik yuz berdi: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
