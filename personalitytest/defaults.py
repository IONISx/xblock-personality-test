"""
Default data initializations for the block
"""

# -*- coding: utf-8 -*-

DISPLAY_NAME = 'Personality Test'


DEFAULT_QUIZZ = '''
{
    "meta": {
        "quizz_description": "This is the test description.",
        "result_description": "This is the result description.",
        "quizz_title": "My first personality test !"
    },
    "categories": [
        {
            "description": "description for Category1",
            "title": "Category1"
        },
        {
            "description": "description for Category2",
            "title": "Category2"
        },
        {
            "description": "description for Category3",
            "title": "Category3"
        }
    ],
    "questions": [
        {
            "id": "q1",
            "answers": [
                {
                    "answer": "yes",
                    "categories": "Category1"
                },
                {
                    "answer": "no",
                    "categories": ""
                }
            ],
            "description": "My first question"
        },
        {
            "id": "q2",
            "answers": [
                {
                    "answer": "yes",
                    "categories": "Category1;Category2"
                },
                {
                    "answer": "no",
                    "categories": "Category3"
                }
            ],
            "description": "My second question"
        }
    ]
}
'''
