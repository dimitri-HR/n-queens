// This file is a Backbone Model (don't worry about what that means)
// It's part of the Board Visualizer
// The only portions you need to work on are the helper functions (below)

(function() {

  window.Board = Backbone.Model.extend({

    initialize: function (params) {
      if (_.isUndefined(params) || _.isNull(params)) {
        console.log('Good guess! But to use the Board() constructor, you must pass it an argument in one of the following formats:');
        console.log('\t1. An object. To create an empty board of size n:\n\t\t{n: %c<num>%c} - Where %c<num> %cis the dimension of the (empty) board you wish to instantiate\n\t\t%cEXAMPLE: var board = new Board({n:5})', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: grey;');
        console.log('\t2. An array of arrays (a matrix). To create a populated board of size n:\n\t\t[ [%c<val>%c,%c<val>%c,%c<val>%c...], [%c<val>%c,%c<val>%c,%c<val>%c...], [%c<val>%c,%c<val>%c,%c<val>%c...] ] - Where each %c<val>%c is whatever value you want at that location on the board\n\t\t%cEXAMPLE: var board = new Board([[1,0,0],[0,1,0],[0,0,1]])', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: grey;');
      } else if (params.hasOwnProperty('n')) {
        this.set(makeEmptyMatrix(this.get('n')));
      } else {
        this.set('n', params.length);
      }
    },

    rows: function() {
      return _(_.range(this.get('n'))).map(function(rowIndex) {
        return this.get(rowIndex);
      }, this);
    },

    togglePiece: function(rowIndex, colIndex) {
      this.get(rowIndex)[colIndex] = + !this.get(rowIndex)[colIndex];
      this.trigger('change');
    },

    _getFirstRowColumnIndexForMajorDiagonalOn: function(rowIndex, colIndex) {
      return colIndex - rowIndex;
    },

    _getFirstRowColumnIndexForMinorDiagonalOn: function(rowIndex, colIndex) {
      return colIndex + rowIndex;
    },

    hasAnyRooksConflicts: function() {
      return this.hasAnyRowConflicts() || this.hasAnyColConflicts();
    },

    hasAnyQueenConflictsOn: function(rowIndex, colIndex) {
      return (
        this.hasRowConflictAt(rowIndex) ||
        this.hasColConflictAt(colIndex) ||
        this.hasMajorDiagonalConflictAt(this._getFirstRowColumnIndexForMajorDiagonalOn(rowIndex, colIndex)) ||
        this.hasMinorDiagonalConflictAt(this._getFirstRowColumnIndexForMinorDiagonalOn(rowIndex, colIndex))
      );
    },

    hasAnyQueensConflicts: function() {
      return this.hasAnyRooksConflicts() || this.hasAnyMajorDiagonalConflicts() || this.hasAnyMinorDiagonalConflicts();
    },

    _isInBounds: function(rowIndex, colIndex) {
      return (
        0 <= rowIndex && rowIndex < this.get('n') &&
        0 <= colIndex && colIndex < this.get('n')
      );
    },


/*
         _             _     _
     ___| |_ __ _ _ __| |_  | |__   ___ _ __ ___ _
    / __| __/ _` | '__| __| | '_ \ / _ \ '__/ _ (_)
    \__ \ || (_| | |  | |_  | | | |  __/ | |  __/_
    |___/\__\__,_|_|   \__| |_| |_|\___|_|  \___(_)

 */
    /*=========================================================================
    =                 TODO: fill in these Helper Functions                    =
    =========================================================================*/

    _hasSingleLineConflict: function (index, arrStr) {
      arrStr = arrStr || this.get(index).join(''); // "0100"
      var arrNum = parseInt(arrStr, 2);    // 4
      var n = arrStr.length;
      return !!(Math.pow(2, n - 1) % arrNum);
    },

    // ROWS - run from left to right
    // --------------------------------------------------------------
    //
    // test if a specific row on this board contains a conflict
    hasRowConflictAt: function(index) {
      return this._hasSingleLineConflict(index);
    },

    // test if any rows on this board contain conflicts
    hasAnyRowConflicts: function() {
      // console.log('this.get(0)', this.get(0));
      for (var index = 0; index < this.get(0).length; index++) {
        if (this.hasRowConflictAt(index)) {
          return true;
        }
      }
      return false;
    },

    // COLUMNS - run from top to bottom
    // --------------------------------------------------------------
    //
    // test if a specific column on this board contains a conflict
    hasColConflictAt: function(index) {
      var arrStr = '';
      for (var i = 0; i < this.get(0).length; i++) {
        arrStr += this.get(i)[index];
      }
      return this._hasSingleLineConflict(index, arrStr);
    },

    // test if any columns on this board contain conflicts
    hasAnyColConflicts: function() {
      for (var index = 0; index < this.get(0).length; index++) {
        if (this.hasColConflictAt(index)) {
          return true;
        }
      }
      return false;
    },


    _stringifyDiagonal: function (indexAtFirstRow, diagonal) {
      var col;
      var row;
      var arrStr = '';
      var len = this.get(0).length;

      if (diagonal === 'major') {
        // index of the first row and col to start
        col = indexAtFirstRow < 0 ? 0 : indexAtFirstRow;
        row = indexAtFirstRow < 0 ? -indexAtFirstRow : 0;
        for (row, col; row < len; row++, col++) {
          arrStr += this.get(row)[col];
        }
      }

      if (diagonal === 'minor') {
        // index of the first row and col to start
        col = indexAtFirstRow > len ? len - 1 : indexAtFirstRow;
        row = indexAtFirstRow > len ? indexAtFirstRow - (len - 1) : 0;

        for (row, col; row < len; row++, col--) {
          arrStr += this.get(row)[col];
        }
      }
      return arrStr;
    },



    // Major Diagonals - go from top-left to bottom-right
    // --------------------------------------------------------------
    //
    // test if a specific major diagonal on this board contains a conflict
    hasMajorDiagonalConflictAt: function(majorDiagonalColumnIndexAtFirstRow) {
      var index = majorDiagonalColumnIndexAtFirstRow;
      var arrStr = this._stringifyDiagonal(index, 'major');
      return this._hasSingleLineConflict(index, arrStr);
    },

    // test if any major diagonals on this board contain conflicts
    hasAnyMajorDiagonalConflicts: function() {
      var arrStr;
      var len = this.get(0).length;

      for (var index = 2 - len; index < len - 2; index++) {
        arrStr = this._stringifyDiagonal(index, 'major');
        if (this.hasMajorDiagonalConflictAt(index)) {
          return true;
        }
      }
      return false;
    },


    // Minor Diagonals - go from top-right to bottom-left
    // --------------------------------------------------------------
    //
    // test if a specific minor diagonal on this board contains a conflict
    hasMinorDiagonalConflictAt: function(minorDiagonalColumnIndexAtFirstRow) {
      var index = minorDiagonalColumnIndexAtFirstRow;
      var arrStr = this._stringifyDiagonal(index, 'minor');
      return this._hasSingleLineConflict(index, arrStr);
    },

    // test if any minor diagonals on this board contain conflicts
    hasAnyMinorDiagonalConflicts: function() {
      var arrStr;
      var len = this.get(0).length;

      for (var index = len + (len - 2); index > 0; index--) {
        arrStr = this._stringifyDiagonal(index, 'minor');
        if (this.hasMinorDiagonalConflictAt(index)) {
          return true;
        }
      }
      return false;
    }

    /*--------------------  End of Helper Functions  ---------------------*/


  });

  var makeEmptyMatrix = function(n) {
    return _(_.range(n)).map(function() {
      return _(_.range(n)).map(function() {
        return 0;
      });
    });
  };

}());
