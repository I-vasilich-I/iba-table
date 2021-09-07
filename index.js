const { body } = document;
const API_URL = `http://212.98.184.15:8080`;
const USERS_ENDPOINT = `${API_URL}/users/`;
const EDIT_USER_ENDPOINT = `${API_URL}/edit/`;
const CREATE_USER_ENDPOINT = `${API_URL}/create`;
const DELETE_USER_ENDPOINT = `${API_URL}/delete/`;
let users;
const tableParams = {
  search: '',
  sort: 'Name',
  order: true,
}

const fetchUsers = async () => {
  try {
    const res = await fetch(USERS_ENDPOINT);
    const data = await res.json();
    return data;
  } catch (e) {
    alert(`something went wrong: ${e}`)
  }
}

const editUser = async (id, data) => {
  try {
    const res = await fetch(`${EDIT_USER_ENDPOINT}${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('user was changed');
      generateTable();
      closeModal();
    }
  } catch (e) {
    alert(`something went wrong: ${e}`)
  }
}

const createUser = async (data) => {
  try {
    const res = await fetch(`${CREATE_USER_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('user was created');
      generateTable();
      closeModal();
    } 
  } catch (e) {
    alert(`something went wrong: ${e}`);
  }
}

const deleteUser = async (id) => {
  try {
    const response = await fetch(`${DELETE_USER_ENDPOINT}${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      alert('user was deleted');
      generateTable();
    }
  } catch (e) {
    alert(`something went wrong: ${e}`);
  }
}

const nav = create('nav', 'nav');
const searchContainer = create('div', 'search__container', null, nav);
const searchInput = create('input', 'search__input', null, searchContainer, ['type', 'search'], ['placeholder', 'Search']);
const searchButton = create('button', 'search__button', null, searchContainer);
searchButton.innerText = 'Search';
const createBtn = create('button', 'nav__button', null, nav);
const table = create('table', 'table');
body.prepend(table);
body.prepend(nav);
const thead = create('thead', 'table__thead', null, table);
const trThead = create('tr', 'table__thead', null, thead);
const TheadName = create('th', 'th__name', null, trThead);
TheadName.innerText = 'Name';
const TheadDescription = create('th', 'th__description th__description--hidden', null, trThead);
TheadDescription.innerText = 'Description';
const TheadData = create('th', 'th__date th__date--hidden', null, trThead);
TheadData.innerText = 'Date';
const TheadAction = create('th', null, null, trThead);
TheadAction.innerText = 'Action';
const tbody = create('tbody', 'table__body', null, table);
const modal = create('form', 'modal modal--closed');
body.prepend(modal);
const overlay = create('div', 'overlay overlay--hidden');
body.prepend(overlay);
const nameInput = create('input', null, null, modal, ['placeholder', 'Name'], ['type', 'text']);
const descriptionInput = create('input', null, null, modal, ['placeholder', 'Description'], ['type', 'text']);
const dateInput = create('input', null, null, modal, ['placeholder', 'Date'], ['type', 'date']);
const buttonsDiv = create('div', 'buttons__container', null, modal);
const submit = create('input', 'submit', null, buttonsDiv, ['type', 'button']);
const close = create('input', 'close', null, buttonsDiv, ['type', 'button']);
submit.value = 'OK';
close.value = 'Cancel';

generateTable();

searchButton.onclick = () => {
  tableParams.search = searchInput.value.toLowerCase();
  generateTable();
}

searchInput.oninput = (e) => {
  if (!e.target.value) {
    tableParams.search = '';
    generateTable();
  }
}

createBtn.onclick = () => {
  openModal();
  submit.onclick = () => {
    const isValidData = nameInput.value !== '' && descriptionInput.value !== '' && dateInput.value !== '';
    if (isValidData) {
      createUser({ Name: nameInput.value, Description: descriptionInput.value, Date: dateInput.value})
    }
  }
}

body.addEventListener('click', (e) => {
  const { target } = e;
  const closeBtn = target.closest('.close');
  const editBtn = target.closest('.table__edit');
  const deleteBtn = target.closest('.table__delete');
  const overlayClick = target.closest('.overlay');
  const thName = target.closest('.th__name');
  const thDescription = target.closest('.th__description');
  const thDate = target.closest('.th__date');

  if (closeBtn || overlayClick) {
    closeModal();
  }

  if (editBtn) {
    openModal();
    const { offsetParent: { dataset: {actionid} }} = target;
    const { Name, Description, Date} = users.filter((elem) => elem.id == actionid)[0];
    nameInput.value = Name;
    descriptionInput.value = Description;
    dateInput.value = Date;
    submit.onclick = () => {
      const isChanged = (nameInput.value !== Name || descriptionInput.value !== Description || dateInput.value !== Date) 
      const isEmpty =  !(nameInput.value !== '' && descriptionInput.value !== '' && dateInput.value !== '');
      if (isChanged && !isEmpty) {
        editUser(actionid, { Name: nameInput.value, Description: descriptionInput.value, Date: dateInput.value});
        return;
      }
      
      !isChanged ? alert('You have to change data before submitting') : alert(`You can't pass an empty data, be sure to enter all inputs`);
      return;
    }
  }

  if (deleteBtn) {
    const { offsetParent: { dataset: {actionid} }} = target;
    deleteUser(actionid);
  }

  if (thName) {
    tableParams.sort = 'Name';
    tableParams.order = thName.classList.contains('th__name--up') ? true : false;
    generateTable();
    thName.classList.remove('th__name--hidden');
    thName.classList.toggle('th__name--up');
    TheadDescription.className = 'th__description th__description--hidden';
    TheadData.className = 'th__date th__date--hidden';
  }

  if (thDescription) {
    tableParams.sort = 'Description';
    tableParams.order = thDescription.classList.contains('th__description--up') ? true : false;
    generateTable();
    thDescription.classList.remove('th__description--hidden');
    thDescription.classList.toggle('th__description--up');
    TheadName.className = 'th__name th__name--hidden';
    TheadData.className = 'th__date th__date--hidden';
  }

  if (thDate) {
    tableParams.sort = 'Date';
    tableParams.order = thDate.classList.contains('th__date--up') ? true : false;
    generateTable();
    thDate.classList.remove('th__date--hidden');
    thDate.classList.toggle('th__date--up');
    TheadName.className = 'th__name th__name--hidden';
    TheadDescription.className = 'th__description th__description--hidden';
  }
});

