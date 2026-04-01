document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'aura_cart_v1';
  const cartToggle = document.getElementById('cart-toggle');
  const cartPanel = document.getElementById('cart-panel');
  const cartClose = document.getElementById('cart-close');
  const cartClear = document.getElementById('cart-clear');
  const cartCount = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  function saveCart(){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI(){
    if(!cartCount) return;
    const totalItems = cart.reduce((s,i)=>s+i.qty,0);
    cartCount.textContent = totalItems;
    
    // Animate cart count
    if(totalItems > 0){
      cartCount.style.transform = 'scale(1.3)';
      setTimeout(() => cartCount.style.transform = 'scale(1)', 300);
    }

    cartItemsEl.innerHTML = '';
    if(cart.length === 0){
      cartItemsEl.innerHTML = '<li class="cart-empty"><div class="empty-cart-icon">🛒</div><p>Tu carrito está vacío</p><p class="empty-subtitle">Agrega productos para comenzar</p></li>';
      cartTotalEl.textContent = 'RD$0.00';
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      total += item.qty * item.price;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.style.animation = 'slideInCart 0.3s ease-out';
      li.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image || '../imagenes/logo.png.jpeg'}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">RD$ ${item.price.toFixed(2)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn qty-decrease" data-index="${index}">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn qty-increase" data-index="${index}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-index="${index}" title="Eliminar">✕</button>
      `;
      cartItemsEl.appendChild(li);
    });
    cartTotalEl.textContent = 'RD$ ' + total.toFixed(2);
  }

  function addToCart(name, price, image){
    const existing = cart.find(i => i.name === name);
    if(existing) existing.qty++;
    else cart.push({name, price, image, qty:1});
    saveCart();
    
    // Show notification
    showCartNotification(name);
  }
  
  function showCartNotification(productName){
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = `${productName} agregado al carrito ✓`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  function removeItem(index){
    cart.splice(index,1);
    saveCart();
  }

  function changeQty(index, delta){
    if(!cart[index]) return;
    cart[index].qty += delta;
    if(cart[index].qty <= 0) removeItem(index);
    else saveCart();
  }

  // Cart item controls
  cartItemsEl.addEventListener('click', (e) => {
    const idx = e.target.dataset.index;
    if(e.target.classList.contains('qty-increase')){
      changeQty(Number(idx), +1);
      e.target.style.transform = 'scale(1.2)';
      setTimeout(() => e.target.style.transform = 'scale(1)', 200);
    }
    if(e.target.classList.contains('qty-decrease')){
      changeQty(Number(idx), -1);
      e.target.style.transform = 'scale(1.2)';
      setTimeout(() => e.target.style.transform = 'scale(1)', 200);
    }
    if(e.target.classList.contains('cart-item-remove')){
      const item = e.target.closest('.cart-item');
      item.style.animation = 'slideOutCart 0.3s ease-out';
      setTimeout(() => removeItem(Number(idx)), 300);
    }
  });

  // Add to cart buttons (delegation)
  document.body.addEventListener('click', (e) => {
    if(e.target.matches('.btn-add') || e.target.matches('.btn-add-carousel')){
      const card = e.target.closest('.card') || e.target.closest('.product-slide');
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const image = card.querySelector('img')?.src || '';
      addToCart(name, price, image);
      cartPanel.classList.add('visible');
      cartPanel.setAttribute('aria-hidden', 'false');
    }
  });

  // Toggle and close
  if(cartToggle) cartToggle.addEventListener('click', () => {
    cartPanel.classList.toggle('visible');
    cartPanel.setAttribute('aria-hidden', String(!cartPanel.classList.contains('visible')));
  });
  if(cartClose) cartClose.addEventListener('click', () => {
    cartPanel.classList.remove('visible');
    cartPanel.setAttribute('aria-hidden', 'true');
  });
  if(cartClear) cartClear.addEventListener('click', () => {
    if(cart.length > 0 && confirm('¿Estás seguro de que quieres vaciar el carrito?')){
      cart = [];
      saveCart();
    }
  });

  // Checkout (demo)
  if(checkoutBtn) checkoutBtn.addEventListener('click', () => {
    alert('Gracias por tu compra. (Esto es una demostración)');
    cart = [];
    saveCart();
    cartPanel.classList.remove('visible');
  });

  // Share buttons
  document.body.addEventListener('click', (e) => {
    if(e.target.matches('.btn-share') || e.target.closest('.btn-share')){
      const card = e.target.closest('.card');
      const name = card.dataset.name;
      const url = window.location.href;
      const text = `Mira este producto: ${name} de Gelyex`;
      if(navigator.share){
        navigator.share({title: name, text, url});
      } else {
        navigator.clipboard.writeText(`${text} ${url}`).then(() => alert('Enlace copiado al portapapeles'));
      }
    }
  });

  // Testimonial carousel
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.dot');
  if(testimonials.length > 0 && prevBtn && nextBtn){
    function showTestimonial(index){
      testimonials.forEach((card, i) => {
        card.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    prevBtn.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
    nextBtn.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(currentTestimonial);
    });
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(currentTestimonial);
      });
    });
  }

  // init
  updateCartUI();

  // Add share buttons to product cards
  document.querySelectorAll('.card-actions').forEach(actions => {
    if(!actions.querySelector('.btn-share')){
      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-outline btn-share';
      shareBtn.textContent = 'Compartir';
      actions.appendChild(shareBtn);
    }
  });

  // Product Carousel
  const productCarousel = document.querySelector('.product-carousel');
  if(productCarousel){
    const track = productCarousel.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.product-slide'));
    const prevButton = productCarousel.querySelector('.prev-btn');
    const nextButton = productCarousel.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if(slides.length > 0){
      const slideWidth = slides[0].getBoundingClientRect().width + 24; // including gap
      let currentSlide = 0;
      const slidesPerView = window.innerWidth <= 600 ? 1 : 3;
      const maxSlide = Math.max(0, slides.length - slidesPerView);
      
      // Create dots
      for(let i = 0; i <= maxSlide; i++){
        const dot = document.createElement('div');
        dot.className = 'dot';
        if(i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => moveToSlide(i));
        dotsContainer.appendChild(dot);
      }
      const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
      
      function moveToSlide(targetSlide){
        currentSlide = Math.max(0, Math.min(targetSlide, maxSlide));
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
      }
      
      nextButton.addEventListener('click', () => {
        if(currentSlide < maxSlide){
          moveToSlide(currentSlide + 1);
        }
      });
      
      prevButton.addEventListener('click', () => {
        if(currentSlide > 0){
          moveToSlide(currentSlide - 1);
        }
      });
      
      // Auto-play
      let autoplayInterval = setInterval(() => {
        if(currentSlide >= maxSlide){
          moveToSlide(0);
        } else {
          moveToSlide(currentSlide + 1);
        }
      }, 5000);
      
      // Pause on hover
      productCarousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
      productCarousel.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => {
          if(currentSlide >= maxSlide){
            moveToSlide(0);
          } else {
            moveToSlide(currentSlide + 1);
          }
        }, 5000);
      });
    }
  }
});