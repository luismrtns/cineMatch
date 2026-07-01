import {TMDB_CONFIG} from './config.js'

const form = document.getElementById('searchForm')
const input = document.getElementById('searchInput')
const containerFilmes = document.getElementById('containerFilmes')
const btnCarregar = document.getElementById('btnCarregarMais')
const containerCarregar = document.getElementById('containerCarregarMais')
let paginaAtual = 1
let modoAtual = 'tendencias';
let pesquisaAtual = '';
const btnBuscar = document.getElementById('btnBuscar')
const telaBuscar = document.getElementById('telaBusca')
const telaRoleta = document.getElementById('telaRoleta')
const btnRoleta = document.getElementById('btnRoleta')
const btnQuiz = document.getElementById('btnQuiz')


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
const tituloSecao = document.getElementById('tituloSecao')

let listagem = []

// Função para mudar o título com uma animação suave
function mudarTituloAnimado(novoTexto) {
    tituloSecao.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => {
        tituloSecao.textContent = novoTexto;
        tituloSecao.classList.remove('opacity-0', '-translate-y-2');
    }, 200); 
}

document.addEventListener('DOMContentLoaded', () => {
    buscarTendencias()
})

async function buscarTendencias(pagina = 1) {
    if(pagina === 1) mudarTituloAnimado('Em alta')
    const url = `${TMDB_CONFIG.BASE_URL}/trending/all/week?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${pagina}`
    try{
        const resposta = await fetch(url)
        const dados = await resposta.json()

        const listagemNova = dados.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        console.log('titulos em alta carregados: ',listagem )
        modoAtual = 'tendencias'
        paginaAtual = pagina

        if(pagina === 1){
            listagem = listagemNova
        }else{
            listagem = listagem.concat(listagemNova)
        }

        let filmesParaDesenhar = listagemNova
        if(filtroAtivo === 'movie') filmesParaDesenhar = filmesParaDesenhar.filter(obra => obra.media_type === 'movie')
        if(filtroAtivo === 'tv') filmesParaDesenhar = filmesParaDesenhar.filter(obra => obra.media_type === 'tv')

        renderizarFilmes(filmesParaDesenhar, pagina === 1)

        if(dados.total_pages > pagina){
            containerCarregar.classList.remove('hidden');
        }else{
            containerCarregar.classList.add('hidden');
        }
    }catch(error){
        console.log("Erro ao buscar tendências: ", error)
    }
}

