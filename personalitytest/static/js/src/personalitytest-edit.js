/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudio(runtime, element) {
    $(function () {
      $(element).find('.save-button').bind('click', function () {
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
        var data =  { quizz: $('#personality-test-quizz-input', element).val() };

        runtime.notify('save', { state: 'start' });
        $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
            if (response.success) {
              console.log("Saved ! ");
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
    $(element).find('.action-cancel').bind('click', function() {
        runtime.notify('cancel', {});
    });
  });
}
