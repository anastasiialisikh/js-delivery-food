const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const cartListSection = document.querySelector('.modal-cart-list');
const cartTotalPriceEl = document.querySelector('.modal-pricetag');
const clearCartButton = document.querySelector('.clear-cart');

const loginButton = document.querySelector('.button-auth');
const authModal = document.querySelector('.modal-auth');
const closeAuthButton = document.querySelector('.close-auth');
const loginForm = document.querySelector('#logInForm');
const loginErrorMessage = document.querySelector('.auth-error'); 
const userNameEl = document.querySelector('.user-name');
const signoutButton = document.querySelector('.button-out');

const logo = document.querySelector('.logo');
const promoSection = document.querySelector('.container-promo');

const restaurantsSection = document.querySelector('.restaurants');
const cardsRestaurants = document.querySelector('.cards-restaurants');

const menuSection = document.querySelector('.menu');
const menuCardsSection = document.querySelector('.cards-menu');
const menuHeaderSection = document.querySelector('.menu-header');

const cart = [];
let userLogin = localStorage.getItem('login');

async function getData(url) {
	const response = await fetch(url);
	
	if (!response.ok) {
		throw new Error(`Something wrong with ${url}. Response status: ${response.status}`);
	}

	return await response.json();
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleAuthModal() {
	loginErrorMessage.style.display = 'none';
	authModal.classList.toggle('is-open');
}

function authorized() {
	console.log('User is authorised');

	userNameEl.textContent = userLogin;

	loginButton.style.display = 'none';
	signoutButton.style.display = 'flex';
	userNameEl.style.display = 'inline';
	cartButton.style.display = 'flex';

	signoutButton.addEventListener('click', logout);
}

function login(event) {
	const loginInput = document.querySelector('#login');
	
	event.preventDefault();
	userLogin = loginInput.value;

	if(userLogin) {
		localStorage.setItem('login', userLogin);
		toggleAuthModal();
	
		loginButton.removeEventListener('click', toggleAuthModal);
		closeAuthButton.removeEventListener('click', toggleAuthModal);
		loginForm.removeEventListener('submit', login);
		loginForm.reset();
		
		checkAuth();
	} else {
		loginErrorMessage.style.display = 'block';
	}
}

function logout() {
	userLogin = '';
	userNameEl.textContent = '';

	loginButton.style.display = '';
	signoutButton.style.display = '';
	userNameEl.style.display = '';
	cartButton.style.display = '';

	localStorage.removeItem('login');
	signoutButton.removeEventListener('click', logout);

	checkAuth();
	if (restaurantsSection.classList.contains('hide')) {
		openRestaurants();
	}
}

function notAuthorized() {
	console.log('User is not authorised');

	loginButton.addEventListener('click', toggleAuthModal);
	closeAuthButton.addEventListener('click', toggleAuthModal);
	loginForm.addEventListener('submit', login);
}

function checkAuth() {
	if(userLogin) {
		authorized();
	} else {
		notAuthorized();
	}
}

function createRestaurantCardInfo({ stars, price, kitchen }) {
	return `
		<div class="card-info">
			<div class="rating">${stars}</div>
			<div class="price">От ${price} ₽</div>
			<div class="category">${kitchen}</div>
		</div>
	`;
}

function createRestaurantHeader({ name, stars, price, kitchen }) {
	const header = `
		<h2 class="section-title restaurant-title">${name}</h2>
		${createRestaurantCardInfo({stars, price, kitchen})}
	`;

	menuHeaderSection.textContent = '';
	menuHeaderSection.insertAdjacentHTML('afterbegin', header);
}

function createCardRestaurant({ name, image, stars, price, kitchen, products, 
	time_of_delivery: timeOfDelivery }) {
	const card = `
		<a class="card card-restaurant" 
			data-products="${products}"
			data-name="${name}"
			data-stars="${stars}"
			data-price="${price}"
			data-kitchen="${kitchen}">
			<img src="${image}" alt="image" class="card-image"/>
			<div class="card-text">
				<div class="card-heading">
					<h3 class="card-title">${name}</h3>
					<span class="card-tag tag">${timeOfDelivery} мин</span>
				</div>
				${createRestaurantCardInfo({stars, price, kitchen})}
			</div>
		</a>
	`;

	cardsRestaurants.insertAdjacentHTML('beforeend', card);
}

function createCardProduct({ description, id, image, name, price }) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.id = id;

	card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="image" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">${description}</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price-bold">${price} ₽</strong>
			</div>
		</div>
	`);

	menuCardsSection.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {
	const target = event.target;
	const restaurant = target.closest('.card-restaurant');

	if (restaurant && userLogin) {
		menuCardsSection.textContent = '';

		promoSection.classList.add('hide');
		restaurantsSection.classList.add('hide');
		menuSection.classList.remove('hide');

		createRestaurantHeader(restaurant.dataset);
		getData(`./db/${restaurant.dataset.products}`)
			.then(data => data.forEach(createCardProduct));

	} else if(!userLogin) {
		toggleAuthModal();
	}
}

function openRestaurants() {
	promoSection.classList.remove('hide');
	restaurantsSection.classList.remove('hide');
	menuSection.classList.add('hide');
}

function addToCart(event) {
	const { target } = event;
	const addToCartButton = target.closest('.button-add-cart');

	if (addToCartButton) {
		const card = target.closest('.card');
		const id = card.id;
		const title = card.querySelector('.card-title').textContent;
		const price = card.querySelector('.card-price-bold').textContent;
		const alreadyInCart = cart.find(item => item.id === id);

		if(alreadyInCart) {
			alreadyInCart.count += 1; 
		} else {
			cart.push({id, title, price, count: 1});
		}
	}
}

function renderCart() {
	const createCartRow = ({id, title, price, count}) => `
		<div class="food-row">
			<span class="food-name">${title}</span>
			<strong class="food-price">${price}</strong>
			<div class="food-counter">
				<button class="counter-button counter-minus" data-id="${id}">-</button>
				<span class="counter">${count}</span>
				<button class="counter-button counter-plus" data-id="${id}">+</button>
			</div>
		</div>
	`;

	cartListSection.textContent = '';

	if (cart.length) {
		cart.forEach(item => cartListSection.insertAdjacentHTML('beforeend', createCartRow(item)));
		const totalPrice = cart.reduce((res, item) => res + (parseFloat(item.price, 10) * item.count), 0);
		cartTotalPriceEl.textContent = totalPrice + ' ₽';
	} else {
		cartListSection.insertAdjacentHTML('beforeend', `<h3>Корзина пуста</h3>`);
		cartTotalPriceEl.textContent = '0 ₽';
	}
}

function changeCartItemCount(event) {
	const countButton = event.target.closest('.counter-button');

	if (countButton) {
		const cartItemId = countButton.dataset.id;
		const cartItem = cart.find(item => item.id === cartItemId);
		if (countButton.classList.contains('counter-minus')) {
			cartItem.count -= 1; 
		} else {
			cartItem.count += 1; 
		}

		if (cartItem.count <= 0) {
			// cart = cart.filter(item => item.id != cartItemId); // wont work with const
			cart.splice(cart.indexOf(cartItem), 1); // works with const
		}

		renderCart();
	}
}

function clearCart() {
	cart.length = 0;
	localStorage.removeItem('cart');
	renderCart();
}

function init() {
	cartButton.addEventListener("click", () => {
		renderCart();
		toggleModal();
	});
	close.addEventListener("click", toggleModal);
	
	logo.addEventListener('click', openRestaurants);
	
	cardsRestaurants.addEventListener('click', openGoods);
	menuCardsSection.addEventListener('click', addToCart);
	
	cartListSection.addEventListener('click', changeCartItemCount);
	clearCartButton.addEventListener('click', clearCart);
	
	checkAuth();
	getData('./db/partners.json').then(data => data.forEach(createCardRestaurant));
}

init();
