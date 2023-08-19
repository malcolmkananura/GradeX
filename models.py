from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class Session(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    data = db.Column(db.PickleType(), nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String, primary_key=True, default=get_uuid)
    name = db.Column(db.String, nullable=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String, nullable=False)
    user_type = db.Column(db.String, nullable=False)
    # profile_photo_id = db.Column(db.Integer, db.ForeignKey('profile_photos.id'))
    # profile_photo = db.relationship('ProfilePhoto', back_populates='user')


class ProfilePhoto(db.Model):
    __tablename__ = "profile_photos"
    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String(200), nullable=False)
    # user_id = db.Column(db.String, db.ForeignKey('users.id'))
    # user = db.relationship('User', back_populates='profile_photo')

class Student(User):
    __tablename__ = "students"
    id = db.Column(db.String(32), db.ForeignKey('users.id'), primary_key=True)
    enrolled_courses = db.relationship('CourseUnit', secondary='enrollment', back_populates='students')
    performances = db.relationship('Performance', back_populates='student')


class Lecturer(User):
    __tablename__ = "lecturers"
    id = db.Column(db.String(32), db.ForeignKey('users.id'), primary_key=True)
    taught_courses = db.relationship('CourseUnit', back_populates='lecturer')

class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

class Thread(db.Model):
    __tablename__ = "threads"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'))
    user = db.relationship('User')
    title = db.Column(db.String(200), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    category = db.relationship('Category')
    posts = db.relationship('Post', back_populates='thread')

from datetime import datetime  # Import datetime module

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'))
    user = db.relationship('User')
    content = db.Column(db.Text, nullable=False)
    thread_id = db.Column(db.Integer, db.ForeignKey('threads.id'))
    thread = db.relationship('Thread', back_populates='posts')
    timestamp = db.Column(db.DateTime, default=datetime.now)  # Add timestamp field with default value



class CourseUnit(db.Model):
    __tablename__ = "course_units"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    lecturer_id = db.Column(db.String(32), db.ForeignKey('lecturers.id'))
    lecturer = db.relationship('Lecturer', back_populates='taught_courses')
    students = db.relationship('Student', secondary='enrollment', back_populates='enrolled_courses')
    topics = db.relationship('Topic', back_populates='course')
    questions = db.relationship('Question', back_populates='course')
    performances = db.relationship('Performance', back_populates='course')

class Topic(db.Model):
    __tablename__ = "topics"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course_units.id'))
    course = db.relationship('CourseUnit', back_populates='topics')
    questions = db.relationship('Question', back_populates='topic')
    performances = db.relationship('Performance', back_populates='topic')
    resources = db.relationship('Resource', back_populates='topic')

class Resource(db.Model):
    __tablename__ = "resources"
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'))
    topic = db.relationship('Topic', back_populates='resources')
    path = db.Column(db.String(200), nullable=False)



class Question(db.Model):
    __tablename__ = "questions"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course_units.id'))
    course = db.relationship('CourseUnit', back_populates='questions')
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'))
    topic = db.relationship('Topic', back_populates='questions')

class Performance(db.Model):
    __tablename__ = "performances"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(32), db.ForeignKey('students.id'))
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course_units.id'))
    number_of_attempted_quiz_questions = db.Column(db.Integer, default=0, nullable=True)
    number_of_correctly_attempted_quiz_questions = db.Column(db.Integer, default=0, nullable=False)
    number_of_attempted_essay_questions = db.Column(db.Integer, default=0, nullable=False)
    number_of_correctly_attempted_essay_questions = db.Column(db.Integer, default=0, nullable=False)
    average_quiz_performance = db.Column(db.Float, default=0.0, nullable=False)
    average_essay_performance = db.Column(db.Float, default=0.0, nullable=False)
    total_quiz_points = db.Column(db.Integer, default=0, nullable=False)
    total_essay_points = db.Column(db.Integer, default=0, nullable=False)
    student = db.relationship('Student', back_populates='performances')
    topic = db.relationship('Topic', back_populates='performances')
    course = db.relationship('CourseUnit', back_populates='performances')


enrollment = db.Table('enrollment',
    db.Column('student_id', db.String(32), db.ForeignKey('students.id')),
    db.Column('course_id', db.Integer, db.ForeignKey('course_units.id'))
)
