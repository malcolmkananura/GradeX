from datetime import datetime
import json
import requests
from flask import Flask, request, jsonify, session, Blueprint
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from flask_session import Session
from config import ApplicationConfig
from models import Category, Lecturer, Post, Student, Thread, Topic, db, User, Performance, Question, CourseUnit, Resource, ProfilePhoto
from flask import Flask, request, jsonify
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from flask import Flask, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import uuid
from flask import Flask, jsonify, send_file
import os



app = Flask(__name__, static_folder='frontend/build', static_url_path='/')
app.config.from_object(ApplicationConfig)



bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "https://grade-x-018e7b77a65e.herokuapp.com"}})
server_session = Session(app)
db.init_app(app)

with app.app_context():
    db.create_all()

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif', 'mp4'}

@app.route('/')
@cross_origin()
def serve():
    return send_from_directory(app.static_folder, 'index.html')



@app.errorhandler(404)
@cross_origin()
def not_found(e):
    return app.send_static_file('index.html')


@app.route("/@me")
@cross_origin()
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "user_type": user.user_type
    }) 

@app.route("/register", methods=["POST"])
@cross_origin()
def register_user():
    try:
        name = request.json["name"]
        email = request.json["email"]
        password = request.json["password"]
        user_type = request.json["user_type"]

        user_exists = User.query.filter_by(email=email).first()

        if user_exists:
            return jsonify({"error": "User already exists"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        if user_type == "student":
            user = Student(name=name, email=email, password=hashed_password, user_type=user_type)
        elif user_type == "lecturer":
            user = Lecturer(name=name, email=email, password=hashed_password, user_type=user_type)
        else:
            return jsonify({"error": "Invalid user type"}), 400

        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id

        return jsonify({"message": "Registration successful"}), 201
    # except KeyError:
    #     return jsonify({"error": "Missing required fields"}), 400
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/login_user", methods=["POST"])
@cross_origin()
def login_user():
    try:
        email = request.json["email"]
        password = request.json["password"]

        user = User.query.filter_by(email=email).first()

        if user is None:
            return jsonify({"error": "Unauthorized"}), 401

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Unauthorized"}), 401
        
        session["user_id"] = user.id

        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "user_type": user.user_type
        })
    # except KeyError:
    #     return jsonify({"error": "Bad Request"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500


@app.route("/logout", methods=["POST"])
@cross_origin()
def logout_user():
    session.pop("user_id")
    return jsonify({"status": "logout sucssessful"}), 200

@app.route("/students", methods=["GET"])
@cross_origin()
def get_students():
    students = Student.query.all()
    student_list = []

    for student in students:
        student_data = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "user_type": student.user_type,
            # "password": student.password
            # Add other student attributes you want to display
        }
        student_list.append(student_data)

    return jsonify(student_list)

GPT_MODEL = "gpt-3.5-turbo"

# Helper function to call the GPT-3 API
def get_gpt_response(prompt, model=GPT_MODEL):
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + app.config["OPENAI_API_KEY"],
    }
    json_data = {"model": model, "messages": [{"role": "system", "content": prompt}]}
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=json_data,
        )
        return response.json()
    except Exception as e:
        print("Unable to generate ChatCompletion response")
        print(f"Exception: {e}")
        return None

# ... (other imports and code)

@app.route("/generate_question", methods=["POST"])
def generate_question():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if request.method == "POST":
        try:
            course_unit_name = request.json["courseUnit"]
            topic_name = request.json["topic"]  # Rename 'topic' to 'topic_name'

            prompt = f"Please generate a question for topic: {topic_name} and course unit {course_unit_name}"
            gpt_response = get_gpt_response(prompt)

            if gpt_response and "choices" in gpt_response:
                question_text = gpt_response["choices"][0]["message"]["content"]
            else:
                question_text = "What is the capital of France?"

            # Retrieve the CourseUnit and Topic instances based on their names
            course_unit = CourseUnit.query.filter_by(name=course_unit_name).first()
            topic = Topic.query.filter_by(name=topic_name, course=course_unit).first()

            if not topic:
                # If the topic doesn't exist, create a new Topic instance
                topic = Topic(name=topic_name, course=course_unit)
                db.session.add(topic)
                db.session.commit()

            # Create a new Question instance associated with the CourseUnit and Topic
            question = Question(text=question_text, course=course_unit, topic=topic)
            db.session.add(question)
            db.session.commit()

            response_data = {
                "question_id": question.id,
                "question_text": question_text,
            }
            print(response_data)
            return jsonify(response_data), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405

