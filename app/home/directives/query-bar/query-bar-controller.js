function queryBarController($scope, watsonFactory, $log) {
    var characterOne = '';
    var characterTwo = '';
    $scope.characterSelected = false;
    $scope.queryPlaceholder = '';
    $scope.characterSelected = false;
    $scope.captureVoice = captureVoice;
    $scope.$on('character-clicked', characterClicked);

    var topFAQ = [
        {
            question: "Have they ever fought together?",
            rank: 1
        },
        {
            question: "Who is smarter?",
            rank: 2
        },
        {
            question: "When did they first meet?",
            rank: 3
        }
    ];
    $scope.getTopFAQ = function() {
        return topFAQ;
    };
    $scope.submitToWatson = function() {
        console.log('submitted input: ' + $scope.formInput);
        watsonFactory.search($scope.formInput)
            .then(function(response) {
                console.log('Watson raw response');
                console.log(response);
                $scope.rankedResult = [];
                $scope.isNoResults = false;
                if (response.status === 200 && response.data.numFound !== 0) {
                    let resultSet = response.data.docs;
                    for (let i = 0; i < 3; i++) {
                        $scope.rankedResult[i] = resultSet[i].title[0] || '';
                    }
                } else {
                    $scope.isNoResults = true;
                }

                $scope.$emit('gotAnswer', {answer: $scope.rankedResult});
            })
            .catch($log.log)
    }


    function characterClicked(event, character) {
        var name = character.name;

        $scope.characterSelected = true;
        $scope.suggestedQuestions = character.suggestedQuestions &&
        ((characterOne && !characterTwo) || (!characterOne && characterTwo)) ? character.suggestedQuestions : false;

        if (!characterOne && characterTwo !== name) {
            characterOne = name;
        } else if (!characterTwo && characterOne !== name) {
            characterTwo = name;
        } else if (name === characterOne) {
            characterOne = '';
        } else if (name === characterTwo) {
            characterTwo = '';
        }

        if (characterOne && !characterTwo) {
            $scope.queryPlaceholder = 'Ask a question about ' + characterOne;
        } else if (!characterOne && characterTwo) {
            $scope.queryPlaceholder = 'Ask a question about ' + characterTwo;
        } else if (characterOne && characterTwo) {
            $scope.queryPlaceholder = 'Ask about ' + characterOne + ' and ' + characterTwo;
        } else {
            $scope.queryPlaceholder = '';
            $scope.characterSelected = false;
        }
    }

    function captureVoice() {
        if (window.hasOwnProperty('webkitSpeechRecognition')) {
            var recognition = new webkitSpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";
            recognition.start();

            recognition.onresult = function(e) {
                document.getElementById('query').value = e.results[0][0].transcript;
                recognition.stop();
            };

            recognition.onerror = function(e) {
                recognition.stop();
            }

        }
    }
}

export default queryBarController;
