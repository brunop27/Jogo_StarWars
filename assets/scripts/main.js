//Capiturando o primeiro elemento 'body'
const tela = document.getElementsByTagName('body')[0];

//Instacia uma função chamada game na varia game
const game = new Game();

//Instancia da variável da nave jogador
let nave;
const velocMovimento = 15;
const laser_jogador = [];

//Instancia das variável da nave inimigo
const maxInimigos = 5;
const inimigos = [];
const laser_inimigo = [];
const delay_lasers = 18;

//Variável usada para calcular intervalo
let intervalo;
const aceleracao_laser = 3;

//adicionando um evento á variavel “tela” com ‘keyup’ que recebe o valor do Enter quando clicado pelo usuario
tela.addEventListener('keyup', function (event){
	if(event.key == 'Enter'){

	//Chama o método isPause(), que retorna true/false, indicando se o jogo tá pausado ou não. Se for false, ele chama o método .start(), Se retornar true, chama o método pause()	
    (game.isPause()) ? game.start() : game.pause('Pause');	
	}else if(event.key == 'p'){
	    game.pause('Pause');
    }

    //condição usada para evitar que crie laser com o jogo pausado
    if(!game.isPause()){
        //Metodo que chama a função disparo da nave do jogador
        if(event.key == ' '){
            nave.fire();
        }
    
        //Nova condição que verifica se a nave parou ou está parada
        if(event.key == 'ArrowLeft' || event.key == 'ArrowRight'){
            nave.moveStop();
        }
    }
});

//Adicionando evento de tecla pressionada para movimentação da nave do jogador
tela.addEventListener('keydown', function(event){
    //Condição para saber se o jogo ta pausado, se não tiver, o jogador pode mexer a nave
    if(!game.isPause()){
        //Movimento da nave esquerdo e direito
        if(event.key == 'ArrowLeft'){
            //Variável "velocMovimento" será usada para mover a nave para esquerda(-) e direita(+)
            //Chama o objeto nave e acessa seu método setXY, lançando os valores da nave como parâmetro, passando o valor nave.X() para posição horizontal, e nave.Y() para vertical(valor fixo)
            //nave.setXY(nave.x() - velocMovimento, nave.y());
            //Alterado método de mover a nave do jogador, para método automatizado
            nave.moveLeft();
        }else if(event.key == 'ArrowRight'){
            //nave.setXY(nave.x() + velocMovimento, nave.y())
            nave.moveRight();
        }
    }
})

//Função game que pega elementos do body e configura elementos da pontuação, contem as funções de “pausar” e “iniciar” e outras ações envolvendo a nave do jogador e inimigo
function Game(){
	const painel = document.getElementById("painel");
	const placar = document.getElementById("placar");
	const placarMsg = painel.querySelector(".msg");
	let pause = true;
    let pontuacao = 0;
	
	//Verifica se está “pausado”
	this.isPause = () => pause;
	
    //Método que captura a a largura e a altura da tela do jogo
    this.w = () => tela.getBoundingClientRect().width;
    this.h = () => tela.getBoundingClientRect().height;

	//Oculta o painel “Nome do jogo + Msg” e mostra o “placar”
	this.start = () => {
        painel.style.display = "none";
        placar.style.display = "flex";
        pause = false;

        //Verifica se a nave ja foi criada, se não, ela instancia e cria uma.
        if(nave == undefined){
            //Cria o objeto NaveJogador(), linha alterada para semântica do código
            nave = new NaveJogador();
            for(let cont = 0; cont < maxInimigos; cont++){
                let imagem = 'cp1';
                switch(Math.round(Math.random() * 2)){
                case 1: imagem = 'iba';
                    break;
                case 2: imagem = 'iy';
                    break;
                }
                inimigos.push(new Inimigos(imagem));
            }
        };

        //Função que opera uma chamada de método, nesse caso, .animation() a cada 100segundos. Essa função percorrerá o array inimigos, ou seja, cada objeto inimigo criado e para cada objeto ele cama a função .animation()
        intervalo = setInterval(() => {
            //Chama o método que automatiza o movimento da nave do jogador
            nave.animation();
            inimigos.forEach(inimigo => {
                inimigo.animation();
            });

            //Chamando a função que gera a animação dos lasers
            gerenciarLasers(laser_jogador);
            gerenciarLasers(laser_inimigo);

            //Condição necessária para gerar randomicamente os disparos das naves inimigas DEPOIS que passar da tela
            let sorteio = Math.round(Math.random()*delay_lasers);
            if(sorteio < inimigos.length){
                if(inimigos[sorteio].y()>0){
                    inimigos[sorteio].fire();
                }
            }
            gerenciarColisoes();
        }, 100);
    };

	//Método que pausa e mostra mensagem
	this.pause = (mgs) =>{
	  painel.style.display = "block";
	  placarMsg.textContent = mgs;
	  pause = true;
      clearInterval(intervalo);
      nave.moveStop();
    };

    //Método que cria a ação de exibir a mensagem 'Game Over' na tela
    this.gameOver = () => {
        //Recicla o método pause(), passando apenas a mensagem a ser exibida
        this.pause('Game Over');
        //Função usada para 'resetar' o jogo depois do 'GameOver'
        tela.addEventListener('keyup', function(event){
            if(event.key == 'Enter'){
                location.reload();
            }
        })
    }

    this.pontuar = () => {
        pontuacao++;
        placar.querySelector('span').textContent = pontuacao;
    }
}

