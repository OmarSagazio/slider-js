/* =test */
import '../public/css/test.css';
/* =test */

import '../public/css/main.css';

/**
 * TODO: =improvements
 *  - add Object with default properties
 *      + id
 *      + array
 * --------------------------------------------------------------------------
 *      + font-size: 14px;  -- reset 4 items
 *      + Buttons 
 *          -> appear only if there are more than 1 slide
 *          -> deferred
 *      + transition: all .8s ease-out; -- <property> <duration> <function>
 *                  slide.style.transition = 'transform 0.5s ease-out';
 *                  slide.style.transform = 'translateX(___)';
 * --------------------------------------------------------------------------
 *      + Parallax Effect
 *      + TODO: improve! Avoid delta on start dragging
 *              this.moveCard(diff);
 */
class Slider {
    constructor(id = "slider", isCarousel = false, hasPlaceholders = false, placeholderPattern = "p-", contents = []) {

        window.addEventListener("load", this.init.bind(this, id, isCarousel, hasPlaceholders, placeholderPattern, contents));

    }

    init(id, isCarousel, hasPlaceholders, placeholderPattern, contents) {

        // =properties
        this.sliderId = id;
        this.contents = contents;
        this.isCarousel = isCarousel;
        this.hasPlaceholders = hasPlaceholders;
        this.placeholderPattern = placeholderPattern;

        // =
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;

        // =slider
        const sliderRef = "#" + this.sliderId;
        const slider = document.querySelector(sliderRef);

        // =defer
        if (contents.length > 0) {
            this.loadContent(slider);
        }


        // =refs
        const nextRef = sliderRef + " > .slider__next";
        const prevRef = sliderRef + " > .slider__prev";
        const slidesRef = sliderRef + " > .slider__item";
        const placeholderRefs = sliderRef + " > .placeholder > .placeholder__list > .placeholder__item > .placeholder__radio";

        // =pointers
        const nextButton = document.querySelector(nextRef);
        const prevButton = document.querySelector(prevRef);
        this.placeholders = document.querySelectorAll(placeholderRefs);

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
        // slider.addEventListener('mousedown', this.onStart.bind(this));
        // slider.addEventListener('mousemove', this.onMove.bind(this));
        // slider.addEventListener('mouseup', this.onEnd.bind(this));


        // =placeholder
        if (this.hasPlaceholders) {
            this.placeholders.forEach(
                placeholder => placeholder.addEventListener("click", this.selectSlide.bind(this))
            );

            // update placeholder
            this.updatePlaceholder();
        }


        // =carousel
        if (this.isCarousel) {
            this.timeId = 1;
            this.startCarousel();

            const carouselRef = sliderRef + " > .placeholder > .placeholder__list > .placeholder__carousel";
            const carouselLabel = document.querySelector(carouselRef + " > .placeholder__play");
            const carouselCheck = document.querySelector(carouselRef + " > .placeholder__check");
            carouselCheck.checked = false
            this.isCarouselChecked = carouselCheck.checked;
            carouselLabel.addEventListener("click", this.onToggleCarousel.bind(this));
        }
    }

    onToggleCarousel() {
        if (this.isCarouselChecked) {
            this.timeId = 1;
            this.startCarousel();
        } else {
            this.stopCarousel();
        }
        this.isCarouselChecked = !this.isCarouselChecked;
    }

    selectSlide(event) {
        const position = this.getPosition(event.target.id);
        const distances = this.getTranslateDistances(position);
        for (let i = 0; i < this.slides.length; i++) {
            this.move(this.slides[i], distances[i]);
        }

        this.currentIndex = position;
    }