function renderizarFilmes(filmes, limpar = true){
    if(limpar){
        containerFilmes.innerHTML = ''
    }

    filmes.forEach((obra, index) => {
        const tipoObra = obra.media_type === 'movie'
        const titulo = tipoObra ? obra.title : obra.name
        const data = tipoObra ? obra.release_date : obra.first_air_date
        const ano = data ? data.split('-')[0] : '[N/A]'
        const nota = obra.vote_average ? obra.vote_average.toFixed(1) : '0.0'
        const tagTipo = tipoObra ? 'filme' : 'série'

        let badgeLancamento = ''
        if(data){
            const dataLancamento = new Date(data)
            const dataHoje = new Date()

            const diferencaTempo = dataHoje.getTime() - dataLancamento.getTime();
            const diferencaDias = Math.floor(diferencaTempo / (1000 * 3600 * 24))
            if(diferencaDias < 0){
                badgeLancamento = `<span class="bg-dourado text-dark-azul text-[9px] sm:text-xs font-bold font-mono uppercase shadow-lg px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg animate-pulse text-center">Em Breve</span>`;
            }else if(diferencaDias >= 0 && diferencaDias <= 30){
                badgeLancamento = `<span class="bg-branco text-dark-azul text-[9px] sm:text-xs font-bold font-mono uppercase shadow-lg px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-center">Novo</span>`;
            }
        }

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
              <!-- Grupo de Etiquetas do Topo -->
              <div class="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
                
                <!-- Etiquetas da Esquerda: Empilhadas no celular (flex-col) e lado a lado no PC (sm:flex-row) -->
                <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <span class="bg-salmao text-dark-azul text-[9px] sm:text-xs font-bold font-mono uppercase shadow-lg px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-center">
                    ${tagTipo}
                  </span>
                  ${badgeLancamento}
                </div>
                
                <!-- Etiqueta de Nota (Direita) -->
                <span class="flex gap-1 items-center text-[10px] sm:text-xs bg-dark-azul/80 backdrop-blur px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg font-semibold text-dourado shadow-lg border border-dourado/20"> 
                  <img src="img/star-duotone.svg" class="w-2.5 h-2.5 sm:w-3 sm:h-3" alt="">
                  ${nota}
                </span>

              </div>

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

        card.addEventListener('click', ()=> {
            const mediaType = obra.media_type || (tipoObra ? 'movie' : 'tv')
            initModalDetalhes(obra.id, mediaType)
        })
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

async function buscarPesquisa(texto, pagina = 1) {
    if (pagina === 1) mudarTituloAnimado(`Resultados para "${texto}"`);

    const url = `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&query=${encodeURIComponent(texto)}&page=${pagina}`;

    try {
        const resposta = await fetch(url)
        const dados = await resposta.json()

        const resultadosNovos = dados.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv')

        // Atualizando a memória
        modoAtual = 'pesquisa';
       pesquisaAtual = texto;
        paginaAtual = pagina;

        if (pagina === 1) {
            listagem = resultadosNovos;
        } else {
            listagem = listagem.concat(resultadosNovos);
        }

        let filmesParaDesenhar = resultadosNovos;
        if (filtroAtivo === 'movie') filmesParaDesenhar = filmesParaDesenhar.filter(obra => obra.media_type === 'movie');
        if (filtroAtivo === 'tv') filmesParaDesenhar = filmesParaDesenhar.filter(obra => obra.media_type === 'tv');

        renderizarFilmes(filmesParaDesenhar, pagina === 1);

        // Lógica do botão Carregar Mais
        if (dados.total_pages > pagina) {
            containerCarregarMais.classList.remove('hidden');
        } else {
            containerCarregarMais.classList.add('hidden');
        }
    } catch (error) {
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
            filtroAtivo = 'todos'
            filtrarLista('todos');
            ativarBotao(filtroTodos);
        });

        filtroFilme.addEventListener('click', () => {
            filtroAtivo = 'movie'
            filtrarLista('movie');
            ativarBotao(filtroFilme);
        });

        filtroSerie.addEventListener('click', () => {
            filtroAtivo = 'tv'
            filtrarLista('tv');
            ativarBotao(filtroSerie);
        });

        ativarBotao(filtroTodos);
    }
}

initFiltro()

async function initModalDetalhes(id, mediaType){
    const modalDetalhes = document.getElementById('modalDetalhes')
    const modalContainer = document.getElementById('modalContainer');
    const fecharModalBtn = document.getElementById('fecharModal');
    const modalLoading = document.getElementById('modalLoading');
    const modalConteudo = document.getElementById('modalConteudo');
    const modalPoster = document.getElementById('modalPoster');
    const modalBackdropMobile = document.getElementById('modalBackdropMobile');
    const modalTagTipo = document.getElementById('modalTagTipo');
    const modalBadgeLancamento = document.getElementById('modalBadgeLancamento');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalTagline = document.getElementById('modalTagline');
    const modalAnoTexto = document.getElementById('modalAnoTexto');
    const modalNota = document.getElementById('modalNota');
    const modalClassificacao = document.getElementById('modalClassificacao');
    const modalDuracaoTexto = document.getElementById('modalDuracaoTexto');
    const modalIdiomasTexto = document.getElementById('modalIdiomasTexto');
    const modalGeneros = document.getElementById('modalGeneros');
    const modalSinopse = document.getElementById('modalSinopse');
    const modalProvedores = document.getElementById('modalProvedores');

    modalDetalhes.classList.remove('hidden')
    modalDetalhes.classList.add('flex')

    setTimeout(()=> {
        modalContainer.classList.remove('scale-95', 'opacity-0');
        modalContainer.classList.add('scale-100', 'opacity-100');
    },10)

    modalLoading.classList.remove('hidden');
    modalLoading.classList.add('flex');
    modalConteudo.classList.remove('flex');
    modalConteudo.classList.add('hidden');

    const urlDetalhes = `${TMDB_CONFIG.BASE_URL}/${mediaType}/${id}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&append_to_response=videos,release_dates,content_ratings`;
    const urlProvedores = `${TMDB_CONFIG.BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_CONFIG.API_KEY}`;

    try{
        const [respostaDetalhes, respostaProvedor] = await Promise.all([
            fetch(urlDetalhes),
            fetch(urlProvedores)
        ]);
        if (!respostaDetalhes.ok) throw new Error('Não foi possível obter os detalhes do filme.');

        const detalhes = await respostaDetalhes.json();
        const provedores = await respostaProvedor.json()

        const posterUrl = detalhes.poster_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${detalhes.poster_path}`
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop';

        const backdropUrl = detalhes.backdrop_path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${detalhes.backdrop_path}`
            : '';

        modalPoster.src = posterUrl
        modalPoster.alt =  `Poster de ${detalhes.title || detalhes.name}`

        if(backdropUrl){
            modalBackdropMobile.style.backgroundImage = `url(${backdropUrl})`
            modalBackdropMobile.classList.remove('hidden')
        }else{
            modalBackdropMobile.style.backgroundImage = 'none';
            modalBackdropMobile.classList.add('hidden');
        }

        const isFilme = mediaType === 'movie';
        modalTagTipo.textContent = isFilme ? 'FILME' : 'SÉRIE'
        modalTagTipo.className = isFilme ? "bg-salmao text-dark-azul text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block"
            : "bg-dourado text-dark-azul text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block";

        modalTitulo.textContent = detalhes.title || detalhes.name
        modalTagline.textContent = detalhes.tagline ? `${detalhes.tagline}` : ''

        const dataLancamento = isFilme ? detalhes.release_date : detalhes.first_air_date
        const anoLancamento = dataLancamento ? dataLancamento.split('-')[0] : 'N/A';
        modalAnoTexto.textContent = anoLancamento;

        modalBadgeLancamento.className = "hidden text-dark-azul text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded inline-block";
        modalBadgeLancamento.textContent = ''

        if(dataLancamento){
            const dataFilme = new Date(dataLancamento)
            const dataHoje = new Date()
            const diasDiferenca = Math.floor((dataHoje.getTime() - dataFilme.getTime()) / (1000 * 3600 * 24))

            if(diasDiferenca < 0){ // futuro
                modalBadgeLancamento.textContent = 'Em breve'
                modalBadgeLancamento.classList.remove('hidden')
                modalBadgeLancamento.classList.add('bg-dourado', 'animate-pulse');
            }else if(diasDiferenca >=0 && diasDiferenca <= 30){ // tiver até 30 dias de lançamento
                modalBadgeLancamento.textContent = 'Novo'
                modalBadgeLancamento.classList.remove('hidden')
                modalBadgeLancamento.classList.add('bg-branco')
            }
        }

        modalNota.textContent = detalhes.vote_average ? detalhes.vote_average.toFixed(1) : '0.0';

        // Lógica da Classificação Indicativa
        let classificacao = 'L'
        if(isFilme && detalhes.release_dates){
            const dadosBr = detalhes.release_dates.results.find(dado => dado.iso_3166_1 === 'BR')
            if(dadosBr){
                const certificacao = dadosBr.release_dates.find(dado => dado.certification)
                if(certificacao) classificacao = certificacao.certification
            }
        }else if(!isFilme && detalhes.content_ratings){
            const dadosBr = detalhes.content_ratings.results.find(dado => dado.iso_3166_1 === 'BR')
            if(dadosBr && dadosBr.rating){
                classificacao = dadosBr.rating
            }
        }

        let corFundo = 'bg-[#00a54f] text-branco'; 
        if (classificacao === '10') corFundo = 'bg-[#0093d5] text-branco'; 
        else if (classificacao === '12') corFundo = 'bg-[#f4cb00] text-dark-azul'; 
        else if (classificacao === '14') corFundo = 'bg-[#e47622] text-branco'; 
        else if (classificacao === '16') corFundo = 'bg-[#d81920] text-branco'; 
        else if (classificacao === '18') corFundo = 'bg-[#1d1815] text-branco border border-branco/20'; 
        else if (classificacao !== 'L') corFundo = 'bg-branco/20 text-branco w-auto px-1';

        modalClassificacao.className = `w-5 h-5 flex items-center justify-center rounded-[3px] font-bold text-[11px] leading-none shadow-md ${corFundo}`
        modalClassificacao.textContent = classificacao

        if(isFilme && detalhes.runtime){
            const horas = Math.floor(detalhes.runtime / 60);
            const minutos = detalhes.runtime % 60;
            modalDuracaoTexto.textContent = horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`
            document.getElementById('modalDuracao').classList.remove('hidden')
        }else if(!isFilme && detalhes.number_of_seasons){
            modalDuracaoTexto.textContent = `${detalhes.number_of_seasons} Temp.`;
            document.getElementById('modalDuracao').classList.remove('hidden');
        }else{
            document.getElementById('modalDuracao').classList.add('hidden');
        }

        const idiomas = (detalhes.spoken_languages || []).map(l => l.name || l.english_name).filter(n => n).slice(0,3).join(', ');
        modalIdiomasTexto.textContent = idiomas || 'N/A'

        modalGeneros.innerHTML = (detalhes.genres || []).map(genre => `
            <span class="bg-branco/5 text-dourado px-2.5 py-1 rounded text-xs uppercase font-bold tracking-wider border border-dourado/10">
                ${genre.name}
            </span>
        `).join('')

        modalSinopse.textContent = detalhes.overview || 'Sinopse não disponível em português.'
        modalTrailerBtn.classList.add('hidden')
        modalTrailerBtn.href = '#'

        if(detalhes.videos && detalhes.videos.results){
            const trailer = detalhes.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube')
            if(trailer){
                modalTrailerBtn.href = `https://www.youtube.com/watch?v=${trailer.key}`;
                modalTrailerBtn.classList.remove('hidden')
            }
        }

        const provedoresBR = provedores.results ? provedores.results.BR : null
        modalProvedores.innerHTML = ''

        if(provedoresBR && provedoresBR.flatrate && provedoresBR.flatrate.length > 0){
            provedoresBR.flatrate.forEach((provedor) => {
                const logoProvedor = `${TMDB_CONFIG.IMAGE_BASE_URL.replace('w500', 'w92')}${provedor.logo_path}`;
                const div = document.createElement('div')
                div.className = "flex flex-col items-center gap-1 group/provider relative cursor-default";
                div.innerHTML =
                   ` <img src="${logoProvedor}" alt="${provedor.provider_name}" class="w-10 h-10 rounded-xl border border-branco/10 shadow-md transition-all duration-200 group-hover/provider:scale-105 group-hover/provider:border-dourado/30" title="${provedor.provider_name}">
                    <span class="text-[9px] text-branco/60 font-mono text-center max-w-15 truncate">${provedor.provider_name}</span>`;
                modalProvedores.appendChild(div);
            })
        }else if(provedoresBR && (provedoresBR.buy || provedoresBR.rent)){
            const opcoes = provedoresBR.buy || provedoresBR.rent
            const vistos = new Set()
            const unicos = []

            opcoes.forEach(opcao => {
                if(!vistos.has(opcao.provider_id)){
                    vistos.add(opcao.provider_id)
                    unicos.push(opcao)
                }
            })

            unicos.slice(0,4).forEach(provedor => {
                const logoUrl = `${TMDB_CONFIG.IMAGE_BASE_URL.replace('w500', 'w92')}${provedor.logo_path}`;
                const div = document.createElement('div')
                div.className = "flex flex-col items-center gap-1 group/provider relative cursor-default opacity-85 hover:opacity-100 transition-opacity"
                div.innerHTML = `
                    <img src="${logoUrl}" alt="${provedor.provider_name}" class="w-10 h-10 rounded-xl border border-branco/10 shadow-md transition-all duration-200 group-hover/provider:scale-105" title="${provedor.provider_name} (Aluguel)">
                    <span class="text-[9px] text-branco/60 font-mono text-center max-w-15 truncate">${provedor.provider_name} (Aluguel)</span>
                `;
                modalProvedores.appendChild(div);
            })
        }else{
            modalProvedores.innerHTML = `<span class="text-sm text-branco/40 italic">Não disponível em streaming no Brasil.</span>`;
        }

        modalLoading.classList.add('hidden');
        modalLoading.classList.remove('flex');
        modalConteudo.classList.add('flex');
        modalConteudo.classList.remove('hidden');
    }catch (error){
        console.log(error)
        modalLoading.classList.add('hidden');
        modalLoading.classList.remove('flex');

        modalConteudo.innerHTML = `
            <div class="text-center py-10 flex flex-col gap-4 items-center">
                <span class="text-salmao font-bold text-lg font-mono">Ops! Ocorreu um erro ao carregar os detalhes.</span>
                <button id="erroFecharModal" class="bg-branco/10 border border-branco/20 px-4 py-2 rounded-full font-mono text-sm hover:bg-salmao hover:text-dark-azul transition-all">Fechar Modal</button>
            </div>
        `;
        modalConteudo.classList.remove('hidden');
        modalConteudo.classList.add('flex');

        document.getElementById('erroFecharModal').addEventListener('click', fecharModal)
    }
}

