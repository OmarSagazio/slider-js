import '../public/css/main.css';


// Init
function Slider(id, urls) {
    this.sliderId = id;
    this.imageUrls = urls;

    window.addEventListener("load", this.onLoad.bind(this));
}

// Lazy loading
Slider.prototype.onLoad = function () {

    // =card-creator
    this.cardCreator();

    // =init
    this.init();

    // =click-prev
    var queryPrev = "#" + this.sliderId + " > .wrapper > .slider__card-prev";
    document.querySelector(queryPrev).addEventListener("click", this.clickPrev
        .bind(this));
    // =click-next
    var queryNext = "#" + this.sliderId + " > .wrapper > .slider__card-next";
    document.querySelector(queryNext).addEventListener("click", this.clickNext
        .bind(this));
};

// =click =prev
Slider.prototype.clickPrev = function (evt) {
    this.slideByClick(false);
};
// =click =next
Slider.prototype.clickNext = function (evt) {
    this.slideByClick(true);
};

// =next
Slider.prototype.slideByClick = function (isLeft) {
    if (this.currentIndex === this.cards.length - 1) {
        this.cancelMoveCard();
        return;
    }

    var self = this;
    var card = this.cards[this.currentIndex];
    var diff = isLeft ? -window.innerWidth : window.innerWidth;

    this.moveCardElsClick(diff);

    // add delay to resetting position
    setTimeout(function () {
        isLeft ? self.slideLeft() : self.slideRight();
    }, 200);
}

Slider.prototype.moveCardElsClick = function (diff) {
    var card = this.cards[this.currentIndex];
    var queryAnimate = "#" + this.sliderId + " > .wrapper > .card > .card__will-animate";
    var cardWillAnimate = card.querySelectorAll(queryAnimate);
    var queryImage = "#" + this.sliderId + " > .wrapper > .card > .card__image";
    var cardImage = card.querySelector(queryImage);

    card.style.transform = 'translateX(calc(' + diff + 'px - 50%))';
};

// =card-creator
Slider.prototype.cardCreator = function () {
    var self = this;
    this.imageUrls.forEach(function (url) {
        // CARD
        // card: div
        var cardDiv = document.createElement("div");
        cardDiv.className = "card card--not-active";

        // card: img
        var cardImg = document.createElement("img");
        cardImg.className = "card__image card__will-animate";
        cardImg.src = url;

        // card: div > img
        cardDiv.appendChild(cardImg);

        // card: add to DOM
        var queryCard = "#" + self.sliderId + " > .wrapper > .card--active";
        var currentCardDiv = document.querySelector(queryCard);
        var queryParent = "#" + self.sliderId + " > .wrapper";
        var parentCardDiv = document.querySelector(queryParent);


        parentCardDiv.insertBefore(cardDiv, currentCardDiv.nextSibling);

        // PLACEHOLDER
        // =placeholder
        var placeholderItemDiv = document.createElement("div");
        placeholderItemDiv.className = "cards-placeholder__item";

        // // card: add to DOM
        var queryPlaceholder = "#" + self.sliderId +
            " > .cards-placeholder > .cards-placeholder__item";
        var currentPlaceholderDiv = document.querySelector(queryPlaceholder);
        var queryPlaceholderParent = "#" + self.sliderId + " > .cards-placeholder";
        var parentDiv = document.querySelector(queryPlaceholderParent);
        parentDiv.insertBefore(placeholderItemDiv, currentPlaceholderDiv.nextSibling);
    });
}

// =init
Slider.prototype.init = function () {
    var queryCard = "#" + this.sliderId + " > .wrapper > .card";
    this.cards = document.querySelectorAll(queryCard);

    this.currentIndex = 0;

    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;

    this.initEvents();
    this.setActivePlaceholder();
};


// initialize drag events
Slider.prototype.initEvents = function () {
    var queryId = "#" + this.sliderId;
    document.querySelector(queryId).addEventListener('touchstart', this.onStart.bind(this));
    document.querySelector(queryId).addEventListener('touchmove', this.onMove.bind(this));
    document.querySelector(queryId).addEventListener('touchend', this.onEnd.bind(this));

    document.querySelector(queryId).addEventListener('mousedown', this.onStart.bind(this));
    document.querySelector(queryId).addEventListener('mousemove', this.onMove.bind(this));
    document.querySelector(queryId).addEventListener('mouseup', this.onEnd.bind(this));
};


// set active placeholder
Slider.prototype.setActivePlaceholder = function () {
    var queryPlaceholders = "#" + this.sliderId + " > .cards-placeholder > .cards-placeholder__item";
    var placeholders = document.querySelectorAll(queryPlaceholders);
    var queryActivePlaceholder = "#" + this.sliderId +
        " > .cards-placeholder > .cards-placeholder__item--active";
    var activePlaceholder = document.querySelector(queryActivePlaceholder)

    if (activePlaceholder) {
        activePlaceholder.classList.remove('cards-placeholder__item--active');
    }

    placeholders[this.currentIndex].classList.add('cards-placeholder__item--active');
};


