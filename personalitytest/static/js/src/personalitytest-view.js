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

                            spanQuestion.appendChild(document.createTextNode(++i + '. ' + question.description));
                            questionInList.appendChild(spanQuestion);

                            var spanAnswer = document.createElement('div');
                            spanAnswer.className = 'answer-div';
                            spanAnswer.appendChild(select);

                            questionInList.appendChild(spanAnswer);
                            list.appendChild(questionInList);

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
                    var categoriesList = document.createElement('ol');
                    tmp.forEach(function (item) {
                        var key = item['id'];
                        var val = item['value'];
                        var listElem = document.createElement('li');
                        var keyDiv = document.createElement('span');
                        var valueDiv = document.createElement('span');
                        keyDiv.appendChild(document.createTextNode(key));
                        keyDiv.className = 'category-div';
                        valueDiv.appendChild(document.createTextNode(': ' + val));
                        valueDiv.className = 'score-div';
                        listElem.appendChild(keyDiv);
                        listElem.appendChild(valueDiv);
                        categoriesList.appendChild(listElem);
                        if (val > last) {
                            max = key;
                            last = val;
                        }
                    });

                    var getCategoryDescription = runtime.handlerUrl(element, 'get_caterogry_desc');
                    var cat = { 'category' : max };
                    var categoryH3 = document.createElement('h3');
                    categoryH3.appendChild(document.createTextNode(max));

                    resultDescription.appendChild(categoryH3);

                    $.post(getCategoryDescription, JSON.stringify(cat)).done(function (resp) {
                        if (resp.success) {
                            var resultDiv = $('.results-panel', element);
                            resultDiv.show();

                            var categoryDescritpion = document.createElement('h4');
                            categoryDescritpion.appendChild(document.createTextNode(resp.description));
                            var answersDescritpion = document.createElement('div');
                            answersDescritpion.appendChild(document.createTextNode(resp['answer_description']));
                            categoriesList.className = 'value-div';
                            resultDescription.appendChild(categoryDescritpion);
                            resultDescription.appendChild(answersDescritpion);
                            resultDescription.appendChild(categoriesList);

                            $('.full-result-table', element).append(resultDescription);
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
    $('.reset-answers', element).on('click', function () {
        var handlerUrl = runtime.handlerUrl(element, 'reset_answers');
        $.post(handlerUrl, '{}')
            .done(function () {
                initDisplay();
            });
    });
}