# ... (other routes and app run code)

@app.route("/grade_answer", methods=["POST"])
def grade_answer():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    if request.method == "POST":
        try:
            question_text = request.json["question"]
            answer_text = request.json["answer"]
            course_unit_name = request.json["courseUnit"]
            topic_name = request.json["topic"]
            course_unit_name = request.json["courseUnit"]

            prompt = f"You are a tutor. Please grade the following answer. Return a final score as a key value pair eg 'score':0. Return a comment on how to improve the answer as a key value pair eg 'comment': The answer is wrong because it does not address the topic.The key value pairs for score and comment must not be part of the same string. Question: {question_text} and Answer: {answer_text}. If a student gives an answer of I don't know. Their score should be 0 for everything."

            gpt_response = get_gpt_response(prompt)

            print(gpt_response)

            if gpt_response and "choices" in gpt_response:
                message_content = gpt_response['choices'][0]['message']['content']

                # Convert the content to a dictionary
                result_dict = eval(message_content)

                # Extract the score and comment
                score = result_dict['score']
                comment = result_dict['comment']

                    # Retrieve the CourseUnit and Topic instances based on their names
                course_unit = CourseUnit.query.filter_by(name=course_unit_name).first()
                topic = Topic.query.filter_by(name=topic_name, course=course_unit).first()

                # Update the student's performance based on the extracted score
                student = Student.query.filter_by(id=user_id).first()
                performance = Performance.query.filter_by(
                    student=student, topic=topic, course=course_unit
                ).first()

                if performance:
                    performance.number_of_attempted_essay_questions += 1
                    performance.total_essay_points += int(score)
                    performance.number_of_attempted_essay_questions +=1
                    performance.average_essay_performance = (
                        performance.total_essay_points
                        / performance.number_of_attempted_essay_questions
                    )
                else:
                    performance = Performance(
                        student=student,
                        topic=topic,
                        course=course_unit,
                        number_of_attempted_essay_questions= performance.number_of_attempted_essay_questions,
                        total_essay_points=int(score),
                        average_essay_performance=float(score),
                    )
                    db.session.add(performance)

                db.session.commit()

                response_data = {
                    "comment": comment,
                    "score": score,
                }

                return jsonify(response_data), 200
            else:
                return jsonify({"error": "Unable to process the answer"}), 500

        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405

@app.route("/generate_quiz_question", methods=["POST"])
def generate_quiz_question():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    if request.method == "POST":
        try:
            
            course_unit_name = request.json["courseUnit"]
            topic_name = request.json["topic"]

            prompt = f"Generate a multiple-choice quiz question for the following topic: {topic_name} and course unit: {course_unit_name}. Provide four options (A, B, C, and D). Note: only one option can be correct"
            gpt_response = get_gpt_response(prompt)

            if gpt_response and "choices" in gpt_response:
                message_content = gpt_response["choices"][0]["message"]["content"]
                options_start = message_content.index("A)")
                question_text = message_content[:options_start].strip()
                options_str = message_content[options_start:]
                options = [opt.strip() for opt in options_str.split("\n") if opt.startswith(("A)", "B)", "C)", "D)"))]
            else:
                question_text = "What is the capital of France?"
                options = ["Option A", "Option B", "Option C", "Option D"]

            response_data = {
                "question_text": question_text,
                "options": options
            }
            print(response_data)
            return jsonify(response_data), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405

