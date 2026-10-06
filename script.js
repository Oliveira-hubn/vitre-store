// Banco de dados de produtos da VITRE STORE
const products = [
  {
    id: 1,
    name: "ADIZERO WHITE/GREEN",
    category: "adidas",
    price: 219.90,
    image: "assets/produtos/adizero.png", // <--- Confirme se o caminho e o nome do ficheiro estão corretos
    sizes: ["38", "39", "40", "41", "42"]
  },
  // ... outros produtos
];

let cart = [];
let selectedProduct = null;
let selectedSize = null;

// Executa assim que a página é carregada
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
});

// Renderizar Produtos na grelha do catálogo
function renderProducts(items) {
  const grid = document.getElementById("products-grid");
  
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `<p style="color:#aaa; text-align:center; grid-column: 1/-1;">Nenhum produto encontrado nesta categoria.</p>`;
    return;
  }

  grid.innerHTML = items.map(product => {
    // Verifica se o produto tem vídeo ou imagem
    const mediaContent = product.video 
      ? `<video class="product-img" autoplay loop muted playsinline poster="${product.image}">
           <source src="${product.video}" type="video/mp4">
         </video>`
      : `<img src="${product.image}" alt="${product.name}" class="product-img">`;

    return `
      <div class="product-card" onclick="openProductModal(${product.id})">
        ${mediaContent}
        <div class="product-info">
          <span class="product-category">${product.category.toUpperCase()}</span>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
          <button class="add-cart-btn">VER DETALHES & COMPRAR</button>
        </div>
      </div>
    `;
  }).join("");
}

// Abrir Modal de Detalhes do Produto ao clicar
function openProductModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  selectedSize = null;

  if (!selectedProduct) return;

  document.getElementById("modal-product-brand").innerText = selectedProduct.category.toUpperCase();
  document.getElementById("modal-product-title").innerText = selectedProduct.name;
  document.getElementById("modal-product-price").innerText = `R$ ${selectedProduct.price.toFixed(2).replace('.', ',')}`;

  // Mídia do modal (Imagem ou Vídeo)
  const mediaContainer = document.getElementById("modal-media-container");
  if (selectedProduct.video) {
    mediaContainer.innerHTML = `
      <video class="product-img" autoplay loop muted playsinline poster="${selectedProduct.image}">
        <source src="${selectedProduct.video}" type="video/mp4">
      </video>`;
  } else {
    mediaContainer.innerHTML = `<img src="${selectedProduct.image}" alt="${selectedProduct.name}">`;
  }

  // Renderizar Tamanhos Disponíveis
  const sizesGrid = document.getElementById("sizes-grid");
  if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
    sizesGrid.innerHTML = selectedProduct.sizes.map(size => `
      <button class="size-btn" onclick="selectSize(${size}, this)">${size}</button>
    `).join("");
  } else {
    sizesGrid.innerHTML = `<p style="font-size: 0.85rem; color: #aaa;">Tamanho único</p>`;
  }

  // Limpar campo e resultado do frete
  document.getElementById("cep-input").value = "";
  document.getElementById("freight-result").innerHTML = "";

  document.getElementById("product-modal").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

// Fechar Modal do Produto
function closeProductModal() {
  document.getElementById("product-modal").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// Selecionar Tamanho no Modal
function selectSize(size, element) {
  selectedSize = size;
  document.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");
}

// Calcular Frete Simuladamente
function calculateFreight() {
  const cep = document.getElementById("cep-input").value.replace(/\D/g, '');
  const resultDiv = document.getElementById("freight-result");

  if (cep.length !== 8) {
    resultDiv.innerHTML = `<span style="color:#ff4d4d;">Por favor, digite um CEP válido com 8 dígitos.</span>`;
    return;
  }

  resultDiv.innerHTML = `
    <div class="freight-option">
      <span><i class="fa-solid fa-box"></i> Padrão (5 a 8 dias):</span>
      <strong>R$ 15,90</strong>
    </div>
    <div class="freight-option">
      <span><i class="fa-solid fa-bolt"></i> Expressa (2 a 3 dias):</span>
      <strong>R$ 29,90</strong>
    </div>
  `;
}

// Adicionar Produto do Modal ao Carrinho
function addModalProductToCart() {
  if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
    alert("Por favor, selecione um tamanho antes de adicionar ao carrinho!");
    return;
  }

  const cartItem = {
    ...selectedProduct,
    selectedSize: selectedSize || "U",
    cartId: Date.now()
  };

  cart.push(cartItem);
  updateCart();
  closeProductModal();
  toggleCart(true);
}

// Filtrar por Categoria no Menu Lateral
function selectCategory(category, linkElement) {
  document.querySelectorAll(".catalog-nav a").forEach(a => a.classList.remove("active"));
  if (linkElement) linkElement.classList.add("active");

  const titleMap = {
    'todos': 'CATÁLOGO COMPLETO',
    'nike': 'COLEÇÃO NIKE',
    'adidas': 'COLEÇÃO ADIDAS',
    'newbalance': 'COLEÇÃO NEW BALANCE'
  };
  
  const titleElement = document.getElementById("category-title");
  if (titleElement) {
    titleElement.innerText = titleMap[category] || 'CATÁLOGO';
  }

  if (category === "todos") {
    renderProducts(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    renderProducts(filtered);
  }

  toggleMenu();
}

// Abrir / Fechar Menu Lateral
function toggleMenu() {
  const menu = document.getElementById("menu-drawer");
  const overlay = document.getElementById("overlay");
  menu.classList.toggle("open");
  
  if (!document.getElementById("product-modal").classList.contains("open")) {
    overlay.classList.toggle("show");
  }
}

// Abrir / Fechar Carrinho Lateral
function toggleCart(forceOpen = false) {
  const cartDrawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("overlay");
  
  if (forceOpen) {
    cartDrawer.classList.add("open");
    overlay.classList.add("show");
  } else {
    cartDrawer.classList.toggle("open");
    if (!cartDrawer.classList.contains("open") && !document.getElementById("product-modal").classList.contains("open")) {
      overlay.classList.remove("show");
    } else {
      overlay.classList.add("show");
    }
  }
}

// Fechar todas as janelas sobrepostas
function closeAllDrawers() {
  document.getElementById("menu-drawer").classList.remove("open");
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("product-modal").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// Rolar suavemente até o catálogo
function scrollToVitrine(event) {
  event.preventDefault();
  const vitrineElement = document.getElementById("vitrine");
  if (vitrineElement) {
    vitrineElement.scrollIntoView({ behavior: "smooth" });
  }
}

// Atualizar o Carrinho
function updateCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotalCount = document.getElementById("cart-total-count");
  const cartTotalPrice = document.getElementById("cart-total-price");

  cartCount.innerText = cart.length;
  cartTotalCount.innerText = cart.length;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p style='color: #888; text-align: center;'>Seu carrinho está vazio.</p>";
    cartTotalPrice.innerText = "R$ 0,00";
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div>
        <h4>${item.name}</h4>
        <small style="color:#00F0FF;">Tam: ${item.selectedSize} | R$ ${item.price.toFixed(2).replace('.', ',')}</small>
      </div>
      <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotalPrice.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Remover Item do Carrinho
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Finalizar Compra
function checkout() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  alert("Pedido efetuado com sucesso na VITRE STORE! Obrigado pela compra.");
  cart = [];
  updateCart();
  closeAllDrawers();
}