// mousedown event
Slider.prototype.onStart = function (evt) {
    this.isDragging = true;

    this.currentX = evt.pageX || evt.touches[0].pageX;
    this.startX = this.currentX;

    var card = this.cards[this.currentIndex];

    // calculate ration to use in parallax effect
    this.windowWidth = window.innerWidth;
    this.cardWidth = card.offsetWidth;
    this.ratio = this.windowWidth / (this.cardWidth / 4);
};

// mouseup event
Slider.prototype.onEnd = function (evt, diff) {
    this.isDragging = false;

    var diff = diff || this.startX - this.currentX;
    var direction = (diff > 0) ? 'left' : 'right';
    // var direction = direction || (diff > 0) ? 'left' : 'right';
    this.startX = 0;

    if (Math.abs(diff) > this.windowWidth / 4) {
        if (direction === 'left') {
            this.slideLeft();
        } else if (direction === 'right') {
            this.slideRight();
        } else {
            this.cancelMoveCard();
        }

    } else {
        this.cancelMoveCard();
    }

};

// mousemove event
Slider.prototype.onMove = function (evt) {
    if (!this.isDragging) return;

    this.currentX = evt.pageX || evt.touches[0].pageX;
    var diff = this.startX - this.currentX;
    diff *= -1;

    // don't let drag way from the center more than quarter of window
    if (Math.abs(diff) > this.windowWidth / 4) {
        if (diff > 0) {
            diff = this.windowWidth / 4;
        } else {
            diff = -this.windowWidth / 4;
        }
    }

    // TODO: improve! Avoid delta on start dragging
    // this.moveCard(diff);
};

// slide to left direction
Slider.prototype.slideLeft = function () {
    // if last don't do nothing
    if (this.currentIndex === this.cards.length - 1) {
        this.cancelMoveCard();
        return;
    }

    var self = this;
    var card = this.cards[this.currentIndex];
    var cardWidth = this.windowWidth / 2;

    card.style.left = '-50%';
    this.moveCardEls(cardWidth * 3);

    this.resetCardElsPosition();

    this.currentIndex += 1;
    this.setActivePlaceholder();
    card = this.cards[this.currentIndex];

    card.style.left = '50%';

    this.moveCardEls(cardWidth * 3);

    // add delay to resetting position
    setTimeout(function () {
        self.resetCardElsPosition();
    }, 50);
};

// slide to right direction
Slider.prototype.slideRight = function () {
    // if last don't do nothing
    if (this.currentIndex === 0) {
        this.cancelMoveCard();
        return;
    }

    var self = this;
    var card = this.cards[this.currentIndex];
    var cardWidth = this.windowWidth / 2;

    card.style.left = '150%';

    this.resetCardElsPosition();

    this.currentIndex -= 1;
    this.setActivePlaceholder();
    card = this.cards[this.currentIndex];

    card.style.left = '50%';

    this.moveCardEls(-cardWidth * 3);

    // add delay to resetting position
    setTimeout(function () {
        self.resetCardElsPosition();
    }, 50);
};

// put active card in original position (center)
Slider.prototype.cancelMoveCard = function () {
    var self = this;
    var card = this.cards[this.currentIndex];

    card.style.transition = 'transform 0.5s ease-out';
    card.style.transform = '';

    this.resetCardElsPosition();
};

// reset to original position elements of card
Slider.prototype.resetCardElsPosition = function () {
    var self = this;
    var card = this.cards[this.currentIndex];

    var queryCardImage = "#" + self.sliderId + " > .wrapper > .card > .card__image";
    var cardImage = card.querySelector(queryCardImage);
    var queryCardAnimate = "#" + self.sliderId + " > .wrapper > .card > .card__will-animate";
    var cardWillAnimate = card.querySelectorAll(queryCardAnimate);


    // move card elements to original position
    cardWillAnimate.forEach(function (el) {
        el.style.transition = 'transform 0.5s ease-out';
    });

    cardImage.style.transform = '';

    // clear transitions
    setTimeout(function () {
        card.style.transform = '';
        card.style.transition = '';

        cardWillAnimate.forEach(function (el) {
            el.style.transition = '';
        });
    }, 500);

};

// slide card while dragging
Slider.prototype.moveCard = function (diff) {

    var card = this.cards[this.currentIndex];

    card.style.transform = 'translateX(calc(' + diff + 'px - 50%))';
    diff *= -1;

    this.moveCardEls(diff);
};

// create parallax effect on card elements sliding them
Slider.prototype.moveCardEls = function (diff) {
    var card = this.cards[this.currentIndex];
    var queryAnimate = "#" + this.sliderId + " > .wrapper > .card > .card__will-animate";
    var cardWillAnimate = card.querySelectorAll(queryAnimate);
    var queryImage = "#" + this.sliderId + " > .wrapper > .card > .card__image";
    var cardImage = card.querySelector(queryImage);
    cardImage.style.transform = 'translateX(' + (diff / (this.ratio * 0.35)) + 'px)';
};


// =test
var sliderCiao = new Slider("ciao", [
    'https://img.ibs.it/images/9788869183492_2_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_1_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_3_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_4_0_300_75.jpg'
]);

var sliderCiccio = new Slider("ciccio", [
    'https://img.ibs.it/images/9788869183492_2_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_1_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_3_0_300_75.jpg',
    'https://img.ibs.it/images/9788869183492_4_0_300_75.jpg'
]);