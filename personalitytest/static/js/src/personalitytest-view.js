/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.result === 'success') {
                    var questions = JSON.parse(response['questions']);
                    var myForm = $('#personality-test-form', element);

                    questions.forEach(function (question) {
                        var div = $('<div></div>');
                        var span = $('<span></span>').text(question.description);
                        var select = $('<select></select>');
                        var options = $('<option></option>');
                        question['answers'].forEach(function (answer) {
                            console.log(answer);
                            var option = new Option(answer.answer, answer.answer);
                            select.append(option);
                        });
                        div.append(span);
                        div.append(select);
                        myForm.append(div);
                    });
                }
                else {
                    runtime.notify('error',  {
                        title: 'Error : Init failed.',
                        message: 'An error occured while loading the PersonalityTestXBlockStudent form !'
                    });
                }
            });
    }

    $(function () {
        getQuestions ();
    });
}
