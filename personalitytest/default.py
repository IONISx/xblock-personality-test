"""
Default data initializations for the block
"""

# -*- coding: utf-8 -*-


DEFAULT_QUIZZ = '''
{
  "categories": [
      { "title": "Category1", "description": "description for Category1" }
    ],
  "questions": [
    {
      "id": "q1", "description": "My first question",
      "answers": [{"answer": "yes", "categories": "Category1" },{"answer": "no", "categories": ""}]
    },
    {
      "id": "q2", "description": "My second question","answers":
        [{"answer": "yes", "categories": "Category1;Category2" },{"answer": "no", "categories": "Category3"}]
    }
  ]
}
'''
