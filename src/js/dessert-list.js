import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import iconsUrl from '../img/icons.svg';

axios.defaults.baseURL = 'https://deserts-store.b.goit.study/api/';

const LIMIT = 8;
const categoriesListEl = document.querySelector('.category-list');
const dessertListEl = document.querySelector('.dessert-list');
const loadMoreBtnEl = document.querySelector('.load-more-btn');
const loaderEl = document.querySelector('.loader');

let currentPage = 1;
let selectedCategoryId = 'select-all';

async function getCategories() {
  const res = await axios.get('categories');
  return res.data;
}

async function getDesserts(page, category) {
  const params = {
    page: page,
    limit: LIMIT,
  };

  if (category !== 'select-all') {
    params.category = category;
  }

  const res = await axios.get('desserts', {
    params: params,
  });
  return res.data;
}

function renderCategories(categories) {
  const markup = categories
    .map(
      category => `<li>
        <button type="button" class="category-select-btn" data-id="${category._id}">${category.name}</button></li>`
    )
    .join('');

  categoriesListEl.insertAdjacentHTML('beforeend', markup);
}

function createDessertsMarkup(desserts) {
  return desserts
    .map(
      dessert => `<li class="dessert-item">
        <img class="dessert-img" src="${dessert.image}" alt="${dessert.name}" loading="lazy" />
        <p class="dessert-category">${dessert.category.name}</p>
        <h3 class="dessert-name">${dessert.name}</h3>
        <p class="dessert-text">${dessert.description}</p>
        <div class="dessert-bottom">
          <p class="dessert-price">${dessert.price} грн</p>
          <button type="button" class="dessert-btn" data-id="${dessert._id}" aria-label="Детальніше про ${dessert.name}">
            <svg class="dessert-btn-icon" width="24" height="24">
              <use href="${iconsUrl}#arrow_outwardicon"></use>
            </svg>
          </button>
        </div>
      </li>`
    )
    .join('');
}

function updateLoadMoreBtn(totalItems) {
  if (currentPage * LIMIT < totalItems) {
    loadMoreBtnEl.classList.add('is-visible');
  } else {
    loadMoreBtnEl.classList.remove('is-visible');
  }
}

function showDessertsError() {
  iziToast.error({
    message: 'Не вдалося завантажити десерти. Спробуйте пізніше.',
    position: 'topRight',
  });
}

function showLoader() {
  loaderEl.classList.add('is-visible');
}

function hideLoader() {
  loaderEl.classList.remove('is-visible');
}

async function init() {
  showLoader();

  try {
    const fetchedCategories = await getCategories();
    renderCategories(fetchedCategories);

    const fetchedDesserts = await getDesserts(currentPage, selectedCategoryId);
    dessertListEl.innerHTML = createDessertsMarkup(fetchedDesserts.desserts);
    updateLoadMoreBtn(fetchedDesserts.totalItems);
  } catch (err) {
    showDessertsError();
  } finally {
    hideLoader();
  }
}

init();

const categoryWrapEl = document.querySelector('.category-wrap');
const categoryToggleEl = document.querySelector('.category-toggle');

categoryToggleEl.addEventListener('click', () =>
  categoryWrapEl.classList.toggle('is-open')
);

const currentCategoryEl = document.querySelector('.current-category');

currentCategoryEl.textContent = categoriesListEl
  .querySelector('.is-active')
  .textContent.trim();

categoriesListEl.addEventListener('click', async event => {
  const categoryBtn = event.target.closest('.category-select-btn');
  if (!categoryBtn) return;

  const activeBtn = categoriesListEl.querySelector('.is-active');
  const prevCategoryId = selectedCategoryId;
  const prevPage = currentPage;
  const wasLoadMoreVisible = loadMoreBtnEl.classList.contains('is-visible');

  activeBtn.classList.remove('is-active');
  categoryBtn.classList.add('is-active');

  currentCategoryEl.textContent = categoryBtn.textContent.trim();
  categoryWrapEl.classList.remove('is-open');

  currentPage = 1;
  selectedCategoryId = categoryBtn.dataset.id;

  showLoader();
  loadMoreBtnEl.classList.remove('is-visible');

  try {
    const fetchedDesserts = await getDesserts(currentPage, selectedCategoryId);
    dessertListEl.innerHTML = createDessertsMarkup(fetchedDesserts.desserts);
    updateLoadMoreBtn(fetchedDesserts.totalItems);
  } catch (err) {
    categoryBtn.classList.remove('is-active');
    activeBtn.classList.add('is-active');
    currentCategoryEl.textContent = activeBtn.textContent.trim();

    selectedCategoryId = prevCategoryId;
    currentPage = prevPage;

    if (wasLoadMoreVisible) {
      loadMoreBtnEl.classList.add('is-visible');
    }

    showDessertsError();
  } finally {
    hideLoader();
  }
});

document.addEventListener('click', event => {
  if (!categoryWrapEl.contains(event.target)) {
    categoryWrapEl.classList.remove('is-open');
  }
});

loadMoreBtnEl.addEventListener('click', async () => {
  currentPage += 1;

  showLoader();
  loadMoreBtnEl.classList.remove('is-visible');

  try {
    const fetchedDesserts = await getDesserts(currentPage, selectedCategoryId);
    dessertListEl.insertAdjacentHTML(
      'beforeend',
      createDessertsMarkup(fetchedDesserts.desserts)
    );
    updateLoadMoreBtn(fetchedDesserts.totalItems);
  } catch (err) {
    showDessertsError();
  } finally {
    hideLoader();
  }
});
