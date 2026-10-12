import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import 'css-star-rating/css/star-rating.css';
import iconsUrl from '../img/icons.svg';
import { openOrderModal } from './order-modal';

axios.defaults.baseURL = 'https://deserts-store.b.goit.study/api/';

const dessertListEl = document.querySelector('.dessert-list');
const backdropEl = document.querySelector('.dessert-details-modal-backdrop');
const closeBtnEl = document.querySelector('.dessert-details-close-btn');
const loaderEl = document.querySelector('.dessert-details-loader');
const contentEl = document.querySelector('.dessert-details-content');

let currentDessertId = null;
let currentDessertName = '';

async function getDessertById(id) {
  const res = await axios.get(`desserts/${id}`);
  return res.data;
}

function createClassFromRate(rate) {
  if (Number.isInteger(rate)) {
    return `value-${rate}`;
  }
  return `value-${Math.floor(rate)} half`;
}

function createStarsMarkup() {
  const star = `<div class="star">
      <svg class="star-empty"><use href="${iconsUrl}#star-empty"></use></svg>
      <svg class="star-half"><use href="${iconsUrl}#star-half"></use></svg>
      <svg class="star-filled"><use href="${iconsUrl}#star-filled"></use></svg>
    </div>`;
  return star.repeat(5);
}

function createDessertDetailsMarkup(dessert) {
  return `<img
      class="dessert-details-img"
      src="https://wsrv.nl/?url=${dessert.image}&w=640&output=webp"
      srcset="https://wsrv.nl/?url=${dessert.image}&w=640&output=webp 1x, https://wsrv.nl/?url=${dessert.image}&w=1280&output=webp 2x"
      alt="${dessert.name}"
      decoding="async"
      onerror="this.onerror = null; this.removeAttribute('srcset'); this.src = '${dessert.image}';"
    />
    <div class="dessert-details-info">
      <h2 class="dessert-details-name">${dessert.name}</h2>
      <p class="dessert-details-price">${dessert.price} грн</p>
      <div class="rating dessert-details-rating ${createClassFromRate(dessert.rate)}" aria-label="Рейтинг ${dessert.rate} з 5">
        <div class="star-container">${createStarsMarkup()}</div>
      </div>
      <p class="dessert-details-text">${dessert.description}</p>
      <p class="dessert-details-composition">
        <span class="dessert-details-composition-label">Склад</span>: ${dessert.composition}
      </p>
      <button type="button" class="dessert-details-order-btn">Перейти до замовлення</button>
    </div>`;
}

function onEscapePress(event) {
  if (event.key === 'Escape') {
    closeDetailsModal();
  }
}

function showDetailsModal() {
  backdropEl.classList.add('is-modal-open');
  document.addEventListener('keydown', onEscapePress);
}

function closeDetailsModal() {
  backdropEl.classList.remove('is-modal-open');
  document.removeEventListener('keydown', onEscapePress);
}

export async function openDessertDetails(id) {
  currentDessertId = id;
  contentEl.innerHTML = '';
  loaderEl.classList.add('is-visible');
  showDetailsModal();

  try {
    const dessert = await getDessertById(id);
    currentDessertName = dessert.name;
    contentEl.innerHTML = createDessertDetailsMarkup(dessert);
  } catch (err) {
    closeDetailsModal();
    iziToast.error({
      message: 'Не вдалося завантажити десерт. Спробуйте пізніше.',
      position: 'topRight',
    });
  } finally {
    loaderEl.classList.remove('is-visible');
  }
}

dessertListEl.addEventListener('click', event => {
  const dessertBtn = event.target.closest('.dessert-btn');
  if (!dessertBtn) return;

  openDessertDetails(dessertBtn.dataset.id);
});

closeBtnEl.addEventListener('click', closeDetailsModal);

backdropEl.addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    closeDetailsModal();
  }
});

contentEl.addEventListener('click', event => {
  if (!event.target.closest('.dessert-details-order-btn')) return;

  closeDetailsModal();
  openOrderModal(currentDessertId, currentDessertName, showDetailsModal);
});
