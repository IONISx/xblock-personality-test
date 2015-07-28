/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}')
        .done(function (response) {
            if (response.success) {
                var questions = JSON.parse(response['questions']);
                var myForm = $('.personality-test-form', element);
                var mainDiv = $('.personality-test-form-table', element);
                var list = document.createElement('ol');

                questions.forEach(function (question) {
                    var questionInList = document.createElement('li');
                    var spanQuestion = document.createElement('div');

                    var select = document.createElement('select');
                    var opt = document.createElement('option');
                    opt.text = '-';
                    opt.value = '';
                    select.add(opt);

                    question['answers'].forEach(function (answer) {
                        var option = document.createElement('option');
                        option.text = answer.answer;
                        option.value = question['id'];
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
                errorSpan.addClass('errorSpan');

                submit.append(button);
                submitDiv.append(submit);
                submitDiv.append(errorSpan);
                myForm.append(submitDiv);
            }
        });
    }

    function getScore() {
        var handlerUrl = runtime.handlerUrl(element, 'get_score');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.success) {
                    var score = JSON.parse(response.score);
                    var tblBody = document.createElement('tbody');
                    var max = '';
                    var last = 0;
                    $.each(score, function (key, val) {
                        var tblRow = tblBody.insertRow();
                        tblRow.insertCell().appendChild(document.createTextNode(key));
                        tblRow.insertCell().appendChild(document.createTextNode(val));

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
                            $('.full-result-table', element).append(tblBody);
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

        var json = '[';
        var first = true;
        var errors = 0;
        $('select option:selected', element).each(function () {
            var that = $(this);
            if (that.text() === '-') {
                errors++;
            }
            else {
                if (first) {
                    first = false;
                    json += '{"id":"' + that.val() + '","value":"' + that.text() + '"}';
                }
                else {
                    json += ',{"id":"' + that.val() + '","value":"' + that.text() + '"}';
                }
            }
        });
        json += ']';
        if (errors === 0) {
            $('.error-span', element).text('');
            var handlerUrl = runtime.handlerUrl(element, 'student_submit');
            var tmp = JSON.parse(json);
            var data = { data: tmp };

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

    $('.reset-answers', element).on('click', function () {
        var handlerUrl = runtime.handlerUrl(element, 'reset_answers');
        $.post(handlerUrl, '{}')
            .done(function () {
                initDisplay();
            });
    });
}
