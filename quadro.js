document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get('id');
    const activeCategory = params.get('cat') || 'all';

    const loader = document.getElementById('painting-loader');
    const showcase = document.getElementById('painting-showcase');
    const backBtn = document.getElementById('back-to-gallery-btn');
    const prevBtn = document.getElementById('prev-painting-btn');
    const nextBtn = document.getElementById('next-painting-btn');

    const imgWrapper = document.getElementById('painting-image-wrapper');
    const paintingImage = document.getElementById('painting-image');
    const openLightboxBtn = document.getElementById('open-lightbox-btn');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    let currentPainting = null;
    let prevUrl = null;
    let nextUrl = null;

    if (activeCategory && activeCategory !== 'all') {
        backBtn.href = `index.html?cat=${encodeURIComponent(activeCategory)}`;
    } else {
        backBtn.href = 'index.html';
    }

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

    function buildQuadroUrl(id) {
        const catParam = (activeCategory && activeCategory !== 'all') ? `&cat=${encodeURIComponent(activeCategory)}` : '';
        return `quadro.html?id=${encodeURIComponent(id)}${catParam}`;
    }

    function initPaintingPage() {
        if (!currentId) {
            loader.innerHTML = 'Obra não especificada. <a href="index.html" style="color: var(--accent-color);">Voltar para a galeria</a>.';
            return;
        }

        if (typeof paintingsData === 'undefined' || !Array.isArray(paintingsData)) {
            loader.innerHTML = 'Erro ao carregar os dados da galeria.';
            return;
        }

        const painting = paintingsData.find(
            p => String(p.ID_Quadro).toLowerCase() === String(currentId).toLowerCase()
        );

        if (!painting) {
            loader.innerHTML = `Obra "${currentId}" não encontrada. <a href="index.html" style="color: var(--accent-color);">Voltar para a galeria</a>.`;
            return;
        }

        currentPainting = painting;
        renderPainting(painting, paintingsData);
    }

    function renderPainting(painting, allPaintings) {
        document.title = `Quadro ${painting.ID_Quadro} | ARTEmio - Galeria Digital`;

        const imgSrc = './' + painting.Imagen_Local.replace(/\\/g, '/');
        paintingImage.src = imgSrc;
        paintingImage.alt = `Quadro ${painting.ID_Quadro}`;

        document.getElementById('painting-category-badge').innerText = painting.Categoria || '-';
        document.getElementById('painting-title').innerText = `ID: ${painting.ID_Quadro}`;
        document.getElementById('painting-category-subtitle').innerText = `Categoria: Pinturas ${painting.Categoria || '-'}`;
        document.getElementById('painting-id').innerText = painting.ID_Quadro;
        document.getElementById('painting-size').innerText = painting.Tamanho || 'N/A';
        document.getElementById('painting-material').innerText = painting.Material || 'N/A';

        const priceEl = document.getElementById('painting-price');
        priceEl.innerText = painting.Preço || 'N/A';
        priceEl.style.color = (painting.Preco_Cor && painting.Preco_Cor.trim())
            ? painting.Preco_Cor
            : 'var(--accent-color)';
        if (painting.Preco_Tamanho && painting.Preco_Tamanho.trim()) {
            priceEl.style.setProperty('font-size', painting.Preco_Tamanho, 'important');
        } else {
            priceEl.style.fontSize = '';
        }

        const externalLink = document.getElementById('painting-external-link');
        if (painting.URL) {
            externalLink.href = painting.URL;
            externalLink.style.display = 'inline-block';
        } else {
            externalLink.style.display = 'none';
        }

        // Configurar links de contato (WhatsApp e E-mail) com dados da obra
        const waMsg = `Olá Artemio! Tenho interesse no quadro ID ${painting.ID_Quadro} (${painting.Tamanho || ''} - ${painting.Preço || ''}).`;
        const waUrl = `https://wa.me/5521975370628?text=${encodeURIComponent(waMsg)}`;
        const waBtn = document.getElementById('contact-whatsapp-btn');
        const waText = document.getElementById('contact-whatsapp-text');
        if (waBtn) waBtn.href = waUrl;
        if (waText) waText.href = waUrl;

        const mailSubject = `Interesse no Quadro ${painting.ID_Quadro} - Galeria ARTEmio`;
        const mailBody = `Olá Artemio,\n\nTenho interesse em adquirir o quadro ID ${painting.ID_Quadro} (${painting.Tamanho || ''}, ${painting.Material || ''}, Preço: ${painting.Preço || ''}).\n\nAguardo retorno!`;
        const mailUrl = `mailto:artemiofonseca@gmail.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
        const emailBtn = document.getElementById('contact-email-btn');
        const emailText = document.getElementById('contact-email-text');
        if (emailBtn) emailBtn.href = mailUrl;
        if (emailText) emailText.href = mailUrl;

        const navList = (activeCategory && activeCategory !== 'all')
            ? allPaintings.filter(p => p.Categoria === activeCategory)
            : allPaintings;

        const currentIndex = navList.findIndex(
            p => String(p.ID_Quadro).toLowerCase() === String(painting.ID_Quadro).toLowerCase()
        );

        if (currentIndex > 0) {
            const prevItem = navList[currentIndex - 1];
            prevUrl = buildQuadroUrl(prevItem.ID_Quadro);
            prevBtn.href = prevUrl;
            prevBtn.innerHTML = `&larr; Anterior (${prevItem.ID_Quadro})`;
            prevBtn.classList.remove('disabled');
        } else {
            prevUrl = null;
            prevBtn.href = '#';
            prevBtn.innerHTML = `&larr; Anterior`;
            prevBtn.classList.add('disabled');
        }

        if (currentIndex !== -1 && currentIndex < navList.length - 1) {
            const nextItem = navList[currentIndex + 1];
            nextUrl = buildQuadroUrl(nextItem.ID_Quadro);
            nextBtn.href = nextUrl;
            nextBtn.innerHTML = `Próximo (${nextItem.ID_Quadro}) &rarr;`;
            nextBtn.classList.remove('disabled');
        } else {
            nextUrl = null;
            nextBtn.href = '#';
            nextBtn.innerHTML = `Próximo &rarr;`;
            nextBtn.classList.add('disabled');
        }

        loader.style.display = 'none';
        showcase.style.display = 'grid';
    }

    function openLightbox() {
        if (!currentPainting) return;
        const imgSrc = './' + currentPainting.Imagen_Local.replace(/\\/g, '/');
        lightboxImage.src = imgSrc;
        lightboxImage.classList.remove('zoomed');
        lightboxCaption.innerText = `Quadro ${currentPainting.ID_Quadro} — ${currentPainting.Tamanho || ''} (${currentPainting.Material || ''})`;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxImage.classList.remove('zoomed');
        document.body.style.overflow = 'auto';
    }

    imgWrapper.addEventListener('click', openLightbox);
    openLightboxBtn.addEventListener('click', openLightbox);
    lightboxClose.addEventListener('click', closeLightbox);

    lightboxImage.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxImage.classList.toggle('zoomed');
    });

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
            return;
        }

        if (!lightboxModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft' && prevUrl) {
                window.location.href = prevUrl;
            } else if (e.key === 'ArrowRight' && nextUrl) {
                window.location.href = nextUrl;
            }
        }
    });

    initPaintingPage();
});

