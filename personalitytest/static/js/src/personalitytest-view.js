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
        var lines = str.split('\n');
        var paragraphsContainer = $('<div />');
        lines.forEach(function (item) {
            $('<p />').text(item).appendTo(paragraphsContainer);
        });
        return paragraphsContainer;
    }
    function addQuestion (question, list, listCounter, studentAnswers) {
        var questionInList = $('<li />');
        var divQuestion = $('<div />')
            .addClass('personality-test-question');

        var select = $('<select />');

        select.append($('<option />'));
        var studentAnswer;

        if (studentAnswers !== '') {
            studentAnswer = getAnswersValue(studentAnswers, question['id']);
        }
        question['answers'].forEach(function (answer) {
            $('<option />', {
                value: question.id,
                text: answer.answer,
                selected: (studentAnswers !== '' && studentAnswer === answer.answer)
            }).appendTo(select);
        });

        divQuestion.append(listCounter + ' ' + question.description);
        questionInList.append(divQuestion);

        var divAnswer = $('<div />')
            .addClass('personality-test-answer');
        divAnswer.append(select);

        questionInList.append(divAnswer);
        list.append(questionInList);
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
                        $('.personality-test-description', element).append(paragraphize(response['quizz_description']));
                        var studentAnswers = '';
                        if (resp.success) {
                            studentAnswers = JSON.parse(resp['answers']);
                        }
                        var myForm = $('.personality-test-form', element);
                        var mainDiv = $('.personality-test-form-table', element);

                        var list = $('<ol />');
                        var ii = 0;
                        questions.forEach(function (question, index) {
                            var i = index + 1;
                            if (question.type === 'group') {
                                var b = $('<b />').addClass('personality-test-group-title');
                                b.append(i + '. ' + question.description);
                                list.append(b);
                                var subList = $('<ol />');
                                question.questions.forEach(function (item) {
                                    ++ii;
                                    addQuestion(item, subList, i + '.' + ii, studentAnswers);
                                });
                                list.append(subList);
                                ii = 0;
                            }
                            else {
                                ii = 0;
                                addQuestion(question, list, i + '.', studentAnswers);
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
                    var resultDescription = $('<div />');
                    var max = '';
                    var last = 0;
                    $.each(score, function (key, val) {
                        tmp.push({ id: key, value: val });
                    });
                    tmp.sort(function (a, b) { return b.value - a.value; });
                    var categoriesList = $('<dl />');
                    tmp.forEach(function (item) {
                        var key = item.id;
                        var val = item.value;
                        var dtElem = $('<dt />');
                        var ddElem = $('<dd />');
                        dtElem.append(key);
                        ddElem.append(val);
                        categoriesList.append(dtElem);
                        categoriesList.append(ddElem);
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
                            var categoryH3 = $('<h3 />');

                            var desc = resp['description'].split('###!###');
                            desc.forEach(function (it) {
                                var tmpP = $('<p />');
                                tmpP.append(paragraphize(it));
                                categoryH3.append(tmpP);
                            });
                            resultDescription.append(categoryH3);

                            var resultDiv = $('.results-panel', element);
                            resultDiv.show();

                            var answersDescritpion = $('<div />');
                            answersDescritpion.append(paragraphize(resp['answer_description']));

                            var tmpP = $('<p />');
                            tmpP.text('Votre score en détail :');
                            resultDescription.append(tmpP);
                            resultDescription.append(categoriesList);
                            resultDescription.append(answersDescritpion);

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
