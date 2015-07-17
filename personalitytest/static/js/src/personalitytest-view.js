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
                        var select = $('<select ></select>');

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
                    var button = $('<button class="btn btn-block btn-lg" type="submit">').text('Submit');
                    var submitDiv = $('<div class="submitDiv"></div>');
                    submit.append(button);
                    submitDiv.append(submit);
                    myForm.append(submitDiv);
                }
            });
    }

    $(function () {
        getQuestions();
    });
}
