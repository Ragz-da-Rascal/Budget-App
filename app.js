// Budget Controller
var budgetController = (function(){
    
    var expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    expense.prototype.calcPercentage = function(totalIncome) {
       if(totalIncome > 0){
           this.percentage = Math.round((this.value / totalIncome) * 100);           
       } else {
           this.percentage = -1;
       };
        
    };
    
    expense.prototype.getPercentage = function() {
      return this.percentage;  
    };
    
    var income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
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
        percentage: -1,
        
    };
    
    var calcTotal = function(type) {
      
       var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
        /*
        sum = 0;
        [200, 400, 100]
        sum = 0 + 200;
        sum = 200 + 400;
        sum = 600 + 100 = 700
        */
    };
    
    
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new expense(ID, desc, val);
            } else if(type === 'inc' ){
                newItem = new income(ID, desc, val)
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new elem ent
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
           ids = data.allItems[type].map(current => {
               return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            
            // Calculate total income and expenses
            
             calcTotal('exp');
             calcTotal('inc');
            
            // Calculate the budget: income - expenses
            
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            
            if(data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
                data.percentage = -1;
                
            }
            
            
            // Expense = 100 and income 200, spent 50% = 100/200 = 0.5 * 100
            
            
            
        },
        
        calculatePercentages: function() {
            var work = data.allItems.exp;
            work.forEach(curr => {
                curr.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
          var allPerc;
            
          allPerc = data.allItems.exp.map(curr => {
             return curr.getPercentage(); 
          });    
            return allPerc;
        },
        
        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }  
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();

// UI Controller
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescr: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerc: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatBudget = num => {
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3) {
               int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            
            
            dec = '.' + numSplit[1];
            return ' ' + int + dec
    }
    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3) {
               int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            
            
            dec = '.' + numSplit[1];
            return (type === 'exp' ? '-' : '+') + ' ' + int + dec

    
        };
    
    var nodeListForEach = (list, callback) => {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
    
    return {
        getInput: function(){
            
            return{
              // Will be either Income or Expenses
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescr).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  
            }
        },
        addListItem: function(obj, type){
            var html, newHTML, element;
            // Create HTML string with placeholder text
            
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            
            
            
            // Replace the placeholder text with some actual data
            
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteFieldItem(selectorID){
           
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearField: function(){
            var field, fieldsArr;
            
            field = document.querySelectorAll(DOMstrings.inputDescr + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(field);
            
            fieldsArr.forEach(function(current, index, array){
                
                current.value = "";
                
                
            });
            
            fieldsArr[0].focus();
                 
        },
        
        displayBudget: function(obj) {
            
           if(obj.budget >= 0){
            document.querySelector(DOMstrings.budgetLabel).textContent = `$${formatBudget(obj.budget)}`;
           } else {
            document.querySelector(DOMstrings.budgetLabel).textContent = `$ -${formatBudget(obj.budget)}`;
           }
            document.querySelector(DOMstrings.incomeLabel).textContent = `+ ${formatBudget(obj.totalInc)}`;
            document.querySelector(DOMstrings.expenseLabel).textContent = `- ${formatBudget(obj.totalExp)}`;
           
            if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
          
           } else {
               document.querySelector(DOMstrings.percentageLabel).textContent = '--';
           }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPerc);
            
            
            nodeListForEach(fields, (curr, index) => {
                if(percentages[index] > 0){
                curr.textContent = `${percentages[index]}%`;
                } else { 
                    curr.textContent = '--';
                }
                
            });
        },
        
        displayMonth(){
            var now, month, months, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
        },
        
        changeType(){
            var fields;
            
            fields = document.querySelectorAll(
                `${DOMstrings.inputType},  ${DOMstrings.inputDescr}, ${DOMstrings.inputValue}` 
            );
            
            nodeListForEach(fields, curr => {
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
    
})();


// Global App Controller
var controller = (function(budgetCtrl, UiCtrl){

    var setupEventListeners = function(){
        var DOM = UiCtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){
       
            if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }

        });
         document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UiCtrl.changeType);
    };
    
    var updateBudget = function(){
        
        // 1. Calculate the budget
        
        budgetCtrl.calculateBudget();
        
        
        // 2. Return the budget
        
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UiCtrl.displayBudget(budget);
    }; 
    
    var updatePercentages = () => {
        
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read them from the budget controller
        var percentages= budgetCtrl.getPercentages();

        
        // 3. Update the UI with the new percentages
        UiCtrl.displayPercentages(percentages);
        
    };

    var ctrlAddItem = function(){
       var input, newItem;
        // 1. Geth the field input data
        var input = UiCtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UiCtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UiCtrl.clearField();

            // 5. Calculate and update
            updateBudget();
            
            // 6. Calc and update percentages
            updatePercentages();
        }
        
        
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
           
            // 2. Delete the item from the UI
            UiCtrl.deleteFieldItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function(){
            setupEventListeners();
            UiCtrl.displayMonth();
            UiCtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
          });
            console.log(`Application has started`);
        }
    }
    
    
})(budgetController, UIController);


controller.init();































































































