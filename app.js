// Budget controller
var BudgetController = (function () {
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function (type) {
		var sum = 0;

		data.allItems[type].forEach(function (cur) {
			sum += cur.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	return {
		addItem: function (type, des, val) {
			var newItem, ID;

			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create new item based on type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// push it to data structure
			data.allItems[type].push(newItem);

			// return new element
			return newItem;
		},
		calculateBudget: function () {
			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
		},
		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		logData: function () {
			console.log(data);
		}
	}
})();



// UI Controller
var UIController = (function () {
	// UI Selectors
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list'
	};

	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			}
		},
		addListItem: function (obj, type) {
			var html, newHtml, element;
			// create HTML string with placeholder text

			if (type === 'inc') {
				element = DOMStrings.incomeContainer;

				html = '<div class="item clearfix" id="income-%id%"><div class="item__description"%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMStrings.expensesContainer;

				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}


			// replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', obj.value);

			// insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (field) {
				field.value = '';
			});

			fieldsArr[0].focus();
		},
		getDOMStrings: function () {
			return DOMStrings;
		}
	}
})();




// global app controller
var controller = (function (BudgetCtrl, UICtrl) {

	function setupEventListeners() {
		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});
	}

	function updateBudget() {
		// 1. calculate the budget
		BudgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = BudgetCtrl.getBudget();

		// 3. display the budget
		console.log(budget);
	}

	function ctrlAddItem() {
		var input, newItem
		// 1. Get the field input data
		input = UICtrl.getInput();

		if (input.description !== '' && !Number.isNaN(input.value) && input.value > 0) {
			// 2. add the item to the budget controller
			newItem = BudgetController.addItem(input.type, input.description, input.value);

			// 3. add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. clear the fields
			UICtrl.clearFields();

			// 5. calculate and update budget
			updateBudget();
		}
	}

	return {
		init: function () {
			setupEventListeners();
		}
	}
})(BudgetController, UIController);

controller.init();