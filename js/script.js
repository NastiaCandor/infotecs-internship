const form = document.querySelector('.form'),
      editBtns = document.querySelector('.btn-wrapper');

const btnsForm = form.querySelectorAll('.button');

const btnAdd = document.getElementById('btn-add'),
      btnNew = document.getElementById('btn-new'),
      btnDelete = document.getElementById('btn-delete'),
      btnEdit = document.getElementById('btn-edit'),
      btnWaiting = document.getElementById('btn-waiting'),
      btnInProgress = document.getElementById('btn-inprogress'),
      btnCompleted = document.getElementById('btn-completed'),
      btnSave = document.getElementById('btn-save');

const inputTodo = document.getElementById('description-todo'),
      inputSearch = document.getElementById('search-todo');

const todoList = document.querySelector('.todo-list');

const todoTitle = document.querySelector('.todo-title');

let tasks;
// Проверка есть ли уже задачи
!localStorage.tasks ? tasks = [] : tasks = JSON.parse(localStorage.getItem('tasks'));

// Id последней задачи
let idTodo = tasks.length;

// Шаблон задачи
function Task(description, id) {
    this.id = id;
    this.description = description;
    this.waiting = true;
    this.inprogress = false;
    this.comleted = false;
}

// Переключение показа формы "Добавления задачи" на "Редактирование" и наоборот
const switchForms = (flag) => {
    if (flag) { // Смена создания задачи на редактирование выбранной
        form.classList.remove('active');
        editBtns.classList.add('active');
    } else { // Смена редактирования выбранной задачи на создание новой
        form.classList.add('active');
        editBtns.classList.remove('active');
    }
};

// Смена показа кнопок "Добавить" и "Сохранить"
const switchBtnsForm = (flag) => {
    if (flag) { // Смена кнопки "Добавить" на "Сохранить"
        btnsForm[0].classList.remove('hidden');
        btnsForm[1].classList.add('hidden');
    } else { // Смена кнопки "Сохранить" на "Добавить"
        btnsForm[0].classList.add('hidden');
        btnsForm[1].classList.remove('hidden');
    }
};

// Кнопка открытия формы добавления новой задачи
btnNew.addEventListener('click', () => {
    inputTodo.value = ''; // Сброс ввода в input в случае если ранее редактировалась задача
    switchForms(false);
    todoTitle.innerHTML = 'Новая задача';
    inputTodo.placeholder = 'Задача...';
    switchBtnsForm(true);
});

// Добавление задач в локальное хранилище
const updateStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Шаблон для создания задачи на страинце
const createTemplate = (task, index, status) => {
    return `
    <div class="todo-item">
        <button class="button-task ${task.inprogress ? 'inprogress' : ''}" data-id='${index}'>${task.description}</button>
        <div data-id='${index}' class='circle ${status}'></div>
    </div>
    `;
};

// Заполнение списка задач с учетом статуса их выполнения
const fillTodoList = () => {
    todoList.innerHTML = "";
    if (tasks.length > 0) {
        tasks.forEach((item, index) => {
            if (item.waiting) {
                todoList.innerHTML += createTemplate(item, index, 'waiting');
            } else if (item.inprogress) {
                todoList.innerHTML += createTemplate(item, index, 'inprogress');
            } else {
                todoList.innerHTML += createTemplate(item, index, 'complete');
            }
        });
    }
};

// Заполнение списка при загрузке страницы
fillTodoList();

// Добавление новой задачи с обновлением хранилища и заполнения списка на странице
btnAdd.addEventListener('click', () => {
    if (inputTodo.value != '') {
        tasks.push(new Task(inputTodo.value, idTodo));
        idTodo = tasks.length;
        updateStorage();
        fillTodoList();
        inputTodo.value = ''; // сброс введенной задачи в input
    }
});

// Обновление индексов в Tasks в соответсвии с их порядком в списке
const updateIdTodo =  () => {
    tasks.forEach((item, index) => {
         item.id = index;
    });
};

// Удаление задачи
const deleteTodo = (id) => {
    tasks = tasks.filter(task => task.id != id); // фильтрация задач
    updateIdTodo(); // обновление индексов задач
    updateStorage(); // обновление локального хранилища
    fillTodoList(); // обновление списка на странице
    idTodo = tasks.length; // обновление последнего индекса задачи
    todoTitle.innerHTML = 'Выберете задачу или создайте новую';
    editBtns.classList.remove('active'); // скрытие кнопок редактирования
};

let todoId; // Индекс выбранной задачи
let todoName; // Наименование выбранной задачи

// Обновление статуса текущей задачи в зависимости от нажатой кнопки
const changeTaskStatus = (id, num) => {
    switch(num) {
        case 0: // Кнопка "Ожидает"
            tasks[id].waiting = true;
            tasks[id].inprogress = false;
            tasks[id].comleted = false;
            break;
        case 1: // Кнопка "В процессе"
            tasks[id].waiting = false;
            tasks[id].inprogress = true;
            tasks[id].comleted = false;
            break;
        case 2: // Кнопка "Выполнена"
            tasks[id].waiting = false;
            tasks[id].inprogress = false;
            tasks[id].comleted = true;
            break;
    }
    updateStorage(); // Обновление локального хранилища
};

// Обновление статуса задачи по клику на кружок статуса
// Смена по кругу Ожидает -> В процессе -> Выполнена 
const changeStatus = (id) => {
    const status = document.querySelectorAll('.circle').item(id).classList;
    if ( status.contains('waiting') ) {
        status.remove('waiting');
        status.add('inprogress');
        status.remove('complete');
        changeTaskStatus(id, 1);
    } else if ( status.contains('inprogress') ) {
        status.remove('waiting');
        status.remove('inprogress');
        status.add('complete');
        changeTaskStatus(id, 2);
    } else {
        status.add('waiting');
        status.remove('inprogress');
        status.remove('complete');
        changeTaskStatus(id, 0);
    }
};

