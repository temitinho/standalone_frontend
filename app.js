document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.querySelector('.close-btn');

    let allPaintings = []; // Local reference to the global data

    // Carregar dados consolidado do arquivo JSON local (estático)
    function initGallery() {
        if (typeof paintingsData !== 'undefined' && paintingsData.length > 0) {
            allPaintings = paintingsData; 
            renderGallery(allPaintings);
            
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) activeBtn.click();
        } else {
            console.error('paintingsData não definido ou vazio.');
            galleryGrid.innerHTML = '<p class="error">Erro ao carregar a galeria: Dados não encontrados.</p>';
        }
    }

    initGallery();

    // Função para renderizar os cards na galeria
    function renderGallery(items) {
        galleryGrid.innerHTML = '';
        
        if (items.length === 0) {
            galleryGrid.innerHTML = '<p class="no-results">Nenhum quadro encontrado nesta categoria.</p>';
            return;
        }

        items.forEach(painting => {
            const card = document.createElement('div');
            card.className = 'painting-card';
            
            const priceSectionHTML = `<p class="card-price">${painting.Preço}</p>`;

            card.innerHTML = `
                <div class="img-container">
                    <img src="./${painting.Imagen_Local.replace(/\\\\/g, '/')}" alt="Quadro ${painting.ID_Quadro}" loading="lazy">
                    <div class="category-badge">${painting.Categoria}</div>
                </div>
                <div class="card-content">
                    <h3>ID: ${painting.ID_Quadro}</h3>
                    ${priceSectionHTML}
                    <p class="card-size">${painting.Tamanho}</p>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openModal(painting);
            });
            galleryGrid.appendChild(card);
        });
    }

    // Filtros de Categoria (Todos, A, B, C)
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            if (category === 'all') {
                renderGallery(allPaintings);
            } else {
                const filtered = allPaintings.filter(p => p.Categoria === category);
                renderGallery(filtered);
            }
        });
    });

    // Lógica para Abrir e Preencher o Modal
    function openModal(painting) {
        document.getElementById('modal-title').innerText = `ID: ${painting.ID_Quadro}`;
        document.getElementById('modal-size').innerText = painting.Tamanho || 'N/A';
        document.getElementById('modal-material').innerText = painting.Material || 'N/A';
        document.getElementById('modal-price').innerText = painting.Preço;
        
        // Exibir a imagem local (mesmo para o modal, para garantir estabilidade)
        document.getElementById('modal-image').src = "./" + painting.Imagen_Local.replace(/\\\\/g, '/');
        document.getElementById('modal-link').href = painting.URL;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    // Lógica para Fechar o Modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { e.target === modal && closeModal(); });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
