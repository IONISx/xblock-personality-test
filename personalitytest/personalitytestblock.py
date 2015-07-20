'''TO-DO: Write a description of what this XBlock is.'''

import pkg_resources
import json

from django.template import Context, Template

from xblock.core import XBlock
from xblock.fields import Scope, String
from xblock.fragment import Fragment


class PersonalityTestXBlock(XBlock):
    '''
    TO-DO: document what your XBlock does.
    '''

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.
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

    def init_quizz(self, data):
        full_quizz = json.loads(data)
        self.quizz = json.dumps(full_quizz)

        questions = full_quizz['questions']

        for question in questions:
            for answer in question['answers']:
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

    def get_score(self):
        questions = json.loads(self.quizz)
        score = self.init_categories()
        for question in questions['questions']:
            answers = question['answers']

            student_answer = self.extract_answer(question['id'])
            for answer in answers:
                if answer['answer'] == student_answer['value']:
                    categories = answer['categories'].split(';')
                    for category in categories:
                        if not category == '':
                            score[category] = score[category] + 1
        return score

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        '''
        The primary view of the PersonalityTestXBlock, shown to students
        when viewing courses.
        '''

        context = {
            # 'quizz': self.questions,
            'success': True,
        }

        html = self.render_template('static/html/personalitytest-view.html', context)

        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string('static/css/personalitytest.css'))
        frag.add_javascript(self.resource_string('static/js/src/personalitytest-view.js'))
        frag.initialize_js('PersonalityTestXBlockStudent')
        return frag

    # TO-DO: change this view to display your data your own way.
    def studio_view(self, context=None):
        '''
        The primary view of the PersonalityTestXBlock, shown to students
        when viewing courses.
        '''
        context = {
            'quizz': self.quizz,
            'success': False,
        }

        html = self.render_template('static/html/personalitytest-edit.html', context)

        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string('static/css/personalitytest.css'))
        frag.add_javascript(self.resource_string('static/js/src/personalitytest-edit.js'))
        frag.initialize_js('PersonalityTestXBlockStudio')
        return frag

    @XBlock.json_handler
    def get_questions(self, data, suffix=''):
        """
        Return the questions json.
        """
        if not self.questions:
            return {
                'success': False
            }
        else:
            return {
                'success': True,
                'questions': self.questions
            }

    @XBlock.json_handler
    def get_quizz(self, data, suffix=''):
        """
        Return the questions json.
        """
        if not self.quizz:
            return {
                'success': False
            }
        else:
            return {
                'success': True,
                'quizz': self.quizz
            }

    @XBlock.json_handler
    def get_caterogry_dec(self, data, success=''):
        quizz = json.loads(self.quizz)
        for category in quizz['categories']:
            if category['title'] == data['category']:
                return {
                    'description': category['description'],
                    'success': True
                }

        return {'success': False}

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        The updating handler.
        """

        self.init_quizz(data['quizz'])

        if self.isInitialised():
            return {
                'success': True,
                'questions': self.questions,
            }
        else:
            return {
                'success': False,
            }

    @XBlock.json_handler
    def student_submit(self, data, suffix=''):
        """
        The updating handler.
        """
        self.answers = json.dumps(data['data'])
        self.score = json.dumps(self.get_score())

        return {
            'success': True,
            'score': self.score,
        }

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
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
