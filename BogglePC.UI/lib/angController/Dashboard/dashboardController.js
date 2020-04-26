//Created By: Prashant
//Created On: 04/25/2020
// Main function for Boggle 

boggle_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

boggle_app.filter('secondsToDateTime', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])

boggle_app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on(attr.focusOn, function (e) {
            elem[0].focus();
        });
    };
});

boggle_app.directive('autoFocus', function ($timeout) {
    return {
        restrict: 'AC',
        link: function (_scope, _element) {
            $timeout(function () {
                _element[0].focus();
            }, 0);
        }
    };
});

// Service For Ledger 
; (function () {
    'use strict';
    boggle_app.factory('dashboardService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var dashboardServiceFactory = {};

        
        //// Get DDL List by Filter
        //var _getDDLList = function (ddlFilter) {
        //    return $http({
        //        url: serviceBase + 'api/Home/LoadDDLs',
        //        method: "post",
        //        data: ddlFilter
        //    });
        //};

      

         //dashboardServiceFactory.GetDDLByFilter = _getDDLList; 


        return dashboardServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    boggle_app.controller('dashboardController', ['$scope', 'dashboardService', '$uibModal', '$uibModalStack', '$interval', function ($scope, dashboardService, $uibModal, $uibModalStack, $interval) {

        // Variables and declarations 
        $scope.loading = true;

        //Init BG
        $scope.bg = { alphabets: {}, txtInput: "", txtResult: "", LEN: 4, SIDES: 4, D3BOX: new Array(), SIDE_SELECTED: 0, BOXMATRIX: new Array(), TIMER: 180, words: [] };
        $scope.directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        // The dictionary lookup object
        var trie_dict = {};



        //Init Alphabet with weightage in percentage;
        $scope.bg.alphabets = {
            "A": 8.425, "B": 1.492, "C": 2.202, "D": 4.253, "E": 9.802, "F": 2.228, "G": 2.015
            , "H": 6.094, "I": 7.546, "J": 0.153, "K": 1.292, "L": 4.025, "M": 2.406, "N": 6.749, "O": 7.507
            , "P": 1.929, "Qu": 0.853, "R": 7.587, "S": 6.327, "T": 9.356, "U": 2.0, "V": 0.978, "W": 2.560
            , "X": 0.150, "Y": 1.994, "Z": 0.077
        };



        //INIT BOX
        for (let i = 0; i < $scope.bg.LEN; i++) {
            $scope.bg.D3BOX[i] = new Array();
            for (let j = 0; j < $scope.bg.LEN; j++) {
                $scope.bg.D3BOX[i][j] = new Array();
                for (let sides = 0; sides < $scope.bg.SIDES; sides++) {
                    $scope.bg.D3BOX[i][j][sides] = weightedRandom($scope.bg.alphabets, $scope.bg.D3BOX[i][j]);
                }
            }
        };

        //Init Boxmatrix
        LoadBoxMatrix();

        //Load Dictionary and add timer inside

        // Do a jQuery Ajax request for the text dictionary
      
        fetch('dictionary-yawl.txt')
            .then(response => { return response.text() })
            .then(response => {
                response.split('\n').forEach((word) => {
                    add(word);
                });
                //Now Start the timer for first time: 
                StartTimer();
            });

        
        //$.get("dictionary-yawl.txt", function (txt) {

        //    // Get an array of all the words
        //    var words = txt.split("\n");

        //    // And add them as properties to the dictionary lookup
        //    // This will allow for fast lookups later
        //    for (var i = 0; i < words.length; i++) {
        //        dict[words[i]] = true;
        //    }
        
        //});





        // run solver
        let wordListObj = [];
        let coords = [];
        let wordList = [];
        let minWordlen = 3;






        // REGION SCOPE


        //Add New Word
        $scope.addWordToList = function () {
            if ($scope.bg.txtInput.len > 0) {
                $scope.bg.words.push(angular.copy($scope.bg.txtInput));
                $scope.bg.txtInput = "";
            }

            $scope.$broadcast('newItemAdded');
        };

        //On Letter button Clicked
        $scope.OnLetterClicked = function (letter) {
            $scope.$broadcast('newItemAdded');
        };



        //Rotate
        $scope.Rotate = function () {
            $scope.bg.SIDE_SELECTED = ($scope.bg.SIDE_SELECTED + 1) % 4;
            LoadBoxMatrix();
            $scope.$broadcast('newItemAdded');

        };

        $scope.Solve = function () {
            wordListObj = [];
            wordList = [];

            $scope.bg.BOXMATRIX.forEach((row, rowIndex) => {
                row.forEach((col, colIndex) => {
                    solveBoard($scope.bg.BOXMATRIX[rowIndex][colIndex], [rowIndex, colIndex]);
                });
            });

            if (wordList.length) {
                displayResults(wordListObj);
            }
        }
        // ./SCOPE 

        // REGION FUNCTIONS

        //function load box matrix
        function LoadBoxMatrix() {
            for (var i = 0; i < $scope.bg.LEN; i++) {
                $scope.bg.BOXMATRIX[i] = new Array();
                for (var j = 0; j < $scope.bg.LEN; j++) {
                    $scope.bg.BOXMATRIX[i][j] = $scope.bg.D3BOX[i][j][$scope.bg.SIDE_SELECTED];
                }
            }
        };

        //GET Weighted Random based on percentages
        function weightedRandom(prob, arr) {
            let i, sum = 0, r = Math.random();
            for (i in prob) {
                sum += prob[i] / 100;
                if (r <= sum) {
                    if (arr.includes(i)) {
                        return weightedRandom(prob, arr);
                    } else { return i; }
                }
            }
        };


        //Timer function
        function StartTimer() {
            $scope.remainingTime = $scope.bg.TIMER;
            $scope.timeInterval = $interval(function () {
                $scope.remainingTime = $scope.remainingTime - 1;
                if ($scope.remainingTime == 0) {
                    $scope.remainingTime = $scope.bg.TIMER;
                    console.log("restarted");
                }
            }, 1000);
        }

        // SOLVER

        //Get Adjacent letters
        function getAdjacentLetters(currentWord, position, usedPositions) {
            const _directions = $scope.directions.slice(0);
            const [row, col] = position;

            return _directions.reduce((acc, direction) => {
                const [x, y] = direction;
                const rowSum = (x < 0) ? row - Math.abs(x) : row + x;
                const colSum = (y < 0) ? col - Math.abs(y) : col + y;
                if ((rowSum >= 0 && colSum >= 0) && (rowSum < $scope.bg.LEN && colSum < $scope.bg.LEN)) {
                    let adjacent = [rowSum, colSum];
                    let adjacentWord = currentWord + $scope.bg.BOXMATRIX[rowSum][colSum];
                    if (!arrayMatch(usedPositions, adjacent) && isValidPrefix(adjacentWord)) {
                        acc.push(adjacent);
                    }
                }
                return acc;
            }, []);
        }


        function solveBoard(currentWord, currentPosition, coords = [], usedPositions = []) {
            const [row, col] = currentPosition;
            const positions_copy = usedPositions.slice();
            const coords_copy = coords.slice();

            coords_copy.push(currentPosition);

            if (currentWord.length >= minWordlen && containsWord(currentWord) && !inArray(wordList, currentWord)) {
                wordList.push(currentWord);
                wordListObj.push({
                    word: currentWord,
                    coords: coords_copy
                });
                coords = [];
            }

            const adjacents = getAdjacentLetters(currentWord, currentPosition, usedPositions);

            adjacents.forEach(adjacent => {
                positions_copy.push(currentPosition);
                const [x, y] = adjacent;
                const letter = $scope.bg.BOXMATRIX[x][y];
                const word = currentWord + letter;
                solveBoard(word, adjacent, coords_copy, positions_copy);
            });
            return;
        }

        function inArray(arr, item) {
            return (arr.indexOf(item) !== -1);
        };

        function arrayMatch(first, second) {
            return first.some((item) => {
                return item.every((x, index) => {
                    return x === second[index];
                });
            });
        };

        function displayResults(wordListObj) {
            // sort available words by length descending
            wordListObj = wordListObj.sort((a, b) => { return b.word.length - a.word.length; });
            console.log(wordListObj);
        }

        function containsWord(word) {
            if (typeof word !== 'string') {
                throw (`Invalid parameter passed to Trie.containsWord(string word): ${word}`);
            }

            if (word == null || !word) {
                return false;
            }

            let currentNode = trie_dict;
            return word.split('').every((letter, index) => {
                if (!currentNode[letter]) {
                    return false;
                }
                currentNode = currentNode[letter];
                if (index === word.length - 1) {
                    return currentNode.$ === 1;
                }
                return letter;
            });
        };

        function isValidPrefix(prefix) {
            let currentNode = trie_dict;
             return prefix.split('').every(letter => {
                if (!currentNode[letter]) {
                    return false;
                }
                currentNode = currentNode[letter];
                return true;
            });
        };


        function add(word) {
            if (word == null || word === '') {
                return;
            }
            let currentNode = trie_dict;
            word.split('').forEach((letter, index) => {
                if (!currentNode[letter]) {
                    currentNode[letter] = {};
                }
                // reached the end of the word?
                if (index === word.length - 1) {
                    currentNode.$ = 1;
                } else {
                    currentNode = currentNode[letter];
                } 
             });
        };

        // ./SOLVER

        
        //./FUNCTIONS



    }]);
}());

