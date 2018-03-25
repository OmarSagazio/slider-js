/* =test */
import '../public/css/test.css';
/* =test */

import '../public/css/main.css';

/**
 * TODO: =improvements
 *  - add Object with default properties
 *      + id
 *      + transition: all .8s ease-out; -- <property> <duration> <function>
 *                  slide.style.transition = 'transform 0.5s ease-out';
 *                  slide.style.transform = 'translateX(___)';
 *      + font-size: 14px;  -- reset 4 items
 *      + TODO: improve! Avoid delta on start dragging
 *              this.moveCard(diff);
 *      + Parallax Effect
 */
class Slider {
    constructor(id = "slider") {

        window.addEventListener("load", this.init.bind(this)(id));

        // TODO: check if there is a load listener in the prod bundle        
        // this.init(id);

    }

    init(id) {

        // =properties
        this.sliderId = id;
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;

        // =refs
        const sliderRef = "#" + this.sliderId;
        const nextRef = sliderRef + " > .slider__next";
        const prevRef = sliderRef + " > .slider__prev";
        const slidesRef = sliderRef + " > .slider__item";

        // =pointers
        const slider = document.querySelector(sliderRef);
        const nextButton = document.querySelector(nextRef);
        const prevButton = document.querySelector(prevRef);

        // =properties
        this.slides = document.querySelectorAll(slidesRef);


        // =slides all aligned to the right column
        this.moveSlidesRightCol();

        // =handlers
        nextButton.addEventListener('click', this.nextSlide.bind(this));
        prevButton.addEventListener('click', this.prevSlide.bind(this));

        // =touch-events
        slider.addEventListener('touchstart', this.onStart.bind(this));
        slider.addEventListener('touchmove', this.onMove.bind(this));
        slider.addEventListener('touchend', this.onEnd.bind(this));

        // =mouse-events
        slider.addEventListener('mousedown', this.onStart.bind(this));
        slider.addEventListener('mousemove', this.onMove.bind(this));
        slider.addEventListener('mouseup', this.onEnd.bind(this));

    }

    onStart(evt) {
        // =dragging
        this.isDragging = true;

        // =
        this.currentX = evt.pageX || evt.touches[0].pageX;
        this.startX = this.currentX;

        // =
        this.windowWidth = window.innerWidth;
    }

    onMove(evt) {

        // =not-dragging
        if (!this.isDragging) return;

        // =
        this.currentX = evt.pageX || evt.touches[0].pageX;
        let diff = this.startX - this.currentX;
        diff *= -1;

        // = | don't let drag way from the center more than quarter of window
        if (Math.abs(diff) > this.windowWidth / 4) {
            if (diff > 0) {
                diff = this.windowWidth / 4;
            } else {
                diff = -this.windowWidth / 4;
            }
        }

    }

    onEnd() {

        // =direction
        const diff = this.startX - this.currentX;
        const isLeft = diff > 0;
        const isDraggedOver = Math.abs(diff) > this.windowWidth / 4;

        // =move
        if (isDraggedOver) {
            if (isLeft) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }

        // =reset
        this.startX = 0;
        this.isDragging = false;

    }

    nextSlide() {

        // =last | have no next
        if (this.currentIndex === this.slides.length - 1) return;

        // =distance
        const distance = (this.currentIndex + 1) * 100 * -1;

        let slide = this.slides[this.currentIndex];
        this.move(slide, distance);

        // =next-slide
        this.currentIndex++;
        slide = this.slides[this.currentIndex];
        this.move(slide, distance);
    }

    prevSlide() {

        // =first | have no prev
        if (this.currentIndex === 0) return;

        // =distance
        const distance = ((this.currentIndex + 1) * 100 * -1) + 200;

        let slide = this.slides[this.currentIndex];

        // =move
        this.move(slide, distance);

        // =next-slide
        this.currentIndex--;
        slide = this.slides[this.currentIndex];

        // =move
        this.move(slide, distance);
    }


    move(slide, distance = -100) {
        slide.style.transform = 'translateX(' + distance + '%)';
    }


    moveSlidesRightCol() {

        // =check
        if (this.slides.length < 3) return;

        // =formula | to align to the right column
        for (let i = 2; i < this.slides.length; i++) {
            const distance = (i - 1) * 100 * -1;
            this.move(this.slides[i], distance);
        }

    }
}


new Slider();





// -----------------------------------------------------------------------------
//              =lazy-loading
// -----------------------------------------------------------------------------
//
// // =test
// var sliderCiao = new Slider("ciao", [
//     'https://img.ibs.it/images/9788869183492_2_0_300_75.jpg',
//     'https://img.ibs.it/images/9788869183492_1_0_300_75.jpg',
//     'https://img.ibs.it/images/9788869183492_3_0_300_75.jpg',
//     'https://img.ibs.it/images/9788869183492_4_0_300_75.jpg'
// ]);


// -----------------------------------------------------------------------------
//              =card-creator
// -----------------------------------------------------------------------------
//
// Slider.prototype.cardCreator = function () {
//     var self = this;
//     this.imageUrls.forEach(function (url) {
//         // CARD
//         // card: div
//         var cardDiv = document.createElement("div");
//         cardDiv.className = "card card--not-active";

//         // card: img
//         var cardImg = document.createElement("img");
//         cardImg.className = "card__image card__will-animate";
//         cardImg.src = url;

//         // card: div > img
//         cardDiv.appendChild(cardImg);

//         // card: add to DOM
//         var queryCard = "#" + self.sliderId + " > .wrapper > .card--active";
//         var currentCardDiv = document.querySelector(queryCard);
//         var queryParent = "#" + self.sliderId + " > .wrapper";
//         var parentCardDiv = document.querySelector(queryParent);


//         parentCardDiv.insertBefore(cardDiv, currentCardDiv.nextSibling);

//         // PLACEHOLDER
//         // =placeholder
//         var placeholderItemDiv = document.createElement("div");
//         placeholderItemDiv.className = "cards-placeholder__item";

//         // // card: add to DOM
//         var queryPlaceholder = "#" + self.sliderId +
//             " > .cards-placeholder > .cards-placeholder__item";
//         var currentPlaceholderDiv = document.querySelector(queryPlaceholder);
//         var queryPlaceholderParent = "#" + self.sliderId + " > .cards-placeholder";
//         var parentDiv = document.querySelector(queryPlaceholderParent);
//         parentDiv.insertBefore(placeholderItemDiv, currentPlaceholderDiv.nextSibling);
//     });
// }


// -----------------------------------------------------------------------------
//              =slide while dragging
// -----------------------------------------------------------------------------
//
// Slider.prototype.moveCard = function (diff) {

//     var card = this.cards[this.currentIndex];

//     card.style.transform = 'translateX(calc(' + diff + 'px - 50%))';
//     diff *= -1;

//     this.moveCardEls(diff);
// };