@app.route("/grade_quiz_answer", methods=["POST"])
def grade_quiz_answer():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    if request.method == "POST":
        try:
            question_text = request.json["question"]
            options = request.json["options"]
            selected_option = request.json["answer"]
            topic_name = request.json["topic"]
            course_unit_name = request.json["courseUnit"]

            prompt = f"For this question: {question_text}, which of these options, {', '.join(options)} is correct? Selected option is {selected_option}.Return a separate key value pair comment which explains the correct option, and states which is the correct option. If the selected option is wrong the comment talks about why it is wrong. eg 'comment': comment.Return a separate key value pair score which is 1 if the selected option is the same as the correct option and 0 otherwise eg 'score': 0"

            gpt_response = get_gpt_response(prompt)
            print(gpt_response)

            if gpt_response and "choices" in gpt_response and gpt_response["choices"]:
                # Extract the content of the message
                message_content = gpt_response['choices'][0]['message']['content']

                # Extract comment and score using string manipulation
                comment_start = message_content.find("'comment':") + len("'comment':")
                score_start = message_content.find("'score':")
                comment = message_content[comment_start:score_start].strip()
                score_str = message_content[score_start:].split(":")[1].strip()

                if score_str == "1}" or score_str == "0}":
                    score = int(score_str.rstrip('}'))
                else:
                    score = int(score_str)

                    # Retrieve the CourseUnit and Topic instances based on their names
                course_unit = CourseUnit.query.filter_by(name=course_unit_name).first()
                topic = Topic.query.filter_by(name=topic_name, course=course_unit).first()

                # Update the student's performance based on the extracted score
                student = Student.query.filter_by(id=user_id).first()
                performance = Performance.query.filter_by(
                    student=student, topic=topic, course=course_unit
                ).first()

                if performance:
                    performance.number_of_attempted_quiz_questions += 1
                    performance.total_quiz_points += int(score)
                    performance.number_of_attempted_quiz_questions += 1
                    performance.average_quiz_performance = (
                        performance.total_quiz_points
                        / performance.number_of_attempted_quiz_questions
                    )
                    if int(score) == 1:
                        performance.number_of_correctly_attempted_quiz_questions += 1
                    
                else:
                    performance = Performance(
                        student=student,
                        topic=topic,
                        course=course_unit,
                        number_of_attempted_quiz_questions = 1,
                        total_quiz_points=int(score),
                        average_quiz_performance=float(score),
                        number_of_correctly_attempted_quiz_questions=int(score) == 1
                    )
                    db.session.add(performance)

                db.session.commit()

                response_data = {
                    "comment": comment,
                    "score": score,
                }

                return jsonify(response_data), 200
            else:
                return jsonify({"error": "Unable to process the answer"}), 500

        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405

# You can add similar routes for other views

@app.route("/create_topic", methods=["POST"])
def create_topic():
    if request.method == "POST":
        try:
            topic_name = request.json["topic_name"]
            course_unit_id = request.json["course_unit_id"]

            # Retrieve the corresponding course unit
            course_unit = CourseUnit.query.filter_by(id=course_unit_id).first()

            if not course_unit:
                return jsonify({"error": "Course unit not found"}), 404

            # Check if the topic already exists for the specified course unit
            existing_topic = Topic.query.filter_by(name=topic_name, course=course_unit).first()
            if existing_topic:
                return jsonify({"error": "Topic already exists for the course unit"}), 409

            # Create the new topic
            new_topic = Topic(name=topic_name, course=course_unit)

            db.session.add(new_topic)
            db.session.commit()

            return jsonify({"message": "Topic created successfully"}), 201
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405

@app.route("/create_course_unit", methods=["POST"])
def create_course_unit():
    if request.method == "POST":
        try:
            course_unit_name = request.json["courseUnit"]
            lecturer_id = request.json["lecturerId"]  # You should provide the lecturer ID from the frontend

            # Check if the course unit already exists
            existing_course_unit = CourseUnit.query.filter_by(name=course_unit_name).first()
            if existing_course_unit:
                return jsonify({"error": "Course unit already exists"}), 409

            # Create the new course unit
            new_course_unit = CourseUnit(name=course_unit_name, lecturer_id=lecturer_id)

            db.session.add(new_course_unit)
            db.session.commit()

            return jsonify({"message": "Course unit created successfully"}), 201
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"error": "An error occurred"}), 500
    else:
        return jsonify({"error": "Invalid request method"}), 405
    