//Função criada para relacionar o objeto Nave() e objeto Laser, assim, recebendo a posição de um e outro, sem precisar instanciar um dentro do outro fugindo da POO
function Ovni(elemento){
    //Método que captura a a largura e a altura da div da nav
    this.w = () => elemento.getBoundingClientRect().width;
    this.h = () => elemento.getBoundingClientRect().height;
    
    //Método que captura a posição da nave
    this.x = () => elemento.getBoundingClientRect().x;
    this.y = () => elemento.getBoundingClientRect().y;

    //Método que seta a posição inicial da nave
    this.setXY = (x, y) =>{
        if(x<0){
            x = 0;
        }else if(x > game.w() - this.w()){
            x = game.w() - this.w();
        }
        elemento.style.left = `${x}px`;
        elemento.style.top = `${y}px`;  
    };
    
    //Métodos responsáveis por tirar o elemento da tela
    this.colisao = () => elemento.remove();
    this.remove = () => elemento.remove();
}

//Objeto que cria a nave
function Nave(imgNave = "wt"){
    //Cria uma div para alocar a nave criada
    // let div = document.createElement('div');

    //Adiciona a classe .nave na div criada acima
    // div.classList.add('nave');

    //Chama a função que recilca o codigo de criar a div
    let div = elemento('div','nave');
     
    //Instancia o objeto Ovini em uma callback
    Ovni.call(this, div);
    
    //Cria uma tag img
    let iNave = document.createElement("img");
    
    //Adiciona a propriedade "src" passando o caminho da imagem a ser criada
    iNave.src = `assets/images/${imgNave}.png`;

    //Adiciona a tag img criada acima dentro da div criada anteriormente
    div.appendChild(iNave);
    
    // //Toda vez que chamar a função onload, esta, receberá uma nova função que será a “fn”, que recebe o i.onload;
    this.onload = (fn) => iNave.onload = fn;
    
}

//Função usada para evitar bugs de disparo da nave do jogador
function NaveJogador(imagem = 'wt'){
    Nave.call(this, imagem);
    //variavel que verifica qual lado a nave se movimenta
    let deslocamento = 0;
    //Método que calcula o posicionamento da nave referente a tela
    let posicaoInicial = () => {
        this.setXY(
            game.w()/2 - this.w()/2, //valor de X
            game.h() - this.h() - 10
        );
    }

    //Carrega a imagem com a posição setada
    this.onload(posicaoInicial);

    //Metodo que cria o laser
    this.fire = () => {
        let laser = new Laser();
        let x = this.x() + this.w()/2 - laser.w()/2;
        let y = this.y() - laser.h() - 1;
        laser.setXY(x, y);
        laser_jogador.push(laser);
    }

    //Métodos que serão chamados e alterará a variável de acordo com seu movimento
    this.moveStop = () => deslocamento = 0;
    this.moveLeft = () => deslocamento = -1;
    this.moveRight = () => deslocamento = 1;

    //Função que automatiza o movimento da nave/ deixa mais fluido
    this.animation = () => {
        //esquerda, x = -1 /// direita, x = 1 /// nave para/parada, x = 0
        this.setXY(this.x()+velocMovimento*deslocamento, this.y());
    }
    //Ao ser chamada, aciona o método gameOver();
    this.colisao = () => game.gameOver();
}

