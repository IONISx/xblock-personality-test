/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}')
        .done(function (response) {
            if (response.success) {
                var questions = JSON.parse(response['questions']);
                var myForm = $('#personality-test-form', element);

                questions.forEach(function (question) {
                    var div = $('<div class="mainDiv"></div>');
                    var answerDiv = $('<div class="answerDiv"></div>');
                    var questionDiv = $('<div  class="questionDiv"></div>');
                    var span = $('<span style="padding: 20px"></span>').text(question.description);
                    var select = $('<select class="select-answer" ></select>');

                    var opt = new Option('-', false, true);
                    select.append(opt);

                    question['answers'].forEach(function (answer) {
                        var option = new Option(answer.answer, question['id']);
                        select.append(option);
                    });
                    questionDiv.append(span);
                    answerDiv.append(select);

                    div.append(questionDiv);
                    div.append(answerDiv);

                    myForm.append(div);
                });
                var submit = $('<div class="action panel-body">');
                var button = $('<button class="save-button" type="submit">').text('Submit');
                var submitDiv = $('<div class="submitDiv"></div>');
                submit.append(button);
                submitDiv.append(submit);
                myForm.append(submitDiv);
            }
        });
    }

    $(function () {
        getQuestions();

        $('#personality-test-form').on('click', '.save-button', function (e) {
            var json = '{';
            var first = true;
            $('select option:selected', element).each(function () {
                var that = $(this);
                if (!that.val()) {
                    runtime.notify('error',  {
                        title: 'Error : Quizz submission failed.',
                        message: 'Answer to all question please !'
                    });
                    exit;
                }
                else
                {
                    if (first) {
                        json += '{' + that.val() + ':' + that.text() + '}';
                    }
                    else {
                        json += ',{' + that.val() + ':' + that.text() + '}';
                    }
                    console.log(json);
                }
            })
            console.log(json);
            json += '}';
            console.log(json);
            var handlerUrl = runtime.handlerUrl(element, 'student_submit');
            var data = { data: json };

            $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
                if (response.success) {
                    console.log(response.score);
                }
                else {
                    runtime.notify('error',  {
                        title: 'Error : save failed.',
                        message: 'An error occured !'
                    });
                }
            });
        });
    });
}
