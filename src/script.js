import {TMDB_CONFIG} from './config.js'

const form = document.getElementById('searchForm')
const input = document.getElementById('searchInput')
const containerFilmes = document.getElementById('containerFilmes')

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

    filmes.forEach(obra => {
        const tipoObra = obra.media_type === 'movie'
        const titulo = tipoObra ? obra.title : obra.name
        const data = tipoObra ? obra.release_date : obra.first_air_date
        const ano = data ? data.split('-')[0] : '[N/A]'
        const nota = obra.vote_average ? obra.vote_average.toFixed(1) : '0.0'
        const tagTipo = tipoObra ? 'filme' : 'série'

        const poster = obra.poster_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${obra.poster_path}`
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop';

        const card = document.createElement('div')
        card.className = "relative aspect-2/3 hover:scale-[1.02] transition-transform duration-300 cursor-pointer bg-dark-azul text-branco border border-branco/20 overflow-hidden rounded-lg flex flex-col gap-4";

        card.innerHTML = `
              <span class="absolute top-2 left-2 bg-salmao text-dark-azul text-xs font-bold font-mono uppercase shadow-lg px-2 py-1 rounded-lg z-10">
                ${tagTipo}
              </span>
              <img class="w-full h-96 object-cover" src="${poster}" alt="Poster de ${titulo}">
              
              <!-- Dados do Card -->
              <div class="absolute z-10 bottom-0 w-full px-4 py-2 bg-branco/5 backdrop-blur border-t-2 border-branco/10">
                <div class="flex gap-4 items-center justify-between">
                  <h2 class="truncate flex items-center gap-1 font-inter text-xl text-branco font-semibold w-3/4" title="${titulo}">
                    <img src="img/ticket-duotone.svg" class="w-5 h-5 inline" alt="">
                    ${titulo}
                  </h2>
                  <span class="flex gap-1 items-center text-sm bg-dark-azul/70 px-2 py-1 rounded-lg font-semibold text-dourado"> 
                    <img src="img/star-duotone.svg" class="w-4 h-4" alt="">
                    ${nota}
                  </span>
                </div>
                <div class="mt-1 flex gap-2 items-center text-xs text-branco/60 font-mono">
                  <span>${ano}</span>
                  <span>|</span>
                  <span class="capitalize">${tipoObra ? 'Filme' : 'Série'}</span>
                </div>
              </div>
            `;

        containerFilmes.appendChild(card)
    })
}