//Instancia o objeto Nave(), herdando todas as características para criar o Inimigo
function Inimigos(imagem = 'cp1'){
    //Chama o objeto Nave, herdando todas as propriedades dela
    Nave.call(this, imagem);

    //Seta a posição do Inimigo
    this.setPosicaoInicial = () => {
        //Sorteia (a posição inicial do inimigo no X, Y
        let x = Math.round(Math.random() * (game.w() - this.w()));
        let y = Math.round(-this.h() - 10 - (Math.random()*1000));
        this.setXY(x, y);
    }

    //Função que chama o método setXY, passando o valor fixo do eixo X(ja que ela não se move nesse eixo) e o valor do eixo Y multiplicado pelo variável velocMovimento
    this.animation = () => {
        this.setXY(this.x(), this.y() + velocMovimento);
        //Condição que verifica se o objeto saiu da tela, que reseta a sua posição mandando para um valor inicial e resetando a posição desta
        if(this.y() > game.h() + 20){
            this.setPosicaoInicial();
        };
    }
  
    //Metodo que cria o laser do inimigo
    this.fire = () => {
        let laser = new Laser(true);
        let x = this.x() + this.w()/2 - laser.w()/2;
        let y = this.y() + this.h() + 1;
        laser.setXY(x, y);
        //chama o vetor 'laser_inimigo' e adiciona o objt 'laser'
        laser_inimigo.push(laser);
    }

    //Função(herdada), acionada quando inicia o game
    this.onload(this.setPosicaoInicial);

    //Chama uma nova 'posição' com o método setPosicaoInicial() e o método pontuar() que acrescenta um no 'pontuar'. Funcao usada para complementar a colisao
    this.colisao = () => {
        game.pontuar();
        let explosao  = elemento('img', 'explosao');
        explosao.src = "assets/images/explotion.gif";
        explosao = new Ovni(explosao);
        explosao.setXY(this.x(), this.y());
        this.setPosicaoInicial();
        setTimeout(()=>{
            explosao.remove();
        },900);
    }
}

//Função usada para reciclar códigos repetidos. A mesma, substitui a linhas que criam as div e adicionam nas telas
function elemento(tag, classe){
    //Cria um elemento baseado na tag passada por parametro
	let elemento = document.createElement(tag);
    //Adiciona a classe na div criada acima
	elemento.classList.add(classe);
    //Adiciona a tag na tela
	tela.appendChild(elemento);
	return elemento;
}

//Função usada para criar o laser da nave do jogador e do inimigo
function Laser(inimigo = false){
    //Variável para operar o movimento do laser da nave do jogador/inimigo
    let deslocamento = -1;
    let div = elemento('div','laser');
    Ovni.call(this, div);

    //condição que muda o deslocamento do laser se for inimigo
    if(inimigo){
        div.classList.add('inimigo');
        deslocamento = 1;
    }

    //Função que movimenta o laser de acordo com as respectivas variáveis
    this.animation = () => {
        this.setXY(this.x(), this.y()+velocMovimento*aceleracao_laser*deslocamento);
    };

    //Função que removerá a div/laser criado sempre que chamada
    // this.remove = () => div.remove();
}

//Função que gerencia os lasers, ou seja, remove chamando o método remover e cria a animação de acordo com os arrats
function gerenciarLasers(lasers){
    lasers.forEach((item, index, lista) => {
        item.animation();
        if(item.y()>game.h()+10 || item.y()+item.h()+10<0){
            item.remove();
            lista.splice(index, 1);
        }
    });
}

//Funão que gerencia todas as colisões
function gerenciarColisoes(){
    let colisao = function(obj1, obj2){
        //Recebe valor boleando no calculo da colisão dos objetos
        let x = obj1.x() <= obj2.x() + obj2.w() && obj1.x() + obj1.w() >= obj2.x();
        let y = obj1.y() <= obj2.y() + obj2.h() && obj1.y() + obj1.h() >= obj2.y();
        //Se for verdadeiro, chama função colisão para cada objeto
        if(x && y){
            obj1.colisao();
            obj2.colisao();
            return true;
        }
        return false;
    }

    inimigos.forEach((inimigo, ii, inimigos)=>{
        laser_jogador.forEach((laser,il, lasers)=>{
            if(colisao(inimigo,laser)){
                lasers.splice(il,1);
            }
        });

        //Chama o função colisão() que verifica a colisão, retornando true ou false sempre que houver ou não a colisão de algum
        colisao(nave,inimigo);
    })
    
    laser_inimigo.forEach((laser)=>{
        colisao(nave,laser);
    })
}
