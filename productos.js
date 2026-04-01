document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('product-search');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');
  const viewButtons = document.querySelectorAll('.view-btn');
  const productsGrid = document.getElementById('products-grid');
  const productCount = document.getElementById('product-count');
  const products = Array.from(document.querySelectorAll('.product-item'));

  // Search functionality
  searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterAndDisplayProducts();
  });

  // Price filter
  priceFilter?.addEventListener('change', () => {
    filterAndDisplayProducts();
  });

  // Sort functionality
  sortFilter?.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    sortProducts(sortValue);
  });

  // View toggle
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (btn.dataset.view === 'list') {
        productsGrid.classList.add('list-view');
        productsGrid.classList.remove('collections');
      } else {
        productsGrid.classList.remove('list-view');
        productsGrid.classList.add('collections');
      }
    });
  });

  // Filter and display products
  function filterAndDisplayProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const priceRange = priceFilter.value;
    let visibleCount = 0;

    products.forEach(product => {
      const name = product.dataset.name.toLowerCase();
      const price = parseFloat(product.dataset.price);
      const description = product.querySelector('p')?.textContent.toLowerCase() || '';

      // Search filter
      const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);

      // Price filter
      let matchesPrice = true;
      if (priceRange === 'low') matchesPrice = price < 400;
      else if (priceRange === 'mid') matchesPrice = price >= 400 && price <= 700;
      else if (priceRange === 'high') matchesPrice = price > 700;

      if (matchesSearch && matchesPrice) {
        product.style.display = '';
        product.style.animation = 'fadeInUp 0.5s ease-out';
        visibleCount++;
      } else {
        product.style.display = 'none';
      }
    });

    productCount.textContent = visibleCount;
  }

  // Sort products
  function sortProducts(sortValue) {
    const sortedProducts = [...products];

    switch(sortValue) {
      case 'price-low':
        sortedProducts.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        break;
      case 'name':
        sortedProducts.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
        break;
      default:
        return;
    }

    sortedProducts.forEach(product => {
      productsGrid.appendChild(product);
      product.style.animation = 'fadeInUp 0.4s ease-out';
    });
  }

  // Add scroll animation on products
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  products.forEach((product, index) => {
    product.style.opacity = '0';
    product.style.animationDelay = `${index * 0.1}s`;
    observer.observe(product);
  });

  // Add hover effect for quick view
  products.forEach(product => {
    const img = product.querySelector('img');
    product.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.1)';
    });
    product.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
    });
  });

  // Initialize
  filterAndDisplayProducts();
});
