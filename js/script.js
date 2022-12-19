import Slide from "./slide.js";

const slide = new Slide('.slide', '.slide-wrapper');
slide.init()
slide.focusSlideByIndex(4)
slide.activeNextSlide()

console.log(slide)