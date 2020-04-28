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
        $scope.activepane = 'game-pane';

        //Init BG
        $scope.directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        // The dictionary lookup object
        var trie_dict = {};
        
         let coords = [];
 
        $scope.bg = {};
        $scope.activeboxes = [];
        let traverseNodes = []; 

        REINIT();
       
       

        //Load Dictionary and add timer inside

        // Do a jQuery Ajax request for the text dictionary
      
        fetch('/dictionary-yawl.txt')
            .then(response => { return response.text() })
            .then(response => {
                response.split('\n').forEach((word) => {
                    AddWords(word);
                });
                $scope.loading = false;
                //Now Start the timer for first time: 
                StartTimer();
               
            }); 
    
        // REGION SCOPE


        //Add New Word
        $scope.Add = function () {
            if ($scope.bg.txtInput.length >= $scope.bg.MIN) {

                if (inArray($scope.bg.Words, $scope.bg.txtInput)) {
                    $scope.error = "Word already on the list.";
                    return;
                }
                $scope.bg.Words.push($scope.bg.txtInput);

                $scope.bg.WordsObj.push({
                    word: $scope.bg.txtInput,
                    coords: traverseNodes[0],
                    board: $scope.bg.SIDE_SELECTED,
                    score: (($scope.bg.txtInput.length > 7) ? 11 : ($scope.bg.txtInput.length < 5 ? 1 : ($scope.bg.txtInput.length - 3)))
                });

                 $scope.bg.txtInput = "";
            }

        
            $scope.ValidateWord();
            AddWordsToList();
            $scope.$broadcast('newItemAdded');
        };

        //On Letter button Clicked
        $scope.OnLetterClicked = function (letter) {
            $scope.bg.txtInput += letter;
            $scope.ValidateWord();

            $scope.$broadcast('newItemAdded');
        };

        //Rotate
        $scope.Rotate = function () {
            $scope.bg.SIDE_SELECTED = ($scope.bg.SIDE_SELECTED + 1) % 4;
            LoadBoxMatrix();
            $scope.$broadcast('newItemAdded');

        };

        // Undo
        $scope.Undo = function () {
            $scope.bg.txtInput = $scope.bg.txtInput.slice(0, -1);
            $scope.ValidateWord();
            $scope.$broadcast('newItemAdded');
        }; 

        //Clear
        $scope.Clear = function () {
            $scope.bg.txtInput = "";
            $scope.ValidateWord();
            $scope.$broadcast('newItemAdded');

        }; 

        //New
        $scope.NewGame = function () {
            REINIT();
            StartTimer();
            $scope.$broadcast('newItemAdded');
        };


        //Help
        $scope.Help= function () {
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                templateUrl: 'customHelp',
                windowClass: "modal-custom-extension",
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        //Validate Boggle
        $scope.ValidateWord = function () {
            $scope.error = "";
            traverseNodes = []; 
            if ($scope.bg.txtInput.length < 1) { SetActiveBoxes(); return; }
            $scope.bg.txtInput = $scope.bg.txtInput.toUpperCase();
            $scope.bg.txtInput.split('').forEach((letter, index) => {
                TraverseWords(index);
            });

           //If no rows found and txtInput still have some value do a recursion to remove last element;
            if (traverseNodes.length === 0) {
                $scope.bg.txtInput = $scope.bg.txtInput.slice(0, -1);
                $scope.ValidateWord();
            }

            //Now, select the rows with active elements
            SetActiveBoxes();
        }; 
         
        //solve Board
        function TraverseWords(index) {
            var letter = $scope.bg.txtInput[index];
             if (index === 0) {
                $scope.bg.BOXMATRIX.forEach((row, rowIndex) => {
                    row.forEach((col, colIndex) => {
                        if ($scope.bg.BOXMATRIX[rowIndex][colIndex] === letter) {
                            traverseNodes.push(new Array([rowIndex, colIndex]));
                        }
                    });
                });
                return;
            }

            //else get adjacents for other indexes
            getAdjacents(letter);
             
        }

        //Get Adjacent letters
        function getAdjacents(letter) {
            const _directions = $scope.directions.slice(0);
            var newNodes = new Array(); 
            traverseNodes.forEach(position => {
                // Get Last element of that array
                var [row, col] = position[position.length - 1];

                var newadjacents = _directions.reduce((acc, direction) => {
                    const [x, y] = direction;
                    const rowSum = (x < 0) ? row - Math.abs(x) : row + x;
                    const colSum = (y < 0) ? col - Math.abs(y) : col + y;
                    if ((rowSum >= 0 && colSum >= 0) && (rowSum < $scope.bg.LEN && colSum < $scope.bg.LEN)) {
                        let adjacent = [rowSum, colSum];

                        if (!arrayMatch(position, adjacent) && ($scope.bg.BOXMATRIX[rowSum][colSum] === letter)) {
                            acc.push(adjacent);
                        }
                    }
                    return acc;
                }, []);
                 if (newadjacents) {
                    var newposition = new Array();
                    angular.forEach(newadjacents, function (obj) {
                        newposition = angular.copy(position);
                        newposition.push(obj);
                        newNodes.push(newposition);
                    });
                }

            });
            traverseNodes = newNodes; 
        }

          
        //Solve AI
        $scope.SolveBOT = function () {
            $scope.bg.MaxWordListObj = [];
            $scope.bg.MaxWords = [];
            for (var index = 0; index < $scope.bg.SIDES; index++) {
                $scope.bg.BOXMATRIX.forEach((row, rowIndex) => {
                    row.forEach((col, colIndex) => {
                        solveBoard($scope.bg.D3BOX[rowIndex][colIndex][index], [rowIndex, colIndex],index);
                    });
                });
            }
            
            if ($scope.bg.MaxWords.length) {
                // sort available words by length descending
                $scope.bg.MaxWordListObj = $scope.bg.MaxWordListObj.sort((a, b) => { return b.word.length - a.word.length; });
                $scope.bg.MaxWords.forEach(async function (word) {
                    $scope.bg.MaxScore += ((word.length > 7) ? 11 : (word.length < 5 ? 1 : (word.length - 3)));
                }); 
            }
         }

        //Submit and display result
        $scope.Submit = function () {

            $scope.SolveBOT();

            if ($scope.bg.Words.length) {
                // sort available words by length descending
                $scope.bg.WordsObj = $scope.bg.WordsObj.sort((a, b) => { return b.word.length - a.word.length; });
                $scope.bg.Words.forEach(async function (word) {
                    $scope.bg.YourScore += ((word.length > 7) ? 11 : (word.length < 5 ? 1 : (word.length - 3)));
                });
            }

            $scope.activepane = 'results-pane';
        }; 

        // ./SCOPE 

        // REGION FUNCTIONS

        //REINIT
        function REINIT() {

            coords = [];

            $scope.bg = { alphabets: {}, txtInput: "", txtResult: "", LEN: 4, MIN: 3, SIDES: 4, D3BOX: new Array(), SIDE_SELECTED: 0
                , BOXMATRIX: new Array(), TIMER: 180, WordsObj:[], Words: [], YourScore: 0, MaxWords: [], MaxWordListObj:[], MaxScore: 0 };
            $scope.activeboxes = [];
            traverseNodes = [];

            //Init Alphabet with weightage in percentage;
            $scope.bg.alphabets = {
                "A": 8.425, "B": 1.492, "C": 2.202, "D": 4.253, "E": 9.802, "F": 2.228, "G": 2.015
                , "H": 6.094, "I": 7.546, "J": 0.153, "K": 1.292, "L": 4.025, "M": 2.406, "N": 6.749, "O": 7.507
                , "P": 1.929, "Q": 0.453, "R": 7.587, "S": 6.327, "T": 9.356, "U": 2.0, "V": 0.978, "W": 2.560
                , "X": 0.150, "Y": 1.994, "Z": 0.477
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

            $scope.activepane = 'game-pane';


        }

        //function load box matrix
        function LoadBoxMatrix() {
            for (var i = 0; i < $scope.bg.LEN; i++) {
                $scope.bg.BOXMATRIX[i] = new Array();
                for (var j = 0; j < $scope.bg.LEN; j++) {
                    $scope.bg.BOXMATRIX[i][j] = $scope.bg.D3BOX[i][j][$scope.bg.SIDE_SELECTED];
                 }
            }
            SetActiveBoxes();
         };

        function SetActiveBoxes() {
            $scope.activeboxes = [];
            if (!traverseNodes[0]) return;
             $scope.bg.BOXMATRIX.forEach((row, rowIndex) => {
                row.forEach((col, colIndex) => {
                    if (arrayMatch(traverseNodes[0], [rowIndex, colIndex])) {
                        $scope.activeboxes.push(true);
                    } else { $scope.activeboxes.push(false); }
                });
            });
        }

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

            $interval.cancel($scope.timeInterval);

            $scope.remainingTime = $scope.bg.TIMER;
            $scope.timeInterval = $interval(function () {
                $scope.remainingTime = $scope.remainingTime - 1;
                if ($scope.remainingTime == 0) {
                    $scope.Submit();
                }
            }, 1000);

        }

        // SOLVER
        // CODE Is copied for deep down recursive approach. 

        //solve Board
        function solveBoard(currentWord, currentPosition, currentside, coords = [], usedPositions = []) {
            const [row, col] = currentPosition;
            const positions_copy = usedPositions.slice();
            const coords_copy = coords.slice();

            coords_copy.push(currentPosition);

            if (currentWord.length >= $scope.bg.MIN && containsWord(currentWord) && !inArray($scope.bg.MaxWords, currentWord)) {
                $scope.bg.MaxWords.push(currentWord);
                $scope.bg.MaxWordListObj.push({
                    word: currentWord,
                    coords: coords_copy,
                    board: currentside,
                    score: ((currentWord.length > 7) ? 11 : (currentWord.length < 5 ? 1 : (currentWord.length - 3)))
                });
                coords = [];
            }

            const adjacents = getAdjacentLetters(currentWord, currentside, currentPosition, usedPositions);

            adjacents.forEach(adjacent => {
                positions_copy.push(currentPosition);
                const [x, y] = adjacent;
                const letter = $scope.bg.D3BOX[x][y][currentside];
                const word = currentWord + letter;
                solveBoard(word, adjacent, currentside, coords_copy, positions_copy);
            });
            return;
        }

        //Get Adjacent letters
        function getAdjacentLetters(currentWord, currentside, position, usedPositions) {
            const _directions = $scope.directions.slice(0);
            const [row, col] = position;

            return _directions.reduce((acc, direction) => {
                const [x, y] = direction;
                const rowSum = (x < 0) ? row - Math.abs(x) : row + x;
                const colSum = (y < 0) ? col - Math.abs(y) : col + y;
                if ((rowSum >= 0 && colSum >= 0) && (rowSum < $scope.bg.LEN && colSum < $scope.bg.LEN)) {
                    let adjacent = [rowSum, colSum];
                    let adjacentWord = currentWord + $scope.bg.D3BOX[rowSum][colSum][currentside];
                    if (!arrayMatch(usedPositions, adjacent) && isValidPrefix(adjacentWord)) {
                        acc.push(adjacent);
                    }
                }
                return acc;
            }, []);
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

        
        function containsWord(word) {
            if (typeof word !== 'string') {
                console.log("error");
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

        function AddWords(word) {
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

        //Add Words to List
        function AddWordsToList() {
            $scope.bg.txtResult = "";
            angular.forEach($scope.bg.Words, function (word) {
                $scope.bg.txtResult += word + '\n';
            });
        }
       
        
        //./FUNCTIONS

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };


    }]);
}());

