import create from './helpers.js'

const { body } = document;
const API_URL = `http://212.98.184.15:8080`;
const USERS_ENDPOINT = `${API_URL}/users/`;
const EDIT_USER_ENDPOINT = `${API_URL}/edit/`;
const CREATE_USER_ENDPOINT = `${API_URL}/create`;
const DELETE_USER_ENDPOINT = `${API_URL}/delete/`;


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
    }
  } catch (e) {
    alert(`something went wrong: ${e}`);
  }
}

const data = await fetchUsers();

const createBtn = create('button');
createBtn.innerText = 'new user';

const table = create('table', 'table');
body.prepend(table);
body.prepend(createBtn);
const thead = create('thead', 'table__thead', null, table);
const trThead = create('tr', 'table__thead', null, thead);
const TheadName = create('th', null, null, trThead);
TheadName.innerText = 'Name';
const TheadDescription = create('th', null, null, trThead);
TheadDescription.innerText = 'Description';
const TheadData = create('th', null, null, trThead);
TheadData.innerText = 'Data';
const TheadAction = create('th', null, null, trThead);
TheadAction.innerText = 'Action';
const tbody = create('tbody', 'table__body', null, table);

data.forEach((el) => {
  const trTbody = create('tr', null, null, tbody, ['id', el.id]);
  create('td', null, null, trTbody).innerText = el.Name;
  create('td', null, null, trTbody).innerText = el.Description;
  create('td', null, null, trTbody).innerText = el.Date;
  create('td', 'table__action', null, trTbody, ['actionid', el.id]).innerHTML = `
    <div class="table__edit">edit</div>
    <div class="table__delete">delete</div>
    `;
});

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

  if (closeBtn || overlayClick) {
    closeModal();
  }

  if (editBtn) {
    openModal();
    const { offsetParent: { dataset: {actionid} }} = target;
    const { Name, Description, Date} = data.filter((elem) => elem.id == actionid)[0];
    nameInput.value = Name;
    descriptionInput.value = Description;
    dateInput.value = Date;
    submit.onclick = () => {
      const isChanged = (nameInput.value !== Name || descriptionInput.value !== Description || dateInput.value !== Date) 
      const isEmpty =  !(nameInput.value !== '' && descriptionInput.value !== '' && dateInput.value !== '');
      if (isChanged && !isEmpty) {
        const { children } = document.querySelector(`[data-id="${actionid}"]`);
        children[0].innerText = nameInput.value;
        children[1].innerText = descriptionInput.value;
        children[2].innerText = dateInput.value;
        editUser(actionid, { Name: nameInput.value, Description: descriptionInput.value, Date: dateInput.value});
        return;
      }
      
      !isChanged ? alert('You have to change data before submiting') : alert(`You can't pass an empty data, be sure to enter all inputs`);
      return;
    }
  }

  if (deleteBtn) {
    const { offsetParent: { dataset: {actionid} }} = target;
    deleteUser(actionid);
  }
});


function closeModal() {
  overlay.classList.add('overlay--hidden');
  modal.classList.add('modal--closed');
}

function openModal() {
  overlay.classList.remove('overlay--hidden');
  modal.classList.remove('modal--closed');
}
