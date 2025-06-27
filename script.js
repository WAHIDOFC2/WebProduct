document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');

    // Modal elements
    const buyModal = document.getElementById('buy-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const purchaseForm = document.getElementById('purchase-form');
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const paymentButtonsContainer = document.getElementById('payment-buttons-container');
    const paymentButtons = paymentButtonsContainer.querySelectorAll('.payment-btn');
    
    // === State ===
    let allProducts = [];
    let selectedProduct = null;
    let selectedPaymentMethod = null; // State baru untuk menyimpan metode pembayaran
    const JSON_URL = 'https://raw.githubusercontent.com/WAHIDOFC2/data-product/main/product.json';
    const WHATSAPP_NUMBER = '62895393974879';

    // === Functions ===

    /**
     * Merender kartu produk ke dalam grid
     * @param {Array} products - Array produk yang akan ditampilkan
     */
    const renderProducts = (products) => {
        productGrid.innerHTML = ''; // Kosongin grid dulu
        if (products.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
            products.forEach(product => {
                const productCard = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                        <div class="p-6">
                            <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">${product.kategori}</span>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">${product.nama}</h3>
                            <p class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">${product.harga}</p>
                            <button data-id="${product.id}" class="buy-button w-full bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-white text-white dark:text-gray-800 dark:hover:text-black font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                Beli Sekarang
                            </button>
                        </div>
                    </div>
                `;
                productGrid.innerHTML += productCard;
            });
        }
    };

    /**
     * Merender opsi kategori ke dalam dropdown dari data produk
     * @param {Array} products - Array semua produk
     */
    const renderCategories = (products) => {
        const categories = ['Semua Kategori', ...new Set(products.map(p => p.kategori))];
        categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    };

    /**
     * Menerapkan filter berdasarkan pencarian dan kategori
     */
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        let filteredProducts = allProducts;

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => p.nama.toLowerCase().includes(searchTerm));
        }

        if (selectedCategory && selectedCategory !== 'Semua Kategori') {
            filteredProducts = filteredProducts.filter(p => p.kategori === selectedCategory);
        }

        renderProducts(filteredProducts);
    };
    
    /**
     * Mereset state modal ke awal
     */
    const resetModalState = () => {
        purchaseForm.reset();
        paymentButtons.forEach(btn => btn.classList.remove('payment-btn-selected'));
        selectedPaymentMethod = null;
    };


    /**
     * Membuka modal pembelian dan mengisi datanya
     * @param {number} productId - ID produk yang dipilih
     */
    const openBuyModal = (productId) => {
        selectedProduct = allProducts.find(p => p.id == productId);
        if (selectedProduct) {
            resetModalState(); // Reset dulu setiap buka modal
            modalProductName.textContent = selectedProduct.nama;
            modalProductPrice.textContent = selectedProduct.harga;
            buyModal.classList.remove('hidden');
            // Sedikit delay untuk trigger animasi CSS
            setTimeout(() => buyModal.style.opacity = '1', 10); 
        }
    };

    /**
     * Menutup modal pembelian
     */
    const closeBuyModal = () => {
        buyModal.style.opacity = '0';
        // Tunggu animasi selesai baru di-hide
        setTimeout(() => buyModal.classList.add('hidden'), 300); 
    };

    /**
     * Meng-handle submit form pembelian dan redirect ke WhatsApp
     * @param {Event} e - Event form submission
     */
    const handlePurchase = (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customer-name').value;

        if (!customerName.trim()) {
            alert('Nama harus diisi dulu bre!');
            return;
        }
        
        if (!selectedPaymentMethod) {
            alert('Pilih metode pembayaran dulu, bre!');
            return;
        }

        const orderTimeStamp = new Date().toLocaleString('id-ID', { hour12: false });

        const message = `Assalamu'alaikum mas, saya *${customerName}*, mau buy:\n\n*Produk:* ${selectedProduct.nama}\n*Harga:* ${selectedProduct.harga}\n*Pembayaran:* ${selectedPaymentMethod}\n*Waktu:* ${orderTimeStamp}\n\n*Mohon proses ya mas*`;

        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappURL, '_blank');
        
        closeBuyModal();
    };
    
    /**
     * Meng-handle klik pada tombol pembayaran
     * @param {Event} e 
     */
    const handlePaymentSelection = (e) => {
        // Hapus seleksi dari semua tombol dulu
        paymentButtons.forEach(btn => {
            btn.classList.remove('payment-btn-selected');
            // Ganti styling pake tailwind class biasa
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'hover:bg-gray-300');
        });

        const selectedBtn = e.target;
        
        // Tambahkan style 'selected' ke tombol yang diklik
        selectedBtn.classList.add('payment-btn-selected');
        selectedBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'hover:bg-gray-300');
        
        // Simpan metode pembayaran yang dipilih
        selectedPaymentMethod = selectedBtn.dataset.method;
    };

    /**
     * Meng-handle toggle tema dark/light
     */
    const handleThemeToggle = () => {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcons(isDarkMode);
    };

    /**
     * Memperbarui ikon tema berdasarkan state saat ini
     * @param {boolean} isDarkMode 
     */
    const updateThemeIcons = (isDarkMode) => {
        if (isDarkMode) {
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        } else {
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        }
    };

    /**
     * Memuat tema dari localStorage saat halaman pertama kali dibuka
     */
    const loadTheme = () => {
        const theme = localStorage.getItem('theme');
        const isDarkMode = theme === 'dark';
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        updateThemeIcons(isDarkMode);
    };


    // === Main Execution / Fetch Data ===
    const init = async () => {
        try {
            const response = await fetch(JSON_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allProducts = await response.json();
            
            loadingSpinner.classList.add('hidden');
            renderProducts(allProducts);
            renderCategories(allProducts);
        } catch (error) {
            loadingSpinner.classList.add('hidden');
            productGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Gagal ngambil data produk bre. Coba refresh lagi nanti.</p>`;
            console.error("Fetch error:", error);
        }
    };

    // === Event Listeners ===
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    
    // Event delegation untuk tombol "Beli"
    productGrid.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.buy-button');
        if (buyButton) {
            const productId = buyButton.dataset.id;
            openBuyModal(productId);
        }
    });

    closeModalBtn.addEventListener('click', closeBuyModal);
    buyModal.addEventListener('click', (e) => {
        if (e.target === buyModal) { // Close kalo klik di luar modal
            closeBuyModal();
        }
    });

    purchaseForm.addEventListener('submit', handlePurchase);
    themeToggle.addEventListener('click', handleThemeToggle);
    paymentButtons.forEach(button => button.addEventListener('click', handlePaymentSelection));

    // === Initial Load ===
    loadTheme();
    init();
    
    // Beri styling awal untuk tombol pembayaran
    paymentButtons.forEach(btn => {
        btn.className = 'payment-btn text-center w-full border-2 border-gray-300 dark:border-gray-600 rounded-md py-3 px-2 transition-colors duration-200';
    });
});