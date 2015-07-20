/* Javascript for PersonalityTestXBlock. */
function PersonalityTestXBlockStudent(runtime, element) {
    function getQuestions () {
        var handlerUrl = runtime.handlerUrl(element, 'get_questions');
        $.post(handlerUrl, '{}')
        .done(function (response) {
            if (response.success) {
                var questions = JSON.parse(response['questions']);
                var myForm = $('#personality-test-form', element);
                var tblBody = document.createElement('tbody');

                questions.forEach(function (question) {
                    var tblRow = tblBody.insertRow();
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

                    tblRow.insertCell().appendChild(document.createTextNode(question.description));
                    var cell = tblRow.insertCell(1);
                    cell.appendChild(select);

                    $('#personality-test-form-table', element).append(tblBody);
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

    getQuestions();

    $('#personality-test-form').on('click', '.save-button', function (e) {
        e.preventDefault();
        // addGroupForm.off('submit');

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
            var handlerUrl = runtime.handlerUrl(element, 'student_submit');
            var tmp = JSON.parse(json);
            var data = { data: tmp };

            $.post(handlerUrl, JSON.stringify(data)).done(function (response) {
                if (response.success) {
                    var getCategoryDescription = runtime.handlerUrl(element, 'get_caterogry_dec');
                    var max = '';
                    var last = 0;
                    var score = JSON.parse(response.score);
                    var tblBody = document.createElement('tbody');

                    $.each(score, function (key, val) {
                        var tblRow = tblBody.insertRow();
                        tblRow.insertCell().appendChild(document.createTextNode(key));
                        tblRow.insertCell().appendChild(document.createTextNode(val));

                        if (val > last) {
                            max = key;
                            last = val;
                        }
                    });

                    var cat = { 'category' : max };
                    $.post(getCategoryDescription, JSON.stringify(cat)).done(function (resp) {
                        if (resp.success) {
                            $('#personality-test-form', element).hide();
                            var resultDiv = $('#results-panel', element);
                            resultDiv.show();

                            $('#category-description-span').text(max + ': ' + resp.description);
                            $('#full-result-table', element).append(tblBody);
                        }
                    });
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
        }
    });
}
