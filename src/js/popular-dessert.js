import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import iconsUrl from '../img/icons.svg';
import { openDessertDetails } from './dessert-details-modal';

//БАЗОВИЙ URL
axios.defaults.baseURL = 'https://deserts-store.b.goit.study/api';
////REFS
const refs = {
  listPopularList: document.querySelector('.popular-product-list'),
};
///API-ENDOINT
const API_ENDPOINT = {
  DESSERTS: '/desserts',
};
// CONSTANTS
let page = 1;
const limit = 10;
let totalPages = null;

///НАЛАШТУВАННЯ СВАЙПЕРА
const swiperOptions = {
  modules: [Navigation, Pagination],
  slidesPerView: 1,
  spaceBetween: 16,
  resistance: false,
  resistanceRatio: 0,
  touchReleaseOnEdges: true,
  navigation: {
    nextEl: '.popular-swiper-button-next',
    prevEl: '.popular-swiper-button-prev',
  },
  pagination: {
    el: '.popular-swiper-pagination',
    dynamicBullets: true,
    dynamicMainBullets: 3,
    clickable: true,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    1440: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  },
  on: {
    async slideChange(swiper) {
      const {
        realIndex,
        slides: { length },
      } = swiper;
      const isNearEnd = realIndex + 1 >= length - 2;

      if (!isNearEnd || page >= totalPages) {
        return;
      }
      try {
        page += 1;
        const { desserts } = await getPopularProducts(page, limit);

        const markUp = markUpProducts(desserts);

        refs.listPopularList.insertAdjacentHTML('beforeend', markUp);
        swiper.update();
      } catch (err) {
        iziToast.error({
          title: 'Error',
          message: `Помилка отримання Популярних продуктів пiд час довантаження ${err}`,
        });
        console.log(
          `Помилка отримання Популярних продуктів пiд час довантаження ${err}`
        );
      }
    },
  },
};

const createPopularSwiper = () => new Swiper('.popular-swiper', swiperOptions);

///ЗАПРОСИ ДО БЕКЕНДУ
async function getPopularProducts(page = 1, limit = 3) {
  const { data } = await axios(
    `${API_ENDPOINT.DESSERTS}?page=${page}&limit=${limit}&type=popular`
  );
  return data;
}

///СЛУХАЧІ
document.addEventListener('DOMContentLoaded', initPopularList);
refs.listPopularList.addEventListener('click', onClickOpenModal);
///ХЕНДЛЕРИ
async function initPopularList() {
  try {
    const { desserts, total } = await getPopularProducts(page, limit);
    totalPages = Math.ceil(total / limit);
    const markUp = markUpProducts(desserts);
    refs.listPopularList.insertAdjacentHTML('beforeend', markUp);
    createPopularSwiper();
  } catch (err) {
    iziToast.error({
      title: 'Error',
      message: `Помилка отримання Популярних продуктів пiд час ініціалізації ${err}`,
    });
    console.log(
      `Помилка отримання Популярних продуктів пiд час ініціалізації ${err}`
    );
  }
}
function onClickOpenModal(event) {
  const dessertButton = event.target.closest('.popular-product-list-item-btn');

  if (!dessertButton) return;

  openDessertDetails(dessertButton.dataset.id);
}
//СТВОРЕННЯ РОЗМІТКИ
function markUpProducts(products) {
  return products
    .map(({ _id, category, description, image, name, price }) => {
      return `<li class="swiper-slide popular-product-list-item">
        <img
          src="${image}"
          alt="${name}"
          class="popular-product-list-item-img"
        />

        <div class="popular-product-list-item-info-wrapper">
          <p class="popular-product-list-item-category">
            ${category.name}
          </p>

          <h3 class="popular-product-list-item-title">
            ${name}
          </h3>

          <p class="popular-product-list-item-description">
            ${description}
          </p>
        </div>

        <div class="popular-product-list-item-price-btn-modal-wrapper">
          <p class="popular-product-list-item-price">
            ${price} грн
          </p>

          <button
            type="button"
            class="popular-product-list-item-btn"
            data-id="${_id}"
            aria-label="Детальніше про ${name}"
          >
            <svg width="24" height="24">
              <use href="${iconsUrl}#arrow_outwardicon"></use>
            </svg>
          </button>
        </div>
      </li>`;
    })
    .join('');
}
