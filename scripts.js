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
  updateTable();
}

// Função para salvar um item editado
function saveEditedItem() {
  const newName = document.querySelector("#edit-item-name-" + editingItemIndex).value.trim();
  const newPrice = parseFloat(document.querySelector("#edit-item-price-" + editingItemIndex).value);
  const newQuantity = parseFloat(document.querySelector("#edit-item-quantity-" + editingItemIndex).value);

  if (newName && !isNaN(newPrice) && !isNaN(newQuantity)) {
    // Verificar se o novo nome já existe (ignorando o caso - maiúsculas ou minúsculas)
    const existingItemIndex = itemsData.findIndex(
      (item, index) => index !== editingItemIndex && item.name.toLowerCase() === newName.toLowerCase()
    );
    if (existingItemIndex !== -1) {
      const existingItem = itemsData[existingItemIndex];
      alert(`O item "${existingItem.name}" já está na lista com o mesmo nome. Altere o nome para salvar.`);
    } else {
      itemsData[editingItemIndex].name = newName;
      itemsData[editingItemIndex].price = newPrice;
      itemsData[editingItemIndex].quantity = newQuantity;
      editingItemIndex = -1;
      editingItemData = {};
      saveItemsToLocalStorage(); // Salvar os itens no localStorage
      updateTable();
    }
  }

  updateTotal(); // Atualizar o campo de total
}

// Função para remover um item
function removeItem() {
  if (editingItemIndex !== -1) {
    const confirmed = confirm(`Deseja remover o item "${itemsData[editingItemIndex].name}" da lista de compras?`);
    if (confirmed) {
      itemsData.splice(editingItemIndex, 1);
      editingItemIndex = -1;
      editingItemData = {};
      saveItemsToLocalStorage(); // Salvar os itens no localStorage
      updateTable();
    }
  }

  updateTotal(); // Atualizar o campo de total
}
// ... Código JavaScript anterior ...

// Função para salvar a tabela como PDF
function saveAsPDF() {
  // Certifique-se de que a biblioteca jsPDF está disponível
  if (typeof jsPDF !== "undefined") {
    const doc = new jsPDF();
    const columns = ["Item", "Preço", "Qtd", "Subtotal"];
    const data = [];
    const total = calculateTotal();

    for (const item of itemsData) {
      const subtotal = item.price * item.quantity;
      data.push([item.name, `R$ ${item.price.toFixed(2)}`, item.quantity, `R$ ${subtotal.toFixed(2)}`]);
    }

    data.unshift(["", "", "Total:", `R$ ${total.toFixed(2)}`]);

    doc.autoTable({
      head: [columns],
      body: data,
      startY: 20,
      theme: "grid",
    });

    doc.save("lista_de_compras.pdf");
  } else {
    alert("A biblioteca jsPDF não foi carregada corretamente. Verifique a importação do script no HTML.");
  }
}

// ... Resto do código JavaScript ...


document.querySelector("#item-form").addEventListener("submit", addItem);
document.querySelector("#toggle-sidebar").addEventListener("click", function() {
  document.querySelector("#sidebar").classList.toggle("show-sidebar");
});

const sortableColumns = document.querySelectorAll("[data-column]");
sortableColumns.forEach(column => {
  column.addEventListener("click", () => {
    const columnName = column.getAttribute("data-column");
    sortItems(columnName);
  });
});

document.querySelector("#save-as-pdf").addEventListener("click", saveAsPDF);

updateTable();
updateTotal();