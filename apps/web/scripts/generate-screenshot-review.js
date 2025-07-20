const fs = require('fs');
const path = require('path');

/**
 * Generate an HTML page to review all screenshots
 */
function generateScreenshotReview() {
  const screenshotsDir = path.join(__dirname, '../e2e/screenshots');
  const outputPath = path.join(__dirname, '../screenshot-review.html');
  
  // Check if screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    console.log('No screenshots directory found. Run tests first.');
    return;
  }
  
  // Get all screenshots recursively
  const screenshots = [];
  
  function scanDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(prefix, item));
      } else if (item.endsWith('.png')) {
        screenshots.push({
          name: item.replace('.png', ''),
          path: path.join(prefix, item),
          category: prefix || 'root',
        });
      }
    });
  }
  
  scanDirectory(screenshotsDir);
  
  // Group screenshots by category
  const grouped = screenshots.reduce((acc, screenshot) => {
    if (!acc[screenshot.category]) {
      acc[screenshot.category] = [];
    }
    acc[screenshot.category].push(screenshot);
    return acc;
  }, {});
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Screenshot Review - Riichi Mahjong League</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .metadata {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .category {
      margin-bottom: 40px;
    }
    
    .category-title {
      background: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 8px 8px 0 0;
      font-size: 18px;
      font-weight: bold;
    }
    
    .screenshots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      background: white;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .screenshot-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .screenshot-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .screenshot-image {
      width: 100%;
      height: auto;
      display: block;
      cursor: pointer;
    }
    
    .screenshot-title {
      padding: 10px;
      background: #f8f8f8;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      border-top: 1px solid #ddd;
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      padding: 20px;
      cursor: pointer;
    }
    
    .modal-content {
      max-width: 90%;
      max-height: 90%;
      margin: auto;
      display: block;
      cursor: default;
    }
    
    .modal-title {
      color: white;
      text-align: center;
      margin-top: 10px;
      font-size: 16px;
    }
    
    .close {
      position: absolute;
      top: 20px;
      right: 40px;
      color: white;
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .close:hover {
      color: #ccc;
    }
    
    .filters {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .filter-button {
      padding: 8px 16px;
      margin-right: 10px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-button:hover {
      background: #f0f0f0;
    }
    
    .filter-button.active {
      background: #333;
      color: white;
      border-color: #333;
    }
    
    .stats {
      display: flex;
      gap: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Screenshot Review - Riichi Mahjong League</h1>
    
    <div class="metadata">
      <div class="stats">
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div>Total Screenshots: ${screenshots.length}</div>
        <div>Categories: ${Object.keys(grouped).length}</div>
      </div>
    </div>
    
    <div class="filters">
      <button class="filter-button active" onclick="filterScreenshots('all')">All</button>
      <button class="filter-button" onclick="filterScreenshots('phase-0')">Phase 0</button>
      <button class="filter-button" onclick="filterScreenshots('phase-0-5')">Phase 0.5</button>
      <button class="filter-button" onclick="filterScreenshots('visual')">Visual Regression</button>
      <button class="filter-button" onclick="filterScreenshots('desktop')">Desktop</button>
      <button class="filter-button" onclick="filterScreenshots('mobile')">Mobile</button>
      <button class="filter-button" onclick="filterScreenshots('tablet')">Tablet</button>
    </div>
    
    ${Object.entries(grouped).map(([category, items]) => `
      <div class="category" data-category="${category}">
        <div class="category-title">${category.replace(/\//g, ' / ')}</div>
        <div class="screenshots-grid">
          ${items.map(screenshot => `
            <div class="screenshot-card" data-name="${screenshot.name}">
              <img 
                class="screenshot-image" 
                src="e2e/screenshots/${screenshot.path.replace(/\\/g, '/')}"
                alt="${screenshot.name}"
                onclick="openModal(this)"
                loading="lazy"
              />
              <div class="screenshot-title">${screenshot.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div id="modal" class="modal" onclick="closeModal(event)">
    <span class="close">&times;</span>
    <img class="modal-content" id="modal-image">
    <div class="modal-title" id="modal-title"></div>
  </div>
  
  <script>
    function openModal(img) {
      const modal = document.getElementById('modal');
      const modalImg = document.getElementById('modal-image');
      const modalTitle = document.getElementById('modal-title');
      
      modal.style.display = 'block';
      modalImg.src = img.src;
      modalTitle.textContent = img.alt;
    }
    
    function closeModal(event) {
      if (event.target.id === 'modal' || event.target.className === 'close') {
        document.getElementById('modal').style.display = 'none';
      }
    }
    
    function filterScreenshots(filter) {
      const buttons = document.querySelectorAll('.filter-button');
      buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter) || 
            (filter === 'all' && btn.textContent === 'All')) {
          btn.classList.add('active');
        }
      });
      
      const categories = document.querySelectorAll('.category');
      categories.forEach(category => {
        if (filter === 'all') {
          category.style.display = 'block';
        } else {
          const categoryName = category.getAttribute('data-category');
          const cards = category.querySelectorAll('.screenshot-card');
          let hasVisibleCards = false;
          
          cards.forEach(card => {
            const name = card.getAttribute('data-name');
            if (categoryName.includes(filter) || name.includes(filter)) {
              card.style.display = 'block';
              hasVisibleCards = true;
            } else {
              card.style.display = 'none';
            }
          });
          
          category.style.display = hasVisibleCards ? 'block' : 'none';
        }
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('modal').style.display = 'none';
      }
    });
  </script>
</body>
</html>
  `.trim();
  
  // Write the HTML file
  fs.writeFileSync(outputPath, html);
  console.log(`Screenshot review page generated: ${outputPath}`);
  console.log(`Total screenshots: ${screenshots.length}`);
  console.log(`Categories: ${Object.keys(grouped).join(', ')}`);
}

// Run the generator
generateScreenshotReview();