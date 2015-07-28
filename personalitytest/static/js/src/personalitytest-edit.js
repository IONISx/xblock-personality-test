/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudio(runtime, element) {
    function init() {
        var handlerUrl = runtime.handlerUrl(element, 'get_quizz');
        $.post(handlerUrl, '{}')
            .done(function (response) {
                if (response.success) {
                    var tmp = JSON.parse(response.quizz);
                    var xmlEditor = CodeMirror.fromTextArea(
                        $('.xml-editor').get(0), {
                            mode: 'application/json',
                            lineNumbers: true,
                            lineWrapping: true,
                            matchBrackets: true,
                            autoCloseBrackets: true
                        }
                    );
                    xmlEditor.setValue(JSON.stringify(tmp, null, 4));
                }
            });
    }

    $(function () {
        init();

        $(element).find('.save-button').bind('click', function () {
            var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
            var originalDiv = $('.xml-editor');
            var xmlEditor = originalDiv.next('.CodeMirror')[0].CodeMirror;
            var data =  { quizz: xmlEditor.getValue() };

            var options = {
                url:handlerUrl,
                type:'POST',
                contentType: 'application/json; charset=utf-8',
                data:JSON.stringify(data)
            };

            runtime.notify('save', { state: 'start' });
            $.ajax(options).done(function (response) {
                if (response.success) {
                    runtime.notify('save', { state: 'end' });
                }
                else {
                    runtime.notify('error', {
                        msg: response.errors
                    });
                }
            });
        });

        $(element).find('.action-cancel').bind('click', function () {
            runtime.notify('cancel', {});
        });
    });
}
