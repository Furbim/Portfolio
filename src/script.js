let menu = document.getElementById("menu");

menu.addEventListener("click", function () {
  let nav = document.querySelector("nav");
  nav.classList.toggle("display_flex");
});


var div = document.getElementById('log');
var textos = ['Thiago Freitas'];

function escrever(str, done) {
  var char = str.split('').reverse();
  var typer = setInterval(function () {
    if (!char.length) {
      clearInterval(typer);
      return setTimeout(done, 5000); 
    }
    var next = char.pop();
    div.innerHTML += next;
  }, 50);
}

function limpar(done) {
  var char = div.innerHTML;
  var nr = char.length;
  var typer = setInterval(function () {
    if (nr-- == 0) {
      clearInterval(typer);
      return done();
    }
    div.innerHTML = char.slice(0, nr);
  }, 50);
}

function rodape(conteudos, el) {
  var atual = -1;
  function prox(cb) {
    if (atual < conteudos.length - 1) atual++;
    else atual = 0;
    var str = conteudos[atual];
    escrever(str, function () {
      limpar(prox);
    });
  }
  prox(prox);
}
rodape(textos);


const cardsContainer = document.querySelector(".card-carousel");
const cardsController = document.querySelector(".card-carousel + .card-controller")

class DraggingEvent {
  constructor(target = undefined) {
    this.target = target;
  }

  event(callback) {
    let handler;

    this.target.addEventListener("mousedown", e => {
      e.preventDefault()

      handler = callback(e)

      window.addEventListener("mousemove", handler)

      document.addEventListener("mouseleave", clearDraggingEvent)

      window.addEventListener("mouseup", clearDraggingEvent)

      function clearDraggingEvent() {
        window.removeEventListener("mousemove", handler)
        window.removeEventListener("mouseup", clearDraggingEvent)

        document.removeEventListener("mouseleave", clearDraggingEvent)

        handler(null)
      }
    })

    this.target.addEventListener("touchstart", e => {
      handler = callback(e)

      window.addEventListener("touchmove", handler)

      window.addEventListener("touchend", clearDraggingEvent)

      document.body.addEventListener("mouseleave", clearDraggingEvent)

      function clearDraggingEvent() {
        window.removeEventListener("touchmove", handler)
        window.removeEventListener("touchend", clearDraggingEvent)

        handler(null)
      }
    })
  }

  getDistance(callback) {
    function distanceInit(e1) {
      let startingX, startingY;

      if ("touches" in e1) {
        startingX = e1.touches[0].clientX
        startingY = e1.touches[0].clientY
      } else {
        startingX = e1.clientX
        startingY = e1.clientY
      }


      return function (e2) {
        if (e2 === null) {
          return callback(null)
        } else {

          if ("touches" in e2) {
            return callback({
              x: e2.touches[0].clientX - startingX,
              y: e2.touches[0].clientY - startingY
            })
          } else {
            return callback({
              x: e2.clientX - startingX,
              y: e2.clientY - startingY
            })
          }
        }
      }
    }

    this.event(distanceInit)
  }
}


class CardCarousel extends DraggingEvent {
  constructor(container, controller = undefined) {
    super(container)

    this.container = container
    this.controllerElement = controller
    this.cards = container.querySelectorAll(".card")

    this.centerIndex = (this.cards.length - 1) / 2;
    this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100
    this.xScale = {};

    window.addEventListener("resize", this.updateCardWidth.bind(this))

    if (this.controllerElement) {
      this.controllerElement.addEventListener("keydown", this.controller.bind(this))
    }


    this.build()

    super.getDistance(this.moveCards.bind(this))
  }

  updateCardWidth() {
    this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100

    this.build()
  }

  build(fix = 0) {
    for (let i = 0; i < this.cards.length; i++) {
      const x = i - this.centerIndex;
      const scale = this.calcScale(x)
      const scale2 = this.calcScale2(x)
      const zIndex = -(Math.abs(i - this.centerIndex))

      const leftPos = this.calcPos(x, scale2)


      this.xScale[x] = this.cards[i]

      this.updateCards(this.cards[i], {
        x: x,
        scale: scale,
        leftPos: leftPos,
        zIndex: zIndex
      })
    }
  }