// Клик по задаче из списка
todoList.addEventListener('click', (event) => {
    todoName = event.target.textContent; // Наименование задачи
    todoId = event.target.dataset.id; // Индекс задачи
    // Если клик по самой задаче
    if (event.target.textContent != '') {
        switchForms(true); // Показ формы изменения выбранной задачи
        const filler = 'Текущая задача:<br> <span class="todoName">';
        todoTitle.innerHTML = filler + todoName + '</span>';
    } else { // Если клик по кружку статуса задачи
        changeStatus(todoId); // смена статуса
    }
    
});

// Клик по кнопке удаления
btnDelete.addEventListener('click', () => {
    deleteTodo(todoId);
});

// Кнопка редактирования выбранной задачи
btnEdit.addEventListener('click', () => {
    switchForms(false); // Смена формы на Сохранение и добавление
    inputTodo.value = todoName; // Ввод редактируемой задачи в input
    const filler = 'Изменить задачу:<br><br> <span class="todoName">'; 
    todoTitle.innerHTML = filler + todoName + '</span>'; // Изменение заголовка 
    switchBtnsForm(false); // Смена кнопки на Сохранение
});

// Кнопка сохранения изменений в выбранной задаче
btnSave.addEventListener('click', () => {
    todoName = inputTodo.value; // Новое наименование задачи
    tasks[todoId].description = todoName; // Замена наименование в списке задачи
    // updateIdTodo();
    // Обновление локального хранилища, заполнение списка на странице и переключение формы на редактирование текущей задачи
    updateStorage();
    fillTodoList();
    switchForms(true);
    const filler = 'Текущая задача:<br><span class="todoName">';
    todoTitle.innerHTML = filler + todoName + '</span>';
    inputTodo.value = '';
});

// Кнопка изменения статуса задачи на "Ожидает"
btnWaiting.addEventListener('click', () => {
    const circle = document.querySelectorAll('.circle').item(todoId).classList;
    if ( !circle.contains('waiting') ) {
        circle.add('waiting');
        circle.remove('inprogress');
        circle.remove('complete');
        changeTaskStatus(todoId, 0);
    }
});

// Кнопка изменения статуса задачи на "В процессе"
btnInProgress.addEventListener('click', () => {
    const circle = document.querySelectorAll('.circle').item(todoId).classList;
    if ( !circle.contains('inprogress') ) {
        circle.remove('waiting');
        circle.add('inprogress');
        circle.remove('complete');
        changeTaskStatus(todoId, 1);
    }
});

// Кнопка изменения статуса задачи на "Завершена"
btnCompleted.addEventListener('click', () => {
    const circle = document.querySelectorAll('.circle').item(todoId).classList;
    if ( !circle.contains('complete') ) {
        circle.remove('waiting');
        circle.remove('inprogress');
        circle.add('complete');
        changeTaskStatus(todoId, 2);
    }
});

// Поиск задачи
inputSearch.addEventListener('input', () => {
    const todoItem = document.querySelectorAll('.todo-item'); // Список задачи со страницы
    let searchData = inputSearch.value.trim(); // Данные с ввода поиска
    if (searchData) { // Если поиск не пустой
        tasks.forEach( (item, index) => {
            if (!item.description.toLowerCase().includes(searchData.toLowerCase())) {
                todoItem.item(index).classList.add('hidden'); // Сокрытие отфлильтрованных задач
            } else {
                todoItem.item(index).classList.remove('hidden'); // Показ необходимых задач при сокращении поиска
            }
        });
    } else {
        tasks.forEach( (item, index) => {
            todoItem.item(index).classList.remove('hidden'); // Показ задач при пустом поиске
        });
    }
});

// Изменение ширины списка заметок

const resizeLine = document.getElementById('resize');
const editForm = document.querySelector('.todo-edit'),
      listForm = document.querySelector('.todo-list-wrapper'),
      wrapper = document.querySelector('.wrapper');

console.log(listForm);
let currWidth = listForm.clientWidth;
let unlock = false;

// Удержание мышью линии изменения ширины
resizeLine.addEventListener('mousedown', () => {
    currWidth = listForm.clientWidth; // декущая ширины списка
    unlock = true; // разрешение изменения ширины
    resizeLine.style.backgroundColor = "rgba(0, 0, 0, 0.2)"; // затемнение линии перемещения
});

// Отслеживание перемещения мыши по странице
document.addEventListener('mousemove',  (e) => {
    let marginWrapper = Number(window.getComputedStyle(wrapper, null).getPropertyValue('margin-left').replace('px', '')); // получение значения margin-left в зависимости от масштаба страницы
    let newWidth = currWidth + (e.clientX - currWidth - marginWrapper); // новое значение ширины
    // Задание новой ширины списка задач
    if (unlock) {
        if (newWidth > 350) {
            listForm.style.width = newWidth + 'px';
        } else {
            listForm.style.width = 350 + 'px';
        }
    }
});

document.addEventListener('mousedown', (e) => {
    if (unlock) {
        e.preventDefault();
    }
});

// Отпускание мыши на странице 
document.addEventListener('mouseup', () => {
    unlock = false; // запрет на изменение ширины страницы
    resizeLine.style.backgroundColor = "rgba(0, 0, 0, 0.1)"; // возвращение основного цвета линии перемещения
});