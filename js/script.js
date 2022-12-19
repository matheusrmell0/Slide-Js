import SlideNav from "./slide.js";

const slide = new SlideNav('.slide', '.slide-wrapper');
slide.init()
slide.addControl('.custom-controls')
slide.addArrow('.prev', '.next')