    getTranslateDistances(pos) {

        // Validation
        if (pos < 0 || this.slides.length < 2) {
            return
        }

        const k = -100;
        const length = this.slides.length;
        let distances = [];

        // 
        if (pos === 0) {
            distances.push(0);
            for (let i = 0; i < length - 1; i++) {
                const val = i * k;
                distances.push(val);
            }
            return distances;
        }

        // 
        if (pos === 1) {
            distances.push(k);
            distances.push(k);

            for (let i = 1; i < length - 1; i++) {
                const val = i * k;
                distances.push(val);
            }

            return distances;
        }


        // init
        distances.push(k);

        // pre
        for (let i = 1, n = 2; i < pos - 1; i++, n++) {
            const val = n * k;
            distances.push(val);
        }

        // current
        const range = (length - 1 > pos) ? 3 : 2;
        for (let i = 0; i < range; i++) {
            distances.push(pos * k);
        }

        // post
        if (length > 4) {
            for (let i = pos + 2; i < length; i++) {
                const val = (i - 1) * k;
                distances.push(val);
            }
        }

        return distances;

    }

    getPosition(id) {
        return parseInt(id.replace(this.placeholderPattern, ""));
    }

    startCarousel() {
        if (this.timeId === 0) return;

        this.timeId = setInterval(
            this.nextSlide.bind(this),
            2000
        );
    }

    stopCarousel() {
        clearInterval(this.timeId);
        this.timeId = 0;
    }

    loadContent(slider) {

        // loop: inject content
        this.contents.forEach(content => {
            // =item-container
            const itemContainerDiv = document.createElement("div");
            itemContainerDiv.className = "slider__item";
            itemContainerDiv.innerHTML = content;
            slider.appendChild(itemContainerDiv);
        });

    }

    onStart(evt) {
        if (this.isCarousel && this.timeId) {
            this.stopCarousel();
            return;
        }

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

        // =
        if (this.isCarousel && diff == 0) {
            this.startCarousel();
            return;
        }

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

    resetSlides() {
        this.move(this.slides[0], 0);

        for (let i = 1; i < this.slides.length; i++) {
            const distance = (i - 1) * 100 * -1;
            this.move(this.slides[i], distance);
        }
    }

    // update placeholder
    updatePlaceholder() {
        if (this.hasPlaceholders) {
            this.placeholders[this.currentIndex].checked = true
        }
    }

    nextSlide() {
        // =last | have no next
        if (this.currentIndex === this.slides.length - 1) {
            this.resetSlides();
            this.currentIndex = 0;

            // update placeholder
            this.updatePlaceholder();

            return;
        }

        // =distance
        const distance = (this.currentIndex + 1) * 100 * -1;

        let slide = this.slides[this.currentIndex];
        this.move(slide, distance);

        // =next-slide
        this.currentIndex++;
        slide = this.slides[this.currentIndex];
        this.move(slide, distance);

        // update placeholder
        this.updatePlaceholder();
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

        // update placeholder
        this.updatePlaceholder();
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

// =slider
// new Slider("slider", false, true);
// =carousel
new Slider("slider", true, true);

// init(id, isCarousel, hasPlaceholders, placeholderPattern, contents) 
// new Slider("slider", false, []);

//     new Slider("slider", false, [
//     "abavavavavav",
//     "cicicicocio",
//     `<figure>
//     <a class="img-ctn" href="/giro-del-mondo-in-sei-libro-guido-barbujani-andrea-brunelli/e/9788815274205" tabindex="0">
//     <img class=" lazyloaded" src="https://img.ibs.it/images/9788815274205_0_0_180_50.jpg" data-src="https://img.ibs.it/images/9788815274205_0_0_180_50.jpg" alt="Libro Il giro del mondo in sei milioni di anni Guido Barbujani Andrea Brunelli">
//     </a>
//     <figcaption>
//     <h3 class="title">
//     <a href="/giro-del-mondo-in-sei-libro-guido-barbujani-andrea-brunelli/e/9788815274205" tabindex="0">
//     Il giro del mondo in... </a>
//     </h3>
//     <h4 class="author">
//     Guido Barbujani Andrea... </h4>
//     <div class="rank">
//     <span class="star starred"></span><span class="star starred"></span><span class="star starred"></span><span class="star starred"></span><span class="star starred"></span>
//     </div>
//     <div class="price">
//     <span class="act-price">12,75 €</span>
//     <span class="old-price">15,00 €</span>
//     </div>
//     </figcaption>
//     </figure>`
// ]);





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