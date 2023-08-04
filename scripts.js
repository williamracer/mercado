let itemsData = JSON.parse(localStorage.getItem("items")) || [];
let editingItemIndex = -1;
let editingItemData = {};
let currentSortColumn = "name";
let currentSortDirection = "asc";

function saveItemsToLocalStorage() {
  localStorage.setItem("items", JSON.stringify(itemsData));
}

function calculateTotal() {
  let total = 0;
  for (const item of itemsData) {
    total += item.price * item.quantity;
  }
  return total;
}

function updateTotal() {
  const totalElement = document.querySelector("#total");
  const total = calculateTotal();
  totalElement.innerHTML = `<span>Total:</span> R$ ${total.toFixed(2)}`;
}

function updateTable() {
  const tableBody = document.querySelector("#item-list tbody");
  tableBody.innerHTML = "";

  // Ordenar a lista com base na coluna e direção atual
  const sortedItems = itemsData.sort((a, b) => {
    if (currentSortColumn === "name") {
      return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
    } else if (currentSortColumn === "price") {
      return currentSortDirection === "asc" ? a.price - b.price : b.price - a.price;
    } else if (currentSortColumn === "quantity") {
      return currentSortDirection === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
    } else if (currentSortColumn === "subtotal") {
      return currentSortDirection === "asc"
        ? a.price * a.quantity - b.price * b.quantity
        : b.price * b.quantity - a.price * a.quantity;
    }
  });

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const subtotal = item.price * item.quantity;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${editingItemIndex === i ? '<input type="text" id="edit-item-name" value="' + item.name + '">' : item.name}</td>
      <td>${editingItemIndex === i ? '<input type="number" step="0.01" id="edit-item-price" value="' + item.price.toFixed(2) + '">' : 'R$ ' + item.price.toFixed(2)}</td>
      <td>${editingItemIndex === i ? '<input type="number" step="0.01" id="edit-item-quantity" value="' + item.quantity + '">' : item.quantity}</td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td>
        ${
          editingItemIndex === i
            ? '<span class="action-buttons" data-icon="save" onclick="saveEditedItem()">&#10004;</span>'
            : '<span class="action-buttons" data-icon="edit" onclick="editItem(' + i + ')">&#9998;</span>'
        }
        ${editingItemIndex === i ? '<span class="action-buttons" data-icon="delete" onclick="removeItem()">&#10006;</span>' : ''}
      </td>
    `;
    tableBody.appendChild(row);
  }

  if (editingItemIndex !== -1) {
    // Se estiver editando, criar elementos de edição fora da tabela
    const item = sortedItems[editingItemIndex];
    const editContainer = document.createElement("div");
    editContainer.id = "edit-container";
    editContainer.innerHTML = `
      <label for="edit-item-name">Nome do Item:</label>
      <input type="text" id="edit-item-name-${editingItemIndex}" value="${item.name}"><br>
      <label for="edit-item-price">Preço Unitário:</label>
      <input type="number" step="0.01" id="edit-item-price-${editingItemIndex}" value="${item.price.toFixed(2)}"><br>
      <label for="edit-item-quantity">Quantidade:</label>
      <input type="number" step="0.01" id="edit-item-quantity-${editingItemIndex}" value="${item.quantity}"><br>
      <button onclick="saveEditedItem()">Salvar</button>
    `;
    document.getElementById("content").appendChild(editContainer);
  } else {
    // Se não estiver editando, remover elementos de edição caso existam
    const editContainer = document.getElementById("edit-container");
    if (editContainer) {
      editContainer.remove();
    }
  }
}

// Função para cadastrar um novo item
function addItem(event) {
  event.preventDefault();

  const name = document.querySelector("#item-name").value.trim();
  const price = parseFloat(document.querySelector("#item-price").value);
  const quantity = parseFloat(document.querySelector("#item-quantity").value);

  // Verificar se o item já existe (ignorando o caso - maiúsculas ou minúsculas)
  const existingItemIndex = itemsData.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
  if (existingItemIndex !== -1) {
    const existingItem = itemsData[existingItemIndex];
    const confirmReplace = confirm(`O item "${existingItem.name}" já está na lista. Deseja substituí-lo com os novos valores?`);
    if (confirmReplace) {
      existingItem.price = price;
      existingItem.quantity = quantity;
    }
  } else {
    const newItem = { name, price, quantity };
    itemsData.push(newItem);
  }

  saveItemsToLocalStorage(); // Salvar os itens no localStorage
  updateTable();
  document.querySelector("#item-form").reset();

  updateTotal(); // Atualizar o campo de total
}

// Função para editar um item
function editItem(index) {
  const item = itemsData[index];
  editingItemIndex = index;
  editingItemData = { name: item.name, price: item.price, quantity: item.quantity };

  // Preencher os campos de edição no painel de edição
  const editNameInput = document.querySelector("#edit-item-name");
  const editPriceInput = document.querySelector("#edit-item-price");
  const editQuantityInput = document.querySelector("#edit-item-quantity");

  editNameInput.value = editingItemData.name;
  editPriceInput.value = editingItemData.price.toFixed(2);
  editQuantityInput.value = editingItemData.quantity;

  // Exibir o painel de edição
  const editPanel = document.getElementById("edit-panel");
  editPanel.classList.remove("hidden");
}

function closeEditPanel() {
  // Limpar os campos de edição e ocultar o painel de edição
  const editNameInput = document.querySelector("#edit-item-name");
  const editPriceInput = document.querySelector("#edit-item-price");
  const editQuantityInput = document.querySelector("#edit-item-quantity");

  editNameInput.value = "";
  editPriceInput.value = "";
  editQuantityInput.value = "";

  const editPanel = document.getElementById("edit-panel");
  editPanel.classList.add("hidden");
}

function saveEditedItem() {
  const newName = document.querySelector("#edit-item-name").value.trim();
  const newPrice = parseFloat(document.querySelector("#edit-item-price").value);
  const newQuantity = parseFloat(document.querySelector("#edit-item-quantity").value);

  if (newName && !isNaN(newPrice) && !isNaN(newQuantity)) {
    const existingItemIndex = itemsData.findIndex(
      (item, index) => index !== editingItemIndex && item.name.toLowerCase() === newName.toLowerCase()
    );
    if (existingItemIndex !== -1) {
      const existingItem = itemsData[existingItemIndex];
      alert(`O item "${existingItem.name}" já está na lista com o mesmo nome. Altere o nome para salvar.`);
    } else {
      const editedItem = itemsData[editingItemIndex];
      const changes = [];

      if (editedItem.name !== newName) {
        changes.push(`Nome: ${editedItem.name} => ${newName}`);
        editedItem.name = newName;
      }
      if (editedItem.price !== newPrice) {
        changes.push(`Preço Unitário: ${editedItem.price} => ${newPrice.toFixed(2)}`);
        editedItem.price = newPrice;
      }
      if (editedItem.quantity !== newQuantity) {
        changes.push(`Quantidade: ${editedItem.quantity} => ${newQuantity}`);
        editedItem.quantity = newQuantity;
      }

      // Mostrar a mensagem de confirmação com os campos modificados
      if (changes.length > 0) {
        alert(`Campos modificados:\n${changes.join("\n")}`);
      }

      editingItemIndex = -1;
      editingItemData = {};
      saveItemsToLocalStorage();
      updateTable();
      closeEditPanel();
    }
  }

  updateTotal();
}

function deleteItem() {
  if (editingItemIndex !== -1) {
    const confirmed = confirm(`Deseja remover o item "${itemsData[editingItemIndex].name}" da lista de compras?`);
    if (confirmed) {
      itemsData.splice(editingItemIndex, 1);
      editingItemIndex = -1;
      editingItemData = {};
      saveItemsToLocalStorage();
      updateTable();
      closeEditPanel();
    }
  }

  updateTotal();
}

// ... Código JavaScript anterior ...

// Função para salvar a tabela como PDF
function generatePDF() {
  const element = document.getElementById("table-container");
  const totalElement = document.getElementById("total");
  const total = totalElement.textContent;

  const opt = {
    margin: 10,
    filename: 'conteudo.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const pdfContent = `
    <h2>Lista de Compras</h2>
    ${element.innerHTML}
    <div>${total}</div>
  `;

  html2pdf().set(opt).from(pdfContent).save();
}

// ... Resto do código JavaScript ...
// Função para salvar CSV

function generateCSV() {
  const items = itemsData.map(item => [item.name, item.price, item.quantity, (item.price * item.quantity).toFixed(2)]);
  const csvContent = "data:text/csv;charset=utf-8," + items.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "conteudo.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Resto do código

document.querySelector("#item-form").addEventListener("submit", addItem);
document.querySelector("#toggle-sidebar").addEventListener("click", function() {
  document.querySelector("#sidebar").classList.toggle("show-sidebar");
});

// Ordenar itens

function sortItems(columnName) {
  if (currentSortColumn === columnName) {
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    currentSortColumn = columnName;
    currentSortDirection = "asc";
  }

  updateTable();
}

// Resto do código
const sortableColumns = document.querySelectorAll("[data-column]");
sortableColumns.forEach(column => {
  column.addEventListener("click", () => {
    const columnName = column.getAttribute("data-column");
    sortItems(columnName);
  });
});
function loadCSV() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor, selecione um arquivo CSV.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const contents = e.target.result;
    processDataFromCSV(contents);
  };
  reader.readAsText(file);
}

function processDataFromCSV(csvData) {
  const lines = csvData.split("\n");
  const newData = [];

  for (const line of lines) {
    const [name, price, quantity] = line.split(",");
    if (name && !isNaN(price) && !isNaN(quantity)) {
      const newItem = { name, price: parseFloat(price), quantity: parseFloat(quantity) };
      newData.push(newItem);
    }
  }

  // Atualizar a lista de compras com os novos dados
  itemsData = newData;

  // Salvar os novos dados no localStorage
  saveItemsToLocalStorage();

  // Atualizar a tabela e o total com os novos dados
  updateTable();
  updateTotal();
}
