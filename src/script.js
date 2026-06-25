import {TMDB_CONFIG} from './config.js'

const form = document.getElementById('searchForm')
const input = document.getElementById('searchInput')
const containerFilmes = document.getElementById('containerFilmes')

// Dicionário para traduzir os IDs numéricos que a API devolve para os nomes reais
const GENEROS_TMDB = {
    28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime", 99: "Doc.",
    18: "Drama", 10751: "Família", 14: "Fantasia", 36: "História", 27: "Terror", 10402: "Música",
    9648: "Mistério", 10749: "Romance", 878: "Ficção Ci.", 10770: "Cinema TV",
    53: "Thriller", 10752: "Guerra", 37: "Faroeste",
    10759: "Ação & Av.", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi", 10766: "Soap", 10767: "Talk", 10768: "War & Pol"
};

const filtroTodos = document.getElementById('todos')
const filtroFilme = document.getElementById('filmes')
const filtroSerie = document.getElementById('series')

let listagem = []

document.addEventListener('DOMContentLoaded', () => {
    buscarTendencias()
})

async function buscarTendencias() {
    const url = `${TMDB_CONFIG.BASE_URL}/trending/all/week?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`
    try{
        const resposta = await fetch(url)
        const dados = await resposta.json()

        listagem = dados.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        console.log('titulos em alta carregados: ',listagem )

        renderizarFilmes(listagem)
    }catch(error){
        console.log("Erro ao buscar tendências: ", error)
    }
}

function renderizarFilmes(filmes){
    containerFilmes.innerHTML = ''

    filmes.forEach((obra, index) => {
        const tipoObra = obra.media_type === 'movie'
        const titulo = tipoObra ? obra.title : obra.name
        const data = tipoObra ? obra.release_date : obra.first_air_date
        const ano = data ? data.split('-')[0] : '[N/A]'
        const nota = obra.vote_average ? obra.vote_average.toFixed(1) : '0.0'
        const tagTipo = tipoObra ? 'filme' : 'série'

        const poster = obra.poster_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${obra.poster_path}`
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop';

        // Pega até 2 gêneros, mas no celular esconde o segundo para não estourar a linha
        const nomesGeneros = (obra.genre_ids || [])
            .map(id => GENEROS_TMDB[id])
            .filter(nome => nome)
            .slice(0, 2);
            
        // Se for o segundo gênero (i === 1), adiciona 'hidden sm:inline-block' para sumir no celular
        const htmlGeneros = nomesGeneros.map((gen, i) => `<span class="bg-branco/5 text-dourado px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border border-dourado/10 ${i === 1 ? 'hidden sm:inline-block' : 'inline-block'}">${gen}</span>`).join('');


        const card = document.createElement('div')
        card.className = "animate-aparecer opacity-0 relative aspect-2/3 cursor-pointer bg-dark-azul text-branco border border-branco/20 overflow-hidden rounded-lg flex flex-col gap-4 shadow-lg";
        card.style.animationDelay = `${index * 50}ms`;
        card.innerHTML = `
              <!-- Etiqueta Filme/Série -->
              <span class="absolute top-2 left-2 bg-salmao text-dark-azul text-xs font-bold font-mono uppercase shadow-lg px-2 py-1 rounded-lg z-10">
                ${tagTipo}
              </span>
              
              <!-- Etiqueta de Nota (Movi para o topo direito para liberar espaço no título) -->
              <span class="absolute top-2 right-2 flex gap-1 items-center text-xs bg-dark-azul/80 backdrop-blur px-2 py-1 rounded-lg font-semibold text-dourado z-10 shadow-lg border border-dourado/20"> 
                <img src="img/star-duotone.svg" class="w-3 h-3" alt="">
                ${nota}
              </span>

              <img class="w-full h-full object-cover hover:scale-[1.1] transition-transform duration-300" src="${poster}" alt="Poster de ${titulo}">
              
              <!-- Dados do Card -->
              <div class="absolute z-10 bottom-0 w-full px-3 py-3 sm:px-4 sm:py-4 bg-branco/5 backdrop-blur-md border-t-2 border-branco/10">
                <!-- Título agora tem 100% da largura -->
                <h2 class="truncate font-inter text-sm sm:text-lg md:text-xl text-branco font-semibold w-full" title="${titulo}">
                  <img src="img/ticket-duotone.svg" class="w-4 h-4 sm:w-5 sm:h-5 inline-block align-text-bottom mr-1" alt="">${titulo}
                </h2>
                
                <div class="mt-1 flex items-center justify-between">
                  <span class="text-[10px] sm:text-xs text-branco/60 font-mono shrink-0">${ano}</span>
                  <div class="flex gap-1 justify-end">
                    ${htmlGeneros}
                  </div>
                </div>
              </div>
            `;

        containerFilmes.appendChild(card)
    })
}

form.addEventListener('submit', (event) => {
    event.preventDefault()
})

let timerPesquisa

input.addEventListener('input', () => {
    clearTimeout(timerPesquisa)

    timerPesquisa = setTimeout(() => {
        const textoDigitado = input.value.trim()
        if(textoDigitado !== ''){
            buscarPesquisa(textoDigitado)
        }else{
            buscarTendencias()
        }
    }, 300)
})

async function buscarPesquisa(texto){
    const url = `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&query=${encodeURIComponent(texto)}`;

    try{
        const resposta = await fetch(url)
        const dados = await resposta.json()

        listagem = dados.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        renderizarFilmes(listagem)
    }catch (error){
        console.log(error)
    }
}

let filtroAtivo = 'todos'

function initFiltro(){
    const estiloAtivo = ['bg-salmao', 'text-dark-azul'];
    const estiloInativo = ['bg-transparent', 'text-salmao', 'border-branco/10' , 'bg-branco/5'];

    function limparCoresBotoes() {
        filtroTodos.classList.remove(...estiloAtivo);
        filtroFilme.classList.remove(...estiloAtivo);
        filtroSerie.classList.remove(...estiloAtivo);

        filtroTodos.classList.add(...estiloInativo);
        filtroFilme.classList.add(...estiloInativo);
        filtroSerie.classList.add(...estiloInativo);
    }

    function ativarBotao(btnClicado) {
        limparCoresBotoes();

        btnClicado.classList.remove(...estiloInativo);
        btnClicado.classList.add(...estiloAtivo);
    }

    function filtrarLista(tipo){
        const listaFiltrada = tipo === 'todos' ? listagem : listagem.filter(item => item.media_type === tipo)
        if(listaFiltrada.length === 0){
            containerFilmes.innerHTML = '<div class="col-span-full text-center text-branco/50 py-10 font-mono">Nenhum resultado encontrado nesta categoria.</div>';
            return;
        }
        renderizarFilmes(listaFiltrada);
    }

    if (filtroTodos && filtroFilme && filtroSerie) {
        filtroTodos.addEventListener('click', () => {
            filtrarLista('todos');
            ativarBotao(filtroTodos);
        });

        filtroFilme.addEventListener('click', () => {
            filtrarLista('movie');
            ativarBotao(filtroFilme);
        });

        filtroSerie.addEventListener('click', () => {
            filtrarLista('tv');
            ativarBotao(filtroSerie);
        });

        ativarBotao(filtroTodos);
    }
}

initFiltro()

