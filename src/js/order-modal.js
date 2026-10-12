import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

axios.defaults.baseURL = 'https://deserts-store.b.goit.study/api/';

const STORAGE_KEY = 'order-form-data';
const backdropEl = document.querySelector('.order-modal-backdrop');
const closeBtnEl = document.querySelector('.order-close-btn');
const formEl = document.querySelector('.order-form');
const submitBtnEl = document.querySelector('.order-submit-btn');
const loaderEl = document.querySelector('.order-loader');

let currentDessertId = null;
let currentDessertName = '';
let returnToDetails = null;

function saveFormData() {
  const formData = {
    name: formEl.elements.name.value,
    phone: formEl.elements.phone.value,
    comment: formEl.elements.comment.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function fillFormFromStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;

  try {
    const formData = JSON.parse(savedData);
    formEl.elements.name.value = formData.name || '';
    formEl.elements.phone.value = formData.phone || '';
    formEl.elements.comment.value = formData.comment || '';
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getErrorMessage(field) {
  const value = field.value.trim();

  if (field.name === 'name') {
    if (value === '') return "Вкажіть ім'я";
    if (value.length < 2) return "Ім'я має містити щонайменше 2 символи";
  }

  if (field.name === 'phone') {
    const phone = value.replaceAll(' ', '');
    if (phone === '') return 'Вкажіть телефон';
    if (!/^\d{12}$/.test(phone)) {
      return 'Телефон має містити 12 цифр, наприклад 380961234568';
    }
  }

  if (field.name === 'comment') {
    if (value === '') return 'Напишіть коментар';
    if (value.length < 2) return 'Коментар має містити щонайменше 2 символи';
  }

  return '';
}

function showFieldError(field, message) {
  const fieldWrap = field.closest('.order-field');
  fieldWrap.querySelector('.order-error').textContent = message;
  fieldWrap.classList.toggle('is-error', message !== '');
  field.setAttribute('aria-invalid', message !== '');
}

function validateForm() {
  let isValid = true;

  for (const name of ['name', 'phone', 'comment']) {
    const field = formEl.elements[name];
    const message = getErrorMessage(field);
    showFieldError(field, message);
    if (message !== '') isValid = false;
  }

  return isValid;
}

function onEscapePress(event) {
  if (event.key === 'Escape') {
    closeOrderModal();
  }
}

export function openOrderModal(dessertId, dessertName, onReturn) {
  currentDessertId = dessertId;
  currentDessertName = dessertName;
  returnToDetails = onReturn;

  fillFormFromStorage();
  backdropEl.classList.add('is-modal-open');
  document.addEventListener('keydown', onEscapePress);
}

function closeOrderModal(shouldReturn = true) {
  backdropEl.classList.remove('is-modal-open');
  document.removeEventListener('keydown', onEscapePress);

  if (shouldReturn && returnToDetails) {
    returnToDetails();
  }
}

formEl.addEventListener('input', event => {
  saveFormData();
  showFieldError(event.target, '');
});

closeBtnEl.addEventListener('click', () => closeOrderModal());

backdropEl.addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    closeOrderModal();
  }
});

formEl.addEventListener('submit', async event => {
  event.preventDefault();

  if (!validateForm()) {
    formEl.querySelector('.is-error .order-input').focus();
    return;
  }

  const orderData = {
    name: formEl.elements.name.value.trim(),
    phone: formEl.elements.phone.value.replaceAll(' ', ''),
    comment: formEl.elements.comment.value.trim(),
    dessertId: currentDessertId,
  };

  loaderEl.classList.add('is-visible');
  submitBtnEl.disabled = true;

  try {
    await axios.post('orders', orderData);

    iziToast.success({
      message: `Дякуємо! Замовлення "${currentDessertName}" прийнято, ми скоро зв'яжемось з вами.`,
      position: 'topRight',
    });

    formEl.reset();
    localStorage.removeItem(STORAGE_KEY);
    closeOrderModal(false);
  } catch (err) {
    iziToast.error({
      message: 'Не вдалося надіслати замовлення. Перевірте дані й спробуйте ще раз.',
      position: 'topRight',
    });
  } finally {
    loaderEl.classList.remove('is-visible');
    submitBtnEl.disabled = false;
  }
});
