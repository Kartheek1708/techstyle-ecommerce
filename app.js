// Unique Image Generator Helper
function getUniqueImage(category, index) {
  // Category-based Unsplash photo IDs for high quality variety
  const baseImages = {
    Men: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f"
    ],
    Women: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa"
    ],
    Tech: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"
    ]
  };

  const pool = baseImages[category];
  const selectedImage = pool[index % pool.length];
  
  // Appending ?sig=index forces browser to load unique variants
  return `${selectedImage}?w=500&auto=format&fit=crop&sig=${index}`;
}


// Dynamic 100 Products Generator FUnction 
function generate100Products() {
    const categories = [
        { name: "Men", prefix: ['Casual','Classic','Urban','Slim Fit','Vintage'], items: ['Shirt','T-Shirt','Jacket','Sneakers','Trousers','Hoodie'],basePrice: 1500},
        { name: "Women", prefix: ['Elegance', 'Floral','Summer','Boho','Chic'], items: ['Dress','Tote Bag','Skirt','Heels','Handbag','Blouse'], basePrice:1200},
        { name: "Tech", prefix: ['Smart', 'Wireless', 'Pro','Ultra','Gaming'], items: ['Watch','Headphones','Mouse','Keyboard','Speaker'], basePrice:2000}
    ];

   const generatedList = [];

   for (let i = 1; i <= 100; i++) {
    const cat = categories[(i-1) % categories.length];
    const prefix = cat.prefix[(i-1) % cat.prefix.length];
    const item = cat.items[(i - 1) % cat.items.length];

    // Generates unique prices between 1000 and 9500
    const calculatedPrice = cat.basePrice + ((i * 350) % 7500);

    generatedList.push( {
        id: i,
        name: `${prefix} ${item} Vol. ${i}`,
        category: cat.name,
        price: Math.min(calculatedPrice, 10000), // Max price capped for slider match
        image: getUniqueImage(cat.name, i) // Dynamic Unique Image Assignment
    });

   }
   return generatedList;
}

// Assign generated 100 items to products variable
const products = generate100Products();


// State Management
let cart =JSON.parse(localStorage.getItem('techstyle_cart')) || [];

// DOM Elements Selection

const productGrid = document.getElementById('product-grid');
const categoryFilters = document.querySelectorAll('.category-filter');
const priceRange = document.getElementById('price-range');
const priceVal = document.getElementById('price-val');

const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');


// Render Products Function
function renderProducts(itemsToRender) {
    productGrid.innerHTML = '';

    if (itemsToRender.length === 0) {
        productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8"> No products found matching your filters.</p>`;
        return;
    }

    itemsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-lg shadow-sm border p-4 flex flex-col justify-between hover:shadow-md transition";

        card.innerHTML = `
        <div>
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4">
        <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${product.category}</span>
        <h3 class="font-bold text-gray-800 text-lg mt-2">${product.name}</h3>
        </div>

        <div class="mt-4 flex justify-between items-center">
        <span class="text-xl font-extrabold text-gray-900">₹${product.price.toLocaleString()}</span>
        <button onclick="addToCart(${product.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Add
        </button>
        </div>
        `;
        productGrid.appendChild(card);
    });
}


// Filter Products Logic
function filterProducts() {
    const selectedCategories = Array.from(categoryFilters)
    .filter(cd => cd.checked)
    .map(cd => cd.value);
     
    const maxPrice = Number(priceRange.value);
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortValue = sortSelect ? sortSelect.value : 'default';
    if(priceVal) priceVal.textContent = `₹${maxPrice.toLocaleString()}`;

    const filtered = products.filter(product => {
        const matchesCategory = selectedCategories.includes('All') || selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesPrice = product.price <= maxPrice;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesPrice;
    });

    // Sorting Logic 
    if(sortValue === 'low-high') {
        filtered.sort((a,b) => a.price - b-price);

    } else if (sortValue === 'high-low') {
        filtered.sort((a,b) => b.price - a.price);
    }

    renderProducts(filtered);
}


// Cart Logic & Persistence
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity:1});
    }
    updateCartUI();
    toggleCart(true);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if(item) {
        item.quantity += delta;
        if(item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }
    updateCartUI();
}

function updateCartUI() {
    // Save to LocalStorage 
    localStorage.setItem('techstyle_cart', JSON.stringify(cart));

    // Update Badge Count 
    const totalItems = cart.reduce((sum , item) => sum + item.quantity,0);
    cartCount.textContent = totalItems;

    // Render Cart Item 
   cartItemsContainer.innerHTML = '';

   if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="text-center text-gray-500 my-8">Your cart is empty.</p>`;
   } else {
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = "flex items-center justify-between  border-b pb-3";
        cartItem.innerHTML = `
        <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${item.name}"class="w-12 h-12 object-cover rounded">
        <div>
        <h4 class="font-semibold text-sm">${item.name}</h4>
        <p class="text-gray-500 text-xs">₹${item.price.toLocaleString()}</p>
        </div>
        </div>

        <div class="flex items-center gap-2">
        <button onclick="changeQuantity(${item.id}, -1)" class="px-2 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300">-</button>
          <span class="text-sm font-bold">${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)" class="px-2 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300">+</button>
          <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 ml-2 text-sm"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
        cartItemsContainer.appendChild(cartItem);
    })
   }

   // Calculate Total Price
   const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   cartTotal.textContent = `₹${total.toLocaleString()}`;
}




// Toggle Drawer Animation 
function toggleCart(open) {
    if(!cartDrawer) return;
    if(open) {
        cartDrawer.classList.remove('translate-x-full','pointer-events-none');
    } else {
        cartDrawer.classList.add('translate-x-full','pointer-events-none');
    }
}


// Event Listeners 
categoryFilters.forEach(cb => {
    cb.addEventListener('change', (e) => {
    if(e.target.value === 'All' && e.target.checked){
        categoryFilters.forEach(c => { if(c.value !== 'All') c.checked = false;});
    } else {
        const allCb = Array.from(categoryFilters).find(c => c.value === 'All');
        if(allCb) allCb.checked = false;
    }
    filterProducts();
    });
});

priceRange.addEventListener('input', filterProducts);
cartBtn.addEventListener('click', () => toggleCart(true));
closeCartBtn.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));
if (searchInput) searchInput.addEventListener('input', filterProducts);
if (sortSelect) sortSelect.addEventListener('change', filterProducts);

// Initial Render
renderProducts(products);
updateCartUI();
