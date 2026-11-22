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

    if (activeCategory === 'D') {
        backBtn.href = 'ofertas.html';
        backBtn.innerHTML = '&larr; Voltar para Ofertas';
    } else if (activeCategory && activeCategory !== 'all') {
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

        // Renderizar miniaturas de closes/detalhes locais quando disponíveis
        const detailsSection = document.getElementById('painting-details-section');
        const detailsGrid = document.getElementById('painting-details-grid');
        if (detailsSection && detailsGrid) {
            detailsGrid.innerHTML = '';
            if (Array.isArray(painting.Detalhes_Locais) && painting.Detalhes_Locais.length > 0) {
                painting.Detalhes_Locais.forEach((detSrc, idx) => {
                    const cleanSrc = './' + detSrc.replace(/\\/g, '/');
                    const card = document.createElement('div');
                    card.className = 'detail-thumb-card';
                    card.title = `Clique para ampliar Detalhe ${idx + 1}`;
                    card.innerHTML = `<img src="${cleanSrc}" alt="Detalhe ${idx + 1} - Quadro ${painting.ID_Quadro}" loading="lazy">`;
                    card.addEventListener('click', () => {
                        lightboxImage.src = cleanSrc;
                        lightboxImage.classList.remove('zoomed');
                        lightboxCaption.innerText = `Quadro ${painting.ID_Quadro} — Close / Detalhe ${idx + 1}`;
                        lightboxModal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    });
                    detailsGrid.appendChild(card);
                });
                detailsSection.style.display = 'block';
            } else {
                detailsSection.style.display = 'none';
            }
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

        // Configurar Compartilhamento nas Redes Sociais (Facebook, Instagram, Copiar Link)
        setupSocialSharing(painting);

        const effectiveCat = (activeCategory && activeCategory !== 'all')
            ? activeCategory
            : (painting.Categoria === 'D' ? 'D' : 'all');

        if (effectiveCat === 'D') {
            backBtn.href = 'ofertas.html';
            backBtn.innerHTML = '&larr; Voltar para Ofertas';
        }

        const navList = (effectiveCat !== 'all')
            ? allPaintings.filter(p => p.Categoria === effectiveCat)
            : allPaintings.filter(p => p.Categoria !== 'D');

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

    function showShareFeedback(msg) {
        const feedbackEl = document.getElementById('share-feedback-msg');
        if (!feedbackEl) return;
        feedbackEl.innerText = msg;
        feedbackEl.style.display = 'block';
        clearTimeout(feedbackEl._hideTimer);
        feedbackEl._hideTimer = setTimeout(() => {
            feedbackEl.style.display = 'none';
        }, 5000);
    }

    function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            resolve();
        });
    }

    function setupSocialSharing(painting) {
        const shareUrl = window.location.protocol.startsWith('http')
            ? new URL(`q/${encodeURIComponent(painting.ID_Quadro)}.html`, window.location.href).href
            : window.location.href;
        const shareTitle = `Quadro ${painting.ID_Quadro} | ARTEmio - Galeria Digital`;
        const shareText = `Confira a obra ID ${painting.ID_Quadro} (${painting.Tamanho || ''} - ${painting.Material || ''} - ${painting.Preço || ''}) na Galeria ARTEmio (@artemio_filho_)!`;

        const ogTitle = document.getElementById('og-title');
        const ogDesc = document.getElementById('og-description');
        const ogImg = document.getElementById('og-image');
        if (ogTitle) ogTitle.setAttribute('content', shareTitle);
        if (ogDesc) ogDesc.setAttribute('content', shareText);
        if (ogImg) ogImg.setAttribute('content', new URL('./' + painting.Imagen_Local.replace(/\\/g, '/'), window.location.href).href);

        const fbBtn = document.getElementById('share-facebook-btn');
        if (fbBtn) {
            const fbSharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
            fbBtn.href = fbSharerUrl;
            fbBtn.onclick = (e) => {
                e.preventDefault();
                copyTextToClipboard(`${shareText}\n${shareUrl}`).catch(() => {});
                window.open(fbSharerUrl, 'facebook-share-dialog', 'width=626,height=436');
                showShareFeedback('Abrindo o Facebook... (A legenda e o link também foram copiados caso queira colar no post!)');
            };
        }

        const igBtn = document.getElementById('share-instagram-btn');
        if (igBtn) {
            igBtn.onclick = async () => {
                const fullCaption = `${shareText}\n${shareUrl}`;
                await copyTextToClipboard(fullCaption).catch(() => {});

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: shareTitle,
                            text: shareText,
                            url: shareUrl
                        });
                        return;
                    } catch (err) {
                        if (err && err.name === 'AbortError') return;
                    }
                }

                showShareFeedback('Link e legenda copiados! Cole na sua publicação, Story ou Direct do Instagram (@artemio_filho_).');
                window.open('https://www.instagram.com/artemio_filho_/', '_blank', 'noopener,noreferrer');
            };
        }

        const copyBtn = document.getElementById('share-copy-link-btn');
        if (copyBtn) {
            copyBtn.onclick = async () => {
                await copyTextToClipboard(shareUrl).catch(() => {});
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '&#10004; Link Copiado!';
                showShareFeedback(`Link copiado: ${shareUrl}`);
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2500);
            };
        }
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

