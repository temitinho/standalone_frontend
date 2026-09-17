document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.querySelector('.close-btn');

    let allPaintings = []; // Local reference to the global data

    function applyTheme() {
        if (typeof themeConfig !== 'undefined' && themeConfig) {
            if (themeConfig.accent_color) document.documentElement.style.setProperty('--accent-color', themeConfig.accent_color);
            if (themeConfig.text_primary) document.documentElement.style.setProperty('--text-primary', themeConfig.text_primary);
            if (themeConfig.text_secondary) document.documentElement.style.setProperty('--text-secondary', themeConfig.text_secondary);
            if (themeConfig.bg_color) document.documentElement.style.setProperty('--bg-color', themeConfig.bg_color);
            if (themeConfig.title_font_size) document.documentElement.style.setProperty('--title-font-size', themeConfig.title_font_size);
            if (themeConfig.price_font_size) document.documentElement.style.setProperty('--price-font-size', themeConfig.price_font_size);
            if (themeConfig.base_font_size) document.documentElement.style.setProperty('--base-font-size', themeConfig.base_font_size);
        }
    }

    applyTheme();

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
            
            const customColor = (painting.Preco_Cor && painting.Preco_Cor.trim()) ? `color: ${painting.Preco_Cor};` : 'color: var(--accent-color);';
            const customSize = (painting.Preco_Tamanho && painting.Preco_Tamanho.trim()) ? `font-size: ${painting.Preco_Tamanho};` : 'font-size: var(--price-font-size, 1.1rem);';

            let priceSectionHTML = `<p class="card-price" style="font-weight: 600; margin-bottom: 5px; ${customColor} ${customSize}">${painting.Preço}</p>`;

            card.innerHTML = `
                <div class="img-container">
                    <img src="./${painting.Imagen_Local.replace(/\\\\/g, '/')}" alt="Quadro ${painting.ID_Quadro}" loading="lazy">
                    <div class="category-badge">${painting.Categoria}</div>
                </div>
                <div class="card-content">
                    <h3>ID: ${painting.ID_Quadro}</h3>
                    ${priceSectionHTML}
                    <p class="card-size"><strong>Tamanho:</strong> ${painting.Tamanho || 'N/A'}</p>
                    <p class="card-material" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 3px;"><strong>Técnica:</strong> ${painting.Material || 'N/A'}</p>
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
        
        const modalPrice = document.getElementById('modal-price');
        modalPrice.innerText = painting.Preço;
        modalPrice.style.color = (painting.Preco_Cor && painting.Preco_Cor.trim()) ? painting.Preco_Cor : 'var(--accent-color)';
        if (painting.Preco_Tamanho && painting.Preco_Tamanho.trim()) {
            modalPrice.style.fontSize = painting.Preco_Tamanho;
        } else {
            modalPrice.style.fontSize = '';
        }
        
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