  controller(e) {
    const temp = { ...this.xScale };

    if (e.keyCode === 39) {
      for (let x in this.xScale) {
        const newX = (parseInt(x) - 1 < -this.centerIndex) ? this.centerIndex : parseInt(x) - 1;

        temp[newX] = this.xScale[x]
      }
    }

    if (e.keyCode == 37) {
      for (let x in this.xScale) {
        const newX = (parseInt(x) + 1 > this.centerIndex) ? -this.centerIndex : parseInt(x) + 1;

        temp[newX] = this.xScale[x]
      }
    }

    this.xScale = temp;

    for (let x in temp) {
      const scale = this.calcScale(x),
        scale2 = this.calcScale2(x),
        leftPos = this.calcPos(x, scale2),
        zIndex = -Math.abs(x)

      this.updateCards(this.xScale[x], {
        x: x,
        scale: scale,
        leftPos: leftPos,
        zIndex: zIndex
      })
    }
  }

  calcPos(x, scale) {
    let formula;

    if (x < 0) {
      formula = (scale * 100 - this.cardWidth) / 2

      return formula

    } else if (x > 0) {
      formula = 100 - (scale * 100 + this.cardWidth) / 2

      return formula
    } else {
      formula = 100 - (scale * 100 + this.cardWidth) / 2

      return formula
    }
  }

  updateCards(card, data) {
    if (data.x || data.x == 0) {
      card.setAttribute("data-x", data.x)
    }

    if (data.scale || data.scale == 0) {
      card.style.transform = `scale(${data.scale})`

      if (data.scale == 0) {
        card.style.opacity = data.scale
      } else {
        card.style.opacity = 1;
      }
    }

    if (data.leftPos) {
      card.style.left = `${data.leftPos}%`
    }

    if (data.zIndex || data.zIndex == 0) {
      if (data.zIndex == 0) {
        card.classList.add("highlight")
      } else {
        card.classList.remove("highlight")
      }

      card.style.zIndex = data.zIndex
    }
  }

  calcScale2(x) {
    let formula;

    if (x <= 0) {
      formula = 1 - -1 / 5 * x

      return formula
    } else if (x > 0) {
      formula = 1 - 1 / 5 * x

      return formula
    }
  }

  calcScale(x) {
    const formula = 1 - 1 / 5 * Math.pow(x, 2)

    if (formula <= 0) {
      return 0
    } else {
      return formula
    }
  }

  checkOrdering(card, x, xDist) {
    const original = parseInt(card.dataset.x)
    const rounded = Math.round(xDist)
    let newX = x

    if (x !== x + rounded) {
      if (x + rounded > original) {
        if (x + rounded > this.centerIndex) {

          newX = ((x + rounded - 1) - this.centerIndex) - rounded + -this.centerIndex
        }
      } else if (x + rounded < original) {
        if (x + rounded < -this.centerIndex) {

          newX = ((x + rounded + 1) + this.centerIndex) - rounded + this.centerIndex
        }
      }

      this.xScale[newX + rounded] = card;
    }

    const temp = -Math.abs(newX + rounded)

    this.updateCards(card, { zIndex: temp })

    return newX;
  }

  moveCards(data) {
    let xDist;

    if (data != null) {
      this.container.classList.remove("smooth-return")
      xDist = data.x / 250;
    } else {


      this.container.classList.add("smooth-return")
      xDist = 0;

      for (let x in this.xScale) {
        this.updateCards(this.xScale[x], {
          x: x,
          zIndex: Math.abs(Math.abs(x) - this.centerIndex)
        })
      }
    }

    for (let i = 0; i < this.cards.length; i++) {
      const x = this.checkOrdering(this.cards[i], parseInt(this.cards[i].dataset.x), xDist),
        scale = this.calcScale(x + xDist),
        scale2 = this.calcScale2(x + xDist),
        leftPos = this.calcPos(x + xDist, scale2)


      this.updateCards(this.cards[i], {
        scale: scale,
        leftPos: leftPos
      })
    }
  }
}

const carousel = new CardCarousel(cardsContainer)

var idade = idade();

function idade() {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  idade = anoAtual - 2007;

  const mesAtual = dataAtual.getMonth();
  const diaAtual = dataAtual.getDate();
  const mesNascimento = new Date(2007, 8, 14).getMonth();
  const diaNascimento = new Date(2007, 8, 14).getDate();

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--;
  }

  return idade;
};


