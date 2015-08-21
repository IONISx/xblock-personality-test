/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    function getAnswersValue(answers, id) {
        var tmp = '';

        answers.forEach(function (item) {
            if (item['id'] === id) {
                tmp = item['value'];
                return false;
            }
        });
        return tmp;
    }

    function paragraphize (str) {
        var tmp = str.split('\n');
        var buff = document.createElement('div');
        tmp.forEach(function (item) {
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(item));
            buff.appendChild(p);
        });
        return buff;
    }
    function addQuestion (question, list, i, studentAnswers) {
        var questionInList = document.createElement('li');
        var spanQuestion = document.createElement('div');
        spanQuestion.className = 'question-div';

        var select = document.createElement('select');
        var opt = document.createElement('option');
        opt.text = '';
        opt.value = '';
        select.add(opt);
        var studentAnswer = '';

        if (studentAnswers !== '') {
            studentAnswer = getAnswersValue(studentAnswers, question['id']);
        }
        question['answers'].forEach(function (answer) {
            var option = document.createElement('option');
            option.text = answer.answer;
            option.value = question['id'];
            if (studentAnswers !== '' && studentAnswer === answer.answer) {
                option.selected = true;
            }
            select.add(option);
        });

        spanQuestion.appendChild(document.createTextNode(i + '. ' + question.description));
        questionInList.appendChild(spanQuestion);

        var spanAnswer = document.createElement('div');
        spanAnswer.className = 'answer-div';
        spanAnswer.appendChild(select);

        questionInList.appendChild(spanAnswer);
        list.appendChild(questionInList);
    }

    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}')
        .done(function (response) {
            if (response.success) {
                var answersHandleUrl = runtime.handlerUrl(element, 'get_answers');
                $.post(answersHandleUrl, '{}')
                    .done(function (resp) {
                        var questions = JSON.parse(response['questions']);
                        var studentAnswers = '';
                        if (resp.success) {
                            studentAnswers = JSON.parse(resp['answers']);
                        }
                        var myForm = $('.personality-test-form', element);
                        var mainDiv = $('.personality-test-form-table', element);

                        var list = document.createElement('ol');
                        var i = 0;
                        questions.forEach(function (question) {
                            if (question.type === 'group') {
                                var b = document.createElement('b');
                                b.appendChild(document.createTextNode(question.description));
                                list.appendChild(b);
                                var subList = document.createElement('ol');
                                question.questions.forEach(function (item) {
                                    addQuestion(item, subList, ++i, studentAnswers);
                                });
                                list.appendChild(subList);
                            }
                            else {
                                addQuestion(question, list, ++i, studentAnswers);
                            }
                            mainDiv.append(list);
                        });
                        var submit = $('<div class="action">');
                        var button = $('<button class="save-button" type="submit">').text('Valider');
                        var errorSpan = $('<span class="error-span"></span>');
                        var submitDiv = $('<div class="submit-div"></div>');

                        submit.append(errorSpan);
                        submit.append(button);
                        submitDiv.append(submit);
                        myForm.append(submitDiv);
                    });
            }
        });
    }

    function getScore() {
        var handlerUrl = runtime.handlerUrl(element, 'get_score');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.success) {
                    var score = JSON.parse(response.score);

                    var tmp = [];
                    var resultDescription = document.createElement('div');
                    var max = '';
                    var last = 0;
                    $.each(score, function (key, val) {
                        tmp.push({ id: key, value: val });
                    });
                    tmp.sort(function (a, b) { return b.value - a.value; });
                    var categoriesList = document.createElement('dl');
                    tmp.forEach(function (item) {
                        var key = item['id'];
                        var val = item['value'];
                        var dtElem = document.createElement('dt');
                        var ddElem = document.createElement('dd');
                        dtElem.appendChild(document.createTextNode(key));
                        ddElem.appendChild(document.createTextNode(val));
                        categoriesList.appendChild(dtElem);
                        categoriesList.appendChild(ddElem);
                        if (val > last) {
                            max = key;
                            last = val;
                        }
                    });

                    var getCategoryDescription = runtime.handlerUrl(element, 'get_caterogry_desc');
                    var maxScores = tmp.filter(function (a) { return a['value'] === last; });
                    max = maxScores.map(function (a) { return a['id']; });

                    var cat = { 'categories' : max };
                    $.post(getCategoryDescription, JSON.stringify(cat)).done(function (resp) {
                        if (resp.success) {
                            var categoryH3 = document.createElement('h3');

                            var desc = resp['description'].split('###!###');
                            desc.forEach(function (it) {
                                var tmpP = document.createElement('p');
                                tmpP.appendChild(paragraphize(it));
                                categoryH3.appendChild(tmpP);
                            });
                            resultDescription.appendChild(categoryH3);

                            var resultDiv = $('.results-panel', element);
                            resultDiv.show();

                            var answersDescritpion = document.createElement('div');
                            answersDescritpion.appendChild(paragraphize(resp['answer_description']));

                            var tmpP = document.createElement('p');
                            tmpP.appendChild(document.createTextNode('Votre score en détail :'));
                            resultDescription.appendChild(tmpP);
                            resultDescription.appendChild(categoriesList);
                            resultDescription.appendChild(answersDescritpion);

                            $('.full-result-table', element).html(resultDescription);
                        }
                    });
                }
            });
    }

    function initDisplay() {
        var handlerUrl = runtime.handlerUrl(element, 'get_score');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.success) {
                    $('.personality-test-form', element).hide();
                    $('.results-panel', element).show();
                }
                else {
                    $('.personality-test-form', element).show();
                    $('.results-panel', element).hide();
                }
            });
    }

    getQuestions();
    getScore();
    initDisplay();

    $('.personality-test-form').on('click', '.save-button', function (e) {
        e.preventDefault();
        var answers = [];
        var errors = 0;
        $('select option:selected', element).each(function () {
            var that = $(this);
            if (that.val() === '') {
                errors++;
                return false;
            }
            else {
                answers.push({ id: that.val(), value: that.text() });
            }
        });

        if (errors === 0) {
            $('.error-span', element).text('');
            var handlerUrl = runtime.handlerUrl(element, 'student_submit');
            var data = { data: answers };
            $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
                if (response.success) {
                    getScore();
                    initDisplay();
                }
                else {
                    runtime.notify('error',  {
                        title: 'Error : save failed.',
                        message: 'An error occured !'
                    });
                }
            });
        }
        else {
            console.log('Vous devez répondre à toutes les questions !');
            $('.error-span', element).text('Vous devez répondre à toutes les questions !');
        }
    });
    $('.personality-test-form').on('change', 'select', function () {
        var handlerUrl = runtime.handlerUrl(element, 'update_answers');
        var answers = Array.prototype.map.call($('select option:selected', element), function (el) {
            var $el = $(el);
            return { id: $el.val(), value: $el.text() };
        });
        answers = answers.filter(function (a) { return a['value'] !== ''; });
        var data = { data: answers };
        $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
            if (response.success) {
            }
            else {
                runtime.notify('error',  {
                    title: 'Error : save failed.',
                    message: 'An error occured !'
                });
            }
        });
    });
    $('.reset-answers-btn', element).on('click', function () {
        var handlerUrl = runtime.handlerUrl(element, 'reset_answers');
        $.post(handlerUrl, '{}')
            .done(function () {
                initDisplay();
            });
    });
}
