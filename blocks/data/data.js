function createTableFromJson(data, page = 1, rowsPerPage = 10) {
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  // Calculate pagination boundaries
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const pagedData = data.slice(startIndex, endIndex);

  // Create header row
  const headerRow = document.createElement('tr');
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    th.style.border = '1px solid #ddd';
    th.style.padding = '8px';
    th.style.backgroundColor = '#f2f2f2';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create data rows for current page
  pagedData.forEach((item) => {
    const row = document.createElement('tr');
    Object.values(item).forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val;
      td.style.border = '1px solid #ddd';
      td.style.padding = '8px';
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  return table;
}

function createPaginationControls(totalRows, rowsPerPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const container = document.createElement('div');
  container.style.marginTop = '10px';
  container.style.textAlign = 'center';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.style.marginRight = '10px';
  prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);

  return container;
}

async function loadJsonEmbed(block, url) {
  console.log('Attempting to fetch:', url);
  try {
    const response = await fetch(url);
    console.log('HTTP response status:', response.status);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const rawJson = await response.text();
    console.log('Raw response text:', rawJson);

    const parsed = JSON.parse(rawJson);
    console.log('Parsed JSON:', parsed);

    const jsonData = Array.isArray(parsed)
      ? parsed
      : parsed.data || parsed.items || null;

    console.log('Using data array:', jsonData);

    if (!Array.isArray(jsonData)) {
      throw new Error('No valid array found in JSON (parsed, parsed.data, parsed.items)');
    }

    let currentPage = 1;
    const rowsPerPage = 10;

    function render() {
      block.textContent = '';
      const table = createTableFromJson(jsonData, currentPage, rowsPerPage);
      const paginationControls = createPaginationControls(jsonData.length, rowsPerPage, currentPage, (newPage) => {
        currentPage = newPage;
        render();
      });

      block.appendChild(table);
      block.appendChild(paginationControls);
      block.dataset.embedLoaded = 'true';
    }

    render();

  } catch (err) {
    console.error('✅ Data load error:', err);
    block.innerHTML = `<p>Error loading data: ${err.message}</p>`;
  }
}

export default async function decorate(block) {
  const url = '/data.json'; // Hardcoded JSON URL
  block.textContent = '';
  block.dataset.embedLoaded = 'false';

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      loadJsonEmbed(block, url);
    }
  });

  observer.observe(block);
}