const texts = {
  pt: {
    navHome: "INICIO",
    navSobre: "SOBRE MIM",
    navPortfolio: "PORTFÓLIO",
    navContato: "CONTATO",
    home: "Olá, eu sou",
    jobTitle: "Sou desenvolvedor Full Stack",
    visitGitHub: "Visitar GitHub",
    skills: "Competências",
    aboutMe: "Sobre Mim",
    aboutText: `Sou um estudante de TI de ${idade} anos, focado em criar sistemas funcionais e responsivos, como um portfólio com temas claro e escuro e um sistema de registro de presença. Busco trabalhar na área para ganhar experiência prática e aperfeiçoar minhas habilidades, sempre priorizando estética e funcionalidade em meus projetos.`,
    visitLinkedIn: "Visitar Linkedin",
    portfolio: "Portfólio",
    dragToMove: "Arraste para movê-los",
    contact: "Contato",
    lblNome: "Nome",
    lblSobrenome: "Sobrenome",
    lblTelefone: "Telefone",
    lblMensagem: "Mensagem",
    formBtn: "Enviar",
    acessar: "Acessar",
    descricao1: "Reprodução de um site utilizando display grid, com algumas funções em javascript!",
    descricao2: "Desenvolvimento do meu portfólio pessoal, responsivo e com diversas funcionalidades em javascript!",
    descricao3: "Sistema de gerenciamento de turmas, feito com php contendo diversas funcionalidades e inovações afim de facilitar a gestão das turmas!",
    descricao4: "Jogo de Damas feito completamente em Java, ainda incompleto!",
    descricao5: "Veja mais projetos visitando minha página no Github, clicando no botão abaixo!",
    projetos: "Projetos",
    contato: "Entre em contato",
  },
  en: {
    navHome: "HOME",
    navSobre: "ABOUT ME",
    navPortfolio: "PORTFOLIO",
    navContato: "CONTACT",
    home: "Hello, I'm",
    jobTitle: "I'm a Full Stack Developer",
    visitGitHub: "Visit GitHub",
    skills: "Skills",
    aboutMe: "About Me",
    aboutText: `I am a ${idade}-year-old IT student, focused on creating functional and responsive systems, such as a portfolio with light and dark themes and an attendance tracking system. I'm looking to work in the field to gain practical experience and enhance my skills, always prioritizing aesthetics and functionality in my projects.`,
    visitLinkedIn: "Visit LinkedIn",
    portfolio: "Portfolio",
    dragToMove: "Drag to move them",
    contact: "Contact",
    lblNome: "First Name",
    lblSobrenome: "Last Name",
    lblTelefone: "Phone",
    lblMensagem: "Message",
    formBtn: "Send",
    acessar: "View More",
    descricao1: "Reproduction of a website using display grid, with some JavaScript functions!",
    descricao2: "Development of my personal portfolio, responsive and with various JavaScript functionalities!",
    descricao3: "Class management system, built with PHP, containing multiple functionalities and innovations to facilitate class management!",
    descricao4: "Checkers game made entirely in Java, still incomplete!",
    descricao5: "See more projects by visiting my GitHub page by clicking the button below!",
    projetos: "Projects",
    contato: "Contact Me",
  }
};

var currentLanguage;

document.addEventListener("DOMContentLoaded", function(){
  if(localStorage.getItem("theme") == "light"){
    toggleImg.src = "../img/moon.png";
    document.body.classList.add("light-mode");
  } 

  if(localStorage.getItem("language") == "en"){
    currentLanguage = 'pt'; 
  } else{
    currentLanguage = 'en';
  }

  mudarIdioma();
});


