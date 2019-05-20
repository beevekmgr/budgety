//BUDGE CONTROLLER
var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome) * 100;
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
			data.total[type] = sum;
		});
	};
	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		total: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			//Create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			//Create new item based on 'inc' or 'ext' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			//PUsh it into our data structure
			data.allItems[type].push(newItem);

			//Return the new item
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			//Calculate total incoma and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//Calculate the budget: income - expenses
			data.budget = data.total.inc - data.total.exp;

			//Calcuate the percentage of income that we spent.
			if (data.total.inc > 0) {
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.total.inc);
			});
		},
		getPercentages: function() {
			var allPercentage = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPercentage;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				percentage: data.percentage,
			};
		},
	};
})();

//UI CONTROLLER
var UIController = (function() {
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit, int, dec;
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		dec = numSplit[1];

		if (int.length > 3) {
			int = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, int.length);
		}

		return (type === 'exp' ? '- ' : '+ ')+'Rs. ' + int + '.'+ dec;
	};
	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		};
	}

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //inc or exp ...
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			};
		},
		addListItem: function(obj, type) {
			var html, newHtml, element;
			// Create HTML string with placeholder text

			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;

				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '----';
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
			
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		

		displayMonth: function(){
			var now, year, months;
			
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ['January','February','March','April','May','June','July','August','September','November','December'];

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' ' +year 
		},

		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType +','+
				DOMstrings.inputDescription+','+
				DOMstrings.inputValue
			);

			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputButton).classList.toggle('red');

		},

		getDOMstrings: function() {
			return DOMstrings;
		},
	};
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};
	var updateBudget = function() {
		//1. Calculate the budget
		budgetCtrl.calculateBudget();

		//2. Return the budget
		var budget = budgetCtrl.getBudget();

		//3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		//Calculate percentages
		budgetCtrl.calculatePercentages();

		//Read percentages from the budget conrroller
		var percentages = budgetCtrl.getPercentages();

		//Update the UI the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;
		//1. Get the filed input data
		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			//2. Add the item to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. Add the item to UI
			UICtrl.addListItem(newItem, input.type);

			//4. Clear the fields
			UICtrl.clearFields();

			//5. Calculate and update budget
			updateBudget();

			//6. Calculate and update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. Delete the itm from the data structure
			budgetCtrl.deleteItem(type, ID);
			//2. Delet the item from the UI
			UICtrl.deleteListItem(itemID);

			//3. Update and  show the new bduget
			updateBudget();

			//4. Calculate and update percentages
			updatePercentages();
		}
	};
	return {
		init: function() {
			console.log('App started');
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
			setupEventListeners();
			UICtrl.displayMonth();
		},
	};
})(budgetController, UIController);

controller.init();
