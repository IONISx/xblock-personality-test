/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudio(runtime, element) {
    function init() {
        var handlerUrl = runtime.handlerUrl(element, 'get_quizz');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.success) {
                    var xmlEditor = $('.xml-editor', element);
                    xmlEditor.val(response.quizz);
                }
            });
    }

    $(function () {
        init();

        $(element).find('.save-button').bind('click', function () {
            var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
            var data =  { quizz: $('.xml-editor', element).val() };

            runtime.notify('save', { state: 'start' });
            $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
                if (response.success) {
                    runtime.notify('save', { state: 'end' });
                }
                else {
                    runtime.notify('error',  {
                        title: 'Error : save failed.',
                        message: 'Invalid JSON string !'
                    });
                }
            });
        });

        $(element).find('.action-cancel').bind('click', function () {
            runtime.notify('cancel', {});
        });
    });
}