async function mudarIdioma() {
  const idioma = document.getElementById("idioma");
  currentLanguage = currentLanguage === 'pt' ? 'en' : 'pt'; 

  document.querySelector(".animation #navHome").textContent = texts[currentLanguage].navHome;
  document.querySelector(".animation #navSobre").textContent = texts[currentLanguage].navSobre;
  document.querySelector(".animation #navPortfolio").textContent = texts[currentLanguage].navPortfolio;
  document.querySelector(".animation #navContato").textContent = texts[currentLanguage].navContato;

  document.querySelector("#home h1:nth-of-type(1)").textContent = texts[currentLanguage].home;
  document.querySelector("#home #dev").textContent = texts[currentLanguage].jobTitle;
  document.querySelector("#home button").textContent = texts[currentLanguage].visitGitHub;

  document.querySelector("#sobre h1").textContent = texts[currentLanguage].skills;
  document.querySelector("#sobre #titulo h1").textContent = texts[currentLanguage].aboutMe;
  document.querySelector("#sobre p").textContent = texts[currentLanguage].aboutText;
  document.querySelector("#sobre button").textContent = texts[currentLanguage].visitLinkedIn;

  document.querySelector("#portfolio h1").textContent = texts[currentLanguage].portfolio;
  document.querySelector("#portfolio .container .card-carousel .card #descricao1").textContent = texts[currentLanguage].descricao1;
  document.querySelector("#portfolio .container .card-carousel .card #descricao2").textContent = texts[currentLanguage].descricao2;
  document.querySelector("#portfolio .container .card-carousel .card #descricao3").textContent = texts[currentLanguage].descricao3;
  document.querySelector("#portfolio .container .card-carousel .card #descricao4").textContent = texts[currentLanguage].descricao4;
  document.querySelector("#portfolio .container .card-carousel .card #descricao5").textContent = texts[currentLanguage].descricao5;
  document.querySelector("#arrasta").textContent = texts[currentLanguage].dragToMove;

  document.querySelector("#contato h1").textContent = texts[currentLanguage].contact;
  document.querySelector("#contato .login-box #lblNome").textContent = texts[currentLanguage].lblNome;
  document.querySelector("#contato .login-box #lblSobrenome").textContent = texts[currentLanguage].lblSobrenome;
  document.querySelector("#contato .login-box #lblTelefone").textContent = texts[currentLanguage].lblTelefone;
  document.querySelector("#contato .login-box #lblMensagem").textContent = texts[currentLanguage].lblMensagem;
  document.querySelector("#contato .custom-btn").textContent = texts[currentLanguage].formBtn;

  document.querySelector(".footer-col #navHome").textContent = texts[currentLanguage].navHome;
  document.querySelector(".footer-col #navSobre").textContent = texts[currentLanguage].navSobre;
  document.querySelector(".footer-col #navPortfolio").textContent = texts[currentLanguage].navPortfolio;
  document.querySelector(".footer-col #navContato").textContent = texts[currentLanguage].navContato;

  document.querySelector(".footer-col #projetos").textContent = texts[currentLanguage].projetos;
  document.querySelector(".footer-col #contato").textContent = texts[currentLanguage].contato;

 
  idioma.src = currentLanguage === 'pt' ? "./img/portuguese.png" : "./img/english.png";
  localStorage.setItem("language", currentLanguage);
}






const toggleImg = document.getElementById("mode");

toggleImg.addEventListener("click", function(){

  if(toggleImg.src.includes("sun.png")){

    toggleImg.src = "./img/moon.png";
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");

  }else{

    toggleImg.src = "./img/sun.png";
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
  }

});

document.querySelectorAll('.smooth-scroll').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      targetElement.scrollIntoView({
          behavior: 'smooth'
      });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#contato form");
  const nome = form.querySelector("input[name='nome']");
  const sobrenome = form.querySelector("input[name='sobrenome']");
  const telefone = form.querySelector("input[name='telefone']");
  const email = form.querySelector("input[name='email']");
  const mensagem = form.querySelector("textarea");

  // Função para validar email usando expressão regular
  function validarEmail(email) {
      const regexEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      return regexEmail.test(email);
  }

  // Função para formatar o telefone
  function formatarTelefone(event) {
      let valor = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
      if (valor.length > 10) {
          valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3"); // Formato (XX) XXXXX-XXXX
      } else if (valor.length > 5) {
          valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3"); // Formato (XX) XXXX-XXXX
      } else if (valor.length > 2) {
          valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2"); // Formato (XX) XXXX
      } else {
          valor = valor.replace(/^(\d*)/, "($1"); // Início com (XX
      }
      event.target.value = valor;
  }

  // Aplica a formatação ao telefone enquanto o usuário digita
  telefone.addEventListener("input", formatarTelefone);

  // Validação do formulário ao clicar no botão de envio
  form.addEventListener("submit", function (event) {
      event.preventDefault(); // Evita o envio até a validação

      if (nome.value.trim() === "") {
          alert("Por favor, preencha o campo Nome.");
          nome.focus();
          return;
      }

      if (sobrenome.value.trim() === "") {
          alert("Por favor, preencha o campo Sobrenome.");
          sobrenome.focus();
          return;
      }

      if (telefone.value.trim() === "" || telefone.value.length < 14) {
          alert("Por favor, insira um número de telefone válido.");
          telefone.focus();
          return;
      }

      if (!validarEmail(email.value)) {
          alert("Por favor, insira um email válido.");
          email.focus();
          return;
      }

      if (mensagem.value.trim() === "") {
          alert("Por favor, escreva sua mensagem.");
          mensagem.focus();
          return;
      }

      alert("Formulário enviado com sucesso!");
      form.submit(); // Envia o formulário após a validação
  });
});

