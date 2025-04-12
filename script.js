    // DOM elementlərini əldə edirik
    const addImageBtn = document.getElementById('add-image-btn');
    const addModalOverlay = document.getElementById('add-modal-overlay');
    const addModalClose = document.getElementById('add-modal-close');
    const confirmModalOverlay = document.getElementById('confirm-modal-overlay');
    const confirmModalClose = document.getElementById('confirm-modal-close');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const saveImageBtn = document.getElementById('save-image-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const galleryContainer = document.getElementById('gallery-container');
    const detailModalOverlay = document.getElementById('detail-modal-overlay');
    const detailModalClose = document.getElementById('detail-modal-close');
    const detailContent = document.getElementById('detail-content');

    // Şəkil yükləmə və önizləmə
    const imageUpload = document.getElementById('image-upload');
    const previewImage = document.getElementById('preview-image');
    const imagePreview = document.getElementById('image-preview');

    // Şəkil məlumatlarını saxlamaq üçün array
    let imagesData = [];

    // Emoji reaksiyaları
    const emojis = [
        { symbol: '❤️', name: 'heart' },
        { symbol: '👍', name: 'thumbsUp' },
        { symbol: '😍', name: 'love' },
        { symbol: '😮', name: 'wow' },
        { symbol: '😂', name: 'laugh' }
    ];

    // Local Storage-dən məlumatları yükləyirik (əgər varsa)
    function loadImages() {
        const savedImages = localStorage.getItem('galleryImages');
        if (savedImages) {
            imagesData = JSON.parse(savedImages);
            renderGallery(imagesData);
        }
    }

    // Tarix fərqini hesablayır və formatı müəyyən edir
    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        
        // Millisaniyə fərqini günlərə çeviririk
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return "Yeni əlavə edildi";
        } else if (diffDays === 1) {
            return "Dün əlavə edildi";
        } else {
            return `${diffDays} gün əvvəl əlavə edildi`;
        }
    }

    // Qalereyada şəkilləri göstərmək
    function renderGallery(images) {
        galleryContainer.innerHTML = '';
        
        if (images.length === 0) {
            galleryContainer.innerHTML = '<p style="text-align: center; width: 100%; padding: 50px; color: #7f8c8d;">Heç bir şəkil tapılmadı.</p>';
            return;
        }

        images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = image.id;
            
            // Emoji reaksiyalarını hesablayırıq
            let emojiCountsHtml = '';
            if (image.reactions) {
                const activeReactions = emojis.filter(emoji => 
                    image.reactions[emoji.name] && image.reactions[emoji.name] > 0
                );
                
                if (activeReactions.length > 0) {
                    emojiCountsHtml = '<div class="gallery-emoji-counts">';
                    activeReactions.forEach(emoji => {
                        emojiCountsHtml += `
                            <div class="gallery-emoji-count">
                                <span>${emoji.symbol}</span>
                                <span>${image.reactions[emoji.name]}</span>
                            </div>
                        `;
                    });
                    emojiCountsHtml += '</div>';
                }
            }
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}" class="gallery-image">
                <div class="gallery-info">
                    <div class="time-badge">${getTimeAgo(image.date)}</div>
                    <h3 class="gallery-title">${image.name}</h3>
                    <p class="gallery-date">${formatDate(image.date)}</p>
                    <p class="gallery-description">${truncateText(image.description, 50)}</p>
                    ${emojiCountsHtml}
                </div>
            `;
            
            galleryItem.addEventListener('click', () => showImageDetails(image.id));
            galleryContainer.appendChild(galleryItem);
        });
    }

    // Mətni qısaldır və "..." əlavə edir
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Tarixi formatlamaq üçün
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('az-AZ', options);
    }

    // Şəkil detallarını göstərmək
    function showImageDetails(imageId) {
        const image = imagesData.find(img => img.id === imageId);
        if (!image) return;
        
        // Emoji reaksiyalarını yaradırıq
        let reactionsHtml = `
            <div class="emoji-reactions">
                <div class="emoji-title">Reaksiyalar:</div>
                <div class="emoji-container">
        `;
        
        emojis.forEach(emoji => {
            const count = image.reactions && image.reactions[emoji.name] ? image.reactions[emoji.name] : 0;
            const isActive = count > 0 ? 'active' : '';
            reactionsHtml += `
                <button class="emoji-btn ${isActive}" data-emoji="${emoji.name}" title="${emoji.name}">
                    ${emoji.symbol}
                </button>
            `;
        });
        
        reactionsHtml += `
                </div>
            </div>
            <div class="emoji-counts">
        `;
        
        // Emoji saylarını göstəririk
        emojis.forEach(emoji => {
            const count = image.reactions && image.reactions[emoji.name] ? image.reactions[emoji.name] : 0;
            if (count > 0) {
                reactionsHtml += `
                    <div class="emoji-count">
                        <span>${emoji.symbol}</span>
                        <span class="emoji-count-number">${count}</span>
                    </div>
                `;
            }
        });
        
        reactionsHtml += `</div>`;
        
        // Modal məzmununu yaradırıq
        detailContent.innerHTML = `
            <img src="${image.url}" alt="${image.name}" class="detail-image">
            <h2 class="detail-title">${image.name}</h2>
            <p class="detail-date">${formatDate(image.date)} (${getTimeAgo(image.date)})</p>
            <p class="detail-description">${image.description}</p>
            ${reactionsHtml}
        `;
        
        // Emoji düymələrinə kliklənmə əlavə edirik
        const emojiButtons = detailContent.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(button => {
            button.addEventListener('click', function() {
                const emojiName = this.dataset.emoji;
                addEmojiReaction(imageId, emojiName);
                this.classList.toggle('active');
                showImageDetails(imageId); // Modalı yeniləyirik
            });
        });
        
        // Modalı göstəririk
        detailModalOverlay.style.display = 'flex';
    }

    // Emoji reaksiyası əlavə etmək
    function addEmojiReaction(imageId, emojiName) {
        const imageIndex = imagesData.findIndex(img => img.id === imageId);
        if (imageIndex === -1) return;
        
        // Əgər reactions obyekti yoxdursa yaradırıq
        if (!imagesData[imageIndex].reactions) {
            imagesData[imageIndex].reactions = {};
        }
        
        // Emoji sayğacını artırırıq
        if (!imagesData[imageIndex].reactions[emojiName]) {
            imagesData[imageIndex].reactions[emojiName] = 1;
        } else {
            imagesData[imageIndex].reactions[emojiName] += 1;
        }
        
        // Local Storage-də yeniləyirik
        localStorage.setItem('galleryImages', JSON.stringify(imagesData));
        
        // Qalereyanı yeniləyirik
        renderGallery(imagesData);
    }

    // Şəkil önizləməsi
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                imagePreview.querySelector('p').style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // Şəkil əlavə etmə modalını açmaq
    addImageBtn.addEventListener('click', function() {
        addModalOverlay.style.display = 'flex';
    });

    // Şəkil əlavə etmə modalını bağlamaq
    addModalClose.addEventListener('click', function() {
        addModalOverlay.style.display = 'none';
        resetForm();
    });

    // Konfirmasiya modalını bağlamaq
    confirmModalClose.addEventListener('click', function() {
        confirmModalOverlay.style.display = 'none';
    });

    confirmOkBtn.addEventListener('click', function() {
        confirmModalOverlay.style.display = 'none';
    });

    // Şəkil detalları modalını bağlamaq
    detailModalClose.addEventListener('click', function() {
        detailModalOverlay.style.display = 'none';
    });

    // Formu sıfırlamaq
    function resetForm() {
        document.getElementById('image-name').value = '';
        document.getElementById('image-description').value = '';
        document.getElementById('image-date').value = '';
        document.getElementById('image-upload').value = '';
        previewImage.src = '';
        previewImage.style.display = 'none';
        imagePreview.querySelector('p').style.display = 'block';
    }

    // Şəkil məlumatlarını saxlama
    saveImageBtn.addEventListener('click', function() {
        const imageName = document.getElementById('image-name').value;
        const imageDescription = document.getElementById('image-description').value;
        const imageDate = document.getElementById('image-date').value;
        const imageFile = document.getElementById('image-upload').files[0];

        if (!imageName || !imageDate || !imageFile) {
            alert('Zəhmət olmasa bütün tələb olunan sahələri doldurun!');
            return;
        }

        // Şəkil məlumatlarını əlavə edirik
        const reader = new FileReader();
        reader.onload = function(event) {
            const newImage = {
                id: Date.now(),
                name: imageName,
                description: imageDescription,
                date: imageDate,
                url: event.target.result,
                reactions: {} // Boş reaksiyalar obyekti
            };

            imagesData.push(newImage);
            
            // Local Storage-də saxlayırıq
            localStorage.setItem('galleryImages', JSON.stringify(imagesData));
            
            // Qalereyanı yeniləyirik
            renderGallery(imagesData);
            
            // Formu sıfırlayırıq
            resetForm();
            
            // Modalı bağlayırıq
            addModalOverlay.style.display = 'none';
            
            // Konfirmasiya modalını göstəririk
            confirmModalOverlay.style.display = 'flex';
        };
        reader.readAsDataURL(imageFile);
    });

    // Axtarış funksiyası
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            renderGallery(imagesData);
            return;
        }
        
        const filteredImages = imagesData.filter(image => 
            image.name.toLowerCase().includes(searchTerm)
        );
        
        renderGallery(filteredImages);
    }

    // Modal xaricində klikləndikdə modalları bağlamaq
    window.addEventListener('click', function(e) {
        if (e.target === addModalOverlay) {
            addModalOverlay.style.display = 'none';
            resetForm();
        }
        if (e.target === confirmModalOverlay) {
            confirmModalOverlay.style.display = 'none';
        }
        if (e.target === detailModalOverlay) {
            detailModalOverlay.style.display = 'none';
        }
    });

    // Səhifə yükləndikdə məlumatları yükləyirik
    window.addEventListener('load', loadImages);