/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    
    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}').done(function (response) {
            if (response.result === 'success') {
                var questions = JSON.parse(response['questions']);

                return questions;
            }
            else {
                runtime.notify('error',  {
                    title: 'Error : Init failed.',
                    message: 'An error occured while loading the PersonalityTestXBlockStudent form !'
                });
                return false;
            }
        });
    };

    $(function () {

        var quest = getQuestions();
        console.log(quest)

    });
}