function fecharModal(){
    const modalContainer = document.getElementById('modalContainer')
    modalContainer.classList.remove('scale-100', 'opacity-100')
    modalContainer.classList.add('scale-95', 'opacity-0')

    setTimeout(()=>{
        modalDetalhes.classList.add('hidden')
        modalDetalhes.classList.remove('flex')
    },300)
}
const fecharModalBtn = document.getElementById('fecharModal');
fecharModalBtn.addEventListener('click', fecharModal);

const modalDetalhes = document.getElementById('modalDetalhes')
modalDetalhes.addEventListener('click', (event) => {
    if(event.target === modalDetalhes){
        fecharModal()
    }
});

document.addEventListener('keydown', (event) => {
    if(event.key === 'Escape' && !modalDetalhes.classList.contains('hidden')){
        fecharModal()
    }
})

const modalTrailerBtn = document.getElementById('modalTrailerBtn');
btnCarregar.addEventListener('click', () => {
    const proxPagina = paginaAtual + 1

    if(modoAtual === 'tendencias'){
        buscarTendencias(proxPagina)
    }else if(modoAtual === 'pesquisa'){
        buscarPesquisa(pesquisaAtual, proxPagina)
    }
})

function trocarTela(tela){
    if(tela === 'busca'){
        telaBuscar.classList.remove('hidden')
        telaBuscar.classList.add('animate-aparecer')
        telaRoleta.classList.add('hidden')
        telaRoleta.classList.remove('animate-aparecer')
    }else if(tela === 'roleta'){
        telaRoleta.classList.remove('hidden')
        telaRoleta.classList.add('animate-aparecer')
        telaBuscar.classList.add('hidden')
        telaBuscar.classList.remove('animate-aparecer')

        abrirRoleta()
    }
}