// helpers

function closeModal() {
  overlay.classList.add('overlay--hidden');
  modal.classList.add('modal--closed');
}

function openModal() {
  overlay.classList.remove('overlay--hidden');
  modal.classList.remove('modal--closed');
}

async function generateTable() {
  const { search, sort, order } = tableParams;
  tbody.innerHTML = '';
  users = await fetchUsers();
  const data = search ? users.filter((elem) => elem.Name.toLowerCase().includes(search)) : users;
  data.sort((a, b) => {
    if (a[sort] > b[sort]) return order ? 1 : -1;
    if (a[sort] < b[sort]) return order ? -1 : 1;
    return 0;
    }).forEach((el) => {
    const trTbody = create('tr', null, null, tbody, ['id', el.id]);
    create('td', null, null, trTbody).innerText = el.Name;
    create('td', null, null, trTbody).innerText = el.Description;
    create('td', null, null, trTbody).innerText = el.Date;
    create('td', 'table__action', null, trTbody, ['actionid', el.id]).innerHTML = `
      <div class="table__edit"></div>
      <div class="table__delete"></div>
      `;
  });
}

function create(el, classNames, child, parent, ...dataAttr) {
  let element = null;
  try {
    element = document.createElement(el);
  } catch (error) {
    throw new Error('Unable to create HTMLElement! Wrong data')
  }

  if (classNames) element.classList.add(...classNames.split(' '));
  
  if (child && Array.isArray(child)) {
    child.forEach((childElement) => childElement && element.appendChild(childElement));
  } else if (child && typeof child === 'object') {
    element.appendChild(child);
  } else if (child && typeof child === 'string') {
    element.innerHTML = child;
  }

  if (parent) {
    parent.appendChild(element);
  }

  if (dataAttr.length) {
    dataAttr.forEach(([ attrName, attrValue ]) => {
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      } 
      if (attrName.match(/value|placeholder|rows|autocorretc|spellcheck|type|src|alt/)) {
        element.setAttribute(attrName, attrValue);
      } else {
        element.dataset[attrName] = attrValue;
      }
    });
  }
  return element;
}
