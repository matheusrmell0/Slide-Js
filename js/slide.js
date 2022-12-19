// Função de debounce importada para melhorar a performace dos eventos diminuindo seus disparos
import debounce from "./debounce.js";

// Função de movimentar Slides
export class Slide {
  // O constructor recebe dois parametros do DOM (wrapper e slide)
  // Slide vai o conjunto de imagens a serem listadas através de um seletor, essas imagens vão receber vários métodos, configurações e objetos
  // Wrapper é a uma div (embrulho) na qual todas as imagens do slide estão dentro, ele é a container pai do slide e recebe algumas funções e métodos para serem usados na classe
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    // this.dist é um objeto que recebe a posição final, inicial e o movimento completo do mouse entre o pointer inicial e final em relação ao eixo X
    // Esse objeto controla o esqueleto da classe, é com ele que todos os métodos do slide trabalham e ativam suas devidas funcionalidades
    this.dist = { finalPosition: 0, startX: 0, movement: 0 };
    this.activeClass = "active";
    // Novo evento criado e adicionado no constructor
    this.changeEvent = new Event("changeEvent");
  }

  // Adiciona um transição suave na mudança dos slides
  // Esse método recebe um valor bolleano em sua verificação
  transition(active) {
    this.slide.style.transition = active ? `transform .3s` : ``;
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
    const movetype = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  // Faz uma verificação do exato valor do movimento salvo e também a existencia de um item antes e seguinte do ativo no momento
  // Muda o slide no final do movimento e o coloca no centro do wrapper
  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      // Caso o movimento vá além do wrapper o slide automaticamente volta a origem do ativo
      this.focusSlideByIndex(this.index.active);
    }
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
    const pointerPosition =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
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
    this.transition(false);
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

  // Calcula a largura do wrapper (div pai) e subtraí com a largura do elemento slide dentro dela e divide o resultado por 2
  // Logo subtraí o resultado pela coordenada X do elemento filho em relação a esquerda da tela, e transforma em negativo
  // Retorna o valor da posição do item para centralizar na tela
  // Com esse cálculo é possível centralizar o item do wrapper na tela do usuário passando essas coordenada no método moveSlide
  calcSlidePosition(slide) {
    // Pega o total da tela (wrapper) - largura do item (slide) = Margens do item (slide)
    // (Margens do item / 2) - slide.offsetLeft (Posição do item (slide) em relação a esquerda da tela)
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  // Configurações do Slide como seu elemento e posição na tela centralizada
  // Desestrutura o seletor informado no parâmetro da classe (slide) com cada filho dela em uma Array
  // Retorna uma array com objetos para cada item do parâmetro slide com o method .map
  // Nesse objeto tem o elemento e sua posição em relação a esquerda do objeto window
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.calcSlidePosition(element);
      return { element, position };
    });
  }

  // Método que salva em um objeto a posição do item informado no parâmetro pelo index
  // Objeto contém a posição index ativa do item e suas respectivas ordem preview e next
  navSlidesByIndex(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  // Foca no slide através do index repassado no parâmetro do método
  // O parâmetro index recebe a propriedade position do elemento do objeto this.slideArray através do seu index
  // A propriedade position foi calculada no método calcSlidePosition para que o resultado subtraia no parâmetro do método moveSlide
  // Logo o item do slide receberá um valor para o eixoX no translate3d que focará no elemento/imagem centralizado na tela
  // Também o index da array informada no parâmetro irá para outro método (navSlidesByIndex)
  focusSlideByIndex(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.navSlidesByIndex(index);
    // Altera o valor da posição do item no slide para o item focado na função
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();

    // Emite o evento this.changeEvent ('changeEvent' do constructor) no elemento wrapper
    // Este evento agora poderá ser observado no próprio wrapper
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  // Adiciona uma classe CSS com estilos no slide atual ativo na tela, e remove dos demais
  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  // Ativa o método this.focusSlideByIndex para o slide anterior de acordo com o slide atual
  activePrevSlide() {
    if (this.index.prev !== undefined) this.focusSlideByIndex(this.index.prev);
  }

  // Ativa o método this.focusSlideByIndex para o próximo slide de acordo com o slide atual
  activeNextSlide() {
    if (this.index.next !== undefined) this.focusSlideByIndex(this.index.next);
  }

  // Esse método é ativado no evento de risize da página
  // Ele atualiza as configurações, valores e parametros do método slidesConfig
  // Valores de posicionamento do elemento são alterados para novos valores no timeout de 1 segundo quando a tela sofre um resize
  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.focusSlideByIndex(this.index.active);
    }, 1000);
  }

  // Ativa o método onResize no evento de resize da página
  addReizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  // Método que referência as funções de callback ao objeto this principal da classe
  bindEvents() {
    this.onMove = this.onMove.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
    // Debounce utilizado para melhor performar o evento de resize
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
  }

  // Método de iniciar os métodos que encadeiam os eventos da classe
  // Retorna o this que referencia o objeto principal da classe
  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addReizeEvent();
    this.focusSlideByIndex(0);
    return this;
  }
}

// Nova classe criada e extendida da classe Slide com funcionalidades para utilização de botões para navegação
export default class SlideNav extends Slide {
  constructor(...args) {
    super(...args);
    this.bindControlEvents();
  }

  // Recebe dois parametros (Botoes de prev e next)
  // Ativa e adiciona o evento de click no this dos elementos selecionados
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  // Com os elementos selecionados, ativa através do mouse click o callback das funcoes this.activePrevSlide e this.activeNextSlide
  // Funcoes essas que movimentam o slide através do index anterior e próximo da array dos elementos slide
  addArrowEvent() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  // Cria um elemento HTML (ul) contendo o dataset 'slide'
  // Realiza um loop pelo slideArray (Array que contem o elemento e o index de cada item do slide) adicionando e incrementando um elemento HTML (li)
  // Essa li recebe o valor de index do elemento acrescentado de +1 para melhor leitura
  // Adiciona a nova lista de elementos HTML logo abaixo do wrapper
  // Retorna a constante control
  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";

    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${
        index + 1
      }</a></li>`;
    });
    this.wrapper.appendChild(control);
    return control;
  }

  // Método que recebe em seu parametro o item e o index
  // Adiciona o event de 'click' ao item
  // Ativa o método de focar o slide através do index, passando o index no parametro inical
  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.focusSlideByIndex(index);
    });
    // Toda vez que o slide for alterado o evento changeEvent será ativado realizando a função de callback this.activeControlItem
    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  // Realiza um loop por uma array contendo todos os slides e adiciona uma classe this.activeClass ('active') no slide focado removando dos demais outros
  // Esse método utiliza do index da classe ativa no foco do slide
  activeControlItem() {
    this.controlArray.forEach((item) =>
      item.classList.remove(this.activeClass)
    );
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

// Método que por padrão recebe o this.createControl em seu this.control ou outro elemento HTML em seu parametro
// Por padrão recebe o return da constante control que é o elemento HTML criado no this.createControl
// Desestrutura os filhos do elemento HTML e o transforma em uma Array
// Ativa o método this.activeControlItem para adicionar a classe 'active' no primeiro HTML (li) abaixo do slide
// Realiza um loop pela a nova Array com os filhos do elemento HTML e ativa para cada um o método this.eventControl, que recebe tanto o index quanto o item em sua função
  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  // Método que referência as funções de callback ao objeto this principal da classe
  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
