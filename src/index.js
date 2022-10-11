import Notiflix from 'notiflix';
import ApiServise from "./fetch";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';


const refs = {
    formEl: document.querySelector("#search-form"),
    divEl: document.querySelector(".gallery"),
    buttonEl: document.querySelector(".load-more")
};

const apiServise = new ApiServise();
var lightbox = new SimpleLightbox('.gallery .gallery__item', {captionsData:"",captionDelay:250});


refs.formEl.addEventListener('submit', onSubmit);
refs.buttonEl.addEventListener('click', onclick);
window.addEventListener('scroll', throttle(onScroll, 1000));


function onSubmit(e) {
    e.preventDefault();
  refs.buttonEl.classList.add("is-hiden");
  apiServise.query = e.target.elements.searchQuery.value.trim();
  apiServise.resetPage()
  apiServise.fetch().then(queryResult => {
    refs.divEl.innerHTML = "";
    refs.buttonEl.classList.remove("is-hiden");
    galeryMarcup(queryResult);
    lightbox.refresh()
  });
};

function onclick() {
apiServise.fetch().then(galeryMarcup);
};

function galeryMarcup(queryResult) {
  
  const a = queryResult.data;

    if (a.totalHits === 0) {
      refs.buttonEl.classList.add("is-hiden");
      refs.divEl.innerHTML = "";
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    } else if (Number(a.hits.length) < 40) {
      refs.divEl.insertAdjacentHTML('beforeend', marcup(a.hits));
      refs.buttonEl.classList.add("is-hiden");
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      refs.buttonEl.classList.add("is-hiden");
      refs.divEl.insertAdjacentHTML('beforeend', marcup(a.hits));
      Notiflix.Notify.info(`Hooray! We found ${a.totalHits} images.`);
  };
};

function marcup(queryResult) {
    
    return queryResult.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
            <a class="gallery__item" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" title="${tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`
    })
};

function onScroll() {
  const position = document.documentElement.getBoundingClientRect();
  const userPort = document.documentElement.clientHeight + 1000;
  if (position.bottom < userPort) {
    apiServise.fetch().then(galeryMarcup);
  }
};

