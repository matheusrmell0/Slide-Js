// Função de movimentar Slides
export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, startX: 0, movement: 0 };
  }

  // Este método ativado apenas no movimentar do mouse ou dedo, recebe em seu parâmetro o retorno da função updatePosition salvo em uma constante na função onMove o valor atualizado da propriedade (this.dist.movement) do objeto dist.
  // Este valor atualizado é passado em uma propriedade CSS do seletor referenciado na parâmetro da classe
  // O novo valor atualizado do this.dist.movement que foi passado na propriedade translate3d do elemento CSS é atribuido a uma nova propriedade (this.movePosition) do objeto dist para ser utilizado no método updatePosition
  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  // Método que remove e para a ativação do movimento de mouse ou dedo e sua função de callback ao soltar o click do mouse
  // Além de finalizar a cadeia de eventos ele salva na propriedade (this.dist.finalPosition) do objeto dist o último valor retornado e atualizado da propriedade this.dist.movement
  onEnd(event) {
    const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove'
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
  }

  // O método updatePosition ativado apenas no movimentar do mouse salva na propriedade do objeto dist (movement) o valor da subtração da propriedade startX pelas
  // coordenadas do eixo X vindas do evento de mousemove do método onMove
  // Retorna a subtração das propriedades do objeto dist, o movimento inicial - movimento final multiplicado por 16% do resultado e atualizado para usar em outros métodos
  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  // Método que passa o target do eixo X (event.clientX) no movimentar do mouse ou dedo como parâmetro no método updatePosition e o ativa
  // A ativação retorna um valor atualizado da propriedade this.dist.movement que é salvo em uma constante
  // este valor salvo retornado é passado para outro método (moveSlide) como parâmetro e o ativa
  onMove(event) {
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  // Método que inicia através do click do mouse pressionado o evento de mousemove e o callback do mesmo
  // Também salva o eixo X do evento (event.clientX) no objeto (this.dist.startX) no momento do click do mouse
  onStart(event) {
    let movetype;
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }
    this.wrapper.addEventListener(movetype, this.onMove);
  }

  // Método que adiciona os eventos de segurar e soltar click do mouse no seletor atribuído no parâmetro da classe
  // Também os eventos de mobile ("touchstart", "touchend");
  // Ativa suas funções de callback para cada evento
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // Método que referência as funções de callback ao objeto this principal da classe
  bindEvents() {
    this.onMove = this.onMove.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  // Método de iniciar os métodos que encadeiam os eventos da classe
  // Retorna o this que referencia o objeto principal da classe
  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}