btnBuscar.addEventListener('click', () => trocarTela('busca'))
btnRoleta.addEventListener('click', () => trocarTela('roleta'))

const roletaPista = document.getElementById('roletaPista')
const btnGirarRoleta = document.getElementById('btnGirarRoleta')

let filmesRoleta = []
async function abrirRoleta(){
    if(filmesRoleta.length > 0) return

    const paginaAleatoria = Math.floor(Math.random() * 5) + 1
    const url = `${TMDB_CONFIG.BASE_URL}/discover/movie?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&watch_region=BR&with_watch_monetization_types=flatrate&page=${paginaAleatoria}`;
    try{
        const resposta = await fetch(url)
        const dados = await resposta.json()

        filmesRoleta = dados.results.filter(filme => filme.poster_path)

        renderizarFilmesRoleta(filmesRoleta)
    } catch(error) {
        console.log("Erro ao buscar filmes da roleta: ", error);
    }
}

function renderizarFilmesRoleta(filmes){
    roletaPista.innerHTML = ""

    roletaPista.style.transition = 'none'
    roletaPista.style.transform = 'translateX(0)'

    const filmesDuplicados = [...filmes, ...filmes, ...filmes, ...filmes]

    filmesDuplicados.forEach(filme => {
        const posterUrl = `${TMDB_CONFIG.IMAGE_BASE_URL}${filme.poster_path}`

        const img = document.createElement('img')
        img.src = posterUrl

        img.className = "h-full w-auto object-cover rounded-md border border-branco/10 shadow-md shrink-0"
        img.alt = filme.title

        roletaPista.appendChild(img)
    })

    setTimeout(() => {
        roletaPista.style.transition = 'transform 5000ms cubic-bezier(0.15,1,0.3,1)'
    }, 50)
}

btnGirarRoleta.addEventListener('click', () =>{
    btnGirarRoleta.disabled = true
    btnGirarRoleta.classList.add('opacity-50', 'cursor-not-allowed')

    const filmeSorteado = Math.floor(Math.random() * 35) + 40

    const posterVencedor = roletaPista.children[filmeSorteado] // pega a img de dentro do roletaPista

    const visorRoleta = roletaPista.parentElement
    const centroRoleta = visorRoleta.clientWidth / 2
    const centroPoster = posterVencedor.clientWidth / 2
    const posicaoEsquerdaPoster = posterVencedor.offsetLeft

    const deslizeX = -(posicaoEsquerdaPoster) + centroRoleta - centroPoster

    roletaPista.style.transform = `translateX(${deslizeX}px)`

    setTimeout(() =>{
        const filmeApi = filmesRoleta[filmeSorteado % filmesRoleta.length]

        initModalDetalhes(filmeApi.id, 'movie')

        btnGirarRoleta.disabled = false
        btnGirarRoleta.classList.remove('opacity-50', 'cursor-not-allowed')

        renderizarFilmesRoleta(filmesRoleta)
    }, 5500)
})