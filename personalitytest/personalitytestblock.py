'''TO-DO: Write a description of what this XBlock is.'''

import pkg_resources
import json

from django.template import Context, Template

from xblock.core import XBlock
from xblock.fields import Scope, String
from xblock.fragment import Fragment

from .defaults import DEFAULT_QUIZZ, DISPLAY_NAME


class PersonalityTestXBlock(XBlock):
    '''
    TO-DO: document what your XBlock does.
    '''
    display_name = String(
        default=DISPLAY_NAME,
        display_name='Display Name',
        scope=Scope.settings,
        help='This name appears in the horizontal navigation at the top of the page.'
    )

    quizz = String(
        default='',
        scope=Scope.content,
        help='Quizz in json'
    )

    questions = String(
        scope=Scope.content,
        help='Quizz without answers'
    )

    answers = String(
        scope=Scope.user_state,
        help='Quizz without answers'
    )

    score = String(
        scope=Scope.user_state,
        help='Quizz without answers'
    )

    def resource_string(self, path):
        '''Handy helper for getting resources from our kit.'''
        data = pkg_resources.resource_string(__name__, path)
        return data.decode('utf8')

    def load_resource(self, resource_path):
        '''
        Gets the content of a resource
        '''
        resource_content = pkg_resources.resource_string(__name__, resource_path)
        return resource_content.decode('utf8')

    def render_template(self, template_path, context={}):
        '''
        Evaluate a template by resource path, applying the provided context
        '''
        template_str = self.load_resource(template_path)
        return Template(template_str).render(Context(context))

    def is_json(self, myjson):
        try:
            json.loads(myjson)
        except ValueError, e:
            print e
            return False
        return True

    def init_quizz(self, data):
        full_quizz = json.loads(data)
        self.quizz = json.dumps(full_quizz)

        questions = full_quizz['questions']

        for question in questions:
            if 'type' not in question or question['type'] != 'group':
                for answer in question['answers']:
                    answer['categories'] = ''
            else:
                tmp = question['questions']
                for quest in tmp:
                    for answer in quest['answers']:
                        answer['categories'] = ''

        self.questions = json.dumps(questions)

    def isInitialised(self):
        if not self.quizz and not self.questions:
            return False
        else:
            return True

    def extract_answer(self, id):
        answers = json.loads(self.answers)
        for answer in answers:
            if answer['id'] == id:
                return answer
        return None

    def init_categories(self):
        quizz = json.loads(self.quizz)
        cats = {}

        for category in quizz['categories']:
            cats[category['title']] = 0

        return cats

    def score_by_question(self, question, score):
        answers = question['answers']

        student_answer = self.extract_answer(question['id'])
        for answer in answers:
            if answer['answer'] == student_answer['value']:
                weight = 1
                if 'weight' in answer:
                    if type(answer['weight']) is int:
                        weight = answer['weight']

                categories = answer['categories'].split(';')
                for category in categories:
                    if not category == '':
                        score[category] = score[category] + weight

    def init_score(self):
        questions = json.loads(self.quizz)
        score = self.init_categories()
        for question in questions['questions']:
            type = question.get('type', 'question')
            if type == 'group':
                for quest in question['questions']:
                    self.score_by_question(quest, score)
            else:
                self.score_by_question(question, score)

        return score

    def student_view(self, context=None):
        '''
        The primary view of the PersonalityTestXBlock, shown to students
        when viewing courses.
        '''
        quizz_str = DEFAULT_QUIZZ if not self.quizz else self.quizz
        quizz = json.loads(quizz_str)
        quizz_title = quizz['meta']['quizz_title']
        quizz_description = quizz['meta']['quizz_description']

        context = {
            'success': True,
            'quizz_title': quizz_title,
            'quizz_description': quizz_description,
        }

        html = self.render_template('static/html/personalitytest-view.html', context)
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string('static/css/personalitytest.css'))
        frag.add_javascript(self.resource_string('static/js/src/personalitytest-view.js'))
        frag.initialize_js('PersonalityTestXBlockStudent')
        return frag

    def studio_view(self, context=None):
        '''
        The primary view of the PersonalityTestXBlock, shown to students
        when viewing courses.
        '''
        context = {
            'quizz': DEFAULT_QUIZZ if not self.quizz else self.quizz,
            'success': True,
        }

        html = self.render_template('static/html/personalitytest-edit.html', context)

        frag = Fragment(html.format(self=self))
        frag.add_javascript(self.resource_string('static/js/src/personalitytest-edit.js'))
        frag.initialize_js('PersonalityTestXBlockStudio')
        return frag

    @XBlock.json_handler
    def update_answers(self, data, suffix=''):
        """
        Update answers.
        """
        self.answers = json.dumps(data['data'])

        event_type = 'ionisx.learning.course.personnality-test.save'
        event_data = {
            'student_answers': self.answers
        }
        self.runtime.publish(self, event_type, event_data)
        return {
            'success': True
        }

    @XBlock.json_handler
    def get_quizz(self, data, suffix=''):
        """
        Return the questions json.
        """
        if not self.quizz:
            self.init_quizz(DEFAULT_QUIZZ)
        return {
            'success': True,
            'quizz': self.quizz
        }

    @XBlock.json_handler
    def get_questions(self, data, suffix=''):
        """
        Return questions json.
        """
        quizz = json.loads(self.quizz)
        if not self.questions:
            return {
                'success': False
            }
        else:
            return {
                'success': True,
                'quizz_description': quizz['meta']['quizz_description'],
                'questions': self.questions
            }

    @XBlock.json_handler
    def get_answers(self, data, suffix=''):
        """
        Return answers json.
        """
        if not self.answers:
            return {
                'success': False
            }
        else:
            return {
                'success': True,
                'answers': self.answers
            }

    @XBlock.json_handler
    def get_caterogry_desc(self, data, success=''):
        desc = ''

        quizz = json.loads(self.quizz)
        for category in quizz['categories']:
            if category['title'] in data['categories']:
                desc = category['description'] if desc == '' else desc + '###!###' + category['description']

        if not desc == '':
            return {
                'description': desc,
                'answer_description': quizz['meta']['result_description'],
                'success': True
            }
        else:
            return {'success': False}

    @XBlock.json_handler
    def get_score(self, data, success=''):
        if not self.score:
            return {'success': False}
        else:
            return {'success': True, 'score': self.score}

    @XBlock.json_handler
    def reset_answers(self, data, success=''):
        self.answers = None
        self.score = None

        return {'success': True}

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        The updating handler.
        """
        if self.is_json(data['quizz']):
            self.init_quizz(data['quizz'])
            return {
                'success': True,
                'questions': self.questions,
            }
        else:
            return {
                'success': False,
                'errors': 'Invalid JSON.'
            }

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
        """
        The updating handler.
        """
        event_type = 'ionisx.learning.course.personnality-test.submit'
        self.answers = json.dumps(data['data'])
        self.score = json.dumps(self.init_score())
        event_data = {
            'student_answers': self.answers,
            'student_score': self.score
        }
        self.runtime.publish(self, event_type, event_data)
        return {
            'success': True,
            'score': self.score,
        }

    @staticmethod
    def workbench_scenarios():
        '''A canned scenario for display in the workbench.'''
        return [
            ('PersonalityTestXBlock',
             '''<vertical_demo>
                    <personalitytest/>
                </vertical_demo>
             '''),
        ]
