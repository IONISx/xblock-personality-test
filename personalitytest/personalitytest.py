'''TO-DO: Write a description of what this XBlock is.'''

import pkg_resources, json

from django.template import Context, Template

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment

class PersonalityTestXBlock(XBlock):
    '''
    TO-DO: document what your XBlock does.
    '''

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.
    quizz = String(
        scope = Scope.content,
        help = 'Quizz in json'
    )

    questions = String(
        scope = Scope.content,
        help = 'Quizz without answers'
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
        self.quizz = data

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

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        '''
        The primary view of the PersonalityTestXBlock, shown to students
        when viewing courses.
        '''
        #if not self.isInitialised():
        self.init_quizz(self.resource_string('static/data.json'))

        context = {
            'quizz': self.questions,
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
            'success': True,
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

        return {
            'success': True,
            'questions': self.questions
        }

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        The updating handler.
        """

        self.init_quizz(data)

        if self.isInitialised():
            return {
                'success': True,
                'questions': self.questions
            }
        else:
            return {
                'success': False,
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
                <personalitytest/>
                <personalitytest/>
                </vertical_demo>
             '''),
        ]
