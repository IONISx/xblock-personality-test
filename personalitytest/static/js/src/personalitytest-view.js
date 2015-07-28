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

                        questions.forEach(function (question) {
                            var questionInList = document.createElement('li');
                            var spanQuestion = document.createElement('div');

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

                            spanQuestion.appendChild(document.createTextNode(question.description));
                            questionInList.appendChild(spanQuestion);

                            var spanAnswer = document.createElement('div');
                            spanAnswer.appendChild(select);

                            questionInList.appendChild(spanAnswer);
                            list.appendChild(questionInList);

                            mainDiv.append(list);
                        });
                        var submit = $('<div class="action panel-body">');
                        var button = $('<button class="save-button" type="submit">').text('Submit');
                        var errorSpan = $('<span class="error-span"></span>');
                        var submitDiv = $('<div class="submitDiv"></div>');

                        submit.append(button);
                        submitDiv.append(submit);
                        submitDiv.append(errorSpan);
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
                    var mainDiv = document.createElement('div');
                    var max = '';
                    var last = 0;
                    $.each(score, function (key, val) {
                        tmp.push({ id: key, value: val });
                    });
                    tmp.sort(function (a, b) { return b.value - a.value; });
                    tmp.forEach(function (item) {
                        var key = item['id'];
                        var val = item['value'];
                        var pairDiv = document.createElement('div');
                        var keyDiv = document.createElement('span');
                        var valueDiv = document.createElement('span');
                        keyDiv.appendChild(document.createTextNode(key));
                        valueDiv.appendChild(document.createTextNode(val));
                        valueDiv.className = 'valueDiv';
                        pairDiv.appendChild(keyDiv);
                        pairDiv.appendChild(valueDiv);
                        mainDiv.appendChild(pairDiv);
                        if (val > last) {
                            max = key;
                            last = val;
                        }
                    });

                    var getCategoryDescription = runtime.handlerUrl(element, 'get_caterogry_desc');
                    var cat = { 'category' : max };
                    $.post(getCategoryDescription, JSON.stringify(cat)).done(function (resp) {
                        if (resp.success) {
                            var resultDiv = $('.results-panel', element);
                            resultDiv.show();

                            $('.category-description-span').text(max + ': ' + resp.description);
                            $('.full-result-table', element).append(mainDiv);
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
