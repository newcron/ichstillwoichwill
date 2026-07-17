export default class Gallery {
    constructor() {
        this._targetDiv = document.getElementById("image-gallery");
        this._imageConteiner = this._targetDiv.querySelector(".image-gallery-image")
        this._nextImagePreloader = this._targetDiv.querySelector(".image-gallery-image-next")
    }

    initialize() {
        this._images = JSON.parse(this._targetDiv.getAttribute("data-image-list"));
        this._currentIndex = 0;
        this.updateImage();
        this._targetDiv.querySelector(".image-gallery-previous").addEventListener("click", () => {
            this._currentIndex = this._currentIndex <= 0 ? this._images.length - 1 : this._currentIndex - 1;
            this.updateImage();
        });
        this._targetDiv.querySelector(".image-gallery-next").addEventListener("click", () => {
            this._currentIndex = (this._currentIndex + 1) % this._images.length;
            this.updateImage();
        });


    }

    updateImage() {

        const width = screen.width;
        this._imageConteiner.src = "/assets/gallery/" + selectRightImage(width, this._images[this._currentIndex]);
        this._nextImagePreloader.src = "/assets/gallery/" + selectRightImage(width, this._images[(this._currentIndex + 1) % this._images.length]);

        function selectRightImage(width, image) {

            return width >= 2560 ? image.at4000 :
                width >= 1920 ? image.at2560 :
                    width >= 1280 ? image.at1920 :
                        width >= 640 ? image.at1280 :
                            image.at640;
        }
    }
}