@app.route("/get_course_units", methods=["GET"])
def get_course_units():
    try:
        course_units = CourseUnit.query.all()
        course_unit_list = []

        for course_unit in course_units:
            course_unit_data = {
                "id": course_unit.id,
                "name": course_unit.name,
                "lecturer": course_unit.lecturer.name if course_unit.lecturer else "N/A",
            }
            course_unit_list.append(course_unit_data)

        return jsonify(course_unit_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500

@app.route("/get_topics/<course_unit_id>", methods=["GET"])
def get_topics(course_unit_id):
    try:
        course_unit = CourseUnit.query.get(course_unit_id)

        if not course_unit:
            return jsonify({"error": "Course unit not found"}), 404

        topics = course_unit.topics
        topic_list = []

        for topic in topics:
            topic_data = {
                "id": topic.id,
                "name": topic.name,
                "course_unit": course_unit.name,
            }
            topic_list.append(topic_data)

        return jsonify(topic_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500

@app.route("/get_lecturers", methods=["GET"])
def get_lecturers():
    try:
        lecturers = Lecturer.query.all()
        lecturer_list = []

        for lecturer in lecturers:
            lecturer_data = {
                "id": lecturer.id,
                "name": lecturer.name,
                "email": lecturer.email,
            }
            lecturer_list.append(lecturer_data)

        return jsonify(lecturer_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500

@app.route("/get_performance/<student_id>", methods=["GET"])
def get_student_performance(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"})
        
        performances = Performance.query.filter_by(student=student).all()
        student_performance = []
        
        for performance in performances:
            topic_name = performance.topic.name
            course_unit_name = performance.course.name
            average_quiz_performance = performance.average_quiz_performance
            average_essay_performance = performance.average_essay_performance
            
            performance_data = {
                "topic_name": topic_name,
                "course_unit_name": course_unit_name,
                "average_quiz_performance": average_quiz_performance,
                "average_essay_performance": average_essay_performance,
                # Include other performance attributes as needed
            }
            student_performance.append(performance_data)
        
        return jsonify(student_performance)
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"})
    

@app.route("/get_topics_performance/<course_unit_id>", methods=["GET"])
def get_topics_performance(course_unit_id):
    try:
        course = CourseUnit.query.get(course_unit_id)
        if not course:
            return jsonify({"error": "Course unit not found"})
        
        topics = Topic.query.filter_by(course=course).all()
        topic_performances = []
        
        for topic in topics:
            performances = Performance.query.filter_by(topic=topic).all()
            topic_name = topic.name
            course_unit_name = topic.course.name
            performances_data = []
            
            for performance in performances:
                # student_name = performance.student.name
                average_quiz_performance = performance.average_quiz_performance
                average_essay_performance = performance.average_essay_performance
                
                performance_data = {
                    # "student_name": student_name,
                    "average_quiz_performance": average_quiz_performance,
                    "average_essay_performance": average_essay_performance,
                    # Include other performance attributes as needed
                }
                performances_data.append(performance_data)
            
            topic_performance = {
                "topic_name": topic_name,
                "course_unit": course_unit_name,
                "performances": performances_data,
            }
            topic_performances.append(topic_performance)
        
        return jsonify(topic_performances)
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"})


@app.route("/get_student_names_ids", methods=["GET"])
def get_student_names_ids():
    try:
        students = Student.query.all()
        student_data = [{"id": student.id, "name": student.name} for student in students]
        return jsonify(student_data)
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"})


@app.route("/add_category", methods=["POST"])
def add_category():
    try:
        data = request.json
        name = data.get('name')

        new_category = Category(name=name)
        db.session.add(new_category)
        db.session.commit()

        return jsonify({"message": "Category added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add category"}), 500

@app.route("/add_thread", methods=["POST"])
def add_thread():
    try:
        user_id = session.get('user_id')
        title = request.json['title']
        category_id = request.json['categoryId']

        new_thread = Thread(user_id=user_id, title=title, category_id=category_id)
        db.session.add(new_thread)
        db.session.commit()

        return jsonify({"message": "Thread added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add thread"}), 500

@app.route('/add_post/<int:thread_id>', methods=['POST'])  # Include thread_id in the route
def add_post(thread_id):
    try:
        user_id = session.get('user_id')
        content = request.json.get('content')

        new_post = Post(
            content=content,
            user_id=user_id,
            thread_id=thread_id,  # Use the thread_id from the URL route
            timestamp=datetime.now(),
        )

        db.session.add(new_post)
        db.session.commit()

        response_data = {'message': 'Post added successfully'}
        return jsonify(response_data), 201
    except Exception as e:
        print(e)
        return jsonify({'message': 'Error adding post'}), 500


# Route to serve media files
# @app.route('/media/<filename>', methods=['GET'])
# def serve_media(filename):
#     return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
@app.route("/get_categories", methods=["GET"])
def get_categories():
    try:
        categories = Category.query.all()
        category_list = []

        for category in categories:
            category_data = {
                "id": category.id,
                "name": category.name,
            }
            category_list.append(category_data)

        return jsonify(category_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500


@app.route("/get_category_and_threads/<category_id>", methods=["GET"])
def get_category_and_threads(category_id):
    try:
        category = Category.query.get(category_id)
        
        if not category:
            return jsonify({"error": "Category not found"}), 404
        
        threads = Thread.query.filter_by(category=category).all()
        thread_list = []
        
        for thread in threads:
            thread_data = {
                "id": thread.id,
                "title": thread.title,
                # Add other thread attributes as needed
            }
            thread_list.append(thread_data)
        
        category_data = {
            "id": category.id,
            "name": category.name,
            "threads": thread_list,
        }
        
        return jsonify(category_data), 200
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"})


@app.route('/thread/<int:thread_id>', methods=['GET'])
def get_thread_and_posts(thread_id):
    try:
        thread = Thread.query.get(thread_id)
        if not thread:
            return jsonify({'message': 'Thread not found'}), 404

        posts = thread.posts
        formatted_posts = []
        for post in posts:
            formatted_post = {
                'id': post.id,
                'content': post.content,
                'user': post.user.name,  # Replace with actual user info
                'user_type': post.user.user_type,
                'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            }
            formatted_posts.append(formatted_post)

        response_data = {
            'thread': {
                'id': thread.id,
                'title': thread.title,
                'name': thread.user.name,
                'user_type': thread.user.user_type
            },
            'posts': formatted_posts
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching thread and posts data'}), 500
    
# Route to serve media files
# Route to serve media files
@app.route('/get_media/<filename>', methods=['GET'])
def get_media(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/get_all_topics_performance', methods=['GET'])
def get_all_topics_performance():
    try:
        
        performances = Performance.query.all()
        student_performance = []
        
        for performance in performances:
            topic_name = performance.topic.name
            course_unit_name = performance.course.name
            average_quiz_performance = performance.average_quiz_performance
            average_essay_performance = performance.average_essay_performance
            
            performance_data = {
                "topic_name": topic_name,
                "course_unit_name": course_unit_name,
                "average_quiz_performance": average_quiz_performance,
                "average_essay_performance": average_essay_performance,
                # Include other performance attributes as needed
            }
            student_performance.append(performance_data)
        
        return jsonify(student_performance)
    except Exception as e:
        print(e)
        return jsonify({'message': 'Error fetching topics performance data'}), 500
    

# Retrieve overall performance data for all topics of the course unit

@app.route('/available_courses/<student_id>', methods=['GET'])
def get_available_courses(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        enrolled_course_ids = [course.id for course in student.enrolled_courses]
        available_courses = CourseUnit.query.filter(~CourseUnit.id.in_(enrolled_course_ids)).all()

        available_courses_data = [
            {
                "id": course.id,
                "name": course.name
            }
            for course in available_courses
        ]

        return jsonify(available_courses_data)
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500


@app.route('/enroll', methods=['POST'])
def enroll_in_course():
    try:
        student_id = request.json.get('student_id')
        course_id = request.json.get('course_id')

        student = Student.query.get(student_id)
        course = CourseUnit.query.get(course_id)
        
        if not student or not course:
            return jsonify({"error": "Student or course not found"}), 404

        student.enrolled_courses.append(course)
        db.session.commit()

        return jsonify({"message": "Enrolled successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred"}), 500
    
@app.route('/enrolled_courses/<string:student_id>', methods=['GET'])
def get_enrolled_courses(student_id):
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'message': 'Student not found'}), 404

        enrolled_courses = student.enrolled_courses
        formatted_courses = []

        for course in enrolled_courses:
            course_data = {
                'id': course.id,
                'name': course.name,
                'topics': [topic.name for topic in course.topics]  # Include topics for each course unit
            }
            formatted_courses.append(course_data)

        response_data = {
            'enrolled_courses': formatted_courses
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching enrolled courses data'}), 500
    
@app.route('/delete_topic/<int:topic_id>', methods=['DELETE'])
def delete_topic(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404

        # Check if the current user is a lecturer for the course unit
        lecturer_id = session.get('user_id')
        if topic.course.lecturer_id != lecturer_id:
            return jsonify({'message': 'Unauthorized'}), 401

        db.session.delete(topic)
        db.session.commit()

        return jsonify({'message': 'Topic deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting topic'}), 500


@app.route('/get_course_unit_performance/<course_unit_id>')
def get_course_unit_performance( course_unit_id):
    try:

        lecturer_id = session.get('user_id')
        lecturer = Lecturer.query.get(lecturer_id)
        course_unit = CourseUnit.query.get(course_unit_id)
        
        if not lecturer or not course_unit:
            return jsonify({'error': 'Lecturer or Course Unit not found'}), 404
        
        if lecturer.id != course_unit.lecturer_id:
            return jsonify({'error': 'Lecturer is not assigned to this course unit'}), 403
        
        performances = Performance.query.filter_by(course_id=course_unit_id).all()
        
        result = []
        for performance in performances:
            result.append({
                'topic_name': performance.topic.name,
                'course_unit_name': performance.course.name,
                'average_quiz_performance': performance.average_quiz_performance,
                'average_essay_performance': performance.average_essay_performance,
            })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/lecturer/<string:lecturer_id>/courses', methods=['GET'])
def get_courses_by_lecturer(lecturer_id):
    try:
        lecturer = Lecturer.query.get(lecturer_id)
        if not lecturer:
            return jsonify({'message': 'Lecturer not found'}), 404

        taught_courses = lecturer.taught_courses
        formatted_courses = []

        for course in taught_courses:
            course_data = {
                'id': course.id,
                'name': course.name,
            }
            formatted_courses.append(course_data)

        response_data = {
            'courses': formatted_courses
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching courses taught by lecturer'}), 500


@app.route('/lecturer/<string:lecturer_id>/add_course', methods=['POST'])
def add_course_to_lecturer(lecturer_id):
    try:
        lecturer = Lecturer.query.get(lecturer_id)
        if not lecturer:
            return jsonify({'message': 'Lecturer not found'}), 404

        course_id = request.json.get('course_id')
        if not course_id:
            return jsonify({'message': 'Course ID is required'}), 400

        course = CourseUnit.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course unit not found'}), 404

        lecturer.taught_courses.append(course)
        db.session.commit()

        return jsonify({'message': 'Course unit added to lecturer successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error adding course unit to lecturer'}), 500
    

@app.route('/course/<int:course_unit_id>/topics', methods=['GET'])
def get_topics_by_course(course_unit_id):
    try:
        course = CourseUnit.query.get(course_unit_id)
        if not course:
            return jsonify({'message': 'Course unit not found'}), 404

        topics = [{'id': topic.id, 'name': topic.name} for topic in course.topics]

        response_data = {
            'topics': topics
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching topics'}), 500


@app.route('/add_resource/<int:topic_id>', methods=['POST'])
def add_resource(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        file = request.files.get('file')
        if not file:
            return jsonify({'message': 'No file provided'}), 400
        
        # Create the directory if it doesn't exist
        directory_path = os.path.join(app.config['UPLOAD_FOLDER'], 'resources', str(topic_id))
        os.makedirs(directory_path, exist_ok=True)

        # Save the uploaded file to the directory
        filename = secure_filename(file.filename)
        file_path = os.path.join(directory_path, filename)
        file.save(file_path)
        
        resource = Resource(topic=topic, path=file_path)
        db.session.add(resource)
        db.session.commit()

        return jsonify({'message': 'Resource added successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error adding resource'}), 500


@app.route('/view_resources/<int:topic_id>', methods=['GET'])
def view_resources(topic_id):
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        resources = Resource.query.filter_by(topic=topic).all()
        
        resource_list = []
        for resource in resources:
            file_name = os.path.basename(resource.path)  # Extract the file name
            resource_data = {
                'id': resource.id,
                'fileName': file_name,  # Use the file name
            }
            resource_list.append(resource_data)
        
        return jsonify({'resources': resource_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching resources'}), 500


@app.route('/download_resource/<int:resource_id>', methods=['GET'])
def download_resource(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'message': 'Resource not found'}), 404

        return send_file(resource.path, as_attachment=True)
    except Exception as e:
        print(e)
        return jsonify({'message': 'Error downloading resource'}), 500






@app.route('/delete_resource/<int:resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'message': 'Resource not found'}), 404

        # Delete the file from the file system
        if os.path.exists(resource.path):
            os.remove(resource.path)

        db.session.delete(resource)
        db.session.commit()

        return jsonify({'message': 'Resource deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting resource'}), 500


@app.route("/add_lecturer_to_course/<int:course_id>/<string:lecturer_id>", methods=["POST"])
def add_lecturer_to_course(course_id, lecturer_id):
    try:
        course = CourseUnit.query.get(course_id)
        lecturer = Lecturer.query.get(lecturer_id)

        if not course:
            return jsonify({"error": "Course not found"}), 404

        if not lecturer:
            return jsonify({"error": "Lecturer not found"}), 404

        if course.lecturer:
            return jsonify({"error": "Course already has a lecturer"}), 400

        course.lecturer = lecturer
        db.session.commit()

        return jsonify({"message": "Lecturer added to course successfully"}), 201
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/get_all_course_units', methods=['GET'])
def get_all_course_units():
    try:
        course_units = CourseUnit.query.all()
        course_unit_list = []

        for course_unit in course_units:
            course_unit_data = {
                "id": course_unit.id,
                "name": course_unit.name,
                # Include other attributes as needed
            }
            course_unit_list.append(course_unit_data)

        return jsonify(course_unit_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500

@app.route('/change_profile_photo/<string:user_id>', methods=['POST'])
def change_profile_photo(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        file = request.files.get('file')
        if not file:
            return jsonify({'message': 'No file provided'}), 400
        
        add_or_update_profile_photo(user, file)

        return jsonify({'message': 'Profile photo changed successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error changing profile photo'}), 500


# Configure the file upload path for profile photos
def get_profile_photo_upload_path(filename):
    return os.path.join(app.config['UPLOAD_FOLDER'], 'profile_photos', filename)

# Function to add or update a user's profile photo
def add_or_update_profile_photo(user, photo_file):
    filename = secure_filename(photo_file.filename)
    file_path = get_profile_photo_upload_path(filename)
    photo_file.save(file_path)

    if user.profile_photo:
        # Update existing profile photo
        user.profile_photo.path = file_path
    else:
        # Create a new profile photo entry
        profile_photo = ProfilePhoto(path=file_path, user=user)
        db.session.add(profile_photo)

    db.session.commit()

# Function to delete a user's profile photo
def delete_profile_photo(user):
    if user.profile_photo:
        file_path = user.profile_photo.path
        db.session.delete(user.profile_photo)
        db.session.commit()

        # Delete the photo file from the storage
        if os.path.exists(file_path):
            os.remove(file_path)

# Route to add or update a profile photo
@app.route('/add_profile_photo/<string:user_id>', methods=['POST'])
def add_profile_photo(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        file = request.files.get('file')
        if not file:
            return jsonify({'message': 'No file provided'}), 400
        
        add_or_update_profile_photo(user, file)

        return jsonify({'message': 'Profile photo added/updated successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error adding/updating profile photo'}), 500

# Route to delete a profile photo
@app.route('/delete_profile_photo/<string:user_id>', methods=['POST'])
def delete_user_profile_photo(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        delete_profile_photo(user)

        return jsonify({'message': 'Profile photo deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting profile photo'}), 500


from sqlalchemy import func

@app.route('/get_threads_ordered_by_most_posts', methods=['GET'])
def get_threads_ordered_by_most_posts():
    try:
        threads = db.session.query(Thread, func.count(Post.id)).outerjoin(Post).group_by(Thread.id).order_by(func.count(Post.id).desc()).all()

        formatted_threads = []
        for thread, post_count in threads:
            formatted_thread = {
                'id': thread.id,
                'title': thread.title,
                'post_count': post_count
            }
            formatted_threads.append(formatted_thread)

        response_data = {
            'threads': formatted_threads
        }
        return jsonify(response_data), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Error fetching threads and posts data'}), 500


if __name__ == "__main__":
    app.run(debug=True)