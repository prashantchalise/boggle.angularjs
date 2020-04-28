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

        //Init directions
        $scope.directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        // The dictionary lookup object
        var trie_dict = {};
         
 
        $scope.bg = {};
        $scope.activeboxes = [];
        var traverseNodes = []; 

        //INIT APP
        REINIT();
       
       

        //Load Dictionary and add timer inside

        // Do a jQuery Ajax request for the text dictionary
      
        fetch('/dictionary-yawl.txt')
            .then(response => { return response.text() })
            .then(response => {
                response.split('\n').forEach((word) => {
                    //trie_dict = AddToRadixTrie(word, trie_dict); // No radix this time :(
                    AddWords(word);
                });
                console.log(trie_dict);
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

                if (!containsWord($scope.bg.txtInput)) {
                    $scope.error = "Not a valid word.";
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


        //Submit and display result
        $scope.Submit = function () {

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

        //Implements TRIE
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


        //function AddToRadixTrie(word,dict) {
        //    if (word == null || word === '') {
        //        return;
        //    }
        //     var ch = word[0]; // get the first character
        //    if (!dict[ch]) { // create new node when not exists
        //        dict[ch] = { value: ch, count: 1, followables: {} };
        //    } else { // increment count when exist
        //        dict[ch].count += 1;
        //    }
        //    var substr = word.substring(1); // remove first character
        //    if (substr) { // do it for the remaining substring
        //        dict[ch].followables = AddToRadixTrie(substr, dict[ch].followables);
        //    }
        //    return dict;
        //}

      

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

